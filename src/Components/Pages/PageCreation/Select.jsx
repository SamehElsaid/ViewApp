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
import AssociationsSetup from 'src/Components/Popup/AssociationsSetup'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import Collapse from '@kunukn/react-collapse'
import { axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import dynamic from 'next/dynamic'
import CloseNav from './CloseNav'
import IconifyIcon from 'src/Components/icon'
import { MdDeleteOutline } from 'react-icons/md'
import JsEditorOnSubmit from 'src/Components/FormCreation/PageCreation/jsEditorOnSubmit'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

function Select({ onChange, data, buttonRef, title, tableType }) {
  const { locale, messages } = useIntl()
  const [collection, setCollection] = useState('')
  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [getFields, setGetFields] = useState([])
  const [SelectedRelatedCollectionsFields, setSelectedRelatedCollectionsFields] = useState([])
  const [type, setType] = useState()

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

  const [addNewTabDialogOpen, setAddNewTabDialogOpen] = useState(false)
  const [newTabNameAr, setNewTabNameAr] = useState('')
  const [newTabNameEn, setNewTabNameEn] = useState('')
  const [editingTabIndex, setEditingTabIndex] = useState(null)

  const handleChange = (event, fieldCategory, skipCheck, field, addMoreElement = []) => {



    // const
    const { value, checked } = event.target
    const isChecked = skipCheck || checked

    if (fieldCategory === 'Associations' && type !== 'table' && isChecked) {
      setAssociationsOpen({ key: event.target.value, source: field?.options?.source, field })

      return
    }

    // if(filed)
    if (field?.type === 'SingleText' && isChecked && type !== 'table') {
      setSingleTextChoice({ value, field, fieldCategory })

      return
    }

    setSelectedOptions(prevSelected =>
      isChecked ? [...prevSelected, value] : prevSelected.filter(item => item !== value)
    )
    const selected = isChecked ? [...selectedOptions, value] : selectedOptions.filter(item => item !== value)

    const oldAdditionalFields = data?.additional_fields ?? []
    const filteredAdditionalFields = oldAdditionalFields.filter(inp => inp.key !== field?.id)

    // Tabs assignment logic removed from here; use the inline dropdowns instead
    const addMoreElementLocal = addMoreElement?.length > 0 ? addMoreElement : [...(data?.addMoreElement ?? [])]

    if (skipCheck) {
      onChange({
        ...data,
        selected,
        associationsConfig: skipCheck,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    } else {
      onChange({
        ...data,
        selected,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    }
  }

  const [addMoreElement] = useState([
    { name_ar: 'مربع الاختيار', name_en: 'CheckBox', key: 'check_box' },
    { name_ar: 'زر', name_en: 'Button', key: 'button' },
    { name_ar: 'التبويبات', name_en: 'Tabs', key: 'tabs' },
    { name_ar: 'نص', name_en: 'Text', key: 'text' },
    { name_ar: 'السابق', name_en: 'Previous', key: 'prev' },
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
          let newConfig = data?.associationsConfig ?? []

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
              const value = singleTextChoice?.value || ''

              // proceed normally as checked
              const newSelected = selectedOptions.includes(value) ? selectedOptions : [...selectedOptions, value]

              setSelectedOptions(newSelected)
              const associationsConfig = data?.associationsConfig ?? []
              const filteredAssociationsConfig = associationsConfig.filter(item => item.key !== value)
              onChange({
                ...data,
                selected: newSelected,
                associationsConfig: filteredAssociationsConfig
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

      <Dialog
        open={addNewTabDialogOpen}
        onClose={() => {
          setAddNewTabDialogOpen(false)
          setEditingTabIndex(null)
        }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>
          {editingTabIndex !== null
            ? locale === 'ar'
              ? 'تعديل التبويب'
              : 'Edit Tab'
            : 'Add New Tab'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={locale === 'ar' ? 'اسم التبويب (عربي)' : 'Tab Name (Arabic)'}
            value={newTabNameAr}
            variant='filled'
            onChange={e => setNewTabNameAr(e.target.value)}
            fullWidth
            size='small'
          />
          <TextField

            variant='filled'
            label={locale === 'ar' ? 'اسم التبويب (إنجليزي)' : 'Tab Name (English)'}
            value={newTabNameEn}
            onChange={e => setNewTabNameEn(e.target.value)}
            fullWidth
            size='small'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNewTabDialogOpen(false)}>{messages?.cancel || 'Cancel'}</Button>
          <Button
            variant='contained'
            onClick={() => {
              const addMore = [...(data.addMoreElement || [])]
              const tabsIdx = addMore.findIndex(ele => ele.key === 'tabs')

              if (editingTabIndex !== null && tabsIdx !== -1) {
                const nextTabsEl = { ...addMore[tabsIdx] }
                const currentData = [...(nextTabsEl.data || [])]
                currentData[editingTabIndex] = {
                  ...currentData[editingTabIndex],
                  name_ar: newTabNameAr.trim() || currentData[editingTabIndex].name_ar || 'تبويب جديد',
                  name_en: newTabNameEn.trim() || currentData[editingTabIndex].name_en || 'New Tab'
                }
                nextTabsEl.data = currentData
                addMore[tabsIdx] = nextTabsEl
                onChange({ ...data, addMoreElement: addMore })
                setAddNewTabDialogOpen(false)
                setNewTabNameAr('')
                setNewTabNameEn('')
                setEditingTabIndex(null)

                return
              }

              const newTab = {
                id: 'tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
                name_ar: newTabNameAr.trim() || 'تبويب جديد',
                name_en: newTabNameEn.trim() || 'New Tab',
                link: '',
                active: false,
                fields: []
              }
              if (tabsIdx === -1) {
                addMore.push({
                  name_ar: 'التبويبات',
                  name_en: 'Tabs',
                  key: 'tabs',
                  type: 'new_element',
                  id: 'tabs-' + Date.now(),
                  data: [newTab]
                })
              } else {
                const nextTabsEl = { ...addMore[tabsIdx] }
                nextTabsEl.data = [...(nextTabsEl.data || []), newTab]
                addMore[tabsIdx] = nextTabsEl
              }
              onChange({ ...data, addMoreElement: addMore })
              setAddNewTabDialogOpen(false)
              setNewTabNameAr('')
              setNewTabNameEn('')
              setEditingTabIndex(null)
            }}
          >
            {editingTabIndex !== null ? (messages?.save || 'Save') : (messages?.create || 'Create')}
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
          getOptionLabel={option => option?.key || ''}
          loading={loadingCollection}
          onInputChange={handleInputChange}
          value={collection || ''}
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
        />

        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(collection?.nameEn)}>

          {!tableType &&

            <div className='flex justify-end items-center mt-2'>
              <Button
                variant='contained'
                size='small'
                onClick={() => {
                  setEditingTabIndex(null)
                  setNewTabNameAr('')
                  setNewTabNameEn('')
                  setAddNewTabDialogOpen(true)
                }}
              >
                Add New Tab
              </Button>
            </div>
          }
          {(() => {
            const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
            const tabsList = Array.isArray(tabsElement?.data) ? tabsElement.data : []
            if (tabsList.length === 0) return null

            const updateTabsData = newData => {
              const addMore = [...(data.addMoreElement || [])]
              const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
              if (tabsIdx === -1) return
              const nextTabsEl = { ...addMore[tabsIdx], data: newData }
              addMore[tabsIdx] = nextTabsEl
              onChange({ ...data, addMoreElement: addMore })
            }

            return (
              <div className='mt-3 p-3 border border-gray-200 rounded-md bg-gray-50/50'>
                <div className='text-sm font-medium text-gray-600 mb-2'>
                  {locale === 'ar' ? 'قائمة التبويبات' : 'Tabs list'}
                </div>
                <ul className='flex flex-col gap-1.5'>
                  {tabsList.map((tab, idx) => (
                    <li
                      key={tab.id || `tab-${idx}`}
                      className='flex items-center justify-between py-1.5 px-2 bg-white border rounded text-sm gap-1'
                    >
                      <span className='capitalize flex-1 min-w-0'>
                        {tab?.[locale === 'ar' ? 'name_ar' : 'name_en'] || tab?.name_en || '—'}
                      </span>
                      <span className='flex items-center shrink-0'>
                        <Tooltip title={locale === 'ar' ? 'أعلى' : 'Move up'}>
                          <span>
                            <IconButton
                              size='small'
                              disabled={idx === 0}
                              onClick={() => {
                                const newData = [...tabsList]
                                  ;[newData[idx - 1], newData[idx]] = [newData[idx], newData[idx - 1]]
                                updateTabsData(newData)
                              }}
                            >
                              <IconifyIcon icon='tabler:arrow-up' />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={locale === 'ar' ? 'أسفل' : 'Move down'}>
                          <span>
                            <IconButton
                              size='small'
                              disabled={idx === tabsList.length - 1}
                              onClick={() => {
                                const newData = [...tabsList]
                                  ;[newData[idx], newData[idx + 1]] = [newData[idx + 1], newData[idx]]
                                updateTabsData(newData)
                              }}
                            >
                              <IconifyIcon icon='tabler:arrow-down' />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={locale === 'ar' ? 'تعديل' : 'Edit'}>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setNewTabNameAr(tab.name_ar || '')
                              setNewTabNameEn(tab.name_en || '')
                              setEditingTabIndex(idx)
                              setAddNewTabDialogOpen(true)
                            }}
                          >
                            <IconifyIcon icon='tabler:edit' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={locale === 'ar' ? 'حذف' : 'Delete'}>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => {
                              const newData = tabsList.filter((_, i) => i !== idx)
                              updateTabsData(newData)
                            }}
                          >
                            <IconifyIcon icon='tabler:trash' />
                          </IconButton>
                        </Tooltip>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })()}
          <div className='mt-4'>
            <FormControl component='fieldset' fullWidth>
              <FormLabel component='legend'>{messages.View_Value}</FormLabel>
              <div className='!flex !flex-row !flex-wrap gap-2'>
                {getFields?.map(value => {
                  const dataValidations = {}
                  value.validationData.forEach(item => {
                    dataValidations[item.ruleType] = item.parameters
                  })
                  if (!value?.options?.isSystemField) {


                    const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
                    const tabs = Array.isArray(tabsElement?.data) ? tabsElement?.data : []

                    const currentIndex = Math.max(
                      -1,
                      tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(value.key))
                    )


                    const selectTab = (e, isChange = false) => {
                      const idx = parseInt(e.target.value, 10)
                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement?.id)
                      if (tabsIdx === -1) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      const nextData = [...(nextTabsEl.data || [])]
                      for (let i = 0; i < nextData.length; i++) {
                        const t = { ...(nextData[i] || {}) }
                        const arr = Array.isArray(t.fields) ? t.fields : []
                        if (arr.includes(value.key)) {
                          t.fields = arr.filter(id => id !== value.key)
                          nextData[i] = t
                        }
                      }
                      if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                        const t = { ...(nextData[idx] || {}) }
                        const arr = Array.isArray(t.fields) ? t.fields : []
                        if (!arr.includes(value.key)) {
                          t.fields = [...arr, value.key]
                          nextData[idx] = t
                        }
                      }
                      nextTabsEl.data = nextData
                      addMore[tabsIdx] = nextTabsEl
                      if (!isChange) {
                        onChange({ ...data, addMoreElement: addMore })
                      } else {
                        return addMore
                      }
                    }

                    return (
                      <FormControlLabel
                        key={value.key}
                        className='!w-fit capitalize'
                        control={
                          <>
                            {(() => {

                              return !tableType ? (
                                <span className='!ml-2 !flex !items-center !gap-1'>
                                  <select
                                    className='px-1 ms-1 w-full py-0.5 border rounded text-xs bg-white'
                                    value={currentIndex}
                                    onChange={e => {
                                      selectTab(e)
                                    }}
                                  >
                                    <option value={-1}>{messages?.selectTab || 'Select Tab...'}</option>
                                    {tabs.map((t, ti) => (
                                      <option key={ti} value={ti}>
                                        {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                                      </option>
                                    ))}
                                  </select>

                                </span>
                              ) : null
                            })()}
                            <Checkbox
                              value={value.key}
                              checked={selectedOptions.includes(value.key)}
                              onChange={e => {
                                const tabsElementFind = data.addMoreElement?.find(ele => ele.key === 'tabs')?.data

                                let newData = null
                                if (tabsElementFind?.length > 0) {
                                  newData = selectTab({ target: { value: "0" } }, true)
                                }
                                handleChange(e, value.fieldCategory, false, value, newData)

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
                  } else {
                    return null
                  }
                })}
              </div>
            </FormControl>
          </div>
          {!type && !tableType && (
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
                value={''}
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
                  {relatedCollectionsFields?.map((item, i) => {
                    const relatedCollectionsFields = SelectedRelatedCollectionsFields?.find?.((s) => s?.collection?.key === item?.collection?.key)

                    const tabsElement = (data.addMoreElement || []).find(
                      ele => ele.key === 'tabs'
                    )
                    const tabsElementFind = data.addMoreElement?.find(ele => ele.key === 'tabs')?.data
                    const tabs = Array.isArray(tabsElement?.data) ? tabsElement?.data : []


                    const tableKey = `form-table[${item.collection.key}]`

                    const currentIndexItem = Math.max(
                      -1,
                      tabs.findIndex(
                        t => Array.isArray(t.fields) && t.fields.includes(tableKey)
                      )
                    )

                    const selectTab = (e, isChange = false, valueKey) => {
                      const idx = parseInt(e.target.value, 10)



                      const addMore = [...(data.addMoreElement || [])]
                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                      if (tabsIdx === -1) return
                      const nextTabsEl = { ...addMore[tabsIdx] }
                      const nextData = [...(nextTabsEl.data || [])]
                      for (let i = 0; i < nextData.length; i++) {
                        const t = { ...(nextData[i] || {}) }
                        const arr = Array.isArray(t.fields) ? t.fields : []
                        if (arr.includes(valueKey)) {
                          t.fields = arr.filter(id => id !== valueKey)
                          nextData[i] = t
                        }
                      }
                      if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                        const t = { ...(nextData[idx] || {}) }
                        const arr = Array.isArray(t.fields) ? t.fields : []
                        if (!arr.includes(valueKey)) {
                          t.fields = [...arr, valueKey]
                          nextData[idx] = t
                        }
                      }
                      nextTabsEl.data = nextData
                      addMore[tabsIdx] = nextTabsEl
                      if (!isChange) {
                        onChange({ ...data, addMoreElement: addMore })
                      } else {
                        return addMore
                      }
                    }

                    return (<div key={i} className='border-2 border-main-color border-dashed p-2 rounded-md'>
                      <div className='flex justify-between items-center gap-5'>
                        <div className=''>{item.collection.key}</div>
                        <div className="flex items-center gap-2">
                          <Button
                            size='small'
                            variant='contained'
                            color={relatedCollectionsFields?.isTable ? 'error' : 'primary'}
                            onClick={() => {
                              if (relatedCollectionsFields) {
                                relatedCollectionsFields.isTable = !relatedCollectionsFields?.isTable ? true : false
                                const updated = [...SelectedRelatedCollectionsFields]
                                updated[i] = relatedCollectionsFields
                                onChange({ ...data, SelectedRelatedCollectionsFields: updated })
                              } else {
                                onChange({ ...data, SelectedRelatedCollectionsFields: [...SelectedRelatedCollectionsFields, { collection: item.collection, selected: [], isTable: true }] })
                              }
                            }}
                          >
                            {relatedCollectionsFields?.isTable ? 'Covert to List' : 'Covert to Table'}
                          </Button>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => {


                              const removeCollection = (data, key) => {
                                const newData = {
                                  ...data,
                                  relatedCollections: data.relatedCollections.filter(x => x.key !== key),
                                  SelectedRelatedCollectionsFields: data.SelectedRelatedCollectionsFields.filter(
                                    x => x.collection.key !== key
                                  ),
                                  additional_fields: data.additional_fields.filter(x => x.key !== `form-table[${key}]`),
                                };

                                newData[`form-table[${key}]`] = null;

                                return newData;
                              };

                              const newData = removeCollection(data, item.collection.key)

                              onChange({
                                ...newData,
                              })
                            }}
                          >
                            <MdDeleteOutline />
                          </IconButton>
                        </div>
                      </div>
                      {relatedCollectionsFields?.isTable && (
                        <span className='!ml-2 !flex !items-center !gap-1'>
                          <select
                            value={currentIndexItem}
                            className='px-1 py-0.5 border rounded text-xs bg-white'
                            onChange={e => {
                              selectTab(e, false, tableKey)
                            }}

                          >
                            <option value={-1}>{messages?.None || 'None'}</option>
                            {tabs.map((t, ti) => (
                              <option key={ti} value={ti}>
                                {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                              </option>
                            ))}
                          </select>

                        </span>)}
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

                              if (value?.options?.isSystemField === false) {



                                const currentIndex = Math.max(
                                  -1,
                                  tabs.findIndex(
                                    t => Array.isArray(t.fields) && t.fields.includes(value.key + '[' + item.collection.key + ']')
                                  )
                                )

                                const valueKey = `${value.key}[${item.collection.key}]`





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



                                            let newData = null
                                            if (tabsElementFind?.length > 0) {
                                              newData = selectTab({ target: { value: "0" } }, true, valueKey)
                                            }



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

                                                const saveData = { ...data, SelectedRelatedCollectionsFields: updated }
                                                if (newData) {
                                                  saveData.addMoreElement = newData
                                                }

                                                onChange(saveData)

                                                return updated
                                              }

                                              // ✅ لو الـ collection مش موجودة، أضفها جديدة
                                              const saveData = {
                                                ...data,
                                                SelectedRelatedCollectionsFields: [
                                                  ...prev,
                                                  { collection: item.collection, selected: [value.key] }
                                                ]

                                              }
                                              if (newData) {
                                                saveData.addMoreElement = newData
                                              }
                                              onChange(saveData)

                                              return [...prev, { collection: item.collection, selected: [value.key] }]
                                            })
                                          }}
                                        />
                                        {(() => {


                                          return relatedCollectionsFields?.isTable ? null : (
                                            <span className='!ml-2 !flex !items-center !gap-1'>
                                              <select
                                                className='px-1 py-0.5 border rounded text-xs bg-white'
                                                value={currentIndex}
                                                onChange={e => {
                                                  selectTab(e, false, valueKey)
                                                }}
                                              >
                                                <option value={-1}>{messages?.None || 'None'}</option>
                                                {tabs.map((t, ti) => (
                                                  <option key={ti} value={ti}>
                                                    {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                                                  </option>
                                                ))}
                                              </select>

                                            </span>
                                          )
                                        })()}
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
                              } else {
                                return null
                              }
                            })}
                          </div>
                        </FormControl>
                      </div>
                    </div>)
                  })}
                </div>
              </Collapse>
            </div>
          )}

          <div className='mt-4'></div>
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
          {!tableType ? (
            <>
              <TextField
                select
                fullWidth
                value={data.type_of_sumbit || 'collection'}
                onChange={e => {
                  onChange({ ...data, type_of_sumbit: e.target.value })
                }}
                label={messages.dialogs.typeOfSubmit}
                variant='filled'
              >
                <MenuItem value={'collection'}>{messages.dialogs.thisDataModel}</MenuItem>
                <MenuItem value={'api'}>{messages.dialogs.otherApi}</MenuItem>
                <MenuItem value={'read-only'}>{messages.dialogs.readOnly || 'Read Only'}</MenuItem>
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


              <div className='mt-3 p-2 border-2 rounded-md border-dashed border-main-color'>
                <div className='text-sm mb-2'>
                  {locale === 'ar'
                    ? 'JS Data قبل الإرسال (collection)'
                    : 'JS data before submit (collection)'}
                </div>
                <MonacoEditor
                  height='220px'
                  width='100%'
                  language='javascript'
                  theme='vs-dark'
                  value={data.collectionBeforeSubmitJsData || 'return { ...output }'}
                  onChange={value => onChange({ ...data, collectionBeforeSubmitJsData: value || '' })}
                  options={{
                    selectOnLineNumbers: true,
                    minimap: { enabled: false },
                    readOnly: false
                  }}
                />
                <div className='text-xs mt-2 text-gray-600'>
                  {locale === 'ar'
                    ? 'المتاح: output, allData, routerQuery. لازم ترجع object باستخدام return.'
                    : 'Available: output, allData, routerQuery. Must return an object using return.'}
                </div>
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
                          if (moreElement === 'prev') {
                            const oldAddMoreElement = data?.addMoreElement ?? []
                            onChange({
                              ...data,
                              addMoreElement: [
                                ...oldAddMoreElement,
                                {
                                  name_ar: 'السابق',
                                  name_en: 'Previous',
                                  key: 'button',
                                  kind: 'back',
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
                                      active: true,
                                      fields: []
                                    },
                                    {
                                      name_ar: 'التبويب الثاني',
                                      name_en: 'Tab 2',
                                      link: '',
                                      active: false,
                                      fields: []
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
                              {(item.key !== "tabs" && item.kind !== "back") &&
                                <>
                                  {(() => {
                                    const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
                                    const tabs = Array.isArray(tabsElement?.data) ? tabsElement?.data : []

                                    return (
                                      <span className='!ml-2 !flex !items-center !gap-1 !flex-wrap'>
                                        {tabs.map((t, ti) => {
                                          const arr = Array.isArray(t.fields) ? t.fields : []
                                          const checked = arr.includes(item.id)

                                          return (
                                            <label
                                              key={ti}
                                              className='flex items-center gap-1 px-1 py-0.5 border rounded text-xs cursor-pointer bg-white'
                                            >
                                              <input
                                                type='checkbox'
                                                className='w-3 h-3'
                                                checked={checked}
                                                onChange={e => {
                                                  const addMore = [...(data.addMoreElement || [])]
                                                  const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                                                  if (tabsIdx === -1) return
                                                  const nextTabsEl = { ...addMore[tabsIdx] }

                                                  const nextData = (nextTabsEl.data || []).map((tab, idx) => {
                                                    if (idx !== ti) return tab
                                                    const tabCopy = { ...(tab || {}) }

                                                    let fieldsArr = Array.isArray(tabCopy.fields)
                                                      ? tabCopy.fields
                                                      : []

                                                    const exists = fieldsArr.includes(item.id)
                                                    if (e.target.checked && !exists) {
                                                      fieldsArr = [...fieldsArr, item.id]
                                                    }
                                                    if (!e.target.checked && exists) {
                                                      fieldsArr = fieldsArr.filter(id => id !== item.id)
                                                    }

                                                    return { ...tabCopy, fields: fieldsArr }
                                                  })

                                                  nextTabsEl.data = nextData
                                                  addMore[tabsIdx] = nextTabsEl
                                                  onChange({ ...data, addMoreElement: addMore })
                                                }}
                                              />
                                              <span>
                                                {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                                              </span>
                                            </label>
                                          )
                                        })}
                                      </span>
                                    )
                                  })()}


                                </>
                              }
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
                <FormControlLabel
                  key='edit-data-checkbox'
                  className='!w-fit capitalize'
                  control={
                    <Checkbox
                      value={data.stopFetchingDataFromApi}
                      checked={data.stopFetchingDataFromApi}
                      onChange={() => {
                        onChange({ ...data, stopFetchingDataFromApi: data.stopFetchingDataFromApi ? false : true })
                      }}
                    />
                  }
                  label={locale === "ar" ? 'وقف جلب المعلومات من الAPI' : 'Stop fetching data from the API'}
                />
              </div>
            </>
          ) : (
            <>

              <TextField
                fullWidth
                type='color'
                defaultValue={data.borderColor || ''}
                onBlur={e => onChange({ ...data, borderColor: e.target.value })}
                label={messages.dialogs.borderColor || 'Border Color'}
                variant='filled'
              />
              <TextField
                fullWidth
                type='color'
                defaultValue={data.headerBackgroundColor || ''}
                onBlur={e => onChange({ ...data, headerBackgroundColor: e.target.value })}
                label={messages.dialogs.headerBackgroundColor || 'Header Background Color'}
                variant='filled'
              />
              <TextField
                fullWidth
                type='color'
                defaultValue={data.headerTextColor || ''}
                onBlur={e => onChange({ ...data, headerTextColor: e.target.value })}
                label={messages.dialogs.headerTextColor || 'Header Text Color'}
                variant='filled'
              />
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

              <FormControlLabel
                key='show-btn-checkbox'
                className='!w-fit capitalize'
                control={
                  <Checkbox
                    value={data.showBtn ?? true}
                    onChange={e => {
                      onChange({ ...data, showBtn: e.target.checked })
                    }}
                  />
                }
                label={messages.dialogs.showBtn}
              />
              <FormControlLabel
                key='show-old-data-checkbox'
                className='!w-fit capitalize'
                control={
                  <Checkbox
                    value={data.showOldData ?? false}
                    onChange={e => {
                      onChange({ ...data, showOldData: e.target.checked })
                    }}
                  />
                }
                label={locale === 'ar' ? 'إظهار البيانات القديمة' : 'Show Old Data'}
              />
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
                <div className='mt-3 p-2 border-2 rounded-md border-dashed border-main-color'>
                  <div className='text-sm mb-2'>
                    {locale === 'ar' ? 'JS Data لكل عنصر قبل الإرسال' : 'JS data for each row before submit'}
                  </div>
                  <MonacoEditor
                    height='220px'
                    width='100%'
                    language='javascript'
                    theme='vs-dark'
                    value={data.tableRowJsData || "return { ...row }"}
                    onChange={value => onChange({ ...data, tableRowJsData: value || '' })}
                    options={{
                      selectOnLineNumbers: true,
                      minimap: { enabled: false },
                      readOnly: false
                    }}
                  />
                  <div className='text-xs mt-2 text-gray-600'>
                    {locale === 'ar'
                      ? 'المتاح: row, allRows, allData, routerQuery. لازم ترجع object باستخدام return.'
                      : 'Available: row, allRows, allData, routerQuery. Must return an object using return.'}
                  </div>
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
                                        link: 'https://www.google.com',
                                        active: true,
                                        fields: []
                                      },
                                      {
                                        name_ar: 'التبويب الثاني',
                                        name_en: 'Tab 2',
                                        link: 'https://www.google.com',
                                        active: false,
                                        fields: []
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
              <TextField
                fullWidth
                className='mb-3'
                label={locale === 'ar' ? 'فلتر الاستعلام (Query filter)' : 'Query filter'}
                placeholder='name=sameh&age={age}'
                value={data.tableApiQueryFilter || ''}
                onChange={e => onChange({ ...data, tableApiQueryFilter: e.target.value })}
                variant='filled'
                size='small'
                helperText={
                  locale === 'ar'
                    ? 'استخدم {اسم_المعامل} لقراءة القيمة من رابط الصفحة (?age=25).'
                    : 'Use {paramName} to read from the page URL (?age=25).'
                }
              />
              <h2 className='text-lg font-bold'>{messages.dialogs.actions}</h2>
              <FormControlLabel
                key='edit-data-checkbox'
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
                key='details-data-checkbox'
                className='!w-fit capitalize'
                control={
                  <Checkbox
                    value={data.details}
                    checked={data.details}
                    onChange={() => {
                      onChange({ ...data, details: data.details ? false : true })
                    }}
                  />
                }
                label={messages.dialogs.showDetails}
              />
              <FormControlLabel
                key='details-data-checkbox'
                className='!w-fit capitalize'
                control={
                  <Checkbox
                    value={data.hideOnSubmit ?? false}
                    checked={data.hideOnSubmit ?? false}
                    onChange={() => {
                      onChange({ ...data, hideOnSubmit: data.hideOnSubmit ? false : true })
                    }}
                  />
                }
                label={locale === 'ar' ? 'إخفاء عند الإرسال' : 'Hide on submit'}
              />
              <FormControlLabel
                key='delete-data-checkbox'
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

              {data.edit && (
                <div className="mt-2">
                  <TextField
                    fullWidth
                    type="text"
                    name="editPageNameRedirect"
                    value={data.editPageNameRedirect ?? ''}
                    onChange={e => onChange({ ...data, editPageNameRedirect: e.target.value })}
                    label={messages.dialogs.editPageNameRedirect}
                    variant="filled"
                  />
                </div>
              )}
              {data.details && (
                <div className="mt-2">
                  <TextField
                    fullWidth
                    type="text"
                    name="editPageNameRedirect"
                    value={data.detailsPageNameRedirect ?? ''}
                    onChange={e => onChange({ ...data, detailsPageNameRedirect: e.target.value })}
                    label={messages.dialogs.detailsPageNameRedirect}
                    variant="filled"
                  />
                </div>
              )}
            </>
          )}
        </Collapse>
      </form>
    </div>
  )
}

export default Select
