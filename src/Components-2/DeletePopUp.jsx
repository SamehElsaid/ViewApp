import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogContent, Typography } from '@mui/material'
import React from 'react'
import { useIntl } from 'react-intl'

function DeletePopUp({ open, setOpen, handleDelete, loadingButton }) {
  const { messages } = useIntl()

  return (
    <Dialog
      open={Boolean(open)}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={() => {
        setOpen(false)
      }}
    >
      <DialogContent>
        <div className='flex flex-col gap-5 justify-center items-center px-1 py-5'>
          <Typography variant='body1' className='!text-lg' id='alert-dialog-description'>
            {messages.areYouSure}
          </Typography>
          <div className='flex gap-5 justify-between items-end'>
            <LoadingButton variant='contained' color='error' loading={loadingButton} onClick={handleDelete}>
              {messages.delete}
            </LoadingButton>
            <Button color='secondary' variant='contained' onClick={() => setOpen(false)}>
              {messages.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePopUp
