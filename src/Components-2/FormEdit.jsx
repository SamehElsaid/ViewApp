import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'
import { axiosPatch, UrlTranAr } from './axiosCall'
import { Icon } from '@iconify/react'
import { LoadingButton } from '@mui/lab'

function FormEdit({ open, setOpen, setData }) {
  const { locale, messages } = useIntl()
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldLabelEn, setFieldLabelEn] = useState('')
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (open) {
      setFieldLabel(open.nameAr)
      setFieldLabelEn(open.nameEn)
    }
  }, [open])

  const updateField = () => {
    if (!fieldLabel || !fieldLabelEn) {
      toast.error(locale === 'ar' ? 'يجب إدخال الحقلين' : 'Please enter the fields')
      
      return
    }

    setLoading(true)
    axiosPatch(`collection-fields/update`, locale, {
      id: open.id,
      nameAr: fieldLabel,
      nameEn: fieldLabelEn
    }).then(res => {
      if (res.status) {
        toast.success(locale === 'ar' ? 'تم التعديل' : 'Field updated')
        setOpen(null)
        setData(prev => ({
          ...prev,
          fields: prev.fields.map(field =>
            field.id === open.id ? { ...field, nameAr: fieldLabel, nameEn: fieldLabelEn } : field
          )
        }))
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <Dialog open={open} onClose={() => setOpen(null)} fullWidth>
      <DialogTitle>{locale === 'ar' ? 'تعديل الحقل' : 'Edit Field'}</DialogTitle>
      <DialogContent>
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
                  const loading = toast.loading(locale === 'ar' ? 'يتم الترجمه' : 'Translating')
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
                  const loading = toast.loading(locale === 'ar' ? 'يتم الترجمه' : 'Translating')
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
      </DialogContent>
      <DialogActions>
        <LoadingButton variant='contained' loading={loading} onClick={() => updateField()}>
          {locale === 'ar' ? 'حفظ' : 'Save'}
        </LoadingButton>
        <Button variant='contained' color='secondary' onClick={() => setOpen(null)}>
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FormEdit
