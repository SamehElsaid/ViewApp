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
import AssociationsSetup from 'src/Components/Popup/AssociationsSetup'
import { resolveTableApiQueryFilter } from './TableReport'



function isTable(collectionsArray) {
  const includeTable = []

  collectionsArray.forEach(item => {
    if (item.isTable) {
      includeTable.push(item.collection.key)
    }
  })

  return includeTable
}

const flattenDynamic = (data, SelectedRelatedCollectionsFields) => {
  const collectionsArray = isTable(SelectedRelatedCollectionsFields || [])

  const result = {};


  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        result[key] = "";
      } else if (value[0] && typeof value[0] === 'object') {
        if (key.toLowerCase() === 'contact') {
          // لو array اسمها Contact
          value.forEach(item => {
            Object.entries(item).forEach(([subKey, subValue]) => {
              result[`${subKey}[${key}]`] = subValue ?? "";
            });
          });
        } else {
          // أي array object تانية تتحول form-table[key]
          if (collectionsArray.includes(key)) {
            result[`form-table[${key}]`] = value.map(item => {
              const newItem = {};
              Object.entries(item).forEach(([subKey, subValue]) => {
                newItem[subKey] = subValue ?? false;
              });

              return newItem;
            });
          } else {

            const firstItem = value[0]; // أول عنصر
            if (firstItem) {
              Object.entries(firstItem).forEach(([subKey, subValue]) => {
                // هنا يطلع كل حقل على شكل Field[key]: value

                result[`${subKey}[${key}]`] = subValue ?? "";

              });
            }
          }
        }
      } else {
        // array بسيطة
        result[key] = value.map(v => v ?? false);
      }
    } else if (value && typeof value === 'object') {
      // object عادي
      Object.entries(value).forEach(([subKey, subValue]) => {
        result[`${subKey}[${key}]`] = subValue ?? "";
      });
    } else {
      // primitive
      result[key] = value ?? "";
    }
  });



  return result;
};

// Dnd Kit Sortable Item Component
function SortableGridItem({
  loadingSaveAsDraft,
  refErrorFromTable,
  tabsData,
  filed,
  advancedEdit,
  activeTab,
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
  dataRefWithCollectionId, setActiveTab,
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
  messages,
  sortedLoopWithoutTabs,
  FormType,
  saveAsDraft,
  reloadValue,
  isEntitiesData
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
        tabsData={tabsData}
        loadingBtn={loading}
        input={filed}
        FormType={FormType}
        design={getDesign(filed.id, filed)}
        isEntitiesData={isEntitiesData}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        loadingSaveAsDraft={loadingSaveAsDraft}
        readOnly={disabled}
        disabledBtn={data.type_of_sumbit === 'api' && !data.submitApi}
        refError={refError}
        refErrorFromTable={refErrorFromTable}
        setLayout={setLayout}
        triggerData={triggerData}
        data={data}
        layout={layout}
        onChangeData={onChange}
        saveAsDraft={saveAsDraft}
        dataRef={dataRef}
        dataRefWithCollectionId={dataRefWithCollectionId}
        allFields={sortedLoopWithoutTabs}
        setTriggerData={setTriggerData}
        findValue={tabsData?.[filed?.key] || entitiesData?.[filed?.key] || entitiesData?.[filed?.key]}
        roles={roles}
        advancedEdit={readOnly}
        editMode={advancedEdit}
        reload={reload}
        reloadValue={reloadValue}
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
  pageId,
  advancedEdit,
  entitiesId,
  collectionName,
  pageName,
  FormType,
  isPrint
}) {
  const [getFields, setGetFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [stopSort, setStopSort] = useState(false)
  const [reload, setReload] = useState(0)
  const [errors, setErrors] = useState(false)
  const refError = useRef({})
  const refErrorFromTable = useRef({})
  const dataRef = useRef({})
  const dataRefWithCollectionId = useRef({})
  const [triggerData, setTriggerData] = useState(0)

  const [entitiesData, setEntitiesData] = useState()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState(0)
  const [tabsData, setTabsData] = useState(null)
  const [stopSortLayout, setStopSortLayout] = useState(false)




  useEffect(() => {
    setStopSortLayout(!readOnly ? true : false)
  }, [readOnly])

  useEffect(() => {
    refError.current = {}
    dataRef.current = {}
    refErrorFromTable.current = {}
  }, [activeTab])






  const findActiveTab = data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data?.find((ele, index) => index === activeTab)

  const { pathname, query, push, replace } = useRouter()


  const requestId = query.requestId
  const collection = query.collection
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
          if (item.isTable) {
            const tableKey = 'form-table[' + (item.collection?.key ?? '') + ']'

            const tableInput = {
              ...item.collection,
              nameAr: item.collection.nameAr,
              nameEn: item.collection.nameEn,
              type: "OneToMany",
              fieldCategory: "Associations",
              key: tableKey,
              id: tableKey,
              descriptionEn: JSON.stringify(item.selected),
              validationData: [], options: { source: item.collection.key },
              kind: 'Table'
            }

            return [tableInput]
          }
          const res = await axiosGet(`collection-fields/get?CollectionId=${item.collection.id}`, locale)
          if (res.status) {
            const selectedFields = res.data.filter(field => item.selected.includes(field.key))



            return selectedFields.map(field => ({ ...field, key: field.key + '[' + item.collection.key + ']' }))
          }

          return []
        }) || []),

        axiosGet(`collection-fields/get?CollectionId=${data.collectionId}`, locale).then(res => {
          if (res.status) {


            const filterData = res.data
              .filter(field => data?.selected?.includes(field?.key))

            // .map(field => {
            //   const find = associationsConfig.find(item => item?.key === field?.key)
            //   const filedData = { ...field }
            //   if (find) {

            //     filedData.kind = find.viewType
            //     filedData.descriptionEn = JSON.stringify(find.selectedOptions)
            //     filedData.getDataForm = find.dataSourceType
            //     filedData.externalApi = find.externalApi
            //     filedData.staticData = find.staticData
            //     filedData.selectedValueSend = JSON.stringify(find.selectedValueSend)
            //     filedData.apiHeaders = find.apiHeaders
            //     filedData.body = find.body
            //     filedData.method = find.method
            //     filedData.viewAsInput = find.viewAsInput
            //   }

            //   return field
            // })

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

  const [isEntitiesData, setIsEntitiesData] = useState(false)
  const [loadingEntitiesData, setLoadingEntitiesData] = useState(true)


  useEffect(() => {
    const stopFetchingDataFromApi = data.stopFetchingDataFromApi ?? false
    if (entitiesId !== null && collectionName !== null && collectionName === data.collectionName && entitiesId && !stopFetchingDataFromApi) {
      axiosGet(`generic-entities/${collectionName}/${entitiesId}`, locale).then(res => {
        if (res.status) {
          setEntitiesData(flattenDynamic(res?.data?.entities?.[0], data?.SelectedRelatedCollectionsFields))
          setIsEntitiesData(true)
        }
      }).finally(() => setLoadingEntitiesData(false))
    } else {
      setLoadingEntitiesData(false)
    }
  }, [entitiesId, collectionName, pageName])






  const resolveQueryPlaceholders = useCallback(
    value => {
      if (Array.isArray(value)) {
        return value.map(item => resolveQueryPlaceholders(item))
      }

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, itemValue]) => [key, resolveQueryPlaceholders(itemValue)])
        )
      }

      if (typeof value === 'string') {
        return value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, queryKey) => {
          const queryValue = query?.[queryKey]
          if (Array.isArray(queryValue)) {
            return queryValue[0] ?? ''
          }
          if (queryValue !== undefined && queryValue !== null) {
            return queryValue
          }

          // Fallback to real URL search params when Next router query is not hydrated yet.
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search || '')
            const allValues = params.getAll(queryKey)
            if (allValues.length > 0) {
              return allValues[0] ?? ''
            }
          }

          return ''
        })
      }

      return value
    },
    [query]
  )

  const transformCollectionOutputBeforeSubmit = useCallback(
    (outputData, allDataPayload) => {
      const jsCode = data?.collectionBeforeSubmitJsData?.trim()
      if (!jsCode) {
        return resolveQueryPlaceholders(outputData)
      }

      try {
        const transformFn = new Function('output', 'allData', 'routerQuery', jsCode)
        const transformed = transformFn(outputData, allDataPayload, query)

        if (transformed && typeof transformed === 'object' && !Array.isArray(transformed)) {
          return resolveQueryPlaceholders({ ...outputData, ...transformed })
        }

        return resolveQueryPlaceholders(outputData)
      } catch (error) {
        console.error('collectionBeforeSubmitJsData execution error:', error)
        toast.error(messages?.dialogs?.invalidCode || 'Invalid JS code for submit data')

        return resolveQueryPlaceholders(outputData)
      }
    },
    [data?.collectionBeforeSubmitJsData, messages?.dialogs?.invalidCode, query, resolveQueryPlaceholders]
  )

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
      if (Array.isArray(initialSendData[keyData]) && !keyData.startsWith("form-table[")) {
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

    if (refErrorFromTable.current) {

      for (const key in refErrorFromTable.current) {
        if (refErrorFromTable.current[key]) {
          errors.push(refErrorFromTable.current[key])
        }
      }
    }

    const getBtnCheckErrors = document.querySelectorAll('.check-errors')

    getBtnCheckErrors.forEach(ele => {

      ele.click()
    })

    if (errors.find(ele => typeof ele === 'object')) {

      return setErrors(refError.current)
    }

    let output = {}

    const allData = { ...(tabsData || {}), ...sendData }



    Object.entries(allData).forEach(([key, value]) => {

      // 👈 لو form-table
      if (key.startsWith("form-table[")) {

        const match = key.match(/^form-table\[(.+)\]$/)

        if (match) {

          const arrayName = match[1]

          const tableData = allData[key]

          if (Array.isArray(tableData)) {

            const cleaned = tableData.map(item => {

              const newItem = {}

              Object.entries(item).forEach(([k, v]) => {

                // ❌ نشيل Id
                if (k === "Id") return

                // ❌ نشيل s + أرقام
                if (/^s\d+$/.test(k)) return

                // ❌ نشيل undefined.form-table
                if (k.startsWith("undefined.form-table")) return

                // ❌ نشيل uuid.Anything
                if (/^[a-f0-9-]+\./i.test(k)) return


                // ✅ لو Date نحوله
                if (v instanceof Date && !isNaN(v)) {
                  const localISO = new Date(
                    v.getTime() - v.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 19)

                  newItem[k] = localISO
                } else {
                  newItem[k] = v
                }

              })

              return newItem
            })

            output[arrayName] = cleaned
          }
        }

        return
      }




      // 👇 باقي المعالجة الطبيعية
      const match = key.match(/^(.+)\[(.+)\]$/)

      if (match) {
        const [, mainKey, subKey] = match
        output[subKey] = output[subKey] || {}
        output[subKey][mainKey] = value
      } else {
        if (value instanceof Date && !isNaN(value)) {
          const date = new Date(
            value.getTime() - value.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 19)

          output[key] = date
        } else {
          output[key] = value
        }
      }
    })



    const tabsDataArray = data?.addMoreElement.find(ele => ele.key === 'tabs')?.data ?? [];


    if (tabsDataArray.length > 0 && activeTab + 1 < tabsDataArray.length) {
      setActiveTab(prev => prev + 1)
      setTabsData(prev => ({ ...prev, ...dataRef.current }))
      const getTabId = document.getElementById(`tab-${data.collectionName}`)
      if (getTabId) {
        const yOffset = -100 // علشان يوقف قبل العنصر بـ 100px
        const y = getTabId.getBoundingClientRect().top + window.pageYOffset + yOffset

        window.scrollTo({
          top: y,
          behavior: 'smooth' // أو 'instant' لو عايز بدون animation
        })
      }

      return
    } else {
      output = { ...output }

    }





    setLoading(true)

    const apiCall =
      data.type_of_sumbit === 'api'
        ? data.submitApi
        : `generic-entities/${data.collectionName}/?pageId=${pageId}${requestId ? `&requestId=${requestId}` : ''}`



    const payloadOutput =
      data.type_of_sumbit === 'collection' ? transformCollectionOutputBeforeSubmit(output, allData) : output

    const draftOutput = transformCollectionOutputBeforeSubmit(output, {})
    axiosPost(apiCall, locale, draftOutput, false, false, data.type_of_sumbit !== 'collection' ? true : false)
      .then(res => {
        if (res.status) {
          setReload(prev => prev + 1)
          toast.success(messages.dialogs.dataSentSuccessfully)
          if (data.onSubmit) {
            const evaluatedFn = eval('(' + data?.onSubmit + ')')
            if (handleSubmitEvent) {
              handleSubmitEvent()
            } else {
              evaluatedFn()
            }
          }

          if (data?.redirect) {
            const newHref = resolveTableApiQueryFilter(data.redirect, query)
            push(`/${locale}/${newHref === '/' ? '' : newHref}`)
          }
        }
      })
      .finally(() => setLoading(false))
  }


  const [loadingSaveAsDraft, setLoadingSaveAsDraft] = useState(false)


  const saveAsDraft = async (e, href) => {
    e?.preventDefault()


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

    let output = {}


    const allData = { ...(tabsData || {}), ...sendData }

    Object.entries(allData).forEach(([key, value]) => {

      // 👈 لو form-table
      if (key.startsWith("form-table[")) {

        const match = key.match(/^form-table\[(.+)\]$/)

        if (match) {
          const arrayName = match[1]

          const tableData = dataRef.current[key]

          if (Array.isArray(tableData)) {

            const cleaned = tableData.map(item => {

              const newItem = {}

              Object.entries(item).forEach(([k, v]) => {

                // ❌ نشيل Id
                if (k === "Id") return

                // ❌ نشيل s + أرقام
                if (/^s\d+$/.test(k)) return

                // ❌ نشيل undefined.form-table
                if (k.startsWith("undefined.form-table")) return

                // ❌ نشيل uuid.Anything
                if (/^[a-f0-9-]+\./i.test(k)) return


                // ✅ لو Date نحوله
                if (v instanceof Date && !isNaN(v)) {
                  const localISO = new Date(
                    v.getTime() - v.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 19)

                  newItem[k] = localISO
                } else {
                  newItem[k] = v
                }

              })

              return newItem
            })

            output[arrayName] = cleaned
          }
        }

        return
      }

      // 👇 باقي المعالجة الطبيعية
      const match = key.match(/^(.+)\[(.+)\]$/)

      if (match) {
        const [, mainKey, subKey] = match
        output[subKey] = output[subKey] || {}
        output[subKey][mainKey] = value
      } else {
        if (value instanceof Date && !isNaN(value)) {
          const date = new Date(
            value.getTime() - value.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 19)

          output[key] = date
        } else {
          output[key] = value
        }
      }
    })








    const draftOutput = transformCollectionOutputBeforeSubmit(output, allData)

    console.log(draftOutput, "draftOutput");
    setLoadingSaveAsDraft(true)
    axiosPost(`generic-entities/${data.collectionName}/draft?pageId=${pageId}`, locale, draftOutput).then(res => {
      if (res.status) {


        if (href) {
          push(`/${locale}/${href}?collection=${data.collectionName}&requestId=${res?.data?.Id}&isPrint=true`);
        } else {

          const newRequestId =
            res?.data?.Id ?? res?.id ?? (typeof res?.data === 'string' || typeof res?.data === 'number' ? res.data : null)
          if (newRequestId != null && String(newRequestId) !== '') {
            const newUrl = `/${locale}/${query.page.join('/')}?${new URLSearchParams({
              ...query,
              collection: data.collectionName,
              entityId: String(newRequestId),
            })}`;

            window.history.replaceState(null, '', newUrl);
          }
          toast.success(messages.dialogs.dataSentSuccessfully)
        }
      }
    }).finally(() => setLoadingSaveAsDraft(false))



  }



  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const defaultDesign =
    open?.type === 'new_element'
      ? DefaultStyle(open?.key)
      : DefaultStyle(getTypeFromCollection(open?.type ?? 'SingleText', open?.descriptionAr === 'progress_bar' ? 'progress_bar' : open?.kind))
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
        defaultDesign = DefaultStyle(getTypeFromCollection(field.type, field.descriptionAr === 'progress_bar' ? 'progress_bar' : field.kind || field.descriptionAr))
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
    const fixedKeys = ["tabs", "submit", "back", "saveAsDraft"]
    const sortedIndexMap = new Map(sortedData.map((field, index) => [field.i, index]))


    const sorted = [...items].sort((a, b) => {
      const indexA = sortedIndexMap.get(a.id)
      const indexB = sortedIndexMap.get(b.id)

      return (indexA ?? Infinity) - (indexB ?? Infinity)
    })

    if (stopSortLayout) {
      const tabsElement = addMoreElement.find(ele => ele.key === 'tabs')
      const tabs = tabsElement?.data || []

      if (tabs.length === 0) return sorted

      const layoutYMap = new Map(layout.map(item => [item.i, item.y]))
      const getY = id => layoutYMap.get(id) ?? 9999


      const allRealItemsMeta = sorted.map(ele => ({
        item: ele,
        y: getY(ele.id),
        isFixed: fixedKeys.includes(ele.kind || ele.key),
        fieldId: ele.type === 'new_element' ? ele.id : ele.key
      }))

      // حسب لكل tab أصغر y بين fields بتاعته
      const tabHeaderEntries = tabs.map((tab, tabIndex) => {
        const tabFieldIds = Array.isArray(tab.fields) ? tab.fields : []

        const tabFieldsYValues = allRealItemsMeta
          .filter(ele => !ele.isFixed && tabFieldIds.includes(ele.fieldId))
          .map(ele => ele.y)

        const minY = tabFieldsYValues.length > 0
          ? Math.min(...tabFieldsYValues) - 0.5
          : tabIndex * 1000  // fallback لو tab فاضي

        return {
          item: {
            id: `__tab_header_${tabIndex}`,
            type: '__tab_header__',
            tabName: tab?.[`name_${locale}`] || tab?.name_en || tab?.name_ar || `Tab ${tabIndex + 1}`,
            tabIndex
          },
          y: minY
        }
      })

      const combined = [
        ...allRealItemsMeta.map(ele => ({ item: ele.item, y: ele.y })),
        ...tabHeaderEntries
      ]

      combined.sort((a, b) => a.y - b.y)

      return combined.map(entry => entry.item)
    }


    let lastSort = sorted
    if (isPrint) {
      lastSort = sorted.filter(ele => ele.key !== 'button')
    } else {
      lastSort = sorted.filter(ele =>
        findActiveTab
          ? fixedKeys.includes(ele.kind || ele.key)
            ? true
            : findActiveTab?.fields?.includes(ele.type === 'new_element' ? ele.id : ele.key)
          : true
      )
    }

    return lastSort





  }, [filterSelect, addMoreElement, stopSortLayout, sortedData, layout, locale, isPrint, findActiveTab])

  const sortedLoopWithoutTabs = useMemo(() => {
    const items = [...filterSelect, ...addMoreElement]
    const sortedIndexMap = new Map(sortedData.map((field, index) => [field.i, index]))

    const sorted = [...items].sort((a, b) => {
      const indexA = sortedIndexMap.get(a.id)
      const indexB = sortedIndexMap.get(b.id)

      return (indexA ?? Infinity) - (indexB ?? Infinity)
    })



    if (isPrint) {
      return sorted.filter(sortItem => sortItem.key !== 'button')
    } else {
      return sorted
    }

  }, [filterSelect, addMoreElement, sortedData, isPrint])

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
    if (!over || active.id === over.id) return

    const oldIndex = sortedLoop.findIndex(item => item.id === active.id)
    const newIndex = sortedLoop.findIndex(item => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // نعمل arrayMove على sortedLoop كامل (شاملة virtual headers)
    const newSortedLoop = arrayMove(sortedLoop, oldIndex, newIndex)

    // نشيل الـ virtual tab headers ونبني layout من الـ real items بس
    let yCounter = 0
    const newLayout = []

    newSortedLoop.forEach(item => {
      // تجاهل virtual tab headers في بناء الـ layout
      if (item.type === '__tab_header__') return

      const existingLayout = layout.find(l => l.i === item.id)
      newLayout.push({
        i: item.id,
        x: existingLayout?.x ?? 0,
        y: yCounter,
        w: existingLayout?.w ?? 12,
        h: existingLayout?.h ?? (item.type === 'LongText' ? 1.8 : 1),
        minH: 0
      })
      yCounter++
    })

    setLayout(newLayout)
    onChange({ ...data, layout: newLayout })
  }

  const handleTabReorder = (oldIndex, newIndex) => {
    const tabsElement = data?.addMoreElement?.find(ele => ele.key === 'tabs')
    if (!tabsElement) return

    const addMore = [...(data.addMoreElement || [])]
    const tabsIdx = addMore.findIndex(ele => ele.key === 'tabs')
    if (tabsIdx === -1) return

    const nextTabsEl = { ...addMore[tabsIdx] }
    const nextData = [...(nextTabsEl.data || [])]

    // arrayMove على الـ tabs
    const reordered = arrayMove(nextData, oldIndex, newIndex)
    nextTabsEl.data = reordered
    addMore[tabsIdx] = nextTabsEl

    onChange({ ...data, addMoreElement: addMore })
  }

  const [associationsOpen, setAssociationsOpen] = useState(false)
  const [associationsConfig] = useState(data?.associationsConfig ?? [])



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



  return (
    <div className={`${disabled ? 'text-main' : ''}`}>
      {loading && (
        <div className='fixed inset-0 z-10 flex justify-center items-center w-full h-full bg-white/50'>
          {/* <img src={photo.src} alt='loading' className='w-[25px] h-[25px] scale-150 ' /> */}
          <CircularProgress />
        </div>
      )}

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
      />
      <InputControlDesign
        open={open}
        handleClose={handleClose}
        design={design}
        locale={locale}
        setAssociationsOpen={setAssociationsOpen}

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


        </>
      )}
      {loading ? (
        <div className='h-[300px]  flex justify-center items-center text-2xl font-bold border-2 border-dashed border-main rounded-md'>
          {messages.pleaseSelectDataModel}
        </div>
      ) : loadingEntitiesData ? (
        <div className='h-[300px]  bg-white/50 flex justify-center items-center  border-2 border-dashed border-main rounded-md'>
          <CircularProgress />
        </div>
      ) : (
        <form className={'w-[calc(100%)]'} onClick={(e) => {
          const button = e.target.closest('button')

          if (button?.type === 'submit') {
            return
          } else {
            setErrors(false)
          }

        }} onSubmit={handleSubmit}>

          {/* <TabsComponent data={data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data} setActiveTab={setActiveTab} /> */}
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
                  gap: isPrint ? '0px' : '10px',
                  width: '100%'
                }}
              >
                {sortedLoop.map((filed, i) => {
                  const associationsConfigData = data?.associationsConfig ?? []
                  const find = associationsConfigData.find(item => item?.key === filed?.key)
                  const filedData = { ...filed }
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


                  if (filed.type === '__tab_header__') {
                    const tabsElement = data?.addMoreElement?.find(ele => ele.key === 'tabs')
                    const tabs = tabsElement?.data || []
                    const totalTabs = tabs.length
                    const currentTabIndex = filed.tabIndex

                    return (
                      <div
                        key={filed.id}
                        style={{ gridColumn: 'span 12' }}
                        className='w-full mt-4 mb-1 px-2'
                      >
                        <div className='flex items-center gap-2'>
                          <div className='flex-1 h-px bg-main-color opacity-30' />
                          <span className='text-sm font-semibold text-main-color px-3 py-1 border border-main-color rounded-full'>
                            {filed.tabName}
                          </span>

                          {/* أزرار تحريك الـ tab */}
                          {!readOnly && currentTabIndex !== -1 && (
                            <div className='flex flex-col gap-0.5'>
                              <button
                                type='button'
                                disabled={currentTabIndex === 0}
                                onClick={() => handleTabReorder(currentTabIndex, currentTabIndex - 1)}
                                className='w-5 h-5 flex items-center justify-center text-xs border border-main-color rounded hover:bg-main-color hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                                title={locale === 'ar' ? 'تحريك لأعلى' : 'Move Up'}
                              >
                                ▲
                              </button>
                              <button
                                type='button'
                                disabled={currentTabIndex === totalTabs - 1}
                                onClick={() => handleTabReorder(currentTabIndex, currentTabIndex + 1)}
                                className='w-5 h-5 flex items-center justify-center text-xs border border-main-color rounded hover:bg-main-color hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                                title={locale === 'ar' ? 'تحريك لأسفل' : 'Move Down'}
                              >
                                ▼
                              </button>
                            </div>
                          )}

                          <div className='flex-1 h-px bg-main-color opacity-30' />
                        </div>
                      </div>
                    )
                  }

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
                      tabsData={tabsData}
                      key={filed.id}
                      advancedEdit={advancedEdit}
                      filed={filedData}
                      index={i}
                      readOnly={readOnly}
                      stopSort={stopSort}
                      locale={locale}
                      data={data}
                      getDesign={getDesign}
                      setOpen={setOpen}
                      refError={refError}
                      refErrorFromTable={refErrorFromTable}
                      saveAsDraft={saveAsDraft}
                      loadingSaveAsDraft={loadingSaveAsDraft}
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
                      setActiveTab={setActiveTab}
                      FormType={FormType}
                      activeTab={activeTab}
                      isEntitiesData={isEntitiesData}
                      handleSubmit={handleSubmit}
                      sortedLoopWithoutTabs={sortedLoopWithoutTabs}
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
