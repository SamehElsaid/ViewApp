import { yupResolver } from '@hookform/resolvers/yup'
import { Icon } from '@iconify/react'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as yup from 'yup'
import { axiosPatch, axiosPost } from './axiosCall'
import { toast } from 'react-toastify'

const CustomCloseButton = styled(IconButton)(() => ({
  top: 0,
  right: 0,
  color: 'white',
  position: 'absolute',
  boxShadow: '20px',
  transform: 'translate(10px, -10px)',
  borderRadius: '10px',
  backgroundColor: `#00cfe8!important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

export default function AddCategory({ open, setOpen, setRefresh }) {
  const { locale, messages } = useIntl()
  const [loadingBtn, setLoadingBtn] = useState(false)

  const schema = yup.object().shape({
    nameEn: yup
      .string()
      .required(messages.required)
      .min(3, locale === 'ar' ? 'يجب ان يكون الاسم اكثر من 3 احرف' : 'Name must be more than 3 characters'),
    nameAr: yup
      .string()
      .required(messages.required)
      .min(3, locale === 'ar' ? 'يجب ان يكون الاسم اكثر من 3 احرف' : 'Name must be more than 3 characters')
  })


  const defaultValues = {
    nameAr: '',
    nameEn: ''
  }

  const {
    control,
    setError,
    setValue,
    reset,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
    mode: 'onChange'
  })

  const setValueWithTrigger = useCallback((name, value) => {
    setValue(name, value)
    trigger(name)
  }, [setValue, trigger])

  useEffect(() => {
    if (typeof open !== 'boolean') {
      setValueWithTrigger('nameAr', open.nameAr)
      setValueWithTrigger('nameEn', open.nameEn)
    }
  }, [open, setValueWithTrigger])

  const close = () => {
    setOpen(false)
    reset()
  }

  const onSubmit = data => {
    setLoadingBtn(true)
    if (typeof open !== 'boolean') {
      axiosPatch(`Category`, locale, { ...data, id: open.id }).then(res => {
        if (res.status) {
          toast.success(locale === 'ar' ? 'تم تعديل الفئة بنجاح' : 'Category updated successfully')
          close()
          setRefresh(prev => prev + 1)
        }
      }).finally(() => {
        setLoadingBtn(false)
      })
    } else {
      axiosPost('Category', locale, data).then(res => {
        if (res.status) {
          toast.success(locale === 'ar' ? 'تم اضافة الفئة بنجاح' : 'Category added successfully')
          close()
          setRefresh(prev => prev + 1)
        }
      }).finally(() => {
        setLoadingBtn(false)
      })
    }
  }

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      fullWidth
      maxWidth='sm'
      scroll='body'
      open={Boolean(open)}
      onClose={close}
    >
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          component='div'
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h3' sx={{ mb: 2 }}>
            {typeof open !== 'boolean'
              ? locale === 'ar'
                ? 'تعديل قسم'
                : 'Edit Category'
              : locale === 'ar'
              ? 'اضف قسم'
              : 'Add Category'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid sx={{ mb: 8 }}>
            <CustomCloseButton onClick={close}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
          </Grid>
          <Box className='flex flex-col items-center'>
            <Controller
              name='nameAr'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <CustomTextField
                    fullWidth
                    value={value}
                    id='refer-name'
                    onChange={e => {
                      onChange(e.target.value) // Update value in the form state
                    }}
                    error={Boolean(errors.nameAr)}
                    {...(errors.nameAr && { helperText: errors.nameAr.message })}
                    label={locale === 'ar' ? 'الاسم بالعربية' : 'Name in Arabic'}
                  />
                </Box>
              )}
            />
            <div className='mt-4'></div>
            <Controller
              name='nameEn'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <CustomTextField
                    fullWidth
                    value={value}
                    id='refer-name'
                    onChange={e => {
                      onChange(e.target.value) // Update value in the form state
                    }}
                    error={Boolean(errors.nameEn)}
                    {...(errors.nameEn && { helperText: errors.nameEn.message })}
                    label={locale === 'ar' ? 'الاسم بالانجليزية' : 'Name in English'}
                  />
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            mt: 4,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <LoadingButton loading={loadingBtn} variant='contained' type='submit'>
            {locale === 'ar' ? ' ارسال' : 'Send'}
          </LoadingButton>
          <Button variant='tonal' color='secondary' onClick={close}>
            {locale === 'ar' ? 'الغاء' : 'Cancel'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
