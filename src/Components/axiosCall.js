import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from './encryption'
import { toast } from 'react-toastify'

const staticToken = `
Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.Ygz64LySqZ1Ses7zjz1-fDl93OLV5laVxokILe6iMABKrO1VPVLtb7sbO66rFFLXAaQK1SIwZqfyiHafnLXvJ9nlQ6QYMbxB.4AOuTHLAMfAV07ZDeBEwqg.tqTLLYzRCmyGQjOuUn-pKIROH5AZodh8_YThx5HJBUeGtPTUVMAmwOahYvZAh6J20gDfN2pPmI89jUc48Q6yPcq8QWdFKVq9otDZlomPnve0fqCxyqY1zmXqa0R2AtLfeP1RG7DdCr1K9-V8ZAMMw3CFeezaJcj7lXGzEDGHkSrU2B2EEkYg4W7tmDyK0W4z_tSLztZ8jfZPoL5T_T2Suo8pQnhW7v04xhM-E36Gpq9f5gAwiE2-fCFZOexwLMmJwgM0awh1aywknsA9l2YkllKb_fr9tOuve1RK4jY7sF8r_0GGxrysaZ7B8BPRIaDpYo4ilXKed517fihWha2PIssCTshSynHJeVlloHHTcjPbK67QjtSLjPLHeYnMPlV40IgMfvVlw9KwJAxTUS_aP06dXbwhr2xNRRVQI_y9Zf2ZU_Yli4F7HY_9RdNeMmztJEEcb0E9R9TVp3_WHhuBxgoNgrvLGu9g0KlpF7kqhk4a5vzs6t5eEIXzlSHrN30Bj63wh2rKi57JMHZ1ka-4Yk-ZfzUoUbgE_xAvZdr4X1LhQQ5g7CPepSC-61mBom_6TszbsaJPGMCqdpv0rZTEQ9bCV2frtVzOqY6JKLlVzKv76egbhj27YR7Eqn89QNv3ufvXosVjYpfWBHoZt24GhC8-JpdjeK5AkC6r9zvuBfKWGN8E79aw5B6y0-SSj8I34ZwfMiKMqG6-YbgKTS-EqM9Fj5MGHwT5ZRBTistfPA4AR1aS3BasB8izq1FmiIdJxO9uVgl01Hc_eK5FnTWqgin8WYPCXSC8b29wgSLSU5bmzGK-iQLl9Pfc8snLlrYYCwbLHPAEPyVbDqnk5VlpMo602JEv7Rg1e_S82RNZun_RcR3cWqN6Y8ybpqwL0mYwjM2xAcj7Ed4pVQJ5ylNxHGq-NXu8oGvE68pmpFBqiLL2cPqeIIz-FVbC0o9T40I3IxRFyHSdM9XLMVAHOULbBY_9fVUzkQHilAQ7Kuf6jaIuxFkmnrrCZjsGXPIlt8d7SKeheAUFXtP1dW91eT2qa7AtWcs3mIS6rcziNnMJNvWDbdrdZIzBwjgaWRGE09SkntQjgWVnBqGbeDtiEHOg-RVSntlJtworD9t8qtmGuXxT0PJsCkLeDyG6Rhu0h9Ftou-In3H6JgYav4UISShES1XE6CtVzQhXSrDPApZkSCgX38T_auZtcVac_ymVE9gnvWctovzgvLSFWGlhSLiI7owP9Ob_GmH82x3wRzLg69u2G5mQzihp7uNQl3oX8x-_txwpVftdsflsdpohwuGWK3AzKcH8KQt6lnERh8ldERt1boxr_5uiGMVzqx1OwALAfdT9iLeBROMUCahVbSG-r7zb_DhE14W53lJua-8qvbw194nUg1l3aLTJd2gLFZn7jybGsmodxRVBR69gv9ngQ8dtlzwaXVP3ERY-Qzzok8h9pqpFPMBtJLo18zPskLi0FU7HZbeDPeMFyFTQti-K2xAD1CT1EFczwvXD9eK5xacaJh5yZUnb2EU_1YjyFX1tX-dCAsgTpcFqY25wapjgINh-59x0i7gYLfeXtw8JNwPFA5FVNQe_IOeAY14G0pZK-DwVswRNAvPlQ8yklp7zSBItraSJVW_MBs7VvrjqXn5DY4K_6QkaAF68pgiInlVCTDB2lQsXIcnJ-JvLgfIcXxhMf0XEX3PmqDCm-8pPpc0sLw5U5K731i-D7yDAi3NS.m5ttBrvlXYOhGiL56slV3iI_A5o0x9hJQBBHZQUsBkM`

export const axiosGet = async (url, locale, token, params = {}, close) => {
  const authToken = Cookies.get('sub')


  try {
    const header = {
      headers: {
        Authorization: staticToken || `Bearer ${token ? token.trim() : decryptData(authToken).token.trim()}`,
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

export const axiosGetIdentity = async (url, locale, token, params = {}, close) => {
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
    const fetchData = await axios.get(`${process.env.IDENTITY_URL}api/${url}`, header)



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
    : { Authorization: staticToken || `Bearer ${decryptData(authToken)?.token?.trim()}` }

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
