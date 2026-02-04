/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { axiosGet, axiosPost, axiosPut } from 'src/Components/axiosCall'
import DisplayField from './DisplayField'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import InputControlDesign from './InputControlDesign'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DefaultStyle, getTypeFromCollection } from 'src/Components/_Shared'
import { IoMdSettings } from 'react-icons/io'
import { useIntl } from 'react-intl'
import { CircularProgress } from '@mui/material'
import { useDispatch } from 'react-redux'

// Dnd Kit Sortable Item Component
function SortableGridItem({
  filed,
  index,
  readOnly,
  stopSort,
  locale,
  data,
  getDesign,
  setOpen,
  refError,
  setLayout,
  triggerData,
  onChange,
  layout,
  dataRef,
  dataRefWithCollectionId,
  sortedLoop,
  setTriggerData,
  entitiesData,
  errors,
  addMoreElement,
  gridColumnSpan,
  className,
  hoverText,
  hintText,
  roles,
  handleSubmit,
  loading,
  disabled,
  reload,
  messages
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: filed.id,
    disabled: readOnly || stopSort
  })

  const layoutItem = layout.find(l => l.i === filed.id)
  const currentWidth = layoutItem?.w || gridColumnSpan || 12
  const currentHeight = layoutItem?.h || (filed.type === 'LongText' ? 1.2 : 1)

  const handleWidthChange = delta => {
    const newWidth = Math.max(1, Math.min(12, currentWidth + delta))

    const updatedLayout = layout.map(item =>
      item.i === filed.id
        ? { ...item, w: newWidth }
        : item
    )

    setLayout(updatedLayout)
    onChange({ ...data, layout: updatedLayout })
  }

  const handleHeightChange = delta => {
    const newHeight = Math.max(0.5, Math.min(10, currentHeight + delta))

    const updatedLayout = layout.map(item =>
      item.i === filed.id
        ? { ...item, h: newHeight }
        : item
    )

    setLayout(updatedLayout)
    onChange({ ...data, layout: updatedLayout })
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${currentWidth}`,
    minHeight: `${currentHeight * 100}px`,
    position: 'relative'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-full ${className} ${!readOnly ? 'px-2' : ''} ${hoverText || hintText ? '!z-[5555555]' : ''}`}
      {...attributes}
    >
      {!readOnly && !stopSort && (
        <div className='absolute inset-0 z-20 flex flex-wrap justify-end items-start gap-1 border-main-color border-dashed border rounded-md p-1'>
          {/* Width Controls */}
          <div className='flex flex-col items-center bg-white rounded border border-main-color shadow-sm'>
            <div className='text-xs text-gray-600 px-1 border-b border-gray-200 w-full text-center'>
              {locale !== 'ar' ? 'Width' : 'العرض'}
            </div>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleWidthChange(-1)
                }}
                className='w-6 h-6 flex items-center justify-center hover:bg-main-color hover:text-white text-xs font-bold'
                title={locale !== 'ar' ? 'Decrease Width' : 'تقليل العرض'}
              >
                -
              </button>
              <span className='px-2 text-xs min-w-[30px] text-center border-x border-gray-200'>
                {currentWidth}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleWidthChange(1)
                }}
                className='w-6 h-6 flex items-center justify-center hover:bg-main-color hover:text-white text-xs font-bold'
                title={locale !== 'ar' ? 'Increase Width' : 'زيادة العرض'}
              >
                +
              </button>
            </div>
          </div>

          {/* Height Controls */}
          <div className='flex flex-col items-center bg-white rounded border border-main-color shadow-sm'>
            <div className='text-xs text-gray-600 px-1 border-b border-gray-200 w-full text-center'>
              {locale !== 'ar' ? 'Height' : 'الارتفاع'}
            </div>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleHeightChange(-0.1)
                }}
                className='w-6 h-6 flex items-center justify-center hover:bg-main-color hover:text-white text-xs font-bold'
                title={locale !== 'ar' ? 'Decrease Height' : 'تقليل الارتفاع'}
              >
                -
              </button>
              <span className='px-2 text-xs min-w-[40px] text-center border-x border-gray-200'>
                {currentHeight.toFixed(1)}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleHeightChange(0.1)
                }}
                className='w-6 h-6 flex items-center justify-center hover:bg-main-color hover:text-white text-xs font-bold'
                title={locale !== 'ar' ? 'Increase Height' : 'زيادة الارتفاع'}
              >
                +
              </button>
            </div>
          </div>

          <button
            type='button'
            {...listeners}
            title={locale !== 'ar' ? 'Drag Handle' : 'مقبض السحب'}
            className='cursor-grab active:cursor-grabbing p-2 bg-white rounded border border-main-color hover:bg-main-color hover:text-white'
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="7" cy="5" r="1.5" />
              <circle cx="13" cy="5" r="1.5" />
              <circle cx="7" cy="10" r="1.5" />
              <circle cx="13" cy="10" r="1.5" />
              <circle cx="7" cy="15" r="1.5" />
              <circle cx="13" cy="15" r="1.5" />
            </svg>
          </button>
          <button
            type='button'
            title={locale !== 'ar' ? 'Setting' : 'التحكم'}
            onMouseDown={e => {
              e.stopPropagation()
            }}
            onClick={e => {
              e.stopPropagation()
              setOpen(filed)
            }}
            className='w-[30px] h-[30px] hover:bg-main-color hover:text-white duration-200 rounded-lg shadow-2xl text-xl flex items-center justify-center bg-white border-main-color border'
          >
            <IoMdSettings />
          </button>
          {/* Quick tab assign */}
          {(() => {
            const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
            if (!tabsElement) return null
            const tabs = tabsElement.data || []
            const fieldId = filed.type === 'new_element' ? filed.id : filed.key

            const currentIndex = Math.max(
              -1,
              tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(fieldId))
            )

            return (
              <select
                className='ml-2 p-1 border rounded text-sm bg-white'
                value={currentIndex}
                onChange={e => {
                  const idx = parseInt(e.target.value, 10)
                  const addMore = [...(data.addMoreElement || [])]
                  const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                  if (tabsIdx === -1) return
                  const nextTabsEl = { ...addMore[tabsIdx] }
                  const nextData = [...(nextTabsEl.data || [])]
                  for (let i = 0; i < nextData.length; i++) {
                    const t = { ...(nextData[i] || {}) }
                    const arr = Array.isArray(t.fields) ? t.fields : []
                    if (arr.includes(fieldId)) {
                      t.fields = arr.filter(id => id !== fieldId)
                      nextData[i] = t
                    }
                  }
                  if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                    const t = { ...(nextData[idx] || {}) }
                    const arr = Array.isArray(t.fields) ? t.fields : []
                    if (!arr.includes(fieldId)) {
                      t.fields = [...arr, fieldId]
                      nextData[idx] = t
                    }
                  }
                  nextTabsEl.data = nextData
                  addMore[tabsIdx] = nextTabsEl
                  onChange({ ...data, addMoreElement: addMore })
                }}
              >
                <option value={-1}>{messages?.None || 'None'}</option>
                {tabs.map((t, ti) => (
                  <option key={ti} value={ti}>
                    {t?.[`name_${locale}`] || t?.name_en || t?.name_ar || `Tab ${ti + 1}`}
                  </option>
                ))}
              </select>
            )
          })()}
        </div>
      )}

      <DisplayField
        handleSubmit={handleSubmit}
        loadingBtn={loading}
        input={filed}
        design={getDesign(filed.id, filed)}
        readOnly={disabled}
        disabledBtn={data.type_of_sumbit === 'api' && !data.submitApi}
        refError={refError}
        setLayout={setLayout}
        triggerData={triggerData}
        data={data}
        layout={layout}
        onChangeData={onChange}
        dataRef={dataRef}
        dataRefWithCollectionId={dataRefWithCollectionId}
        allFields={sortedLoop}
        setTriggerData={setTriggerData}
        findValue={entitiesData?.[filed?.key]}
        roles={roles}
        advancedEdit={readOnly}
        reload={reload}
        errorView={errors?.[filed.type === 'new_element' ? filed.id : filed.key]?.[0]}
        findError={
          errors && typeof errors?.[filed.type === 'new_element' ? filed.id : filed.key] === 'object'
        }
      />
    </div>
  )
}

export default function ViewCollection({
  data,
  locale,
  onChange,
  readOnly,
  disabled,
  workflowId,
  pageId,
  entitiesId,
  collectionName,
  pageName
}) {
  const [getFields, setGetFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [stopSort, setStopSort] = useState(false)
  const [reload, setReload] = useState(0)
  const [errors, setErrors] = useState(false)
  const refError = useRef({})
  const dataRef = useRef({})
  const dataRefWithCollectionId = useRef({})
  const [triggerData, setTriggerData] = useState(0)
  const [assignTabIndex, setAssignTabIndex] = useState(0)
  const [renameTabIndex, setRenameTabIndex] = useState(0)
  const [renameTabValueAr, setRenameTabValueAr] = useState('')
  const [renameTabValueEn, setRenameTabValueEn] = useState('')
  const [entitiesData, setEntitiesData] = useState(null)
  const dispatch = useDispatch()


  const {
    query: { requestId },
    push
  } = useRouter()
  const { messages } = useIntl()

  const [layout, setLayout] = useState(Array.isArray(data?.layout) ? data.layout : [])
  const addMoreElement = data.addMoreElement ?? []
  const dataLength = getFields.length + addMoreElement.length

  const convertTheTheSameYToGroup = layout
    ? Object?.values(
      layout?.reduce((acc, item) => ((acc[Math.floor(item.y)] = acc[Math.floor(item.y)] || []).push(item), acc), {})
    )
    : []
  const SortWithXInGroup = convertTheTheSameYToGroup.map(group => group.sort((a, b) => a.x - b.x))
  const sortedData = SortWithXInGroup.flat()
  const filterSelect = getFields

  useEffect(() => {
    if (!loading) {
      const layout = Array.isArray(data?.layout) ? [...data.layout] : []
      const items = [...filterSelect, ...addMoreElement]
      const lastY = layout.at(-1)?.y ?? 0
      items.forEach(item => {
        if (!layout.find(l => l.i === item.id)) {
          layout.push({
            i: item.id,
            x: 0,
            y: lastY + 1,
            w: 12,
            h: item.type === 'LongText' ? 1.8 : 1
          })
        }
      })

      setLayout(layout.map(item => ({ ...item, minH: 0 })))
    }
  }, [loading, data?.selected, dataLength])

  useEffect(() => {
    if (data.collectionId) {
      Promise.all([
        ...(data?.SelectedRelatedCollectionsFields?.map(async item => {
          const res = await axiosGet(`collection-fields/get?CollectionId=${item.collection.id}`, locale)
          if (res.status) {
            const selectedFields = res.data.filter(field => item.selected.includes(field.key))

            return selectedFields.map(field => ({ ...field, key: field.key + '[' + item.collection.key + ']' }))
          }

          return []
        }) || []),

        axiosGet(`collection-fields/get?CollectionId=${data.collectionId}`, locale).then(res => {
          if (res.status) {
            const associationsConfig = data.associationsConfig || []

            const filterData = res.data
              .filter(field => data?.selected?.includes(field?.key))
              .map(field => {
                const find = associationsConfig.find(item => item?.key === field?.key)
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

            return filterData
          }

          return []
        })
      ])
        .then(results => {
          const validResults = results.filter(Boolean)
          const flatResults = validResults.flat()
          setGetFields(flatResults)
        })
        .finally(() => setLoading(false))
    } else {
      setGetFields([])
      setLoading(true)
    }
  }, [locale, data.collectionId, data.SelectedRelatedCollectionsFields, data.selected])

  useEffect(() => {
    if (entitiesId !== null && collectionName !== null) {
      axiosGet(`generic-entities/${collectionName}/${entitiesId}`, locale).then(res => {
        if (res.status) {
          setEntitiesData(res?.data?.entities?.[0])
        }
      })
    }
  }, [entitiesId, collectionName, pageName])

  const handleSubmit = async (e, handleSubmitEvent) => {
    e.preventDefault()


    const initialSendData = { ...dataRef.current }
    if (data.submitApi?.includes('/api/Account/Register')) {
      delete initialSendData.pageWorkflows
      initialSendData.createdBy = 'system'
    }
    const sendData = {}
    Object.keys(initialSendData).forEach(key => {
      const keyData = key

      if (initialSendData[keyData] !== null) {
        sendData[keyData] = initialSendData[keyData]
      }
      if (Array.isArray(initialSendData[keyData])) {
        sendData[keyData] = initialSendData[keyData].map(item => item.Id || item)
      }
    })
    if (data.type_of_sumbit === 'api' && !data.submitApi) {
      return
    }

    const errors = []
    if (refError.current) {
      for (const key in refError.current) {
        if (refError.current[key]) {
          errors.push(refError.current[key])
        }
      }
    }

    console.log(errors)

    if (errors.find(ele => typeof ele === 'object')) {
      return setErrors(refError.current)
    }

    const output = {}

    Object.entries(sendData).forEach(([key, value]) => {
      const match = key.match(/^(.+)\[(.+)\]$/)
      if (match) {
        const [, mainKey, subKey] = match
        output[subKey] = output[subKey] || {}
        output[subKey][mainKey] = value
      } else {
        if (value instanceof Date && !isNaN(value)) {
          const date = value
          const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19) // remove milliseconds and 'Z'

          output[key] = localISO
        } else {
          output[key] = value
        }
      }
    })

    setLoading(true)

    const apiCall =
      data.type_of_sumbit === 'api'
        ? data.submitApi
        : `generic-entities/${data.collectionName}/?pageId=${pageId}${requestId ? `&requestId=${requestId}` : ''}`

    if (entitiesId && collectionName) {
      if (data.onSubmit) {
        if (handleSubmitEvent) {
          handleSubmitEvent()
        }
        const evaluatedFn = eval('(' + data.onSubmit + ')')
        if (handleSubmitEvent) {
        } else {
          evaluatedFn()
        }
      }
      axiosPut(
        `generic-entities/${collectionName}?Id=${entitiesId}&requestId=${requestId}&pageId=${pageId}`,
        locale,
        output
      )
        .then(res => {
          if (res.status) {
            setReload(prev => prev + 1)
            toast.success(messages.dialogs.dataSentSuccessfully)

            if (data?.redirect) {
              push(`/${locale}/${data?.redirect === '/' ? '' : data?.redirect}`)
            }
          }
        })
        .finally(() => setLoading(false))
    } else {
      axiosPost(apiCall, locale, output, false, false, data.type_of_sumbit !== 'collection' ? true : false)
        .then(res => {
          if (res.status) {
            setReload(prev => prev + 1)
            toast.success(messages.dialogs.dataSentSuccessfully)
            if (data.onSubmit) {
              const evaluatedFn = eval('(' + data.onSubmit + ')')
              if (handleSubmitEvent) {
                handleSubmitEvent()
              } else {
                evaluatedFn()
              }
            }

            if (data?.redirect) {
              push(`/${locale}/${data?.redirect === '/' ? '' : data?.redirect}`)
            }
          }
        })
        .finally(() => setLoading(false))
    }
  }

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
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

  const refTest = useRef()

  useEffect(() => {
    if (layout) {
      sortedData.forEach((ele, index) => {
        const element = document.querySelector('.ss' + ele.i)
        if (element) {
          element.style.zIndex = sortedData.length + 50000 - index
        }
      })
    }
  }, [layout])

  const sortedLoop = useMemo(() => {
    const items = [...filterSelect, ...addMoreElement]

    const sorted = items.sort((a, b) => {
      const indexA = sortedData.findIndex(f => f.i === a.id)
      const indexB = sortedData.findIndex(f => f.i === b.id)

      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    })

    return sorted
  }, [filterSelect, addMoreElement, sortedData])

  // Dnd Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  )

  // Handle drag end
  const handleDragEnd = event => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedLoop.findIndex(item => item.id === active.id)
    const newIndex = sortedLoop.findIndex(item => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create new sorted array
    const newSortedLoop = arrayMove(sortedLoop, oldIndex, newIndex)

    // Update layout to reflect new order - maintain x position but update y
    const newLayout = newSortedLoop.map((item, index) => {
      const existingLayout = layout.find(l => l.i === item.id)

      return {
        i: item.id,
        x: existingLayout?.x ?? 0,
        y: index,
        w: existingLayout?.w ?? 12,
        h: existingLayout?.h ?? (item.type === 'LongText' ? 1.8 : 1),
        minH: 0
      }
    })

    setLayout(newLayout)
    onChange({ ...data, layout: newLayout })
  }

  return (
    <div className={`${disabled ? 'text-main' : ''}`}>
      {loading && (
        <div className='fixed inset-0 z-10 flex justify-center items-center w-full h-full bg-white/50'>
          {/* <img src={photo.src} alt='loading' className='w-[25px] h-[25px] scale-150 ' /> */}
          <CircularProgress />
        </div>
      )}
      <InputControlDesign
        open={open}
        handleClose={handleClose}
        design={design}
        locale={locale}
        roles={roles}
        data={data}
        onChange={onChange}
        fields={filterSelect}
      />
      {!readOnly && (
        <>
          <div className='flex justify-end'>
            <button
              onClick={() => {
                setStopSort(!stopSort)
              }}
              className={`ms-auto mb-3 ${!stopSort ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-4 py-2 rounded-md`}
            >
              {!stopSort ? 'Disable Sort' : 'Enable Sort'}
            </button>
          </div>
          <div className='flex flex-col gap-2 mb-3'>
            <div className='flex justify-between items-center p-2 rounded-md border-2 border-dashed border-main-color bg-white/70'>
              {(() => {
                const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
                if (tabsElement) {
                  return (
                    <div className='flex gap-2 items-center'>
                      <button
                        type='button'
                        className='px-3 py-1 rounded text-sm bg-main-color text-white hover:bg-main-color/90 shadow'
                        onClick={() => {
                          const addMore = [...(data.addMoreElement || [])]
                          const idx = addMore.findIndex(ele => ele.id === tabsElement.id)
                          if (idx > -1) {
                            const next = { ...addMore[idx] }
                            const count = (next.data || []).length + 1
                            next.data = [
                              {
                                name_ar: `تبويب ${count}`,
                                name_en: `Tab ${count}`,
                                link: '',
                                active: false,
                                fields: []
                              },
                              ...(next.data || [])
                            ]
                            addMore[idx] = next
                            onChange({ ...data, addMoreElement: addMore })
                          }
                        }}
                      >
                        {messages?.Add_Tab || 'Add Tab'}
                      </button>
                      <span className='text-xs text-gray-500'>|</span>
                      <button
                        type='button'
                        className='px-3 py-1 rounded text-sm border border-main-color text-main-color hover:bg-main-color/5 shadow'
                        onClick={() => {
                          // Auto-arrange all inputs sequentially (x=0, w=12) with Tabs pinned to top if present
                          const tabsEl = (addMoreElement || []).find(ele => ele.key === 'tabs')
                          const fields = [...(getFields || [])]
                          const extras = (addMoreElement || []).filter(ele => ele?.id !== tabsEl?.id)
                          const items = tabsEl ? [tabsEl, ...fields, ...extras] : [...fields, ...extras]

                          const newLayout = items.map((item, index) => ({
                            i: item.id,
                            x: 0,
                            y: index,
                            w: 12,
                            h: item.type === 'LongText' ? 1.8 : 1
                          }))
                          setLayout(newLayout)
                          onChange({ ...data, layout: newLayout })
                        }}
                      >
                        {messages?.Arrange_Inputs || 'Arrange Inputs'}
                      </button>
                    </div>
                  )
                }

                return (
                  <button
                    type='button'
                    className='px-3 py-1 rounded text-sm bg-main-color text-white hover:bg-main-color/90 shadow'
                    onClick={() => {
                      const addMore = [...(data.addMoreElement || [])]
                      addMore.push({
                        name_ar: 'التبويبات',
                        name_en: 'Tabs',
                        key: 'tabs',
                        type: 'new_element',
                        data: [{ name_ar: 'التبويب الاول', name_en: 'Tab 1', link: '', active: true, fields: [] }],
                        id: 's' + new Date().getTime()
                      })
                      onChange({ ...data, addMoreElement: addMore })
                    }}
                  >
                    {messages?.Add_Tabs || 'Add Tabs'}
                  </button>
                )
              })()}
            </div>
            {/* Tabs controls (position/alignment) */}
            {(() => {
              const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
              if (!tabsElement) return null

              return (
                <div className='flex flex-wrap gap-2 items-center p-3 rounded-md border-2 border-dashed border-main-color bg-white/70'>
                  <span className='text-sm font-semibold text-main-color'>
                    {messages?.Tabs_Controls || 'Tabs Controls'}
                  </span>
                  <span className='text-sm text-gray-600'>{messages?.Controls_Position || 'Controls Position'}</span>
                  <select
                    className='px-2 py-1 border border-main-color rounded text-sm bg-white focus:outline-none'
                    value={tabsElement?.controls?.placement || 'bottom'}
                    onChange={e => {
                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                      if (tabsIdx === -1) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      nextTabsEl.controls = { ...(nextTabsEl.controls || {}), placement: e.target.value }
                      addMore[tabsIdx] = nextTabsEl
                      onChange({ ...data, addMoreElement: addMore })
                    }}
                  >
                    <option value='top'>{messages?.Top || 'Top'}</option>
                    <option value='bottom'>{messages?.Bottom || 'Bottom'}</option>
                  </select>
                  <span className='text-sm text-gray-600'>{messages?.Alignment || 'Alignment'}</span>
                  <select
                    className='px-2 py-1 border border-main-color rounded text-sm bg-white focus:outline-none'
                    value={tabsElement?.controls?.align || 'start'}
                    onChange={e => {
                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                      if (tabsIdx === -1) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      nextTabsEl.controls = { ...(nextTabsEl.controls || {}), align: e.target.value }
                      addMore[tabsIdx] = nextTabsEl
                      onChange({ ...data, addMoreElement: addMore })
                    }}
                  >
                    <option value='start'>{messages?.Start || 'Start'}</option>
                    <option value='center'>{messages?.Center || 'Center'}</option>
                    <option value='end'>{messages?.End || 'End'}</option>
                  </select>
                </div>
              )
            })()}

            {/* Rename tab UI */}
            {(() => {
              const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
              if (!tabsElement) return null
              const tabs = Array.isArray(tabsElement.data) ? tabsElement.data : []
              const safeIndex = Math.min(Math.max(renameTabIndex, 0), Math.max(0, tabs.length - 1))

              return (
                <div className='flex flex-wrap gap-2 items-center p-3 rounded-md border-2 border-dashed border-main-color bg-white/70'>
                  <span className='text-sm font-semibold text-main-color'>{messages?.Rename_Tab || 'Rename Tab'}</span>
                  <select
                    className='px-2 py-1 border border-main-color rounded text-sm bg-white focus:outline-none'
                    value={safeIndex}
                    onChange={e => {
                      const idx = parseInt(e.target.value, 10) || 0
                      setRenameTabIndex(idx)
                      const t = tabs[idx] || {}
                      setRenameTabValueAr(t?.name_ar || '')
                      setRenameTabValueEn(t?.name_en || '')
                    }}
                  >
                    {tabs.map((t, ti) => (
                      <option key={ti} value={ti}>
                        {t?.[`name_${locale}`] || t?.name_en || t?.name_ar || `Tab ${ti + 1}`}
                      </option>
                    ))}
                  </select>
                  <input
                    className='px-2 py-1 border border-main-color rounded text-sm focus:outline-none'
                    placeholder='Name (AR)'
                    value={renameTabValueAr}
                    onChange={e => {
                      const cleaned = (e.target.value || '').replace(/[^\w\sأ-ي]/g, '')
                      setRenameTabValueAr(cleaned)
                    }}
                  />
                  <input
                    className='px-2 py-1 border border-main-color rounded text-sm focus:outline-none'
                    placeholder='Name (EN)'
                    value={renameTabValueEn}
                    onChange={e => {
                      const cleaned = (e.target.value || '').replace(/[^\w\s]/g, '')
                      setRenameTabValueEn(cleaned)
                    }}
                  />
                  <button
                    type='button'
                    className='px-3 py-1 rounded text-sm bg-main-color text-white hover:bg-main-color/90 shadow'
                    onClick={() => {
                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                      if (tabsIdx === -1) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      const nextData = [...(nextTabsEl.data || [])]
                      const t = { ...(nextData[safeIndex] || {}) }
                      t.name_ar = (renameTabValueAr || '').trim()
                      t.name_en = (renameTabValueEn || '').trim()
                      nextData[safeIndex] = t
                      nextTabsEl.data = nextData
                      addMore[tabsIdx] = nextTabsEl
                      onChange({ ...data, addMoreElement: addMore })
                    }}
                  >
                    {messages?.Save || 'Save'}
                  </button>
                  <span className='text-xs text-gray-500'>|</span>
                  <button
                    type='button'
                    className='px-2 py-1 rounded text-sm border border-main-color text-main-color hover:bg-main-color/5 shadow'
                    onClick={() => {
                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                      if (tabsIdx === -1) return
                      if (safeIndex <= 0) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      const nextData = [...(nextTabsEl.data || [])]
                      const tmp = nextData[safeIndex - 1]
                      nextData[safeIndex - 1] = nextData[safeIndex]
                      nextData[safeIndex] = tmp
                      nextTabsEl.data = nextData
                      addMore[tabsIdx] = nextTabsEl
                      onChange({ ...data, addMoreElement: addMore })
                      setRenameTabIndex(safeIndex - 1)
                    }}
                  >
                    {messages?.Move_Up || 'Move Up'}
                  </button>
                  <button
                    type='button'
                    className='px-2 py-1 rounded text-sm border border-main-color text-main-color hover:bg-main-color/5 shadow'
                    onClick={() => {
                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                      if (tabsIdx === -1) return
                      if (safeIndex >= (tabs?.length || 1) - 1) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      const nextData = [...(nextTabsEl.data || [])]
                      const tmp = nextData[safeIndex + 1]
                      nextData[safeIndex + 1] = nextData[safeIndex]
                      nextData[safeIndex] = tmp
                      nextTabsEl.data = nextData
                      addMore[tabsIdx] = nextTabsEl
                      onChange({ ...data, addMoreElement: addMore })
                      setRenameTabIndex(safeIndex + 1)
                    }}
                  >
                    {messages?.Move_Down || 'Move Down'}
                  </button>
                </div>
              )
            })()}
            {(() => {
              const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
              if (!tabsElement) return null
              const tabs = Array.isArray(tabsElement.data) ? tabsElement.data : []
              const currentIndex = Math.min(Math.max(assignTabIndex, 0), Math.max(0, tabs.length - 1))
              const fieldsList = filterSelect || []

              return (
                <div className='flex flex-col gap-2 p-2 border rounded'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>{messages?.Select_Tab || 'Select Tab'}</span>
                    <select
                      className='px-2 py-1 border rounded text-sm bg-white'
                      value={currentIndex}
                      onChange={e => setAssignTabIndex(parseInt(e.target.value, 10) || 0)}
                    >
                      {tabs.map((t, ti) => (
                        <option key={ti} value={ti}>
                          {t?.[`name_${locale}`] || t?.name_en || t?.name_ar || `Tab ${ti + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {fieldsList.map(f => {
                      const fieldId = f?.key ?? f?.id

                      const assigned = Array.isArray(tabs[currentIndex]?.fields)
                        ? tabs[currentIndex].fields.includes(fieldId)
                        : false

                      return (
                        <label key={fieldId} className='flex items-center gap-1 text-sm border rounded px-2 py-1'>
                          <input
                            type='checkbox'
                            checked={assigned}
                            onChange={() => {
                              const addMore = [...(data.addMoreElement || [])]
                              const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                              if (tabsIdx === -1) return
                              const nextTabsEl = { ...addMore[tabsIdx] }
                              const nextData = [...(nextTabsEl.data || [])]
                              const tabObj = { ...(nextData[currentIndex] || {}) }
                              const current = Array.isArray(tabObj.fields) ? tabObj.fields : []
                              tabObj.fields = assigned ? current.filter(id => id !== fieldId) : [...current, fieldId]
                              nextData[currentIndex] = tabObj
                              nextTabsEl.data = nextData
                              addMore[tabsIdx] = nextTabsEl
                              onChange({ ...data, addMoreElement: addMore })
                            }}
                          />
                          <span>{locale === 'ar' ? f.nameAr : f.nameEn}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </>
      )}
      {loading ? (
        <div className='h-[300px]  flex justify-center items-center text-2xl font-bold border-2 border-dashed border-main rounded-md'>
          {messages.pleaseSelectDataModel}
        </div>
      ) : (
        <form className={'w-[calc(100%)]'} onClick={() => setErrors(false)} onSubmit={handleSubmit}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedLoop.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div
                className='layout'
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '10px',
                  width: '100%'
                }}
              >
                {sortedLoop.map((filed, i) => {
                  const roles = data?.additional_fields?.find(ele => ele.key === filed.id)?.roles ?? {
                    onMount: { type: '', value: '' },
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
                    trigger: {
                      selectedField: null,
                      triggerKey: null,
                      typeOfValidation: null,
                      isEqual: 'equal',
                      currentField: 'Id',
                      mainValue: '',
                      parentKey: ''
                    },
                    event: {
                      onChange: '',
                      onBlur: '',
                      onUnmount: ''
                    },
                    afterDateType: '',
                    afterDateValue: '',
                    beforeDateType: '',
                    beforeDateValue: '',
                    regex: {
                      regex: '',
                      message_ar: '',
                      message_en: ''
                    },
                    size: ''
                  }
                  const hoverText = roles?.hover?.hover_ar || roles?.hover?.hover_en
                  const hintText = roles?.hint?.hint_ar || roles?.hint?.hint_en

                  const className = filed.type === 'new_element' ? `s${filed.id}` : 'ss' + filed.id
                  const layoutItem = layout.find(l => l.i === filed.id)
                  const gridColumnSpan = layoutItem?.w || 12

                  return (
                    <SortableGridItem
                      key={filed.id}
                      filed={filed}
                      index={i}
                      readOnly={readOnly}
                      stopSort={stopSort}
                      locale={locale}
                      data={data}
                      getDesign={getDesign}
                      setOpen={setOpen}
                      refError={refError}
                      setLayout={setLayout}
                      triggerData={triggerData}
                      onChange={onChange}
                      layout={layout}
                      dataRef={dataRef}
                      dataRefWithCollectionId={dataRefWithCollectionId}
                      sortedLoop={sortedLoop}
                      setTriggerData={setTriggerData}
                      entitiesData={entitiesData}
                      errors={errors}
                      addMoreElement={addMoreElement}
                      gridColumnSpan={gridColumnSpan}
                      className={className}
                      hoverText={hoverText}
                      hintText={hintText}
                      roles={roles}
                      handleSubmit={handleSubmit}
                      loading={loading}
                      disabled={disabled}
                      reload={reload}
                      messages={messages}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </form>
      )}
    </div>
  )
}
