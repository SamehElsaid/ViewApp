/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import LoadingMain from './LoadingMain'
import useInitialization from 'src/@core/hooks/useInitialization'
import useTriggerError from 'src/@core/hooks/useTriggerError'

function HomeApp({ children }) {
  const router = useRouter()
  const { locale } = useRouter()
  const patch = usePathname()
  const user = useSelector(rx => rx.auth.loading)

  // Hooks
  const { login } = useInitialization()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
  }, [])

  useTriggerError()

  useEffect(() => {
    if (patch && '/' + patch.split('/')[1] === '/' && user !== 'loading' && user === 'no') {
      router.push(`/${locale}/login`)
    }
  }, [locale, router, user, patch])
  console.log(patch, 'patch', user)
  if (patch && patch === '/' && user !== 'loading' && user === 'no') {
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
