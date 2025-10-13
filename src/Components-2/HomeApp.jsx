/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import axios from 'axios'
import { toast } from 'react-toastify'
import { REMOVE_USER, SET_ACTIVE_USER } from 'src/store/apps/authSlice/authSlice'
import { axiosGet, axiosPost } from './axiosCall'
import { useSettings } from 'src/@core/hooks/useSettings'
import { SET_ACTIVE_LOADING } from 'src/store/apps/LoadingMainSlice/LoadingMainSlice'
import LoadingMain from './LoadingMain'
import Cookies from 'js-cookie'
import { decryptData } from './encryption'
import { getUser } from 'src/services/AuthService'

function HomeApp({ children }) {
  const [login, setLogin] = useState(true)
  const dispatch = useDispatch()
  const router = useRouter()
  const { locale } = useRouter()
  const patch = usePathname()
  const theme = useTheme()
  const { settings, saveSettings } = useSettings()
  const [cookies, _, removeCookie] = useCookies(['sub'])

  useEffect(() => {
    if (cookies.sub) {
      const userData = {
        image_url: 'https://via.placeholder.com/150',
        first_name: 'John',
        last_name: 'Doe'
      }
      dispatch(SET_ACTIVE_USER(userData))
      setTimeout(() => {
        setLogin(false)
        dispatch(SET_ACTIVE_LOADING())
      }, 2000)
    } else {
      dispatch(REMOVE_USER())

      const time = setTimeout(() => {
        setLogin(false)
        dispatch(SET_ACTIVE_LOADING())
      }, 2000)

      return () => clearTimeout(time)
    }
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
    // axios.interceptors.response.use(
    //   function (response) {
    //     console.log(response.data)
    //     handleErrorResponse(response.data, response.status)
    //     return response
    //   },
    //   function (error) {
    //     console.log(response.data)
    //     handleErrorResponse(error.response?.data, error.response.status)
    //     return Promise.reject(error)
    //   }
    // )
  }, [])

  useEffect(() => {
    document.body.classList.toggle('rtl', locale === 'ar')
  }, [locale])

  const handleErrorResponse = (data, status) => {
    if (!data?.status) {
      if (typeof data.message === 'string') {
        if (status === 401) {
          removeCookie('sub', { path: '/' })
          dispatch(REMOVE_USER())
        } else {
          toast.error(data.message)
        }

        return
      }

      for (const key in data.message) {
        const messages = data.message[key]
        if (Array.isArray(messages)) {
          messages.forEach(message => toast.error(message))
        } else {
          toast.error(messages)
        }
      }
    }
  }

  useEffect(() => {
    //     async function name(params) {
    //       const user = await getUser();
    //       console.log(user);
    //     }
    // //
    // name()
    // router.push(`/${locale}/login`)
    // removeCookie("sub", { path: "/" })
    // localStorage.clear()
  }, [])

  return <>{patch ? <>{'/' + patch.split('/')[1] === '/setting' && login ? null : children}</> : null}</>
}

export default HomeApp
