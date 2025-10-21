import React, { useEffect, useState } from 'react'
import { TextField, InputAdornment, MenuItem, Button, Select } from '@mui/material'
import { useSelector } from 'react-redux'
import Collapse from '@kunukn/react-collapse'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CloseNav from './CloseNav'
import { useIntl } from 'react-intl'

export default function UpdateRichText({ data, onChange, locale, type, buttonRef }) {
  const [obj, setObj] = useState(false)
  const getApiData = useSelector(rx => rx.api.data)
  const { messages } = useIntl()
  
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
      <CloseNav
        text={type === 'progressBar' ? messages.dialogs.progressBar : messages.dialogs.text}
        buttonRef={buttonRef}
      />

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
        </div>
      </Collapse>

      <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
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
        {renderTextField(obj ? messages.dialogs.keyInAr : messages.dialogs.titleAr, 'content_ar', 'text')}
        {renderTextField(obj ? messages.dialogs.keyInEn : messages.dialogs.titleEn, 'content_en', 'text')}
        {type === 'progressBar' && (
          <>
            {renderTextField(
              obj
                ? messages.dialogs.progressWidthPercentageKey
                : messages.dialogs.progressWidthPercentage,
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
        {renderSelect(messages.dialogs.textAlign, 'titleTextAlign', [
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
        {renderTextField(messages.dialogs.marginBottom, 'marginBottom', 'number')}
      </div>

    </div>
  )
}
