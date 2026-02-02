/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import LoadingMain from './LoadingMain'
import useInitialization from 'src/@core/hooks/useInitialization'
import useTriggerError from 'src/@core/hooks/useTriggerError'
import { toast } from 'react-toastify'
import { useSettings } from 'src/@core/hooks/useSettings'

function HomeApp({ children }) {
  const router = useRouter()
  const { locale } = useRouter()
  const patch = usePathname()
  const user = useSelector(rx => rx.auth.loading)


  const { login } = useInitialization()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
  }, [])

  useTriggerError()

  useEffect(() => {
    if (patch && '/' + patch.split('/')[1] === '/setting' && user !== 'loading' && user === 'no') {
      router.push(`/${locale}/`)

      const inter = setTimeout(() => {
        toast.error('You are not authorized to access this page')
      }, 0)

      return () => clearTimeout(inter)
    }
  }, [locale, router, user, patch])
  if (patch && '/' + patch.split('/')[1] === '/' && user !== 'loading' && user === 'no') {
    router.push(`/${locale}/login`)
    
    return <LoadingMain login={true} />
  }
  if (patch && '/' + patch.split('/')[1] === '/setting' && user !== 'loading' && user === 'no') {
    return <LoadingMain login={true} />
  }

  return (
    <>
      <LoadingMain login={login} />

      {patch ? <>{'/' + patch.split('/')[1] === '/setting' && login ? null : loading ? children : null}</> : null}
    </>
  )
}

export default HomeApp
