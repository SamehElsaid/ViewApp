import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

const ConfirmDialog = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  confirmButtonProps = {},
  cancelButtonProps = {},
  ...dialogProps
}) => {
  const handleDialogClose = (_, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      onCancel?.()
    }
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth='xs' fullWidth {...dialogProps}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>
        {typeof content === 'string' || typeof content === 'number' ? (
          <Typography variant='body1' component='div'>
            {content}
          </Typography>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant='outlined' color='secondary' onClick={() => onCancel?.()} {...cancelButtonProps}>
          {cancelLabel}
        </Button>
        <Button variant='contained' onClick={() => onConfirm?.()} {...confirmButtonProps}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
