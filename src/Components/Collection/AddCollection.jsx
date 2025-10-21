import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import { useIntl } from 'react-intl'
import { Checkbox, FormControlLabel, InputAdornment, Card, CardContent, Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LoadingButton } from '@mui/lab'
import { UrlTranEn, UrlTranAr, axiosPost, axiosPut } from '../axiosCall'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const AddCollection = props => {
  // ** Props
  const { open, toggle, setRefresh } = props
  const { messages, locale } = useIntl()

  const schema = yup.object().shape({
    name_ar: yup.string().required(messages['required']).trim(),
    name_en: yup.string().required(messages['required']).trim(),
    description_ar: yup.string().trim(),
    description_en: yup.string().trim(),
    isLookup: yup.boolean(),
    options: yup.object().shape({
      createdAt: yup.boolean(),
      createdBy: yup.boolean(),
      updatedAt: yup.boolean(),
      updatedBy: yup.boolean(),
      isReadOnly: yup.boolean()
    }),
    key: yup
      .string()
      .required(messages['required'])
      .matches(
        /^[A-Za-z]+$/,
        locale === 'ar' ? 'يجب أن يكون المفتاح عبارة عن أحرف ولا يحتوي على مسافات' : 'Key must be a string and not contain spaces'
      )
      .trim()
  })

  const defaultValues = {
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    isLookup: false,
    options: {
      createdAt: true,
      createdBy: true,
      updatedAt: true,
      updatedBy: true,
      isReadOnly: false
    },
    key: ''
  }

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = data => {
    const sendData = {
      nameAr: data.name_ar,
      nameEn: data.name_en,
      descriptionAr: data.description_ar,
      descriptionEn: data.description_en,
      key: data.key.toLowerCase().trim(),
      isLookup: data.isLookup,
      options: {
        createdAt: data.options.createdAt,
        createdBy: data.options.createdBy,
        updatedAt: data.options.updatedAt,
        updatedBy: data.options.updatedBy,
        isReadOnly: data.options.isReadOnly
      }
    }

    if (typeof open !== 'boolean') {
    
      setLoading(true)

      delete sendData.key
      sendData.id = open.id

      axiosPut('collections/update', locale, sendData)
        .then(res => {
          if (res.status) {
            toast.success(locale === 'ar' ? 'تم إضافة نموذج البيانات بنجاح' : 'Data Model added successfully')
            handleClose()
            setRefresh(prev => prev + 1)
          }
        })
        .catch(err => {
          toast.error(locale === 'ar' ? 'حدث خطأ' : 'An error occurred')
        })
        .finally(_ => {
          setLoading(false)
        })
    } else {
      setLoading(true)
      axiosPost('collections/add', locale, sendData)
        .then(res => {
          if (res.status) {
            toast.success(locale === 'ar' ? 'تم إضافة نموذج البيانات بنجاح' : 'Data Model added successfully')
            handleClose()
            setRefresh(prev => prev + 1)
          }
        })
        .catch(err => {
          toast.error(locale === 'ar' ? 'حدث خطأ' : 'An error occurred')
        })
        .finally(_ => {
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    if (typeof open !== 'boolean') {
      setValue('name_ar', open.nameAr)
      setValue('name_en', open.nameEn)
      setValue('description_ar', open.descriptionAr ?? '')
      setValue('key', open.key.trim())
      setValue('description_en', open.descriptionEn ?? '')
      setValue('isLookup', open.isLookup ?? false)
      setValue('options.isReadOnly', open.options?.isReadOnly ?? false)
      setValue('options.createdAt', open.options?.createdAt ?? true)
      setValue('options.createdBy', open.options?.createdBy ?? true)
      setValue('options.updatedAt', open.options?.updatedAt ?? true)
      setValue('options.updatedBy', open.options?.updatedBy ?? true)
      trigger('name_ar')
      trigger('name_en')
      trigger('description_ar')
      trigger('description_en')
      trigger('isLookup')
      trigger('options.isReadOnly')
      trigger('options.createdAt')
      trigger('options.createdBy')
      trigger('options.updatedAt')
      trigger('options.updatedBy')
    }
  }, [open, setValue, trigger])

  const handleClose = () => {
    toggle()
    reset()
  }

  return (
    <>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '70%', sm: '50%' } } }}
      >
        <Header>
          <Typography variant='h5'>
            {typeof open === 'boolean'
              ? locale === 'ar'
                ? 'إضافة نموذج البيانات'
                : 'Add Data Model'
              : locale === 'ar'
              ? open.nameAr
              : open.nameEn}
          </Typography>
          <IconButton
            size='small'
            onClick={handleClose}
            sx={{
              p: '0.438rem',
              borderRadius: 1,
              color: 'text.primary',
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
              }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>
        <Box sx={{ p: theme => theme.spacing(0, 6, 6), height: '100%', overflow: 'auto' }}>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-4 min-h-full'>
            <Controller
              name='key'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  disabled={typeof open !== 'boolean'}
                  type='text'
                  label={
                    <span>
                      {messages['key']}
                      <span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  error={Boolean(errors.key)}
                  placeholder={messages['key']}
                  {...(errors.key && { helperText: errors.key.message })}
                />
              )}
            />
            <Controller
              name='name_ar'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={
                    <span>
                      {messages['collectionNameAR']}
                      <span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  error={Boolean(errors.name_ar)}
                  placeholder={messages['collectionNameAR']}
                  {...(errors.name_ar && { helperText: errors.name_ar.message })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        onClick={async () => {
                          const loading = toast.loading(locale === 'ar' ? 'يتم الترجمه' : 'Translating')
                          const res = await UrlTranAr(value)
                          setValue('name_en', res)
                          trigger('name_en')
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
              )}
            />
            <Controller
              name='name_en'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={
                    <span>
                      {messages['collectionNameEN']}
                      <span style={{ color: 'red' }}> *</span>
                    </span>
                  }
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  error={Boolean(errors.name_en)}
                  placeholder={messages['collectionNameEN']}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        onClick={async () => {
                          const loading = toast.loading(locale === 'ar' ? 'يتم الترجمه' : 'Translating')
                          const res = await UrlTranEn(value)
                          setValue('name_ar', res)
                          trigger('name_ar')
                          toast.dismiss(loading)
                        }}
                      >
                        <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                          <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.name_en && { helperText: errors.name_en.message })}
                />
              )}
            />
            <Controller
              name='description_ar'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={messages.card['description_ar']}
                  value={value}
                  sx={{ mb: 4 }}
                  multiline
                  rows={4}
                  onChange={onChange}
                  error={Boolean(errors.description_ar)}
                  placeholder={messages.card['description_ar']}
                  {...(errors.description_ar && { helperText: errors.description_ar.message })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        onClick={async () => {
                          const loading = toast.loading(locale === 'ar' ? 'يتم الترجمه' : 'Translating')
                          const res = await UrlTranAr(value)
                          setValue('description_en', res)
                          trigger('description_en')
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
              )}
            />
            <Controller
              name='description_en'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={messages.card['description_en']}
                  value={value}
                  sx={{ mb: 4 }}
                  multiline
                  rows={4}
                  onChange={onChange}
                  error={Boolean(errors.description_en)}
                  placeholder={messages.card['description_en']}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        onClick={async () => {
                          const loading = toast.loading(locale === 'ar' ? 'يتم الترجمه' : 'Translating')
                          const res = await UrlTranEn(value)
                          setValue('description_ar', res)
                          trigger('description_ar')
                          toast.dismiss(loading)
                        }}
                      >
                        <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                          <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.description_en && { helperText: errors.description_en.message })}
                />
              )}
            />
            <Controller
              name='isLookup'
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value}
                      onChange={e => {
                        setValue('isLookup', e.target.checked)
                        trigger('isLookup')
                      }}
                    />
                  }
                  label={locale === 'ar' ? 'جدول مرجعى' : 'Lookup Table'}
                />
              )}
            />

            {/* Options Section */}
            <Card sx={{ 
              mt: 4, 
              mb: 2, 
              border: '2px solid', 
              borderColor: 'primary.main',
              backgroundColor: 'background.paper',
              boxShadow: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h6' sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  {locale === 'ar' ? 'الخيارات' : 'Options'}
                </Typography>
                
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='options.isReadOnly'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={e => {
                                setValue('options.isReadOnly', e.target.checked)
                                trigger('options.isReadOnly')
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'للقراءة فقط' : 'Read Only'}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='options.createdAt'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={e => {
                                setValue('options.createdAt', e.target.checked)
                                trigger('options.createdAt')
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='options.createdBy'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={e => {
                                setValue('options.createdBy', e.target.checked)
                                trigger('options.createdBy')
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'أنشئ بواسطة' : 'Created By'}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='options.updatedAt'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={e => {
                                setValue('options.updatedAt', e.target.checked)
                                trigger('options.updatedAt')
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'تاريخ التحديث' : 'Updated At'}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='options.updatedBy'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={e => {
                                setValue('options.updatedBy', e.target.checked)
                                trigger('options.updatedBy')
                              }}
                            />
                          }
                          label={locale === 'ar' ? 'حدث بواسطة' : 'Updated By'}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }} className='gap-4 justify-end py-4'>
              <LoadingButton type='submit' variant='contained' loading={loading}>
                {typeof open === 'boolean' ? messages.submit : messages.Update}
              </LoadingButton>
              <Button variant='contained' color='secondary' onClick={handleClose}>
                {typeof open === 'boolean' ? messages.cancel : messages.cancel}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </>
  )
}

export default AddCollection
