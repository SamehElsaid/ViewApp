import { Box, Chip, Container, Grid, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Link from 'next/link'
import React from 'react'
import { useIntl } from 'react-intl'
import { Icon } from '@iconify/react'

const motionSafe = {
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none !important',
    '&:hover': { transform: 'none !important' }
  }
}

function ActionTile({ href, icon, label, emphasized }) {
  return (
    <Paper
      component={Link}
      href={href}
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 148,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: t => alpha(t.palette.background.paper, 0.72),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: t =>
          t.transitions.create(['transform', 'box-shadow', 'border-color', 'background-color'], {
            duration: t.transitions.duration.shorter,
            easing: t.transitions.easing.easeOut
          }),
        ...(emphasized && {
          borderColor: t => alpha(t.palette.primary.main, 0.45),
          bgcolor: t => alpha(t.palette.primary.main, 0.06),
          boxShadow: t => `0 0 0 1px ${alpha(t.palette.primary.main, 0.12)}`
        }),
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: t => alpha(t.palette.primary.main, emphasized ? 0.1 : 0.07),
          boxShadow: t =>
            `0 16px 40px ${alpha(t.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(t.palette.primary.main, 0.2)}`,
          transform: 'translateY(-4px)'
        },
        '&:active': {
          transform: 'translateY(-1px)',
          boxShadow: t => `0 8px 20px ${alpha(t.palette.common.black, 0.06)}`
        },
        '&:focus-visible': {
          outline: t => `2px solid ${t.palette.primary.main}`,
          outlineOffset: 3
        },
        '&:hover .home-tile-icon': {
          bgcolor: t => alpha(t.palette.primary.main, 0.22),
          transform: 'scale(1.06)'
        },
        '&:hover .home-tile-arrow': {
          opacity: 1,
          color: 'primary.main'
        },
        ...motionSafe
      }}
    >
      <Box
        className='home-tile-icon'
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: t => alpha(t.palette.primary.main, 0.12),
          color: 'primary.main',
          transition: t =>
            t.transitions.create(['transform', 'background-color'], { duration: t.transitions.duration.shorter }),
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            transform: 'none !important'
          }
        }}
      >
        <Icon icon={icon} width={26} height={26} />
      </Box>
      <Typography
        variant='subtitle1'
        sx={{
          fontWeight: 600,
          lineHeight: 1.35,
          mt: 2,
          flex: 1,
          color: 'text.primary'
        }}
      >
        {label}
      </Typography>
      <Box
        className='home-tile-arrow'
        sx={{
          alignSelf: 'flex-end',
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          opacity: 0.55,
          transition: t => t.transitions.create(['opacity', 'color'], { duration: t.transitions.duration.shorter })
        }}
      >
        <Icon icon='tabler:arrow-up-right' width={20} height={20} />
      </Box>
    </Paper>
  )
}

function Index() {
  const { messages, locale } = useIntl()

  const profileHref = `/${locale}/setting/profile`
  const startHref = `/${locale}/start`
  const dashboardHref = `/${locale}/setting/data-source/collaction`

  return (
    <Box
      component='main'
      aria-label={messages?.home || 'Home'}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 'calc(100vh - 100px)', md: 'min(85vh, 720px)' },
        py: { xs: 5, md: 7 },
        px: { xs: 0, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'grey.50'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          borderRadius: '50%',
          top: { xs: -120, md: -80 },
          right: { xs: -100, md: -60 },
          background: t =>
            `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.22)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 320, md: 480 },
          height: { xs: 320, md: 480 },
          borderRadius: '50%',
          bottom: { xs: -140, md: -120 },
          left: { xs: -160, md: -100 },
          background: t =>
            `radial-gradient(circle, ${alpha(t.palette.primary.light, 0.2)} 0%, transparent 68%)`,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          backgroundImage: `radial-gradient(${alpha('#64748b', 0.15)} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
        <Chip
          label={messages?.home}
          size='small'
          color='primary'
          variant='outlined'
          sx={{
            mb: 2.5,
            fontWeight: 600,
            borderRadius: 2,
            borderWidth: 1.5
          }}
        />
        <Typography
          variant='h3'
          component='h1'
          sx={{
            fontWeight: 800,
            letterSpacing: { xs: -0.5, sm: -0.75 },
            color: 'text.primary',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
            lineHeight: 1.2,
            maxWidth: 720,
            mb: 2
          }}
        >
          {messages?.welcomeTitle}
        </Typography>
        <Typography
          variant='body1'
          sx={{
            color: 'text.secondary',
            lineHeight: 1.7,
            maxWidth: 520,
            mb: { xs: 4, md: 5 },
            fontSize: { sm: '1.0625rem' }
          }}
        >
          {messages?.welcomeSubtitle}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <ActionTile href={profileHref} icon='tabler:user' label={messages?.myProfile} />
          </Grid>
          {process.env.APP_TYPE !== "Form Builder" && (
          <Grid item xs={12} sm={4}>
            <ActionTile href={startHref} icon='tabler:rocket' label={messages?.getStarted} emphasized />
          </Grid>
          )}
          {process.env.APP_TYPE === "Form Builder" && (
            <Grid item xs={12} sm={4}>
              <ActionTile href={dashboardHref} icon='tabler:layout-dashboard' label={messages?.goToDashboard} />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

export default Index
