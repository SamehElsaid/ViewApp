import { TbViewportWide } from 'react-icons/tb'
import CartControl from '../CartControl'
import ViewCart from '../ViewCart'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

export default function useCartProgress({ locale, readOnly, buttonRef }) {
  const { messages } = useIntl()
  
  const cartProgress = useMemo(() => {
    return {
      Renderer: ({ data, onChange, children }) => {
        return (
          <ViewCart data={data} onChange={onChange} locale={locale} readOnly={readOnly}>
            {children}
          </ViewCart>
        )
      },
      id: 'cart',
      title: messages.dialogs.cart,
      description: messages.dialogs.cartDescription,
      version: 1,
      icon: <TbViewportWide className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <CartControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, readOnly])

  return { cartProgress }
}
