import { useMemo } from 'react'
import { FaTableCells } from 'react-icons/fa6'
import { useIntl } from 'react-intl'
import SelectAggregates from '../SelectAggregates'
import TableViewAggregates from '../TableViewAggregates'

export default function useAggregates({ advancedEdit, locale, readOnly, buttonRef }) {
  const { messages } = useIntl()

  const aggregates = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <TableViewAggregates
            readOnly={!advancedEdit}
            selectCollection={data.selectCollection}
            onChange={onChange}
            disabled={!readOnly}
            data={data}
          />
        )
      },
      id: 'aggregates',
      title: messages.dialogs.aggregates,
      description: messages.dialogs.aggregatesDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <SelectAggregates
            title={messages.dialogs.aggregates}
            type='aggregates'
            onChange={onChange}
            data={data}
            buttonRef={buttonRef}
          />
        )
      },
      icon: <FaTableCells className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedEdit, locale, readOnly])

  return { aggregates }
}
