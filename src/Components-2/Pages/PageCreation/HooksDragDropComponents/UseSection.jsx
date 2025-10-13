import { useMemo } from 'react';
import { IoMdResize } from 'react-icons/io';
import { InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import { useIntl } from 'react-intl';

export default function useSection({ locale, buttonRef }) {
  const SectionControl = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <section
          style={{
            height: data.sectionHeight ? `${data.sectionHeight}${data.sectionHeightUnit || 'px'}` : 'auto',
            width: data.sectionWidth ? `${data.sectionWidth}${data.sectionWidthUnit || 'px'}` : '100%',
            padding: data.sectionPadding || '20px',
            margin: data.sectionMargin || '0',
            backgroundColor: data.sectionBackground || 'transparent',
            border: data.sectionBorder || 'none',
            borderRadius: data.sectionBorderRadius || '0',
            boxShadow: data.sectionShadow || 'none',
            position: 'relative'
          }}
        >
          {data.sectionTitle && (
            <h2 
              style={{
                fontSize: data.titleSize || '1.5em',
                fontWeight: data.titleWeight || 'bold',
                margin: data.titleMargin || '0 0 16px 0',
                textAlign: data.titleAlign || 'left',
                color: data.titleColor || 'inherit'
              }}
            >
              {data.sectionTitle}
            </h2>
          )}
          {children}
        </section>
      ),
      id: 'sectionControl',
      title: locale === 'ar' ? 'قسم' : 'Section',
      description: locale === 'ar' ? 
        'قسم منظم يمكن أن يحتوي على عنوان ومحتوى متعدد' : 
        'A structured section that can contain a title and multiple content elements',
      version: 1,
      icon: <IoMdResize className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <SectionControls data={data} onChange={onChange} buttonRef={buttonRef} />
      }
    }
  }, [locale, buttonRef])

  return { SectionControl }
}

function SectionControls({ data, onChange, buttonRef }) {
  const { locale } = useIntl()

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div style={{ padding: '16px' }}>

      {/* Title Settings */}
      <TextField
        fullWidth
        value={data.sectionTitle || ''}
        onChange={(e) => handleChange('sectionTitle', e.target.value)}
        variant='filled'
        label={locale === 'ar' ? 'عنوان القسم' : 'Section Title'}
        margin='normal'
      />

      <Select
        fullWidth
        value={data.titleAlign || 'left'}
        onChange={(e) => handleChange('titleAlign', e.target.value)}
        variant='filled'
        margin='dense'
        label={locale === 'ar' ? 'محاذاة العنوان' : 'Title Alignment'}
      >
        <MenuItem value='left'>{locale === 'ar' ? 'يسار' : 'Left'}</MenuItem>
        <MenuItem value='center'>{locale === 'ar' ? 'وسط' : 'Center'}</MenuItem>
        <MenuItem value='right'>{locale === 'ar' ? 'يمين' : 'Right'}</MenuItem>
      </Select>

      {/* Dimensions */}
      <TextField
        fullWidth
        type='number'
        value={data.sectionWidth || ''}
        onChange={(e) => handleChange('sectionWidth', e.target.value)}
        variant='filled'
        label={locale === 'ar' ? 'عرض القسم' : 'Section Width'}
        margin='normal'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.sectionWidthUnit || 'px'}
                onChange={(e) => handleChange('sectionWidthUnit', e.target.value)}
                variant='standard'
              >
                <MenuItem value='px'>PX</MenuItem>
                <MenuItem value='%'>%</MenuItem>
                <MenuItem value='vw'>VW</MenuItem>
              </Select>
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        type='number'
        value={data.sectionHeight || ''}
        onChange={(e) => handleChange('sectionHeight', e.target.value)}
        variant='filled'
        label={locale === 'ar' ? 'ارتفاع القسم' : 'Section Height'}
        margin='normal'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Select
                value={data.sectionHeightUnit || 'px'}
                onChange={(e) => handleChange('sectionHeightUnit', e.target.value)}
                variant='standard'
              >
                <MenuItem value='px'>PX</MenuItem>
                <MenuItem value='vh'>VH</MenuItem>
              </Select>
            </InputAdornment>
          )
        }}
      />

      {/* Styling */}
      <TextField
        fullWidth
        value={data.sectionBackground || ''}
        onChange={(e) => handleChange('sectionBackground', e.target.value)}
        variant='filled'
        label={locale === 'ar' ? 'لون الخلفية' : 'Background Color'}
        margin='normal'
      />

      <TextField
        fullWidth
        value={data.sectionPadding || ''}
        onChange={(e) => handleChange('sectionPadding', e.target.value)}
        variant='filled'
        label={locale === 'ar' ? 'الحشو الداخلي' : 'Padding'}
        margin='normal'
      />

      <TextField
        fullWidth
        value={data.sectionMargin || ''}
        onChange={(e) => handleChange('sectionMargin', e.target.value)}
        variant='filled'
        label={locale === 'ar' ? 'الهامش الخارجي' : 'Margin'}
        margin='normal'
      />
    </div>
  )
}