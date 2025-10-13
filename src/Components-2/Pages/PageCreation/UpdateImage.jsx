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

export default function UpdateImage({ data, onChange, locale, type, buttonRef }) {
  const getApiData = useSelector(rx => rx.api.data)

  const handleFileUpload = event => {
    const file = event.target.files[0]
    const loading = toast.loading(locale === 'ar' ? 'جاري الرفع' : 'Uploading...')
    if (file) {
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
      <CloseNav text={type === 'video' ? locale === 'ar' ? 'اختيار الفيديو' : 'Video' : locale === 'ar' ? 'اختيار الصورة' : 'Image'} buttonRef={buttonRef} />

      <TextField
        select
        fullWidth
        className='!mb-4'
        value={data.api_url || ''}
        onChange={e => onChange({ ...data, api_url: e.target.value })}
        label={locale === 'ar' ? 'جلب البيانات من الAPI' : 'Get From API'}
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
            {locale === 'ar' ? 'تفريغ البيانات' : 'Clear Data'}
          </Button>
        </div>
      )}
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
        <div className='p-2 my-4 rounded border border-dashed border-main-color'>
          <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'عرض البيانات' : 'View Object'}</h2>
          <SyntaxHighlighter language='json' style={docco}>
            {JSON.stringify(obj, null, 2)}
          </SyntaxHighlighter>
          <div className='mt-4'>
            <TextField
              fullWidth
              value={data.key || ''}
              variant='filled'
              label={locale === 'ar' ? 'مفتاح المحتوى' : 'Content Key'}
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
          <input type='file' accept={'image/*'} hidden name='json' onChange={handleFileUpload} />
          {type !== 'video' ? locale === 'ar' ? 'رفع صورة' : 'Upload Image' : locale === 'ar' ? 'رفع فيديو' : 'Upload Video'}
        </Button>
      </Collapse>
      <TextField
        fullWidth
        type='number'
        value={data.imageWidth}
        onChange={e => onChange({ ...data, imageWidth: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'العرض' : 'Width'}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.imageWidthUnit || 'px'} // الافتراضي px
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
        label={locale === 'ar' ? 'الطول' : 'Height'}
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
        label={locale === 'ar' ? 'تطابق الصورة' : 'Object Fit'}
        onChange={e => onChange({ ...data, objectFit: e.target.value })}
      >
        <MenuItem value='cover'>Cover</MenuItem>
        <MenuItem value='contain'>Contain</MenuItem>
        <MenuItem value='fill'>Fill</MenuItem>
        <MenuItem value='none'>None</MenuItem>
        <MenuItem value='scale-down'>Scale Down</MenuItem>
      </TextField>
    </div>
  )
}
