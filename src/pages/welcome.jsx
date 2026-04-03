import { Button, Card, CardContent, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from 'next/link'
import { useIntl } from 'react-intl'

export default function WelcomePage() {
  const { messages, locale } = useIntl()

  return (
    <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <Card sx={{ maxWidth: 720, width: '100%', p: { xs: 2, md: 4 } }}>
        <CardContent>
          <Typography variant='h4' sx={{ fontWeight: 700, mb: 2 }}>
            {messages?.welcomeTitle || 'Welcome to SingleClic Low-Code'}
          </Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary', mb: 4 }}>
            {messages?.welcomeSubtitle || 'Build forms and pages quickly with the visual builder and triggers.'}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button
              component={Link}
              href={`/${locale}/setting/profile`}
              variant='contained'
              color='primary'
            >
              {messages?.myProfile || 'My Profile'}
            </Button>
            <Button component={Link} href={`/${locale}/setting/data-source/collaction`} variant='outlined'>
              {messages?.getStarted || 'Get Started'}
            </Button>
            <Button component={Link} href={`/${locale}/dashboard`} variant='text'>
              {messages?.goToDashboard || 'Go to Dashboard'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}


