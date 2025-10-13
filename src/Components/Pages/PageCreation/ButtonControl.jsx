import { InputAdornment, MenuItem, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { SketchPicker } from 'react-color'
import CloseNav from './CloseNav'

export default function ButtonControl({ data, onChange, buttonRef, type }) {
  const { locale, messages } = useIntl()

  return (
    <div>
      {!type && <CloseNav text={messages.useButton.button} buttonRef={buttonRef} />}
      <TextField
        fullWidth
        type='text'
        value={data.width}
        onChange={e => onChange({ ...data, width: e.target.value })}
        variant='filled'
        label={messages.useButton.width}
        select
      >
        <MenuItem value='fit-content'>Fit</MenuItem>
        <MenuItem value='auto'>Auto</MenuItem>
        <MenuItem value='100%'>100%</MenuItem>
      </TextField>
      {!type && (
        <>
          <TextField
            fullWidth
            type='text'
            value={data.buttonTextEn}
            onChange={e => onChange({ ...data, buttonTextEn: e.target.value })}
            variant='filled'
            label={messages.useButton.buttonTextEn}
          />
          <TextField
            fullWidth
            type='text'
            value={data.buttonTextAr}
            onChange={e => onChange({ ...data, buttonTextAr: e.target.value })}
            variant='filled'
            label={messages.useButton.buttonTextAr}
          />
          <TextField
            fullWidth
            type='text'
            value={data.href}
            onChange={e => onChange({ ...data, href: e.target.value })}
            variant='filled'
            label={messages.useButton.href}
          />
        </>
      )}
      <TextField
        fullWidth
        type='number'
        value={data.paddingBlock}
        onChange={e => onChange({ ...data, paddingBlock: e.target.value })}
        variant='filled'
        label={messages.useButton.paddingBlock}
        InputProps={{
          endAdornment: <InputAdornment position='end'>px</InputAdornment>
        }}
      />
      <TextField
        fullWidth
        type='number'
        value={data.paddingInline}
        onChange={e => onChange({ ...data, paddingInline: e.target.value })}
        variant='filled'
        label={messages.useButton.paddingInline}
        InputProps={{
          endAdornment: <InputAdornment position='end'>px</InputAdornment>
        }}
      />
      <TextField
        fullWidth
        type='number'
        value={data.borderRadius}
        onChange={e => onChange({ ...data, borderRadius: e.target.value })}
        variant='filled'
        label={messages.useButton.borderRadius}
        InputProps={{
          endAdornment: <InputAdornment position='end'>px</InputAdornment>
        }}
      />

      <div className='mb-5'></div>
      <h1 className='text-main-color'>{messages.useButton.backgroundColor}</h1>
      <SketchPicker
        color={data.backgroundColor || '#ffffff'}
        onChange={color => onChange({ ...data, backgroundColor: color.hex })}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{messages.useButton.color}</h1>
      <SketchPicker color={data.color || '#ffffff'} onChange={color => onChange({ ...data, color: color.hex })} />
      <div className='mb-5'></div>

      <TextField
        fullWidth
        type='number'
        value={data.fontSize}
        onChange={e => onChange({ ...data, fontSize: e.target.value })}
        variant='filled'
        label={messages.useButton.fontSize}
      />

      <TextField
        fullWidth
        type='number'
        value={data.fontWeight}
        onChange={e => onChange({ ...data, fontWeight: e.target.value })}
        variant='filled'
        label={messages.useButton.fontWeight}
      />
      <TextField
        fullWidth
        type='number'
        value={data.borderWidth}
        onChange={e => onChange({ ...data, borderWidth: e.target.value })}
        variant='filled'
        label={messages.useButton.borderWidth}
        InputProps={{
          endAdornment: <InputAdornment position='end'>px</InputAdornment>
        }}
      />
      <h1 className='text-main-color'>{messages.useButton.borderColor}</h1>
      <SketchPicker
        color={data.borderColor || '#ffffff'}
        onChange={color => onChange({ ...data, borderColor: color.hex })}
      />
      <TextField
        fullWidth
        type='text'
        value={data.borderStyle}
        onChange={e => onChange({ ...data, borderStyle: e.target.value })}
        variant='filled'
        label={messages.useButton.borderStyle}
        select
      >
        <MenuItem value='solid'>Solid</MenuItem>
        <MenuItem value='dashed'>Dashed</MenuItem>
        <MenuItem value='dotted'>Dotted</MenuItem>
        <MenuItem value='double'>Double</MenuItem>
      </TextField>

      <div className='mb-5'></div>
      <h1 className='text-main-color'>{messages.useButton.hoverBackgroundColor}</h1>
      <SketchPicker
        color={data.hoverBackgroundColor || '#ffffff'}
        onChange={color => onChange({ ...data, hoverBackgroundColor: color.hex })}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{messages.useButton.hoverColor}</h1>
      <SketchPicker
        color={data.hoverColor || '#ffffff'}
        onChange={color => onChange({ ...data, hoverColor: color.hex })}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{messages.useButton.hoverBorderColor}</h1>
      <SketchPicker
        color={data.hoverBorderColor || '#ffffff'}
        onChange={color => onChange({ ...data, hoverBorderColor: color.hex })}
      />
    </div>
  )
}
