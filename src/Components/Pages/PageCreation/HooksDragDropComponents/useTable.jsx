import { useMemo } from 'react'
import { FaTableCells } from 'react-icons/fa6'
import TableView from '../TableView'
import Select from '../Select'
import { useIntl } from 'react-intl'
import TableControl from '../TableControl'

export default function useTable({ advancedEdit, locale, readOnly, buttonRef }) {
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
          <Select title={messages.dialogs.table} type='table' onChange={onChange} data={data} buttonRef={buttonRef} />
        )
      },
      icon: <FaTableCells className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedEdit, locale, readOnly])

  return { table }
}
