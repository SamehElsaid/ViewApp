/* eslint-disable react-hooks/exhaustive-deps */

import { Button, Dialog, DialogContent, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { axiosDelete, axiosGet, axiosPost } from 'src/Components/axiosCall'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import { useIntl } from 'react-intl'
import { LoadingButton } from '@mui/lab'
import OpenEditDialog from './OpenEditDialog'
import { DefaultStyle, getTypeFromCollection } from 'src/Components/_Shared'
import { removeerrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import TableComponent from './TableComponent'
import { IoMdSettings } from 'react-icons/io'
import TableColumnControl from './tableColumnControl'

function TableView({
  data,
  locale,
  onChange,
  readOnly,
  disabled,
  sortedLoop,
  allData,
  reloadRef,
  reloadHight,
  type,
  formTable,
  FilterData,
  filterWithAPIValue
}) {
  const [getFields, setGetFields] = useState([])
  const [changedValue, setChangedValue] = useState([])
  const [loading, setLoading] = useState(true)
  const [collectionFields, setCollectionFields] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const { messages } = useIntl()
  const errorAllRef = useRef([])
  const showBtnCheckbox = data.showBtn ?? true
  const [newDataInsert, setNewDataInsert] = useState([])
  const [open, setOpen] = useState(false)
  const [columnControl, setColumnControl] = useState(false)

  const handleClosePop = () => {
    setOpen(false)
    setColumnControl(false)
  }

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    const getOldRows = data.newRows || []
    const getFilterData = FilterData?.find(ele => ele.facilityType == filterWithAPIValue)
    console.log(getFilterData)

    if (data.collectionId) {
      axiosGet(
        `generic-entities/${data.collectionName}?pageNumber=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }&isLookup=true`,
        locale
      )
        .then(res => {
          if (res.status) {
            let newEntities = [...res.entities]
            const newChangedValue = changedValue.filter(ele => ele.Id?.includes('front'))
            if (changedValue.length !== 0) {
              newEntities = newEntities.map(ele => {
                let newEle = { ...ele }
                const findWithId = changedValue.find(e => e.Id === newEle.Id)
                if (findWithId) {
                  newEle = findWithId
                }

                return newEle
              })
            }
            if (paginationModel.page === 0) {
              newEntities = [...newChangedValue, ...newEntities]
            }
            console.log(getFilterData, 'getFilterData')

            setGetFields([...getOldRows, ...newEntities, ...newDataInsert])
            setTotalCount(res.totalCount)
          } else {
            setGetFields([...getOldRows, ...newDataInsert])
          }
        })
        .finally(() => setLoading(false))
    } else {
      setGetFields([...getOldRows, ...newDataInsert])
      setLoading(false)
    }
  }, [locale, data.collectionId, paginationModel, newDataInsert.length])

  useEffect(() => {
    if (loading || !filterWithAPIValue) return

    const findFilterData = FilterData.find(ele => ele?.[filterWithAPIValue?.value] == filterWithAPIValue?.changedValue)
    const firstArray = Object.values(findFilterData || {}).find(value => Array.isArray(value))
    const newDataInsert = []
    firstArray?.forEach(insert => {
      const newData = { Id: 'front' + new Date().getTime() }

      filterWithSelect.forEach(ele => {
        newData[ele.key] =
          ele.fieldCategory === 'Associations'
            ? insert?.Id ?? []
            : ele.type === 'Date'
            ? new Date()
            : ele.type === 'DateTime'
            ? new Date()
            : ''
      })

      newDataInsert.push(newData)
    })
    console.log(newDataInsert)

    setNewDataInsert(newDataInsert)
  }, [filterWithAPIValue?.changedValue, loading])

  console.log(data)

  const [loadingHeader, setLoadingHeader] = useState(true)
  useEffect(() => {
    setLoadingHeader(true)
    if (data.collectionId) {
      axiosGet(`collection-fields/get?CollectionId=${data.collectionId}`, locale)
        .then(res => {
          if (res.status) {
            const associationsConfig = data.associationsConfig || []

            const filterData = res.data.map(field => {
              const filterWith = type !== 'from-collection' ? field?.key : field?.id
              const find = associationsConfig.find(item => item?.key === filterWith)
              const filedData = { ...field }
              if (find) {
                filedData.kind = find.viewType
                filedData.descriptionEn = JSON.stringify(find.selectedOptions)
                filedData.getDataForm = find.dataSourceType
                filedData.externalApi = find.externalApi
                filedData.staticData = find.staticData
                filedData.selectedValueSend = JSON.stringify(find.selectedValueSend)
                filedData.apiHeaders = find.apiHeaders
                filedData.body = find.body
                filedData.method = find.method
                filedData.viewAsInput = find.viewAsInput
              }

              return filedData
            })

            setCollectionFields(filterData)
          }
        })
        .finally(() => setLoadingHeader(false))
    } else {
      setCollectionFields([])
      setLoadingHeader(false)
    }
  }, [locale, data.collectionId, data?.associationsConfig])

  const [filterWithSelect, setFilterWithSelect] = useState([])

  const getDesign = useCallback(
    (key, field) => {
      let defaultDesign = null
      if (field?.type === 'new_element') {
        defaultDesign = DefaultStyle(field?.key)
      } else {
        if (field?.kind) {
          defaultDesign = DefaultStyle(getTypeFromCollection(field.type, field.kind || field.descriptionAr))
        } else {
          if (field?.options?.uiSchema?.xComponentProps?.cssClass) {
            defaultDesign = field?.options?.uiSchema?.xComponentProps?.cssClass
          } else {
            defaultDesign = DefaultStyle(getTypeFromCollection(field.type, field.kind || field.descriptionAr))
          }
        }
      }
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
    setTriggerData(reloadRef)
  }, [reloadRef])

  useEffect(() => {
    if (collectionFields.length === 0) return
    let filteredFields = collectionFields.filter(ele => data.selected.includes(ele.key))
    if (filteredFields.length !== data.sortWithId?.length) {
      onChange({ ...data, sortWithId: filteredFields.map(ele => ele.id) })
    } else {
      filteredFields = data.sortWithId.map(ele => filteredFields.find(e => e?.id === ele))
    }

    const getMoreData = data.additional_fields

    const cleanedCurrent = allData?.current
      ? Object.fromEntries(
          Object.entries(allData.current).map(([key, value]) => {
            const newKey = key.includes('.') ? key.split('.').pop() : key

            return [newKey, value]
          })
        )
      : {}

    const lastData = []
    filteredFields.forEach(ele => {
      const findData = getMoreData?.find(e => e.key === ele.id)
      if (findData) {
        const rolesFindData = findData?.roles?.triggerColumn
        if (rolesFindData) {
          const rolesData = cleanedCurrent?.[rolesFindData?.selectedField] === rolesFindData?.mainValue
          if (!rolesData) {
            lastData.push(ele)

            return
          }

          if (rolesFindData.isEqual === 'equal') {
            if (rolesData) {
              lastData.filter(el => el.id !== ele.id)
            }
          } else {
            if (!rolesData) {
              lastData.filter(el => el.id !== ele.id)
            }
          }
        } else {
          lastData.push(ele)
        }
      } else {
        lastData.push(ele)
      }
    })

    setFilterWithSelect(!readOnly ? filteredFields : lastData)
  }, [collectionFields.length, data?.selected?.length, data.sortWithId, reloadRef])

  const SortableButton = SortableElement(({ value }) => (
    <>
      <div className='flex gap-2 items-center p-2 text-white rounded-md cursor-pointer select-none text-nowrap bg-main-color'>
        {locale === 'ar' ? value.nameAr.toUpperCase() : value.nameEn.toUpperCase()}
      </div>
      <button
        type='button'
        title={locale !== 'ar' ? 'Setting' : 'التحكم'}
        onMouseDown={e => {
          e.stopPropagation()
        }}
        onClick={e => {
          e.stopPropagation()
          setColumnControl(value)
          setOpen(value)
        }}
        className='w-[30px] || h-[30px] hover:bg-main-color hover:text-white duration-200 || rounded-lg || shadow-2xl text-xl flex || items-center justify-center bg-white border-main-color border'
      >
        <IoMdSettings />
      </button>
    </>
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

  return (
    <div>
      <TableColumnControl
        open={columnControl && open}
        handleClose={handleClosePop}
        design={design}
        locale={locale}
        roles={roles}
        data={data}
        onChange={onChange}
        fields={sortedLoop}
      />
      <OpenEditDialog
        data={setGetFields}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collectionName={data.collectionName}
        filterWithSelect={collectionFields}
        sortWithId={data.sortWithId}
        disabled={disabled}
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

      <>
        {!readOnly && <SortableList items={filterWithSelect} onSortEnd={onSortEnd} axis='xy' />}
        <div className='flex justify-end px-5 mb-3'>
          {data.kind === 'form-table' && showBtnCheckbox && paginationModel.page === 0 && (
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
                onChange({
                  ...data,
                  newRows: data.newRows ? [...data.newRows, newData] : [newData]
                })
                if (reloadHight) {
                  reloadHight(prev => prev + 1)
                }
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
            allData={allData}
            filterWithSelect={filterWithSelect}
            columns={getFields}
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
            setEditOpen={setEditOpen}
            setDeleteOpen={setDeleteOpen}
            setChangedValue={setChangedValue}
            sortedLoop={sortedLoop}
            reloadHight={reloadHight}
            type={type}
            formTable={formTable}
          />
          {data.kind === 'form-table' && type !== 'from-collection' && paginationModel.page === 0 && (
            <div className='flex justify-end px-5 mt-3'>
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
            </div>
          )}
        </div>
      </>
    </div>
  )
}

export default TableView
