import { useMemo } from 'react'
import TableView from '../TableView'
import { useIntl } from 'react-intl'

export default function useTable({ advancedEdit, locale, readOnly, pageId, entitiesId, collectionName, pageName }) {
  const { messages } = useIntl()

  const table = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <TableView
            readOnly={!advancedEdit}
            selectCollection={data.selectCollection}
            onChange={onChange}
            disabled={!readOnly}
            data={data}
            pageId={pageId}
            entitiesId={entitiesId}
            collectionName={collectionName}
            pageName={pageName}
          />
        )
      },
      id: 'table',
      title: messages.dialogs.table,
      description: messages.dialogs.tableDescription,
      version: 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedEdit, locale, readOnly])

  return { table }
}
