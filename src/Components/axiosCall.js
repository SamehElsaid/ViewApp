import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from './encryption'
import { toast } from 'react-toastify'

const staticToken = `
Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.x-vWqiBZuPwVugTbZyf3v_tBsq5eRF96WKYViLBzXBFw1m-SG4ElwKx57PTuQOr41ay7PMlh7xpkhXYu0Jt5PHuRtmNT3EOH.yCrtquRptQOfTTItCQXQ9g.uUeuUY7gZgHpkQt7OMdge3bx5_FiaiAozCW_qF1Z_KUuH4xlvCokuBXDVScWupBjEhz6I5QVkwKZICfz44z47yrpVv4aWSKkhSZIh4jSchelZ0-81WPoIIjQnUD5mQCtqgEE-ZP6E6KDmY1FbtMLrF4oZEL94EFKSq60HknYRRvaYfGmhHGqFzzgjcnMAiX8T3kkiSIiw3h0NxSvYr6eFCYKqbiY6-X2M3fhKVDV3c6F9pzEtQT27q05Wamogu413C7HvWJAeAmlB1yQl-9brZ2qsBXzo-MFnEfPZoegL5hm3zjMcjxwSxLkJhPxu_liDEzEkGOmmHgJSJfE4t-q4_xMuYVFpQsscvHeYmu8gkvUCUAU7dsSFx3wbVpjqj2gEyKiC17GR5j3h3pH8RA1LZ94niPoQaiteDr0BFF0gjl-XspTG9sASZu4ma9qxKjKuMlcP7M--cJHrXO5Ngo5BtRRylxZhAtxek3US_6X5LNSJLsoynuGdyWzkZVcHiL8ke4NBPt3ukqNsuRRYO4KOF6pU1cIApnn_degWqlzW4l2rb4WmjJyybOYq1vO19jSqgaqzwiMhOSxXAqvg3UpI1DENhX_lMPH4jFg8c9QtWbfFwRShr8wcLJAAkeURv_zbbi5cIl653sA-1-rIrirn4TiAXU8KForCBUzdjYDkiyynVadZ3uGHcTjAIFKdfF46QbTVctrpoAsDVqogVNp9zvbYbsdcK86gEFgw3yhvklkm9DXgZfW8VoZVeC_StDXwflznlryPU85H0DT5SpwtWTUTRAAXNDzcto8OM1rB8S8S0qjMs00hA2mh1EBDrqyixMv6TPm4kUIjZqrrN_5PXqCiyN_z2c4fkvV6o5NOurONkZR3gcg_2T6hf_Q_DKzU5XUt1sbJbE0c3kWL_iPt6kBxjoP1mmKhY7SmLEo34y56qHpaGda8zMNoegDnqOyDjx4J3Hf3VjmcsIzazJ0w8xIpp_wtWrC66ToCOec1q6vRzPDDu0imZhjBsYGQAlOTpWNiAMvBEr-ESNbF_h6_2p3jqBjkjqXWtuqRS53dfQxgAkvB_pBP1bHba68ohiOZH5Mo_nmTMHtBk4cYu27PGD3HjFMf4J0LdXRRNE2GPJO0US6l9zSwcKN5BAvxFqlG4FQXylHKPTEVWxawpmZeU6UxOav0aQWbSKR91J9_kdiC3LWhp9nc73EJNAUp_30KrmZAzk4otVDA2Vde8qPoik-10HVuKQgAbD5UVULhQVI-tHuNawQxvLgeWca4hYrqdv3Hyg_5lwWC5Q0nZpn0usewua5FbT8TecelFcTWH65LUc1RelRkf8lOiYu_nAMHZd2BILv_ALvhDK8i8KqGhC98RLIc0wWIAD842G_pql0H2Nh7YptZX1c6iWQDfzzaO_DeZ1d3k9-0NNtOpOjb7NorCHIM62rvVBGeP3FDyGTrDVC1PZMKSFNVua2144hTKqzzmI2dKs_shwJz3TotZ-5ReyCgRVEIdy7TQUlNc2OMK4qmUpWcHe997H8s0UhZINO_SdnZX5GMf4gOGF6MEdUIQE8dZLtGwIExxVUh6VWlGoFkUz4TMx9qTZa8GPtVeNhgblt2oarGKobTnqgQJ4Mh-TV4h0LuDXzlHidhaLNdCnoJq3gKuZnKgQsi1hGwQMxdtUFuj4tnvtlAwxV-g.34SctE98E_-gF5ssKPu7H72PIpLiFjUFLq12YXv7kj8`
export const axiosGet = async (url, locale, token, params = {}, close) => {
  const authToken = Cookies.get('sub')

  try {
    const header = {
      headers: {
        Authorization: staticToken ? staticToken : `Bearer ${token ? token.trim() : decryptData(authToken).token.trim()}`,
        'Accept-Language': locale
      },
      params
    }
    if (close) {
      delete header.headers.Authorization
    }
    const fetchData = await axios.get(`${process.env.API_URL}/${url}`, header)

    // if (!fetchData.data.isSuccess) {
    //   throw new Error(fetchData.data.message)
    // }

    return { ...fetchData.data, status: true }
  } catch (err) {
    if (url === 'auth/info') {
      throw err
    } else {
      return { status: false }
    }
  }
}

export const axiosPatch = async (url, locale, data, file, close) => {
  const authToken = Cookies.get('sub')
  const HeaderImg = { 'Content-Type': 'multipart/form-data' }

  const headerToken = file
    ? { ...HeaderImg, Authorization: `Bearer ${decryptData(authToken)?.token?.trim()}` }
    : { Authorization: `Bearer ${decryptData(authToken)?.token?.trim()}` }

  if (close) {
    delete headerToken.Authorization
  }
  try {
    const fetchData = await axios.put(`${process.env.API_URL}/${url}`, data, {
      headers: {
        ...headerToken,
        'Accept-Language': locale
      }
    })
    if (fetchData.data.isSuccess) {
      return { ...fetchData.data, status: true }
    } else {
      throw new Error(fetchData.data.message)
    }
  } catch (err) {
    return { status: false }
  }
}

export const axiosPost = async (url, locale, data, file, close) => {
  const authToken = Cookies.get('sub')
  const HeaderImg = { 'Content-Type': 'multipart/form-data' }

  const headerToken = file
    ? { ...HeaderImg, Authorization: `Bearer ${decryptData(authToken)?.token?.trim()}` }
    : { Authorization: `Bearer ${decryptData(authToken)?.token?.trim()}` }

  if (close) {
    delete headerToken.Authorization
  }
  try {
    const fetchData = await axios.post(`${process.env.API_URL}/${url}`, data, {
      headers: {
        ...headerToken,
        'Accept-Language': locale
      }
    })

    if (!fetchData.data.isSuccess && !file) {
      throw new Error(fetchData.data.message)
    }

    return { ...fetchData.data, status: true }
  } catch (err) {
    console.log('err222', err)

    return {
      status: false,
      code: err?.response?.status,
      statusCode: err?.response?.data?.errorCode
    }
  }
}

export const axiosPut = async (url, locale, data, file, close) => {
  const authToken = Cookies.get('sub')
  const HeaderImg = { 'Content-Type': 'multipart/form-data' }

  const headerToken = file
    ? { ...HeaderImg, Authorization: `Bearer ${decryptData(authToken)?.token?.trim()}` }
    : { Authorization: `Bearer ${decryptData(authToken)?.token?.trim()}` }

  if (close) {
    delete headerToken.Authorization
  }
  try {
    const fetchData = await axios.put(`${process.env.API_URL}/${url}`, data, {
      headers: {
        ...headerToken,
        'Accept-Language': locale
      }
    })

    if (!fetchData.data.isSuccess && !file) {
      throw new Error(fetchData.data.message)
    }

    return { ...fetchData.data, status: true }
  } catch (err) {
    return { status: false, code: err?.response?.status }
  }
}

export const axiosDelete = async (url, locale, token) => {
  const authToken = Cookies.get('sub')

  try {
    const fetchData = await axios.delete(`${process.env.API_URL}/${url}`, {
      headers: {
        Authorization: `Bearer ${token ? token.trim() : decryptData(authToken).token.trim()}`,
        'Accept-Language': locale
      }
    })
    if (!fetchData.data.isSuccess) {
      throw new Error(fetchData.data.message)
    }

    return { ...fetchData.data, status: true }
  } catch (err) {
    return { status: false }
  }
}

export const uploadImage = async (file, onProgress, locale, mult, index) => {
  const authToken = Cookies.get('sub')

  if (!file) throw new Error('No file provided')
  const fileNew = new File([file], new Date().getTime() + decryptData(authToken).username, { type: file.type })

  const header = {
    headers: {
      Authorization: `Bearer  ${decryptData(authToken).token.trim()}`,
      'Accept-Language': locale
    }
  }
  try {
    const res = await axios.get(
      `${process.env.API_URL}/auth/get_url_patterns/?file_name=${decryptData(authToken).username}/` +
        fileNew.name +
        '.' +
        fileNew.type.split('/')[1],
      header
    )

    try {
      const response = await axios.put(res.data.url, fileNew, {
        headers: {
          'Content-Type': fileNew.type
        },
        onUploadProgress: mult
          ? onProgress
          : progressEvent => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              if (onProgress) {
                onProgress(percentCompleted)
              }

              return percentCompleted
            }
      })

      return {
        status: true,
        data: `${decryptData(authToken).username}/` + fileNew.name + '.' + fileNew.type.split('/')[1]
      }
    } catch (error) {
      toast.error(locale === 'ar' ? 'حدث خطأ في رفع الصورة' : 'Error uploading file: ' + error.message)

      return {
        status: false,
        data: null
      }
    }
  } catch (err) {
    toast.error(locale === 'ar' ? 'حدث خطأ في رفع الصورة' : 'Error uploading file: ' + err.message)

    return {
      status: false,
      data: null
    }
  }
}

export const validateImageFile = (file, locale) => {
  if (!file) {
    return { isValid: false, error: locale === 'ar' ? 'لا يوجد ملف' : 'No file provided' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        locale === 'ar'
          ? 'يجب أن يكون الصورة في الصيغة JPEG أو PNG أو JPG أو WEBP'
          : 'Only JPEG, PNG, JPG, and WEBP images are allowed'
    }
  }

  return { isValid: true }
}

export const validateImageFilePng = (file, locale) => {
  if (!file) {
    return { isValid: false, error: locale === 'ar' ? 'لا يوجد ملف' : 'No file provided' }
  }

  const allowedTypes = ['image/png']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: locale === 'ar' ? 'يجب أن يكون الصورة في الصيغة PNG' : 'Only PNG images are allowed'
    }
  }

  return { isValid: true }
}

export const validateMediaFile = (file, locale) => {
  if (!file) {
    return { isValid: false, error: locale === 'ar' ? 'لا يوجد ملف' : 'No file provided' }
  }

  // Allowed types for images, videos, and audio
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp3']
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedAudioTypes]

  // Check if file type is allowed
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        locale === 'ar'
          ? 'يجب أن يكون الملف صورة بصيغة JPEG أو PNG أو JPG أو WEBP، أو فيديو بصيغة MP4 أو MOV أو AVI أو WEBM، أو صوت بصيغة MP3 أو WAV أو OGG أو AAC'
          : 'Only JPEG, PNG, JPG, WEBP images, MP4, MOV, AVI, WEBM videos, and MP3, WAV, OGG, AAC audio files are allowed'
    }
  }

  // If all conditions are met
  return { isValid: true }
}

export const typeOfFile = file => {
  if (
    file.type.includes('/png') ||
    file.type.includes('/jpg') ||
    file.type.includes('/jpeg') ||
    file.type.includes('/webp')
  ) {
    return 'image'
  } else if (
    file.type.includes('/mp4') ||
    file.type.includes('/mov') ||
    file.type.includes('/avi') ||
    file.type.includes('/webm')
  ) {
    return 'video'
  } else if (
    file.type.includes('/mp3') ||
    file.type.includes('/mpeg') ||
    file.type.includes('/wav') ||
    file.type.includes('/ogg') ||
    file.type.includes('/aac')
  ) {
    return 'audio'
  }
}

export const typeOfFileUrl = file => {
  if (file.includes('.png') || file.includes('.jpg') || file.includes('.jpeg') || file.includes('.webp')) {
    return 'image'
  } else if (file.includes('.mp4') || file.includes('.mov') || file.includes('.avi') || file.includes('.webm')) {
    return 'video'
  } else if (
    file.includes('.mp3') ||
    file.includes('.mpeg') ||
    file.includes('.wav') ||
    file.includes('.ogg') ||
    file.includes('.aac')
  ) {
    return 'audio'
  }
}

export const UrlTranAr = async string => {
  const res = await fetch(`https://api.datpmt.com/api/v1/dictionary/translate?string=${string}&from_lang=ar&to_lang=en`)
  if (res.ok) {
    return res.json()
  }

  return ''
}

export const UrlTranEn = async string => {
  const res = await fetch(`https://api.datpmt.com/api/v1/dictionary/translate?string=${string}&from_lang=en&to_lang=ar`)
  if (res.ok) {
    return res.json()
  }

  return ''
}
