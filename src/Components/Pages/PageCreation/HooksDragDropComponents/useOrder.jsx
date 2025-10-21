import { GoListOrdered } from 'react-icons/go'
import { useMemo } from 'react'
import OrderControl from '../OrderControl'
import OrderView from '../OrderView'
import { useIntl } from 'react-intl'

export default function useOrder({ advancedEdit, locale, readOnly, buttonRef }) {
  const { messages } = useIntl()
  
  const order = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return <OrderView data={data} onChange={onChange} locale={locale} readOnly={!advancedEdit} />
      },
      id: 'order',
      title: messages.dialogs.order,
      description: messages.dialogs.orderDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <OrderControl data={data} onChange={onChange} locale={locale} readOnly={readOnly} buttonRef={buttonRef} />
        )
      },
      icon: <GoListOrdered className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, advancedEdit, advancedEdit])

  return { order }
}
