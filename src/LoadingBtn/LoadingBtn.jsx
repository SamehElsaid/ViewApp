import { LoadingButton } from '@mui/lab'
import { styled, keyframes } from '@mui/material/styles'
import photo from 'src/Components/img/photo-unscreen.gif'

export default function LoadingBtn({ children, ...props }) {
  return (
    <LoadingButton
      {...props}
      loadingIndicator={
        <img
          src={photo.src}
          alt='loading'
          className='w-[25px] h-[25px] scale-150 '
        />
      }
    >
      {children}
    </LoadingButton>
  )
}
