// ** React Imports
import * as cookie from 'cookie'
import { useEffect } from 'react'
import FallbackSpinner from 'src/@core/components/spinner'
import { sendOAuthRequest } from 'src/services/AuthService'

const LoginPage = () => {

  console.log("here");

  useEffect(()=>{
    sendOAuthRequest()
  },[])


  return (
    <>
      <FallbackSpinner />
    </>
  )
}

export default LoginPage
