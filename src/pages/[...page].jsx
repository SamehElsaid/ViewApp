import dynamic from 'next/dynamic'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import * as cookie from 'cookie'
import { decryptData } from 'src/Components/encryption'
import axios from 'axios'
import https from 'https'
import { useSelector } from 'react-redux'
import LoadingMain from 'src/Components/LoadingMain'

let ReactPageEditor = dynamic(
  () =>
    import('src/Components/Pages/ReactPageEditor').then(e => {
      return e
    }),
  {
    ssr: false
  }
)

const Mypage = ({ pageName, initialData, initialDataApi, pageId, entitiesId, collectionName }) => {
  console.log('pageName', pageName)
  console.log('pageId', pageId)
  const loading = useSelector(rx => rx.LoadingPages.loading)

  console.log('entitiesId', {entitiesId})

  return (
    <div className=''>
      <div className={`bg-white min-h-[100dvh] ${loading ? 'overflow-y-hidden' : ''}`}>
        {loading && <LoadingMain login={true} />}
        {pageName === 'paid' ? (
          <>
            <img
              src='https://lowcodetest-ayeuaucehyerfves.uaenorth-01.azurewebsites.net/api/file/download/35b3bdbe-1498-4d82-b832-771a00e54994_PAYMENT-SUCCESS.png'
              className='w-full'
              alt=''
            />
          </>
        ) : (
          <ReactPageEditor
            pageName={pageName}
            initialData={initialData}
            initialDataApi={initialDataApi}
            pageId={pageId}
            entitiesId={entitiesId}
            collectionName={collectionName}
          />
        )}
      </div>
    </div>
  )
}

export default Mypage

// Mypage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export async function getServerSideProps(context) {
  const page = context.query.page
  const entitiesId = context.query.entitiesId ?? null
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

    return {
      props: {
        pageName,
        initialData,
        initialDataApi,
        pageId,
        entitiesId,
        collectionName,
        pageName
      }
    }
  } catch (error) {
    return {
      notFound: true
    }
  }
}
