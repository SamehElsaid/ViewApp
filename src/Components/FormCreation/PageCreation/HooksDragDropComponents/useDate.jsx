import { useMemo } from 'react'
import InputControl from '../ButtonControl'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import { FaCalendarAlt } from 'react-icons/fa'
import { useIntl } from 'react-intl'

export default function useDate({ locale, advancedEdit,readOnly }) {
  const { messages } = useIntl()

  const Date = useMemo(() => {
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
              type='date'
              onChange={onChange}
              readOnly={readOnly}
            />
          </>
        )
      },
      id: 'date',
      title: messages.dialogs.date,
      description: messages.dialogs.date,
      version: 1,
      icon: <FaCalendarAlt className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <InputControl type='date' data={data} onChange={onChange} locale={locale} />
      }
    }
  }, [locale, advancedEdit,readOnly, messages])

  return { Date }
}
