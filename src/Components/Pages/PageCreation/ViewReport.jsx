import { useIntl } from 'react-intl'
import ChartReport from './ChartReport'
import StatisticsReport from './StatisticsReport'
import TableReport from './TableReport'

function ViewReport({ data, onChange, readOnly, disabled }) {
  const { messages } = useIntl()
  switch (data.typeOfReport) {
    case 'table':
      return <TableReport data={data} onChange={onChange} readOnly={readOnly} disabled={disabled} />
    case 'statistics':
      return <StatisticsReport data={data} onChange={onChange} readOnly={readOnly} disabled={disabled} />
    case 'chart':
      return <ChartReport data={data} onChange={onChange} readOnly={readOnly} disabled={disabled} />
    default:
      return <div>{messages.noReportTypeSelected}</div>
  }
}

export default ViewReport
