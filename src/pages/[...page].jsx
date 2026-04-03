// pages/index.js
import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import * as cookie from 'cookie'
import { decryptData } from 'src/Components/encryption'
import axios from 'axios'
import https from 'https'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useReactToPrint } from 'react-to-print'
import LoadingMain from 'src/Components/LoadingMain'
import { useRouter } from 'next/router'

let ReactPageEditor = dynamic(
  () =>
    import('src/Components/Pages/ReactPageEditor').then(e => {
      return e
    }),
  {
    ssr: false
  }
)

const Index = ({ pageName, initialData, initialDataApi, workflowId, pageRoles, pageTypeId,
  initialLayout,
  layOutInitialData,
  entitiesId,
  collectionName,
  layOutInitialDataApi,
  layOutWorkflowId,
  layOutPageRoles,
  layOutPageTypeId,
  isPrint }) => {
  const loading = useSelector(rx => rx.LoadingPages.loading)
  const [editorValue, setEditorValue] = useState(null)
  const [readOnly, setReadOnly] = useState(isPrint ? true : false)
  const refPdf = useRef()
  const [startPrint, setStartPrint] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const router = useRouter()
  const user = useSelector(rx => rx.auth.data)



  const handlePrint = useReactToPrint({
    contentRef: refPdf, documentTitle: pageName, bodyClass: 'print-body', pageStyle: `@media print {
    
    }`,

  })


  useEffect(() => {
    if (!user) return

    if (pageRoles.length === 0) {
      setLoadingPage(false)

      return
    }

    const userRoles = Array.isArray(user.role_id)
      ? user.role_id
      : [user.role_id]

    const hasAccess = userRoles.some(role =>
      pageRoles.includes(role)
    )

    if (!hasAccess) {
      router.push('/404')
    } else {
      setLoadingPage(false)
    }
  }, [pageRoles, user, router])





  const { messages } = useIntl()

  useEffect(() => {

    return () => {
      document.body.classList.remove('edit-mode')
    }
  }, [])

  useEffect(() => {
    // Reset local page state when route param (page) changes.
    setEditorValue(null)
    setReadOnly(isPrint ? true : false)
  }, [pageName, isPrint])



 

  return (
    <div className=''>
      <div className={`bg-white min-h-[100dvh] ${(loading || loadingPage) ? 'overflow-y-hidden' : ''}`}>
        {(loading || loadingPage) && <LoadingMain login={true} />}
        <div className="parent-print" ref={refPdf} >
          <div className='py-10 min-h-screen bg-white main-container'>
            {/* <div className="fixed h-36 bg-red-200 z-50 top-0 left-0 right-0"></div> */}
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


            {(initialLayout && readOnly) ? <>


              <ReactPageEditor
                key={`layout-${initialLayout}-${pageName}`}
                pageName={initialLayout}
                initialData={layOutInitialData}
                initialDataApi={layOutInitialDataApi}
                workflowId={layOutWorkflowId}
                pageRoles={layOutPageRoles}
                pageTypeId={layOutPageTypeId}
                readOnly={readOnly}
                isPrint={isPrint}
                setReadOnly={setReadOnly}
                handlePrint={handlePrint}
                startPrint={startPrint}
                type='all-pages'
                entitiesId={entitiesId}
                collectionName={collectionName}
              >

                <ReactPageEditor
                  key={`content-${pageName}`}
                  pageName={pageName}
                  initialData={editorValue || initialData}
                  initialDataApi={initialDataApi}
                  workflowId={workflowId}
                  pageRoles={pageRoles}
                  pageTypeId={pageTypeId}
                  readOnly={readOnly}
                  setReadOnly={setReadOnly}
                  isPrint={isPrint}
                  initialLayout={initialLayout}
                  handlePrint={handlePrint}
                  hiddenPrintBtn={true}
                  startPrint={startPrint}
                  type='all-pages'
                  entitiesId={entitiesId}
                  collectionName={collectionName}
                />
              </ReactPageEditor>

            </> :
              <ReactPageEditor
                key={`single-${pageName}`}
                pageName={pageName}
                initialData={editorValue || initialData}
                setEditorValueNewData={setEditorValue}
                initialDataApi={initialDataApi}
                workflowId={workflowId}
                pageRoles={pageRoles}
                pageTypeId={pageTypeId}
                readOnly={readOnly}
                isPrint={isPrint}
                setReadOnly={setReadOnly}
                handlePrint={handlePrint}
                startPrint={startPrint}
                printName={initialLayout}
                type='all-pages'
                entitiesId={entitiesId}
                collectionName={collectionName}
              />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index

Index.getLayout = page => <BlankLayout>{page}</BlankLayout>

export async function getServerSideProps(context) {
  const page = context.query.page


  const isPrint = context?.query?.isPrint ? true : false
  const authToken = context.req.headers.cookie
  const cookies = authToken ? cookie.parse(authToken) : false


  const entitiesId = context.query.entityId ?? null
  const collectionName = context.query.collection ?? null
  const pageName = page.join('/')


  const headers = {
    Authorization: `Bearer ${cookies.sub ? decryptData(cookies.sub).token : ''}`,
    'Accept-Language': context.locale
  }
  const apiUrl = `${process.env.API_URL}/page/get-latest-version/${pageName}/`
  const httpsAgent = new https.Agent({ rejectUnauthorized: false })
  try {
    const response = await axios.get(apiUrl, { headers, httpsAgent })
    const data = JSON.parse(response?.data?.jsonData) ?? null
    const initialLayout = data?.layout ?? null

    let layOutData = null
    let layOutInitialData = null
    let layOutInitialDataApi = null
    let layOutWorkflowId = ''
    let layOutPageRoles = []
    let layOutPageTypeId = 1


    if (initialLayout) {
      try {
        const apiUrlLayout = `${process.env.API_URL}/page/get-latest-version/${initialLayout}/`

        const res = await axios.get(apiUrlLayout, { headers, httpsAgent })
        layOutData = JSON.parse(res?.data?.jsonData) ?? null

        layOutInitialData = layOutData?.editorValue ?? null
        layOutInitialDataApi = layOutData?.apiData ?? null
        layOutWorkflowId = res.data?.workflowId ?? ''
        layOutPageRoles = res.data?.pageRoles ?? []
        layOutPageTypeId = res.data?.pageTypeId ?? 1
      } catch (error) {


      }
    }


    const initialData = data?.editorValue ?? null
    const initialDataApi = data?.apiData ?? null
    const workflowId = response?.data?.workflowId ?? ''
    const pageRoles = response?.data?.pageRoles ?? []
    const pageTypeId = response?.data?.pageTypeId ?? 1




    return {
      props: {
        pageName,
        initialData,
        initialDataApi,
        workflowId,
        pageRoles,
        pageTypeId,
        initialLayout,
        layOutData,
        layOutInitialData,
        layOutInitialDataApi,
        layOutWorkflowId,
        layOutPageRoles,
        layOutPageTypeId,
        isPrint,
        entitiesId,
        collectionName
      },

    }
  } catch (error) {
    return {
      notFound: true
    }
  }
}
