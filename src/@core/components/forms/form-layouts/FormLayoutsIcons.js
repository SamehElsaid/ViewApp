import Grid from '@mui/material/Grid'

import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

import CustomTextField from 'src/@core/components/mui/text-field'

import Icon from 'src/@core/components/icon'
import { toast } from 'react-toastify'
import { Typography } from '@mui/material'
import ScrollAnimation from 'src/Components/animation'
import { useIntl } from 'react-intl'
import { LoadingButton } from '@mui/lab'
import Animation from 'src/Components/animation/Animation'

const FormLayoutsIcons = ({ loading }) => {
  const { messages } = useIntl()

  return (
    <>
      <div className='text-center w-full md:w-[50%] m-auto'>
        <Typography variant='h4' sx={{ mb: 0.75 }} className='!mb-3'>
          <ScrollAnimation text={true}>{messages.contactUs}</ScrollAnimation>
        </Typography>
        <Typography variant='h4' sx={{ mb: 2.75 }} className='mb-2 text-center !text-sm'>
          <ScrollAnimation text={true}>{messages.contactUsMain}</ScrollAnimation>
        </Typography>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              toast.success('Your message has been added')
            }}
          >
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Animation direction={'right'} type={'fade'} loading={loading} duration={2000}>
                  <CustomTextField
                    fullWidth
                    label={messages.fullName}
                    placeholder={messages.yourName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon fontSize='1.5rem' icon='tabler:user' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Animation>
              </Grid>
              <Grid item xs={12}>
                <Animation direction={'left'} type={'fade'} loading={loading} duration={2000}>
                  <CustomTextField
                    fullWidth
                    type='email'
                    label={messages.email}
                    placeholder={messages.yourEmail}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon fontSize='1.5rem' icon='tabler:mail' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Animation>
              </Grid>
              <Grid item xs={12}>
                <Animation direction={'right'} type={'fade'} loading={loading} duration={2000}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    label={messages.phoneNo}
                    placeholder={messages.yourPhone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon fontSize='1.5rem' icon='tabler:phone' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Animation>
              </Grid>
              <Grid item xs={12}>
                <Animation direction={'left'} type={'fade'} loading={loading} duration={2000}>
                  <CustomTextField
                    className={`customField`}
                    fullWidth
                    multiline
                    minRows={3}
                    label={messages.message}
                    placeholder={messages.yourMessage}
                    sx={{ '& .MuiInputBase-root.MuiFilledInput-root': { alignItems: 'baseline' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon fontSize='1.5rem' icon='tabler:message' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Animation>
              </Grid>
              <Grid item xs={12}>
                <ScrollAnimation scale={true}>
                  <LoadingButton type='submit' variant='contained'>
                    {messages.sendMessage}
                  </LoadingButton>
                </ScrollAnimation>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </div>
    </>
  )
}

export default FormLayoutsIcons
