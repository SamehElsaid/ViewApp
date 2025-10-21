import { useMemo } from 'react'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import CheckboxControl from '../CheckboxControl'
import { IoIosArrowDown } from 'react-icons/io'
import { useIntl } from 'react-intl'

export default function useSelect({ locale, advancedEdit }) {
  const { messages } = useIntl()
  
  const Select = useMemo(() => {
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
              type='select'
            />
          </>
        )
      },
      id: 'select',
      title: messages.dialogs.select,
      description: messages.dialogs.select,
      version: 1,
      icon: <IoIosArrowDown className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <CheckboxControl data={data} onChange={onChange} locale={locale} type='select' />
        )
      }
    }
  }, [locale, advancedEdit, messages])

  return { Select }
}
