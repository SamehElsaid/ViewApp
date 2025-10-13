import { IconButton } from '@mui/material'
import React from 'react'
import { UnmountClosed } from 'react-collapse'
import IconifyIcon from 'src/Components/icon'

function SwitchView({ title, children, show, setShow }) {
  return (
    <div className='border-2 mt-2 border-main-color  rounded-md '>
      <h2
        onClick={() => setShow(!show)}
        className='text-lg font-bold bg-main-color cursor-pointer select-none text-white py-1 text-center px-2 flex items-center justify-between'
      >
        <IconButton>
          <IconifyIcon className='text-white opacity-0' icon={show ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
        </IconButton>
        {title}
        <IconButton>
          <IconifyIcon className='text-white' icon={show ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
        </IconButton>
      </h2>

      <UnmountClosed isOpened={Boolean(show)}>{children}</UnmountClosed>
    </div>
  )
}

export default SwitchView
