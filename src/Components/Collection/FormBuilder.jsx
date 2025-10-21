import React, { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  InputAdornment,
  FormLabel,
  CircularProgress,
  Autocomplete,
  Box
} from '@mui/material'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'
import { LoadingButton } from '@mui/lab'
import { Icon } from '@iconify/react'
import { axiosGet, axiosPost, UrlTranAr, UrlTranEn } from '../axiosCall'
import Collapse from '@kunukn/react-collapse'
import { DefaultStyle, getType } from '../_Shared'
import { useRouter } from 'next/router'
import { fieldTypes, fileTypes, OptionsStep, steps } from '../_formBuilderShared'

const FormBuilder = ({ open, setOpen, setRefresh }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [fieldType, setFieldType] = useState('')
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldLabelEn, setFieldLabelEn] = useState('')
  const [key, setKey] = useState('')
  const [optionType, setOptionType] = useState('option')

  const [validations, setValidations] = useState({
    required: false,
    unique: false,
    minLength: '',
    maxLength: '',
    format: 'MM/dd/yyyy',
    showTime: 'false'
  })

  const [fileExtensions, setFileExtensions] = useState([])

  const isOptionsStep = OptionsStep.includes(fieldType)
  const isFileStep = fieldType === 'file'
  const { messages, locale } = useIntl()

  const handleNext = () => {
    const regex = /^[A-Za-z]+$/

    if (activeStep === 0 && !fieldType) return toast.error(messages.please_select_field_type)
    if (activeStep === 1 && (!fieldLabel || !fieldLabelEn || !key)) return toast.error(messages.please_enter_label)
    if (activeStep === 1 && !regex.test(key)) {
      return toast.error(messages.generateInput.keyMustBeString)
    }
    if (activeStep === 2 && !isOptionsStep && !isFileStep) {
      console.log('activeStep', validations.maxLength, validations.minLength)
      if(+validations.maxLength < +validations.minLength && validations.maxLength !== '') {
        return toast.error(messages.maxLengthMustBeGreaterThanMinLength)
      }
      
      setActiveStep(steps.length - 1) // Skip the setup step if not required
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const [loading, setLoading] = useState(false)

  const handleToggleFileExtension = extension => {
    if (fileExtensions.includes(extension)) {
      setFileExtensions(fileExtensions.filter(ext => ext !== extension))
    } else {
      setFileExtensions([...fileExtensions, extension])
    }
  }

  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [collection, setCollection] = useState('')
  const [valueCollection, setValueCollection] = useState('')
  const [selectedOptions, setSelectedOptions] = useState([])
  const [getFields, setGetFields] = useState([])

  const {
    query: { dataSourceId }
  } = useRouter()

  useEffect(() => {
    if (!dataSourceId) return
    setLoadingCollection(true)
    axiosGet(`collections/get/?dataSourceId=${dataSourceId}`, locale)
      .then(res => {
        if (res.status) {
          setOptionsCollection(res.data)
        }
      })
      .finally(() => {
        setLoadingCollection(false)
      })
  }, [locale, dataSourceId, open])

  const handleInputChange = async (event, value) => {
    if (!value) {
      setValueCollection('')
    }
    setValueCollection(value)

    try {
      const res = await axiosGet(`collections/get/?dataSourceId=${dataSourceId}`, locale)
      if (res.status) {
        setOptionsCollection(res.data)
      }
    } finally {
      setLoadingCollection(false)
    }
  }

  const resetForm = () => {
    setOpen(false)
    setActiveStep(0)
    setFieldType('')
    setFieldLabel('')
    setFieldLabelEn('')
    setKey('')
    setValidations({
      required: false,
      unique: false,
      minLength: '',
      maxLength: '',
      regex: '',
      regexMessageAr: '',
      regexMessageEn: '',
      format: 'MM/dd/yyyy',
      showTime: 'false'
    })
    setFileExtensions([])
    setGetFields([])
    setValueCollection('')
    setSelectedOptions([])
    setOptionsCollection([])
    setCollection('')
    setOptionType('option')
    setLoadingCollection(false)
  }

  const FindFieldCategory = fieldType => {
    if (
      fieldType === 'select' ||
      fieldType === 'radio' ||
      fieldType === 'checkbox' ||
      fieldType === 'multiple_select'
    ) {
      return 'Associations'
    }

    return 'Basic'
  }

  const handleFinish = () => {
    if (optionType === 'link') {
      if (!valueCollection || !selectedOptions.length) return toast.error(messages.please_enter_label)
    }

    const validationData = []
    if (validations.required) {
      validationData.push({ RuleType: 'Required', Parameters: {} })
    }

    if (validations.maxLength) {
      validationData.push({ RuleType: 'MaxLength', Parameters: { maxLength: validations.maxLength } })
    }
    if (validations.minLength) {
      validationData.push({ RuleType: 'MinLength', Parameters: { minLength: validations.minLength } })
    }

    if (validations.unique) {
      validationData.push({
        RuleType: 'Unique',
        Parameters: {
          tableName: open.key,
          columnNames: [key]
        }
      })
    }

    if (fieldType === 'url') {
      validationData.push({ RuleType: 'Url', Parameters: {} })
    }
    if (fieldType === 'email') {
      validationData.push({ RuleType: 'Email', Parameters: {} })
    }
    if (fieldType === 'date' || fieldType === 'time') {
      validationData.push({ RuleType: 'ColumnDataType', Parameters: { expectedType: 'System.DateTime' } })
    }
    if (fieldType === 'number') {
      validationData.push({ RuleType: 'ColumnDataType', Parameters: { expectedType: 'System.Int64' } })
    }

    const sendData = {
      collectionId: open.id,
      key: key.trim(),
      nameAr: fieldLabel.trim(),
      nameEn: fieldLabelEn.trim(),
      descriptionAr: fieldLabel.trim(),
      descriptionEn: fieldLabelEn.trim(),
      type: getType(fieldType === 'time' ? 'date' : fieldType === 'rate' ? 'number' : fieldType),
      FieldCategory: FindFieldCategory(fieldType),

      options: {
        uiSchema: {
          xComponentProps: {
            cssClass: DefaultStyle(fieldType === 'time' ? 'date' : fieldType === 'rate' ? 'number' : fieldType),
            fileTypes: isFileStep ? fileExtensions : []
          }
        }
      },
      validationData
    }
    if (fieldType === 'date' || fieldType === 'time') {
      sendData.descriptionEn = JSON.stringify({
        format: validations.format || 'MM/dd/yyyy',
        showTime: validations.showTime || 'false'
      })
    }

    if (
      fieldType === 'select' ||
      fieldType === 'radio' ||
      fieldType === 'checkbox' ||
      fieldType === 'multiple_select'
    ) {
      sendData.descriptionEn = JSON.stringify(selectedOptions)
      sendData.descriptionAr = fieldType
      if (fieldType !== 'checkbox') {
        sendData.options.foreignKey = key + 'Id'
        sendData.options.sourceKey = 'id'
        sendData.options.targetKey = open.key + 'Id'
      }
      sendData.options.source = collection.key
      sendData.options.target = open.key
      if (selectedOptions.length === 0) {
        return toast.error(messages.generateInput.selectField)
      }
    }
    if (fieldType === 'rate') {
      sendData.descriptionEn = 'rate'
    }
    if (fieldType === 'time') {
      sendData.descriptionEn = 'timeOnly'
    }
    if (fieldType === 'checkbox') {
      sendData.options.target = collection.key
      sendData.options.source = open.key
      sendData.options.junctionTable = `${open.key}${collection.key}`
      sendData.key = `${open.key}${collection.key}`
    }
    if (fieldType === 'multiple_select') {
      sendData.options.target = collection.key
      sendData.options.source = open.key
      sendData.options.junctionTable = `${open.key}${collection.key}`
      sendData.key = `${open.key}${collection.key}`
      sendData.descriptionAr = 'multiple_select'
    }

    setLoading(true)

    axiosPost('collection-fields/configure-fields', locale, sendData)
      .then(res => {
        if (res.status) {
          toast.success(messages.addedSuccessfully)
          resetForm()
          setRefresh(prev => prev + 1)
        }
      })
      .finally(_ => {
        setLoading(false)
      })
  }

  return (
    <div>
      <Dialog open={open} onClose={resetForm} fullWidth>
        <DialogTitle>{messages.addFiled}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{messages[label]}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div className='p-4 mt-5 rounded-md border border-dashed border-main-color'>
            {/* Step 1: Select Field Type */}
            {activeStep === 0 && (
              <FormControl fullWidth margin='normal'>
                <InputLabel>{messages.Field_Type}</InputLabel>
                <Select variant='filled' value={fieldType} onChange={e => setFieldType(e.target.value)}>
                  {fieldTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type === 'multiple_select' ? messages.Search_Select : messages[type]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Step 2: Enter Label */}
            {activeStep === 1 && (
              <>
                <TextField
                  label={messages.filed_name_ar}
                  fullWidth
                  margin='normal'
                  value={fieldLabel}
                  onChange={e => setFieldLabel(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        onClick={async () => {
                          const loading = toast.loading(messages.translate)
                          const res = await UrlTranAr(fieldLabel)
                          setFieldLabelEn(res)
                          toast.dismiss(loading)
                        }}
                      >
                        <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                          <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label={messages.filed_name_en}
                  fullWidth
                  margin='normal'
                  value={fieldLabelEn}
                  onChange={e => setFieldLabelEn(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        onClick={async () => {
                          const loading = toast.loading(messages.translate)
                          const res = await UrlTranEn(fieldLabelEn)
                          setFieldLabel(res)
                          toast.dismiss(loading)
                        }}
                      >
                        <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                          <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label={messages.keyName}
                  fullWidth
                  margin='normal'
                  value={key}
                  onChange={e => setKey(e.target.value)}
                />
              </>
            )}

            {/* Step 3: Validation */}

            {activeStep === 2 && (
              <div>
                {fieldType === 'date' && (
                  <>
                    <TextField
                      label={messages.generateInput.format}
                      type='text'
                      fullWidth
                      margin='normal'
                      value={validations.format}
                      onChange={e =>
                        setValidations({
                          ...validations,
                          format: e.target.value
                        })
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={validations.showTime === 'true'}
                          onChange={e =>
                            setValidations({
                              ...validations,
                              showTime: e.target.checked ? 'true' : 'false'
                            })
                          }
                        />
                      }
                      label={messages.generateInput.showTime}
                    />
                  </>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={validations.required}
                      onChange={e =>
                        setValidations({
                          ...validations,
                          required: e.target.checked
                        })
                      }
                    />
                  }
                  label={messages.Required}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={validations.unique}
                      onChange={e =>
                        setValidations({
                          ...validations,
                          unique: e.target.checked
                        })
                      }
                    />
                  }
                  label={messages.generateInput.unique}
                />
                {!(
                  fieldType === 'checkbox' ||
                  fieldType === 'email' ||
                  fieldType === 'radio' ||
                  fieldType === 'select' ||
                  fieldType === 'date' ||
                  fieldType === 'file' ||
                  fieldType === 'time' ||
                  fieldType === 'tel'
                ) && (
                  <TextField
                    label={messages.Min_Length}
                    type='number'
                    fullWidth
                    margin='normal'
                    value={validations.minLength}
                    onChange={e =>
                      setValidations({
                        ...validations,
                        minLength: e.target.value
                      })
                    }
                  />
                )}
                {!(
                  fieldType === 'checkbox' ||
                  fieldType === 'email' ||
                  fieldType === 'radio' ||
                  fieldType === 'select' ||
                  fieldType === 'date' ||
                  fieldType === 'file' ||
                  fieldType === 'time' ||
                  fieldType === 'tel'
                ) && (
                  <TextField
                    label={messages.Max_Length}
                    type='number'
                    fullWidth
                    margin='normal'
                    value={validations.maxLength}
                    min={validations.minLength}
                    onChange={e => {
                      setValidations({
                        ...validations,
                        maxLength: e.target.value
                      })
                    }}
                  />
                )}
              </div>
            )}

            {/* Step 4: Setup Options (Checkbox, Radio, Select) */}
            {activeStep === 3 && isOptionsStep && (
              <>
                <div className='mt-4'></div>
                <Autocomplete
                  options={loadingCollection ? [] : optionsCollection.filter(item => item.id !== open)}
                  getOptionLabel={option => (locale === 'ar' ? option.nameAr : option.nameEn) || ''}
                  loading={loadingCollection}
                  onInputChange={handleInputChange}
                  value={collection}
                  onChange={(e, value) => {
                    setCollection(value)
                    setValueCollection('')
                    setSelectedOptions([])
                    if (value?.id) {
                      const loadingToast = toast.loading(messages.loading)
                      axiosGet(`collection-fields/get?CollectionId=${value.id}`, locale)
                        .then(res => {
                          if (res.status) {
                            setGetFields(res.data)
                          }
                        })
                        .finally(() => {
                          toast.dismiss(loadingToast)
                        })
                    }
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
                <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(getFields.length)}>
                  <div className='px-4 mt-4'>
                    <FormControl component='fieldset' fullWidth>
                      <FormLabel component='legend'>{messages.View_Value}</FormLabel>
                      <div className='!flex !flex-row !flex-wrap gap-2'>
                        {getFields.map(field =>
                          field.type === 'OneToOne' ||
                          field.type === 'ManyToMany' ||
                          field.type === 'ManyToMany' ? null : (
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
                </Collapse>
              </>
            )}

            {/* Step 4: File Extensions Setup */}
            {activeStep === 3 && isFileStep && (
              <div>
                <h4>{messages.Select_Allowed_File_Types}:</h4>
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
            )}

            {activeStep === 3 && !isOptionsStep && !isFileStep && (
              <div className='min-h-[100px] flex items-center justify-center text-main-color'>
                <h4>{messages.setup_Done}</h4>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant='contained' color='warning'>
              {messages.back}
            </Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button onClick={handleNext} variant='contained' color='primary'>
              {messages.next}
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <LoadingButton loading={loading} onClick={handleFinish} variant='contained' color='primary'>
              {messages.finish}
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default FormBuilder
