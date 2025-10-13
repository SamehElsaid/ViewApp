// ** MUI Imports
import Box from '@mui/material/Box'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Custom Component Imports
import CustomInput from './PickersCustomInput'

const PickersTime = ({ popperPlacement, onChange, value }) => {
  // ** States

  return (
    <Box className=' w-full'>
      <DatePicker
        showTimeSelect
        selected={value}
        timeIntervals={15}
        className='w-full'
        showTimeSelectOnly
        dateFormat='HH:mm:ss'
        id='time-only-picker'
        popperPlacement={popperPlacement}
        timeFormat='HH:mm:ss'
        onChange={date => {
          onChange(date)
        }}
        customInput={<CustomInput fullWidth label='Time' />}
      />
    </Box>
  )
}

export default PickersTime
