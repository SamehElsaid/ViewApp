import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/ar'

function GetTimeinTable({ data }) {
  const [time, setTime] = useState('')
  const { locale } = useRouter()

  useEffect(() => {
    moment.locale(locale)
    let intervalId

    if (data) {
      const createdDate = new Date(data)

      const adjustedDate = new Date(createdDate.getTime() + 3 * 60 * 60 * 1000)

      const today = new Date()
      const timeDiff = Math.abs(today - adjustedDate)
      const daysAgo = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

      if (daysAgo === 1) {
        setTime(moment(adjustedDate).fromNow())
        intervalId = setInterval(() => {
          setTime(moment(adjustedDate).fromNow())
        }, 60000)
      } else if (daysAgo <= 7) {
        setTime(moment(adjustedDate).fromNow())
      } else {
        setTime(moment(adjustedDate).format('lll'))
      }
    }

    return () => clearInterval(intervalId)
  }, [data, locale])

  return <div>{time}</div>
}

export default GetTimeinTable
