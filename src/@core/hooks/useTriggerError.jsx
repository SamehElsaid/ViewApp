import axios from 'axios'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { REMOVE_USER } from 'src/store/apps/authSlice/authSlice'

function useTriggerError() {
  const dispatch = useDispatch()
  const [__, _, removeCookie] = useCookies(['sub'])

  const handleErrorResponse = (data, status) => {
    if (!data?.isSuccess) {
      if (data.errorMessage) {
        return toast.error(data.errorMessage)
      }
      if (typeof data.errors === 'string') {
        if (status === 401) {
          removeCookie('sub', { path: '/' })
          dispatch(REMOVE_USER())
        } else {
          toast.error(data.errors)
        }

        return
      }

      for (const key in data.errors) {
        const messages = data.errors[key]
        if (Array.isArray(messages)) {
          messages.forEach(message => toast.error(message))
        } else {
          toast.error(messages)
        }
      }
    }
  }

  useEffect(() => {
    axios.interceptors.response.use(
      function (response) {
        handleErrorResponse(response.data, response.status)

        return response
      },
      function (error) {
        handleErrorResponse(error.response?.data, error.response.status)

        return Promise.reject(error)
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return null
}

export default useTriggerError
