	import React from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import Breadcrumbs from 'src/Components/breadcrumbs'

// MUI
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

function ProfilePage() {
	const { messages } = useIntl()
	const profile = useSelector(rx => rx.auth.data)

	return (
		<div>
			<Breadcrumbs routers={[{ name: messages.myProfile }]} isDashboard />
			<Grid container spacing={4}>
				<Grid item xs={12} md={4}>
					<Card>
						<Box sx={{ p: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
							<Avatar src={profile?.image_url || ''} alt={profile?.name} sx={{ width: 112, height: 112, mb: 2 }}>
								{!profile?.image_url && (profile?.name || '').slice(0, 2)}
							</Avatar>
							<Typography variant='h6' className='capitalize' sx={{ textAlign: 'center' }}>
								{profile?.name || '—'}
							</Typography>
							<Typography variant='body2' color='text.secondary' className='break-all' sx={{ textAlign: 'center' }}>
								{profile?.email || '—'}
							</Typography>
							{profile?.kind && (
								<Box sx={{ mt: 1 }}>
									<Chip size='small' color='primary' label={profile.kind} className='capitalize' />
								</Box>
							)}
							<Stack direction='row' spacing={2} sx={{ mt: 3 }}>
								<Button variant='contained' disableElevation>{messages.editProfile}</Button>
								<Button variant='outlined' color='secondary'>{messages.changeAvatar}</Button>
							</Stack>
						</Box>
					</Card>
				</Grid>
				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Typography variant='h6' sx={{ mb: 2 }}>{messages.profileDetails}</Typography>
							<List disablePadding>
								<ListItem divider>
									<ListItemText primary={messages.fullName} secondary={profile?.name || '—'} primaryTypographyProps={{ variant: 'overline', color: 'text.secondary' }} secondaryTypographyProps={{ className: 'capitalize' }} />
								</ListItem>
								<ListItem divider>
									<ListItemText primary={messages.email} secondary={profile?.email || '—'} primaryTypographyProps={{ variant: 'overline', color: 'text.secondary' }} secondaryTypographyProps={{ className: 'break-all' }} />
								</ListItem>
								<ListItem>
									<ListItemText primary={messages.role} secondary={profile?.kind || '—'} primaryTypographyProps={{ variant: 'overline', color: 'text.secondary' }} secondaryTypographyProps={{ className: 'capitalize' }} />
								</ListItem>
							</List>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</div>
	)
}

export default ProfilePage
