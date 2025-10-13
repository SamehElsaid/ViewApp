import {
  button,
  checkbox,
  date,
  file,
  multiple_select,
  radio,
  select,
  tabs,
  text,
  text_content,
  textarea
} from './FiledesCss'

export const isArabic = (value, locale) => {
  const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s.,،؟]+$/

  return locale !== 'ar' ? arabicRegex.test(value) : !arabicRegex.test(value)
}

export const getData = (item, key, defaultValue) => {
  try {
    const keys = key.split('.')
    let result = item

    for (let k of keys) {
      if (result && result.hasOwnProperty(k)) {
        result = result[k]
      } else {
        throw new Error('Key not found')
      }
    }

    if (typeof result === 'object') {
      throw new Error('Key not found')
    }

    return result
  } catch (error) {
    return defaultValue
  }
}

export const getType = type => {
  const typeMap = {
    text: 'SingleText',
    url: 'URL',
    tel: 'Phone',
    textarea: 'LongText',
    radio: 'OneToOne',
    select: 'OneToOne',
    checkbox: 'ManyToMany',
    multiple_select: 'ManyToMany'
  }

  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

export const getTypeFromCollection = (type, description) => {
  const baseTypes = {
    SingleText: 'text',
    URL: 'url',
    Phone: 'tel',
    Email: 'email',
    Number: 'number',
    Date: 'date',
    Password: 'password',
    File: 'file',
    LongText: 'textarea'
  }

  if (baseTypes[type]) return baseTypes[type]

  if (type === 'OneToOne') {
    return description === 'select' ? 'select' : 'radio'
  }

  if (type === 'ManyToMany') {
    return description === 'multiple_select' ? 'Search_Select' : 'checkbox'
  }

  return type.charAt(0).toUpperCase() + type.slice(1)
}

const styleMap = {
  textarea,
  checkbox,
  check_box: checkbox,
  radio,
  select,
  file,
  date,
  button,
  multiple_select,
  tabs,
  text_content
}

export const DefaultStyle = type => {
  return styleMap[type] || text
}

export const cssToObject = cssString => {
  const result = {}
  const rules = cssString.split('}')

  rules.forEach(rule => {
    if (rule.trim() === '') return

    const [selector, styles] = rule.split('{')
    const cleanedSelector = selector.trim()

    if (!cleanedSelector || !styles) return

    const styleObject = {}
    styles.split(';').forEach(style => {
      if (style.trim() === '') return

      const [property, value] = style.split(':').map(s => s.trim())
      if (property && value) {
        styleObject[property] = value // حفظ القيمة كما هي
      }
    })

    result[cleanedSelector] = styleObject
  })

  return result
}

export const objectToCss = cssObject => {
  let cssString = ''

  for (const selector in cssObject) {
    if (cssObject.hasOwnProperty(selector)) {
      const styles = cssObject[selector]
      let styleString = ''

      for (const property in styles) {
        if (styles.hasOwnProperty(property)) {
          const styleValue = styles[property]

          if (typeof styleValue === 'object' && styleValue.value !== undefined) {
            styleString += `${property}:${styleValue.value}${styleValue.unit};`
          } else {
            styleString += `${property}:${styleValue};`
          }
        }
      }

      cssString += `${selector} { ${styleString} }\n`
    }
  }

  return cssString.trim() // إزالة المسافات الزائدة في النهاية
}

export const getDataInObject = (object = {}, key) => {
  const keys = key.split('.')

  let result = object
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return ''
    }
  }

  return result
}

export const extractValueAndUnit = cssValue => {
  const match = cssValue.match(/^(-?\d*\.?\d+)([a-zA-Z%]*)$/)

  if (match) {
    return { value: parseFloat(match[1]), unit: match[2] || '' }
  }

  return { value: '', unit: cssValue }
}

export const VaildId = name => {
  return name.replaceAll(' ', '').replaceAll('[', '').replaceAll(']', '').replaceAll('/', '')
}

export const formatDate = (value, format) => {
  const date = new Date(value)

  const year = date.getFullYear()

  const month = String(date.getMonth() + 1).padStart(2, '0')

  const day = String(date.getDate()).padStart(2, '0')

  let time = ''
  if (format.includes('HH:mm')) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    time = `T${hours}:${minutes}`
  }

  return `${year}-${month}-${day}${time}`
}

export const getDomain = () => {
  return process.env.DEV_MODE ? 'http://localhost:3000/' : process.env.DOMAIN
}


export const getZIndex = (value) => {
  return `!z-[${value}]`
}
