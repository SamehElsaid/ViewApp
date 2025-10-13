export const encryptData = data => {
  const jsonString = JSON.stringify(data)
  const utf8String = unescape(encodeURIComponent(jsonString))
  const encodedString = btoa(utf8String)
  const textBefore = encodedString.substr(0, 15)
  const textAfter = encodedString.substr(15)

  return textBefore + '2w2rds23dash34sd5dsd65tf51hj20hj1874' + textAfter
}

export const decryptData = encodedData => {
  try {
    const endCode = encodedData.replace('2w2rds23dash34sd5dsd65tf51hj20hj1874', '')
    const utf8String = atob(endCode)
    const jsonString = decodeURIComponent(escape(utf8String))

    return JSON.parse(jsonString)
  } catch {
    return {}
  }
}


export const UrlTranAr = (string, to) => {
  return `https://api.datpmt.com/api/v1/dictionary/translate?string=${string}&from_lang=en&to_lang=${to}`
}
