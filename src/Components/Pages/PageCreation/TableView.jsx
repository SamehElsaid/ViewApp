/* eslint-disable react-hooks/exhaustive-deps */

import { Button, Dialog, DialogContent, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { axiosDelete, axiosGet, axiosPost } from 'src/Components/axiosCall'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import { useIntl } from 'react-intl'
import { LoadingButton } from '@mui/lab'
import OpenEditDialog from './OpenEditDialog'
import { DefaultStyle } from 'src/Components/_Shared'
import InputControlDesign from './InputControlDesign'
import { removeerrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import TableComponent from './TableComponent'
import { useSelector } from 'react-redux'

function TableView({ data, locale, onChange, readOnly, disabled, pageId, entitiesId, collectionName, pageName }) {
  const [getFields, setGetFields] = useState([])
  const [changedValue, setChangedValue] = useState([])
  const [loading, setLoading] = useState(true)
  const [collectionFields, setCollectionFields] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const { messages } = useIntl()
  const errorAllRef = useRef([])

  const user = useSelector(rx => rx.auth)
  console.log(user)

  const [open, setOpen] = useState(false)
  const [entitiesData, setEntitiesData] = useState(null)
  const [loadingEntities, setLoadingEntities] = useState(true)

  useEffect(() => {
    if (entitiesId && collectionName && pageName === 'MedicalMemberDetailes') {
      console.log('adham')

      axiosGet(`generic-entities/${collectionName}/${entitiesId}`, locale)
        .then(res => {
          if (res.status) {
            console.log(res, 'hereee')

            console.log(res.entities, 'res.entities')
            setEntitiesData(res.entities?.[0])
          }
        })
        .finally(() => setLoadingEntities(false))
    } else {
      setLoadingEntities(false)
    }
  }, [entitiesId, collectionName, pageName])

  console.log(pageName === 'first', entitiesId, collectionName, entitiesData)

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
    console.log('here')
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
                console.log(findWithId, 'findWithId')
                if (findWithId) {
                  newEle = findWithId
                }

                return newEle
              })
            }
            if (paginationModel.page === 0) {
              newEntities = [...newChangedValue, ...newEntities]
            }
            console.log(newEntities, 'newEntities')

            setGetFields(newEntities)
            setTotalCount(res.totalCount)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setGetFields([])
      setLoading(false)
    }
  }, [locale, data.collectionId, paginationModel])

  const [loadingHeader, setLoadingHeader] = useState(true)
  useEffect(() => {
    setLoadingHeader(true)
    if (data.collectionId) {
      axiosGet(`collection-fields/get?CollectionId=${data.collectionId}`, locale)
        .then(res => {
          if (res.status) {
            setCollectionFields(res.data)
          }
        })
        .finally(() => setLoadingHeader(false))
    } else {
      setCollectionFields([])
      setLoadingHeader(false)
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
  }, [collectionFields.length, data?.selected?.length, data.sortWithId, data.edit, data.delete])

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
          {data.kind === 'form-table' && paginationModel.page === 0 && !entitiesData?.ALLOWADD && (
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
          />
          <div className='flex justify-end px-5 mt-3'>
            {data.kind === 'form-table' && paginationModel.page === 0 && (
              <Button
                variant='contained'
                color='success'
                onClick={() => {
                  console.log(changedValue, 'changedValue')

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

export default TableView
