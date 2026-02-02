
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from 'next/link'
import { useIntl } from 'react-intl'

export default function DashboardPage() {
  const { messages, locale } = useIntl()

  const safeText = (maybe, fallback) => (typeof maybe === 'string' ? maybe : fallback)

  const stats = [
    { label: 'Total Forms', value: 128 },
    { label: 'Submissions', value: 5234 },
    { label: 'Active Users', value: 87 },
    { label: 'Errors', value: 3 }
  ]

  const chartData = [12, 19, 7, 14, 23, 18, 25]

  return (
    <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <Card sx={{ maxWidth: 1024, width: '100%', p: { xs: 2, md: 4 } }}>
        <CardContent>
          <Typography variant='h4' sx={{ fontWeight: 700, mb: 2 }}>
            {safeText(messages?.dashboard, 'Dashboard')}
          </Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary', mb: 4 }}>
            {safeText(messages?.dashboardSubtitle, 'Quick links to get started.')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {stats.map((s, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' color='text.secondary'>
                      {s.label}
                    </Typography>
                    <Typography variant='h5' sx={{ fontWeight: 700 }}>
                      {s.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card variant='outlined' sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                {safeText(messages?.weeklyActivity, 'Weekly Activity')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 160 }}>
                {chartData.map((v, i) => (
                  <Box key={i} sx={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <Box sx={{ width: '100%', backgroundColor: 'primary.main', opacity: 0.2, height: `${v * 4}px`, borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button component={Link} href={`/${locale}/setting/profile`} variant='contained' color='primary'>
              {messages?.myProfile || 'My Profile'}
            </Button>
            <Button component={Link} href={`/${locale}/setting/data-source/collaction`} variant='outlined'>
              {messages?.getStarted || 'Get Started'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}


