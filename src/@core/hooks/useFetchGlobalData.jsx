/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { axiosGetIdentity } from 'src/Components/axiosCall'
import { setRoles } from 'src/store/apps/globalSlice/globalSlice'


function useFetchGlobalData() {

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axiosGetIdentity(`Role/GetRoles`),
    ]).then(([roles]) => {
      if (roles?.status) {
        dispatch(setRoles(roles?.result?.roles))

      }
    }).finally(() => {
      setLoading(false)
    })
  }, [])



  return { loading }
}

export default useFetchGlobalData
