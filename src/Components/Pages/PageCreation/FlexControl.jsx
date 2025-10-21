import { InputAdornment, MenuItem, Select, TextField } from '@mui/material'
import React from 'react'
import CloseNav from './CloseNav'
import { useIntl } from 'react-intl'

export default function FlexControl({ data, onChange, locale, from, buttonRef }) {
  const { messages } = useIntl()

  return (
    <div>
      <CloseNav text={messages.dialogs.flexControl} buttonRef={buttonRef} />
      {!from && (
        <TextField
          fullWidth
          type='number'
          value={data.height}
          onChange={e => onChange({ ...data, height: e.target.value })}
          variant='filled'
          label={messages.dialogs.height}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={data.heightUnit || 'px'} // الافتراضي px
                  onChange={e => onChange({ ...data, heightUnit: e.target.value })}
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
      )}
      <TextField
        fullWidth
        type='text'
        value={data.flexDirection}
        onChange={e => onChange({ ...data, flexDirection: e.target.value })}
        variant='filled'
        label={messages.dialogs.flexDirection}
        select
      >
        <MenuItem value='row'>row</MenuItem>
        <MenuItem value='column'>column</MenuItem>
        <MenuItem value='row-reverse'>row-reverse</MenuItem>
        <MenuItem value='column-reverse'>column-reverse</MenuItem>
      </TextField>
      <TextField
        fullWidth
        type='text'
        value={data.flexWrap}
        onChange={e => onChange({ ...data, flexWrap: e.target.value })}
        variant='filled'
        label={messages.dialogs.flexWrap}
        select
      >
        <MenuItem value='wrap'>wrap</MenuItem>
        <MenuItem value='nowrap'>nowrap</MenuItem>
        <MenuItem value='wrap-reverse'>wrap-reverse</MenuItem>
      </TextField>
      <TextField
        fullWidth
        type='text'
        value={data.justifyContent}
        onChange={e => onChange({ ...data, justifyContent: e.target.value })}
        variant='filled'
        label={messages.dialogs.justifyContent}
        select
      >
        <MenuItem value='center'>center</MenuItem>
        <MenuItem value='flex-start'>flex-start</MenuItem>
        <MenuItem value='flex-end'>flex-end</MenuItem>
        <MenuItem value='space-between'>space-between</MenuItem>
        <MenuItem value='space-around'>space-around</MenuItem>
        <MenuItem value='space-evenly'>space-evenly</MenuItem>
      </TextField>
      <TextField
        fullWidth
        type='text'
        value={data.alignItems}
        onChange={e => onChange({ ...data, alignItems: e.target.value })}
        variant='filled'
        label={messages.dialogs.alignItems}
        select
      >
        <MenuItem value='center'>center</MenuItem>
        <MenuItem value='flex-start'>flex-start</MenuItem>
        <MenuItem value='flex-end'>flex-end</MenuItem>
        <MenuItem value='stretch'>stretch</MenuItem>
        <MenuItem value='baseline'>baseline</MenuItem>
      </TextField>
      <TextField
        fullWidth
        type='text'
        value={data.gap}
        onChange={e => onChange({ ...data, gap: e.target.value })}
        variant='filled'
        label={messages.dialogs.gap}
        InputProps={{
          endAdornment: <InputAdornment position='end'>px</InputAdornment>
        }}
      />
      <TextField
        fullWidth
        type='text'
        value={data.childrenView || 'auto'}
        onChange={e => onChange({ ...data, childrenView: e.target.value })}
        variant='filled'
        label={messages.dialogs.childrenView}
        select
      >
        <MenuItem value='auto'>Auto</MenuItem>
        <MenuItem value='1'>1</MenuItem>
        <MenuItem value='2'>2</MenuItem>
        <MenuItem value='3'>3</MenuItem>
        <MenuItem value='4'>4</MenuItem>
        <MenuItem value='5'>5</MenuItem>
        <MenuItem value='6'>6</MenuItem>
        <MenuItem value='7'>7</MenuItem>
        <MenuItem value='8'>8</MenuItem>
        <MenuItem value='9'>9</MenuItem>
        <MenuItem value='10'>10</MenuItem>
      </TextField>
    </div>
  )
}
