import { forwardRef } from 'react'
import { FaCalendarAlt, FaClock } from 'react-icons/fa'

const ExampleCustomInput = forwardRef(({ value, onClick, input, disabled, type }, ref) => {
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
    <div className='relative w-full' style={{ position: 'relative' }}>
      <input
        placeholder={label?.format}
        className='!ps-[35px] !pe-[40px] relative bg-white'
        onClick={onClick}
        ref={ref}
        readOnly
        value={value}
        disabled={disabled}
      />
      <div className='absolute top-0 start-[10px] w-[20px] h-full flex items-center justify-center z-10'>
        <span id='calendar-icon'>
          {type !== 'time' ? <FaCalendarAlt className='text-xl' /> : <FaClock className='text-xl' />}
        </span>
      </div>
    </div>
  )
})

export default ExampleCustomInput
