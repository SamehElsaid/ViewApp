import { useMemo } from 'react'
import { FaTableCells } from 'react-icons/fa6'
import { useIntl } from 'react-intl'
import SelectReport from '../SelectReport'
import ViewReport from '../ViewReport'

export default function useReport({ advancedEdit, locale, readOnly, buttonRef }) {
  const { messages } = useIntl()

  const report = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <ViewReport
            readOnly={!advancedEdit}
            selectCollection={data.selectCollection}
            onChange={onChange}
            disabled={!readOnly}
            data={data}
          />
        )
      },
      id: 'report',
      title: messages.dialogs.report,
      description: messages.dialogs.reportDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <SelectReport
            title={messages.dialogs.report}
            type='report'
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

  return { report }
}
