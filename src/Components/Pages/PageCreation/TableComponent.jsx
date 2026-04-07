import {
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { useIntl } from 'react-intl'
import { useMemo, useCallback, memo, useState, useRef, useEffect } from 'react'
import ViewValueInTable from './ViewValueInTable'
import GetTimeinTable from 'src/Components/GetTimeinTable'
import ViewInputInTable from '../ViewInputinTable'
import IconifyIcon from 'src/Components/icon'
import { IoMdSettings } from 'react-icons/io'
import InputControlDesign from './InputControlDesign'
import { DefaultStyle, getTypeFromCollection } from 'src/Components/_Shared'
import AssociationsSetup from 'src/Components/Popup/AssociationsSetup'
import { useRouter } from 'next/router'

// Constants
const BORDER_COLOR = 'rgba(224, 224, 224, 1)'

const DEFAULT_TABLE_STYLE = {
  headerBackgroundColor: '#f5f5f5',
  headerTextColor: '#333333',
  tableBorderColor: 'rgba(224, 224, 224, 1)'
}

const ACTIONS_COLUMN_WIDTH = { maxWidth: '150px', width: '150px' }
const ROWS_PER_PAGE_OPTIONS = [5, 10, 15]
const FILE_NAME_MAX_LENGTH = 30
const UPLOADS_PATH = '/Uploads/'

/**
 * Renders a cell value for non-form-table views
 */
const CellValueRenderer = memo(({ parentKey, column, locale }) => {
  const cellValue = column?.[parentKey?.key]
  const hasValue = cellValue && Object.keys(cellValue).length !== 0

  // Handle Associations field category
  if (parentKey?.fieldCategory === 'Associations') {
    return <ViewValueInTable data={parentKey} value={cellValue ?? ''} />
  }

  // Handle Date type
  if (parentKey?.type === 'Date') {
    return hasValue ? <GetTimeinTable data={cellValue} /> : '-'
  }

  // Handle empty or null values
  if (!cellValue || !hasValue) {
    const displayValue = typeof cellValue === 'string' || typeof cellValue === 'number' ? cellValue : '-'

    return <>{displayValue}</>
  }

  // Handle file uploads
  if (typeof cellValue === 'string' && cellValue.includes(UPLOADS_PATH)) {
    const fileName = cellValue.replace(UPLOADS_PATH, '')
    const fileExtension = fileName.split('.').pop()
    const displayName = fileName.slice(0, FILE_NAME_MAX_LENGTH) + '.' + fileExtension
    const downloadUrl = `${process.env.API_URL}/file/download/${fileName}`

    return (
      <a href={downloadUrl} target='_blank' rel='noreferrer' aria-label={`Download ${displayName}`}>
        {displayName}
      </a>
    )
  }

  // Default: display the value as-is
  return <>{cellValue}</>
})

CellValueRenderer.displayName = 'CellValueRenderer'

/**
 * Renders action buttons for table rows
 */
const ActionButtons = memo(
  ({ isFormTable, column, editAction, deleteAction, detailsAction, messages, onEdit, onDelete, onFormTableDelete, onDetails, borderColor }) => {
    const bc = borderColor ?? BORDER_COLOR
    if (isFormTable && deleteAction) {
      return (
        <TableCell className='flex justify-center items-center' sx={{ borderBlockEnd: `1px solid ${bc}` }}>
          <Tooltip title={messages.delete}>
            <IconButton size='small' onClick={onFormTableDelete} aria-label={messages.delete}>
              <IconifyIcon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        </TableCell>
      )
    }

    if (!editAction && !deleteAction && !detailsAction) {
      return null
    }

    return (
      <TableCell sx={{ ...ACTIONS_COLUMN_WIDTH, borderBottom: `1px solid ${bc}` }} className='flex justify-center items-center'>
        {editAction && (
          <Tooltip title={messages.edit}>
            <IconButton size='small' onClick={() => {
              onEdit(column)
            }} aria-label={messages.edit}>
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
        )}
        {deleteAction && (
          <Tooltip title={messages.delete}>
            <IconButton size='small' onClick={onDelete} aria-label={messages.delete}>
              <IconifyIcon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        )}
        {detailsAction && (
          <Tooltip title={messages.details}>
            <IconButton size='small' onClick={() => {
              onDetails(column)
            }} aria-label={messages.details}>
              <IconifyIcon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    )
  }
)

ActionButtons.displayName = 'ActionButtons'

/**
 * Renders table header cells
 */
const TableHeader = memo(({ filterWithSelect, locale, showActionsColumn, messages, setOpen, readOnly, data, tableStyle }) => {
  const ts = tableStyle ?? DEFAULT_TABLE_STYLE
  const borderColor = ts.tableBorderColor ?? BORDER_COLOR
  const isFormTable = data.kind === 'form-table'


  return (
    <TableRow
      sx={{
        backgroundColor: ts.headerBackgroundColor,
        color: ts.headerTextColor,
        '&:not(:last-child) td, &:not(:last-child) th': {
          borderBottom: `1px solid ${borderColor}`
        }
      }}
    >
      {isFormTable && !readOnly && (
        <TableCell sx={{ borderInlineEnd: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>
          {locale !== 'ar' ? 'Control' : 'التحكم'}
        </TableCell>
      )}
      {filterWithSelect.map(column => {
        let roles = data?.additional_fields?.find(el => el?.key === column?.id)?.roles

        console.log(filterWithSelect);



        return (
          <TableCell
            className='uppercase'
            key={column?.id}
            sx={{
              backgroundColor: ts.headerBackgroundColor,
              color: ts.headerTextColor,
              borderInlineEnd: `1px solid ${borderColor}`,
              '&:last-child': { borderInlineEnd: 0 }
            }}
          >
            <span dir='auto'>
              {locale === 'ar' ? roles?.label?.label_ar ?? column?.nameAr : roles?.label?.label_en ?? column?.nameEn}

            </span>
            {!readOnly && (
              <div className='no-print absolute inset-0 z-20 flex || justify-end border-main-color border-dashed border rounded-md'>
                <button
                  type='button'
                  title={locale !== 'ar' ? 'Setting' : 'التحكم'}
                  onMouseDown={e => {
                    e.stopPropagation()
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    const newColumn = { ...column }
                    if (newColumn.fieldCategory === 'ManyToMany' || newColumn.fieldCategory === 'OneToMany' || newColumn.fieldCategory === 'OneToOne') {
                      newColumn.fieldCategory = 'Associations'
                    }

                    setOpen(newColumn)
                  }}
                  className='w-[30px] || h-[30px] hover:bg-main-color hover:text-white duration-200 || rounded-lg || shadow-2xl text-xl flex || items-center justify-center bg-white border-main-color border'
                >
                  <IoMdSettings />
                </button>
              </div>
            )}
          </TableCell>
        )
      })}
      {showActionsColumn && (
        <TableCell className='uppercase' sx={{ ...ACTIONS_COLUMN_WIDTH, backgroundColor: ts.headerBackgroundColor, color: ts.headerTextColor, borderInlineEnd: `1px solid ${borderColor}` }}>
          {messages.actions}
        </TableCell>
      )}
    </TableRow>
  )
})

TableHeader.displayName = 'TableHeader'

/**
 * Renders a single table row
 */
const TableRowComponent = memo(
  ({
    refErrorFromTable,
    setTotalCount,
    allData,
    column,
    filterWithSelect,
    data,
    readOnly,
    disabled,
    setGetFields,
    onChange,
    setTriggerData,
    getDesign,
    triggerData,
    errorAllRef,
    setChangedValue,
    editAction,
    deleteAction,
    detailsAction,
    messages,
    onEdit,
    onDelete,
    onDetails,
    reloadHight,
    formTable,
    setOpen,
    columnId,
    allErrorsRef,
    reloadErrors,
    tableBorderColor,
    handleRowSettingOpen
  }) => {
    const isFormTable = data.kind === 'form-table'

    const handleFormTableDelete = useCallback(() => {
      if (reloadHight) {
        reloadHight(prev => prev + 1)
      }
      setGetFields(prev => prev.filter(ele => ele.Id !== column.Id))

      onChange({
        ...data,
        newRows: data.newRows ? data.newRows.filter(ele => ele.Id !== column.Id) : []
      })
      setTotalCount(prev => prev - 1)
    }, [column.Id, setGetFields, reloadHight, onChange, data, setTotalCount])



    const findData = {...allData, ...data.newRows?.find(ele => ele.Id === column.Id)}

    const dataRef = useRef(findData ?? {})

    











    const borderColor = tableBorderColor ?? data?.tableStyle?.tableBorderColor ?? BORDER_COLOR
    const { locale } = useIntl()



    return (
      <TableRow key={column?.Id} className='relative'>
        {isFormTable && !readOnly && (
          <TableCell key={column.Id + 'delete'} sx={{ borderInlineEnd: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>
            <button
              type='button'
              className='w-[30px] || h-[30px] hover:bg-main-color hover:text-white duration-200 || rounded-lg || shadow-2xl text-xl flex || items-center justify-center bg-white border-main-color border'
              title={locale !== 'ar' ? 'Setting' : 'التحكم'}
              onClick={() => {
                handleRowSettingOpen(column.Id)

              }}
            >
              <IoMdSettings />
            </button>
          </TableCell>
        )}
        {filterWithSelect.map((parentKey, index) => (
          parentKey?.id &&
          <TableCell key={parentKey?.id + column.Id + index} sx={{ borderInlineEnd: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>

            <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }} dir='auto'>
              {isFormTable ? (
                <ViewInputInTable
                  refErrorFromTable={refErrorFromTable}
                  ele={parentKey}
                  columnId={columnId}
                  row={column}
                  readOnly={readOnly}
                  disabled={disabled}
                  data={data}
                  dataRef={dataRef}
                  allData={allData}
                  currentData={dataRef}
                  setGetFields={setGetFields}
                  onChange={onChange}
                  setTriggerData={setTriggerData}
                  getDesign={getDesign}
                  triggerData={triggerData}
                  errorAllRef={errorAllRef}
                  notFound={Object.keys(column?.[parentKey?.key] || {}).length !== 0}
                  setChangedValue={setChangedValue}
                  formTable={formTable}
                  setOpen={setOpen}
                  allErrorsRef={allErrorsRef}
                  reloadErrors={reloadErrors}
                />
              ) : (
                <CellValueRenderer parentKey={parentKey} column={column} />
              )}
            </Typography>
          </TableCell>
        ))}
        <ActionButtons
          isFormTable={isFormTable}
          column={column}
          editAction={editAction}
          deleteAction={deleteAction}
          detailsAction={detailsAction}
          messages={messages}
          onEdit={onEdit}
          onDelete={onDelete}
          onFormTableDelete={handleFormTableDelete}
          onDetails={onDetails}
          borderColor={borderColor}
        />
      </TableRow>
    )
  }
)
TableRowComponent.displayName = 'TableRowComponent'

function TableComponent({
  refErrorFromTable,
  setTotalCount,
  filterWithSelect = [],
  columns = [],
  paginationModel,
  setPaginationModel,
  totalCount = 0,
  associationsData = [],
  loadingAssociations = false,
  detailsAction = false,
  loadingEntity = false,
  loadingHeader = false,
  readOnly = false,
  disabled = false,
  onChange,
  setTriggerData,
  getDesign,
  triggerData,
  errorAllRef,
  data = {},
  setGetFields,
  editAction = false,
  deleteAction = false,
  setEditOpen,
  setDeleteOpen,
  setChangedValue,
  sortedLoop,
  allData,
  reloadHight,
  type,
  formTable,
  allErrorsRef,
  reloadErrors,
  tableStyle: tableStyleFromParent,
  handleRowSettingOpen
}) {
  const { locale, messages } = useIntl()
  const [open, setOpen] = useState(false)
  const [associationsOpen, setAssociationsOpen] = useState(false)
  const [associationsConfig, setAssociationsConfig] = useState(data?.associationsConfig ?? [])
  const router = useRouter()

  // استخدام الـ style القادم من الأب فقط مع قيمة افتراضية آمنة
  const tableStyle = tableStyleFromParent ?? DEFAULT_TABLE_STYLE

  const handleChange = (event, fieldCategory, skipCheck, field) => {
    // const
    const { value, checked } = event.target
    const isChecked = skipCheck || checked


    const oldAdditionalFields = data?.additional_fields ?? []
    const filteredAdditionalFields = oldAdditionalFields.filter(inp => inp.key !== field?.id)

    // Tabs assignment logic removed from here; use the inline dropdowns instead
    const addMoreElementLocal = [...(data?.addMoreElement ?? [])]

    //     additional_fields: filteredAdditionalFields,
    //     addMoreElement: addMoreElementLocal);

    if (skipCheck) {
      onChange({
        ...data,
        associationsConfig: skipCheck,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    } else {
      onChange({
        ...data,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    }
  }

  const defaultDesign =
    open?.type === 'new_element'
      ? DefaultStyle(open?.key)
      : open?.kind
        ? DefaultStyle(getTypeFromCollection(open?.type ?? 'SingleText', open?.kind))
        : open?.options?.uiSchema?.xComponentProps?.cssClass ??
        DefaultStyle(getTypeFromCollection(open?.type ?? 'SingleText'))
  let additionalField = null
  const additionalFieldDesign = data?.additional_fields?.find(ele => ele.key === open?.id)?.design
  if (additionalFieldDesign) {
    if (additionalFieldDesign.length === 0) {
      additionalField = null
    } else {
      additionalField = additionalFieldDesign
    }
  }
  const design = additionalField ?? defaultDesign ?? ``

  const roles = data?.additional_fields?.find(ele => ele.key === open?.id)?.roles ?? {
    onMount: { type: '', value: '' },
    trigger: {
      selectedField: null,
      triggerKey: null,
      typeOfValidation: null,
      isEqual: 'equal',
      currentField: 'id'
    },
    placeholder: {
      placeholder_ar: '',
      placeholder_en: ''
    },
    hover: {
      hover_ar: '',
      hover_en: ''
    },
    hint: {
      hint_ar: '',
      hint_en: ''
    },
    event: {},
    afterDateType: '',
    afterDateValue: '',
    beforeDateType: '',
    beforeDateValue: '',
    regex: {
      regex: '',
      message_ar: '',
      message_en: ''
    },
    size: '',
    api_url: '',
    apiKeyData: ''
  }

  const showActionsColumn = useMemo(
    () => (data.kind === 'form-table' && deleteAction) || editAction || deleteAction,
    [data.kind, editAction, deleteAction]
  )

  const colSpan = useMemo(
    () => filterWithSelect.length + (showActionsColumn ? 1 : 0),
    [filterWithSelect.length, showActionsColumn]
  )

  // Memoize callbacks
  const handlePageChange = useCallback(
    (event, value) => {
      setPaginationModel(prev => ({ ...prev, page: value }))
    },
    [setPaginationModel]
  )

  const handleRowsPerPageChange = useCallback(
    event => {
      setPaginationModel(prev => ({ ...prev, pageSize: Number(event.target.value) }))
    },
    [setPaginationModel]
  )

  const handleEdit = useCallback(
    column => {
      setEditOpen?.(column)
    },
    [setEditOpen]
  )

  const handleDelete = useCallback(
    column => {
      setDeleteOpen?.(column)
      setTotalCount(prev => prev - 1)

    },
    [setDeleteOpen, setTotalCount]
  )


  const filteredColumns = useMemo(() => {
    const cleanedCurrent = allData?.current
      ? Object.fromEntries(
        Object.entries(allData.current).map(([key, value]) => {
          const newKey = key.includes('.') ? key.split('.').pop() : key

          return [newKey, value]
        })
      )
      : {}

    const filteredColumns = data.triggerRowTable ?? []

    if (filteredColumns.length === 0) {
      return columns
    }

    const newColumns = columns.filter(column => {
      const findData = filteredColumns.find(ele => ele.key === column.Id)

      if (findData) {
        const getValue = cleanedCurrent?.[findData?.triggerRowTable?.selectedField]
        if (getValue === findData?.triggerRowTable?.mainValue) {
          return column
        } else {
          return null
        }
      }

      return column
    })

    return newColumns
  }, [columns, data.triggerRowTable, triggerData, allData])

  if (loadingHeader) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <div className='flex justify-center items-center p-4' role='status' aria-label='Loading table headers'>
          <CircularProgress />
        </div>
      </Paper>
    )
  }




  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <InputControlDesign
        open={open}
        handleClose={() => setOpen(false)}
        design={design}
        setAssociationsOpen={setAssociationsOpen}
        locale={locale}
        roles={roles}
        data={data}
        type={type}
        onChange={onChange}
        fields={
          sortedLoop
            ? [
              ...sortedLoop.map(ele => {
                return {
                  ...ele,
                  key: `${ele.collectionId}.${ele.key}`
                }
              }),
              ...filterWithSelect
            ]
            : filterWithSelect
        }
      />
      <TableContainer>
        <Table
          stickyHeader
          sx={{
            border: `1px solid ${tableStyle.tableBorderColor}`,
            '& .MuiTableCell-root': {
              borderColor: tableStyle.tableBorderColor
            },
            '& .MuiTableRow-root .MuiTableCell-root': {
              borderBottom: `1px solid ${tableStyle.tableBorderColor}`,
              borderInlineEnd: `1px solid ${tableStyle.tableBorderColor}`
            },
            '& .MuiTableRow-root .MuiTableCell-root:last-child': {
              borderInlineEnd: 'none'
            }
          }}
          aria-label={data.kind === 'form-table' ? 'Form table' : 'Data table'}
        >
          <TableHead sx={{ backgroundColor: tableStyle.headerBackgroundColor }}>
            <TableHeader
              setOpen={setOpen}
              filterWithSelect={filterWithSelect}
              locale={locale}
              showActionsColumn={showActionsColumn}
              messages={messages}
              readOnly={readOnly}
              data={data}
              tableStyle={tableStyle}
            />
          </TableHead>
          <TableBody>
            {loadingEntity ? (
              <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tableStyle.tableBorderColor}` } }}>
                <TableCell colSpan={colSpan} className='flex justify-center items-center' sx={{ borderBottom: `1px solid ${tableStyle.tableBorderColor}` }}>
                  <div
                    className='flex justify-center items-center p-4 rounded-md'
                    role='status'
                    aria-label='Loading table data'
                  >
                    <CircularProgress />
                  </div>
                </TableCell>
              </TableRow>
            ) : columns.length === 0 ? (
              <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${tableStyle.tableBorderColor}` } }}>
                <TableCell colSpan={colSpan} className='text-center p-4' sx={{ borderBottom: `1px solid ${tableStyle.tableBorderColor}` }}>
                  <Typography variant='body2' color='text.secondary'>
                    {messages.notFound || 'No data available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredColumns.map(column => (
                <TableRowComponent
                  associationsData={associationsData}
                  loadingAssociations={loadingAssociations}
                  refErrorFromTable={refErrorFromTable}
                  setTotalCount={setTotalCount}
                  key={column.id || column.Id}
                  columnId={column.id || column.Id}
                  allData={allData}
                  handleRowSettingOpen={handleRowSettingOpen}
                  formTable={formTable}
                  column={column}
                  filterWithSelect={filterWithSelect}
                  data={data}
                  readOnly={readOnly}
                  disabled={disabled}
                  setGetFields={setGetFields}
                  onChange={onChange}
                  setTriggerData={setTriggerData}
                  getDesign={getDesign}
                  triggerData={triggerData}
                  errorAllRef={errorAllRef}
                  setChangedValue={setChangedValue}
                  editAction={editAction}
                  deleteAction={deleteAction}
                  detailsAction={detailsAction}
                  messages={messages}
                  onEdit={(column) => {
                    // rou
                    router.push(`/${locale}/${data.editPageNameRedirect ?? ''}?entitiesId=${column.Id}`)

                  }}

                  onDetails={(column) => {
                    router.push(`/${locale}/${data.detailsPageNameRedirect ?? ''}?entitiesId=${column.Id}`)
                  }}
                  onDelete={() => {

                    handleDelete(column)
                  }}
                  reloadHight={reloadHight}
                  type={type}
                  setOpen={setOpen}
                  allErrorsRef={allErrorsRef}
                  reloadErrors={reloadErrors}
                  tableBorderColor={tableStyle.tableBorderColor}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        count={Math.ceil(totalCount)}
        page={paginationModel.page}
        onPageChange={handlePageChange}
        rowsPerPage={paginationModel.pageSize}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        labelRowsPerPage={messages.rowsPerPage || 'Rows per page:'}
        labelDisplayedRows={({ from, to, count }) =>
          `${from} ${messages.of || 'of'} ${count !== -1 ? count : `${messages.moreThan || 'more than'} ${to}`}`
        }
      />

      <AssociationsSetup
        open={associationsOpen}
        onClose={() => {
          setAssociationsOpen(false)
        }}
        initialConfig={associationsConfig}
        onSave={config => {

          let newConfig = data?.associationsConfig ?? []

          const found = newConfig.find(item => item.key === config.key)
          if (found) {
            newConfig = newConfig.map(item => (item.key === config.key ? config : item))
          } else {
            newConfig = [...newConfig, config]
          }


          handleChange({ target: { value: config.key } }, '', newConfig)
        }}
        type={type}
      />
    </Paper>
  )
}

export default TableComponent
