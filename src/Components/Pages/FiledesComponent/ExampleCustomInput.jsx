import { forwardRef } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'

const ExampleCustomInput = forwardRef(({ value, onClick, input }, ref) => {
  let label

  try {
    label = JSON.parse(input?.descriptionEn) ?? {
      format: 'mm-dd-yyyy',
      showTime: 'false'
    }
  } catch {
    label = { format: 'mm-dd-yyyy', showTime: 'false' }
  }


  return (
    <div className='relative w-full'>
      <input
        placeholder={label?.format}
        className='!ps-[35px] relative'
        onClick={onClick}
        ref={ref}
        readOnly
        value={value}
      />
      <div className='absolute top-0 start-[10px] w-[20px] h-full flex items-center justify-center z-10'>
        <span id='calendar-icon'>
          <FaCalendarAlt className='text-xl' />
        </span>
      </div>
    </div>
  )
})

export default ExampleCustomInput
