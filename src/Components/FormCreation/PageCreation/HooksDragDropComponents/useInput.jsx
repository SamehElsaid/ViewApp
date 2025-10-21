import { useMemo } from 'react'
import InputControl from '../ButtonControl'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import { FaRegEdit } from 'react-icons/fa'
import { useIntl } from 'react-intl'

export default function useInput({ locale, advancedEdit }) {
  const { messages } = useIntl()
  
  const Input = useMemo(() => {
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
            <ViewInputInFormEngine
              data={data}
              advancedEdit={advancedEdit}
              locale={locale}
              defaultValue={defaultValue}
              onChange={onChange}
            />
          </>
        )
      },
      id: 'input',
      title: messages.dialogs.input,
      description: messages.dialogs.input,
      version: 1,
      icon: <FaRegEdit className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <InputControl data={data} onChange={onChange} locale={locale} />
      }
    }
  }, [locale, advancedEdit, messages])

  return { Input }
}
