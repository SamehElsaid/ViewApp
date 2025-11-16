// ** React Imports
import { useState, Fragment, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useDispatch, useSelector } from 'react-redux'
import { useCookies } from 'react-cookie'
import { REMOVE_USER } from 'src/store/apps/authSlice/authSlice'
import Link from 'next/link'

import { axiosPost } from 'src/Components/axiosCall'
import Cookies from 'js-cookie'
import { decryptData } from 'src/Components/encryption'
import { useTheme } from '@mui/system'
import { useIntl } from 'react-intl'
import { Skeleton } from '@mui/material'
import { usePathname } from 'next/navigation'
import ImageLoad from 'src/Components/ImageLoad'
import { SET_ACTIVE_LOADING, SET_STOP_LOADING } from 'src/store/apps/LoadingMainSlice/LoadingMainSlice'
import { logout } from 'src/services/AuthService'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = props => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState(null)

  // ** Hooks
  const router = useRouter()

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }
  const { messages } = useIntl()
  const profile = useSelector(rx => rx.auth.data)

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }
  const [_, __, removeCookie] = useCookies(['sub'])
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(SET_ACTIVE_LOADING())

    handleDropdownClose('/')
    const authToken = Cookies.get('sub')
    axiosPost('auth/logout/', locale, { token: decryptData(authToken).token })
      .then(res => {
        if (res.status) {
          removeCookie('sub', { path: '/' })
          dispatch(REMOVE_USER())
        }
      })
      .finally(_ => {
        dispatch(SET_STOP_LOADING())
      })
  }

  const { locale, push } = useRouter()
  const patch = usePathname()
  const theme = useTheme()
  useEffect(() => {
    setAnchorEl(null)
  }, [patch])

  return (
    <>
      {profile ? (
        <Fragment>
          <Badge
            overlap='circular'
            onClick={handleDropdownOpen}
            sx={{ ml: 2, cursor: 'pointer' }}
            badgeContent={<BadgeContentSpan />}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
          >
            <div className='w-[38px] || relative || h-[38px] || rounded-full'>
              <div className='absolute inset-0 || SkeletonBtn '>
                <Skeleton variant='circular' width={38} height={38} />
              </div>

              <Avatar
                alt={profile?.name}
                className='capitalize'
                onClick={handleDropdownOpen}
                sx={{ width: 38, height: 38 }}
                src={profile?.image_url}
                onLoad={e => {
                  e.target.parentElement.parentElement.querySelector('.SkeletonBtn').style.opacity = '0'
                }}
              >
                {profile?.image_url && profile?.image_url !== '' ? (
                  <></>
                ) : (
                  <>
                    {profile?.name?.charAt(0)} {profile?.name?.charAt(1)}
                  </>
                )}
              </Avatar>
            </div>
          </Badge>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleDropdownClose()}
            sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
          >
            <Box sx={{ py: 1.75, px: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge
                  overlap='circular'
                  badgeContent={<BadgeContentSpan />}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                >
                  <Avatar
                    alt={profile?.name}
                    className='capitalize'
                    onClick={handleDropdownOpen}
                    sx={{ width: 38, height: 38 }}
                  >
                    {profile?.image_url && profile?.image_url !== '' ? (
                      <ImageLoad
                        src={profile?.image_url}
                        alt={profile?.name}
                        className='!w-full object-cover rounded-full'
                      />
                    ) : (
                      <>
                        {profile?.name?.charAt(0)} {profile?.name?.charAt(1)}
                      </>
                    )}
                  </Avatar>
                </Badge>
                <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <Typography className='uppercase' sx={{ fontWeight: 500, maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {profile?.name}
                  </Typography>
                  <Typography className='capitalize' variant='body2' sx={{ maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {profile?.kind && profile?.kind}
                  </Typography>
                </Box>
              </Box>
              </Box>
              
              <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
              <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
                <Box component={Link} href={`/${locale}/setting/profile`} sx={styles}>
                  <Icon icon='tabler:user-check' />
                  {messages.myProfile}
                </Box>
              </MenuItemStyled>


              <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
              <MenuItemStyled sx={{ p: 0 }} onClick={logout}>
                <Box sx={styles}>
                  <Icon icon='tabler:logout' />
                  {messages.signOut}
                </Box>
              </MenuItemStyled>
          </Menu>
        </Fragment>
      ) : (
        <div className='flex || items-center || gap-1'>
          <Typography
            variant='h6'
            noWrap
            component={Link}
            href={`/${locale}/login`}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              color: 'inherit',
              textDecoration: 'none'
            }}
            className='hover:!text-main-color duration-300'
          >
            {messages.login}
          </Typography>
        </div>
      )}
    </>
  )
}

export default UserDropdown
