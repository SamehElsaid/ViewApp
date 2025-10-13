import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { getTypeFromCollection } from './_Shared'
import GetCollectionName from './GetCollectionName'

function ViewField({ open, setOpen, setData }) {
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

  const maxLength = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'maxlength')?.parameters
  const minLength = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'minlength')?.parameters
  const required = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'required')?.parameters
  const unique = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'unique')?.parameters

  const data = open?.descriptionEn ? JSON.parse(open?.descriptionEn) : {}

  return (
    <Dialog open={open} onClose={() => setOpen(null)} fullWidth>
      <DialogTitle>{locale === 'ar' ? 'عرض الحقل' : 'View Field'}</DialogTitle>
      <DialogContent>
        <TextField
          label={locale === 'ar' ? 'النوع' : 'Type'}
          fullWidth
          margin='normal'
          value={open?.type ? messages[getTypeFromCollection(open?.type, open?.descriptionAr)] : ''}
          variant='outlined'
        />
        <TextField label={messages.filed_name_ar} fullWidth margin='normal' value={fieldLabel} variant='outlined' />
        <TextField label={messages.filed_name_en} fullWidth variant='outlined' margin='normal' value={fieldLabelEn} />
        <TextField label={messages.key} fullWidth variant='outlined' margin='normal' value={open?.key} />
        <TextField
          label={locale === 'ar' ? 'الحد الأقصى' : 'Max Length'}
          fullWidth
          variant='outlined'
          margin='normal'
          value={maxLength ?? 0}
        />
        <TextField
          label={locale === 'ar' ? 'الحد الأدنى' : 'Min Length'}
          fullWidth
          variant='outlined'
          margin='normal'
          value={minLength ?? 0}
        />
        <FormControlLabel control={<Checkbox checked={required} />} label={locale === 'ar' ? 'مطلوب' : 'Required'} />
        <FormControlLabel control={<Checkbox checked={unique} />} label={locale === 'ar' ? 'فريد' : 'Unique'} />
        {open?.type == 'Date' && (
          <>
            <FormControlLabel
              control={<Checkbox checked={data.showTime} />}
              label={locale === 'ar' ? 'اظهار الوقت' : 'Show Time'}
            />
            <TextField
              label={locale === 'ar' ? 'التنسيق' : 'Format'}
              fullWidth
              variant='outlined'
              margin='normal'
              value={data.format ?? ''}
            />
          </>
        )}
        <div className='mt-4'></div>
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {locale === 'ar' ? 'العلاقة' : 'Relation'}
        </Typography>
        <div className='mt-2'></div>
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {true && (open?.type === 'OneToOne' || open?.type === 'ManyToMany') ? (
            open.type === 'OneToOne' ? (
              <GetCollectionName name={open?.options?.source} />
            ) : (
              <GetCollectionName name={open?.options?.target} />
            )
          ) : (
            <Chip label={locale === 'ar' ? 'لا يوجد' : 'Not Found'} />
          )}
        </Typography>
        {/* <FormControlLabel
          control={<Checkbox checked={unique} disabled />}
          label={locale === 'ar' ? 'فريد' : 'Unique'}
        /> */}
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='secondary' onClick={() => setOpen(null)}>
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewField
