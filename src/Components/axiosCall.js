import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from './encryption'
import { toast } from 'react-toastify'

const staticToken = `Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.s5w4sN-Nv-vyhNNfX9wFIaAZW4G5yW_bUoJA9pBW6vnIJ7ppYtin6Se0qO0bAQvZENvMWMVDl3QjSvkJXBLAoAT06tIL3mLf.IXHBcpoQxqecNHcUhS23lQ.kOksuZ4ho_cviKJ_xKWcAif6lbjWRVH6acqkOKWxBL-n5otDDGEhNkmyDVX1ukw05ysWCVQITFJANa2l0f5SubB0nEyd_GSkkZ9COxfmJWNjlDronQJZmW55-LXCe3ZhRa9WI8lvumlw44ylgfysdhJL9whP4jgVV8hUxJUjr2Je4UoPRf-g_NO5DpAA47oCeuxm-i9hXDCe7MAtQLiAhtsFxo7-SKpiNE99EO_JoAEgagEnktgw-wyVXmRTkqe1_gOm80uh0Y0nssV7HZsue2Zfr3kgGA9WYtBB4s1XhCRxK4YQVrxrSJ9nJxjTaxV5lhipKsSseZiY0LvfEhJxTuSteep9CmgRbVZdTtNRwUoG0izk99SzX5M-KfxO8ISq7EMcvM_jcNZRUGP9EwC6xu2f-HfUtiMB8-Ikb3XaWwaGtlHBK7YVxWi1kKKCNV-QBycQB5Hme7xtmMaUImN6dqPju2Turj6-R7E_sDQ0l2gCB8tE-QmtkFoG0OzJ7-b47GtHf-H3gKFBCfk0NSB1zmXH29-Jm5EgUnLMbHcnSFyIfIaaXuoIp13e2wQ7C5jHCvmtH4HFWeCSm8kgiLxTRnYHYeYaX2PElMbd7J9Al60tmtZ6i7HkdLyK1S9uB2tFjT6CfQajzUvkVwJe-5khQyyMHQ0jD1GIuWxAIrhFQigjfcMlwcqArzObwaEvgrAbY0qsO4TXe8j4yBz5EZy0vkMydDkhv8TmDqM8nG4Fx2OZgKTV74xY8cQeEHyXmHCLo7Y9EV7ZTBN151jKusnfiMOQUJ2_xR-vAjSurjL53MZhRuPIk2L1LhqZDgXQ_9WvZX2VIEDjyhspTrcMqCcMatxE1IY4-JCR21JahJQEA4wezZRojSqAC46F9Y1fPK9hXRa2YO3hX6uVMyWFL8nmdBIRvyCOCqv0s2ZZLoVpkVxiZbox_EeEO1C6Sv0JtzE7Myd7biC2PH_t0G0Vl64CtJWYBM7vVW2I9_ui-OgWvEJQMM3seLBaty_f_cJqRxGB7GaDMPyKWV0WWQFdeTJQAP3xzFyyeLI7yA9NMsEhfxRC5xyp71wujWk7lGZ6TIczvYdsj21mOxaJ79_SAvGBOMVHmnlGMe5HsYvV1RTpALMlBLrBoTuDdTjSdEyKdkrZpHz0wEhGytL6zJFhe2tAxIuuH3v4XW-6NibCG8JWkzkl4qmKYio7ihQfrHhcc23d_7GADZHW1eMUNJqjLdGjzxi6JRLm0Hy2x9UW4aCkDaOJ0tSJrxmJSI9xA0aIkCbqNLlAEhae2rcAHwWjOEiMpAXNq3I6UKZIsBkJyPkokn5A5rfkfZ-RUo-dDKybzFYw3KVz4k2rUbv9_9rNW17RrJyu4UOpEltaGIlPHzKdWB7sSvYTdwLN0H2SOfnpa45L7q0oNTpzzYXYo8YGmd_tnaLDiYACC7lOwBvZU-SxIYz3N7fCZLZmmDjxFs7gdlGoV_UrtcigQ0KXQY2FuuidH0og251vQRGs9jvt8kv7NG8C19D3SnWYrSzItlvc38UZ.PYzs3rFVxRQnoB88n5OrjzauchEs2tYkFlaTu-1i9-A`

export const axiosGet = async (url, locale, token, params = {}, close) => {
  const authToken = Cookies.get('sub')

  try {
    const header = {
      headers: {
        Authorization: `Bearer ${token ? token.trim() : decryptData(authToken).token.trim()}`,
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
