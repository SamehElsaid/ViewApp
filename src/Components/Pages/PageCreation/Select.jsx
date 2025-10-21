/* eslint-disable react-hooks/exhaustive-deps */
import {
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Box } from '@mui/system'
import AssociationsSetup from 'src/Components/Popup/AssociationsSetup'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import Collapse from '@kunukn/react-collapse'
import { axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import CloseNav from './CloseNav'
import IconifyIcon from 'src/Components/icon'
import { MdDeleteOutline } from 'react-icons/md'
import JsEditorOnSubmit from 'src/Components/FormCreation/PageCreation/jsEditorOnSubmit'

function Select({ onChange, data, type, buttonRef, title }) {
  const { locale, messages } = useIntl()
  const [collection, setCollection] = useState('')
  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [getFields, setGetFields] = useState([])
  const [SelectedRelatedCollectionsFields, setSelectedRelatedCollectionsFields] = useState([])

  useEffect(() => {
    setLoadingCollection(true)
    axiosGet(`data-source/get`, locale)
      .then(res => {
        if (res.status) {
          onChange({
            ...data,
            data_source_id: res.data[0].id
          })
        }
      })
      .finally(() => {
        setLoadingCollection(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, data.data_source_id])

  useEffect(() => {
    if (!data.data_source_id) return
    setLoadingCollection(true)
    axiosGet(`collections/get/?dataSourceId=${data.data_source_id}`, locale)
      .then(res => {
        if (res.status) {
          setOptionsCollection(res.data ?? [])
        } else {
          setOptionsCollection([])
        }
      })
      .finally(() => {
        setLoadingCollection(false)
      })
  }, [locale, data.data_source_id])
  const addMoreData = data?.addMoreElement ?? []

  useEffect(() => {
    if (data.collectionId) {
      axiosGet(`collections/get-by-id?id=${data.collectionId}`, locale).then(res => {
        if (res.status) {
          if (res.data?.id) {
            const loadingToast = toast.loading(messages.dialogs.loading)
            axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale)
              .then(res => {
                if (res.status) {
                  setGetFields(res.data)
                }
              })
              .finally(() => {
                toast.dismiss(loadingToast)
              })
          }
          setCollection(res.data)
        }
      })
    }
  }, [locale, data.collectionId])

  useEffect(() => {
    if (data.selected) {
      setSelectedOptions(data.selected)
    }
  }, [data.selected])

  const handleInputChange = async (event, value) => {
    try {
      const res = await axiosGet(`collections/get/?dataSourceId=${data.data_source_id}`, locale)
      if (res.status) {
        setOptionsCollection(res.data ?? [])
      } else {
        setCollection('')
      }
    } finally {
      setLoadingCollection(false)
    }
  }

  const [associationsOpen, setAssociationsOpen] = useState(false)
  const [associationsConfig, setAssociationsConfig] = useState(data?.associationsConfig || [])

  const [singleTextChoice, setSingleTextChoice] = useState(null)

  const handleChange = (event, fieldCategory, skipCheck, field) => {
    // const
    const { value, checked } = event.target
    const isChecked = skipCheck || checked

    console.log(isChecked && fieldCategory === 'Associations')
    if (fieldCategory === 'Associations' && isChecked) {
      setAssociationsOpen({ key: event.target.value, source: field?.options?.source, field })

      return
    }

    // if(filed)
    console.log(field)
    if (field?.type === 'SingleText' && isChecked) {
      setSingleTextChoice({ value, field, fieldCategory })

      return
    }

    console.log(isChecked, value)
    setSelectedOptions(prevSelected =>
      isChecked ? [...prevSelected, value] : prevSelected.filter(item => item !== value)
    )
    const selected = isChecked ? [...selectedOptions, value] : selectedOptions.filter(item => item !== value)

    const oldAdditionalFields = data?.additional_fields ?? []
    const filteredAdditionalFields = oldAdditionalFields.filter(inp => inp.key !== field?.id)

    console.log(filteredAdditionalFields, field)
    if (skipCheck) {
      console.log(skipCheck)
      onChange({
        ...data,
        selected,
        associationsConfig: skipCheck,
        additional_fields: filteredAdditionalFields,
        type_of_sumbit: data.type_of_sumbit === 'collection' ? '' : data.type_of_sumbit
      })
    } else {
      onChange({
        ...data,
        selected,
        additional_fields: filteredAdditionalFields,
        type_of_sumbit: data.type_of_sumbit === 'collection' ? '' : data.type_of_sumbit
      })
    }
  }

  const [addMoreElement] = useState([
    { name_ar: 'مربع الاختيار', name_en: 'CheckBox', key: 'check_box' },
    { name_ar: 'Button', name_en: 'Button', key: 'button' },
    { name_ar: 'التبويبات', name_en: 'Tabs', key: 'tabs' },
    { name_ar: 'نص', name_en: 'Text', key: 'text' }
  ])

  const [moreElement, setMoreElement] = useState('')
  useEffect(() => {
    if (addMoreData.length === 0) {
      onChange({
        ...data,
        addMoreElement: [
          ...addMoreData,
          {
            name_ar: 'ارسال',
            name_en: 'Submit',
            key: 'button',
            type: 'new_element',
            kind: 'submit',
            id: 's' + new Date().getTime()
          }
        ]
      })
    }
  }, [addMoreData.length])

  const [relatedCollections, setRelatedCollections] = useState([])

  // useEffect(() => {
  //   if (collection?.id) {

  //   }
  // }, [locale, collection?.id])

  const [relatedCollectionsFields, setRelatedCollectionsFields] = useState([])

  useEffect(() => {
    if (data?.relatedCollections?.length > 0) {
      const loadingToast = toast.loading(messages.dialogs.loading)
      Promise.all(
        data.relatedCollections.map(async item => {
          const res = await axiosGet(`collection-fields/get?CollectionId=${item.id}`, locale)
          if (res.status) {
            return { collection: item, fields: res.data }
          }

          return null
        })
      )
        .then(results => {
          const validResults = results.filter(Boolean)
          setRelatedCollectionsFields(validResults)
        })
        .finally(() => {
          toast.dismiss(loadingToast)
        })
    }
  }, [data?.relatedCollections?.length])

  useEffect(() => {
    setSelectedRelatedCollectionsFields(data.SelectedRelatedCollectionsFields ?? [])
  }, [data.SelectedRelatedCollectionsFields])

  return (
    <div>
      <div className=''>
        <CloseNav text={title} buttonRef={buttonRef} />
      </div>
      <AssociationsSetup
        open={associationsOpen}
        onClose={() => {
          setAssociationsOpen(false)
        }}
        initialConfig={associationsConfig}
        onSave={config => {
          console.log(config)
          let newConfig = data?.associationsConfig ?? []
          console.log(newConfig, 'newConfig')

          const found = newConfig.find(item => item.key === config.key)
          if (found) {
            newConfig = newConfig.map(item => (item.key === config.key ? config : item))
          } else {
            newConfig = [...newConfig, config]
          }

          setSelectedOptions(prevSelected => [...prevSelected, config.key])

          handleChange({ target: { value: config.key } }, '', newConfig)

          // onChange({ ...data, associationsConfig: associationsConfig })
        }}
      />

      <Dialog open={Boolean(singleTextChoice)} onClose={() => setSingleTextChoice(null)} fullWidth maxWidth='xs'>
        <DialogTitle>{messages?.dialogs?.chooseAction || 'Choose action'}</DialogTitle>
        <DialogContent>
          {messages?.dialogs?.singleTextChoice || 'How do you want to use this SingleText?'}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              const value = singleTextChoice.value

              // proceed normally as checked
              const newSelected = selectedOptions.includes(value) ? selectedOptions : [...selectedOptions, value]

              setSelectedOptions(newSelected)
              const associationsConfig = data?.associationsConfig ?? []
              const filteredAssociationsConfig = associationsConfig.filter(item => item.key !== value)
              onChange({
                ...data,
                selected: newSelected,
                associationsConfig: filteredAssociationsConfig,
                type_of_sumbit: data.type_of_sumbit === 'collection' ? '' : data.type_of_sumbit
              })
              setSingleTextChoice(null)
            }}
          >
            {messages?.dialogs?.normalbtn || 'Normal'}
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              const { value, field } = singleTextChoice
              setAssociationsOpen({ key: value, source: field?.options?.source, field, type: 'normal' })
              setSingleTextChoice(null)
            }}
          >
            {messages?.dialogs?.convertToAssociations || 'Convert to Associations'}
          </Button>
        </DialogActions>
      </Dialog>

      <form
        className='flex flex-col p-4 h-full'
        onSubmit={e => {
          e.preventDefault()
        }}
      >
        <div className='mb-4'></div>
        <Autocomplete
          options={loadingCollection ? [] : optionsCollection}
          getOptionLabel={option => (locale === 'ar' ? option.nameAr : option.nameEn) || ''}
          loading={loadingCollection}
          onInputChange={handleInputChange}
          value={collection}
          onChange={(e, value) => {
            setCollection(value)
            setRelatedCollections([])
            setRelatedCollectionsFields([])
            onChange({
              ...data,
              collectionId: value?.id,
              collectionName: value?.key,
              selected: [],
              sortWithId: false,
              relatedCollections: [],
              SelectedRelatedCollectionsFields: []
            })
          }}
          renderInput={params => (
            <TextField
              {...params}
              label={messages.dialogs.selectDataModel}
              variant='outlined'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCollection ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) =>
            option.nameEn !== collection?.nameEn ? (
              <Box sx={{ direction: locale === 'ar' ? 'rtl' : '' }} component='li' {...props}>
                {locale === 'ar' ? option.nameAr : option.nameEn}
              </Box>
            ) : null
          }
        />

        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(collection?.nameEn)}>
          <div className='mt-4'>
            <FormControl component='fieldset' fullWidth>
              <FormLabel component='legend'>{messages.View_Value}</FormLabel>
              <div className='!flex !flex-row !flex-wrap gap-2'>
                {getFields?.map(value => {
                  const dataValidations = {}
                  value.validationData.forEach(item => {
                    dataValidations[item.ruleType] = item.parameters
                  })

                  return (
                    <FormControlLabel
                      key={value.key}
                      className='!w-fit capitalize'
                      control={
                        <>
                          <Checkbox
                            value={value.key}
                            checked={selectedOptions.includes(value.key)}
                            onChange={e => {
                              handleChange(e, value.fieldCategory, false, value)
                            }}
                          />
                        </>
                      }
                      label={
                        <>
                          {value.key} {dataValidations?.Required ? <span className='text-red-500'>*</span> : ''}
                        </>
                      }
                    />
                  )
                })}
              </div>
            </FormControl>
          </div>
          {!type && (
            <div className='mt-4 border-2 border-main-color border-dashed p-2 rounded-md'>
              <div className='flex justify-end items-center mb-2'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    setRelatedCollections([])
                    const loadingToast = toast.loading(messages.dialogs.loading)
                    axiosGet(`collections/get-related-collections?id=${collection.id}`, locale)
                      .then(res => {
                        if (res.status) {
                          setRelatedCollections(res.data ?? [])
                        }
                      })
                      .finally(() => {
                        toast.dismiss(loadingToast)
                      })
                  }}
                >
                  {messages.dialogs.getRelatedCollections}
                </Button>
              </div>
              <TextField
                select
                fullWidth
                value={null}
                label={messages.dialogs.addSuBForm}
                id='select-helper'
                variant='filled'
                onChange={e => {
                  const oldRelatedCollections = data?.relatedCollections ?? []
                  const foundRelatedCollections = relatedCollections.find(item => item.key === e.target.value)
                  const findOldRelatedCollections = oldRelatedCollections.find(item => item.key === e.target.value)
                  if (findOldRelatedCollections) {
                    toast.error(messages.dialogs.relatedCollectionAlreadyExists)

                    return
                  }
                  onChange({ ...data, relatedCollections: [...oldRelatedCollections, foundRelatedCollections] })
                }}
              >
                {relatedCollections.map((item, i) => (
                  <MenuItem value={item.key} key={i}>
                    {item?.key}
                  </MenuItem>
                ))}
              </TextField>

              <Collapse
                transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                isOpen={Boolean(data.relatedCollections?.length > 0)}
              >
                <div className='flex flex-col gap-2 my-3 '>
                  {relatedCollectionsFields?.map((item, i) => (
                    <div key={i} className='border-2 border-main-color border-dashed p-2 rounded-md'>
                      <div className='flex justify-between items-center gap-5'>
                        <div className=''>{item.collection.key}</div>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => {
                            onChange({
                              ...data,
                              relatedCollections: data.relatedCollections.filter(
                                items => items.key !== item?.collection?.key
                              ),
                              SelectedRelatedCollectionsFields: SelectedRelatedCollectionsFields.filter(
                                items => items.collection.key !== item?.collection?.key
                              )
                            })
                          }}
                        >
                          <MdDeleteOutline />
                        </IconButton>
                      </div>
                      <div className=''>
                        <FormControl component='fieldset' fullWidth>
                          <FormLabel component='legend'>{messages.View_Value}</FormLabel>
                          <div className='!flex !flex-row !flex-wrap gap-2'>
                            {item.fields?.map(value => {
                              const dataValidations = {}
                              value.validationData.forEach(item => {
                                dataValidations[item.ruleType] = item.parameters
                              })

                              const fieldSelected = SelectedRelatedCollectionsFields?.find(
                                s => s.collection.key === item.collection.key
                              )

                              return (
                                <FormControlLabel
                                  key={value.key}
                                  className='!w-fit capitalize'
                                  control={
                                    <>
                                      <Checkbox
                                        value={value.key}
                                        checked={fieldSelected?.selected?.includes(value.key)}
                                        onChange={e => {
                                          setSelectedRelatedCollectionsFields(prev => {
                                            const fieldSelected = prev.find(
                                              itemS => itemS.collection.key === item.collection.key
                                            )

                                            // ✅ لو الـ collection موجودة
                                            if (fieldSelected) {
                                              const isAlreadySelected = fieldSelected.selected.includes(value.key)

                                              // تحديث الـ selected داخل الـ collection المحددة
                                              const updated = prev.map(itemS => {
                                                if (itemS.collection.key === item.collection.key) {
                                                  return {
                                                    ...itemS,
                                                    selected: isAlreadySelected
                                                      ? itemS.selected.filter(k => k !== value.key) // شيل القيمة لو موجودة
                                                      : [...itemS.selected, value.key] // ضيف القيمة لو مش موجودة
                                                  }
                                                }

                                                return itemS
                                              })

                                              onChange({ ...data, SelectedRelatedCollectionsFields: updated })

                                              return updated
                                            }

                                            // ✅ لو الـ collection مش موجودة، أضفها جديدة
                                            onChange({
                                              ...data,
                                              SelectedRelatedCollectionsFields: [
                                                ...prev,
                                                { collection: item.collection, selected: [value.key] }
                                              ]
                                            })

                                            return [...prev, { collection: item.collection, selected: [value.key] }]
                                          })
                                        }}
                                      />
                                    </>
                                  }
                                  label={
                                    <>
                                      {value.key}{' '}
                                      {dataValidations?.Required ? <span className='text-red-500'>*</span> : ''}
                                    </>
                                  }
                                />
                              )
                            })}
                          </div>
                        </FormControl>
                      </div>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          )}

          <div className='mt-4'></div>
          {!type ? (
            <>
              <TextField
                select
                fullWidth
                value={data.type_of_sumbit || ''}
                onChange={e => {
                  onChange({ ...data, type_of_sumbit: e.target.value })
                }}
                label={messages.dialogs.typeOfSubmit}
                variant='filled'
              >
                <MenuItem value={'collection'}>{messages.dialogs.thisDataModel}</MenuItem>
                <MenuItem value={'api'}>{messages.dialogs.otherApi}</MenuItem>
              </TextField>
              <Collapse
                transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                isOpen={Boolean(data.type_of_sumbit === 'api')}
              >
                <TextField
                  fullWidth
                  value={data.submitApi || ''}
                  onChange={e => onChange({ ...data, submitApi: e.target.value })}
                  label={messages.dialogs.submitToApi}
                  variant='filled'
                />
              </Collapse>

              <div className='pt-2 border-2 rounded-md mt-5 p-2 border-dashed border-main-color'>
                <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.onSubmit}</h2>
                <TextField
                  fullWidth
                  value={data.redirect || ''}
                  onChange={e => onChange({ ...data, redirect: e.target.value })}
                  label={messages.dialogs.redirectTo}
                  variant='filled'
                />
                <div className='mt-2'></div>
                <JsEditorOnSubmit jsCode={data.onSubmit ?? ''} onChange={onChange} data={data} />
              </div>

              <div className='p-2 mt-4 rounded-md border-2 border-gray-300'>
                <div className='text-lg font-bold'>{messages.dialogs.addMoreElement}</div>

                <TextField
                  select
                  fullWidth
                  value={moreElement}
                  label={messages.dialogs.addMoreElement}
                  id='select-helper'
                  variant='filled'
                  onChange={e => {
                    setMoreElement(e.target.value)
                  }}
                >
                  {addMoreElement.map((item, i) => (
                    <MenuItem value={item.key} key={i}>
                      {item?.[`name_${locale}`]}
                    </MenuItem>
                  ))}
                </TextField>
                <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(moreElement)}>
                  <div className='flex justify-center my-3'>
                    <Button
                      onClick={() => {
                        if (moreElement) {
                          if (moreElement === 'check_box') {
                            const oldAddMoreElement = data?.addMoreElement ?? []
                            onChange({
                              ...data,
                              addMoreElement: [
                                ...oldAddMoreElement,
                                {
                                  name_ar: 'مربع الاختيار',
                                  name_en: 'CheckBox',
                                  key: 'check_box',
                                  type: 'new_element',
                                  id: 's' + new Date().getTime()
                                }
                              ]
                            })
                          }
                          if (moreElement === 'button') {
                            const oldAddMoreElement = data?.addMoreElement ?? []
                            onChange({
                              ...data,
                              addMoreElement: [
                                ...oldAddMoreElement,
                                {
                                  name_ar: 'Button',
                                  name_en: 'Button',
                                  key: 'button',
                                  type: 'new_element',
                                  id: 's' + new Date().getTime()
                                }
                              ]
                            })
                            setMoreElement('')
                          }
                          if (moreElement === 'tabs') {
                            const oldAddMoreElement = data?.addMoreElement ?? []
                            onChange({
                              ...data,
                              addMoreElement: [
                                ...oldAddMoreElement,
                                {
                                  name_ar: 'التبويبات',
                                  name_en: 'Tabs',
                                  key: 'tabs',
                                  type: 'new_element',
                                  data: [
                                    {
                                      name_ar: 'التبويب الاول',
                                      name_en: 'Tab 1',
                                      link: '',
                                      active: true
                                    },
                                    {
                                      name_ar: 'التبويب الثاني',
                                      name_en: 'Tab 2',
                                      link: '',
                                      active: false
                                    }
                                  ],
                                  id: 's' + new Date().getTime()
                                }
                              ]
                            })
                            setMoreElement('')
                          }
                          if (moreElement === 'text') {
                            const oldAddMoreElement = data?.addMoreElement ?? []
                            onChange({
                              ...data,
                              addMoreElement: [
                                ...oldAddMoreElement,
                                {
                                  name_ar: 'نص',
                                  name_en: 'Text',
                                  key: 'text_content',
                                  type: 'new_element',
                                  id: 's' + new Date().getTime()
                                }
                              ]
                            })
                            setMoreElement('')
                          }
                          toast.success(messages.dialogs.elementAdded)
                        }
                      }}
                      variant='contained'
                      color='primary'
                    >
                      {messages.dialogs.add}
                    </Button>
                  </div>
                </Collapse>
                <Collapse
                  transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                  isOpen={Boolean(data?.addMoreElement?.filter(ele => ele.kind !== 'submit')?.length > 0)}
                >
                  <div className='flex flex-col gap-2 my-3'>
                    {data?.addMoreElement
                      ?.filter(ele => ele.kind !== 'submit')
                      ?.map(item => (
                        <div key={item.id}>
                          <div className='flex justify-between items-center p-2 rounded-md border border-dashed border-main-color'>
                            <div className='text-sm'>
                              <span className='text-main-color me-2'>
                                (
                                {addMoreElement.find(ele => ele.key.toLowerCase() === item.key.toLowerCase())?.[
                                  `name_${locale}`
                                ] || messages.text}
                                )
                              </span>
                              {item?.[`name_${locale}`]}{' '}
                            </div>
                            <Tooltip title={messages.delete}>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => {
                                  const oldAddMoreElement = data?.addMoreElement ?? []
                                  onChange({
                                    ...data,
                                    addMoreElement: oldAddMoreElement.filter(e => e.id !== item.id)
                                  })
                                }}
                              >
                                <IconifyIcon icon='tabler:trash' />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                  </div>
                </Collapse>
              </div>
            </>
          ) : (
            <>
              <TextField
                select
                fullWidth
                value={data.kind}
                onChange={e => {
                  onChange({
                    ...data,
                    kind: e.target.value
                  })
                }}
                label={messages.dialogs.typeOfTable}
                variant='filled'
              >
                <MenuItem value={'view-data'}>{messages.dialogs.viewData}</MenuItem>
                <MenuItem value={'form-table'}>{messages.dialogs.submitData}</MenuItem>
              </TextField>
              <Collapse
                transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                isOpen={Boolean(data.kind === 'form-table')}
              >
                <TextField
                  select
                  fullWidth
                  value={data.type_of_sumbit || ''}
                  onChange={e => {
                    onChange({ ...data, type_of_sumbit: e.target.value })
                  }}
                  label={messages.dialogs.typeOfSubmit}
                  variant='filled'
                >
                  <MenuItem value={'collection'}>{messages.dialogs.thisCollection}</MenuItem>
                  <MenuItem value={'api'}>{messages.dialogs.otherApi}</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  value={data.redirect || ''}
                  onChange={e => onChange({ ...data, redirect: e.target.value })}
                  label={messages.dialogs.redirectTo}
                  variant='filled'
                />

                <Collapse
                  transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                  isOpen={Boolean(data.type_of_sumbit === 'api')}
                >
                  <TextField
                    fullWidth
                    value={data.submitApi || ''}
                    onChange={e => onChange({ ...data, submitApi: e.target.value })}
                    label={messages.dialogs.submitToApi}
                    variant='filled'
                  />
                </Collapse>

                <div className='p-2 mt-4 rounded-md border-2 border-gray-300'>
                  <div className='text-lg font-bold'>{messages.dialogs.addMoreElement}</div>

                  <TextField
                    select
                    fullWidth
                    value={moreElement}
                    label={messages.dialogs.addMoreElement}
                    id='select-helper'
                    variant='filled'
                    onChange={e => {
                      setMoreElement(e.target.value)
                    }}
                  >
                    {addMoreElement.map((item, i) => (
                      <MenuItem value={item.key} key={i}>
                        {item?.[`name_${locale}`]}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(moreElement)}>
                    <div className='flex justify-center my-3'>
                      <Button
                        onClick={() => {
                          if (moreElement) {
                            if (moreElement === 'check_box') {
                              const oldAddMoreElement = data?.addMoreElement ?? []
                              onChange({
                                ...data,
                                addMoreElement: [
                                  ...oldAddMoreElement,
                                  {
                                    name_ar: 'مربع الاختيار',
                                    name_en: 'CheckBox',
                                    key: 'check_box',
                                    type: 'new_element',
                                    id: 's' + new Date().getTime()
                                  }
                                ]
                              })
                            }
                            if (moreElement === 'button') {
                              const oldAddMoreElement = data?.addMoreElement ?? []
                              onChange({
                                ...data,
                                addMoreElement: [
                                  ...oldAddMoreElement,
                                  {
                                    name_ar: 'Button',
                                    name_en: 'Button',
                                    key: 'button',
                                    type: 'new_element',
                                    id: 's' + new Date().getTime()
                                  }
                                ]
                              })
                              setMoreElement('')
                            }
                            if (moreElement === 'tabs') {
                              const oldAddMoreElement = data?.addMoreElement ?? []
                              onChange({
                                ...data,
                                addMoreElement: [
                                  ...oldAddMoreElement,
                                  {
                                    name_ar: 'التبويبات',
                                    name_en: 'Tabs',
                                    key: 'tabs',
                                    type: 'new_element',
                                    data: [
                                      {
                                        name_ar: 'التبويب الاول',
                                        name_en: 'Tab 1',
                                        link: 'https://www.google.com',
                                        active: true
                                      },
                                      {
                                        name_ar: 'التبويب الثاني',
                                        name_en: 'Tab 2',
                                        link: 'https://www.google.com',
                                        active: false
                                      }
                                    ],
                                    id: 's' + new Date().getTime()
                                  }
                                ]
                              })
                              setMoreElement('')
                            }
                            if (moreElement === 'text') {
                              const oldAddMoreElement = data?.addMoreElement ?? []
                              onChange({
                                ...data,
                                addMoreElement: [
                                  ...oldAddMoreElement,
                                  {
                                    name_ar: 'نص',
                                    name_en: 'Text',
                                    key: 'text',
                                    type: 'new_element',
                                    id: 's' + new Date().getTime()
                                  }
                                ]
                              })
                              setMoreElement('')
                            }
                            toast.success(messages.dialogs.elementAdded)
                          }
                        }}
                        variant='contained'
                        color='primary'
                      >
                        {messages.dialogs.add}
                      </Button>
                    </div>
                  </Collapse>
                  <Collapse
                    transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                    isOpen={Boolean(data?.addMoreElement?.length > 0)}
                  >
                    <div className='flex flex-col gap-2 my-3'>
                      {data?.addMoreElement?.map(item => (
                        <div key={item.id}>
                          <div className='flex justify-between items-center'>
                            <div className='text-sm'>{item?.[`name_${locale}`]}</div>
                            <Button
                              variant='outlined'
                              color='error'
                              onClick={() => {
                                const oldAddMoreElement = data?.addMoreElement ?? []
                                onChange({
                                  ...data,
                                  addMoreElement: oldAddMoreElement.filter(e => e.id !== item.id)
                                })
                              }}
                            >
                              {messages.dialogs.delete}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </div>
              </Collapse>

              <h2 className='text-lg font-bold'>{messages.dialogs.actions}</h2>
              <FormControlLabel
                key={data.edit}
                className='!w-fit capitalize'
                control={
                  <Checkbox
                    value={data.edit}
                    checked={data.edit}
                    onChange={() => {
                      onChange({ ...data, edit: data.edit ? false : true })
                    }}
                  />
                }
                label={messages.dialogs.editData}
              />
              <FormControlLabel
                key={data.delete}
                className='!w-fit capitalize'
                control={
                  <Checkbox
                    value={data.delete}
                    checked={data.delete}
                    onChange={() => {
                      onChange({ ...data, delete: data.delete ? false : true })
                    }}
                  />
                }
                label={messages.dialogs.deleteData}
              />
            </>
          )}
        </Collapse>
      </form>
    </div>
  )
}

export default Select
