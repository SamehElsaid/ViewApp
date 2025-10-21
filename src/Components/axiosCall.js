import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from './encryption'
import { toast } from 'react-toastify'
import { saveAs } from 'file-saver'

export const axiosGet = async (url, locale, token, params = {}, close) => {
  const authToken = Cookies.get('sub')
  

  try {
    const header = {
      headers: {
        Authorization: `Bearer ${token ? token.trim() : decryptData(authToken)?.token?.trim()}`,
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
    console.log(err, 'err');
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
    ? { ...HeaderImg, Authorization: `Bearer ${decryptData(authToken).token}` }
    : { Authorization: `Bearer ${decryptData(authToken).token}` }

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
    ? { ...HeaderImg, Authorization: `Bearer ${decryptData(authToken).token.trim()}` }
    : { Authorization: `Bearer ${decryptData(authToken).token.trim()}` }

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
    return { status: false, code: err?.response?.status }
  }
}

export const axiosPut = async (url, locale, data, file, close) => {
  const authToken = Cookies.get('sub')
  const HeaderImg = { 'Content-Type': 'multipart/form-data' }

  const headerToken = file
    ? { ...HeaderImg, Authorization: `Bearer ${decryptData(authToken).token}` }
    : { Authorization: `Bearer ${decryptData(authToken).token}` }

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
      Authorization: `Bearer  ${decryptData(authToken).token}`,
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


export const getDomain = () => {
  return process.env.DEV_MODE ? 'http://localhost:3001/' : process.env.DOMAIN
}