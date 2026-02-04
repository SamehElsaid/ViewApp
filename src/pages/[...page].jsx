import dynamic from 'next/dynamic'
import * as cookie from 'cookie'
import { decryptData } from 'src/Components/encryption'
import axios from 'axios'
import https from 'https'
import { useSelector } from 'react-redux'
import LoadingMain from 'src/Components/LoadingMain'
import { useEffect, useState } from 'react'
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

const Mypage = ({ pageName, initialData, initialDataApi, pageId, entitiesId, collectionName, pageRoles }) => {
  const loading = useSelector(rx => rx.LoadingPages.loading)
  const user = useSelector(rx => rx.auth.data)
  const [loadingPage, setLoadingPage] = useState(true)
  const router = useRouter()
  console.log(user,)


  useEffect(() => {
    if (user) {
      if (!pageRoles.includes(user?.role_id)) {
        router.push('/404')
      } else {
        setLoadingPage(false)
      }
    }
  }, [pageRoles, user, router])


  return (
    <div className=''>
      <div className={`bg-white min-h-[100dvh] ${(loading || loadingPage) ? 'overflow-y-hidden' : ''}`}>
        {(loading || loadingPage) && <LoadingMain login={true} />}
        <ReactPageEditor
          pageName={pageName}
          initialData={initialData}
          initialDataApi={initialDataApi}
          pageId={pageId}
          entitiesId={entitiesId}
          collectionName={collectionName}
          type='all-pages'
        />
      </div>
    </div>
  )
}

export default Mypage

// Mypage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export async function getServerSideProps(context) {
  const page = context.query.page
  const entitiesId = context.query.entityId ?? null
  const collectionName = context.query.collection ?? null
  const pageName = page.join('/')

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
    const pageId = response?.data?.id ?? null
    const pageRoles = response?.data?.pageRoles ?? []
    const pageTypeId = response?.data?.pageTypeId ?? 1
    const findPageType = appViewOptions.find(option => option.id === pageTypeId)

    if(findPageType.name_en !== process.env.APP_TYPE){
      return {
        notFound: true
      }
    }

    return {
      props: {
        pageName,
        initialData,
        initialDataApi,
        pageId,
        entitiesId,
        collectionName,
        pageName,
        pageRoles
      }
    }
  } catch (error) {
    return {
      notFound: true
    }
  }
}
