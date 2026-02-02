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

  useEffect(() => {
    if (open) {
      setFieldLabel(
        open.nameAr === 'CreatedAt'
          ? "تاريخ الإنشاء"
          : open.nameAr === 'UpdatedAt'
          ? "تاريخ التحديث"
          : open.nameAr === 'DeletedAt'
          ? "تاريخ الحذف"
          : open.nameAr === 'UpdatedBy'
          ? 'المستخدم المحدث'
          : open.nameAr === 'DeletedBy'
          ? 'المستخدم المحذف'
          : open.nameAr === 'CreatedBy'
          ? 'المستخدم المنشئ'
          : open.nameAr === 'Id'
          ? 'المعرف'
          : open.nameAr
      )
      setFieldLabelEn(open.nameEn)
    }
  }, [open])

  const maxLengthObj = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'maxlength')
  const minLengthObj = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'minlength')

  const maxLength =
    typeof maxLengthObj?.parameters === 'object'
      ? Object.values(maxLengthObj.parameters)[0]
      : maxLengthObj?.parameters ?? ''

  const minLength =
    typeof maxLengthObj?.parameters === 'object'
      ? Object.values(minLengthObj.parameters)[0]
      : minLengthObj?.parameters ?? ''

  const required = open?.validationData?.find(item => item.ruleType.toLowerCase() === 'required')?.parameters

  const unique =
    open?.validationData?.find(item => item.ruleType.toLowerCase() === 'unique')?.parameters || open?.key === 'Id'

  let data = {}
  try {
    data = JSON.parse(open?.descriptionEn)
  } catch (error) {
    data = {}
  }

  return (
    <Dialog open={Boolean(open)} onClose={() => setOpen(null)} fullWidth>
      <DialogTitle>{messages.field.view}</DialogTitle>
      <DialogContent>
        <TextField
          label={messages.type}
          fullWidth
          margin='normal'
          value={open?.type ? messages[getTypeFromCollection(open?.type, open?.descriptionAr)] : ''}
          variant='outlined'
          disabled
        />
        <TextField
          disabled
          label={messages.filed_name_ar}
          fullWidth
          margin='normal'
          value={fieldLabel}
          variant='outlined'
        />
        <TextField
          disabled
          label={messages.filed_name_en}
          fullWidth
          variant='outlined'
          margin='normal'
          value={fieldLabelEn}
        />
        <TextField disabled label={messages.key} fullWidth variant='outlined' margin='normal' value={open?.key} />
        <TextField
          label={messages.field.minLength}
          fullWidth
          variant='outlined'
          margin='normal'
          value={minLength}
          disabled
        />
        <TextField
          label={messages.field.maxLength}
          fullWidth
          variant='outlined'
          margin='normal'
          value={maxLength}
          disabled
        />
        <FormControlLabel control={<Checkbox checked={required} disabled />} label={messages.field.required} />
        <FormControlLabel control={<Checkbox checked={unique} disabled />} label={messages.field.unique} />
        {open?.type == 'Date' && (
          <>
            <FormControlLabel
              control={<Checkbox checked={data?.showTime} disabled />}
              label={messages.field.showTime}
            />
            <TextField
              label={messages.field.format}
              fullWidth
              variant='outlined'
              margin='normal'
              value={data?.format ? data.format : 'MM/dd/yyyy'}
              disabled
            />
          </>
        )}
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {messages.field.relation}
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
            <Chip label={messages.notFound} />
          )}
        </Typography>
        <div className='mt-4'></div>
        {open?.type === 'File' && (
          <>
            <Typography
              variant='subtitle2'
              className='capitalize text-overflow'
              sx={{ fontWeight: 500, color: 'text.secondary' }}
            >
              {messages.fileTypes}
            </Typography>
            <div className='flex flex-wrap gap-2 '>
              {open.options.uiSchema.xComponentProps.fileTypes.map((item, index) => (
                <Chip key={index} label={item} />
              ))}
            </div>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='secondary' onClick={() => setOpen(null)}>
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewField
