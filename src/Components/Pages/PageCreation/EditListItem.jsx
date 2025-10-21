import { Icon } from '@iconify/react'
import { Drawer, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import { styled } from '@mui/material/styles'

const Header = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '20px 10px',
  justifyContent: 'space-between',
  position: 'sticky',
  background: '#fff',
  borderBottom: '1px solid #00d0e7',
  zIndex: 50,
  top: 0
}))
function EditListItem({ open, handleClose, locale, setDataView, dataView }) {

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '70%' } } }}
    >
      <Header>
        <Typography className='capitalize text-[#555] !font-bold' variant='h4'>
          {open?.[`text_${locale}`]}
        </Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          color='error'
          variant='contained'
          sx={{
            p: '0.438rem',
            borderRadius: 50,
            backgroundColor: 'action.selected'
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      {open && (
        <Box className='h-full'>
          <div className='flex flex-col p-4 h-full'>
            <TextField
              fullWidth
              type='text'
              defaultValue={open?.text_en}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, text_en: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.textInEnglish}
            />
            <TextField
              fullWidth
              type='text'
              defaultValue={open?.text_ar}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, text_ar: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.textInArabic}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.paddingBlock}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, paddingBlock: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.paddingBlock}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.paddingInline}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, paddingInline: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.paddingInline}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.borderRadius}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderRadius: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.borderRadius}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.borderWidth}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderWidth: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.borderWidth}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.backgroundColor}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, backgroundColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.backgroundColor}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.color}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, color: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.color}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.borderColor}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.borderColor}
            />

            <TextField
              fullWidth
              type='number'
              defaultValue={open.fontSize}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, fontSize: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.fontSize}
            />

            <TextField
              fullWidth
              type='number'
              defaultValue={open.fontWeight}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, fontWeight: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.fontWeight}
            />
            <TextField
              fullWidth
              type='text'
              value={open.borderStyle}
              onChange={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderStyle: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.fontFamily}
              select
            >
              <MenuItem value='solid'>Solid</MenuItem>
              <MenuItem value='dashed'>Dashed</MenuItem>
              <MenuItem value='dotted'>Dotted</MenuItem>
              <MenuItem value='double'>Double</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverBackgroundColor}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverBackgroundColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.hoverBackgroundColor}
            />

            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverColor}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverColor: color.hex }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.hoverColor}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverBorderColor}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverBorderColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.hoverBorderColor}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverBorderColor}
              onBlur={e => {

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverBorderColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={messages.dialogs.hoverBorderColor}
            />
          </div>
        </Box>
      )}
    </Drawer>
  )
}

export default EditListItem
