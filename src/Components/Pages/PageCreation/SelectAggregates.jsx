/* eslint-disable react-hooks/exhaustive-deps */
import {
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  TextField,
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
import CloseNav from './CloseNav'

function SelectAggregates({ onChange, data, type, buttonRef, title }) {
  const { locale, messages } = useIntl()
  const [collection, setCollection] = useState('')
  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [getFields, setGetFields] = useState([])

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

    if (fieldCategory === 'Associations' && type !== 'table' && isChecked) {
      setAssociationsOpen({ key: event.target.value, source: field?.options?.source, field })

      return
    }

    // if(filed)
   

    setSelectedOptions(prevSelected =>
      isChecked ? [...prevSelected, value] : prevSelected.filter(item => item !== value)
    )
    const selected = isChecked ? [...selectedOptions, value] : selectedOptions.filter(item => item !== value)

    const oldAdditionalFields = data?.additional_fields ?? []
    const filteredAdditionalFields = oldAdditionalFields.filter(inp => inp.key !== field?.id)

    // Tabs assignment logic removed from here; use the inline dropdowns instead
    const addMoreElementLocal = [...(data?.addMoreElement ?? [])]

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
                            {(() => {
                              const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
                              if (!tabsElement) return null
                              const tabs = Array.isArray(tabsElement.data) ? tabsElement.data : []

                              const currentIndex = Math.max(
                                -1,
                                tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(value.key))
                              )

                              return (
                                <span className='!ml-2 !flex !items-center !gap-1'>
                                  <select
                                    className='px-1 py-0.5 border rounded text-xs bg-white'
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
                                      onChange({ ...data, addMoreElement: addMore })
                                    }}
                                  >
                                    <option value={-1}>{messages?.None || 'None'}</option>
                                    {tabs.map((t, ti) => (
                                      <option key={ti} value={ti}>
                                        {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type='button'
                                    className='px-2 py-0.5 border rounded text-xs'
                                    onClick={() => {
                                      const addMore = [...(data.addMoreElement || [])]
                                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                                      if (tabsIdx === -1) return
                                      const nextTabsEl = { ...addMore[tabsIdx] }
                                      const count = (nextTabsEl.data || []).length + 1
                                      nextTabsEl.data = [
                                        {
                                          name_ar: `تبويب ${count}`,
                                          name_en: `Tab ${count}`,
                                          link: '',
                                          active: false,
                                          fields: []
                                        },
                                        ...(nextTabsEl.data || [])
                                      ]
                                      addMore[tabsIdx] = nextTabsEl
                                      onChange({ ...data, addMoreElement: addMore })
                                    }}
                                  >
                                    {messages?.Add_Tab || 'Add Tab'}
                                  </button>
                                </span>
                              )
                            })()}
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
        </Collapse>
      </form>
    </div>
  )
}

export default SelectAggregates
