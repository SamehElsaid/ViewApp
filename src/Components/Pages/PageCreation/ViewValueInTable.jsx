import { CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { axiosGet } from 'src/Components/axiosCall'

export default function ViewValueInTable({ data, value }) {
  const [dataView, setDataView] = useState(false)


  useEffect(() => {
    if (data?.options?.source) {
      axiosGet(`generic-entities/${data?.options?.source}/${value}`).then(res => {
        if (res.status) {
          const lable = JSON.parse(data?.descriptionEn) ?? []

          const Values = lable.map(ele => {
            if (res.entities?.[0]) {
              return res.entities?.[0]?.[ele]
            }

            return ''
          })

          setDataView(Values.join('-') ?? '')
        } else {
          setDataView("-")
        }
      })
    }
  }, [data, value])


  return <div>{dataView ? dataView : <CircularProgress size={25} />}</div>
}
