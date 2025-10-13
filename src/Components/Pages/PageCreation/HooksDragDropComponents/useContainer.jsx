import { TextField } from '@mui/material'
import { useMemo } from 'react'
import { TbContainer } from 'react-icons/tb'
import CloseNav from '../CloseNav'

export default function useContainer({ locale, buttonRef }) {
  const ContainerPlugin = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <div
          style={{
            padding: `${data.paddingStart ?? 0}px ${data.paddingEnd ?? 0}px ${data.paddingTop ?? 0}px ${
              data.paddingBottom ?? 0
            }px`
          }}
          className='container'
        >
          {children}
        </div>
      ),
      id: 'containerPlugin',
      title: locale === 'ar' ? 'حاوية' : 'Container',
      description: locale === 'ar' ? 'تضمين عناصر متعددة في جزء' : 'Group and organize multiple elements within a section.',
      version: 1,
      icon: <TbContainer className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <>
            <CloseNav text={locale === 'ar' ? 'اختيار الحاوية' : 'Container'} buttonRef={buttonRef} />
            <TextField
              fullWidth
              type='text'
              value={data.paddingStart}
              onChange={e => onChange({ ...data, paddingStart: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الاذاحة الداخلية من اليمين' : 'Padding Start'}
            />

            <TextField
              fullWidth
              type='text'
              value={data.paddingEnd}
              onChange={e => onChange({ ...data, paddingEnd: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الاذاحة الداخلية من اليسار' : 'Padding End'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.paddingTop}
              onChange={e => onChange({ ...data, paddingTop: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الاذاحة الداخلية من الاعلى' : 'Padding Top'}
            />
            <TextField
              fullWidth
              type='text'
              value={data.paddingBottom}
              onChange={e => onChange({ ...data, paddingBottom: e.target.value })}
              variant='filled'
              label={locale === 'ar' ? 'الاذاحة الداخلية من الاسفل' : 'Padding Bottom'}
            />
          </>
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { ContainerPlugin }
}
