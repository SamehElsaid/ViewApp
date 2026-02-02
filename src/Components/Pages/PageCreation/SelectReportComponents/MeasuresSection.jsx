import { Button, TextField, MenuItem, IconButton } from '@mui/material'
import Collapse from '@kunukn/react-collapse'
import { useIntl } from 'react-intl'
import { MdDeleteOutline } from 'react-icons/md'

const AGGREGATE_OPERATIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']

export default function MeasuresSection({
  data,
  onChange,
  tableData,
  availableColumns,
  handleMeasureChange,
  handleColumnNameChange,
  handleAddMeasuresCard,
  handleDeleteAggregate,
  getConditionsForMeasure,
  handleOpenConditionDialog
}) {
  const { messages } = useIntl()

  return (
    <Collapse
      transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
      isOpen={Boolean(tableData && tableData.length > 0)}
    >
      <div className='mt-4 border border-gray-300 rounded-md p-3'>
        <div className='flex items-center justify-between mb-3'>
          <span className='font-semibold text-lg'>{messages?.dialogs?.measures || 'Measures'}</span>
          <div className='flex gap-2'>
            <Button
              size='small'
              variant='contained'
              color='primary'
              onClick={handleAddMeasuresCard}
              disabled={
                !data.MeasuresRows ||
                data.MeasuresRows.length === 0 ||
                !data.MeasuresRows.some(r => r.columnName && r.operation && r.table)
              }
            >
              {messages?.add || 'Add'}
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          {(data.MeasuresRows && data.MeasuresRows.length > 0
            ? data.MeasuresRows
            : [
                {
                  table: '',
                  columnName: '',
                  operation: '',
                  alias: ''
                }
              ]
          ).map((row, index) => (
            <div
              key={index}
              className='flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200'
            >
              {/* Dropdown for ColumnName */}
              <TextField
                select
                size='small'
                label={messages?.dialogs?.columnName || 'Column Name'}
                value={row.columnName ? `${row.table}.${row.columnName}` : ''}
                onChange={e => handleColumnNameChange(index, e.target.value)}
                sx={{ minWidth: 200 }}
                variant='outlined'
              >
                {availableColumns.map((col, colIdx) => (
                  <MenuItem key={colIdx} value={col.label}>
                    {col.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Dropdown for Operation */}
              <TextField
                select
                size='small'
                label={messages?.dialogs?.operation || 'Operation'}
                value={row.operation}
                onChange={e => handleMeasureChange(index, 'operation', e.target.value)}
                sx={{ minWidth: 150 }}
                variant='outlined'
              >
                {AGGREGATE_OPERATIONS.map(op => (
                  <MenuItem key={op} value={op}>
                    {messages?.dialogs?.[op] || op}
                  </MenuItem>
                ))}
              </TextField>

              {/* Text input for Alias */}
              <TextField
                size='small'
                label={messages?.dialogs?.alias || 'Alias'}
                placeholder={messages?.dialogs?.alias || 'Alias'}
                value={row.alias}
                onChange={e => handleMeasureChange(index, 'alias', e.target.value)}
                sx={{ minWidth: 150, flex: 1 }}
                variant='outlined'
              />
            </div>
          ))}
        </div>

        {/* Cards Preview - Measures with Conditions */}
        {data.Aggregates && data.Aggregates.length > 0 && (
          <div className='mt-4'>
            <div className='font-semibold mb-3 text-base'>{messages?.dialogs?.measures || 'Measures'}</div>
            <div className='flex flex-col gap-3'>
              {data.Aggregates.map((item, idx) => {
                const measureConditions = getConditionsForMeasure(idx)

                return (
                  <div key={idx} className='border border-main-color rounded-md p-4 bg-white shadow-sm relative'>
                    {/* First Card - Measure/Aggregate */}
                    <div className='flex items-start justify-between gap-3 mb-3'>
                      <div className='flex-1'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                              {messages?.dialogs?.table || 'Table'}:
                            </span>
                            <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                              {item.Table || '-'}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                              {messages?.dialogs?.columnName || 'Column'}:
                            </span>
                            <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                              {item.ColumnName || '-'}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                              {messages?.dialogs?.operation || 'Operation'}:
                            </span>
                            <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium'>
                              {messages?.dialogs?.[item.Operation] || item.Operation || '-'}
                            </span>
                          </div>
                          {item.ColumnAlias && (
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                                {messages?.dialogs?.alias || 'Alias'}:
                              </span>
                              <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                                {item.ColumnAlias}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeleteAggregate(idx)}
                        sx={{ flexShrink: 0 }}
                      >
                        <MdDeleteOutline />
                      </IconButton>
                    </div>

                    {/* Second Card - Conditions */}
                    {measureConditions.length > 0 && (
                      <div className='mt-4 pt-4 border-t border-gray-200'>
                        <div className='font-semibold mb-3 text-sm text-gray-700'>
                          {messages?.dialogs?.conditions || 'Conditions'}
                        </div>
                        <div className='flex flex-col gap-3'>
                          {measureConditions.map((condition, conditionIdx) => (
                            <div
                              key={conditionIdx}
                              className='border border-gray-300 rounded-md p-3 bg-gray-50 relative'
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <div className='flex-1 space-y-2'>
                                  <div className='flex items-center gap-2 flex-wrap'>
                                    <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                      {messages?.dialogs?.table || 'Table'}:
                                    </span>
                                    <span className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'>
                                      {condition.Table || '-'}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2 flex-wrap'>
                                    <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                      {messages?.dialogs?.columnName || 'Column'}:
                                    </span>
                                    <span className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'>
                                      {condition.Column || '-'}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2 flex-wrap'>
                                    <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                      {messages?.dialogs?.operator || 'Operator'}:
                                    </span>
                                    <span className='text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border font-medium'>
                                      {condition.Operator || '-'}
                                    </span>
                                  </div>
                                  {condition.Value !== undefined && condition.Value !== null && (
                                    <div className='flex items-center gap-2 flex-wrap'>
                                      <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                        {messages?.Value || 'Value'}:
                                      </span>
                                      {Array.isArray(condition.Value) ? (
                                        <div className='flex flex-wrap gap-1'>
                                          {condition.Value.map((val, valIdx) => (
                                            <span
                                              key={valIdx}
                                              className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'
                                            >
                                              {String(val)}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'>
                                          {String(condition.Value)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => {
                                    const existingConditions = data.Conditions || []
                                    const measureConditions = existingConditions.filter(c => c.measureIndex === idx)
                                    const conditionToDelete = measureConditions[conditionIdx]
                                    const newConditions = existingConditions.filter(c => c !== conditionToDelete)
                                    onChange({
                                      ...data,
                                      Conditions: newConditions
                                    })
                                  }}
                                  sx={{ flexShrink: 0 }}
                                >
                                  <MdDeleteOutline />
                                </IconButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Condition Button */}
                    <div className='mt-4 flex justify-end'>
                      <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => handleOpenConditionDialog(idx)}
                      >
                        {messages?.dialogs?.addCondition || 'Add Condition'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Collapse>
  )
}

