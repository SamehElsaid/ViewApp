import React from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { Avatar, Card, CardContent, Grid, Typography, Chip, Box, Divider, Button, Stack } from '@mui/material'
import ImageLoad from 'src/Components/ImageLoad'
import Icon from 'src/@core/components/icon'

export default function ProfilePage() {
  const { messages } = useIntl()
  const profile = useSelector(rx => rx.auth.data)

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ mb: 6, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 160,
            width: '100%',
            background:
              theme =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, mt: -8 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ width: 120, height: 120, border: theme => `4px solid ${theme.palette.background.paper}` }}>
                {profile?.image_url && profile.image_url !== '' ? (
                  <ImageLoad src={profile.image_url} alt={profile?.name} className='!w-full !h-full object-cover' />
                ) : (
                  <Typography variant='h4'>
                    {profile?.name ? profile.name.charAt(0) : ''}
                  </Typography>
                )}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  right: 6,
                  bottom: 6,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme => theme.palette.background.paper,
                  boxShadow: theme => theme.shadows[2]
                }}
                title='Change photo'
              >
                <Icon icon='tabler:camera' />
              </Box>
            </Box>

            <Box sx={{ minWidth: 220, flex: 1 }}>
              <Typography variant='h5' className='capitalize'>
                {profile?.name || messages?.profile || 'Profile'}
              </Typography>
              {profile?.email && (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {profile.email}
                </Typography>
              )}
              {profile?.role && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {(Array.isArray(profile.role) ? profile.role : [profile.role]).map((r, i) => (
                    <Chip key={i} size='small' label={r} color='primary' variant='tonal' />
                  ))}
                </Box>
              )}
            </Box>

            <Stack direction='row' spacing={2} sx={{ ml: 'auto' }}>
              <Button variant='contained' startIcon={<Icon icon='tabler:pencil' />}>Edit Profile</Button>
              <Button variant='tonal' color='secondary' startIcon={<Icon icon='tabler:lock' />}>Change Password</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>About</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ color: 'text.secondary' }}>Full Name</Typography>
                  <Typography>{profile?.name || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary' }}>Email</Typography>
                  <Typography>{profile?.email || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary' }}>Username</Typography>
                  <Typography>{profile?.preferred_username || profile?.username || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary' }}>Kind</Typography>
                  <Typography className='capitalize'>{profile?.kind || '-'}</Typography>
                </Box>
                {profile?.sub && (
                  <Box>
                    <Typography sx={{ color: 'text.secondary' }}>User ID</Typography>
                    <Typography sx={{ wordBreak: 'break-all' }}>{profile.sub}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {messages?.myProfile || 'Account Details'}
              </Typography>
              <Divider sx={{ mb: 4 }} />
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: 'text.secondary' }}>Primary Role</Typography>
                  <Typography>
                    {Array.isArray(profile?.role) ? profile.role[0] || '-' : profile?.role || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: 'text.secondary' }}>All Roles</Typography>
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(Array.isArray(profile?.role) ? profile.role : profile?.role ? [profile.role] : []).map((r, i) => (
                      <Chip key={i} size='small' label={r} variant='outlined' />
                    ))}
                    {(!profile?.role || (Array.isArray(profile?.role) && profile.role.length === 0)) && (
                      <Typography>-</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: 'text.secondary' }}>Display Name</Typography>
                  <Typography>{profile?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ color: 'text.secondary' }}>Email</Typography>
                  <Typography>{profile?.email || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}


