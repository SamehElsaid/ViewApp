import { Button, TextField, MenuItem, IconButton, Checkbox, FormControlLabel } from '@mui/material'
import Collapse from '@kunukn/react-collapse'
import { useIntl } from 'react-intl'
import { MdDeleteOutline } from 'react-icons/md'

export default function GroupBySection({
  data,
  onChange,
  tableData,
  availableTables,
  handleGroupByTableChange,
  handleGroupByColumnToggle,
  handleAddGroupByCard,
  handleDeleteGroupByCard
}) {
  const { messages } = useIntl()

  return (
    <Collapse
      transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
      isOpen={Boolean(tableData && tableData.length > 0)}
    >
      <div className='mt-4 border border-gray-300 rounded-md p-3'>
        <div className='flex items-center justify-between mb-3'>
          <span className='font-semibold text-lg'>{messages?.dialogs?.groupBy || 'Group By'}</span>
          <div className='flex gap-2'>
            <Button
              size='small'
              variant='contained'
              color='primary'
              onClick={handleAddGroupByCard}
              disabled={
                !data.GroupByRows ||
                data.GroupByRows.length === 0 ||
                !data.GroupByRows.some(r => r.table && r.columns && r.columns.length > 0)
              }
            >
              {messages?.add || 'Add'}
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          {(data.GroupByRows && data.GroupByRows.length > 0
            ? data.GroupByRows
            : [
                {
                  table: '',
                  columns: []
                }
              ]
          ).map((row, index) => {
            const selectedTable = availableTables.find(t => t.name === row.table)
            const availableColumnsForTable = selectedTable?.columns || []

            return (
              <div
                key={index}
                className='flex flex-wrap items-start gap-2 p-3 bg-gray-50 rounded border border-gray-200'
              >
                {/* Dropdown for Table */}
                <TextField
                  select
                  size='small'
                  label={messages?.dialogs?.table || 'Table'}
                  value={row.table}
                  onChange={e => handleGroupByTableChange(index, e.target.value)}
                  sx={{ minWidth: 200 }}
                  variant='outlined'
                >
                  {availableTables.map((tbl, tblIdx) => (
                    <MenuItem key={tblIdx} value={tbl.name}>
                      {tbl.name}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Checkboxes for Columns */}
                {row.table && availableColumnsForTable.length > 0 && (
                  <div className='flex flex-col gap-2 flex-1 min-w-[300px]'>
                    <span className='text-sm font-medium text-gray-700'>
                      {messages?.columns || 'Columns'}
                    </span>
                    <div className='flex flex-wrap gap-2'>
                      {availableColumnsForTable.map((col, colIdx) => (
                        <FormControlLabel
                          key={colIdx}
                          control={
                            <Checkbox
                              checked={row.columns?.includes(col) || false}
                              onChange={() => handleGroupByColumnToggle(index, col)}
                              size='small'
                            />
                          }
                          label={col}
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Group By Cards Preview */}
        {data.GroupBy && data.GroupBy.length > 0 && (
          <div className='mt-4'>
            <div className='font-semibold mb-3 text-base'>{messages?.dialogs?.groupBy || 'Group By'}</div>
            <div className='flex flex-col gap-3'>
              {data.GroupBy.map((item, idx) => (
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
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                            {messages?.columns || 'Columns'}:
                          </span>
                          {Array.isArray(item.Columns) && item.Columns.length > 0 ? (
                            <div className='flex flex-wrap gap-1'>
                              {item.Columns.map((col, colIdx) => (
                                <span
                                  key={colIdx}
                                  className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium'
                                >
                                  {col}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className='text-sm text-gray-500'>-</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => handleDeleteGroupByCard(idx)}
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
      </div>
    </Collapse>
  )
}









