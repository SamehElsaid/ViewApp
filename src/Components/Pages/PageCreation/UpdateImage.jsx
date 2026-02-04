import Collapse from '@kunukn/react-collapse'
import { Button, Icon, InputAdornment, MenuItem, Select, TextField, FormControlLabel, Checkbox } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'react-toastify'
import { getData } from 'src/Components/_Shared'
import { axiosPost } from 'src/Components/axiosCall'
import CloseNav from './CloseNav'
import { useIntl } from 'react-intl'

// Define accepted image file types
const imageFileTypes = [
  { value: 'png', label: 'PNG', mimeType: 'image/png' },
  { value: 'jpg', label: 'JPG', mimeType: 'image/jpeg' },
  { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg' },
  { value: 'webp', label: 'WEBP', mimeType: 'image/webp' },
  { value: 'gif', label: 'GIF', mimeType: 'image/gif' },
  { value: 'svg', label: 'SVG', mimeType: 'image/svg+xml' }
]

export default function UpdateImage({ data, onChange, locale, type, buttonRef }) {
  const getApiData = useSelector(rx => rx.api.data)
  const { messages } = useIntl()

  // Initialize selected image types from data or default to all types
  const [selectedImageTypes, setSelectedImageTypes] = useState(
    data?.acceptedImageTypes || imageFileTypes.map(img => img.value)
  )

  // Update selectedImageTypes when data.acceptedImageTypes changes
  useEffect(() => {
    if (data?.acceptedImageTypes) {
      setSelectedImageTypes(data.acceptedImageTypes)
    } else if (!data?.acceptedImageTypes && selectedImageTypes.length === 0) {
      // If no accepted types are set, default to all types
      setSelectedImageTypes(imageFileTypes.map(img => img.value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.acceptedImageTypes])

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (!file) return

    const allowedImageTypes = imageFileTypes
      .filter(imgType => selectedImageTypes.includes(imgType.value))
      .map(imgType => imgType.mimeType)
    const allowedVideoTypes = ['video/mp4', 'video/webm']

    const isValidFile = type === 'video' ? allowedVideoTypes.includes(file.type) : allowedImageTypes.includes(file.type)

    if (!isValidFile) {
      toast.error(
        type === 'video'
          ? messages.useUploadImage.videoFormatError
          : messages.useUploadImage.imageFormatError.replace('{allowedImageTypes}', allowedImageTypes.join(', '))
      )
      event.target.value = ''

      return
    }

    const loading = toast.loading(messages.useUploadImage.uploading)

    axiosPost(
      'file/upload',
      'en',
      {
        file: file
      },
      true
    )
      .then(res => {
        if (res.status) {
          if (type === 'video') {

            onChange({ ...data, video: res.filePath })
          } else {
            onChange({ ...data, image: res.filePath })
          }
        }
      })
      .finally(() => {
        toast.dismiss(loading)
      })

    event.target.value = ''
  }

  const [obj, setObj] = useState(false)

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
      <CloseNav
        text={type === 'video' ? messages.useUploadImage.video : messages.useUploadImage.image}
        buttonRef={buttonRef}
      />

      <TextField
        select
        fullWidth
        className='!mb-4'
        value={data.api_url || ''}
        onChange={e => onChange({ ...data, api_url: e.target.value })}
        label={messages.useUploadImage.api}
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
            {messages.useUploadImage.clearData}
          </Button>
        </div>
      )}
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
        <div className='p-2 my-4 rounded border border-dashed border-main-color'>
          <h2 className='mb-4 text-2xl text-main-color'>{messages.useUploadImage.viewObject}</h2>
          <SyntaxHighlighter language='json' style={docco}>
            {JSON.stringify(obj, null, 2)}
          </SyntaxHighlighter>
          <div className='mt-4'>
            <TextField
              fullWidth
              value={data.key || ''}
              variant='filled'
              label={messages.useUploadImage.contentKey}
              onChange={e => {
                const image = getData(obj, e.target.value, '')
                if (type === 'video') {
                  onChange({ ...data, video: image, key: e.target.value })
                } else {
                  onChange({ ...data, image: image, key: e.target.value })
                }
              }}
            />
          </div>
        </div>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(!obj)}>
        <Button
          variant='outlined'
          className='!mb-4'
          component='label'
          fullWidth
          startIcon={<Icon icon='ph:upload-fill' fontSize='2.25rem' className='!text-2xl ' />}
        >

          <input
            type='file'
            accept={
              type !== 'video'
                ? imageFileTypes
                    .filter(imgType => selectedImageTypes.includes(imgType.value))
                    .map(imgType => imgType.mimeType)
                    .join(',') || 'image/png,image/jpeg,image/jpg,image/webp'
                : 'video/mp4,video/webm'
            }
            hidden
            name='json'
            onChange={handleFileUpload}
          />
          {type !== 'video' ? messages.useUploadImage.uploadImage : messages.useUploadImage.uploadVideo}
        </Button>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(type !== 'video' && data.image)}>
        <div className='flex gap-2 justify-between items-center p-2 mb-3 rounded-md border border-dashed border-main-color'>
          <div className='flex items-center gap-2'>
            <Icon icon='tabler:photo-check' fontSize='1.5rem' className='text-main-color' />
            <span className='text-sm text-gray-600'>
              {locale === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'}
            </span>
          </div>
          <button
            className='w-[30px] h-[30px] flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600'
            onClick={() => onChange({ ...data, image: '' })}
            title={locale === 'ar' ? 'حذف الصورة' : 'Remove image'}
          >
            x
          </button>
        </div>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(type === 'video' && data.video)}>
        <div className='flex gap-2 justify-between items-center p-2 mb-3 rounded-md border border-dashed border-main-color'>
          <div className='flex items-center gap-2'>
            <Icon icon='tabler:video-check' fontSize='1.5rem' className='text-main-color' />
            <span className='text-sm text-gray-600'>
              {locale === 'ar' ? 'تم رفع الفيديو بنجاح' : 'Video uploaded successfully'}
            </span>
          </div>
          <button
            className='w-[30px] h-[30px] flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600'
            onClick={() => onChange({ ...data, video: '' })}
            title={locale === 'ar' ? 'حذف الفيديو' : 'Remove video'}
          >
            x
          </button>
        </div>
      </Collapse>

      {/* Image Configuration Section */}
      {type !== 'video' && (
        <div className='mt-4 p-3 rounded border border-dashed border-main-color'>
          <h3 className='text-lg font-bold text-main-color mb-3'>
            {locale === 'ar' ? 'خصائص الصورة المقبولة' : 'Accepted Image Properties'}
          </h3>

          {/* Max Image Size */}
          <TextField
            fullWidth
            type='number'
            value={data.maxImageSize || ''}
            onChange={e => onChange({ ...data, maxImageSize: e.target.value ? Number(e.target.value) : undefined })}
            variant='filled'
            label={locale === 'ar' ? 'الحد الأقصى لحجم الصورة (KB)' : 'Max Image Size (KB)'}
            InputProps={{
              endAdornment: <InputAdornment position='end'>KB</InputAdornment>
            }}
            className='mb-3'
          />

          {/* Accepted Image Types */}
          <div className='mb-2'>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              {locale === 'ar' ? 'أنواع الصور المقبولة' : 'Accepted Image Types'}
            </label>
            <div className='flex flex-wrap gap-2'>
              {imageFileTypes.map(imgType => (
                <FormControlLabel
                  key={imgType.value}
                  control={
                    <Checkbox
                      checked={selectedImageTypes.includes(imgType.value)}
                      onChange={e => {
                        const newTypes = e.target.checked
                          ? [...selectedImageTypes, imgType.value]
                          : selectedImageTypes.filter(t => t !== imgType.value)
                        setSelectedImageTypes(newTypes)
                        onChange({ ...data, acceptedImageTypes: newTypes })
                      }}
                    />
                  }
                  label={imgType.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <TextField
        fullWidth
        type='number'
        value={data.imageWidth}
        onChange={e => onChange({ ...data, imageWidth: e.target.value })}
        variant='filled'
        label={messages.useUploadImage.width}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.imageWidthUnit || 'px'}
                onChange={e => onChange({ ...data, imageWidthUnit: e.target.value })}
                displayEmpty
                variant='standard'
              >
                <MenuItem value='px'>PX</MenuItem>
                <MenuItem value='vw'>VW</MenuItem>
              </Select>
              {/* <FormControl>
              </FormControl> */}
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        type='number'
        value={data.imageHeight}
        onChange={e => onChange({ ...data, imageHeight: e.target.value })}
        variant='filled'
        label={messages.useUploadImage.height}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.imageHeightUnit || 'px'} // الافتراضي px
                onChange={e => onChange({ ...data, imageHeightUnit: e.target.value })}
                displayEmpty
                variant='standard'
              >
                <MenuItem value='px'>PX</MenuItem>
                <MenuItem value='vh'>VH</MenuItem>
              </Select>
            </InputAdornment>
          )
        }}
      />

      <TextField
        select
        fullWidth
        value={data.objectFit || 'cover'}
        variant='filled'
        label={messages.useUploadImage.objectFit}
        onChange={e => onChange({ ...data, objectFit: e.target.value })}
      >
        <MenuItem value='cover'>{messages.useUploadImage.cover}</MenuItem>
        <MenuItem value='contain'>{messages.useUploadImage.contain}</MenuItem>
        <MenuItem value='fill'>{messages.useUploadImage.fill}</MenuItem>
        <MenuItem value='none'>{messages.useUploadImage.none}</MenuItem>
        <MenuItem value='scale-down'>{messages.useUploadImage.scaleDown}</MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        value={data.textAlign || 'center'}
        variant='filled'
        label={messages.useUploadImage.textAlign}
        onChange={e => onChange({ ...data, textAlign: e.target.value })}
      >
        <MenuItem value='left'>{messages.dialogs.start}</MenuItem>
        <MenuItem value='center'>{messages.dialogs.center}</MenuItem>
        <MenuItem value='right'>{messages.dialogs.end}</MenuItem>
      </TextField>

      <div className='mt-4 p-2 rounded border border-dashed border-main-color'>
        <h3 className='text-lg mb-2'>{messages.dialogs.visibilityCondition}</h3>
        <TextField
          select
          fullWidth
          className='!mb-3'
          value={data?.visibilityCondition?.enabled ? 'on' : 'off'}
          label={messages.dialogs.conditionEnabled}
          variant='filled'
          onChange={e =>
            onChange({
              ...data,
              visibilityCondition: {
                ...(data.visibilityCondition || {}),
                enabled: e.target.value === 'on'
              }
            })
          }
        >
          <MenuItem value='off'>{messages.dialogs.off}</MenuItem>
          <MenuItem value='on'>{messages.dialogs.on}</MenuItem>
        </TextField>

        <Collapse isOpen={Boolean(data?.visibilityCondition?.enabled)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            <TextField
              select
              fullWidth
              value={data?.visibilityCondition?.source || 'api'}
              label={messages.dialogs.source}
              variant='filled'
              onChange={e =>
                onChange({
                  ...data,
                  visibilityCondition: { ...(data.visibilityCondition || {}), source: e.target.value }
                })
              }
            >
              <MenuItem value='api'>{messages.dialogs.apiData}</MenuItem>
              <MenuItem value='query'>{messages.dialogs.urlQueryParam}</MenuItem>
            </TextField>

            {(!data?.visibilityCondition?.source || data?.visibilityCondition?.source === 'api') && (
              <TextField
                select
                fullWidth
                value={data?.visibilityCondition?.api_url || data.api_url || ''}
                onChange={e =>
                  onChange({
                    ...data,
                    visibilityCondition: { ...(data.visibilityCondition || {}), api_url: e.target.value }
                  })
                }
                label={messages.dialogs.apiLink}
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
            )}

            <TextField
              fullWidth
              value={data?.visibilityCondition?.key || ''}
              onChange={e =>
                onChange({
                  ...data,
                  visibilityCondition: { ...(data.visibilityCondition || {}), key: e.target.value }
                })
              }
              label={messages.dialogs.keyParam}
              variant='filled'
            />

            <TextField
              select
              fullWidth
              value={data?.visibilityCondition?.operator || '>'}
              onChange={e =>
                onChange({
                  ...data,
                  visibilityCondition: { ...(data.visibilityCondition || {}), operator: e.target.value }
                })
              }
              label={messages.dialogs.operator}
              variant='filled'
            >
              <MenuItem value='>'>{'>'}</MenuItem>
              <MenuItem value='<'>{'<'}</MenuItem>
              <MenuItem value='>='>{'>='}</MenuItem>
              <MenuItem value='<='>{'<='}</MenuItem>
              <MenuItem value='=='>{'=='}</MenuItem>
              <MenuItem value='!='>{'!='}</MenuItem>
              <MenuItem value='contains'>{messages.dialogs.contains}</MenuItem>
            </TextField>

            <TextField
              fullWidth
              value={data?.visibilityCondition?.value ?? ''}
              onChange={e =>
                onChange({
                  ...data,
                  visibilityCondition: { ...(data.visibilityCondition || {}), value: e.target.value }
                })
              }
              label={messages.dialogs.compareTo}
              variant='filled'
            />

            <TextField
              select
              fullWidth
              value={data?.visibilityCondition?.behavior || 'showWhenTrue'}
              onChange={e =>
                onChange({
                  ...data,
                  visibilityCondition: { ...(data.visibilityCondition || {}), behavior: e.target.value }
                })
              }
                label={messages.dialogs.behavior}
              variant='filled'
            >
              <MenuItem value='showWhenTrue'>{messages.dialogs.showWhenConditionIsTrue}</MenuItem>
              <MenuItem value='hideWhenTrue'>{messages.dialogs.hideWhenConditionIsTrue}</MenuItem>
            </TextField>
          </div>
        </Collapse>
      </div>
    </div>
  )
}
