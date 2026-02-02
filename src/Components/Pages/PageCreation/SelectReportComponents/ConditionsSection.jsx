import { Button, TextField, MenuItem, IconButton, Chip } from '@mui/material'
import Collapse from '@kunukn/react-collapse'
import { useIntl } from 'react-intl'
import { MdDeleteOutline } from 'react-icons/md'

const CONDITION_OPERATORS = [
  'Equals',
  'NotEquals',
  'GreaterThan',
  'GreaterThanOrEqual',
  'LessThan',
  'LessThanOrEqual',
  'In',
  'Between',
  'Like',
  'IsNull',
  'IsNotNull'
]

const LOGICAL_OPERATORS = ['AND', 'OR']

export default function ConditionsSection({
  data,
  onChange,
  tableData,
  availableColumns,
  handleConditionChange,
  handleConditionColumnNameChange,
  handleAddConditionCard,
  handleDeleteConditionCard,
  tempInputValues,
  setTempInputValues
}) {
  const { messages } = useIntl()

  return (
    <Collapse
      transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
      isOpen={Boolean(tableData && tableData.length > 0)}
    >
      <div className='mt-4 border border-gray-300 rounded-md p-3'>
        <div className='flex items-center justify-between mb-3'>
          <span className='font-semibold text-lg'>{messages?.dialogs?.conditions || 'Conditions'}</span>
          <div className='flex gap-2'>
            <Button
              size='small'
              variant='contained'
              color='primary'
              onClick={handleAddConditionCard}
              disabled={
                !data.ConditionsRows ||
                data.ConditionsRows.length === 0 ||
                !data.ConditionsRows.some(r => r.columnName && r.operator && r.table)
              }
            >
              {messages?.add || 'Add'}
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          {(data.ConditionsRows && data.ConditionsRows.length > 0
            ? data.ConditionsRows
            : [
                {
                  table: '',
                  columnName: '',
                  operator: '',
                  logicalOperator: '',
                  value: ''
                }
              ]
          ).map((row, index) => (
            <div
              key={index}
              className='flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200'
            >
              {/* Dropdown for LogicalOperator */}
              <TextField
                select
                size='small'
                label={messages?.dialogs?.logicalOperator || 'Logical Operator'}
                value={row.logicalOperator}
                onChange={e => handleConditionChange(index, 'logicalOperator', e.target.value)}
                sx={{ minWidth: 150 }}
                variant='outlined'
                disabled={(data?.GlobalConditions?.length || 0) === 0}
                required={data?.GlobalConditions?.length > 0}
              >
                {LOGICAL_OPERATORS.map(op => (
                  <MenuItem key={op} value={op}>
                    {messages?.dialogs?.[op] || op}
                  </MenuItem>
                ))}
              </TextField>

              {/* Dropdown for ColumnName */}
              <TextField
                select
                size='small'
                label={messages?.dialogs?.columnName || 'Column Name'}
                value={row.columnName ? `${row.table}.${row.columnName}` : ''}
                onChange={e => handleConditionColumnNameChange(index, e.target.value)}
                sx={{ minWidth: 200 }}
                variant='outlined'
              >
                {availableColumns.map((col, colIdx) => (
                  <MenuItem key={colIdx} value={col.label}>
                    {col.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Dropdown for Operator */}
              <TextField
                select
                size='small'
                label={messages?.dialogs?.operator || 'Operator'}
                value={row.operator}
                onChange={e => {
                  const newOperator = e.target.value
                  const conditionsRows = [...(data.ConditionsRows || [])]
                  conditionsRows[index] = {
                    ...conditionsRows[index],
                    operator: newOperator,
                    value: ''
                  }
                  onChange({
                    ...data,
                    ConditionsRows: conditionsRows
                  })
                  setTempInputValues(prev => {
                    const newValues = { ...prev }
                    delete newValues[index]

                    return newValues
                  })
                }}
                sx={{ minWidth: 150 }}
                variant='outlined'
              >
                {CONDITION_OPERATORS.map(op => (
                  <MenuItem key={op} value={op}>
                    {messages?.dialogs?.[op] || op}
                  </MenuItem>
                ))}
              </TextField>

              {/* Between Operator - 2 Values */}
              {row.operator === 'Between' && (
                <>
                  <TextField
                    size='small'
                    label={messages?.Value + "1" || 'Value 1'}
                    placeholder={messages?.Value + "1" || 'Value 1'}
                    value={Array.isArray(row.value) && row.value[0] ? row.value[0] : ''}
                    onChange={e => {
                      const currentValue = Array.isArray(row.value) ? row.value : ['', '']
                      handleConditionChange(index, 'value', [e.target.value, currentValue[1] || ''])
                    }}
                    sx={{ minWidth: 150 }}
                    variant='outlined'
                    required
                  />
                  <TextField
                    size='small'
                    label={messages?.Value + "2" || 'Value 2'}
                    placeholder={messages?.Value + "2" || 'Value 2'}
                    value={Array.isArray(row.value) && row.value[1] ? row.value[1] : ''}
                    onChange={e => {
                      const currentValue = Array.isArray(row.value) ? row.value : ['', '']
                      handleConditionChange(index, 'value', [currentValue[0] || '', e.target.value])
                    }}
                    sx={{ minWidth: 150 }}
                    variant='outlined'
                    required
                  />
                </>
              )}

              {/* In Operator - Multiple Values */}
              {row.operator === 'In' && (
                <div className='flex flex-col gap-2 flex-1 min-w-[300px]'>
                  <div className='flex items-center gap-2'>
                    <TextField
                      size='small'
                      label={messages?.Value || 'Value'}
                      placeholder={messages?.Value || 'Value'}
                      value={tempInputValues[index] || ''}
                      onChange={e => {
                        setTempInputValues(prev => ({
                          ...prev,
                          [index]: e.target.value
                        }))
                      }}
                      sx={{ flex: 1 }}
                      variant='outlined'
                      onKeyPress={e => {
                        const inputValue = tempInputValues[index] || ''
                        if (e.key === 'Enter' && inputValue.trim()) {
                          e.preventDefault()
                          const conditionsRows = [...(data.ConditionsRows || [])]

                          const currentArray = Array.isArray(conditionsRows[index]?.value)
                            ? conditionsRows[index].value
                            : []
                          conditionsRows[index] = {
                            ...conditionsRows[index],
                            value: [...currentArray, inputValue.trim()]
                          }
                          onChange({
                            ...data,
                            ConditionsRows: conditionsRows
                          })
                          setTempInputValues(prev => ({
                            ...prev,
                            [index]: ''
                          }))
                        }
                      }}
                    />
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        const inputValue = tempInputValues[index] || ''
                        if (inputValue.trim()) {
                          const conditionsRows = [...(data.ConditionsRows || [])]
                          
                          const currentArray = Array.isArray(conditionsRows[index]?.value)
                            ? conditionsRows[index].value
                            : []
                          conditionsRows[index] = {
                            ...conditionsRows[index],
                            value: [...currentArray, inputValue.trim()]
                          }
                          onChange({
                            ...data,
                            ConditionsRows: conditionsRows
                          })
                          setTempInputValues(prev => ({
                            ...prev,
                            [index]: ''
                          }))
                        }
                      }}
                    >
                      {messages?.add || 'Add'}
                    </Button>
                  </div>
                  {Array.isArray(row.value) && row.value.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {row.value.map((val, valIdx) => (
                        <Chip
                          key={valIdx}
                          label={val}
                          onDelete={() => {
                            const newArray = row.value.filter((_, i) => i !== valIdx)
                            handleConditionChange(index, 'value', newArray)
                          }}
                          size='small'
                          color='primary'
                          variant='outlined'
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Regular Value Input - for other operators */}
              {row.operator &&
                row.operator !== 'Between' &&
                row.operator !== 'In' &&
                row.operator !== 'IsNull' &&
                row.operator !== 'IsNotNull' && (
                  <TextField
                    size='small'
                    label={messages?.Value || 'Value'}
                    placeholder={messages?.Value || 'Value'}
                    value={row.value || ''}
                    onChange={e => handleConditionChange(index, 'value', e.target.value)}
                    sx={{ minWidth: 150, flex: 1 }}
                    variant='outlined'
                    required
                  />
                )}
            </div>
          ))}
        </div>

        {/* Conditions Cards Preview */}
        {data.GlobalConditions && data.GlobalConditions.length > 0 && (
          <div className='mt-4'>
            <div className='font-semibold mb-3 text-base'>{messages?.dialogs?.conditions || 'Conditions'}</div>
            <div className='flex flex-col gap-3'>
              {data.GlobalConditions.map((item, idx) => (
                <div key={idx} className='border border-main-color rounded-md p-4 bg-white shadow-sm relative'>
                  <div className='flex items-start justify-between gap-3'>
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
                            {item.Column || '-'}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                            {messages?.dialogs?.operator || 'Operator'}:
                          </span>
                          <span className='text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded border font-medium'>
                            {messages?.dialogs?.[item.Operator] || item.Operator || '-'}
                          </span>
                        </div>
                        {item.LogicalOperator && (
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                              {messages?.dialogs?.logicalOperator || 'Logical Operator'}:
                            </span>
                            <span className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-medium'>
                              {messages?.dialogs?.[item.LogicalOperator] || item.LogicalOperator || '-'}
                            </span>
                          </div>
                        )}
                        {item.Value !== undefined && item.Value !== null && (
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                              {messages?.Value || 'Value'}:
                            </span>
                            {Array.isArray(item.Value) ? (
                              <div className='flex flex-wrap gap-1'>
                                {item.Value.map((val, valIdx) => (
                                  <span
                                    key={valIdx}
                                    className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'
                                  >
                                    {String(val)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                                {String(item.Value)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {(data?.GlobalConditions?.length === 1 || idx !== 0) && (
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeleteConditionCard(idx)}
                        sx={{ flexShrink: 0 }}
                      >
                        <MdDeleteOutline />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Collapse>
  )
}







