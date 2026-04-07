/* eslint-disable react-hooks/exhaustive-deps */

import { Button, Dialog, DialogContent, Typography, TextField, Box, Grid } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useReactToPrint } from 'react-to-print'
import { axiosDelete, axiosGet, axiosPost } from 'src/Components/axiosCall'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import { useIntl } from 'react-intl'
import { LoadingButton } from '@mui/lab'
import { removeerrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import TableComponent from './TableComponent'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import { toast } from 'react-toastify'

const ARABIC_FONT_FILE = 'NotoNaskhArabic-Regular.ttf'
const ARABIC_FONT_FAMILY = 'NotoNaskhArabic'

/** Arabic script in Unicode (includes Persian digits etc.) */
const ARABIC_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

function pdfNeedsArabicFont(headers, rows, localeIsArabic) {
  if (localeIsArabic) return true
  if (headers.some(h => ARABIC_SCRIPT_RE.test(String(h)))) return true

  return rows.some(row => row.some(cell => ARABIC_SCRIPT_RE.test(String(cell))))
}

/** Text used for mixed Arabic/English alignment in PDF (Noto Naskh covers both scripts) */
function pdfCellTextForAlign(cell) {
  if (cell == null) return ''
  if (cell.raw != null) return String(cell.raw)
  if (Array.isArray(cell.text)) return cell.text.join('')

  return String(cell.text ?? '')
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode.apply(null, chunk)
  }

  return btoa(binary)
}

function getFontFetchUrl() {
  if (typeof window === 'undefined') return `/fonts/${ARABIC_FONT_FILE}`

  return new URL(`/fonts/${ARABIC_FONT_FILE}`, window.location.origin).href
}

/** Replace `{param}` with values from the page URL query (Next.js `router.query`). */
export function resolveTableApiQueryFilter(template, query) {
  if (!template || typeof template !== 'string') {
    return ''
  }

  const result = template.replace(/\{([^{}]+)\}/g, (_, rawKey) => {
    const key = rawKey.trim()
    if (!key) {
      return ''
    }
    const v = query?.[key]
    if (v == null) {
      return ''
    }

    return Array.isArray(v) ? String(v[0]) : String(v)
  })

  return result

}

/** `key=value&key2=value2` → `[{ column, operator: 'Equals', value }, ...]` */
function parseQueryFilterStringToFilters(resolved) {
  const trimmed = String(resolved).trim().replace(/^\?/, '')
  if (!trimmed) {
    return []
  }


  const params = new URLSearchParams(trimmed)
  const filters = []



  params.forEach((value, column) => {
    if (column && value !== '') {
      filters.push({ column, operator: 'Equals', value })
    }
  })

  return filters
}

function normalizeCellForFilter(v) {
  if (v == null) return ''
  if (typeof v === 'object' && v !== null && 'value' in v) {
    return normalizeCellForFilter(v.value)
  }

  return String(v).trim()
}

/** Client-side row filter matching API-style `{ column, operator, value }` (e.g. from query string). */
function applyQueryFiltersToRows(rows, filters) {
  if (!filters?.length) {
    return rows
  }


  return rows.filter(row =>
    filters.every(({ column, operator, value }) => {
      const op = String(operator || 'Equals').toLowerCase()
      const cell = normalizeCellForFilter(row[column])
      const wanted = normalizeCellForFilter(value)
      if (op === 'equals' || op === 'equal') {
        return cell === wanted
      }

      return true
    })
  )
}

async function registerArabicPdfFont(doc) {
  const res = await fetch(getFontFetchUrl())
  if (!res.ok) throw new Error('Failed to load Arabic font')
  const buf = await res.arrayBuffer()
  const base64 = arrayBufferToBase64(buf)
  doc.addFileToVFS(ARABIC_FONT_FILE, base64)
  doc.addFont(ARABIC_FONT_FILE, ARABIC_FONT_FAMILY, 'normal')
  doc.setFont(ARABIC_FONT_FAMILY, 'normal')
}

const TABLE_PRINT_PAGE_STYLE = `
  @media print {
    @page { margin: 12mm; size: auto; }
    .table-report-print-area {
      font-family: 'Noto Naskh Arabic', 'Public Sans', 'cairo', sans-serif !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .table-report-print-area .MuiPaper-root,
    .table-report-print-area .MuiTableCell-root,
    .table-report-print-area .MuiTypography-root {
      font-family: inherit !important;
    }
    .table-report-print-area .MuiTableCell-root {
      unicode-bidi: plaintext;
    }
    .table-report-print-area .no-print {
      display: none !important;
    }
    .table-report-print-area .MuiTablePagination-root {
      display: none !important;
    }
  }
`

function TableReport({ data, locale, onChange, readOnly, disabled }) {
  const router = useRouter()
  const [getFields, setGetFields] = useState([])
  const [changedValue, setChangedValue] = useState([])
  const [loading, setLoading] = useState(true)
  const [collectionFields, setCollectionFields] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { messages } = useIntl()
  const errorAllRef = useRef([])

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const [totalCount, setTotalCount] = useState(0)

  const [loadingHeader, setLoadingHeader] = useState(true)
  const [filterWithSelect, setFilterWithSelect] = useState([])
  const [filterValues, setFilterValues] = useState({})
  const [isFiltered, setIsFiltered] = useState(false)

  const printTableRef = useRef(null)

  const printFonts = useMemo(() => {
    if (typeof window === 'undefined') return undefined

    return [
      {
        family: 'Noto Naskh Arabic',
        source: new URL(`/fonts/${ARABIC_FONT_FILE}`, window.location.origin).href
      }
    ]
  }, [])

  const handlePrintTable = useReactToPrint({
    contentRef: printTableRef,
    documentTitle: `${data.collectionName || 'Table'}_report`,
    pageStyle: TABLE_PRINT_PAGE_STYLE,
    fonts: printFonts,
    onBeforePrint: async () => {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready
      }
    }
  })

  // Fetch data without filters
  useEffect(() => {
    if (data.is_api_generated && !isFiltered) {
      if (!router.isReady) return

      setLoadingHeader(true)
      setLoading(true)


      console.log(data.userReportName, "data.userReportNamedata.userReportName");

      const requestBody = {
        apiName: data.userReportName,
        pageSize: 10,
        pageNumber: paginationModel.page + 1
      }
      const resolvedQueryFilter = resolveTableApiQueryFilter(data.tableApiQueryFilter, router.query)
      const filtersFromQuery = parseQueryFilterStringToFilters(resolvedQueryFilter)

      console.log(filtersFromQuery, "filtersFromQueryfiltersFromQuery");
      if (filtersFromQuery.length > 0) {
        requestBody.apiName = data.userReportName
        requestBody.filters = filtersFromQuery
      }





      Promise.all([
        axiosPost(`dynamic-report-data/get-filtered-data`, locale, requestBody),
        axiosPost(`dynamic-report-data/get-API-columns/${data.userReportName}`, locale)
      ])
        .then(([res, res2]) => {
          if (res.status) {
            const mappedRows =
              res?.data?.map(ele => ({
                ...ele,
                id: ele.RegionsId
              })) ?? []

            

            setGetFields(mappedRows)
            setTotalCount(res.data.totalCount)
          }
          if (res2.status) {
            const keys = res2.data.map(ele => {
              return {
                key: ele,
                id: ele,
                nameAr: ele,
                nameEn: ele
              }
            })
            setCollectionFields(keys)
          }
        })
        .finally(() => {
          setLoadingHeader(false)
          setLoading(false)
        })
    } else if (!data.is_api_generated) {
      setLoadingHeader(false)
      setLoading(false)
    }
  }, [
    locale,
    data.is_api_generated,
    data.userReportName,
    data.tableApiQueryFilter,
    data.reload,
    paginationModel,
    isFiltered,
    router.isReady,
    router.asPath
  ])

  /** PDF from visible table (browser renders Arabic + English correctly); autoTable is fallback only */
  const exportToPDF = async () => {
    const tableName = data.collectionName || 'Table'
    const isArabic = locale === 'ar'
    const el = printTableRef.current

    if (el && getFields.length > 0) {
      try {
        if (typeof document !== 'undefined' && document.fonts?.ready) {
          await document.fonts.ready
        }
        await new Promise(r => setTimeout(r, 150))

        const mod = await import('html2pdf.js')
        const html2pdf = mod.default || mod

        await html2pdf()
          .set({
            margin: [8, 8, 8, 8],
            filename: `${tableName}_export.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
              backgroundColor: '#ffffff',
              onclone: documentClone => {
                const root = documentClone.querySelector('.table-report-print-area')
                if (root) {
                  root.style.fontFamily = "'Noto Naskh Arabic', 'Public Sans', sans-serif"
                  root.style.overflow = 'visible'
                }
                documentClone.querySelectorAll('.MuiPaper-root').forEach(node => {
                  node.style.overflow = 'visible'
                })
                documentClone.querySelectorAll('.MuiTableContainer-root').forEach(node => {
                  node.style.overflow = 'visible'
                })
              }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          })
          .from(el)
          .save()

        return
      } catch (e) {
        console.error('html2pdf export failed', e)
      }
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    const headers = filterWithSelect.map(field => (isArabic ? field.nameAr : field.nameEn))

    const rows = getFields.map(row => {
      return filterWithSelect.map(field => {
        const value = row[field.key]
        if (value === null || value === undefined) return ''
        if (Array.isArray(value)) return value.join(', ')
        if (typeof value === 'object') return JSON.stringify(value)

        return String(value)
      })
    })

    let arabicFontReady = false
    if (pdfNeedsArabicFont(headers, rows, isArabic)) {
      try {
        await registerArabicPdfFont(doc)
        arabicFontReady = true
      } catch (e) {
        console.error(e)
        toast.error(
          isArabic ? 'تعذّر تحميل خط العربية لتصدير PDF' : 'Could not load Arabic font for PDF export'
        )
      }
    }

    const tableFont = arabicFontReady ? ARABIC_FONT_FAMILY : 'helvetica'

    try {
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 20,
        styles: {
          font: tableFont,
          fontSize: 8,
          halign: 'left',
          overflow: 'linebreak'
        },
        headStyles: { font: tableFont, fillColor: [66, 139, 202], halign: 'left' },
        didParseCell: data => {
          const text = pdfCellTextForAlign(data.cell)
          data.cell.styles.halign = ARABIC_SCRIPT_RE.test(text) ? 'right' : 'left'
        }
      })
      doc.save(`${tableName}_export.pdf`)
    } catch (e) {
      console.error(e)
      toast.error(isArabic ? 'فشل تصدير PDF' : 'PDF export failed')
    }
  }

  // Export to XLSX function
  const exportToXLSX = () => {
    const tableName = data.collectionName || 'Table'

    // Prepare headers
    const headers = filterWithSelect.map(field => (locale === 'ar' ? field.nameAr : field.nameEn))

    // Prepare data rows
    const rows = getFields.map(row => {
      return filterWithSelect.map(field => {
        const value = row[field.key]
        if (value === null || value === undefined) return ''
        if (Array.isArray(value)) return value.join(', ')
        if (typeof value === 'object') return JSON.stringify(value)

        return value
      })
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Save file
    saveAs(blob, `${tableName}_export.xlsx`)
  }

  const getDesign = ''
  const [triggerData, setTriggerData] = useState(0)

  useEffect(() => {
    if (collectionFields.length === 0) return
    let filteredFields = collectionFields
    if (filteredFields.length !== data.sortWithId?.length) {
      onChange({ ...data, sortWithId: filteredFields.map(ele => ele.id) })
    } else {
      filteredFields = data.sortWithId.map(ele => filteredFields.find(e => e?.id === ele))
    }
    const visibility = data.tableApiColumnVisibility || {}
    const ordered = filteredFields?.filter(Boolean) ?? []

    const visibleOnly = data.is_api_generated
      ? ordered.filter(f => visibility[f.id] !== false)
      : ordered

    setFilterWithSelect(visibleOnly)
  }, [
    collectionFields.length,
    data?.selected?.length,
    data.sortWithId,
    data.is_api_generated,
    data.tableApiColumnVisibility
  ])

  const SortableButton = SortableElement(({ value }) => (
    <div className='flex gap-2 items-center p-2 text-white rounded-md cursor-pointer select-none text-nowrap bg-main-color'>
      {locale === 'ar' ? value.nameAr.toUpperCase() : value.nameEn.toUpperCase()}
    </div>
  ))

  const SortableList = SortableContainer(({ items }) => {
    return (
      <div className='flex flex-wrap gap-3 p-5'>
        {items.map((value, index) => (
          <SortableButton key={value} index={index} value={value} />
        ))}
      </div>
    )
  })

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newSelectedOptions = arrayMove(filterWithSelect, oldIndex, newIndex)
    setFilterWithSelect(newSelectedOptions?.filter(Boolean))

    onChange({
      ...data,
      sortWithId: newSelectedOptions.map(ele => ele.id)
    })
  }

  const handleClose = () => {
    setDeleteOpen(false)
  }
  const [loadingButton, setLoadingButton] = useState(false)

  const dispatch = useDispatch()

  const handleFilterChange = (fieldKey, value) => {
    setFilterValues(prev => ({
      ...prev,
      [fieldKey]: value
    }))
  }

  const getFilterData = filtersArray => {
    setLoading(true)
    axiosPost(`dynamic-report-data/get-filtered-data`, locale, {
      apiName: data.userReportName,
      filters: filtersArray
    })
      .then(res => {
        if (res.status) {
          setGetFields(res.data)
          setTotalCount(res.data.length)
        }
      })
      .finally(() => setLoading(false))
  }

  const handleApplyFilter = () => {
    const visibleColumnKeys = new Set(filterWithSelect.filter(Boolean).map(f => f.key))

    // Filter out empty values; only columns currently visible (matches filter inputs)

    const filtersArray = Object.keys(filterValues)
      .filter(
        key =>
          visibleColumnKeys.has(key) &&
          filterValues[key] !== '' &&
          filterValues[key] !== null &&
          filterValues[key] !== undefined
      )
      .map(key => ({
        column: key,
        operator: 'Equals',
        value: filterValues[key]
      }))


    if (filtersArray.length > 0) {
      setIsFiltered(true)
      setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
      getFilterData(filtersArray)
    } else {
      toast.warning(locale === 'ar' ? 'يرجى إدخال قيمة للفلترة' : 'Please enter a filter value')
    }
  }

  const handleResetFilter = () => {
    setFilterValues({})
    setIsFiltered(false)
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
  }

  return (
    <div>
      <Dialog
        open={Boolean(deleteOpen)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          handleClose()
        }}
      >
        <DialogContent>
          <div className='flex flex-col gap-5 justify-center items-center px-1 py-5'>
            <Typography variant='body1' className='!text-lg' id='alert-dialog-description'>
              {messages.areYouSure}
            </Typography>
            <div className='flex gap-5 justify-between items-end'>
              <LoadingButton
                variant='contained'
                loading={loadingButton}
                onClick={() => {
                  setLoadingButton(true)
                  axiosDelete(`generic-entities/${data.collectionName}?Id=${deleteOpen.Id}`, locale)
                    .then(res => {
                      if (res.status) {
                        setGetFields(getFields.filter(ele => ele.Id !== deleteOpen.Id))
                        setTotalCount(totalCount - 1)
                      }
                    })
                    .finally(_ => {
                      handleClose()
                      setLoadingButton(false)
                    })
                }}
              >
                {messages.delete}
              </LoadingButton>
              <Button color='secondary' variant='contained' disabled={loading} onClick={handleClose}>
                {messages.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <>
        {!readOnly && <SortableList items={filterWithSelect?.filter(Boolean)} onSortEnd={onSortEnd} axis='xy' />}

        {/* Filter Section — same columns as visible table (hides inputs when column is hidden in report settings) */}
        {(data.is_api_generated ? filterWithSelect.length > 0 : collectionFields.length > 0) && (
          <Box className='p-5 mb-3 border rounded-lg bg-gray-50'>
            <Typography variant='h6' className='mb-3'>
              {locale === 'ar' ? 'فلترة البيانات' : 'Filter Data'}
            </Typography>
            <Grid container spacing={2} className='mb-3'>
              {filterWithSelect.filter(Boolean).map(field => (
                <Grid item xs={12} sm={6} md={4} key={field.key}>
                  <TextField
                    fullWidth
                    label={locale === 'ar' ? field.nameAr : field.nameEn}
                    value={filterValues[field.key] || ''}
                    onChange={e => handleFilterChange(field.key, e.target.value)}
                    variant='outlined'
                    size='small'
                    disabled={loading}
                  />
                </Grid>
              ))}
            </Grid>
            <div className='flex gap-3 justify-end'>
              <Button
                variant='contained'
                color='success'
                onClick={handleApplyFilter}
                disabled={loading || filterWithSelect.filter(Boolean).length === 0}
              >
                {locale === 'ar' ? 'فلترة' : 'Filter'}
              </Button>
              {isFiltered && (
                <Button variant='contained' color='error' onClick={handleResetFilter} disabled={loading}>
                  {locale === 'ar' ? 'إزالة الفلترة' : 'Reset Filter'}
                </Button>
              )}
            </div>
          </Box>
        )}

        <div className='flex justify-end gap-3 px-5 mb-3 flex-wrap'>
          <Button
            variant='outlined'
            color='primary'
            onClick={handlePrintTable}
            disabled={loading || getFields.length === 0}
          >
            {locale === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>

          <Button
            variant='contained'
            color='success'
            onClick={exportToXLSX}
            disabled={loading || getFields.length === 0}
          >
            {locale === 'ar' ? 'تصدير Excel' : 'Export XLSX'}
          </Button>
          {data.kind === 'form-table' && paginationModel.page === 0 && (
            <Button
              variant='contained'
              color='success'
              onClick={() => {
                const newData = { Id: 'front' + new Date().getTime() }
                filterWithSelect.forEach(ele => {
                  newData[ele.key] =
                    ele.fieldCategory === 'Associations'
                      ? []
                      : ele.type === 'Date'
                        ? new Date()
                        : ele.type === 'DateTime'
                          ? new Date()
                          : ''
                })
                setGetFields([newData, ...getFields])
              }}
            >
              {messages.add}
            </Button>
          )}
        </div>
        <div
          id=''
          onClick={() => {
            dispatch(removeerrorInAllRowData())
          }}
        >
          <div
            ref={printTableRef}
            className='table-report-print-area'
            style={{ fontFamily: "'Noto Naskh Arabic', 'Public Sans', sans-serif" }}
          >
            <TableComponent
              filterWithSelect={filterWithSelect?.filter(Boolean)}
              columns={getFields.slice(
                paginationModel.page * paginationModel.pageSize,
                (paginationModel.page + 1) * paginationModel.pageSize
              )}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              totalCount={totalCount / Number(paginationModel.pageSize)}
              loadingEntity={loading}
              loadingHeader={loadingHeader}
              data={data}
              readOnly={readOnly}
              disabled={disabled}
              onChange={onChange}
              setTriggerData={setTriggerData}
              getDesign={getDesign}
              triggerData={triggerData}
              errorAllRef={errorAllRef}
              setGetFields={setGetFields}
              editAction={data.edit}
              deleteAction={data.delete}
              setDeleteOpen={setDeleteOpen}
              setChangedValue={setChangedValue}
            />
          </div>
          <div className='flex justify-end px-5 mt-3'>
            {data.kind === 'form-table' && paginationModel.page === 0 && (
              <Button
                variant='contained'
                color='success'
                onClick={() => {
                  axiosPost(
                    `generic-entities/${data.collectionName}`,
                    locale,
                    changedValue.map(ele => {
                      return {
                        ...ele,
                        Id: ele.Id.includes('front') ? undefined : ele.Id
                      }
                    })
                  ).then(res => {
                    if (res.status) {
                      toast.success(messages.savedSuccessfully)
                    }
                  })
                }}
              >
                {messages.save}
              </Button>
            )}
          </div>
        </div>
      </>
    </div>
  )
}

export default TableReport
