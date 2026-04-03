import { Button } from '@mui/material'
import { useState } from 'react'
import DeletePopUp from 'src/Components/DeletePopUp'

function TriggerControl({ roles, setOpenTrigger, messages, data, onChange, open, objectToCss, Css, type }) {
  const [openDelete, setOpenDelete] = useState(false)
  
  const findWithRowId =
    roles?.triggerRow?.rowId &&
    open.rowId &&
    roles?.triggerRow?.rowId === open.rowId
  const triggerProperty = type === 'column' ? 'triggerColumn' : findWithRowId ? 'triggerRow' : 'trigger'
  const currentTrigger = type === 'column' ? roles?.triggerColumn : findWithRowId ? roles?.triggerRow : roles?.trigger



  const deleteTrigger = () => {
    const sendData = {
      selectedField: null,
      triggerKey: null,
      typeOfValidation: null,
      isEqual: 'equal',
      currentField: 'id'
    }

    const additional_fields = data.additional_fields ?? []
    const findMyInput = additional_fields.find(inp => inp.key === open.id)
    if (findMyInput) {
      findMyInput.roles[triggerProperty] = sendData
    } else {
      const myEdit = {
        key: open.id,
        design: objectToCss(Css).replaceAll('NaN', ''),
        roles: {
          ...roles,
          [triggerProperty]: sendData
        }
      }
      additional_fields.push(myEdit)
    }
    onChange({ ...data, additional_fields: additional_fields })
    setOpenDelete(false)
  }




  return (
    <>
      <DeletePopUp handleDelete={deleteTrigger} open={openDelete} setOpen={setOpenDelete} />
      {currentTrigger?.selectedField && (
        <div className='capitalize rounded-md p-2 border border-main-color border-dashed m-3'>
          <div className='  py-2 '>
            <>
              <span className=' text-main-color'>{messages.Input_Field}</span> : {currentTrigger?.selectedField}
              <br />
            </>
            {currentTrigger?.typeOfValidation && (
              <>
                <span className=' text-main-color'>{messages.Type_Of_Validation}</span> :{' '}
                {messages[currentTrigger?.typeOfValidation]}
                <br />
              </>
            )}
            {currentTrigger?.parentKey && (
              <>
                <span className=' text-main-color'>{messages.Key}</span> : {currentTrigger?.triggerKey}
                <br />
              </>
            )}
            {currentTrigger?.isEqual && (
              <>
                <span className=' text-main-color'>{messages.when}</span> :{' '}
                {currentTrigger?.isEqual === 'equal' ? messages.Equal : messages.Not_Equal}
                <br />
              </>
            )}
            {currentTrigger?.mainValue && (
              <>
                <span className=' text-main-color'>{messages.Value}</span> : {currentTrigger?.mainValue}
                <br />
              </>
            )}
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setOpenDelete(true)
              }}
            >
              {messages.delete}
            </Button>
          </div>
        </div>
      )}
      <div className=''>
        <div className='flex flex-col gap-2 justify-center items-center py-2 '>
          <Button
            onClick={() => {
              setOpenTrigger(true)
            }}
            variant='contained'
            color='primary'
          >
            {messages.Add_Trigger}
          </Button>
        </div>
      </div>
    </>
  )
}

export default TriggerControl
