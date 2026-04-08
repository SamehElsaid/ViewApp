import { useMemo } from 'react'
import { FaTableCells } from 'react-icons/fa6'
import TableView from '../TableView'
import Select from '../Select'
import { useIntl } from 'react-intl'

export default function useTable({ advancedEdit, locale, readOnly, buttonRef, pageId }) {
  const { messages } = useIntl()

  const table = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <TableView
            readOnly={!advancedEdit}
            pageId={pageId}
            selectCollection={data.selectCollection}
            onChange={onChange}
            disabled={!readOnly}
            data={data}
            formTable='table'
            tableStyle={{
              headerBackgroundColor: data?.headerBackgroundColor ?? '#f5f5f5',
              headerTextColor: data?.headerTextColor ?? '#333333',
              tableBorderColor: data?.borderColor ?? 'rgba(224, 224, 224, 1)'
            }
            }
          />
        )
      },
      id: 'table',
      title: messages.dialogs.table,
      description: messages.dialogs.tableDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <Select tableType="table" title={messages.dialogs.table} onChange={onChange} data={data} buttonRef={buttonRef} />
        )
      },
      icon: <FaTableCells className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedEdit, locale, readOnly])

  return { table }
}
