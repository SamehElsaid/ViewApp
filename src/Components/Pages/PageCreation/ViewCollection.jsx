/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react'
import { axiosGet, axiosPost, axiosPut } from 'src/Components/axiosCall'
import DisplayField from './DisplayField'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import InputControlDesign from './InputControlDesign'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { DefaultStyle, getTypeFromCollection } from 'src/Components/_Shared'
import { IoMdSettings } from 'react-icons/io'
import { useIntl } from 'react-intl'
import { CircularProgress } from '@mui/material'

const ResponsiveGridLayout = WidthProvider(GridLayout)

export default function ViewCollection({
  data,
  locale,
  onChange,
  readOnly,
  disabled,
  pageId,
  entitiesId,
  collectionName,
  pageName
}) {
  const [getFields, setGetFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [redirect, setRedirect] = useState(false)
  const [reload, setReload] = useState(0)
  const [errors, setErrors] = useState(false)
  const refError = useRef({})
  const dataRef = useRef({})
  const [triggerData, setTriggerData] = useState(0)
  const [loadingEntities, setLoadingEntities] = useState(true)
  const [entitiesData, setEntitiesData] = useState(null)

  const {
    query: { requestId },
    push
  } = useRouter()
  const { messages } = useIntl()

  const [layout, setLayout] = useState()
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
    if (entitiesId !== null && collectionName !== null) {

      axiosGet(`generic-entities/${collectionName}/${entitiesId}`, locale)
        .then(res => {
          if (res.status) {
            setEntitiesData(res.entities?.[0])
          }
        })
        .finally(() => setLoadingEntities(false))
    } else {
      setLoadingEntities(false)
    }
  }, [entitiesId, collectionName, pageName])

  useEffect(() => {
    if (!loading) {
      const layout = [...data.layout]
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

      setLayout(layout)
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
    if (data.type_of_sumbit === '' || (data.type_of_sumbit === 'api' && !data.submitApi)) {
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

    addMoreElement.forEach(ele => {
      const additionalFields = data.additional_fields ?? []
      const additionalFieldFind = additionalFields.find(e => e.key === ele.id)

      if (additionalFieldFind?.roles?.onMount?.isRequired && ele?.type === 'new_element') {
        if (!dataRef?.current?.[ele.id]) {
          refError.current[ele.id] = ['Required']
          errors.push(refError.current[ele.id])
        }
      }

      delete sendData[`${ele.id}`]
    })

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
      data.type_of_sumbit === 'collection'
        ? `generic-entities/${data.collectionName}/?pageId=${pageId}${requestId ? `&requestId=${requestId}` : ''}`
        : data.submitApi

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

  const sortedLoop = [...filterSelect, ...addMoreElement].sort(
    (a, b) =>
      (sortedData.findIndex(f => f.i === a.id) === -1 ? Infinity : sortedData.findIndex(f => f.i === a.id)) -
      (sortedData.findIndex(f => f.i === b.id) === -1 ? Infinity : sortedData.findIndex(f => f.i === b.id))
  )

  return (
    <div className={`${disabled ? 'text-main' : ''}`}>
      {loading && (
        <div className='fixed inset-0 z-10 flex justify-center items-center w-full h-full glass-effect'>
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
      {loading ? (
        <div className='h-[300px]  flex justify-center items-center text-2xl font-bold border-2 border-dashed border-main rounded-md'>
          {messages.pleaseSelectDataModel}
        </div>
      ) : (
        <form className={'w-[calc(100%)]'} onClick={() => setErrors(false)} onSubmit={handleSubmit}>
          <ResponsiveGridLayout
            className='layout'
            layout={layout}
            ref={refTest}
            cols={12}
            rowHeight={71}
            onLayoutChange={newLayout => {
              setLayout(newLayout)
              onChange({ ...data, layout: newLayout })
            }}
            draggableHandle='.drag-handle'
            isResizable={!readOnly}
            isDraggable={!readOnly}
            margin={[10, 10]} // هامش بين العناصر
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

              return (
                <div
                  key={filed.id}
                  className={`relative w-full ${
                    filed.type === 'new_element' ? `s${filed.id}` : 'ss' + filed.id
                  } drag-handle  ${!readOnly ? 'px-2' : ''} ${hoverText || hintText ? '!z-[5555555]' : ''}`}
                >
                  {!readOnly && (
                    <div className='absolute inset-0 z-20 flex || justify-end border-main-color border-dashed border rounded-md'>
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
                        className='w-[30px] || h-[30px] hover:bg-main-color hover:text-white duration-200 || rounded-lg || shadow-2xl text-xl flex || items-center justify-center bg-white border-main-color border'
                      >
                        <IoMdSettings />
                      </button>
                    </div>
                  )}

                  <DisplayField
                    handleSubmit={handleSubmit}
                    input={filed}
                    setRedirect={setRedirect}
                    isRedirect={data.redirect === '{{redirect}}'}
                    design={getDesign(filed.id, filed)}
                    readOnly={disabled}
                    disabledBtn={!data.type_of_sumbit || (data.type_of_sumbit === 'api' && !data.submitApi)}
                    refError={refError}
                    setLayout={setLayout}
                    findValue={entitiesData?.[filed?.key]}
                    triggerData={triggerData}
                    data={data}
                    layout={layout}
                    onChangeData={onChange}
                    dataRef={dataRef}
                    setTriggerData={setTriggerData}
                    roles={roles}
                    reload={reload}
                    errorView={errors?.[filed.type === 'new_element' ? filed.id : filed.key]?.[0]}
                    findError={
                      errors && typeof errors?.[filed.type === 'new_element' ? filed.id : filed.key] === 'object'
                    }
                  />
                </div>
              )
            })}
          </ResponsiveGridLayout>
        </form>
      )}
    </div>
  )
}
