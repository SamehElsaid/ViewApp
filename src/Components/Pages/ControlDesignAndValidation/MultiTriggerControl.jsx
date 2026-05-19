import { Button, Chip } from '@mui/material'
import { useState } from 'react'
import DeletePopUp from 'src/Components/DeletePopUp'

function MultiTriggerControl({ roles, setOpenMultiTrigger, messages, data, onChange, open, objectToCss, Css }) {
  const [deleteIndex, setDeleteIndex] = useState(null)

  const multiTriggers = roles?.multiTriggers ?? []

  const deleteMultiTrigger = () => {
    const additional_fields = data.additional_fields ?? []
    const findMyInput = additional_fields.find(inp => inp.key === open.id)
    const updated = multiTriggers.filter((_, i) => i !== deleteIndex)

    if (findMyInput) {
      findMyInput.roles = findMyInput.roles ?? {}
      findMyInput.roles.multiTriggers = updated
    } else {
      additional_fields.push({
        key: open.id,
        design: objectToCss(Css).replaceAll('NaN', ''),
        roles: { ...roles, multiTriggers: updated }
      })
    }

    onChange({ ...data, additional_fields })
    setDeleteIndex(null)
  }

  return (
    <>
      <DeletePopUp
        handleDelete={deleteMultiTrigger}
        open={deleteIndex !== null}
        setOpen={v => { if (!v) setDeleteIndex(null) }}
      />

      {multiTriggers.map((mt, index) => (
        <div key={index} className='capitalize rounded-md p-2 border border-main-color border-dashed m-3'>
          <div className='py-2 text-sm'>
            <div className='mb-1'>
              <span className='text-main-color font-semibold'>{messages.Type_Of_Validation}</span>
              {' : '}
              <Chip
                label={messages[mt.typeOfValidation] ?? mt.typeOfValidation}
                size='small'
                color='primary'
              />
            </div>

            <div className='mt-2'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='text-main-color font-semibold'>
                  {messages.Conditions ?? 'Conditions'}
                </span>
                <Chip
                  label={mt.logicOperator === 'or' ? 'OR (||)' : 'AND (&&)'}
                  size='small'
                  color={mt.logicOperator === 'or' ? 'warning' : 'success'}
                  variant='filled'
                />
              </div>
              <div className='flex flex-col gap-1 mt-1 ms-2'>
                {mt.conditions?.map((c, ci) => (
                  <div key={ci} className='flex flex-col gap-1'>
                    {ci > 0 && (
                      <div className='flex items-center gap-1 my-0.5'>
                        <div className='h-px flex-1 bg-gray-200' />
                        <Chip
                          label={mt.logicOperator === 'or' ? 'OR' : 'AND'}
                          size='small'
                          color={mt.logicOperator === 'or' ? 'warning' : 'success'}
                          variant='outlined'
                        />
                        <div className='h-px flex-1 bg-gray-200' />
                      </div>
                    )}
                    <div className='flex items-center gap-1 flex-wrap'>
                      <Chip label={`#${ci + 1}`} size='small' color='default' />
                      <span className='font-medium'>{c.selectedField}</span>
                      <Chip
                        label={c.isEqual === 'equal' ? messages.Equal : messages.Not_Equal}
                        size='small'
                        color='info'
                        variant='outlined'
                      />
                      {c.mainValue ? (
                        <span className='font-bold text-main-color'>{c.mainValue}</span>
                      ) : (
                        <span className='italic text-gray-400'>{messages.Any_Value ?? 'any value'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='flex justify-end mt-2'>
            <Button
              variant='contained'
              color='error'
              size='small'
              onClick={() => setDeleteIndex(index)}
            >
              {messages.delete}
            </Button>
          </div>
        </div>
      ))}

      <div className='flex flex-col gap-2 justify-center items-center py-2'>
        <Button
          onClick={() => setOpenMultiTrigger(true)}
          variant='contained'
          color='primary'
        >
          {messages.Add_Multi_Trigger ?? 'Add Multi-Trigger'}
        </Button>
      </div>
    </>
  )
}

export default MultiTriggerControl
