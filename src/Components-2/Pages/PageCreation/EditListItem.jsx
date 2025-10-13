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
  console.log(open)

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
          {locale === 'ar' ? open?.text_ar : open?.text_en}
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
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, text_en: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'النص باللغة الإنجليزية' : 'Text in English'}
            />
            <TextField
              fullWidth
              type='text'
              defaultValue={open?.text_ar}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, text_ar: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'النص باللغة العربية' : 'Text in Arabic'}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.paddingBlock}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, paddingBlock: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'المساحة الداخلية الطويلة' : 'Padding Block'}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.paddingInline}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, paddingInline: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'المساحة  الداخلية العرضية' : 'Padding Inline'}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.borderRadius}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderRadius: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'نصف القطر' : 'Border Radius'}
            />
            <TextField
              fullWidth
              type='number'
              defaultValue={open.borderWidth}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderWidth: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'عرض الحد' : 'Border Width'}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.backgroundColor}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, backgroundColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الخلفية' : 'Background Color'}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.color}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, color: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الخط' : 'Color'}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.borderColor}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الحد' : 'Border Color'}
            />

            <TextField
              fullWidth
              type='number'
              defaultValue={open.fontSize}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, fontSize: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'حجم الخط' : 'Font Size'}
            />

            <TextField
              fullWidth
              type='number'
              defaultValue={open.fontWeight}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, fontWeight: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'الوزن الخط' : 'Font Weight'}
            />
            <TextField
              fullWidth
              type='text'
              value={open.borderStyle}
              onChange={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, borderStyle: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'نوع الخط' : 'Font Family'}
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
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverBackgroundColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الخلفية عند التحديد' : 'hover BackgroundColor'}
            />

            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverColor}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverColor: color.hex }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الخط عند التحديد' : 'hover Color'}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverBorderColor}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverBorderColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الحد عند التحديد' : 'hover Border Color'}
            />
            <TextField
              fullWidth
              type='color'
              defaultValue={open.hoverBorderColor}
              onBlur={e => {
                console.log(e.target.value)

                const newDataView = dataView.map(item => {
                  if (item.id === open.id) {
                    return { ...item, hoverBorderColor: e.target.value }
                  }

                  return item
                })
                setDataView(newDataView)
              }}
              variant='filled'
              label={locale === 'ar' ? 'لون الحد عند التحديد' : 'hover Border Color'}
            />
          </div>
        </Box>
      )}
    </Drawer>
  )
}

export default EditListItem
