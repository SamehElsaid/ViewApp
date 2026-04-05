import { MdOutlineEventNote } from 'react-icons/md'

import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import ViewEvent from './ViewEvent'

export default function useEvent({ locale, readOnly, buttonRef }) {
  const { messages } = useIntl()

  const eventCell = useMemo(() => {
    return {
      Renderer: ({ data, children }) => {
        return (
          <ViewEvent data={data} locale={locale} readOnly={readOnly}>
          </ViewEvent>
        )
      },
      id: 'event',
      title: messages.dialogs.event,
      description: messages.dialogs.eventDescription,
      version: 1,
      icon: <MdOutlineEventNote className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <></>
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, readOnly])

  return { eventCell }
}
