import { Icon } from '@iconify/react'
import { MenuItem, TextField } from '@mui/material'
import { useMemo } from 'react'
import { GiClick } from 'react-icons/gi'
import CloseNav from '../CloseNav'

export default function useIconView({ locale, buttonRef }) {
  const IconView = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        return (
          <div
            style={{
              width: data?.width ? data?.width + (data?.widthUnit ?? 'px') : '30px',
              height: data?.height ? data?.height + (data?.heightUnit ?? 'px') : '30px',
              borderRadius: data?.borderRadius ? data?.borderRadius + (data?.borderRadiusUnit ?? 'px') : '0px',
              backgroundColor: data?.backgroundColor,
              marginBottom: data?.marginBottom ? data?.marginBottom + (data?.marginBottomUnit ?? 'px') : '0px'
            }}
            className='flex justify-center items-center'
          >
            <Icon
              style={{
                color: data?.color,
                fontSize: data?.fontSize ? data?.fontSize + (data?.fontSizeUnit ?? 'px') : '30px',
                fontWeight: data?.fontWeight,
                fontFamily: data?.fontFamily
              }}
              icon={data?.text_en ? data?.text_en : 'ph:binary-duotone'}
            />
          </div>
        )
      },
      id: 'Icon',
      title: locale === 'ar' ? 'ايقونة' : 'Icon',
      description: locale === 'ar' ? 'ايقونة صغيرة مستخدمة للإشارات البصرية.' : 'A small graphical symbol used for visual cues.',
      version: 1,
      icon: <GiClick className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <div>
            <CloseNav text={locale === 'ar' ? 'اختيار الايقونة' : 'Icon'} buttonRef={buttonRef} />
            <TextField
              fullWidth
              type='text'
              value={data.text_en}
              onChange={e => onChange({ ...data, text_en: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'القيمة' : 'Value'}
            />
            <a
              href='https://iconify.design/icon-sets/ph/'
              target='_blank'
              className='my-1 text-sm underline text-main-color'
            >
              {locale === 'ar' ? 'من هنا' : 'From Here'}{' '}
            </a>
            <TextField
              fullWidth
              type='text'
              value={data.width}
              onChange={e => onChange({ ...data, width: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'العرض' : 'Width'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.height}
              onChange={e => onChange({ ...data, height: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الطول' : 'Height'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.borderRadius}
              onChange={e => onChange({ ...data, borderRadius: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الدوران' : 'Border Radius'}
            />
            <TextField
              fullWidth
              type='color'
              value={data.color}
              onChange={e => onChange({ ...data, color: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'اللون' : 'Color'}
            />
            <TextField
              fullWidth
              type='color'
              value={data.backgroundColor}
              onChange={e => onChange({ ...data, backgroundColor: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'اللون الخلفي' : 'Background Color'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.fontSize}
              onChange={e => onChange({ ...data, fontSize: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الحجم' : 'Font Size'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.fontWeight}
              onChange={e => onChange({ ...data, fontWeight: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الوزن' : 'Font Weight'}
              select
            >
              <MenuItem value='100'>100</MenuItem>
              <MenuItem value='200'>200</MenuItem>
              <MenuItem value='300'>300</MenuItem>
              <MenuItem value='400'>400</MenuItem>
              <MenuItem value='500'>500</MenuItem>
              <MenuItem value='600'>600</MenuItem>
              <MenuItem value='700'>700</MenuItem>
              <MenuItem value='800'>800</MenuItem>
              <MenuItem value='900'>900</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type='text'
              value={data.fontFamily}
              onChange={e => onChange({ ...data, fontFamily: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الخط' : 'Font Family'}
              select
            >
              <MenuItem value='Arial'>Arial</MenuItem>
              <MenuItem value='Helvetica'>Helvetica</MenuItem>
              <MenuItem value='Times New Roman'>Times New Roman</MenuItem>
              <MenuItem value='Georgia'>Georgia</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type='text'
              value={data.backgroundColor}
              onChange={e => onChange({ ...data, backgroundColor: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'اللون' : 'Background Color'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.marginBottom}
              onChange={e => onChange({ ...data, marginBottom: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الهامش السفلي' : 'Margin Bottom'}
            />
          </div>
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return {IconView}
}
