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
  Tooltip
} from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import Collapse from '@kunukn/react-collapse'
import { axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'

import CloseNav from './CloseNav'
import IconifyIcon from 'src/Components/icon'

function Select({ onChange, data, type, buttonRef, title }) {
  const { locale } = useIntl()
  const [collection, setCollection] = useState('')
  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const { messages } = useIntl()
  const [getFields, setGetFields] = useState([])
  const [dataSources, setDataSources] = useState([])

  useEffect(() => {
    setLoadingCollection(true)
    axiosGet(`data-source/get`, locale)
      .then(res => {
        if (res.status) {
          setDataSources(res.data)
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
            const loadingToast = toast.loading(locale === 'ar' ? 'يتم التحميل' : 'Loading')
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

  const handleChange = event => {
    const { value, checked } = event.target
    setSelectedOptions(prevSelected =>
      checked ? [...prevSelected, value] : prevSelected.filter(item => item !== value)
    )
    const selected = checked ? [...selectedOptions, value] : selectedOptions.filter(item => item !== value)
    onChange({ ...data, selected, type_of_sumbit: data.type_of_sumbit === 'collection' ? '' : data.type_of_sumbit })
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

  return (
    <div>
      <div className=''>
        <CloseNav text={title} buttonRef={buttonRef} />
      </div>
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
            onChange({ ...data, collectionId: value?.id, collectionName: value?.key, selected: [], sortWithId: false })
            setSelectedOptions([])
          }}
          renderInput={params => (
            <TextField
              {...params}
              label={locale === 'ar' ? 'نموذج البيانات' : 'Select Data Model'}
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
                {getFields?.map(value => (
                  <FormControlLabel
                    key={value.key}
                    className='!w-fit capitalize'
                    control={
                      <Checkbox
                        value={value.key}
                        checked={selectedOptions.includes(value.key)}
                        onChange={handleChange}
                      />
                    }
                    label={value.key}
                  />
                ))}
              </div>
            </FormControl>
          </div>

          <div className='mt-4'></div>
          {!type ? (
            <>
              <TextField
                select
                fullWidth
                value={data.type_of_sumbit || ''}
                onChange={e => {
                  if (e.target.value === 'collection') {
                    if (selectedOptions.length !== getFields.length) {
                      toast.error(locale === 'ar' ? 'يجب اختيار كل الحقول' : 'You must select the All fields')

                      return
                    }
                  }

                  onChange({ ...data, type_of_sumbit: e.target.value })
                }}
                label={locale === 'ar' ? 'نوع الارسال' : 'Type Of Submit'}
                variant='filled'
              >
                <MenuItem value={'collection'}>{locale === 'ar' ? 'هذه النموذج' : 'This Data model'}</MenuItem>
                <MenuItem value={'api'}>{locale === 'ar' ? 'الي Api اخر' : 'Other API'}</MenuItem>
              </TextField>
              <TextField
                fullWidth
                value={data.redirect || ''}
                onChange={e => onChange({ ...data, redirect: e.target.value })}
                label={locale === 'ar' ? 'الذهاب الي' : 'Redirect to'}
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
                  label={locale === 'ar' ? 'ارسال البيانات الي الAPI' : 'Submit To API'}
                  variant='filled'
                />
              </Collapse>

              <div className='p-2 mt-4 rounded-md border-2 border-gray-300'>
                <div className='text-lg font-bold'>{locale === 'ar' ? 'اضافة عناصر' : 'Add More Element'}</div>

                <TextField
                  select
                  fullWidth
                  value={moreElement}
                  label={locale === 'ar' ? 'اضافة عناصر' : 'Add More Element'}
                  id='select-helper'
                  variant='filled'
                  onChange={e => {
                    setMoreElement(e.target.value)
                  }}
                >
                  {addMoreElement.map((item, i) => (
                    <MenuItem value={item.key} key={i}>
                      {locale === 'ar' ? item.name_ar : item.name_en}
                    </MenuItem>
                  ))}
                </TextField>
                <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(moreElement)}>
                  <div className='flex justify-center my-3'>
                    <Button
                      onClick={() => {
                        console.log(moreElement)
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
                          toast.success(locale === 'ar' ? 'تم اضافة العنصر' : 'Element Added')
                        }
                      }}
                      variant='contained'
                      color='primary'
                    >
                      {locale === 'ar' ? 'اضافة' : 'Add'}
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
                                {
                                  addMoreElement.find(ele => ele.key.toLowerCase() === item.key.toLowerCase())?.[
                                    `name_${locale}`
                                  ] || messages.text
                                }
                                )
                              </span>
                              {locale === 'ar' ? item.name_ar : item.name_en}{' '}
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
                label={locale === 'ar' ? 'نوع الجدول' : 'Type Of table'}
                variant='filled'
              >
                <MenuItem value={'view-data'}>{locale === 'ar' ? 'عرض البيانات' : 'View Data'}</MenuItem>
                <MenuItem value={'form-table'}>{locale === 'ar' ? 'ارسال البيانات' : 'Submit Data '}</MenuItem>
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
                    if (e.target.value === 'collection') {
                      if (selectedOptions.length !== getFields.length) {
                        toast.error(locale === 'ar' ? 'يجب اختيار كل الحقول' : 'You must select the All fields')

                        return
                      }
                    }

                    onChange({ ...data, type_of_sumbit: e.target.value })
                  }}
                  label={locale === 'ar' ? 'نوع الارسال' : 'Type Of Submit'}
                  variant='filled'
                >
                  <MenuItem value={'collection'}>{locale === 'ar' ? 'هذه التجميعة' : 'This Collection'}</MenuItem>
                  <MenuItem value={'api'}>{locale === 'ar' ? 'الي Api اخر' : 'Other API'}</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  value={data.redirect || ''}
                  onChange={e => onChange({ ...data, redirect: e.target.value })}
                  label={locale === 'ar' ? 'الذهاب الي' : 'Redirect to'}
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
                    label={locale === 'ar' ? 'ارسال البيانات الي الAPI' : 'Submit To API'}
                    variant='filled'
                  />
                </Collapse>

                <div className='p-2 mt-4 rounded-md border-2 border-gray-300'>
                  <div className='text-lg font-bold'>{locale === 'ar' ? 'اضافة عناصر' : 'Add More Element'}</div>

                  <TextField
                    select
                    fullWidth
                    value={moreElement}
                    label={locale === 'ar' ? 'اضافة عناصر' : 'Add More Element'}
                    id='select-helper'
                    variant='filled'
                    onChange={e => {
                      setMoreElement(e.target.value)
                    }}
                  >
                    {addMoreElement.map((item, i) => (
                      <MenuItem value={item.key} key={i}>
                        {locale === 'ar' ? item.name_ar : item.name_en}
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
                            console.log(moreElement)
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
                            toast.success(locale === 'ar' ? 'تم اضافة العنصر' : 'Element Added')
                          }
                        }}
                        variant='contained'
                        color='primary'
                      >
                        {locale === 'ar' ? 'اضافة' : 'Add'}
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
                            <div className='text-sm'>{locale === 'ar' ? item.name_ar : item.name_en}</div>
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
                              {locale === 'ar' ? 'حذف' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </div>
              </Collapse>

              <h2 className='text-lg font-bold'>{locale === 'ar' ? 'الاجراءات' : 'Actions'}</h2>
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
                label={locale === 'ar' ? 'تعديل البيانات' : 'Edit Data'}
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
                label={locale === 'ar' ? 'حذف البيانات' : 'Delete Data'}
              />
            </>
          )}
        </Collapse>
      </form>
    </div>
  )
}

export default Select
