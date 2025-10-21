import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { axiosGet } from 'src/Components/axiosCall'

function TableControl({ data, onChange }) {
  const { locale } = useIntl()
  const [loading, setLoading] = useState(false)
  const [getFields, setGetFields] = useState([])

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })


  
  useEffect(() => {
    setLoading(true)
    if (data.collectionId) {
      axiosGet(
        `generic-entities/${data.collectionName}?pageNumber=${paginationModel.page + 1}&pageSize=${
          paginationModel.pageSize
        }&isLookup=true`,
        locale
      )
        .then(res => {
          if (res.status) {
            setGetFields(res.entities)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setGetFields([])
      setLoading(true)
    }
  }, [locale, data.collectionId, paginationModel, data.collectionName])

  return <div></div>
}

export default TableControl
