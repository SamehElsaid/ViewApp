import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogContent, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { appViewOptions } from 'src/Components/_Shared'

function ClonePagePopUp({ open, setOpen, pageName, onConfirm, loading }) {
  const { messages, locale } = useIntl()
  const [pageTypeId, setPageTypeId] = useState(appViewOptions[0]?.id ?? 1)
  const [newPageName, setNewPageName] = useState('')

  useEffect(() => {
    if (open) {
      setNewPageName(pageName ?? '')
      setPageTypeId(appViewOptions[0]?.id ?? 1)
    }
  }, [open, pageName])

  const handleClose = () => {
    setOpen(false)
  }

  const handleConfirm = () => {
    onConfirm(newPageName || pageName, pageTypeId)
  }

  return (
    <Dialog
      open={Boolean(open)}
      aria-labelledby='clone-dialog-title'
      onClose={handleClose}
    >
      <DialogContent>
        <div className='flex flex-col gap-5 justify-center px-1 py-5 min-w-[320px]'>
          <Typography variant='h6' id='clone-dialog-title'>
            {messages.dialogs?.clonePage || 'Clone Page'}
          </Typography>
          <TextField
            fullWidth
            variant='filled'
            label={locale === 'ar' ? 'اسم الصفحة الجديدة' : 'New Page Name'}
            value={newPageName}
            onChange={e => setNewPageName(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>{messages['appView'] || 'App View'}</InputLabel>
            <Select
              value={pageTypeId}
              label={messages['appView'] || 'App View'}
              onChange={e => setPageTypeId(Number(e.target.value))}
            >
              {appViewOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {locale === 'ar' ? option.name_ar : option.name_en}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className='flex gap-3 justify-end'>
            <Button color='secondary' variant='outlined' onClick={handleClose} disabled={loading}>
              {messages.cancel}
            </Button>
            <LoadingButton variant='contained' color='primary' loading={loading} onClick={handleConfirm}>
              {messages.dialogs?.clone || 'Clone'}
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ClonePagePopUp
