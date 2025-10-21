import { useMemo } from 'react'
import InputControl from '../ButtonControl'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import { TbDeviceIpadHorizontalPlus } from 'react-icons/tb'
import { useIntl } from 'react-intl'

export default function useTextArea({ locale, advancedEdit  }) {
  const { messages } = useIntl()
  
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
      title: messages.dialogs.textarea,
      description: messages.dialogs.textarea,
      version: 1,
      icon: <TbDeviceIpadHorizontalPlus className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <InputControl data={data} onChange={onChange} locale={locale} type='textarea' />
      }
    }
  }, [locale, advancedEdit, messages])

  return { TextArea }
}
