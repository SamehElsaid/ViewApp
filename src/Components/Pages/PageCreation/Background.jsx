import { Icon } from '@iconify/react'
import Collapse from '@kunukn/react-collapse'
import { Button, FormControlLabel, InputAdornment, MenuItem, Radio, RadioGroup, Select, TextField, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getData } from 'src/Components/_Shared'
import CloseNav from './CloseNav'
import { axiosPost, axiosDelete } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'

export default function Background({ data, onChange, buttonRef }) {
  const [selectedOption, setSelectedOption] = useState(data?.backgroundImage ? 'image' : 'color')
  const { locale, messages } = useIntl()
  const getApiData = useSelector(rx => rx.api.data)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleFileUpload = event => {
      const file = event.target.files[0]
      if (!file) return

      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!allowedImageTypes.includes(file.type)) {
        toast.error((messages.useUploadImage && messages.useUploadImage.imageFormatError) || 'Unsupported image format. Please upload png, jpg, or jpeg.')
        event.target.value = ''
        
        return
      }

      // Remove all spaces from filename and replace with underscores
      const fileName = file.name.replace(/\s+/g, '_')
      const loading = toast.loading(messages.dialogs.uploading)

      // Create FormData to properly handle filenames with spaces
      const formData = new FormData()
      formData.append('file', file, fileName)

      axiosPost(
        'file/upload',
        'en',
        formData,
        true
      )
        .then(res => {
          if (res.status) {
            onChange({ ...data, backgroundImage: res.filePath })
            toast.success(messages.dialogs.uploadSuccess || 'Uploaded successfully')
          } else {
            toast.error(messages.dialogs.uploadError || 'Upload failed')
          }
        })
        .catch(() => {
          toast.error(messages.dialogs.uploadError || 'Upload failed')
        })
        .finally(() => {
          toast.dismiss(loading)
          event.target.value = ''
        })
   }

  const resolveImageUrl = path => {
    if (!path) return ''
    
    return process.env.API_URL + "/file/download/" + path
  }

  const handleViewImage = () => {
    const url = resolveImageUrl(data?.backgroundImage)
    if (url) {
      setPreviewUrl(url)
      setPreviewOpen(true)
    }
  }

  const handleDownloadImage = () => {
    const url = resolveImageUrl(data?.backgroundImage)
    console.log(url)
    if (!url) return
    const link = document.createElement('a')
    link.href = url
    link.download = 'background-image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearImage = async () => {
    const current = data?.backgroundImage || ''
    onChange({ ...data, backgroundImage: '', backgroundKey: '', api_url: '' })
    try {
      if (current.includes('/Uploads/')) {
        const file = current.replace('/Uploads/', '')
        await axiosDelete(`file/delete/${file}`, 'en')
      }
    } catch (_) {
      // ignore delete failure; image reference already cleared
    }
    toast.success(messages.dialogs.clearData || 'Cleared')
  }

  const [obj, setObj] = useState(false)

  useEffect(() => {
    // When switching to color mode, clear any existing background image and related API bindings
    if (selectedOption === 'color') {
      if (data?.backgroundImage || data?.api_url || data?.backgroundKey) {
        onChange({ ...data, backgroundImage: '', api_url: '', backgroundKey: '' })
      }
    } else if (selectedOption === 'image') {
      // When switching to image mode, clear solid color so image fully replaces it
      if (data?.backgroundColor) {
        onChange({ ...data, backgroundColor: 'transparent' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption])

  useEffect(() => {
    if (data.api_url) {
      const items = getApiData.find(item => item.link === data.api_url)?.data
      onChange({ ...data, items: items })
      if (items) {
        setObj(items)
      }
    } else {
      setObj(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.api_url])

  return (
    <div>
      <CloseNav text={messages.dialogs.background} buttonRef={buttonRef} />

      <TextField
        fullWidth
        type='number'
        value={data.backgroundWidth}
        onChange={e => onChange({ ...data, backgroundWidth: e.target.value })}
        variant='filled'
        label={messages.dialogs.width}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.backgroundWidthUnit || 'px'} // الافتراضي px
                onChange={e => onChange({ ...data, backgroundWidthUnit: e.target.value })}
                displayEmpty
                variant='standard'
              >
                <MenuItem value='px'>PX</MenuItem>
                <MenuItem value='vw'>VW</MenuItem>
                <MenuItem value='%'>%</MenuItem>
              </Select>
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        type='number'
        value={data.backgroundHeight}
        onChange={e => onChange({ ...data, backgroundHeight: e.target.value })}
        variant='filled'
        label={messages.dialogs.height}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.backgroundHeightUnit || 'px'} // الافتراضي px
                onChange={e => onChange({ ...data, backgroundHeightUnit: e.target.value })}
                displayEmpty
                variant='standard'
              >
                <MenuItem value='px'>PX</MenuItem>
                <MenuItem value='vh'>VH</MenuItem>
                <MenuItem value='%'>%</MenuItem>
              </Select>
            </InputAdornment>
          )
        }}
      />
      <TextField
        select
        fullWidth
        value={data.backgroundAlignment || 'center'}
        variant='filled'
        label={messages.dialogs.alignment}
        onChange={e => onChange({ ...data, backgroundAlignment: e.target.value })}
      >
        <MenuItem value='center'>{messages.dialogs.center}</MenuItem>
        <MenuItem value='start'>{messages.dialogs.start}</MenuItem>
        <MenuItem value='end'>{messages.dialogs.end}</MenuItem>
      </TextField>
      <RadioGroup value={selectedOption} onChange={e => setSelectedOption(e.target.value)} row>
        <FormControlLabel value='color' control={<Radio />} label={messages.dialogs.backgroundColor} />
        <FormControlLabel value='image' control={<Radio />} label={messages.dialogs.image} />
      </RadioGroup>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selectedOption === 'color')}>
        <SketchPicker
          color={data.backgroundColor || '#ffffff'}
          onChange={color => onChange({ ...data, backgroundColor: color.hex })}
        />
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selectedOption !== 'color')}>
        <TextField
          select
          fullWidth
          className='!mb-4'
          value={data.api_url || ''}
          onChange={e => onChange({ ...data, api_url: e.target.value })}
          label={messages.dialogs.getFromApi}
          variant='filled'
        >
          {getApiData.map(
            ({ link, data }, index) =>
              !Array.isArray(data) && (
                <MenuItem key={link + index} value={link}>
                  {link}
                </MenuItem>
              )
          )}
        </TextField>
        {data.api_url && (
          <div className='flex justify-center'>
            <Button
              className='!my-4'
              variant='contained'
              color='error'
              onClick={() => {
                setObj(false)
                onChange({ ...data, items: [], api_url: '' })
              }}
            >
              {messages.dialogs.clearData}
            </Button>
          </div>
        )}
        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
          <div className='p-2 my-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages.dialogs.viewObject}</h2>
            <SyntaxHighlighter language='json' style={docco}>
              {JSON.stringify(obj, null, 2)}
            </SyntaxHighlighter>
            <div className='mt-4'>
              <TextField
                fullWidth
                value={data.backgroundKey || ''}
                variant='filled'
                label={messages.dialogs.imageKey}
                onChange={e => {
                  const image = getData(obj, e.target.value, '')

                  onChange({ ...data, backgroundImage: image, backgroundKey: e.target.value })
                }}
              />
            </div>
          </div>
        </Collapse>
      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth='md'>
        <DialogTitle>{messages.dialogs.view || 'View'}</DialogTitle>
        <DialogContent>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt='background-preview'
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(!obj)}>
          <Button
            variant='outlined'
            className='!mb-4'
            component='label'
            fullWidth
            startIcon={<Icon icon='ph:upload-fill' fontSize='2.25rem' className='!text-2xl ' />}
          >
            <input type='file' accept={'image/png,image/jpeg,image/jpg,image/webp'} hidden name='json' onChange={handleFileUpload} />
            {messages.dialogs.uploadImage}
          </Button>
          {Boolean(data?.backgroundImage) && (
            <div className='p-3 mt-2 rounded border border-dashed border-main-color flex flex-col gap-3'>
              <div className='flex items-center gap-3'>
                <img
                  src={resolveImageUrl(data.backgroundImage)}
                  alt='background'
                  style={{ width: 96, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                />
                <div className='flex gap-2 flex-wrap'>
                  <Button variant='contained' color='primary' onClick={handleViewImage}>
                    {messages.dialogs.view || 'View'}
                  </Button>
                  <Button variant='outlined' color='primary' onClick={handleDownloadImage}>
                    {messages.dialogs.download || 'Download'}
                  </Button>
                  <Button variant='contained' color='error' onClick={() => setConfirmOpen(true)}>
                    {messages.dialogs.delete || 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Collapse>
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{messages.dialogs.delete || 'Delete'}</DialogTitle>
        <DialogContent>
          {(messages.dialogs.deleteConfirm || 'Are you sure you want to delete this image?')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color='secondary' variant='contained'>
            {messages.dialogs.cancel}
          </Button>
          <Button
            onClick={async () => {
              setConfirmOpen(false)
              await handleClearImage()
            }}
            color='error'
            variant='contained'
          >
            {messages.dialogs.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selectedOption !== 'color')}>
        <TextField
          select
          fullWidth
          value={data.backgroundSize || 'cover'}
          variant='filled'
          label={messages.dialogs.backgroundSize}
          onChange={e => onChange({ ...data, backgroundSize: e.target.value })}
        >
          <MenuItem value='cover'>{messages.dialogs.cover}</MenuItem>
          <MenuItem value='contain'>{messages.dialogs.contain}</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          value={data.backgroundRepeat || 'no-repeat'}
          variant='filled'
          label={messages.dialogs.backgroundRepeat}
          onChange={e => onChange({ ...data, backgroundRepeat: e.target.value })}
        >
          <MenuItem value='no-repeat'>{messages.dialogs.noRepeat}</MenuItem>
          <MenuItem value='repeat'>{messages.dialogs.repeat}</MenuItem>
          <MenuItem value='repeat-x'>{messages.dialogs.repeatX}</MenuItem>
          <MenuItem value='repeat-y'>{messages.dialogs.repeatY}</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          value={data.backgroundPosition || 'center'}
          variant='filled'
          label={messages.dialogs.backgroundPosition}
          onChange={e => onChange({ ...data, backgroundPosition: e.target.value })}
        >
          <MenuItem value='center'>{messages.dialogs.center}</MenuItem>
          <MenuItem value='top'>{messages.dialogs.top}</MenuItem>
          <MenuItem value='bottom'>{messages.dialogs.bottom}</MenuItem>
          <MenuItem value='left'>{messages.dialogs.left}</MenuItem>
          <MenuItem value='right'>{messages.dialogs.right}</MenuItem>
          <MenuItem value='left top'>{messages.dialogs.topLeft}</MenuItem>
          <MenuItem value='right top'>{messages.dialogs.topRight}</MenuItem>
          <MenuItem value='left bottom'>{messages.dialogs.bottomLeft}</MenuItem>
          <MenuItem value='right bottom'>{messages.dialogs.bottomRight}</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          value={data.backgroundAttachment || 'scroll'}
          variant='filled'
          label={messages.dialogs.backgroundAttachment}
          onChange={e => onChange({ ...data, backgroundAttachment: e.target.value })}
        >
          <MenuItem value='scroll'>{messages.dialogs.scroll}</MenuItem>
          <MenuItem value='fixed'>{messages.dialogs.fixed}</MenuItem>
          <MenuItem value='local'>{messages.dialogs.local}</MenuItem>
        </TextField>
      </Collapse>
    </div>
  )
}
