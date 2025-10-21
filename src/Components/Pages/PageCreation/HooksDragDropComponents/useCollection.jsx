import { FaWpforms } from 'react-icons/fa6'
import { useMemo } from 'react'
import Select from '../Select'
import ViewCollection from '../ViewCollection'
import { useIntl } from 'react-intl'

export default function useCollection({
  advancedEdit,
  locale,
  readOnly,
  buttonRef,
  workflowId,
  pageId,
  entitiesId,
  collectionName,
  pageName
}) {
  const { messages } = useIntl()

  const collection = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <ViewCollection
            data={data}
            locale={locale}
            onChange={onChange}
            readOnly={!advancedEdit}
            disabled={!readOnly}
            workflowId={workflowId}
            pageId={pageId}
            entitiesId={entitiesId}
            collectionName={collectionName}
            pageName={pageName}
          />
        )
      },
      id: 'collection',
      title: messages.dialogs.collection,
      description: messages.dialogs.collectionDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <Select title={messages.dialogs.collection} onChange={onChange} data={data} buttonRef={buttonRef} />
        )
      },
      icon: <FaWpforms className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, advancedEdit, readOnly])

  return { collection }
}
