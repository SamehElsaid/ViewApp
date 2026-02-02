// pages/index.js
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import * as cookie from 'cookie'
import { decryptData } from 'src/Components/encryption'
import axios from 'axios'
import https from 'https'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { createTheme, ThemeProvider } from '@mui/material/styles'

let ReactPageEditor = dynamic(
  () =>
    import('src/Components/Pages/ReactPageEditor').then(e => {
      return e
    }),
  {
    ssr: false
  }
)

const Index = ({ pageName, initialData, initialDataApi, workflowId }) => {
  const loading = useSelector(rx => rx.LoadingPages.loading)
  
  const { messages } = useIntl()

  useEffect(() => {

    return () => {
      document.body.classList.remove('edit-mode')
    }
  }, [])



  const lightTheme = createTheme({
    palette: {
      mode: 'light'
    }
  })

  return (
    <ThemeProvider theme={lightTheme}>
    <div className=''>
      <div className='py-10 min-h-screen bg-white main-container'>
        {loading && (
          <div className='h-[calc(100vh)] loading-animation flex flex-col justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-white z-[111111111]'>
            <div className='modelViewPort'>
              <div className='eva'>
                <div className='head'>
                  <div className='eyeChamber'>
                    <div className='eye' />
                    <div className='eye' />
                  </div>
                </div>
                <div className='body'>
                  <div className='hand' />
                  <div className='hand' />
                  <div className='scannerThing' />
                  <div className='scannerOrigin' />
                </div>
              </div>
            </div>
            <div className='mt-4 text-2xl font-bold animate-pulse'>
              {messages.dialogs.loading}
            </div>
          </div>
        )}
        <ReactPageEditor
          pageName={pageName}
          initialData={initialData}
          initialDataApi={initialDataApi}
          workflowId={workflowId}
        />
      </div>
    </div>
    </ThemeProvider>
  )
}

export default Index

Index.getLayout = page => <BlankLayout>{page}</BlankLayout>

export async function getServerSideProps(context) {
  const pageName = context.query.pages
  const authToken = context.req.headers.cookie
  const cookies = authToken ? cookie.parse(authToken) : false

  const headers = {
    Authorization: `Bearer ${cookies.sub ? decryptData(cookies.sub).token : ''}`,
    'Accept-Language': context.locale
  }
  const apiUrl = `${process.env.API_URL}/page/get-latest-version/${pageName}/`
  const httpsAgent = new https.Agent({ rejectUnauthorized: false })
  try {
    const [response] = await Promise.all([axios.get(apiUrl, { headers, httpsAgent })])
    const data = JSON.parse(response?.data?.jsonData) ?? null
    const initialData = data?.editorValue ?? null
    const initialDataApi = data?.apiData ?? null
    const workflowId = data?.workflowId ?? ''

    return {
      props: {
        pageName,
        initialData,
        initialDataApi,
        workflowId
      }
    }
  } catch (error) {
    return {
      notFound: true
    }
  }
}
