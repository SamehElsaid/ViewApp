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
          <TextField
            fullWidth
            type='text'
            value={data.elementId || ''}
            onChange={e => onChange({ ...data, elementId: e.target.value })}
            variant='filled'
            label={messages.useButton?.elementId || (locale === 'ar' ? 'المعرّف (HTML id)' : 'Element ID (HTML id)')}
            helperText={
              messages.useButton?.elementIdHelp ||
              (locale === 'ar'
                ? 'معرّف اختياري للعنصر (مفيد للروابط # أو JavaScript/CSS)'
                : 'Optional HTML id (for anchor links # or JavaScript/CSS)')
            }
          />

          <TextField
            fullWidth
            type='text'
            value={data.popupTargetId || ''}
            onChange={e => onChange({ ...data, popupTargetId: e.target.value })}
            variant='filled'
            label={messages.useButton?.popupTargetId || (locale === 'ar' ? 'Popup ID (اختياري)' : 'Popup ID (optional)')}
            helperText={
              messages.useButton?.popupTargetIdHelp ||
              (locale === 'ar'
                ? 'لو حطيت هنا ID هيتم استخدام الزر للتحكم في popup بنفس الـ ID'
                : 'If you set an ID here, this button will control a popup with the same ID')
            }
          />
          <TextField
            fullWidth
            select
            value={data.popupAction || 'toggle'}
            onChange={e => onChange({ ...data, popupAction: e.target.value })}
            variant='filled'
            label={messages.useButton?.popupAction || (locale === 'ar' ? 'نوع التحكم في الـ popup' : 'Popup action')}
            helperText={
              messages.useButton?.popupActionHelp ||
              (locale === 'ar'
                ? 'اختار تفتح / تقفل / toggle للـ popup'
                : 'Choose whether to open, close or toggle the popup')
            }
          >
            <MenuItem value='toggle'>{locale === 'ar' ? 'تبديل (فتح/قفل)' : 'Toggle (open/close)'}</MenuItem>
            <MenuItem value='open'>{locale === 'ar' ? 'فتح' : 'Open'}</MenuItem>
            <MenuItem value='close'>{locale === 'ar' ? 'قفل' : 'Close'}</MenuItem>
          </TextField>
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
        select
        value={
          data.fontWeight === undefined || data.fontWeight === null || data.fontWeight === ''
            ? 'bold'
            : String(data.fontWeight)
        }
        onChange={e => onChange({ ...data, fontWeight: e.target.value })}
        variant='filled'
        label={messages.useButton.fontWeight}
      >
        <MenuItem value='normal'>{locale === 'ar' ? 'عادي' : 'Normal'}</MenuItem>
        <MenuItem value='bold'>{locale === 'ar' ? 'غامق' : 'Bold'}</MenuItem>
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(n => (
          <MenuItem key={n} value={String(n)}>
            {n}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        select
        value={
          data.fontFamily === undefined || data.fontFamily === null || data.fontFamily === ''
            ? ''
            : String(data.fontFamily)
        }
        onChange={e => onChange({ ...data, fontFamily: e.target.value })}
        variant='filled'
        label={messages.useButton.fontFamily}
      >
        <MenuItem value=''>{locale === 'ar' ? 'افتراضي' : 'Default'}</MenuItem>
        <MenuItem value={"'Public Sans', 'cairo', sans-serif"}>Public Sans / Cairo</MenuItem>
        <MenuItem value='Arial'>{messages.dialogs.arial}</MenuItem>
        <MenuItem value='Tahoma'>{messages.dialogs.tahoma}</MenuItem>
        <MenuItem value='Verdana'>{messages.dialogs.verdana}</MenuItem>
        <MenuItem value='Times New Roman'>{messages.dialogs.timesNewRoman}</MenuItem>
        <MenuItem value='Courier New'>{messages.dialogs.courierNew}</MenuItem>
      </TextField>
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
