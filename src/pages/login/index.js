// ** React Imports
import * as cookie from 'cookie'
import { useEffect } from 'react'
import LoadingMain from 'src/Components/LoadingMain'
import { sendOAuthRequest } from 'src/services/AuthService'

const LoginPage = () => {


  useEffect(()=>{
    sendOAuthRequest()
  },[])


  return (
    <>
      <LoadingMain login={true} />
    </>
  )
}

export default LoginPage

export async function getServerSideProps(context) {
  const reqCookies = context.req.headers.cookie
  const cookies = reqCookies ? cookie.parse(reqCookies) : {}
  if (cookies.sub) {
    return {
      redirect: {
        destination: `/${context.locale}/oauth/callback`,
        permanent: false
      }
    }
  } else {
    return {
      props: {
        int: []
      }
    }
  }
}
