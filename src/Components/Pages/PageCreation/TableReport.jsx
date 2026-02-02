/* eslint-disable react-hooks/exhaustive-deps */

import { Button, Dialog, DialogContent, Typography, TextField, Box, Grid } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
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

function TableReport({ data, locale, onChange, readOnly, disabled }) {
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

  // Fetch data without filters
  useEffect(() => {
    if (data.is_api_generated && !isFiltered) {
      setLoadingHeader(true)
      setLoading(true)

      const requestBody = {
        reportAPIName: data.userReportName,
        pageSize: paginationModel.pageSize,
        pageNumber: paginationModel.page + 1
      }

      Promise.all([
        axiosPost(`dynamic-report-data/get-collections-data-by-API-name`, locale, requestBody),
        axiosPost(`dynamic-report-data/get-API-columns/${data.userReportName}`, locale)
      ])
        .then(([res, res2]) => {
          if (res.status) {
            setGetFields(
              res?.data?.result?.map(ele => {
                return {
                  ...ele,
                  id: ele.RegionsId
                }
              })
            )
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
  }, [locale, data.is_api_generated, data.userReportName, data.reload, paginationModel, isFiltered])

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF()
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

        return String(value)
      })
    })

    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    // Save PDF
    doc.save(`${tableName}_export.pdf`)
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
    setFilterWithSelect(filteredFields)
  }, [collectionFields.length, data?.selected?.length, data.sortWithId])

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
    setFilterWithSelect(newSelectedOptions)

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
    // Filter out empty values and convert to required format
    const filtersArray = Object.keys(filterValues)
      .filter(key => filterValues[key] !== '' && filterValues[key] !== null && filterValues[key] !== undefined)
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
        {!readOnly && <SortableList items={filterWithSelect} onSortEnd={onSortEnd} axis='xy' />}

        {/* Filter Section */}
        {collectionFields.length > 0 && (
          <Box className='p-5 mb-3 border rounded-lg bg-gray-50'>
            <Typography variant='h6' className='mb-3'>
              {locale === 'ar' ? 'فلترة البيانات' : 'Filter Data'}
            </Typography>
            <Grid container spacing={2} className='mb-3'>
              {collectionFields.map(field => (
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
                disabled={loading || collectionFields.length === 0}
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

        <div className='flex justify-end gap-3 px-5 mb-3'>
          <Button variant='contained' color='error' onClick={exportToPDF} disabled={loading || getFields.length === 0}>
            Export PDF
          </Button>
          <Button
            variant='contained'
            color='success'
            onClick={exportToXLSX}
            disabled={loading || getFields.length === 0}
          >
            Export XLSX
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
          <TableComponent
            filterWithSelect={filterWithSelect}
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
