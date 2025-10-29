/* eslint-disable react-hooks/exhaustive-deps */
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useSettings } from './useSettings'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { SET_ACTIVE_LOADING } from 'src/store/apps/LoadingMainSlice/LoadingMainSlice'
import { REMOVE_USER, SET_ACTIVE_USER } from 'src/store/apps/authSlice/authSlice'
import { getUser } from 'src/services/AuthService'
import { useRouter } from 'next/router'

function useInitialization() {
  const theme = useTheme()
  const { settings, saveSettings } = useSettings()
  const [cookies, _, removeCookie] = useCookies(['sub'])
  const dispatch = useDispatch()
  const [login, setLogin] = useState(true)
  const { locale } = useIntl()
  const router = useRouter()
  useEffect(() => {
    const userFind = async () => {
      const user = await getUser()
      console.log(user)
      if (!user) {
        removeCookie('sub', { path: '/' })
        dispatch(REMOVE_USER())
        setLogin(false)
        router.push('/login')

        return
      }

      dispatch(SET_ACTIVE_USER(user.profile))
      setTimeout(() => {
        dispatch(SET_ACTIVE_LOADING())
        setLogin(false)
      }, 2000)
    }
    userFind()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('rtl', locale === 'ar')
  }, [])

  useEffect(() => {
    const handleThemeChange = () => {
      document.body.classList.toggle('dark-mode', theme.palette.mode === 'dark')
    }

    handleThemeChange()

    return () => {
      handleThemeChange()
    }
  }, [theme.palette.mode])
  useEffect(() => {
    if (cookies.mode) {
      const time = setTimeout(() => {
        saveSettings({ ...settings, mode: cookies.mode })
      }, 500)

      return () => clearTimeout(time)
    }
  }, [cookies.mode])

  useEffect(() => {
    // localStorage.clear('settings')
  }, [])

  return { login }
}

export default useInitialization
