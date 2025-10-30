// ** React Imports
import * as cookie from 'cookie'
import { useEffect } from 'react'
import FallbackSpinner from 'src/@core/components/spinner'
import LoadingMain from 'src/Components/LoadingMain'
import { sendOAuthRequest } from 'src/services/AuthService'

const LoginPage = () => {

  useEffect(() => {
    sendOAuthRequest()
  }, [])

  return (
    <>
      <LoadingMain login={true} />
    </>
  )
}

export default LoginPage
