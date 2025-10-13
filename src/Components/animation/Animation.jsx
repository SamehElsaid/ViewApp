import { Typography } from '@mui/material'
import   { useEffect, useState } from 'react'
import { Zoom, Fade } from 'react-awesome-reveal'

// import VizSensor from 'react-visibility-sensor' // or use any other 3rd party plugin or define your own

function Animation({ children, duration, direction, type, delay, loading }) {
  return (
    <>
      {type === 'fade' && (
        <Fade triggerOnce key={loading} direction={direction} delay={delay ? delay : 0} duration={duration}>
          {children}
        </Fade>
      )}
      {type === 'zoom' && (
        <Zoom triggerOnce key={loading} direction={direction} delay={delay ? delay : 0} duration={duration}>
          {children}
        </Zoom>
      )}
    </>
  )
}

export default Animation
