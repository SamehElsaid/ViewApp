import { MenuItem, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { SketchPicker } from 'react-color'
import CloseNav from './CloseNav'

export default function ButtonControl({ data, onChange, buttonRef, type }) {
  const { locale } = useIntl()

  return (
    <div>
      {!type && <CloseNav text={locale === 'ar' ? 'اختيار الزر' : 'Button'} buttonRef={buttonRef} />}
      <TextField
        fullWidth
        type='text'
        value={data.width}
        onChange={e => onChange({ ...data, width: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'العرض' : 'Width'}
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
            label={locale === 'ar' ? 'النص باللغة الإنجليزية' : 'Text in English'}
          />
          <TextField
            fullWidth
            type='text'
            value={data.buttonTextAr}
            onChange={e => onChange({ ...data, buttonTextAr: e.target.value })}
            variant='filled'
            label={locale === 'ar' ? 'النص باللغة العربية' : 'Text in Arabic'}
          />
          <TextField
            fullWidth
            type='text'
            value={data.href}
            onChange={e => onChange({ ...data, href: e.target.value })}
            variant='filled'
            label={locale === 'ar' ? 'الرابط' : 'Href'}
          />
        </>
      )}
      <TextField
        fullWidth
        type='number'
        value={data.paddingBlock}
        onChange={e => onChange({ ...data, paddingBlock: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'المساحة الداخلية الطويلة' : 'Padding Block'}
      />
      <TextField
        fullWidth
        type='number'
        value={data.paddingInline}
        onChange={e => onChange({ ...data, paddingInline: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'المساحة  الداخلية العرضية' : 'Padding Inline'}
      />
      <TextField
        fullWidth
        type='number'
        value={data.borderRadius}
        onChange={e => onChange({ ...data, borderRadius: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'نصف القطر' : 'Border Radius'}
      />
      <TextField
        fullWidth
        type='number'
        value={data.borderWidth}
        onChange={e => onChange({ ...data, borderWidth: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'عرض الحد' : 'Border Width'}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{locale === 'ar' ? 'لون الخلفية' : 'Background Color'}</h1>
      <SketchPicker
        color={data.backgroundColor || '#ffffff'}
        onChange={color => onChange({ ...data, backgroundColor: color.hex })}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{locale === 'ar' ? 'لون الخط' : 'Color'}</h1>
      <SketchPicker color={data.color || '#ffffff'} onChange={color => onChange({ ...data, color: color.hex })} />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{locale === 'ar' ? 'لون الحد' : 'Border Color'}</h1>
      <SketchPicker
        color={data.borderColor || '#ffffff'}
        onChange={color => onChange({ ...data, borderColor: color.hex })}
      />
      <TextField
        fullWidth
        type='number'
        value={data.fontSize}
        onChange={e => onChange({ ...data, fontSize: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'حجم الخط' : 'Font Size'}
      />

      <TextField
        fullWidth
        type='number'
        value={data.fontWeight}
        onChange={e => onChange({ ...data, fontWeight: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'الوزن الخط' : 'Font Weight'}
      />
      <TextField
        fullWidth
        type='text'
        value={data.borderStyle}
        onChange={e => onChange({ ...data, borderStyle: e.target.value })}
        variant='filled'
        label={locale === 'ar' ? 'نوع الخط' : 'Font Family'}
        select
      >
        <MenuItem value='solid'>Solid</MenuItem>
        <MenuItem value='dashed'>Dashed</MenuItem>
        <MenuItem value='dotted'>Dotted</MenuItem>
        <MenuItem value='double'>Double</MenuItem>
      </TextField>

      <div className='mb-5'></div>
      <h1 className='text-main-color'>{locale === 'ar' ? 'لون الخلفية عند التحديد' : 'hover BackgroundColor'}</h1>
      <SketchPicker
        color={data.hoverBackgroundColor || '#ffffff'}
        onChange={color => onChange({ ...data, hoverBackgroundColor: color.hex })}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{locale === 'ar' ? 'لون الخط عند التحديد' : 'hover Color'}</h1>
      <SketchPicker
        color={data.hoverColor || '#ffffff'}
        onChange={color => onChange({ ...data, hoverColor: color.hex })}
      />
      <div className='mb-5'></div>
      <h1 className='text-main-color'>{locale === 'ar' ? 'لون الحد عند التحديد' : 'hover Border Color'}</h1>
      <SketchPicker
        color={data.hoverBorderColor || '#ffffff'}
        onChange={color => onChange({ ...data, hoverBorderColor: color.hex })}
      />
    </div>
  )
}
