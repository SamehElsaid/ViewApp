import { GoListOrdered } from 'react-icons/go'
import { useMemo } from 'react'
import OrderControl from '../OrderControl'
import EcommerceStatistics from 'src/Components/analytics/EcommerceStatistics'

export default function useAnalytics({ advancedEdit, locale, readOnly, buttonRef }) {
  const analytics = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return <EcommerceStatistics />
      },
      id: 'analytics',
      title: locale === 'ar' ? 'تحليلات' : 'Analytics',
      description: locale === 'ar' ? 'تحليلات' : 'Analytics',
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

  return { analytics }
}
