/* eslint-disable react-hooks/exhaustive-deps */
import { Icon } from '@iconify/react'
import {
  Box,
  Drawer,
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
  FormControlLabel
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
import Tabs from '../ControlDesignAndValidation/Tabs'

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

export default function InputControlDesign({ open, handleClose, design, locale, data, onChange, roles, fields }) {
  const Css = cssToObject(design)
  const getApiData = useSelector(rx => rx.api.data)
  const { messages } = useIntl()
  const [selected, setSelect] = useState('style')
  const [writeValue, setWriteValue] = useState(roles?.onMount?.value ?? '')
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
  const [tabData, setTabData] = useState({ name_ar: '', name_en: '', link: '', active: false })
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

  const handleCloseTab = () => {
    setOpenTab(false)
    setTabData({ name_ar: '', name_en: '', link: '', active: false })
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
    if (tabData.name_ar && tabData.name_en && tabData.link) {
      const newTab = {
        name_ar: tabData.name_ar,
        name_en: tabData.name_en,
        link: tabData.link,
        active: tabData.active
      }
      if (editTab) {
        const findMyInput = addMoreElement.find(inp => inp.id === open?.id)
        if (findMyInput) {
          findMyInput.data[editTab - 1] = newTab
          onChange({ ...data, addMoreElement: addMoreElement })
        }
      } else {
        const findMyInput = addMoreElement.find(inp => inp.id === open?.id)
        if (findMyInput) {
          findMyInput.data.push(newTab)
          onChange({ ...data, addMoreElement: addMoreElement })
        }
      }
      handleCloseTab()
    } else {
      toast.error(messages.You_must_fill_the_data)
    }
  }

  return (
    <>
      {/* Tabs */}
      <Tabs
        openTab={openTab}
        handleCloseTab={handleCloseTab}
        messages={messages}
        editTab={editTab}
        tabData={tabData}
        setTabData={setTabData}
        addTab={addTab}
      />

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
        open={open}
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
                {open.data && (
                  <Button
                    onClick={() => {
                      setSelect('tabs')
                    }}
                    variant={selected === 'tabs' ? 'contained' : 'outlined'}
                  >
                    {messages.dialogs.tabs}
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
                      (open.type === 'SingleText' ||
                        open.type === 'Number' ||
                        open.type === 'Phone' ||
                        open.type === 'URL' ||
                        open.type === 'Email' ||
                        open.type === 'Password' ||
                        open.descriptionAr === 'multiple_select' ||
                        open.type === 'LongText' ||
                        open.type === 'ManyToMany' ||
                        open.type === 'OneToOne') && (
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
                      )
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
                          </Select>
                        </FormControl>
                      </>
                    )}

                    {open.type === 'File' && (
                      <TextField
                        fullWidth
                        type='number'
                        defaultValue={roles?.size || ''}
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
                        <FormControl fullWidth margin='normal'>
                          <InputLabel> {messages.dialogs.beforeDateType}</InputLabel>
                          <Select
                            variant='filled'
                            value={roles?.beforeDateType}
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
                            <MenuItem value=''>{messages.dialogs.select}</MenuItem>
                            <MenuItem value='date'>{messages.dialogs.insertDate}</MenuItem>
                            <MenuItem value='days'>{messages.dialogs.insertDays}</MenuItem>
                          </Select>

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
                              value={roles?.beforeDateType}
                              displayEmpty
                              renderValue={selected => {
                                if (!selected) return '---select---'
                                
                                return selected
                              }}
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
                              <MenuItem value='' disabled>---select---</MenuItem>
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

                    <div className='w-full'>
                      <h2 className='mt-5 text-[#555] mb-3 font-bold'>{messages.dialogs.cssEditorForInput}</h2>
                      <CssEditor data={data} onChange={onChange} Css={design} open={open} roles={roles} />
                    </div>
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
                                <MenuItem selected value={'empty Data'}>
                                  {messages.select}
                                </MenuItem>

                                <MenuItem value={'disable'} disabled={open.type === 'new_element'}>
                                  {messages.Disable}
                                </MenuItem>
                                <MenuItem value={'required'} disabled={open.type === 'new_element'}>
                                  {messages.requiredFiled}
                                </MenuItem>
                                <MenuItem value={'hide'}>{messages.Hide}</MenuItem>
                              </Select>
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
                              <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
                                <div className='p-2 my-4 rounded border border-dashed border-main-color'>
                                  <h2 className='mb-4 text-2xl text-main-color'>{messages.View_Object}</h2>
                                  <SyntaxHighlighter language='json' style={docco}>
                                    {JSON.stringify(obj, null, 2)}
                                  </SyntaxHighlighter>
                                </div>
                              </Collapse>
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
                            </FormControl>
                          </>
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
                          {open.key === 'button' && (
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
                                  <MenuItem value={'disable'}>{messages.Disable}</MenuItem>
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
                          <div className='px-4'>
                            <FormControl fullWidth margin='normal'>
                              <InputLabel>{messages.dialogs.required}</InputLabel>
                              <Select
                                variant='filled'
                                value={roles?.onMount?.isRequired ? 'required' : 'optional'}
                                onChange={e => {
                                  const additional_fields = data.additional_fields ?? []
                                  const findMyInput = additional_fields.find(inp => inp.key === open.id)
                                  if (findMyInput) {
                                    findMyInput.roles.onMount.isRequired = e.target.value === 'required' ? true : false
                                  } else {
                                    const myEdit = {
                                      key: open.id,
                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                      roles: {
                                        ...roles,
                                        onMount: {
                                          ...roles.onMount,
                                          isRequired: e.target.value === 'required' ? true : false
                                        }
                                      }
                                    }
                                    additional_fields.push(myEdit)
                                  }
                                  onChange({ ...data, additional_fields: additional_fields })
                                }}
                              >
                                <MenuItem value={'required'}>{messages.dialogs.required}</MenuItem>
                                <MenuItem value={'optional'} selected>
                                  {messages.optional}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </div>
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
                                      <div className='text-sm'>{roles?.onMount?.file?.replaceAll('/Uploads/', '')}</div>
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
                                                    findMyInput.roles.onMount.file = res.filePath.data
                                                  } else {
                                                    const myEdit = {
                                                      key: open.id,
                                                      design: objectToCss(Css).replaceAll('NaN', ''),
                                                      roles: {
                                                        ...roles,
                                                        onMount: {
                                                          ...roles.onMount,
                                                          file: res.filePath.data
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
                                      <div className='text-sm'>{roles?.onMount?.file?.replaceAll('/Uploads/', '')}</div>
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
                                                  findMyInput.roles.onMount.file = res.filePath.data
                                                } else {
                                                  const myEdit = {
                                                    key: open.id,
                                                    design: objectToCss(Css).replaceAll('NaN', ''),
                                                    roles: {
                                                      ...roles,
                                                      onMount: {
                                                        ...roles.onMount,
                                                        file: res.filePath.data
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
                <UnmountClosed isOpened={Boolean(selected === 'tabs')}>
                  <div className='pt-2 border-t-2 border-dashed border-main-color'>
                    <div className='flex justify-between items-center mb-3'>
                      <h2 className='mt-2 text-lg font-bold text-main-color'>{messages.Tabs}</h2>
                      <Button variant='contained' color='primary' onClick={() => setOpenTab(true)}>
                        {messages.Add_Tab}
                      </Button>
                    </div>
                    <div className='flex flex-wrap gap-1 parent-tabs'>
                      {open?.data?.map((item, index) => (
                        <div
                          key={index}
                          className='flex justify-between items-center p-2 w-full rounded-md border-2 border-main-color'
                        >
                          <span>{item?.[`name_${locale}`]}</span>
                          <div className='flex items-center'>
                            <IconButton
                              onClick={() => {
                                setEditTab(index + 1)
                                setTabData({
                                  name_ar: item.name_ar,
                                  name_en: item.name_en,
                                  link: item.link,
                                  active: item.active
                                })
                                setOpenTab(true)
                              }}
                            >
                              <IconifyIcon icon='mdi:edit' />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                const findMyInput = addMoreElement.find(inp => inp.id === open?.id)

                                if (findMyInput) {
                                  findMyInput.data.splice(index, 1)
                                }
                                onChange({ ...data, addMoreElement: addMoreElement })
                              }}
                            >
                              <IconifyIcon icon='tabler:trash' />
                            </IconButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </UnmountClosed>
              </div>
            )}
          </div>
        </Box>
      </Drawer>
    </>
  )
}
