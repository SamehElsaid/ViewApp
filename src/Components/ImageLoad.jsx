/* eslint-disable jsx-a11y/alt-text */
import { Icon } from '@iconify/react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Skeleton } from '@mui/material'
import { Box, styled } from '@mui/system'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { LazyImage } from 'react-lazy-images'

const CustomCloseButton = styled(IconButton)(() => ({
  top: 20,
  right: 20,
  color: 'white',
  position: 'absolute',
  boxShadow: '20px',
  borderRadius: '50%',
  backgroundColor: `#e91e2f !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(2px, -2px)'
  }
}))
function ImageLoad({ alt, src, className, stop, loading, defaultImg, style }) {
  const [open, setOpen] = useState(false)
  const { messages } = useIntl()
  const [error, setError] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Dialog
        open={Boolean(open)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          handleClose()
        }}
      >
        <DialogContent>
          <form noValidate autoComplete='off' className=''>
            <DialogTitle
              component='div'
              sx={{
                textAlign: 'center',
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            ></DialogTitle>
            <DialogContent>
              <Grid sx={{ mb: 8 }}>
                <CustomCloseButton
                  onClick={() => {
                    handleClose()
                  }}
                >
                  <Icon icon='tabler:x' fontSize='1.25rem' />
                </CustomCloseButton>
              </Grid>

              <Box className='flex flex-col items-center'>
                <img src={src} alt={alt} style={{ width: '100%' }} />
              </Box>
            </DialogContent>
            <DialogActions className='absolute right-0 bottom-0 left-0 z-10'>
              <Button
                variant='tonal'
                color='secondary'
                onClick={() => {
                  handleClose()
                }}
              >
                {messages.cancel}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <LazyImage
          src={src}
          alt={alt}
          onClick={() => {
            if (!stop) {
              setOpen(true)
            }
          }}
          className={`relative ${className}`}
          debounceDurationMs={800}
          placeholder={({ imageProps, ref }) => (
            <img
              {...imageProps}
              src={loading}
              ref={ref}
              style={{ width: '100%', cursor: 'pointer', filter: 'blur(10px)', ...style }}
            />
          )}
          actual={({ imageProps }) => (
            <img
              {...imageProps}
              src={error ? defaultImg : imageProps.src}
              onError={() => setError(true)}
              style={{ width: '100%', cursor: 'pointer', ...style }}
            />
          )}
        />
      ) : (
        <LazyImage
          src={src}
          alt={alt}
          onClick={() => {
            if (!stop) {
              setOpen(true)
            }
          }}
          className={`relative ${className}`}
          debounceDurationMs={800}
          placeholder={({ imageProps, ref }) => (
            <div ref={ref} className={`overflow-hidden relative ${className}`}>
              <div className='absolute inset-0 z-30 bgControl'>
                <Skeleton variant='rounded' className='' width={'100%'} height={'100%'} />
              </div>
              <img {...imageProps} style={{ width: '100%', opacity: 0, ...style }} />
            </div>
          )}
          actual={({ imageProps }) => <img {...imageProps} style={{ width: '100%', cursor: 'pointer', ...style }} />}
        />
      )}
    </>
  )
}

export default ImageLoad
