import { Icon } from '@iconify/react'
import Collapse from '@kunukn/react-collapse'
import {
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getData } from 'src/Components/_Shared'
import CloseNav from './CloseNav'
import { axiosPost } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'

export default function Background({ data, onChange, buttonRef }) {
  const [selectedOption, setSelectedOption] = useState(data?.backgroundImage ? 'image' : 'color')
  const { locale } = useIntl()
  const getApiData = useSelector(rx => rx.api.data)

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (file) {
      const loading = toast.loading(locale === 'ar' ? 'جاري التحميل...' : 'Uploading...')
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
              onChange({ ...data, backgroundImage: res.filePath.data })
            }
          })
          .finally(() => {
            toast.dismiss(loading)
          })
        event.target.value = ''
      }
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
      <CloseNav text={locale === 'ar' ? 'اختيار الخلفية' : 'Background'} buttonRef={buttonRef} />

      <TextField
        fullWidth
        type='number'
        value={data.backgroundWidth}
        onChange={e => onChange({ ...data, backgroundWidth: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'العرض' : 'Width'}
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
        label={locale === 'ar' ? 'الطول' : 'Height'}
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
        label={locale === 'ar' ? 'محاذاة النص' : 'Alignment'}
        onChange={e => onChange({ ...data, backgroundAlignment: e.target.value })}
      >
        <MenuItem value='center'>Center</MenuItem>
        <MenuItem value='start'>Start</MenuItem>
        <MenuItem value='end'>End</MenuItem>
      </TextField>
      <RadioGroup value={selectedOption} onChange={e => setSelectedOption(e.target.value)} row>
        <FormControlLabel
          value='color'
          control={<Radio />}
          label={locale === 'ar' ? 'لون الخلفية' : 'Background Color'}
        />
        <FormControlLabel value='image' control={<Radio />} label={locale === 'ar' ? 'صورة' : 'Image'} />
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
                value={data.backgroundKey || ''}
                variant='filled'
                label={locale === 'ar' ? 'مفتاح الصورة' : 'Image Key'}
                onChange={e => {
                  const image = getData(obj, e.target.value, '')

                  onChange({ ...data, backgroundImage: image, backgroundKey: e.target.value })
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
            {locale === 'ar' ? 'رفع صورة' : 'Upload Image'}
          </Button>
        </Collapse>
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selectedOption !== 'color')}>
        <TextField
          select
          fullWidth
          value={data.backgroundSize || 'cover'}
          variant='filled'
          label={locale === 'ar' ? 'حجم الصورة' : 'Background Size'}
          onChange={e => onChange({ ...data, backgroundSize: e.target.value })}
        >
          <MenuItem value='cover'>Cover</MenuItem>
          <MenuItem value='contain'>Contain</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          value={data.backgroundRepeat || 'no-repeat'}
          variant='filled'
          label={locale === 'ar' ? 'تكرار الصورة' : 'Background Repeat'}
          onChange={e => onChange({ ...data, backgroundRepeat: e.target.value })}
        >
          <MenuItem value='no-repeat'>No Repeat</MenuItem>
          <MenuItem value='repeat'>Repeat</MenuItem>
          <MenuItem value='repeat-x'>Repeat X</MenuItem>
          <MenuItem value='repeat-y'>Repeat Y</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          value={data.backgroundPosition || 'center'}
          variant='filled'
          label={locale === 'ar' ? 'موضع الصورة' : 'Background Position'}
          onChange={e => onChange({ ...data, backgroundPosition: e.target.value })}
        >
          <MenuItem value='center'>Center</MenuItem>
          <MenuItem value='top'>Top</MenuItem>
          <MenuItem value='bottom'>Bottom</MenuItem>
          <MenuItem value='left'>Left</MenuItem>
          <MenuItem value='right'>Right</MenuItem>
          <MenuItem value='top left'>Top Left</MenuItem>
          <MenuItem value='top right'>Top Right</MenuItem>
          <MenuItem value='bottom left'>Bottom Left</MenuItem>
          <MenuItem value='bottom right'>Bottom Right</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          value={data.backgroundAttachment || 'scroll'}
          variant='filled'
          label={locale === 'ar' ? 'الصورة المثبتة' : 'Background Attachment'}
          onChange={e => onChange({ ...data, backgroundAttachment: e.target.value })}
        >
          <MenuItem value='scroll'>Scroll</MenuItem>
          <MenuItem value='fixed'>Fixed</MenuItem>
          <MenuItem value='local'>Local</MenuItem>
        </TextField>
      </Collapse>
    </div>
  )
}
