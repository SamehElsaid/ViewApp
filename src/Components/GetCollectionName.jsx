import { Chip, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { axiosGet } from './axiosCall'
import Link from 'next/link'
import { useRouter } from 'next/router'

function GetCollectionName({ name }) {
  const [loading, setLoading] = useState(true)
  const { locale, messages } = useIntl()
  const [collectionName, setCollectionName] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const { query: { dataSourceId } } = useRouter()

  useEffect(() => {
    if (name) {
      axiosGet(`collections/get-by-key?key=${name}`)
        .then(res => {
          if (res.status) {
            setCollectionName(locale === 'ar' ? res.data.nameAr : res.data.nameEn)
            setCollectionId(res.data.id)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
      setCollectionName('')
    }
  }, [name, locale])




  return (
    <div>
      <Chip
        color='warning'
        component={Link}
        className='!cursor-pointer'
        href={`/${locale}/setting/data-source/collaction/${collectionId}?dataSourceId=${dataSourceId}`}
        label={
          loading ? (
            <div className='flex gap-2 items-center'>
              <CircularProgress size={20} />
            </div>
          ) : (
            collectionName
          )
        }
      />
    </div>
  )
}

export default GetCollectionName
