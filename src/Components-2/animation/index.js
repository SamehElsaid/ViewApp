import   { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useSelector } from 'react-redux'

const ScrollAnimation = ({ children, type, text, scale }) => {
  const [hasAnimated, setHasAnimated] = useState(false)
  const { ref, inView } = useInView()
  const [animateIn, setAnimateIn] = useState()
  const [animateOut, setanimateOut] = useState()
  const loading = useSelector(rx => rx.LoadingHome.data)
  useEffect(() => {
    if (type === 'top' || type === 'down') {
      setAnimateIn({
        opacity: 1,
        y: 0,
        transition: { duration: 1 }
      })
    } else {
      setAnimateIn({
        opacity: 1,
        x: 0,
        transition: { duration: 1 }
      })
    }
    if (type === 'top') {
      setanimateOut({
        opacity: 0,
        y: 500
      })
    }
    if (type === 'down') {
      setanimateOut({
        opacity: 0,
        y: -500
      })
    }
    if (type === 'left') {
      setanimateOut({
        opacity: 0,
        x: -500
      })
    }
    if (type === 'right') {
      setanimateOut({
        opacity: 0,
        x: 500
      })
    }
  }, [type])

  if (inView && !hasAnimated) {
    setHasAnimated(true)
  }

  if (text) {
    return (
      <motion.div ref={ref}>
        {children.split('').map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={loading && hasAnimated ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.05, delay: index * 0.02 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    )
  }
  if (scale) {
    return (
      <div ref={ref}>
        <motion.div
          initial={{ scale: 0 }}
          animate={
            loading && hasAnimated
              ? {
                  scale: 1,
                  transition: { duration: 1 }
                }
              : {
                  scale: 0,
                  transition: { duration: 1 }
                }
          }
        >
          {children}
        </motion.div>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0 }} animate={loading && hasAnimated ? animateIn : animateOut}>
        {children}
      </motion.div>
    </div>
  )
}

export default ScrollAnimation
