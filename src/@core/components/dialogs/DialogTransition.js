import { forwardRef, Fragment, useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Slide from '@mui/material/Slide'
import CardActivityTimeline from 'src/Components/advanced/CardActivityTimeline'
import { axiosGet } from 'src/Components/axiosCall'
import { useRouter } from 'next/router'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

const DialogTransition = ({ handleClose, open }) => {
  // ** State
  const [data, setData] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const { locale } = useRouter()
  useEffect(() => {
    if (open) {
      axiosGet('goal/challenges/' + open + '/', locale).then(res => {
        if (res.results) {
          setData(res.results)
          setLoadingData(false)
        }
      })
    } else {
      setData([])
      setLoadingData(true)
    }
  }, [open, locale])

  return (
    <Fragment>
      <Dialog
        open={Boolean(open)}
        keepMounted
        onClose={handleClose}
        className='brief'
        TransitionComponent={Transition}
        aria-labelledby='alert-dialog-slide-title'
        aria-describedby='alert-dialog-slide-description'
      >
        <DialogContent sx={{ p: '0 !important' }}>
          <CardActivityTimeline loadingData={loadingData} data={data} />
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default DialogTransition
