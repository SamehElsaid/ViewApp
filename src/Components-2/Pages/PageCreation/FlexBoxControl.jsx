import { InputAdornment, MenuItem, Select, TextField } from '@mui/material'
import React from 'react'
import { useIntl } from 'react-intl'
import CloseNav from './CloseNav'

export default function FlexBoxControl({ data, onChange, buttonRef }) {
  const { locale } = useIntl()

  return (
    <div style={{ padding: '10px' }}>
      <CloseNav text={locale === 'ar' ? 'محتوى' : 'Box'} buttonRef={buttonRef} />

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
              {/* <FormControl>
              </FormControl> */}
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
    </div>
  )
}
