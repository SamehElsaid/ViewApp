import { useMemo } from 'react'
import { GiClick } from 'react-icons/gi'
import InputControl from '../ButtonControl'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import { TbDeviceIpadHorizontalPlus } from 'react-icons/tb'

export default function useTextArea({ locale, advancedEdit  }) {
  const TextArea = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {

        const defaultValue = (data, key, defaultValue) => {
          if (data[key]) {
            return data[key]
          }

          return defaultValue
        }

        return (
          <>
            <ViewInputInFormEngine data={data} advancedEdit={advancedEdit} locale={locale} defaultValue={defaultValue} onChange={onChange} type='textarea'/>
          </>
        )
      },
      id: 'textarea',
      title: locale === 'ar' ? 'حقل نص' : 'Textarea',
      description: locale === 'ar' ? 'حقل نص' : 'Textarea',
      version: 1,
      icon: <TbDeviceIpadHorizontalPlus className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <InputControl data={data} onChange={onChange} locale={locale} type='textarea' />
      }
    }
  }, [locale, advancedEdit])

  return { TextArea }
}
