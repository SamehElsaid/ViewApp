import React, { useEffect, useState } from 'react'
import { TextField, InputAdornment, MenuItem, Button } from '@mui/material'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'
import { useIntl } from 'react-intl'

export default function OtpControl({ data, onChange, locale, type, buttonRef }) {
  const [obj, setObj] = useState(false)
  const getApiData = useSelector(rx => rx.api.data)
  const { messages } = useIntl()

  const renderTextField = (label, valueKey, inputType = 'text', options = {}) => {
    // Add max validation specifically for the Number of OTP field
    const isOtpNumberField =
      (locale === 'ar' && label === 'عدد الرمز') || (locale !== 'ar' && label === 'Number of OTP')

    const inputProps = isOtpNumberField ? { ...options.inputProps, max: 20 } : options.inputProps

    const handleChange = e => {
      let value = e.target.value
      if (isOtpNumberField && value > 20) {
        value = 20
      }

      onChange({ ...data, [valueKey]: value })
    }

    return (
      <TextField
        fullWidth
        type={inputType}
        value={data[valueKey] || ''}
        onChange={handleChange}
        label={locale === 'ar' ? options.labelAr || label : label}
        variant='filled'
        inputProps={inputProps}
        {...options}
      />
    )
  }

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
      <CloseNav text={messages.dialogs.counterTimer} buttonRef={buttonRef} />
      <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
        {renderTextField(obj ? messages.dialogs.titleAr : messages.dialogs.titleEn, 'content_ar', 'text')}
        {renderTextField(obj ? messages.dialogs.keyInAr : messages.dialogs.keyInEn, 'content_en', 'text')}
        {renderTextField(messages.dialogs.numberOfOtp, 'numberOfOtp', 'number', {
          helperText: messages.dialogs.maximumIs20
        })}
        {renderTextField(messages.dialogs.timerTime, 'timerTime', 'number', {
          InputProps: {
            endAdornment: <InputAdornment position='end'>{messages.dialogs.seconds}</InputAdornment>
          }
        })}
        {renderTextField(messages.dialogs.requiredCodeKeyForApi, 'key', 'text')}
        {renderTextField(messages.dialogs.verificationLink, 'api_url', 'text')}
        {renderTextField(messages.dialogs.resendOtpLink, 'resendOtpLink', 'text')}
        {renderTextField(messages.dialogs.redirectLink, 'redirectLink', 'text')}

        {renderTextField(messages.dialogs.color, 'titleColor', 'color')}

        <h2 className='mt-4 text-xl font-bold'>{messages.dialogs.dataFromUrl}</h2>
        <div className='flex justify-end mb-2'>
          <Button
            variant='contained'
            onClick={() => {
              if (data.params) {
                onChange({ ...data, params: [...data.params, { param: '', paramValue: '' }] })
              } else {
                onChange({ ...data, params: [{ param: '', paramValue: '' }] })
              }
            }}
          >
            {messages.dialogs.add}
          </Button>
        </div>
        {data.params?.map((param, index) => (
          <div key={index} className='flex gap-2'>
            <TextField
              fullWidth
              type='text'
              value={param.param}
              onChange={e =>
                onChange({
                  ...data,
                  params: data.params.map((p, i) => (i === index ? { ...p, param: e.target.value } : p))
                })
              }
              label={messages.dialogs.keyName}
              variant='filled'
            />
            <TextField
              fullWidth
              type='text'
              value={param.paramValue}
              onChange={e =>
                onChange({
                  ...data,
                  params: data.params.map((p, i) => (i === index ? { ...p, paramValue: e.target.value } : p))
                })
              }
              label={messages.dialogs.paramValue}
              variant='filled'
            />
          </div>
        ))}
      </div>
    </div>
  )
}
