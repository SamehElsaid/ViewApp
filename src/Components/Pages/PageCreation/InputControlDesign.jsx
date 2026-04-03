/* eslint-disable react-hooks/exhaustive-deps */
import { Icon } from '@iconify/react'
import {
  Box,
  Drawer,
  Dialog,
  IconButton,
  InputAdornment,
  MenuItem,
  Button,
  ButtonGroup,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  Tooltip
} from '@mui/material'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { cssToObject, extractValueAndUnit, getData, getDataInObject, objectToCss } from 'src/Components/_Shared'
import CssEditor from 'src/Components/FormCreation/PageCreation/CssEditor'
import { UnmountClosed } from 'react-collapse'
import { useIntl } from 'react-intl'
import { axiosGet, axiosPost } from 'src/Components/axiosCall'
import IconifyIcon from 'src/Components/icon'
import JsEditor from 'src/Components/FormCreation/PageCreation/jsEditor'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Collapse from '@kunukn/react-collapse'
import { toast } from 'react-toastify'
import Trigger from '../ControlDesignAndValidation/Trigger'
import SwitchView from '../ControlDesignAndValidation/SwitchView'
import TriggerControl from '../ControlDesignAndValidation/TriggerControl'
import PrintSetting from './PrintSetting'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import addDays from 'date-fns/addDays'
import ar from 'date-fns/locale/ar-EG'
import en from 'date-fns/locale/en-US'
import ExampleCustomInput from '../FiledesComponent/ExampleCustomInput'

function convertMomentToDateFnsFormat(format) {
  if (!format || typeof format !== 'string') return 'yyyy-MM-dd'

  return format
    .replace(/DD/g, 'dd')
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g, 'yy')
    .replace(/HH/g, 'HH')
    .replace(/mm/g, 'mm')
    .replace(/ss/g, 'ss')
}

const Header = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '20px 10px',
  justifyContent: 'space-between',
  position: 'sticky',
  background: '#fff',
  borderBottom: '1px solid #00d0e7',
  zIndex: 50,
  top: 0
}))

export default function InputControlDesign({
  open,
  handleClose,
  design,
  locale,
  data,
  onChange,
  roles,
  fields,
  type,
  setAssociationsOpen
}) {
  const Css = cssToObject(design)
  const getApiData = useSelector(rx => rx.api.data)
  const { messages } = useIntl()
  const [selected, setSelect] = useState('style')
  const [writeValue, setWriteValue] = useState(roles?.onMount?.value ?? '')
  const [mountDateDialogOpen, setMountDateDialogOpen] = useState(false)
  const [openTrigger, setOpenTrigger] = useState(false)
  const [currentFields, setCurrentFields] = useState([])
  const [parentFields, setParentFields] = useState([])
  const [parentKey, setParentKey] = useState(null)
  const [obj, setObj] = useState(false)
  const [showEvent, setShowEvent] = useState(false)
  const [showTrigger, setShowTrigger] = useState(false)
  const addMoreElement = data.addMoreElement ?? []
  const findMyInput = addMoreElement.find(inp => inp.id === open?.id)
  const [openTab, setOpenTab] = useState(false)

  const [tabData, setTabData] = useState({
    name_ar: '',
    name_en: '',
    link: '',
    active: true,
    visibilityMode: 'enable',
    visibilityCondition: ''
  })
  const [editTab, setEditTab] = useState(false)
  const [controlTrigger, setControlTrigger] = useState(false)
  useEffect(() => {
    if (roles.api_url) {
      const items = getApiData.find(item => item.link === roles.api_url)?.data
      if (items) {
        setObj(items)
      }
    } else {
      setObj(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.api_url])

  useEffect(() => {
    if (open && (open.type === 'OneToOne' || open.type === 'OneToMany' || open.type === 'ManyToMany')) {
      try {
        axiosGet(`collections/get-by-key?key=${open.options.source}`, locale).then(res => {
          if (res.status) {
            axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale).then(res => {
              if (res.status) {
                setCurrentFields(res.data)
              }
            })
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }, [open])

  useEffect(() => {
    if (parentKey) {
      axiosGet(`collections/get-by-key?key=${parentKey}`).then(res => {
        if (res.status) {
          axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale).then(res => {
            if (res.status) {
              setParentFields(res.data)
            }
          })
        }
      })
    }
  }, [parentKey])

  useEffect(() => {
    setWriteValue(roles?.onMount?.value ?? '')
  }, [roles])

  // Auto-set On Mount type to 'required' if field validation is required
  useEffect(() => {
    if (open && open.type !== 'new_element' && open.validationData) {
      const hasRequiredValidation = open.validationData.some(
        item => item.ruleType && item.ruleType.toLowerCase() === 'required'
      )

      // Only set to 'required' if validation is required and On Mount type is not already set to 'required'
      // This ensures required fields automatically have 'required' in On Mount section
      if (hasRequiredValidation && roles?.onMount?.type !== 'required') {
        const additional_fields = data.additional_fields ?? []
        const findMyInput = additional_fields.find(inp => inp.key === open.id)

        if (findMyInput) {
          if (!findMyInput.roles) {
            findMyInput.roles = {}
          }
          if (!findMyInput.roles.onMount) {
            findMyInput.roles.onMount = { type: '', value: roles?.onMount?.value || '' }
          }
          findMyInput.roles.onMount.type = 'required'
        } else {
          const myEdit = {
            key: open.id,
            design: objectToCss(Css).replaceAll('NaN', ''),
            roles: {
              ...roles,
              onMount: {
                type: 'required',
                value: roles?.onMount?.value || ''
              }
            }
          }
          additional_fields.push(myEdit)
        }
        onChange({ ...data, additional_fields: additional_fields })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.validationData, open?.id, open?.type])

  const handleCloseTab = () => {
    setOpenTab(false)
    setTabData({ name_ar: '', name_en: '', link: '', active: true, visibilityMode: 'enable', visibilityCondition: '' })
    setEditTab(false)
  }

  const UpdateData = (key, value) => {
    const additional_fields = data.additional_fields ?? []
    const findMyInput = additional_fields.find(inp => inp.key === open.id)

    const Css = cssToObject(design)

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

    if (findMyInput) {
      findMyInput.design = objectToCss(Css).replaceAll('NaN', '')
    } else {
      const myEdit = {
        key: open.id,
        design: objectToCss(Css).replaceAll('NaN', ''),
        roles: { ...roles }
      }
      additional_fields.push(myEdit)
    }
    onChange({ ...data, additional_fields: additional_fields })
  }

  const addTab = () => {
    if (tabData.name_ar.trim().length > 100 || tabData.name_en.trim().length > 100) {
      toast.error(messages.Name_must_be_less_than_100_characters)

      return
    }

    // Validate special characters for tab names (Arabic and English)
    const invalidArabic = /[^\w\sأ-ي]/.test(tabData.name_ar || '')
    const invalidEnglish = /[^\w\s]/.test(tabData.name_en || '')
    if (invalidArabic || invalidEnglish) {
      toast.error(
        messages.Invalid_tab_name_characters ||
        'Tab name contains invalid characters. Only letters, numbers, underscore, and spaces are allowed.'
      )

      return
    }

    if (tabData.name_ar && tabData.name_en && tabData.link) {
      const newTab = {
        name_ar: tabData.name_ar.replace(/[^\w\sأ-ي]/g, ''),
        name_en: tabData.name_en.replace(/[^\w\s]/g, ''),
        link: tabData.link,
        active: tabData.active,
        visibilityMode: tabData.visibilityMode || 'enable',
        visibilityCondition: tabData.visibilityMode === 'conditional' ? tabData.visibilityCondition || '' : ''
      }
      if (editTab) {
        const findMyInput = addMoreElement.find(inp => inp.id === open?.id)
        if (findMyInput) {
          // If this tab is set active, deactivate all others
          if (newTab.active) {
            findMyInput.data = (findMyInput.data || []).map((t, idx) => ({
              ...t,
              active: idx === editTab - 1
            }))
          }
          findMyInput.data[editTab - 1] = { ...findMyInput.data[editTab - 1], ...newTab }
          onChange({ ...data, addMoreElement: addMoreElement })
        }
      } else {
        const findMyInput = addMoreElement.find(inp => inp.id === open?.id)
        if (findMyInput) {
          const existing = findMyInput.data || []
          const updatedExisting = newTab.active ? existing.map(t => ({ ...t, active: false })) : existing
          findMyInput.data = [newTab, ...updatedExisting]
          onChange({ ...data, addMoreElement: addMoreElement })
        }
      }
      handleCloseTab()
    } else {
      toast.error(messages.You_must_fill_the_data)
    }
  }

  useEffect(() => {
    if (!open) {
      setSelect('style')
    }
  }, [open])

  const updateProgressBarSegments = segments => {
    const additional_fields = data.additional_fields ?? []
    const findMyInput = additional_fields.find(inp => inp.key === open.id)
    if (findMyInput) {
      findMyInput.roles = findMyInput.roles ?? {}
      findMyInput.roles.progressBarSegments = segments
    } else {
      additional_fields.push({
        key: open.id,
        design: objectToCss(Css).replaceAll('NaN', ''),
        roles: { ...roles, progressBarSegments: segments }
      })
    }
    onChange({ ...data, additional_fields })
  }

  const parseDateValue = val => {
    if (val == null || val === '') return null
    const d = val instanceof Date ? val : new Date(val)

    return isNaN(d.getTime()) ? null : d
  }

  const commitOnMountValue = valueStr => {
    const additional_fields = data.additional_fields ?? []
    const findMyInput = additional_fields.find(inp => inp.key === open.id)
    if (findMyInput) {
      findMyInput.roles.onMount.value = valueStr
      if (obj) {
        findMyInput.roles.apiKeyData = getData(obj, valueStr, '')
      }
    } else {
      const myEdit = {
        key: open.id,
        design: objectToCss(Css).replaceAll('NaN', ''),
        roles: {
          ...roles,
          onMount: { type: roles.onMount.type, value: valueStr },
          apiKeyData: obj ? getData(obj, valueStr, '') : ''
        }
      }
      additional_fields.push(myEdit)
    }
    onChange({ ...data, additional_fields: additional_fields })
  }

  return (
    <>


      <Trigger
        openTrigger={openTrigger}
        messages={messages}
        locale={locale}
        fields={fields ?? []}
        data={data}
        onChange={onChange}
        open={open}
        setOpenTrigger={setOpenTrigger}
        currentFields={currentFields}
        parentFields={parentFields}
        setParentKey={setParentKey}
        parentKey={parentKey}
        Css={design}
        roles={roles}
        design={design}
        objectToCss={objectToCss}
      />

      <Drawer
        open={Boolean(open)}
        anchor='right'
        variant='temporary'
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '70%' } } }}
      >
        <Header>
          <Typography className='capitalize text-[#555] !font-bold' variant='h4'>
            {locale === 'ar' ? open?.nameAr ?? open?.name_ar : open?.nameEn ?? open?.name_en}
          </Typography>
          <IconButton
            size='small'
            onClick={handleClose}
            color='error'
            variant='contained'
            sx={{
              p: '0.438rem',
              borderRadius: 50,
              backgroundColor: 'action.selected'
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>
        <Box className='h-full'>
          <div className='flex flex-col p-4 h-full'>
            <div className='flex || items-center || justify-center mb-5'>
              <ButtonGroup variant='outlined' color='primary'>
                <Button
                  variant={selected === 'style' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setSelect('style')
                  }}
                >
                  {messages.dialogs.style}
                </Button>
                <Button
                  onClick={() => {
                    setSelect('roles')
                  }}
                  variant={selected === 'roles' ? 'contained' : 'outlined'}
                >
                  {messages.dialogs.rules}
                </Button>
                {roles?.type === 'print' && (
                  <Button
                    onClick={() => {
                      setSelect('print')
                    }}
                    variant={selected === 'print' ? 'contained' : 'outlined'}
                  >
                    {messages.dialogs.print}
                  </Button>
                )}

                {open?.descriptionAr === 'progress_bar' && open?.type === 'Number' && (
                  <Button
                    onClick={() => {
                      setSelect('progress_bar')
                    }}
                    variant={selected === 'progress_bar' ? 'contained' : 'outlined'}
                  >
                    {messages.dialogs.progress_bar_control}
                  </Button>
                )}
                {(type === 'from-collection' || open?.key?.includes('[')) && (open.fieldCategory === 'Associations' || open.type === "SingleText") && (
                  <Button
                    onClick={() => {
                      setSelect('associations')
                    }}
                    variant={selected === 'associations' ? 'contained' : 'outlined'}
                  >
                    associations
                  </Button>
                )}
              </ButtonGroup>
            </div>
            {open && (
              <div className='flex flex-col gap-2 py-5'>
                <UnmountClosed isOpened={Boolean(selected === 'style')}>
                  <>
                    {open.type === 'new_element' && (
                      <div className='flex flex-col gap-2'>
                        <TextField
                          fullWidth
                          type='text'
                          defaultValue={findMyInput?.name_en || ''}
                          onBlur={e => {
                            const newData = { ...findMyInput, name_en: e.target.value }
                            const newAddMoreElement = addMoreElement.map(inp => (inp.id === open.id ? newData : inp))
                            onChange({ ...data, addMoreElement: newAddMoreElement })
                          }}
                          variant='filled'
                          label={messages.dialogs.nameInEnglish}
                        />{' '}
                        <TextField
                          fullWidth
                          type='text'
                          defaultValue={findMyInput?.name_ar || ''}
                          onBlur={e => {
                            const newData = { ...findMyInput, name_ar: e.target.value }
                            const newAddMoreElement = addMoreElement.map(inp => (inp.id === open.id ? newData : inp))
                            onChange({ ...data, addMoreElement: newAddMoreElement })
                          }}
                          variant='filled'
                          label={messages.dialogs.nameInArabic}
                        />
                        {open.kind === 'submit' && (
                          <>
                            {' '}
                            <TextField
                              fullWidth
                              type='text'
                              defaultValue={findMyInput?.warningMessageEn || ''}
                              onBlur={e => {
                                const newData = { ...findMyInput, warningMessageEn: e.target.value }

                                const newAddMoreElement = addMoreElement.map(inp =>
                                  inp.id === open.id ? newData : inp
                                )
                                onChange({ ...data, addMoreElement: newAddMoreElement })
                              }}
                              variant='filled'
                              label={messages.dialogs.warningMessageInPopupEnglish}
                            />{' '}
                            <TextField
                              fullWidth
                              type='text'
                              defaultValue={findMyInput?.warningMessageAr || ''}
                              onBlur={e => {
                                const newData = { ...findMyInput, warningMessageAr: e.target.value }

                                const newAddMoreElement = addMoreElement.map(inp =>
                                  inp.id === open.id ? newData : inp
                                )
                                onChange({ ...data, addMoreElement: newAddMoreElement })
                              }}
                              variant='filled'
                              label={messages.dialogs.warningMessageInPopupArabic}
                            />
                          </>
                        )}
                      </div>
                    )}

                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.label?.label_en || open?.nameEn || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles = findMyInput.roles ?? {}
                          findMyInput.roles.label = findMyInput.roles.label ?? {}
                          findMyInput.roles.label.label_en = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              label: {
                                label_ar: roles?.label?.label_ar || '',
                                label_en: e.target.value
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.labelInEnglish || 'Label in English'}
                    />
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.label?.label_ar || open?.nameAr || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles = findMyInput.roles ?? {}
                          findMyInput.roles.label = findMyInput.roles.label ?? {}

                          findMyInput.roles.label.label_ar = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              label: {
                                label_ar: e.target.value,
                                label_en: roles?.label?.label_en || ''
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.labelInArabic || 'Label in Arabic'}
                    />

                    {open?.descriptionEn == 'rate' ? (
                      <>
                        <TextField
                          fullWidth
                          defaultValue={roles?.placeholder?.placeholder_en || '5'}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles.placeholder.placeholder_en = e.target.value
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  placeholder: {
                                    placeholder_ar: roles.placeholder.placeholder_ar,
                                    placeholder_en: e.target.value
                                  }
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          type='number'
                          variant='filled'
                          label={messages.dialogs.maxValue}
                        />
                      </>
                    ) : (
                      <>
                        <TextField
                          fullWidth
                          type='text'
                          defaultValue={roles?.placeholder?.placeholder_en || ''}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles.placeholder.placeholder_en = e.target.value
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  placeholder: {
                                    placeholder_ar: roles.placeholder.placeholder_ar,
                                    placeholder_en: e.target.value
                                  }
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.placeholderInEnglish}
                        />
                        <TextField
                          fullWidth
                          type='text'
                          defaultValue={roles?.placeholder?.placeholder_ar || ''}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles.placeholder.placeholder_ar = e.target.value
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  placeholder: {
                                    placeholder_ar: e.target.value,
                                    placeholder_en: roles.placeholder.placeholder_en
                                  }
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.placeholderInArabic}
                        />
                      </>
                    )}
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.hover?.hover_ar || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles.hover.hover_ar = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              hover: {
                                hover_ar: e.target.value,
                                hover_en: roles.hover.hover_en
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.hoverTextInArabic}
                    />
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.hover?.hover_en || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles.hover.hover_en = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              hover: {
                                hover_ar: roles.hover.hover_ar,
                                hover_en: e.target.value
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.hoverTextInEnglish}
                    />
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.hint?.hint_ar || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles.hint.hint_ar = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              hint: {
                                hint_ar: e.target.value,
                                hint_en: roles.hint.hint_en
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.hintInArabic}
                    />
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.hint?.hint_en || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles.hint.hint_en = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              hint: {
                                hint_ar: roles.hint.hint_ar,
                                hint_en: e.target.value
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.hintInEnglish}
                    />
                    {open.key === 'button' && (
                      <>

                        <FormControl fullWidth variant='filled'>
                          <InputLabel>{messages.dialogs.type}</InputLabel>
                          <Select
                            value={roles?.type || 'button'}
                            onChange={e => {
                              const additional_fields = data.additional_fields ?? []
                              const findMyInput = additional_fields.find(inp => inp.key === open.id)
                              if (findMyInput) {
                                findMyInput.roles.type = e.target.value
                              } else {
                                const myEdit = {
                                  key: open.id,
                                  design: objectToCss(Css).replaceAll('NaN', ''),
                                  roles: {
                                    ...roles,
                                    type: e.target.value
                                  }
                                }
                                additional_fields.push(myEdit)
                              }
                              onChange({ ...data, additional_fields: additional_fields })
                            }}
                          >
                            <MenuItem value='submit'>{messages.dialogs.submit}</MenuItem>
                            <MenuItem value='button'>{messages.dialogs.button}</MenuItem>
                            <MenuItem value='print'>{messages.dialogs.print} </MenuItem>
                            <MenuItem value='print_page'>{messages.dialogs.printPage} </MenuItem>
                            <MenuItem value='saveAsDraft'>{messages.dialogs.saveAsDraft} </MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                    {roles?.type === "print_page"
                      ?
                      <>   <TextField
                        fullWidth
                        type='text'
                        defaultValue={roles?.href || ''}
                        onBlur={e => {
                          const additional_fields = data.additional_fields ?? []
                          const findMyInput = additional_fields.find(inp => inp.key === open.id)
                          if (findMyInput) {
                            findMyInput.roles.href = e.target.value
                          } else {
                            const myEdit = {
                              key: open.id,
                              design: objectToCss(Css).replaceAll('NaN', ''),
                              roles: {
                                ...roles,
                                href: e.target.value
                              }
                            }
                            additional_fields.push(myEdit)
                          }
                          onChange({ ...data, additional_fields: additional_fields })
                        }}
                        variant='filled'
                        label={messages.dialogs.href || 'Href'}
                      /></>
                      :
                      <></>
                    }

                    {open.type === 'File' && (
                      <TextField
                        fullWidth
                        type='number'
                        defaultValue={roles?.size || '500'}
                        InputProps={{
                          endAdornment: <InputAdornment position='end'>KB</InputAdornment>
                        }}
                        onBlur={e => {
                          const additional_fields = data.additional_fields ?? []
                          const findMyInput = additional_fields.find(inp => inp.key === open.id)
                          if (findMyInput) {
                            findMyInput.roles.size = e.target.value
                          } else {
                            const myEdit = {
                              key: open.id,
                              design: objectToCss(Css).replaceAll('NaN', ''),
                              roles: {
                                ...roles,
                                size: e.target.value
                              }
                            }
                            additional_fields.push(myEdit)
                          }
                          onChange({ ...data, additional_fields: additional_fields })
                        }}
                        variant='filled'
                        label={messages.dialogs.maxFileSize}
                      />
                    )}
                    {open.type === 'Date' && (
                      <>
                        {open.descriptionEn == 'timeOnly' && (
                          <FormControl fullWidth margin='normal'>
                            <InputLabel> {messages.dialogs.timeFormat}</InputLabel>

                            <Select
                              className='flex-1'
                              variant='filled'
                              value={roles?.timeFormat || '24hrs'}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.timeFormat = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: {
                                      ...roles,
                                      timeFormat: e.target.value === '' ? false : e.target.value
                                    }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            >
                              <MenuItem value='12hrs'>12hrs</MenuItem>
                              <MenuItem value='24hrs'>24hrs</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                        <FormControl fullWidth margin='normal'>
                          <div className='flex items-center gap-2'>
                            <InputLabel> {messages.dialogs.beforeDateType}</InputLabel>

                            <Select
                              className='flex-1'
                              variant='filled'
                              value={roles?.beforeDateType || 'select'}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.beforeDateType = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: {
                                      ...roles,
                                      beforeDateType: e.target.value === '' ? false : e.target.value
                                    }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            >
                              <MenuItem value='select'>---select---</MenuItem>
                              <MenuItem value='date'>{messages.dialogs.insertDate}</MenuItem>
                              <MenuItem value='days'>{messages.dialogs.insertDays}</MenuItem>
                            </Select>
                            <button
                              type='button'
                              className='px-2 py-1 text-xs border rounded'
                              onClick={() => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.beforeDateType = ''
                                  findMyInput.roles.beforeDateValue = ''
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            >
                              {messages?.Clear || 'Clear'}
                            </button>
                          </div>

                          <Collapse
                            transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                            isOpen={Boolean(roles?.beforeDateType === 'date')}
                          >
                            <TextField
                              fullWidth
                              variant='filled'
                              type='date'
                              defaultValue={roles?.beforeDateValue || ''}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.beforeDateValue = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: { ...roles, beforeDateValue: e.target.value === '' ? false : e.target.value }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          </Collapse>
                          <Collapse
                            transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                            isOpen={Boolean(roles?.beforeDateType === 'days')}
                          >
                            <TextField
                              fullWidth
                              variant='filled'
                              type='number'
                              defaultValue={roles?.beforeDateValue || ''}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.beforeDateValue = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: { ...roles, beforeDateValue: e.target.value }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          </Collapse>
                        </FormControl>
                        <FormControl fullWidth margin='normal'>
                          <InputLabel> {messages.dialogs.afterDateType}</InputLabel>
                          <div className='flex items-center gap-2'>
                            <Select
                              className='flex-1'
                              variant='filled'
                              value={roles?.afterDateType || 'select'}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.afterDateType = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: {
                                      ...roles,
                                      afterDateType: e.target.value
                                    }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            >
                              <MenuItem value='select'>---select---</MenuItem>
                              <MenuItem value='date'>{messages.dialogs.insertDate}</MenuItem>
                              <MenuItem value='days'>{messages.dialogs.insertDays}</MenuItem>
                            </Select>
                            <button
                              type='button'
                              className='px-2 py-1 text-xs border rounded'
                              onClick={() => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.afterDateType = ''
                                  findMyInput.roles.afterDateValue = ''
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            >
                              {messages?.Clear || 'Clear'}
                            </button>
                          </div>

                          <Collapse
                            transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                            isOpen={Boolean(roles?.afterDateType === 'date')}
                          >
                            <TextField
                              fullWidth
                              variant='filled'
                              type='date'
                              defaultValue={roles?.afterDateValue || ''}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.afterDateValue = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: { ...roles, afterDateValue: e.target.value }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          </Collapse>
                          <Collapse
                            transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                            isOpen={Boolean(roles?.afterDateType === 'days')}
                          >
                            <TextField
                              fullWidth
                              variant='filled'
                              type='number'
                              defaultValue={roles?.afterDateValue || ''}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles.afterDateValue = e.target.value
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: { ...roles, afterDateValue: e.target.value }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          </Collapse>
                        </FormControl>
                      </>
                    )}
                    {(open.type === 'SingleText' ||
                      open.type === 'Number' ||
                      open.type === 'Phone' ||
                      open.type === 'URL' ||
                      open.type === 'Email' ||
                      open.type === 'Password' ||
                      open.type === 'LongText') && (
                        <>
                          {open?.descriptionEn !== 'rate' && (
                            <>
                              <TextField
                                fullWidth
                                type='number'
                                value={extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).value || ''}
                                onChange={e =>
                                  UpdateData(
                                    '#parent-input.width',
                                    e.target.value + extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit
                                  )
                                }
                                variant='filled'
                                label={messages.dialogs.width}
                                disabled={
                                  extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit ===
                                  'max-content' ||
                                  extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit ===
                                  'min-content' ||
                                  extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit ===
                                  'fit-content' ||
                                  extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit === 'auto' ||
                                  !extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position='end'>
                                      <Select
                                        value={
                                          extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).unit || '%'
                                        }
                                        onChange={e => {
                                          if (
                                            e.target.value === 'max-content' ||
                                            e.target.value === 'min-content' ||
                                            e.target.value === 'fit-content' ||
                                            e.target.value === 'auto'
                                          ) {
                                            UpdateData('#parent-input.width', e.target.value)
                                          } else {
                                            UpdateData(
                                              '#parent-input.width',
                                              extractValueAndUnit(getDataInObject(Css, '#parent-input.width')).value +
                                              e.target.value
                                            )
                                          }
                                        }}
                                        displayEmpty
                                        variant='standard'
                                      >
                                        <MenuItem value='px'>PX</MenuItem>
                                        <MenuItem value='%'>%</MenuItem>
                                        <MenuItem value='EM'>EM</MenuItem>
                                        <MenuItem value='VW'>VW</MenuItem>
                                        <MenuItem value='max-content'>Max-Content</MenuItem>
                                        <MenuItem value='min-content'>Min-Content</MenuItem>
                                        <MenuItem value='fit-content'>Fit-Content</MenuItem>
                                        <MenuItem value='auto'>Auto</MenuItem>
                                      </Select>
                                    </InputAdornment>
                                  )
                                }}
                              />
                              <TextField
                                fullWidth
                                type='number'
                                value={
                                  extractValueAndUnit(
                                    getDataInObject(Css, open.type === 'LongText' ? 'textarea.height' : 'input.height')
                                  ).value || ''
                                }
                                onChange={e =>
                                  UpdateData(
                                    open.type === 'LongText' ? 'textarea.height' : 'input.height',
                                    e.target.value +
                                    extractValueAndUnit(
                                      getDataInObject(
                                        Css,
                                        open.type === 'LongText' ? 'textarea.height' : 'input.height'
                                      )
                                    ).unit
                                  )
                                }
                                variant='filled'
                                label={messages.dialogs.height}
                                disabled={
                                  extractValueAndUnit(
                                    getDataInObject(Css, open.type === 'LongText' ? 'textarea.height' : 'input.height')
                                  ).unit === 'max-content' ||
                                  extractValueAndUnit(
                                    getDataInObject(Css, open.type === 'LongText' ? 'textarea.height' : 'input.height')
                                  ).unit === 'min-content' ||
                                  extractValueAndUnit(
                                    getDataInObject(Css, open.type === 'LongText' ? 'textarea.height' : 'input.height')
                                  ).unit === 'fit-content' ||
                                  extractValueAndUnit(
                                    getDataInObject(Css, open.type === 'LongText' ? 'textarea.height' : 'input.height')
                                  ).unit === 'auto' ||
                                  !extractValueAndUnit(
                                    getDataInObject(Css, open.type === 'LongText' ? 'textarea.height' : 'input.height')
                                  ).unit
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position='end'>
                                      <Select
                                        value={
                                          extractValueAndUnit(
                                            getDataInObject(
                                              Css,
                                              open.type === 'LongText' ? 'textarea.height' : 'input.height'
                                            )
                                          ).unit || '%'
                                        }
                                        onChange={e => {
                                          if (
                                            e.target.value === 'max-content' ||
                                            e.target.value === 'min-content' ||
                                            e.target.value === 'fit-content' ||
                                            e.target.value === 'auto'
                                          ) {
                                            UpdateData(
                                              open.type === 'LongText' ? 'textarea.height' : 'input.height',
                                              e.target.value
                                            )
                                          } else {
                                            UpdateData(
                                              open.type === 'LongText' ? 'textarea.height' : 'input.height',
                                              extractValueAndUnit(
                                                getDataInObject(
                                                  Css,
                                                  open.type === 'LongText' ? 'textarea.height' : 'input.height'
                                                )
                                              ).value + e.target.value
                                            )
                                          }
                                        }}
                                        displayEmpty
                                        variant='standard'
                                      >
                                        <MenuItem value='px'>PX</MenuItem>
                                        <MenuItem value='%'>%</MenuItem>
                                        <MenuItem value='EM'>EM</MenuItem>
                                        <MenuItem value='VW'>VW</MenuItem>
                                        <MenuItem value='max-content'>Max-Content</MenuItem>
                                        <MenuItem value='min-content'>Min-Content</MenuItem>
                                        <MenuItem value='fit-content'>Fit-Content</MenuItem>
                                        <MenuItem value='auto'>Auto</MenuItem>
                                      </Select>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </>
                          )}
                          <TextField
                            fullWidth
                            type='number'
                            value={extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).value || ''}
                            onChange={e =>
                              UpdateData(
                                '#parent-input.margin-top',
                                e.target.value +
                                extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit
                              )
                            }
                            variant='filled'
                            label={messages.dialogs.marginTop}
                            disabled={
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit ===
                              'max-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit ===
                              'min-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit ===
                              'fit-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit === 'auto' ||
                              !extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <Select
                                    value={
                                      extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).unit || '%'
                                    }
                                    onChange={e => {
                                      if (
                                        e.target.value === 'max-content' ||
                                        e.target.value === 'min-content' ||
                                        e.target.value === 'fit-content' ||
                                        e.target.value === 'auto'
                                      ) {
                                        UpdateData('#parent-input.margin-top', e.target.value)
                                      } else {
                                        UpdateData(
                                          '#parent-input.margin-top',
                                          extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-top')).value +
                                          e.target.value
                                        )
                                      }
                                    }}
                                    displayEmpty
                                    variant='standard'
                                  >
                                    <MenuItem value='px'>PX</MenuItem>
                                    <MenuItem value='%'>%</MenuItem>
                                    <MenuItem value='EM'>EM</MenuItem>
                                    <MenuItem value='VW'>VW</MenuItem>
                                    <MenuItem value='max-content'>Max-Content</MenuItem>
                                    <MenuItem value='min-content'>Min-Content</MenuItem>
                                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                                    <MenuItem value='auto'>Auto</MenuItem>
                                  </Select>
                                </InputAdornment>
                              )
                            }}
                          />
                          <TextField
                            fullWidth
                            type='number'
                            value={extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).value || ''}
                            onChange={e =>
                              UpdateData(
                                '#parent-input.margin-bottom',
                                e.target.value +
                                extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit
                              )
                            }
                            variant='filled'
                            label={messages.dialogs.marginBottom}
                            disabled={
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit ===
                              'max-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit ===
                              'min-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit ===
                              'fit-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit === 'auto' ||
                              !extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <Select
                                    value={
                                      extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).unit || '%'
                                    }
                                    onChange={e => {
                                      if (
                                        e.target.value === 'max-content' ||
                                        e.target.value === 'min-content' ||
                                        e.target.value === 'fit-content' ||
                                        e.target.value === 'auto'
                                      ) {
                                        UpdateData('#parent-input.margin-bottom', e.target.value)
                                      } else {
                                        UpdateData(
                                          '#parent-input.margin-bottom',
                                          extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-bottom')).value +
                                          e.target.value
                                        )
                                      }
                                    }}
                                    displayEmpty
                                    variant='standard'
                                  >
                                    <MenuItem value='px'>PX</MenuItem>
                                    <MenuItem value='%'>%</MenuItem>
                                    <MenuItem value='EM'>EM</MenuItem>
                                    <MenuItem value='VW'>VW</MenuItem>
                                    <MenuItem value='max-content'>Max-Content</MenuItem>
                                    <MenuItem value='min-content'>Min-Content</MenuItem>
                                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                                    <MenuItem value='auto'>Auto</MenuItem>
                                  </Select>
                                </InputAdornment>
                              )
                            }}
                          />
                          <TextField
                            fullWidth
                            type='number'
                            value={
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).value || ''
                            }
                            onChange={e =>
                              UpdateData(
                                '#parent-input.margin-inline-start',
                                e.target.value +
                                extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).unit
                              )
                            }
                            variant='filled'
                            label={messages.dialogs.marginLeft}
                            disabled={
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).unit ===
                              'max-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).unit ===
                              'min-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).unit ===
                              'fit-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).unit ===
                              'auto' ||
                              !extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start')).unit
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <Select
                                    value={
                                      extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start'))
                                        .unit || '%'
                                    }
                                    onChange={e => {
                                      if (
                                        e.target.value === 'max-content' ||
                                        e.target.value === 'min-content' ||
                                        e.target.value === 'fit-content' ||
                                        e.target.value === 'auto'
                                      ) {
                                        UpdateData('#parent-input.margin-inline-start', e.target.value)
                                      } else {
                                        UpdateData(
                                          '#parent-input.margin-inline-start',
                                          extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-start'))
                                            .value + e.target.value
                                        )
                                      }
                                    }}
                                    displayEmpty
                                    variant='standard'
                                  >
                                    <MenuItem value='px'>PX</MenuItem>
                                    <MenuItem value='%'>%</MenuItem>
                                    <MenuItem value='EM'>EM</MenuItem>
                                    <MenuItem value='VW'>VW</MenuItem>
                                    <MenuItem value='max-content'>Max-Content</MenuItem>
                                    <MenuItem value='min-content'>Min-Content</MenuItem>
                                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                                    <MenuItem value='auto'>Auto</MenuItem>
                                  </Select>
                                </InputAdornment>
                              )
                            }}
                          />
                          <TextField
                            fullWidth
                            type='number'
                            value={
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).value || ''
                            }
                            onChange={e =>
                              UpdateData(
                                '#parent-input.margin-inline-end',
                                e.target.value +
                                extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit
                              )
                            }
                            variant='filled'
                            label={messages.dialogs.marginRight}
                            disabled={
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit ===
                              'max-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit ===
                              'min-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit ===
                              'fit-content' ||
                              extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit ===
                              'auto' ||
                              !extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <Select
                                    value={
                                      extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end')).unit ||
                                      '%'
                                    }
                                    onChange={e => {
                                      if (
                                        e.target.value === 'max-content' ||
                                        e.target.value === 'min-content' ||
                                        e.target.value === 'fit-content' ||
                                        e.target.value === 'auto'
                                      ) {
                                        UpdateData('#parent-input.margin-inline-end', e.target.value)
                                      } else {
                                        UpdateData(
                                          '#parent-input.margin-inline-end',
                                          extractValueAndUnit(getDataInObject(Css, '#parent-input.margin-inline-end'))
                                            .value + e.target.value
                                        )
                                      }
                                    }}
                                    displayEmpty
                                    variant='standard'
                                  >
                                    <MenuItem value='px'>PX</MenuItem>
                                    <MenuItem value='%'>%</MenuItem>
                                    <MenuItem value='EM'>EM</MenuItem>
                                    <MenuItem value='VW'>VW</MenuItem>
                                    <MenuItem value='max-content'>Max-Content</MenuItem>
                                    <MenuItem value='min-content'>Min-Content</MenuItem>
                                    <MenuItem value='fit-content'>Fit-Content</MenuItem>
                                    <MenuItem value='auto'>Auto</MenuItem>
                                  </Select>
                                </InputAdornment>
                              )
                            }}
                          />
                          {open?.descriptionEn !== 'rate' && (
                            <>
                              <TextField
                                fullWidth
                                type='color'
                                defaultChecked={
                                  getDataInObject(
                                    Css,
                                    open.type === 'LongText' ? 'textarea.background-color' : 'input.background-color'
                                  ) || '#575757'
                                }
                                defaultValue={
                                  getDataInObject(
                                    Css,
                                    open.type === 'LongText' ? 'textarea.background-color' : 'input.background-color'
                                  ) || '#575757'
                                }
                                onBlur={e =>
                                  UpdateData(
                                    open.type === 'LongText' ? 'textarea.background-color' : 'input.background-color',
                                    e.target.value
                                  )
                                }
                                label={messages.dialogs.backgroundColor}
                                variant='filled'
                              />
                              <TextField
                                fullWidth
                                type='color'
                                defaultChecked={
                                  getDataInObject(Css, open.type === 'LongText' ? 'textarea.color' : 'input.color') ||
                                  '#575757'
                                }
                                defaultValue={
                                  getDataInObject(Css, open.type === 'LongText' ? 'textarea.color' : 'input.color') ||
                                  '#575757'
                                }
                                onBlur={e =>
                                  UpdateData(open.type === 'LongText' ? 'textarea.color' : 'input.color', e.target.value)
                                }
                                label={messages.dialogs.color}
                                variant='filled'
                              />
                            </>
                          )}
                          {open?.descriptionEn === 'rate' && (
                            <>
                              <TextField
                                fullWidth
                                type='color'
                                defaultChecked={roles?.color || '#faac00'}
                                defaultValue={roles?.color || '#faac00'}
                                onBlur={e => {
                                  const additional_fields = data.additional_fields ?? []
                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                  if (findMyInput) {
                                    findMyInput.roles.color = e.target.value
                                  } else {
                                    const myEdit = {
                                      key: open.id,
                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                      roles: {
                                        ...roles,
                                        color: e.target.value
                                      }
                                    }
                                    additional_fields.push(myEdit)
                                  }
                                  onChange({ ...data, additional_fields: additional_fields })
                                }}
                                label={messages.dialogs.starColor}
                                variant='filled'
                              />
                            </>
                          )}
                          <TextField
                            fullWidth
                            type='color'
                            defaultChecked={getDataInObject(Css, 'label.color') || '#575757'}
                            defaultValue={getDataInObject(Css, 'label.color') || '#575757'}
                            onBlur={e => UpdateData('label.color', e.target.value)}
                            label={messages.dialogs.labelColor}
                            variant='filled'
                          />
                        </>
                      )}
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.required?.requiredMessageEn || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles = findMyInput.roles ?? {}
                          if (!findMyInput.roles.required) {
                            findMyInput.roles.required = {}
                          }
                          if (!findMyInput.roles.required.requiredMessageEn) {
                            findMyInput.roles.required.requiredMessageEn = ''
                          }
                          findMyInput.roles.required.requiredMessageEn = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              required: {
                                requiredMessageAr: roles?.required?.requiredMessageAr || '',
                                requiredMessageEn: e.target.value
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.requiredMessageInEnglish || 'Required Message in English'}
                    />
                    <TextField
                      fullWidth
                      type='text'
                      defaultValue={roles?.required?.requiredMessageAr || ''}
                      onBlur={e => {
                        const additional_fields = data.additional_fields ?? []
                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                        if (findMyInput) {
                          findMyInput.roles = findMyInput.roles ?? {}
                          if (!findMyInput.roles.required) {
                            findMyInput.roles.required = {}
                          }
                          if (!findMyInput.roles.required.requiredMessageEn) {
                            findMyInput.roles.required.requiredMessageAr = ''
                          }
                          findMyInput.roles.required.requiredMessageAr = e.target.value
                        } else {
                          const myEdit = {
                            key: open.id,
                            design: objectToCss(Css).replaceAll('NaN', ''),
                            roles: {
                              ...roles,
                              required: {
                                requiredMessageAr: e.target.value,
                                requiredMessageEn: roles?.required?.requiredMessageEn || ''
                              }
                            }
                          }
                          additional_fields.push(myEdit)
                        }
                        onChange({ ...data, additional_fields: additional_fields })
                      }}
                      variant='filled'
                      label={messages.dialogs.requiredMessageInArabic || 'Required Message in Arabic'}
                    />
                    {open.kind === "Table" && (
                      <>
                        <TextField
                          fullWidth
                          type='color'
                          defaultValue={roles?.backgroundColor || '#f5f5f5'}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles.backgroundColor = e.target.value
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  backgroundColor: e.target.value
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.backgroundColor || 'Background Color'}
                        />
                        <TextField
                          fullWidth
                          type='color'
                          defaultValue={roles?.textColor || '#333333'}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles.textColor = e.target.value
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  textColor: e.target.value
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.textColor || 'Text Color'}
                        />
                        <TextField
                          fullWidth
                          type='color'
                          defaultValue={roles?.borderColor || '#e0e0e0'}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles.borderColor = e.target.value
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  borderColor: e.target.value
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.borderColor || 'Border Color'}
                        />
                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={roles?.minRow || 1}
                          InputProps={{
                            inputProps: {
                              min: 1,
                              max: 1000
                            }
                          }}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles = findMyInput.roles ?? {}
                              findMyInput.roles.minRow = parseInt(e.target.value)
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  minRow: parseInt(e.target.value)
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.minRow || 'Minimum Row'}
                        />
                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={roles?.maxRow || 1000}
                          InputProps={{
                            inputProps: {
                              min: 1,
                              max: 1000
                            }
                          }}
                          onBlur={e => {
                            const additional_fields = data.additional_fields ?? []
                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                            if (findMyInput) {
                              findMyInput.roles = findMyInput.roles ?? {}
                              findMyInput.roles.maxRow = parseInt(e.target.value)
                            } else {
                              const myEdit = {
                                key: open.id,
                                design: objectToCss(Css).replaceAll('NaN', ''),
                                roles: {
                                  ...roles,
                                  maxRow: parseInt(e.target.value)
                                }
                              }
                              additional_fields.push(myEdit)
                            }
                            onChange({ ...data, additional_fields: additional_fields })
                          }}
                          variant='filled'
                          label={messages.dialogs.maxRow || 'Maximum Row'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(roles?.showOldData)}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles = findMyInput.roles ?? {}
                                  findMyInput.roles.showOldData = e.target.checked
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: {
                                      ...roles,
                                      showOldData: e.target.checked
                                    }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'إظهار البيانات القديمة' : 'Show Old Data'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(roles?.showBtn ?? true)}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles = findMyInput.roles ?? {}
                                  findMyInput.roles.showBtn = e.target.checked
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: {
                                      ...roles,
                                      showBtn: e.target.checked
                                    }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'إظهار زر الحفظ' : 'Show Save Button'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(roles?.delete ?? true)}
                              onChange={e => {
                                const additional_fields = data.additional_fields ?? []
                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                if (findMyInput) {
                                  findMyInput.roles = findMyInput.roles ?? {}
                                  findMyInput.roles.delete = e.target.checked
                                } else {
                                  const myEdit = {
                                    key: open.id,
                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                    roles: {
                                      ...roles,
                                      delete: e.target.checked
                                    }
                                  }
                                  additional_fields.push(myEdit)
                                }
                                onChange({ ...data, additional_fields: additional_fields })
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'إظهار زر الحذف' : 'Show Delete Button'}
                        />
                      </>
                    )}
                    {open.kind !== "Table" &&
                      <div className='w-full'>
                        <h2 className='mt-5 text-[#555] mb-3 font-bold'>{messages.dialogs.cssEditorForInput}</h2>
                        <CssEditor data={data} onChange={onChange} Css={design} open={open} roles={roles} />
                      </div>
                    }
                  </>
                </UnmountClosed>
                <UnmountClosed isOpened={Boolean(selected === 'roles')}>
                  <div>
                    <div className='rounded-md border-2 border-main-color'>
                      <h2
                        onClick={() => setShowEvent(!showEvent)}
                        className='flex justify-between items-center px-2 py-1 text-lg font-bold text-center text-white cursor-pointer select-none bg-main-color'
                      >
                        <IconButton>
                          <IconifyIcon
                            className='text-white opacity-0'
                            icon={showEvent ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                          />
                        </IconButton>
                        {messages.Events}
                        <IconButton>
                          <IconifyIcon
                            className='text-white'
                            icon={showEvent ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                          />
                        </IconButton>
                      </h2>

                      <UnmountClosed isOpened={Boolean(showEvent)}>
                        <div className='px-2 pb-2'>
                          <>
                            {open.key !== 'button' && open.key !== 'check_box' && (
                              <>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={Boolean(roles?.onMount?.includeInQuery)}
                                      onChange={e => {
                                        const additional_fields = data.additional_fields ?? []
                                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                        if (findMyInput) {
                                          findMyInput.roles.onMount.includeInQuery = e.target.checked
                                        } else {
                                          const myEdit = {
                                            key: open.id,
                                            design: objectToCss(Css).replaceAll('NaN', ''),
                                            roles: {
                                              ...roles,
                                              onMount: {
                                                ...roles.onMount,
                                                includeInQuery: e.target.checked
                                              }
                                            }
                                          }
                                          additional_fields.push(myEdit)
                                        }
                                        onChange({ ...data, additional_fields: additional_fields })
                                      }}
                                    />
                                  }
                                  label={'Include in URL query'}
                                />
                                <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.OnMount}</h2>
                                <FormControl fullWidth margin='normal'>
                                  <InputLabel>{messages.State}</InputLabel>

                                  {open.rowId && (
                                    <Select
                                      variant="filled"
                                      value={
                                        data.rowValidation?.find(
                                          item => item.key === open.id && item.rowId === open.rowId
                                        )?.roles?.onMount?.type || ''
                                      }
                                      onChange={e => {
                                        console.log(data);

                                        const value = e.target.value
                                        
                                        const map = new Map(
                                          (data.rowValidation ?? []).map(item => [
                                            `${item.key}_${item.rowId}`,
                                            item
                                          ])
                                        )

                                        const uniqueKey = `${open.id}_${open.rowId}`

                                        map.set(uniqueKey, {
                                          key: open.id,
                                          rowId: open.rowId,
                                          roles: {
                                            onMount: {
                                              type: value,
                                              value: roles?.onMount?.value
                                            }
                                          }
                                        })

                                        const rowValidation = Array.from(map.values())

                                        onChange({
                                          ...data,
                                          rowValidation
                                        })
                                      }}
                                    >
                                      <MenuItem value="empty Data">{messages.select}</MenuItem>

                                      <MenuItem value="disable" disabled={open.type === 'new_element'}>
                                        {messages.Disable}
                                      </MenuItem>

                                      <MenuItem value="required" disabled={open.type === 'new_element'}>
                                        {messages.requiredFiled}
                                      </MenuItem>

                                      <MenuItem value="hide">{messages.Hide}</MenuItem>
                                    </Select>
                                  )}
                                  {!open.rowId && (
                                    <Select
                                      variant="filled"
                                      value={
                                        data.additional_fields?.find(inp => inp.key === open.id)?.roles?.onMount?.type || ''
                                      }
                                      onChange={e => {
                                        const value = e.target.value
                                        const additional_fields = [...(data.additional_fields ?? [])]

                                        const index = additional_fields.findIndex(
                                          inp => inp.key === open.id
                                        )

                                        if (index !== -1) {
                                          const item = { ...additional_fields[index] }

                                          item.roles = {
                                            ...item.roles,
                                            onMount: {
                                              ...(item.roles?.onMount ?? {}),
                                              type: value
                                            }
                                          }

                                          additional_fields[index] = item
                                        } else {
                                          additional_fields.push({
                                            key: open.id,
                                            design: objectToCss(Css).replaceAll('NaN', ''),
                                            roles: {
                                              onMount: {
                                                type: value,
                                                value: roles?.onMount?.value
                                              }
                                            }
                                          })
                                        }

                                        onChange({
                                          ...data,
                                          additional_fields
                                        })
                                      }}
                                    >
                                      <MenuItem value="empty Data">{messages.select}</MenuItem>

                                      <MenuItem value="disable" disabled={open.type === 'new_element'}>
                                        {messages.Disable}
                                      </MenuItem>

                                      <MenuItem value="required" disabled={open.type === 'new_element'}>
                                        {messages.requiredFiled}
                                      </MenuItem>

                                      <MenuItem value="hide">{messages.Hide}</MenuItem>
                                    </Select>
                                  )}
                                  {open.type !== 'new_element' && (
                                    <>
                                      {getApiData.length > 0 && (
                                        <TextField
                                          select
                                          fullWidth
                                          className='!mb-4'
                                          value={roles.api_url || ''}
                                          onChange={e => {
                                            const additional_fields = data.additional_fields ?? []
                                            const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                            if (findMyInput) {
                                              findMyInput.roles.api_url = e.target.value
                                            } else {
                                              const myEdit = {
                                                key: open.id,
                                                design: objectToCss(Css).replaceAll('NaN', ''),
                                                roles: {
                                                  ...roles,
                                                  api_url: e.target.value
                                                }
                                              }
                                              additional_fields.push(myEdit)
                                            }
                                            onChange({ ...data, additional_fields: additional_fields })
                                          }}
                                          label={messages.Get_From_API}
                                          variant='filled'
                                        >
                                          {getApiData.map(
                                            ({ link, data }, index) =>
                                              !Array.isArray(data) && (
                                                <MenuItem key={link + index} value={link}>
                                                  {link}
                                                </MenuItem>
                                              )
                                          )}
                                        </TextField>
                                      )}
                                      {roles.api_url && (
                                        <div className='flex justify-center'>
                                          <Button
                                            className='!my-4'
                                            variant='contained'
                                            color='error'
                                            onClick={() => {
                                              setObj(false)
                                              const additional_fields = data.additional_fields ?? []
                                              const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                              if (findMyInput) {
                                                findMyInput.roles.api_url = ''
                                              }
                                              onChange({ ...data, additional_fields: additional_fields })
                                            }}
                                          >
                                            {messages.Clear_Data}
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  <Collapse
                                    transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                                    isOpen={Boolean(obj)}
                                  >
                                    <div className='p-2 my-4 rounded border border-dashed border-main-color'>
                                      <h2 className='mb-4 text-2xl text-main-color'>{messages.View_Object}</h2>
                                      <SyntaxHighlighter language='json' style={docco}>
                                        {JSON.stringify(obj, null, 2)}
                                      </SyntaxHighlighter>
                                    </div>
                                  </Collapse>
                                  {open.type === 'Date' ? (
                                    <div className='w-full mt-2'>
                                      <Typography variant='body2' className='mb-1 text-gray-600'>
                                        {messages.Value}
                                      </Typography>
                                      {open.descriptionEn == 'timeOnly' ? (
                                        (() => {
                                          const today = new Date()
                                          let minDate = null
                                          let maxDate = null
                                          if (roles?.beforeDateType == 'days') {
                                            minDate = addDays(today, roles?.beforeDateValue)
                                          } else if (roles?.beforeDateType == 'date') {
                                            minDate = new Date(roles?.beforeDateValue)
                                          }
                                          if (roles?.afterDateType == 'days') {
                                            maxDate = addDays(today, roles?.afterDateValue)
                                          } else if (roles?.afterDateType == 'date') {
                                            maxDate = new Date(roles?.afterDateValue)
                                          }
                                          const timeFormat = roles?.timeFormat == '12hrs' ? 'h:mm aa' : 'HH:mm'
                                          const selected = parseDateValue(writeValue)

                                          const datePicker = inline => (
                                            <DatePicker
                                              selected={selected}
                                              onChange={date => {
                                                const val = date ? date.toISOString() : ''
                                                setWriteValue(val)
                                                commitOnMountValue(val)
                                              }}
                                              dateFormat={timeFormat}
                                              showTimeSelect
                                              showTimeSelectOnly
                                              locale={locale == 'ar' ? ar : en}
                                              customInput={
                                                <ExampleCustomInput
                                                  input={open}
                                                  disabled={false}
                                                  value={selected?.toString()}
                                                  type='time'
                                                  className='example-custom-input'
                                                />
                                              }
                                              disabled={false}
                                              minDate={minDate}
                                              maxDate={maxDate}
                                              inline={inline}
                                            />
                                          )

                                          return (
                                            <>
                                              <div className='relative w-full'>
                                                <div
                                                  role='presentation'
                                                  onClick={() => setMountDateDialogOpen(true)}
                                                  className='absolute top-0 z-10 w-full h-full cursor-pointer start-0'
                                                />
                                                <DatePickerWrapper className='w-full'>{datePicker()}</DatePickerWrapper>
                                              </div>
                                              <Dialog
                                                open={mountDateDialogOpen}
                                                onClose={() => setMountDateDialogOpen(false)}
                                                aria-labelledby='alert-dialog-title'
                                                aria-describedby='alert-dialog-description'
                                                className='bg-transparent-popup'
                                              >
                                                <div className='absolute top-0 end-0 py-0 z-10'>
                                                  <IconButton
                                                    size='small'
                                                    color='error'
                                                    onClick={() => setMountDateDialogOpen(false)}
                                                  >
                                                    <Icon icon='tabler:x' fontSize='1.25rem' />
                                                  </IconButton>
                                                </div>
                                                <DatePickerWrapper className='w-full mx-auto flex justify-center items-center '>
                                                  {datePicker(true)}
                                                </DatePickerWrapper>
                                              </Dialog>
                                            </>
                                          )
                                        })()
                                      ) : (
                                        (() => {
                                          let raw = {}
                                          try {
                                            raw = JSON.parse(open?.descriptionEn ?? '{}')
                                          } catch {
                                            raw = {}
                                          }

                                          const format = convertMomentToDateFnsFormat(raw.format)

                                          const label = {
                                            format,
                                            showTime: raw.showTime === 'true'
                                          }

                                          const today = new Date()
                                          let minDate = null
                                          let maxDate = null
                                          if (roles?.beforeDateType == 'days') {
                                            minDate = addDays(today, roles?.beforeDateValue)
                                          } else if (roles?.beforeDateType == 'date') {
                                            minDate = new Date(roles?.beforeDateValue)
                                          }
                                          if (roles?.afterDateType == 'days') {
                                            maxDate = addDays(today, roles?.afterDateValue)
                                          } else if (roles?.afterDateType == 'date') {
                                            maxDate = new Date(roles?.afterDateValue)
                                          }
                                          const selected = parseDateValue(writeValue)

                                          const datePicker = inline => (
                                            <DatePicker
                                              selected={selected}
                                              onChange={date => {
                                                const val = date ? date.toISOString() : ''
                                                setWriteValue(val)
                                                commitOnMountValue(val)
                                              }}
                                              timeInputLabel={
                                                label.showTime == 'true'
                                                  ? locale == 'ar'
                                                    ? 'الوقت:'
                                                    : 'Time:'
                                                  : ''
                                              }
                                              dateFormat={`${label.format ? label.format : 'MM/dd/yyyy'}`}
                                              showMonthDropdown
                                              locale={locale == 'ar' ? ar : en}
                                              showYearDropdown
                                              showTimeSelect={label.showTime == 'true'}
                                              customInput={
                                                <ExampleCustomInput
                                                  input={open}
                                                  disabled={false}
                                                  className='example-custom-input'
                                                />
                                              }
                                              disabled={false}
                                              minDate={minDate}
                                              maxDate={maxDate}
                                              popperPlacement='bottom-start'
                                              inline={inline}
                                            />
                                          )

                                          return (
                                            <div className='relative w-full'>
                                              <div
                                                role='presentation'
                                                onClick={() => setMountDateDialogOpen(true)}
                                                className='absolute top-0 z-20 w-full h-full cursor-pointer start-0'
                                              />
                                              <DatePickerWrapper className='w-full'>{datePicker()}</DatePickerWrapper>
                                              <Dialog
                                                open={mountDateDialogOpen}
                                                onClose={() => setMountDateDialogOpen(false)}
                                                aria-labelledby='alert-dialog-title'
                                                aria-describedby='alert-dialog-description'
                                                className='bg-transparent-popup'
                                              >
                                                <div className='absolute top-0 end-2 py-2 z-10'>
                                                  <IconButton
                                                    size='small'
                                                    color='error'
                                                    onClick={() => setMountDateDialogOpen(false)}
                                                  >
                                                    <Icon icon='tabler:x' fontSize='1.25rem' />
                                                  </IconButton>
                                                </div>
                                                <DatePickerWrapper className='w-full mx-auto flex  justify-center items-center '>
                                                  {datePicker(true)}
                                                </DatePickerWrapper>
                                              </Dialog>
                                            </div>
                                          )
                                        })()
                                      )}
                                    </div>
                                  ) : (
                                    <TextField
                                      fullWidth
                                      type='text'
                                      value={writeValue}
                                      variant='filled'
                                      label={messages.Value}
                                      onChange={e => {
                                        setWriteValue(e.target.value)
                                      }}
                                      onBlur={e => {
                                        const additional_fields = data.additional_fields ?? []
                                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                        if (findMyInput) {
                                          findMyInput.roles.onMount.value = e.target.value
                                          if (obj) {
                                            findMyInput.roles.apiKeyData = getData(obj, e.target.value, '')
                                          }
                                        } else {
                                          const myEdit = {
                                            key: open.id,
                                            design: objectToCss(Css).replaceAll('NaN', ''),
                                            roles: {
                                              ...roles,
                                              onMount: { type: roles.onMount.type, value: e.target.value },
                                              apiKeyData: obj ? getData(obj, e.target.value, '') : ''
                                            }
                                          }
                                          additional_fields.push(myEdit)
                                        }
                                        onChange({ ...data, additional_fields: additional_fields })
                                      }}
                                    />
                                  )}
                                </FormControl>
                              </>
                            )}
                          </>
                          {open.type === 'File' && (
                            <div className='pt-2 border-t-2 border-dashed border-main-color'>
                              <h2 className='mt-2 text-lg font-bold text-main-color'>
                                {messages.dialogs.fileProperties || 'File Properties'}
                              </h2>
                              <TextField
                                fullWidth
                                type='number'
                                defaultValue={roles?.size || '500'}
                                InputProps={{
                                  endAdornment: <InputAdornment position='end'>KB</InputAdornment>
                                }}
                                onBlur={e => {
                                  const additional_fields = data.additional_fields ?? []
                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                  if (findMyInput) {
                                    findMyInput.roles.size = e.target.value
                                  } else {
                                    const myEdit = {
                                      key: open.id,
                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                      roles: {
                                        ...roles,
                                        size: e.target.value
                                      }
                                    }
                                    additional_fields.push(myEdit)
                                  }
                                  onChange({ ...data, additional_fields: additional_fields })
                                }}
                                variant='filled'
                                label={messages.dialogs.maxFileSize}
                                margin='normal'
                              />
                              {open?.options?.uiSchema?.xComponentProps?.fileTypes &&
                                open.options.uiSchema.xComponentProps.fileTypes.length > 0 && (
                                  <div className='mt-4'>
                                    <Typography variant='subtitle2' className='mb-2 font-semibold text-main-color'>
                                      {messages.fileTypes || 'Accepted File Types'}
                                    </Typography>
                                    <div className='flex flex-wrap gap-2'>
                                      {open.options.uiSchema.xComponentProps.fileTypes.map((item, index) => (
                                        <Chip
                                          key={index}
                                          label={item.toUpperCase()}
                                          color='primary'
                                          variant='outlined'
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                          {open.type !== 'new_element' && (
                            <div className='pt-2 border-t-2 border-dashed border-main-color'>
                              <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.Regex}</h2>
                              <TextField
                                fullWidth
                                type='text'
                                defaultValue={roles?.regex?.regex || ''}
                                onBlur={e => {
                                  const additional_fields = data.additional_fields ?? []
                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                  if (findMyInput) {
                                    findMyInput.roles.regex.regex = e.target.value
                                  } else {
                                    const myEdit = {
                                      key: open.id,
                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                      roles: {
                                        ...roles,
                                        regex: {
                                          regex: e.target.value,
                                          message_ar: roles.regex.message_ar,
                                          message_en: roles.regex.message_en
                                        }
                                      }
                                    }
                                    additional_fields.push(myEdit)
                                  }
                                  onChange({ ...data, additional_fields: additional_fields })
                                }}
                                variant='filled'
                                label={messages.Regex}
                              />
                              <TextField
                                fullWidth
                                disabled={!roles?.regex?.regex}
                                type='text'
                                defaultValue={roles?.regex?.message_ar || ''}
                                onBlur={e => {
                                  const additional_fields = data.additional_fields ?? []
                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                  if (findMyInput) {
                                    findMyInput.roles.regex.message_ar = e.target.value
                                  } else {
                                    const myEdit = {
                                      key: open.id,
                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                      roles: {
                                        ...roles,
                                        regex: {
                                          regex: roles.regex.regex,
                                          message_ar: e.target.value,
                                          message_en: roles.regex.message_en
                                        }
                                      }
                                    }
                                    additional_fields.push(myEdit)
                                  }
                                  onChange({ ...data, additional_fields: additional_fields })
                                }}
                                variant='filled'
                                label={messages.Regex_Message_Ar}
                              />
                              <TextField
                                fullWidth
                                type='text'
                                disabled={!roles?.regex?.regex}
                                defaultValue={roles?.regex?.message_en || ''}
                                onBlur={e => {
                                  const additional_fields = data.additional_fields ?? []
                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                  if (findMyInput) {
                                    findMyInput.roles.regex.message_en = e.target.value
                                  } else {
                                    const myEdit = {
                                      key: open.id,
                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                      roles: {
                                        ...roles,
                                        regex: {
                                          regex: roles.regex.regex,
                                          message_ar: roles.regex.message_ar,
                                          message_en: e.target.value
                                        }
                                      }
                                    }
                                    additional_fields.push(myEdit)
                                  }
                                  onChange({ ...data, additional_fields: additional_fields })
                                }}
                                variant='filled'
                                label={messages.Regex_Message_En}
                              />
                              <div className='mb-2'></div>
                            </div>
                          )}
                          {(open.key === 'button' || open.key === 'check_box') && (
                            <>
                              <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.OnMount}</h2>
                              <FormControl fullWidth margin='normal'>
                                <InputLabel>{messages.State}</InputLabel>
                                <Select
                                  variant='filled'
                                  value={roles?.onMount?.type}
                                  onChange={e => {
                                    const additional_fields = data.additional_fields ?? []
                                    const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                    if (findMyInput) {
                                      findMyInput.roles.onMount.type = e.target.value
                                    } else {
                                      const myEdit = {
                                        key: open.id,
                                        design: objectToCss(Css).replaceAll('NaN', ''),
                                        roles: {
                                          ...roles,
                                          onMount: { type: e.target.value, value: roles.onMount.value }
                                        }
                                      }
                                      additional_fields.push(myEdit)
                                    }
                                    onChange({ ...data, additional_fields: additional_fields })
                                  }}
                                >
                                  {' '}
                                  <MenuItem selected value={'empty Data'}>
                                    {messages.select}
                                  </MenuItem>
                                  <MenuItem value={'disable'}>{messages.Disable}</MenuItem>
                                  <MenuItem value={'required'}>{messages.required}</MenuItem>
                                  <MenuItem value={'hide'}>{messages.Hide}</MenuItem>
                                </Select>
                              </FormControl>
                            </>
                          )}
                          <div className='pt-2 border-t-2 border-dashed border-main-color'>
                            <h2 className='mt-2 text-lg font-bold text-main-color'>
                              {open.key === 'button' ? messages.OnClick : messages.OnChange}
                            </h2>
                            <JsEditor
                              jsCode={roles?.event?.onChange ?? ''}
                              onChange={onChange}
                              data={data}
                              open={open}
                              Css={Css}
                              roles={roles}
                            />
                          </div>
                          {open.key !== 'button' && (
                            <div className='pt-2 border-t-2 border-dashed border-main-color'>
                              <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.OnBlur}</h2>
                              <JsEditor
                                type='onBlur'
                                jsCode={roles?.event?.onBlur ?? ''}
                                onChange={onChange}
                                data={data}
                                open={open}
                                Css={Css}
                                roles={roles}
                              />
                            </div>
                          )}
                          {open.type !== 'new_element' && (
                            <div className='pt-2 border-t-2 border-dashed border-main-color'>
                              <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.OnUnmount}</h2>
                              <JsEditor
                                type='onUnmount'
                                jsCode={roles?.event?.onUnmount ?? ''}
                                onChange={onChange}
                                data={data}
                                open={open}
                                Css={Css}
                                roles={roles}
                              />
                            </div>
                          )}
                        </div>
                      </UnmountClosed>
                    </div>

                    <SwitchView title={messages.Triggers} show={showTrigger} setShow={setShowTrigger}>
                      <TriggerControl
                        roles={roles}
                        setOpenTrigger={setOpenTrigger}
                        messages={messages}
                        data={data}
                        keyInput={open.key}
                        onChange={onChange}
                        open={open}
                        objectToCss={objectToCss}
                        Css={Css}
                      />
                    </SwitchView>
                    {open.type === 'new_element' && (
                      <div className='mt-2 rounded-md border-2 border-main-color'>
                        <h2
                          onClick={() => setControlTrigger(!controlTrigger)}
                          className='flex justify-between items-center px-2 py-1 text-lg font-bold text-center text-white cursor-pointer select-none bg-main-color'
                        >
                          <IconButton>
                            <IconifyIcon
                              className='text-white opacity-0'
                              icon={controlTrigger ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                            />
                          </IconButton>
                          {messages.dialogs.controls}
                          <IconButton>
                            <IconifyIcon
                              className='text-white'
                              icon={controlTrigger ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                            />
                          </IconButton>
                        </h2>
                        <UnmountClosed isOpened={Boolean(controlTrigger)}>
                          {open.key === 'button' || open.key === 'check_box' ? (
                            <>
                              <div className='px-4 mt-4'>
                                <TextField
                                  fullWidth
                                  type='text'
                                  defaultValue={roles?.onMount?.href || ''}
                                  onBlur={e => {
                                    const additional_fields = data.additional_fields ?? []
                                    const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                    if (findMyInput) {
                                      findMyInput.roles.onMount.href = e.target.value
                                    } else {
                                      const myEdit = {
                                        key: open.id,
                                        design: objectToCss(Css).replaceAll('NaN', ''),
                                        roles: {
                                          ...roles,
                                          onMount: {
                                            ...roles.onMount,
                                            href: e.target.value
                                          }
                                        }
                                      }
                                      additional_fields.push(myEdit)
                                    }
                                    onChange({ ...data, additional_fields: additional_fields })
                                  }}
                                  label={messages.href}
                                  variant='filled'
                                />
                                {open.key !== 'check_box' && (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={roles?.onMount?.print}
                                        onChange={e => {
                                          const additional_fields = data.additional_fields ?? []
                                          const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                          if (findMyInput) {
                                            findMyInput.roles.onMount.print = e.target.checked
                                          } else {
                                            const myEdit = {
                                              key: open.id,
                                              design: objectToCss(Css).replaceAll('NaN', ''),
                                              roles: {
                                                ...roles,
                                                onMount: {
                                                  ...roles.onMount,
                                                  print: e.target.checked
                                                }
                                              }
                                            }
                                            additional_fields.push(myEdit)
                                          }
                                          onChange({ ...data, additional_fields: additional_fields })
                                        }}
                                      />
                                    }
                                    label={messages.dialogs.print}
                                  />
                                )}
                              </div>
                              <div className='mt-4'></div>
                              {roles?.onMount?.file ? (
                                <div className='p-2 my-4 rounded border border-dashed border-main-color'>
                                  <div className='flex justify-between items-center'>
                                    <div className='flex gap-2 items-center'>
                                      <Icon icon='tabler:file-check' fontSize='1.5rem' className='text-main-color' />
                                      <div className='text-sm font-medium'>
                                        {messages.dialogs.fileUploaded || 'File Uploaded'}
                                      </div>
                                    </div>
                                    <Button
                                      variant='outlined'
                                      color='error'
                                      onClick={() => {
                                        const additional_fields = data.additional_fields ?? []
                                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                        if (findMyInput) {
                                          findMyInput.roles.onMount.file = ''
                                        }
                                        onChange({ ...data, additional_fields: additional_fields })
                                      }}
                                    >
                                      {messages.dialogs.delete}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className='px-4'>
                                    <Button
                                      variant='outlined'
                                      className='!mb-4'
                                      component='label'
                                      fullWidth
                                      startIcon={
                                        <Icon icon='ph:upload-fill' fontSize='2.25rem' className='!text-2xl ' />
                                      }
                                    >
                                      <input
                                        type='file'
                                        hidden
                                        name='json'
                                        onChange={event => {
                                          const file = event.target.files[0]
                                          const loading = toast.loading(messages.dialogs.uploading)
                                          if (file) {
                                            axiosPost(
                                              'file/upload',
                                              'en',
                                              {
                                                file: file
                                              },
                                              true
                                            )
                                              .then(res => {
                                                if (res.status) {
                                                  const additional_fields = data.additional_fields ?? []
                                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                                  if (findMyInput) {
                                                    findMyInput.roles.onMount.file = res.filePath
                                                  } else {
                                                    const myEdit = {
                                                      key: open.id,
                                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                                      roles: {
                                                        ...roles,
                                                        onMount: {
                                                          ...roles.onMount,
                                                          file: res.filePath
                                                        }
                                                      }
                                                    }
                                                    additional_fields.push(myEdit)
                                                  }
                                                  onChange({ ...data, additional_fields: additional_fields })
                                                }
                                              })
                                              .finally(() => {
                                                toast.dismiss(loading)
                                              })
                                            event.target.value = ''
                                          }
                                        }}
                                      />
                                      {messages.dialogs.uploadFile}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className='px-4'>
                              {roles?.onMount?.file ? (
                                <div className='p-2 my-4 rounded border border-dashed border-main-color'>
                                  <div className='flex justify-between items-center'>
                                    <div className='flex gap-2 items-center'>
                                      <Icon icon='tabler:file-check' fontSize='1.5rem' className='text-main-color' />
                                      <div className='text-sm font-medium'>
                                        {messages.dialogs.fileUploaded || 'File Uploaded'}
                                      </div>
                                    </div>
                                    <Button
                                      variant='outlined'
                                      color='error'
                                      onClick={() => {
                                        const additional_fields = data.additional_fields ?? []
                                        const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                        if (findMyInput) {
                                          findMyInput.roles.onMount.file = ''
                                        }
                                        onChange({ ...data, additional_fields: additional_fields })
                                      }}
                                    >
                                      {messages.dialogs.delete}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {' '}
                                  <Button
                                    variant='outlined'
                                    className='!mb-4'
                                    component='label'
                                    fullWidth
                                    startIcon={<Icon icon='ph:upload-fill' fontSize='2.25rem' className='!text-2xl ' />}
                                  >
                                    <input
                                      type='file'
                                      hidden
                                      name='json'
                                      onChange={event => {
                                        const file = event.target.files[0]
                                        const loading = toast.loading(messages.dialogs.uploading)
                                        if (file) {
                                          axiosPost(
                                            'file/upload',
                                            'en',
                                            {
                                              file: file
                                            },
                                            true
                                          )
                                            .then(res => {
                                              if (res.status) {
                                                const additional_fields = data.additional_fields ?? []
                                                const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                                if (findMyInput) {
                                                  findMyInput.roles.onMount.file = res.filePath
                                                } else {
                                                  const myEdit = {
                                                    key: open.id,
                                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                                    roles: {
                                                      ...roles,
                                                      onMount: {
                                                        ...roles.onMount,
                                                        file: res.filePath
                                                      }
                                                    }
                                                  }
                                                  additional_fields.push(myEdit)
                                                }
                                                onChange({ ...data, additional_fields: additional_fields })
                                              }
                                            })
                                            .finally(() => {
                                              toast.dismiss(loading)
                                            })
                                          event.target.value = ''
                                        }
                                      }}
                                    />
                                    {messages.dialogs.uploadFile}
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </UnmountClosed>
                      </div>
                    )}
                  </div>
                </UnmountClosed>

                <UnmountClosed isOpened={Boolean(selected === 'progress_bar')}>
                  <div className='flex flex-col gap-4 px-1'>
                    <Box>
                      <Typography variant='subtitle1' className='font-semibold' color='text.primary'>
                        {messages.dialogs.progressBarSegments}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                        {locale === 'ar' ? 'حدد النسبة ولون كل شريحة (المجموع 100% أفضل)' : 'Set percentage and color per segment (total 100% recommended)'}
                      </Typography>
                    </Box>
                    {(roles?.progressBarSegments ?? []).length === 0 ? (
                      <Box
                        className='rounded-lg border-2 border-dashed p-6 text-center'
                        sx={{ borderColor: 'divider', backgroundColor: 'action.hover' }}
                      >
                        <Icon icon='tabler:chart-donut' className='mx-auto text-gray-400' fontSize='2.5rem' />
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                          {locale === 'ar' ? 'لا توجد شرائح بعد. أضف شريحة لبدء التخصيص.' : 'No segments yet. Add a segment to get started.'}
                        </Typography>
                        <Button
                          variant='contained'
                          size='small'
                          startIcon={<Icon icon='tabler:plus' />}
                          onClick={() =>
                            updateProgressBarSegments([{ percentage: 0, backgroundColor: '#4caf50' }])
                          }
                          sx={{ mt: 2 }}
                        >
                          {messages.dialogs.add}
                        </Button>
                      </Box>
                    ) : (
                      <>
                        {(roles?.progressBarSegments ?? []).map((segment, index) => {
                          const bgValue = segment.backgroundColor ?? '#4caf50'
                          const isHex = v => /^#[0-9A-Fa-f]{3,8}$/.test((v || '').trim())
                          const pickerBg = isHex(bgValue) ? bgValue : '#4caf50'

                          return (
                            <Box
                              key={index}
                              className='flex flex-col gap-3 rounded-lg p-3'
                              sx={{
                                backgroundColor: 'grey.50',
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Box className='flex flex-wrap items-center gap-3'>
                                <Box
                                  className='flex items-center justify-center rounded-full shrink-0'
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    background: bgValue,
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                <TextField
                                  type='text'
                                  size='small'
                                  label={messages.dialogs.percentage}
                                  value={segment.percentage ?? ''}
                                  onChange={e => {
                                    const segments = [...(roles?.progressBarSegments ?? [])]
                                    segments[index] = { ...segment, percentage: e.target.value }
                                    updateProgressBarSegments(segments)
                                  }}
                                  variant='filled'
                                  sx={{ minWidth: 100, flex: '1 1 100px' }}
                                />
                                <Tooltip title={messages.dialogs.delete}>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() =>
                                      updateProgressBarSegments(
                                        (roles?.progressBarSegments ?? []).filter((_, i) => i !== index)
                                      )
                                    }
                                    aria-label={messages.dialogs.delete}
                                  >
                                    <Icon icon='tabler:trash' fontSize='1.25rem' />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              <Box className='flex flex-col gap-2'>
                                <Typography variant='caption' color='text.secondary' fontWeight={500}>
                                  {messages.dialogs.backgroundColor}
                                </Typography>
                                <Box className='flex flex-wrap items-center gap-2'>
                                  <Box
                                    className='rounded border shrink-0'
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      background: bgValue,
                                      borderColor: 'divider'
                                    }}
                                  />
                                  <TextField
                                    type='color'
                                    size='small'
                                    value={pickerBg}
                                    onChange={e => {
                                      const segments = [...(roles?.progressBarSegments ?? [])]
                                      segments[index] = { ...segment, backgroundColor: e.target.value }
                                      updateProgressBarSegments(segments)
                                    }}
                                    sx={{ width: 48, minWidth: 48, '& .MuiInput-input': { height: 36, cursor: 'pointer' } }}
                                  />
                                  <TextField
                                    type='text'
                                    size='small'
                                    fullWidth
                                    placeholder={messages.dialogs.colorOrCss}
                                    value={typeof bgValue === 'string' ? bgValue : ''}
                                    onChange={e => {
                                      const segments = [...(roles?.progressBarSegments ?? [])]
                                      segments[index] = { ...segment, backgroundColor: e.target.value }
                                      updateProgressBarSegments(segments)
                                    }}
                                    variant='filled'
                                  />
                                </Box>
                              </Box>
                            </Box>
                          )
                        })}
                        <Box className='flex items-center justify-between gap-2 flex-wrap'>
                          <Typography variant='caption' color='text.secondary' component='span' sx={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            {locale === 'ar' ? 'المجموع: ' : 'Total: '}
                            <strong>
                              {(roles?.progressBarSegments ?? []).reduce((s, seg) => s + (Number(seg.percentage) || 0), 0)}%
                            </strong>
                            {(roles?.progressBarSegments ?? []).reduce((s, seg) => s + (Number(seg.percentage) || 0), 0) !== 100 && (
                              <Typography component='span' variant='caption' color='warning.main'>
                                ({locale === 'ar' ? 'يفضل أن يكون 100%' : '100% recommended'})
                              </Typography>
                            )}
                          </Typography>
                          <Button
                            variant='outlined'
                            size='small'
                            startIcon={<Icon icon='tabler:plus' />}
                            onClick={() =>
                              updateProgressBarSegments([
                                ...(roles?.progressBarSegments ?? []),
                                { percentage: 0, backgroundColor: '#4caf50' }
                              ])
                            }
                          >
                            {messages.dialogs.add}
                          </Button>
                        </Box>
                      </>
                    )}
                  </div>
                </UnmountClosed>
                <UnmountClosed isOpened={Boolean(selected === 'associations')}>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      setAssociationsOpen({ key: open.key.includes('[') ? open.key : open.id, source: open?.options?.source, field: open })
                    }}
                  >
                    Setup Associations
                  </Button>
                </UnmountClosed>
                <UnmountClosed isOpened={Boolean(selected === 'print')}>
                  <PrintSetting open={open} roles={roles} onChange={onChange} data={data} fields={fields} />
                </UnmountClosed>

              </div>
            )}
          </div>
        </Box>
      </Drawer>
    </>
  )
}
