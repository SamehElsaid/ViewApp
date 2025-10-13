import React, { useEffect, useState } from 'react'
import { TextField, InputAdornment, MenuItem, Button, Select } from '@mui/material'
import { useSelector } from 'react-redux'
import Collapse from '@kunukn/react-collapse'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CloseNav from './CloseNav'

export default function UpdateRichText({ data, onChange, locale, type, buttonRef }) {
  const [obj, setObj] = useState(false)
  const getApiData = useSelector(rx => rx.api.data)

  const renderTextField = (label, valueKey, inputType = 'text', options = {}) => (
    <TextField
      fullWidth
      type={inputType}
      value={data[valueKey] || ''}
      onChange={e => onChange({ ...data, [valueKey]: e.target.value })}
      label={locale === 'ar' ? options.labelAr || label : label}
      variant='filled'
      {...options}
    />
  )

  const renderSelect = (label, valueKey, optionsList, additionalProps = {}) => (
    <TextField
      select
      fullWidth
      value={data[valueKey] || optionsList[0].value}
      onChange={e => onChange({ ...data, [valueKey]: e.target.value })}
      label={locale === 'ar' ? additionalProps.labelAr || label : label}
      variant='filled'
    >
      {optionsList.map(({ value, label }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  )

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
      <CloseNav text={type === 'progressBar' ? locale === 'ar' ? 'اختيار الشريط التقدم' : 'Progress Bar' : locale === 'ar' ? 'اختيار النص' : 'Text'} buttonRef={buttonRef} />

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
        </div>
      </Collapse>

      <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
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
                  <MenuItem value='%'>%</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />
        {renderTextField(
          obj
            ? locale === 'ar'
              ? 'مفتاح العنوان بالعربية'
              : 'Title ar key'
            : locale === 'ar'
            ? 'العنوان بالعربية'
            : 'Title Ar',
          'content_ar',
          'text'
        )}
        {renderTextField(
          obj
            ? locale === 'ar'
              ? 'مفتاح العنوان بالانجليزية'
              : 'Title en key'
            : locale === 'ar'
            ? 'العنوان بالانجليزية'
            : 'Title En',
          'content_en',
          'text'
        )}
        {type === 'progressBar' && (
          <>
            {renderTextField(
              obj
                ? locale === 'ar'
                  ? 'مفتاح العرض بالنسبة المئوية'
                  : 'progress Width percentage key'
                : locale === 'ar'
                ? 'العرض نسبة مئوية'
                : 'progress Width percentage',
              'progressWidth',
              'number'
            )}
          </>
        )}
        {renderTextField('Color', 'titleColor', 'color')}
        {type === 'progressBar' && <>{renderTextField('Progress Color', 'backgroundColor', 'color')}</>}
        {renderTextField('Font Size', 'fontSize', 'number', {
          InputProps: {
            endAdornment: <InputAdornment position='end'>px</InputAdornment>
          }
        })}
        {renderSelect(
          'Font Weight',
          'fontWeight',
          Array.from({ length: 9 }, (_, i) => ({
            value: `${(i + 1) * 100}`,
            label: `${(i + 1) * 100}`
          }))
        )}
        {renderSelect(locale === 'ar' ? 'محاذاة' : 'Text align', 'titleTextAlign', [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' }
        ])}
        {renderSelect('Font Family', 'fontFamily', [
          { value: 'Arial', label: 'Arial' },
          { value: 'Tahoma', label: 'Tahoma' },
          { value: 'Verdana', label: 'Verdana' },
          { value: 'Times New Roman', label: 'Times New Roman' },
          { value: 'Courier New', label: 'Courier New' }
        ])}
        {renderTextField(locale === 'ar' ? 'المسافة بالأسفل' : 'Margin bottom', 'marginBottom', 'number')}
      </div>
      {/* <h1 className='text-main-color'>{locale === 'ar' ? 'المحتوى بالعربية' : 'Content in Arabic'}</h1>
      <Editor data={data} initialTemplateName={data.content_ar} onChange={onChange} locale={locale} type='content_ar' />
      <h1 className='text-main-color'>{locale === 'ar' ? 'المحتوى بالانجليزية' : 'Content in English'}</h1>
      <Editor data={data} initialTemplateName={data.content_en} onChange={onChange} locale={locale} type='content_en' /> */}
    </div>
  )
}
