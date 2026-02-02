import { Button, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useIntl } from 'react-intl'

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

export default function MeasureConditionDialog({
  open,
  onClose,
  conditionForm,
  setConditionForm,
  tempInputValue,
  setTempInputValue,
  availableColumns,
  onSave
}) {
  const { messages } = useIntl()

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{messages?.dialogs?.addCondition || 'Add Condition'}</DialogTitle>
      <DialogContent>
        <div className='flex flex-col gap-3 mt-2'>

          {/* Operator Dropdown */}
          <TextField
            select
            fullWidth
            label={messages?.dialogs?.operator || 'Operator'}
            value={conditionForm.operator}
            onChange={e => {
              const newOperator = e.target.value
              setConditionForm({
                ...conditionForm,
                operator: newOperator,
                value: ''
              })
              setTempInputValue('')
            }}
            variant='outlined'
            size='small'
          >
            {CONDITION_OPERATORS.map(op => (
              <MenuItem key={op} value={op}>
                {messages?.dialogs?.[op] || op}
              </MenuItem>
            ))}
          </TextField>

          {/* Between Operator - 2 Values */}
          {conditionForm.operator === 'Between' && (
            <div className='flex flex-col gap-2'>
              <TextField
                fullWidth
                label={messages?.Value || 'Value 1'}
                value={Array.isArray(conditionForm.value) && conditionForm.value[0] ? conditionForm.value[0] : ''}
                onChange={e => {
                  const currentValue = Array.isArray(conditionForm.value) ? conditionForm.value : ['', '']
                  setConditionForm({ ...conditionForm, value: [e.target.value, currentValue[1] || ''] })
                }}
                variant='outlined'
                size='small'
                required
              />
              <TextField
                fullWidth
                label={messages?.Value || 'Value 2'}
                value={Array.isArray(conditionForm.value) && conditionForm.value[1] ? conditionForm.value[1] : ''}
                onChange={e => {
                  const currentValue = Array.isArray(conditionForm.value) ? conditionForm.value : ['', '']
                  setConditionForm({ ...conditionForm, value: [currentValue[0] || '', e.target.value] })
                }}
                variant='outlined'
                size='small'
                required
              />
            </div>
          )}

          {/* In Operator - Multiple Values */}
          {conditionForm.operator === 'In' && (
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <TextField
                  fullWidth
                  label={messages?.Value || 'Value'}
                  value={tempInputValue}
                  onChange={e => setTempInputValue(e.target.value)}
                  variant='outlined'
                  size='small'
                  onKeyPress={e => {
                    if (e.key === 'Enter' && tempInputValue.trim()) {
                      e.preventDefault()
                      const currentArray = Array.isArray(conditionForm.value) ? conditionForm.value : []
                      setConditionForm({
                        ...conditionForm,
                        value: [...currentArray, tempInputValue.trim()]
                      })
                      setTempInputValue('')
                    }
                  }}
                />
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    if (tempInputValue.trim()) {
                      const currentArray = Array.isArray(conditionForm.value) ? conditionForm.value : []
                      setConditionForm({
                        ...conditionForm,
                        value: [...currentArray, tempInputValue.trim()]
                      })
                      setTempInputValue('')
                    }
                  }}
                >
                  {messages?.add || 'Add'}
                </Button>
              </div>
              {Array.isArray(conditionForm.value) && conditionForm.value.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {conditionForm.value.map((val, idx) => (
                    <Chip
                      key={idx}
                      label={val}
                      onDelete={() => {
                        const newArray = conditionForm.value.filter((_, i) => i !== idx)
                        setConditionForm({ ...conditionForm, value: newArray })
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
          {conditionForm.operator &&
            conditionForm.operator !== 'Between' &&
            conditionForm.operator !== 'In' &&
            conditionForm.operator !== 'IsNull' &&
            conditionForm.operator !== 'IsNotNull' && (
              <TextField
                fullWidth
                label={messages?.Value || 'Value'}
                value={conditionForm.value}
                onChange={e => setConditionForm({ ...conditionForm, value: e.target.value })}
                variant='outlined'
                size='small'
                required
              />
            )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{messages?.cancel || 'Cancel'}</Button>
        <Button onClick={onSave} variant='contained' color='primary'>
          {messages?.save || 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

