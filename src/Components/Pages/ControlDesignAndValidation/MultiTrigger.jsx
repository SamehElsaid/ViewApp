import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import { cssToObject, objectToCss } from 'src/Components/_Shared'

function MultiTrigger({
  openMultiTrigger,
  messages,
  locale,
  fields,
  data,
  onChange,
  open,
  setOpenMultiTrigger,
  design,
  roles,
  type
}) {
  const steps = [messages.Type_Of_Validation, messages.Input_Field]
  const [activeStep, setActiveStep] = useState(0)
  const [typeOfValidation, setTypeOfValidation] = useState(null)
  const [logicOperator, setLogicOperator] = useState('and')
  const [conditions, setConditions] = useState([{ selectedField: null, isEqual: 'equal', mainValue: '' }])

  const handleBack = () => setActiveStep(prev => prev - 1)
  const handleNext = () => setActiveStep(prev => prev + 1)

  const addCondition = () => {
    setConditions(prev => [...prev, { selectedField: null, isEqual: 'equal', mainValue: '' }])
  }

  const removeCondition = index => {
    setConditions(prev => prev.filter((_, i) => i !== index))
  }

  const updateCondition = (index, key, value) => {
    setConditions(prev => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)))
  }

  const handleFinish = () => {
    const Css = cssToObject(design)

    const validConditions = conditions.filter(c => c.selectedField)
    if (!validConditions.length || !typeOfValidation) return

    const sendData = {
      typeOfValidation,
      logicOperator,
      conditions: validConditions
    }

    const additional_fields = data.additional_fields ?? []
    const findMyInput = additional_fields.find(inp => inp.key === open.id)

    if (findMyInput) {
      findMyInput.roles = findMyInput.roles ?? {}
      findMyInput.roles.multiTriggers = [...(findMyInput.roles.multiTriggers ?? []), sendData]
    } else {
      additional_fields.push({
        key: open.id,
        design: objectToCss(Css).replaceAll('NaN', ''),
        roles: {
          ...roles,
          multiTriggers: [...(roles?.multiTriggers ?? []), sendData]
        }
      })
    }

    onChange({ ...data, additional_fields })
    resetForm()
  }

  const resetForm = () => {
    setActiveStep(0)
    setTypeOfValidation(null)
    setLogicOperator('and')
    setConditions([{ selectedField: null, isEqual: 'equal', mainValue: '' }])
    setOpenMultiTrigger(false)
  }

  const validConditionsCount = conditions.filter(c => c.selectedField).length

  return (
    <Dialog open={openMultiTrigger} onClose={resetForm} fullWidth maxWidth='md'>
      <DialogTitle>
        {messages.Multi_Triggers ?? 'Multi Trigger'}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel className='mt-2'>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className='p-4 mt-5 rounded-md border border-dashed border-main-color'>
          {activeStep === 0 && (
            <FormControl fullWidth margin='normal'>
              <InputLabel>{messages.Type_Of_Validation}</InputLabel>
              <Select
                variant='filled'
                value={typeOfValidation ?? ''}
                onChange={e => setTypeOfValidation(e.target.value)}
              >
                <MenuItem value='disable' className={`${type === 'column' ? '!hidden' : ''}`}>
                  {messages.Disable}
                </MenuItem>
                <MenuItem
                  value='enable'
                  disabled={open.type === 'new_element'}
                  className={`${type === 'column' ? '!hidden' : ''}`}
                >
                  {messages.enable}
                </MenuItem>
                <MenuItem value='required' className={`${type === 'column' ? '!hidden' : ''}`}>
                  {messages.Required}
                </MenuItem>
                <MenuItem value='optional' className={`${type === 'column' ? '!hidden' : ''}`}>
                  {messages.optional}
                </MenuItem>
                <MenuItem
                  value='empty'
                  disabled={open.type === 'new_element'}
                  className={`${type === 'column' ? '!hidden' : ''}`}
                >
                  {messages.empty}
                </MenuItem>
                <MenuItem value='hidden' disabled={open?.key === 'button' && roles?.onMount?.type === 'hide'}>
                  {messages.hidden}
                </MenuItem>
                <MenuItem value='visible'>{messages.visible}</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeStep === 1 && (
            <div className='flex flex-col gap-3 mt-2'>
              <div className='flex items-center gap-3'>
                <span className='text-sm text-gray-500 font-medium'>
                  {messages.Logic_Operator ?? 'Logic Between Conditions'}:
                </span>
                <ToggleButtonGroup
                  value={logicOperator}
                  exclusive
                  onChange={(_, val) => { if (val) setLogicOperator(val) }}
                  size='small'
                >
                  <ToggleButton value='and' color='primary'>
                    AND&nbsp;<span className='text-xs opacity-60'>(&&)</span>
                  </ToggleButton>
                  <ToggleButton value='or' color='primary'>
                    OR&nbsp;<span className='text-xs opacity-60'>(||)</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>

              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className='flex flex-wrap items-end gap-2 p-3 rounded-md border border-main-color bg-gray-50'
                >
                  <span className='text-xs font-bold text-main-color self-center min-w-[24px]'>
                    #{index + 1}
                  </span>

                  <FormControl size='small' style={{ flex: '1 1 180px' }}>
                    <InputLabel>{messages.Field}</InputLabel>
                    <Select
                      variant='filled'
                      value={condition.selectedField ?? ''}
                      onChange={e => updateCondition(index, 'selectedField', e.target.value)}
                    >
                      {fields
                        ?.filter(f => f?.id !== open?.id)
                        .filter(f => f?.kind !== 'Table')
                        .filter(f => f?.key !== 'button')
                        .map(field => (
                          <MenuItem key={field.key} value={field.key}>
                            {field?.[`name${locale === 'ar' ? 'Ar' : 'En'}`]}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <FormControl size='small' style={{ flex: '1 1 140px' }}>
                    <InputLabel>{messages.Status}</InputLabel>
                    <Select
                      variant='filled'
                      value={condition.isEqual}
                      onChange={e => updateCondition(index, 'isEqual', e.target.value)}
                    >
                      <MenuItem value='equal'>{messages.Equal}</MenuItem>
                      <MenuItem value='notEqual'>{messages.Not_Equal}</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    size='small'
                    label={messages.Value}
                    variant='filled'
                    value={condition.mainValue}
                    onChange={e => updateCondition(index, 'mainValue', e.target.value)}
                    placeholder={messages.Any_Value ?? 'Any value'}
                    style={{ flex: '1 1 140px' }}
                  />

                  {conditions.length > 1 && (
                    <IconButton size='small' color='error' onClick={() => removeCondition(index)}>
                      <Icon icon='mdi:close-circle' />
                    </IconButton>
                  )}
                </div>
              ))}

              <Button
                variant='outlined'
                color='primary'
                onClick={addCondition}
                startIcon={<Icon icon='mdi:plus' />}
                className='self-start'
              >
                {messages.Add_Condition ?? 'Add Condition'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        {activeStep > 0 && (
          <Button onClick={handleBack} variant='contained' color='warning'>
            {messages.back}
          </Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} variant='contained' color='primary' disabled={!typeOfValidation}>
            {messages.next}
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <LoadingButton
            onClick={handleFinish}
            variant='contained'
            color='primary'
            disabled={validConditionsCount === 0}
          >
            {messages.finish}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default MultiTrigger
