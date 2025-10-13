import Collapse from '@kunukn/react-collapse'
import { Button, Icon, InputAdornment, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'react-toastify'
import { getData } from 'src/Components/_Shared'
import { axiosPost } from 'src/Components/axiosCall'
import CloseNav from './CloseNav'
import { useIntl } from 'react-intl'

export default function UpdateImage({ data, onChange, locale, type, buttonRef }) {
  const getApiData = useSelector(rx => rx.api.data)
  const { messages } = useIntl()

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (!file) return

    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg']
    const allowedVideoTypes = ['video/mp4', 'video/webm']

    const isValidFile = type === 'video' ? allowedVideoTypes.includes(file.type) : allowedImageTypes.includes(file.type)

    if (!isValidFile) {
      toast.error(
        type === 'video' ? messages.useUploadImage.videoFormatError : messages.useUploadImage.imageFormatError
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
            onChange({ ...data, video: res.filePath.data })
          } else {
            onChange({ ...data, image: res.filePath.data })
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
            accept={type !== 'video' ? 'image/png,image/jpeg,image/jpg' : 'video/mp4,video/webm'}
            hidden
            name='json'
            onChange={handleFileUpload}
          />
          {type !== 'video' ? messages.useUploadImage.uploadImage : messages.useUploadImage.uploadVideo}
        </Button>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(type !== 'video' && data.image)}>
        <div className='flex gap-2 justify-between items-center p-2 mb-3 rounded-md border border-dashed border-main-color'>
          <p className='w-[calc(100%-30px)]'>{data.image}</p>
          <button
            className='w-[30px] h-[30px] flex items-center justify-center bg-red-500 text-white rounded-full'
            onClick={() => onChange({ ...data, image: '' })}
          >
            x
          </button>
        </div>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(type === 'video' && data.video)}>
        <div className='flex gap-2 justify-between items-center p-2 mb-3 rounded-md border border-dashed border-main-color'>
          <p className='w-[calc(100%-30px)]'>{data.video}</p>
          <button
            className='w-[30px] h-[30px] flex items-center justify-center bg-red-500 text-white rounded-full'
            onClick={() => onChange({ ...data, video: '' })}
          >
            x
          </button>
        </div>
      </Collapse>
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
    </div>
  )
}
