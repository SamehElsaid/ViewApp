// ** MUI Imports
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import Icon from 'src/@core/components/icon'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'

const AppBarContent = props => {
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const patch = usePathname()
  const { messages } = useIntl()
  const { locale } = useRouter()

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <UserDropdown settings={settings} />
      </Box>
      <div className='flex  || gap-3 w-full || items-center || justify-between'>
        <div className='flex || gap-1 || items-center'>
          <ModeToggler settings={settings} saveSettings={saveSettings} />
          <div className='flex ~~ items-center ~~ justify-center ~~ me-3'>
            <IconButton
              color='inherit'
              className='w-[42px] h-[42px]'
              onClick={() => {
                const newDirection = locale !== 'ar' ? 'rtl' : 'ltr'
                saveSettings({ ...settings, direction: newDirection })
                window.location.assign(
                  `${location.origin}/${locale === 'ar' ? 'en' : 'ar'}/${patch}/${location.search}`
                )
              }}
            >
              {locale !== 'ar' ? (
                <div className='text-lg w-[42px] h-[42px] flex items-center justify-center Cairo'>
                  <span className='-mt-1 w-[42px] h-[42px] flex ~~ items-center justify-center'>ع</span>
                </div>
              ) : (
                <div className='text-lg w-[42px] h-[42px] flex items-center justify-center'>
                  <span className='w-[42px] h-[42px] flex ~~ items-center justify-center'>EN</span>
                </div>
              )}
            </IconButton>
          </div>
          {hidden ? (
            <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              {patch === '/login' || patch === '/register' ? null : (
                <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
                  <Icon fontSize='1.5rem' icon='tabler:menu-2' />
                </IconButton>
              )}
            </Box>
          ) : null}
        </div>
        <div>
          <Typography
            variant='h4'
            noWrap
            className='flex'
            component={Link}
            href='/'
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            {/* {messages.logo} */}
            <img src={'./images/logo.png'} alt='logo' style={{ height: '50px' }} />
          </Typography>
        </div>

        <div></div>
      </div>
    </Box>
  )
}

export default AppBarContent
