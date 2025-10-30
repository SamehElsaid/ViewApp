import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Chip,
  InputAdornment,
  Select,
  MenuItem
} from '@mui/material'
import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useIntl } from 'react-intl'
import { axiosGet } from '../axiosCall'
import toast from 'react-hot-toast'
import JsonEditor from '../JsonEditor'

function AssociationsSetup({ open, onClose, onSave, initialConfig }) {
  const { messages, locale } = useIntl()

  const steps = useMemo(
    () => [messages?.dialogs?.selectView || 'Select View', messages?.dialogs?.selectData || 'Select Data'],
    [messages]
  )

  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // step 1
  const [viewType, setViewType] = useState(initialConfig?.viewType || 'select') // select | search | radio
  const [getFields, setGetFields] = useState([])
  const [selectedOptions, setSelectedOptions] = useState([])

  // step 2
  const [dataSourceType, setDataSourceType] = useState(initialConfig?.dataSourceType || 'collection') // collection | api | static
  const [externalApi, setExternalApi] = useState(initialConfig?.externalApi || '')
  const [staticData, setStaticData] = useState(initialConfig?.staticData || '[]')
  const [apiHeaders, setApiHeaders] = useState(initialConfig?.apiHeaders || '{}')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [valueSendInput, setValueSendInput] = useState('')
  const [selectedValueSend, setSelectedValueSend] = useState([])
  const [method, setMethod] = useState(initialConfig?.method || 'GET')
  const [body, setBody] = useState(initialConfig?.body || '{}')

  const staticParsed = useMemo(() => {
    try {
      return JSON.parse(staticData)
    } catch (e) {
      return null
    }
  }, [staticData])

  const headersParsed = useMemo(() => {
    try {
      return JSON.parse(apiHeaders)
    } catch (e) {
      return null
    }
  }, [apiHeaders])

  const bodyParsed = useMemo(() => {
    try {
      return JSON.parse(body)
    } catch (e) {
      return null
    }
  }, [body])

  // no step 3

  const handleNext = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))
  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0))

  const resetForm = () => {
    setActiveStep(0)
    setViewType('select')
    setDataSourceType('collection')
    setExternalApi('')
    setStaticData('[]')
    setApiHeaders('{}')
    setGetFields([])
    setSelectedOptions([])
    setSelectedValueSend([])
    setValueSendInput('')
    setMethod('GET')
    setBody('{}')
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    } else {
      const type = open.field?.type === 'OneToOne' || open.type === 'normal'
      setViewType(type ? 'select' : 'search')
      setDataSourceType(open.source ? 'collection' : 'api')
    }
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (dataSourceType === 'static') {
        let parsed
        try {
          parsed = JSON.parse(staticData)
        } catch (e) {
          toast.error(messages?.dialogs?.invalidJson || 'Invalid JSON in static data')
          setSaving(false)

          return
        }
        if (!Array.isArray(parsed)) {
          toast.error(messages?.dialogs?.mustBeArray || 'Static data must be a JSON array')
          setSaving(false)

          return
        }
      }

      if (dataSourceType === 'api') {
        try {
          JSON.parse(apiHeaders)
        } catch (e) {
          toast.error(messages?.dialogs?.invalidJson || 'Invalid JSON in API headers')
          setSaving(false)

          return
        }
      }

      const config = {
        viewType,
        dataSourceType,
        externalApi,
        apiHeaders: (() => {
          try {
            const parsed = JSON.parse(apiHeaders)

            return parsed
          } catch (e) {
            return apiHeaders
          }
        })(),
        staticData: (() => {
          try {
            const parsed = JSON.parse(staticData)

            return parsed
          } catch (e) {
            return staticData
          }
        })(),
        key: open.key,
        selectedOptions,
        selectedValueSend,
        method,
        body
      }
      onSave?.(config)
      onClose?.()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (dataSourceType === 'collection' && open && open.source) {
      const loadingToast = toast.loading(messages.loading)
      axiosGet(`collections/get-by-key?key=${open.source}`, locale).then(res => {
        if (res.status) {
          axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale)
            .then(res => {
              if (res.status) {
                setGetFields(res.data)
              }
            })
            .finally(() => {
              toast.dismiss(loadingToast)
            })
        } else {
          toast.dismiss(loadingToast)
        }
      })
    }
  }, [dataSourceType, open, locale, messages])

  return (
    <Dialog open={Boolean(open)} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        {messages?.dialogs?.associations || 'Associations'}
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {messages?.dialogs?.associationsDescription || 'Configure relations view, data and setup.'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              {messages?.dialogs?.selectView || 'Select View'}
            </Typography>

            <ToggleButtonGroup value={viewType} exclusive onChange={(e, value) => value && setViewType(value)}>
              {(open?.field?.type !== 'ManyToMany' || open.type === 'normal') && (
                <ToggleButton value='select'>select</ToggleButton>
              )}
              {open?.field?.type === 'ManyToMany' && open.type !== 'normal' && (
                <ToggleButton value='search'>search</ToggleButton>
              )}
              {open?.field?.type === 'ManyToMany' && open.type !== 'normal' && (
                <ToggleButton value='checkbox'>checkbox</ToggleButton>
              )}
              {(open?.field?.type !== 'ManyToMany' || open.type === 'normal') && (
                <ToggleButton value='radio'>radio</ToggleButton>
              )}
            </ToggleButtonGroup>
          </Box>
        )}

        {activeStep === 1 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 2 }}>
                {messages?.dialogs?.selectData || 'Select Data'}
              </Typography>
              <ToggleButtonGroup
                value={dataSourceType}
                exclusive
                onChange={(e, value) => value && setDataSourceType(value)}
              >
                {open?.source && <ToggleButton value='collection'>{open?.source}</ToggleButton>}
                {!open?.source && <ToggleButton value='api'>form external api</ToggleButton>}
                {!open?.source && <ToggleButton value='static'>staticData</ToggleButton>}
              </ToggleButtonGroup>
            </Box>

            {dataSourceType === 'collection' && (
              <div className='px-4 mt-4'>
                <FormControl component='fieldset' fullWidth>
                  <FormLabel component='legend'>{messages.View_Value}</FormLabel>
                  <div className='!flex !flex-row !flex-wrap gap-2'>
                    {getFields.map(field =>
                      field.type === 'OneToOne' || field.type === 'ManyToMany' || field.type === 'ManyToMany'
                        ? null
                        : field.options?.isSystemField === false && (
                            <FormControlLabel
                              key={field.key}
                              className='!w-fit capitalize'
                              checked={selectedOptions.includes(field.key)}
                              onChange={() => {
                                setSelectedOptions(prev => {
                                  if (prev.includes(field.key)) {
                                    return prev.filter(item => item !== field.key)
                                  }

                                  return [...prev, field.key]
                                })
                              }}
                              value={field.key}
                              control={<Checkbox />}
                              label={field.key.replace('_', ' ')}
                            />
                          )
                    )}
                  </div>
                </FormControl>
              </div>
            )}
            {dataSourceType === 'api' && (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  variant='filled'
                  label={messages?.dialogs?.apiEndpoint || 'API Endpoint'}
                  placeholder='https://api.example.com/items'
                  value={externalApi}
                  onChange={e => setExternalApi(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Select variant='filled' value={method} onChange={e => setMethod(e.target.value)}>
                          <MenuItem value='GET'>GET</MenuItem>
                          <MenuItem value='POST'>POST</MenuItem>
                        </Select>
                      </InputAdornment>
                    )
                  }}
                />
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    {messages?.dialogs?.apiHeaders || 'API Headers'}
                  </Typography>
                  <JsonEditor
                    value={apiHeaders}
                    onChange={setApiHeaders}
                    height='150px'
                    isError={headersParsed === null}
                    helperText={headersParsed === null ? messages?.dialogs?.invalidJson || 'Invalid JSON format' : ''}
                  />
                </Box>
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    {messages?.dialogs?.body || 'Body'}
                  </Typography>
                  <JsonEditor
                    value={body}
                    onChange={setBody}
                    height='150px'
                    isError={bodyParsed === null}
                    helperText={bodyParsed === null ? messages?.dialogs?.invalidJson || 'Invalid JSON format' : ''}
                  />
                </Box>
              </Stack>
            )}

            {dataSourceType === 'static' && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    {messages?.dialogs?.staticData || 'Static Data'}
                  </Typography>
                  <JsonEditor
                    value={staticData}
                    onChange={setStaticData}
                    height='200px'
                    isError={staticParsed === null}
                    helperText={staticParsed === null ? messages?.dialogs?.invalidJson || 'Invalid JSON format' : ''}
                  />
                </Box>
              </Stack>
            )}
            {(dataSourceType === 'api' || dataSourceType === 'static') && (
              <>
                <TextField
                  fullWidth
                  variant='filled'
                  label={messages?.dialogs?.responseKey || 'Response key'}
                  placeholder='e.g. name'
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const value = apiKeyInput.trim()
                      if (!value) return
                      setSelectedOptions(prev => (prev.includes(value) ? prev : [...prev, value]))
                      setApiKeyInput('')
                    }
                  }}
                  helperText={messages?.dialogs?.pressEnterToAdd || 'Press Enter to add'}
                />
                {selectedOptions.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedOptions.map(key => (
                      <Chip
                        key={key}
                        label={key}
                        onDelete={() => setSelectedOptions(prev => prev.filter(k => k !== key))}
                      />
                    ))}
                  </Box>
                )}
                <TextField
                  fullWidth
                  variant='filled'
                  label={messages?.dialogs?.valueSend || 'Value Send'}
                  placeholder='e.g. name'
                  value={valueSendInput}
                  onChange={e => setValueSendInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const value = valueSendInput.trim()
                      if (!value) return
                      setSelectedValueSend([value])
                      setValueSendInput('')
                    }
                  }}
                  helperText={messages?.dialogs?.pressEnterToAdd || 'Press Enter to add'}
                />
                {selectedValueSend.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedValueSend.map(key => (
                      <Chip
                        key={key}
                        label={key}
                        onDelete={() => setSelectedOptions(prev => prev.filter(k => k !== key))}
                      />
                    ))}
                  </Box>
                )}
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={onClose}>
          {messages?.cancel || 'Cancel'}
        </Button>
        <Divider flexItem orientation='vertical' sx={{ mx: 1 }} />
        {activeStep > 0 && <Button onClick={handleBack}>{messages?.back || 'Back'}</Button>}
        {activeStep < steps.length - 1 ? (
          <Button variant='contained' onClick={handleNext}>
            {messages?.next || 'Next'}
          </Button>
        ) : (
          <LoadingButton loading={saving} variant='contained' onClick={handleSave}>
            {messages?.save || 'Save'}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AssociationsSetup
