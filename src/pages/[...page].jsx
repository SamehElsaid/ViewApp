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
import { useReactToPrint } from 'react-to-print'
import LoadingMain from 'src/Components/LoadingMain'
import { useRouter } from 'next/router'
import { appViewOptions } from 'src/Components/_Shared'

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
  pageId,
  isPrint }) => {
  const loading = useSelector(rx => rx.LoadingPages.loading)
  const [editorValue, setEditorValue] = useState(null)
  const [readOnly, setReadOnly] = useState(true)
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
    setReadOnly(true)
  }, [pageName, isPrint])

  console.log(pageId, "from:page");






  return (
    <div className=''>
      <div className={`bg-white min-h-[100dvh] ${(loading || loadingPage) ? 'overflow-y-hidden' : ''}`}>
        {(loading || loadingPage) && <LoadingMain login={true} />}
        <div className="parent-print" ref={refPdf} >
          <div className='py-10 min-h-screen bg-white main-container'>



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
                pageId={pageId}
              >

                <ReactPageEditor
                  key={`content-${pageName}`}
                  pageName={pageName}
                  initialData={editorValue || initialData}
                  initialDataApi={initialDataApi}
                  workflowId={workflowId}
                  pageId={pageId}
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
                pageId={pageId}
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
    let pageId = response?.data?.id ?? null

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
    const workflowId = response?.data?.pageWorkflowNames ?? []
    const pageRoles = response?.data?.pageRoles ?? []
    const pageTypeId = response?.data?.pageTypeId ?? 1

    const findPageType = appViewOptions.find(option => option.id === pageTypeId)

    if (findPageType.name_en !== process.env.APP_TYPE) {
      if (findPageType.id === 4) {

      } else {
        return {
          notFound: true
        }
      }
    }



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
        pageId,
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
