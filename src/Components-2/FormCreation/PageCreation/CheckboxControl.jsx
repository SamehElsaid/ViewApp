/* eslint-disable react-hooks/exhaustive-deps */
import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { useIntl } from 'react-intl'
import { useEffect, useState } from 'react'
import Collapse from '@kunukn/react-collapse'
import { cssToObject, DefaultStyle, objectToCss } from 'src/Components/_Shared'
import { Icon } from '@iconify/react'
import { axiosGet, UrlTranAr, UrlTranEn } from 'src/Components/axiosCall'
import toast from 'react-hot-toast'
import { Box } from '@mui/system'
import { useRouter } from 'next/router'

export default function CheckboxControl({ data, onChange, type }) {
  const { locale } = useIntl()
  const [selected, setSelect] = useState('main')

  const {
    query: { addFiles }
  } = useRouter()

  const Css = cssToObject(data.css || DefaultStyle(type))

  const getData = key => {
    const keys = key.split('.')

    let result = Css
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return ''
      }
    }

    return result
  }

  const UpdateData = (key, value) => {
    const Css = cssToObject(data.css || DefaultStyle(type))

    const keys = key.split('.')

    let current = Css
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }

    current[keys[keys.length - 1]] = value

    onChange({ ...data, css: objectToCss(Css).replaceAll('NaN', '') })
  }

  const [dataSources, setDataSources] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [optionsCollection, setOptionsCollection] = useState([])
  const { messages } = useIntl()

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
  const [getFields, setGetFields] = useState([])
  const [collection, setCollection] = useState('')

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

  const handleInputChange = async (event, value) => {
    try {
      const res = await axiosGet(`collections/get/?dataSourceId=${data.data_source_id}`, locale)
      if (res.status) {
        setOptionsCollection(res.data)
      } else {
        setCollection('')
      }
    } finally {
      setLoadingCollection(false)
    }
  }

  useEffect(() => {
    if (!data.data_source_id) return
    setLoadingCollection(true)
    axiosGet(`collections/get/?dataSourceId=${data.data_source_id}`, locale)
      .then(res => {
        if (res.status) {
          setOptionsCollection(res.data)
        }
      })
      .finally(() => {
        setLoadingCollection(false)
      })
  }, [locale, data.data_source_id])

  const [selectedOptions, setSelectedOptions] = useState([])

  const handleChange = event => {
    const { value, checked } = event.target
    setSelectedOptions(prevSelected =>
      checked ? [...prevSelected, value] : prevSelected.filter(item => item !== value)
    )
    const selected = checked ? [...selectedOptions, value] : selectedOptions.filter(item => item !== value)
    onChange({ ...data, selected, type_of_sumbit: data.type_of_sumbit === 'collection' ? '' : data.type_of_sumbit })
  }
  useEffect(() => {
    if (data.selected) {
      setSelectedOptions(data.selected)
    }
  }, [data.selected])
  useEffect(() => {
    if (data.fileTypes) {
      setFileExtensions(data.fileTypes)
    }
  }, [data.fileTypes])

  const fileTypes = [
    // Images
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.svg',
    '.tiff',
    '.webp',

    // Documents
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.rtf',
    '.odt',
    '.tex',

    // Spreadsheets
    '.xls',
    '.xlsx',
    '.csv',
    '.ods',

    // Presentations
    '.ppt',
    '.pptx',
    '.odp',

    // Audio
    '.mp3',
    '.wav',
    '.ogg',
    '.m4a',
    '.aac',
    '.flac',

    // Video
    '.mp4',
    '.mov',
    '.wmv',
    '.avi',
    '.mkv',
    '.flv',
    '.webm',
    '.3gp',

    // Archives
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
    '.bz2',

    // Code
    '.html',
    '.css',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.json',
    '.xml',
    '.yaml',
    '.yml',
    '.py',
    '.java',
    '.c',
    '.cpp',
    '.cs',
    '.php',
    '.rb',
    '.go',
    '.sh',
    '.bat',

    // Fonts
    '.ttf',
    '.otf',
    '.woff',
    '.woff2',

    // Other
    '.iso',
    '.dmg',
    '.exe',
    '.apk',
    '.bin',
    '.dll',
    '.icns',
    '.ico'
  ]
  const [fileExtensions, setFileExtensions] = useState([])

  const handleToggleFileExtension = extension => {
    let fileTypes
    if (fileExtensions.includes(extension)) {
      fileTypes = fileExtensions.filter(ext => ext !== extension)
      setFileExtensions(fileTypes)
    } else {
      fileTypes = [...fileExtensions, extension]
      setFileExtensions(fileTypes)
    }
    onChange({ ...data, fileTypes: fileTypes })
  }

  return (
    <div>
      <div className='flex || items-center || justify-center mb-4'>
        <ButtonGroup variant='outlined' color='primary'>
          <Button
            onClick={() => {
              setSelect('main')
            }}
            variant={selected === 'main' ? 'contained' : 'outlined'}
          >
            {locale === 'ar' ? 'الاساسية' : 'Main'}
          </Button>
          <Button
            variant={selected === 'style' ? 'contained' : 'outlined'}
            onClick={() => {
              setSelect('style')
            }}
          >
            {locale === 'ar' ? 'التنسيق' : 'Style'}
          </Button>
          <Button
            onClick={() => {
              setSelect('roles')
            }}
            variant={selected === 'roles' ? 'contained' : 'outlined'}
          >
            {locale === 'ar' ? 'الصلاحيات' : 'Roles'}
          </Button>
        </ButtonGroup>
      </div>{' '}
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'main')}>
        <TextField
          fullWidth
          type='text'
          defaultValue={data.key}
          onBlur={e => onChange({ ...data, key: e.target.value })}
          variant='filled'
          label={locale === 'ar' ? 'المفتاح' : 'Key'}
        />
        <TextField
          fullWidth
          type='text'
          defaultValue={data.labelAr}
          onBlur={e => onChange({ ...data, labelAr: e.target.value })}
          variant='filled'
          label={locale === 'ar' ? 'الحقل بالعربية' : 'Label Ar'}
        />
        <TextField
          fullWidth
          type='text'
          defaultValue={data.labelEn}
          onBlur={e => onChange({ ...data, labelEn: e.target.value })}
          variant='filled'
          label={locale === 'ar' ? 'الحقل بالانجليزية' : 'Label En'}
        />

        {type !== 'file' && (
          <>
            <TextField
              select
              fullWidth
              value={data.data_source_id}
              onChange={e => {
                onChange({
                  ...data,
                  data_source_id: e.target.value,
                  collectionId: false,
                  collectionName: false,
                  selected: [],
                  sortWithId: false
                })
              }}
              label={locale === 'ar' ? 'المصدر' : 'Data Source'}
              variant='filled'
            >
              {dataSources.map(item => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <div className='mb-4'></div>
            <Autocomplete
              options={loadingCollection ? [] : optionsCollection.filter(item => item.id !== addFiles)}
              getOptionLabel={option => (locale === 'ar' ? option.nameAr : option.nameEn) || ''}
              loading={loadingCollection}
              onInputChange={handleInputChange}
              value={collection}
              onChange={(e, value) => {
                setCollection(value)
                onChange({
                  ...data,
                  collectionId: value?.id,
                  collectionName: value?.key,
                  selected: [],
                  sortWithId: false
                })
                setSelectedOptions([])
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={messages.Select_Collection}
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
                    {getFields?.map(
                      value =>
                        value.type !== 'ManyToMany' &&
                        value.type !== 'OneToOne' && (
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
                        )
                    )}
                  </div>
                </FormControl>
              </div>
            </Collapse>
          </>
        )}
      </Collapse>
      {type === 'select' ? (
        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'style')}>
          <div className='mt-1'></div>
          <TextField
            fullWidth
            type='number'
            value={getData(`#custom-select.width.value`) || ''}
            onChange={e => UpdateData(`#custom-select.width.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'العرض' : 'Width'}
            disabled={
              getData(`#custom-select.width.unit`) === 'max-content' ||
              getData(`#custom-select.width.unit`) === 'min-content' ||
              getData(`#custom-select.width.unit`) === 'fit-content' ||
              getData(`#custom-select.width.unit`) === 'auto' ||
              !getData(`#custom-select.width.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label:before.width.unit`) || '%'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label:before.width.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />

          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`#custom-select select.background-color.unit`) || '#575757'}
              onBlur={e => UpdateData(`#custom-select select.background-color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون الخلفي' : 'Background Color'}
              variant='filled'
            />
          </div>
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`#custom-select select.border-color.unit`) || '#575757'}
              onBlur={e => UpdateData(`#custom-select select.border-color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون الحدود' : 'Border Color'}
              variant='filled'
            />
          </div>
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`#custom-select select.color.unit`) || '#fff'}
              onBlur={e => UpdateData(`#custom-select select.color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون' : 'Color'}
              variant='filled'
            />
          </div>

          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`#first-label.color.unit`) || '#555'}
              onBlur={e => UpdateData(`#first-label.color.unit`, e.target.value)}
              label={locale === 'ar' ? 'لون التسمية' : 'Label Color'}
              variant='filled'
            />
          </div>
        </Collapse>
      ) : type === 'file' ? (
        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'style')}>

          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`label.background-color.unit`) || '#575757'}
              onBlur={e => UpdateData(`label.background-color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون الخلفي' : 'Background Color'}
              variant='filled'
            />
          </div>
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`label.border-color.unit`) || '#575757'}
              onBlur={e => UpdateData(`label.border-color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون الحدود' : 'Border Color'}
              variant='filled'
            />
          </div>
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`#file-upload-content.color.unit`) || '#fff'}
              onBlur={e => UpdateData(`#file-upload-content.color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون' : 'Color'}
              variant='filled'
            />
          </div>

          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData('#label-color.color.unit') || '#555'}
              onBlur={e => UpdateData('#label-color.color.unit', e.target.value)}
              label={locale === 'ar' ? 'لون التسمية' : 'Label Color'}
              variant='filled'
            />
          </div>
        </Collapse>
      ) : (
        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'style')}>
          <div className='mt-1'></div>
          <FormControl variant='filled' fullWidth>
            <InputLabel id='demo-simple-select-filled-label'>
              {locale === 'ar' ? 'الاتجاه' : 'Flex Direction'}
            </InputLabel>
            <Select
              fullWidth
              labelId='demo-simple-select-filled-label'
              value={getData('#view-input-in-form-engine.flex-direction.unit') || 'row'} // الافتراضي px
              onChange={e => UpdateData('#view-input-in-form-engine.flex-direction.unit', e.target.value)}
              label={locale === 'ar' ? 'الاتجاه' : 'Flex Direction'}
            >
              <MenuItem value='row'>Row</MenuItem>
              <MenuItem value='column'>Column</MenuItem>
              <MenuItem value='row-reverse'>Row Reverse</MenuItem>
              <MenuItem value='column-reverse'>Column Reverse</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type='number'
            value={getData(`input[type=${type}] + label:before.width.value`) || ''}
            onChange={e => UpdateData(`input[type=${type}] + label:before.width.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'العرض' : 'Width'}
            disabled={
              getData(`input[type=${type}] + label:before.width.unit`) === 'max-content' ||
              getData(`input[type=${type}] + label:before.width.unit`) === 'min-content' ||
              getData(`input[type=${type}] + label:before.width.unit`) === 'fit-content' ||
              getData(`input[type=${type}] + label:before.width.unit`) === 'auto' ||
              !getData(`input[type=${type}] + label:before.width.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label:before.width.unit`) || '%'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label:before.width.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />
          <div className='mt-1'></div>
          <TextField
            fullWidth
            type='number'
            value={getData(`input[type=${type}] + label:before.height.value`) || ''}
            onChange={e => UpdateData(`input[type=${type}] + label:before.height.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'الطول' : 'Height'}
            disabled={
              getData(`input[type=${type}] + label:before.height.unit`) === 'max-content' ||
              getData(`input[type=${type}] + label:before.height.unit`) === 'min-content' ||
              getData(`input[type=${type}] + label:before.height.unit`) === 'fit-content' ||
              getData(`input[type=${type}] + label:before.height.unit`) === 'auto' ||
              !getData(`input[type=${type}] + label:before.height.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label:before.height.unit`) || '%'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label:before.height.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />
          <div className='mt-1'></div>
          <TextField
            fullWidth
            type='number'
            value={getData(`input[type=${type}] + label.margin-top.value`) || ''}
            onChange={e => UpdateData(`input[type=${type}] + label.margin-top.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'المسافة العلوية' : 'Margin Top'}
            disabled={
              getData(`input[type=${type}] + label.margin-top.unit`) === 'max-content' ||
              getData(`input[type=${type}] + label.margin-top.unit`) === 'min-content' ||
              getData(`input[type=${type}] + label.margin-top.unit`) === 'fit-content' ||
              getData(`input[type=${type}] + label.margin-top.unit`) === 'auto' ||
              !getData(`input[type=${type}] + label.margin-top.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label.margin-top.unit`) || 'auto'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label.margin-top.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />
          <div className='mt-1'></div>
          <TextField
            fullWidth
            type='number'
            value={getData(`input[type=${type}] + label.margin-bottom.value`) || ''}
            onChange={e => UpdateData(`input[type=${type}] + label.margin-bottom.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'المسافة السفلية' : 'Margin Bottom'}
            disabled={
              getData(`input[type=${type}] + label.margin-bottom.unit`) === 'max-content' ||
              getData(`input[type=${type}] + label.margin-bottom.unit`) === 'min-content' ||
              getData(`input[type=${type}] + label.margin-bottom.unit`) === 'fit-content' ||
              getData(`input[type=${type}] + label.margin-bottom.unit`) === 'auto' ||
              !getData(`input[type=${type}] + label.margin-bottom.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label.margin-bottom.unit`) || 'auto'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label.margin-bottom.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />
          <div className='mt-1'></div>
          <TextField
            fullWidth
            type='number'
            value={getData(`input[type=${type}] + label.margin-inline-start.value`) || ''}
            onChange={e => UpdateData(`input[type=${type}] + label.margin-inline-start.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'المسافة اليسرى' : 'Margin Left'}
            disabled={
              getData(`input[type=${type}] + label.margin-inline-start.unit`) === 'max-content' ||
              getData(`input[type=${type}] + label.margin-inline-start.unit`) === 'min-content' ||
              getData(`input[type=${type}] + label.margin-inline-start.unit`) === 'fit-content' ||
              getData(`input[type=${type}] + label.margin-inline-start.unit`) === 'auto' ||
              !getData(`input[type=${type}] + label.margin-inline-start.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label.margin-inline-start.unit`) || 'auto'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label.margin-inline-start.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />
          <div className='mt-1'></div>
          <TextField
            fullWidth
            type='number'
            value={getData(`input[type=${type}] + label.margin-inline-end.value`) || ''}
            onChange={e => UpdateData(`input[type=${type}] + label.margin-inline-end.value`, e.target.value)}
            variant='filled'
            label={locale === 'ar' ? 'المسافة اليمنى' : 'Margin Right'}
            disabled={
              getData(`input[type=${type}] + label.margin-inline-end.unit`) === 'max-content' ||
              getData(`input[type=${type}] + label.margin-inline-end.unit`) === 'min-content' ||
              getData(`input[type=${type}] + label.margin-inline-end.unit`) === 'fit-content' ||
              getData(`input[type=${type}] + label.margin-inline-end.unit`) === 'auto' ||
              !getData(`input[type=${type}] + label.margin-inline-end.unit`)
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Select
                    value={getData(`input[type=${type}] + label.margin-inline-end.unit`) || 'auto'} // الافتراضي px
                    onChange={e => UpdateData(`input[type=${type}] + label.margin-inline-end.unit`, e.target.value)}
                    displayEmpty
                    variant='standard'
                  >
                    <MenuItem value='px'>PX</MenuItem>
                    <MenuItem value='%'>%</MenuItem>
                    <MenuItem value='em'>EM</MenuItem>
                    <MenuItem value='vw'>VW</MenuItem>
                    <MenuItem value='max-content'>Max-Content</MenuItem>
                    <MenuItem value='min-content'>Min-Content</MenuItem>
                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                    <MenuItem value='auto'>Auto</MenuItem>
                  </Select>
                </InputAdornment>
              )
            }}
          />

          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`input[type=${type}]:checked + label:before.background-color.unit`) || '#575757'}
              onBlur={e =>
                UpdateData(`input[type=${type}]:checked + label:before.background-color.unit`, e.target.value)
              }
              label={locale === 'ar' ? 'اللون الخلفي' : 'Background Color'}
              variant='filled'
            />
          </div>
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`input[type=${type}]:checked + label:before.border-color.unit`) || '#575757'}
              onBlur={e => UpdateData(`input[type=${type}]:checked + label:before.border-color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون الحدود' : 'Border Color'}
              variant='filled'
            />
          </div>
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData(`input[type=${type}]:checked + label:before.color.unit`) || '#fff'}
              onBlur={e => UpdateData(`input[type=${type}]:checked + label:before.color.unit`, e.target.value)}
              label={locale === 'ar' ? 'اللون' : 'Color'}
              variant='filled'
            />
          </div>

          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData('#first-label.color.unit') || '#555'}
              onBlur={e => UpdateData('#first-label.color.unit', e.target.value)}
              label={locale === 'ar' ? 'لون التسمية' : 'Label Color'}
              variant='filled'
            />
          </div>
        </Collapse>
      )}
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'roles')}>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.required}
              onChange={e =>
                onChange({
                  ...data,
                  required: e.target.checked
                })
              }
            />
          }
          label={locale === 'ar' ? 'مطلوب' : 'Required'}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={data.unique}
              onChange={e =>
                onChange({
                  ...data,
                  unique: e.target.checked
                })
              }
            />
          }
          label={locale === 'ar' ? 'مطلوب' : 'Unique'}
        />
        {type === 'file' && (
          <>
            {/* <div className='p-2 mt-2 rounded-md border-2 border-gray-300'>
              <h4>{locale === 'ar' ? 'الملفات المسموحة' : 'Allowed Files'}:</h4>
              <Grid container spacing={2}>
                <Grid item xs={4} key={type}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.multiple}
                        onChange={() => onChange({ ...data, multiple: !data.multiple })}
                      />
                    }
                    label={locale === 'ar' ? 'متعددة' : 'Multiple'}
                  />
                </Grid>
              </Grid>
            </div> */}
            <div className='p-2 mt-2 rounded-md border-2 border-gray-300'>
              <h4>{locale === 'ar' ? 'الملفات المسموحة' : 'Allowed Files'}:</h4>
              <Grid container spacing={2}>
                {fileTypes.map(type => (
                  <Grid item xs={4} key={type}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={fileExtensions.includes(type)}
                          onChange={() => handleToggleFileExtension(type)}
                        />
                      }
                      label={type}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>
          </>
        )}
        {type === 'checkbox' && (
          <>
            <TextField
              label={locale === 'ar' ? 'الحد الأدنى' : 'Min Length'}
              type='number'
              fullWidth
              margin='normal'
              value={data.minLength}
              onChange={e =>
                onChange({
                  ...data,
                  minLength: e.target.value
                })
              }
            />
            <TextField
              label={locale === 'ar' ? 'الحد الأقصى' : 'Max Length'}
              type='number'
              fullWidth
              margin='normal'
              value={data.maxLength}
              onChange={e =>
                onChange({
                  ...data,
                  maxLength: e.target.value
                })
              }
            />
          </>
        )}
      </Collapse>
    </div>
  )
}
