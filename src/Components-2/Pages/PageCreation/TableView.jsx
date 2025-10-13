/* eslint-disable react-hooks/exhaustive-deps */

import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Tooltip, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { axiosDelete, axiosGet, axiosPatch } from 'src/Components/axiosCall'
import PagnationTable from 'src/Components/TableEdit/PagnationTable'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import ViewValueInTable from './ViewValueInTable'
import IconifyIcon from 'src/Components/icon'
import { useIntl } from 'react-intl'
import { LoadingButton } from '@mui/lab'
import OpenEditDialog from './OpenEditDialog'
import GetTimeinTable from 'src/Components/GetTimeinTable'
import { DefaultStyle } from 'src/Components/_Shared'
import InputControlDesign from './InputControlDesign'
import ViewInputInTable from '../ViewInputinTable'
import { removeerrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

function TableView({ data, locale, onChange, readOnly, disabled, pageId }) {
  const [getFields, setGetFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState([])
  const [collectionFields, setCollectionFields] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const { messages } = useIntl()
  const errorAllRef = useRef([])
  const btnRef = useRef()
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const handleClosePop = () => {
    setOpen(false)
  }

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    if (data.collectionId) {
      axiosGet(
        `generic-entities/${data.collectionName}?pageNumber=${paginationModel.page + 1}&pageSize=${paginationModel.pageSize
        }&isLookup=true`,
        locale
      )
        .then(res => {
          if (res.status) {
            setGetFields(res.entities)
            setTotalCount(res.totalCount)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setGetFields([])
      setLoading(true)
    }
  }, [locale, data.collectionId, paginationModel])

  useEffect(() => {
    if (data.collectionId) {
      axiosGet(`collection-fields/get?CollectionId=${data.collectionId}`, locale).then(res => {
        if (res.status) {
          setCollectionFields(res.data)
        }
      })
    } else {
      setCollectionFields([])
    }
  }, [locale, data.collectionId])

  const [filterWithSelect, setFilterWithSelect] = useState([])

  const getDesign = useCallback(
    (key, field) => {
      const defaultDesign =
        field?.type === 'new_element' ? DefaultStyle(field?.key) : field?.options?.uiSchema?.xComponentProps?.cssClass

      let additionalField = null
      const additionalFieldDesign = data?.additional_fields?.find(ele => ele.key === key)?.design
      if (additionalFieldDesign) {
        if (additionalFieldDesign.length === 0) {
          additionalField = null
        } else {
          additionalField = additionalFieldDesign
        }
      }

      const design = additionalField ?? defaultDesign ?? ``

      return design
    },
    [data?.additional_fields]
  )
  const [triggerData, setTriggerData] = useState(0)

  useEffect(() => {
    if (collectionFields.length === 0) return
    let filteredFields = collectionFields.filter(ele => data.selected.includes(ele.key))
    if (filteredFields.length !== data.sortWithId?.length) {
      onChange({ ...data, sortWithId: filteredFields.map(ele => ele.id) })
    } else {
      filteredFields = data.sortWithId.map(ele => filteredFields.find(e => e?.id === ele))
    }
    setFilterWithSelect(filteredFields)

    setColumns([
      {
        flex: 0.05,
        minWidth: 60,
        field: 'index',
        disableColumnMenu: true,
        headerName: '#',
        renderCell: ({ row }) => (
          <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {`${row.index + 1}`}
          </Typography>
        )
      },
      ...filteredFields.map(ele => {
        const mainTable = {
          flex: 1,
          minWidth: 200,
          disableColumnMenu: true,
          field: ele.key,
          headerName: locale === 'ar' ? ele.nameAr.toUpperCase() : ele.nameEn.toUpperCase(),
          renderCell: ({ row }) =>
            data.kind === 'form-table' ? (
              <ViewInputInTable
                ele={ele}
                row={row}
                readOnly={readOnly}
                disabled={disabled}
                data={data}
                onChange={onChange}
                setTriggerData={setTriggerData}
                getDesign={getDesign}
                triggerData={triggerData}
                errorAllRef={errorAllRef}
                notFound={Object.keys(row?.[ele?.key]).length !== 0}
              />
            ) : (
              <>
                <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  {ele?.fieldCategory === 'Associations' ? (
                    <ViewValueInTable data={ele} value={row?.[ele?.key] ?? ''} />
                  ) : ele?.type === 'Date' ? (
                    <>{Object.keys(row?.[ele?.key]).length !== 0 ? <GetTimeinTable data={row[ele.key]} /> : '-'}</>
                  ) : (
                    <>
                      {Object.keys(row?.[ele?.key]).length !== 0 ? (
                        row?.[ele?.key].includes('/Uploads/') ? (
                          <a
                            href={process.env.API_URL + '/file/download/' + row?.[ele?.key].replaceAll('/Uploads/', '')}
                            target='_blank'
                            rel='noreferrer'
                          >
                            {row?.[ele?.key].split('/Uploads/')[1].slice(0, 30) +
                              '.' +
                              row?.[ele?.key].split('/Uploads/')[1].split('.').pop()}
                          </a>
                        ) : (
                          row?.[ele?.key]
                        )
                      ) : (
                        <>{row?.[ele?.key] ?? '-'}</>
                      )}
                    </>
                  )}
                </Typography>
              </>
            )
        }

        return mainTable
      })
    ])
  }, [collectionFields.length, data?.selected?.length, data.sortWithId, data.edit, data.delete])
  const [actions, setAction] = useState([])
  useEffect(() => {
    if (data.edit || data.delete) {
      setAction([
        {
          flex: 0.1,
          minWidth: 120,
          field: 'action',
          sortable: false,
          headerName: messages.actions.toUpperCase(),
          renderCell: params => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {data.edit && (
                <Tooltip title={messages.edit}>
                  <IconButton
                    size='small'
                    onClick={e => {
                      setEditOpen(params.row)
                    }}
                  >
                    <IconifyIcon icon='tabler:edit' />
                  </IconButton>
                </Tooltip>
              )}
              {data.delete && (
                <Tooltip title={messages.delete}>
                  <IconButton
                    size='small'
                    onClick={e => {
                      setDeleteOpen(params.row)
                    }}
                  >
                    <IconifyIcon icon='tabler:trash' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )
        }
      ])
    }
  }, [data.edit, data.delete])

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

  const defaultDesign =
    open?.type === 'new_element' ? DefaultStyle(open?.key) : open?.options?.uiSchema?.xComponentProps?.cssClass
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
    size: '',
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
    api_url: '',
    apiKeyData: ''
  }

  const dispatch = useDispatch()

  console.log(getFields)

  return (
    <div>
      <InputControlDesign
        open={open}
        handleClose={handleClosePop}
        design={design}
        locale={locale}
        roles={roles}
        data={data}
        onChange={onChange}
        fields={getFields.filter(filed => data?.selected?.includes(filed?.key))}
      />
      <OpenEditDialog
        data={setGetFields}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collectionName={data.collectionName}
        filterWithSelect={collectionFields}
        sortWithId={data.sortWithId}
        collectionId={data.collectionId}
        disabled={disabled}
        pageId={pageId}
      />
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
      {loading ? (
        <div className='h-[300px]   flex justify-center items-center text-2xl font-bold border-2 border-dashed border-main rounded-md'>
          {locale === 'ar' ? 'برجاء اختيار نموذج البيانات' : 'Please Select Data Model'}
        </div>
      ) : (
        <>
          {!readOnly && <SortableList items={filterWithSelect} onSortEnd={onSortEnd} axis='xy' />}

          {/* <div className='flex justify-end px-5 mb-3'>
            <Button
              variant='contained'
              color='success'
              onClick={() => {
                const newData = {}
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
          </div> */}
          <div
            id=''
            onClick={() => {
              dispatch(removeerrorInAllRowData())
            }}
          >
            <PagnationTable
              Invitationscolumns={[...columns, ...actions]}
              data={getFields?.map((ele, i) => {
                const fData = { ...ele }
                fData.index = i + paginationModel.page * paginationModel.pageSize

                return fData
              })}
              totalRows={totalCount}
              getRowId={row => row.index}
              loading={loading}
              locale={locale}
              noRow={locale === 'ar' ? 'لا يوجد' : 'Not Found'}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />
          </div>
          {console.log(getFields)
          }
          {data?.collectionName == "payment" &&
            <Button
              variant='contained'
              color='success'
              onClick={() => {
                axiosPatch(`generic-entities/${data.collectionName}?Id=${getFields?.[0].Id}&pageId=${pageId}`, locale, {
                  Name:"INIT DATA"
                })
                .then(res => {
                  if (res.status) {
                    toast.success("Payment Success")
                      router.push("/paid")

                    }
                  })
                  .finally(() => {
                  })
              }}
            >
              {locale == "ar" ? "انهاء" : "Checkout"}
            </Button>

          }
          {/* <div id={`btn-actions-${data.collectionId}`}>
            <Button variant='contained' color='success'>
              {messages.add}
            </Button>
          </div> */}
        </>
      )}
    </div>
  )
}

export default TableView
