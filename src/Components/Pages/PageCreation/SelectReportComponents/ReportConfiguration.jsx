import { TextField, MenuItem } from '@mui/material'
import Collapse from '@kunukn/react-collapse'
import { useIntl } from 'react-intl'

export default function ReportConfiguration({ data, onChange }) {
  const { messages } = useIntl()

  return (
    <>
      {/* ReportAPIName Input */}
      <TextField
        fullWidth
        label={messages?.dialogs?.reportAPIName || messages.dialogs.reportAPIName}
        value={data.reportAPIName || ''}
        onChange={e => {
          onChange({
            ...data,
            reportAPIName: e.target.value
          })
        }}
        variant='outlined'
        sx={{ mb: 2 }}
      />

      {/* Type of Report Dropdown */}
      <TextField
        select
        fullWidth
        label={messages?.dialogs?.typeOfReport || 'Type of Report'}
        value={data.typeOfReport || ''}
        onChange={e => {
          onChange({
            ...data,
            typeOfReport: e.target.value,
            chartType: e.target.value !== 'chart' ? '' : data.chartType
          })
        }}
        variant='outlined'
        sx={{ mb: 2 }}
      >
        <MenuItem value='statistics'>{messages.dialogs.statistics}</MenuItem>
        <MenuItem value='table'>{messages.dialogs.table}</MenuItem>
        <MenuItem value='chart'>{messages.dialogs.chart}</MenuItem>
      </TextField>

      {/* Chart Type Dropdown - Only shown when chart is selected */}
      <Collapse
        transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
        isOpen={data.typeOfReport === 'chart'}
      >
        <div className="mt-2"></div>
        <TextField
          select
          fullWidth
          label={messages?.dialogs?.chartType || 'Chart Type'}
          value={data.chartType || 'donuts'}
          onChange={e => {
            onChange({
              ...data,
              chartType: e.target.value
            })
          }}
          variant='outlined'
          sx={{ mb: 2 }}
        >
          <MenuItem value='donuts'>{messages.dialogs.donuts}</MenuItem>
          <MenuItem value='line'>{messages.dialogs.line}</MenuItem>
          <MenuItem value='bar'>{messages.dialogs.bar}</MenuItem>
        </TextField>
      </Collapse>
    </>
  )
}



