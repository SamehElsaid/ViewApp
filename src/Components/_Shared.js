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
  textarea,
  progress_bar,
  collapse_section
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

export const getTypeFromCollection = (type, kind) => {
  const baseTypes = {
    SingleText: 'text',
    URL: 'url',
    Phone: 'tel',
    Email: 'email',
    Number: 'number',
    Date: 'date',
    Password: 'password',
    button: 'button',
    File: 'file',
    LongText: 'textarea'
  }

  if (kind === 'select') {
    return 'select'
  }

  if (kind === 'radio') {
    return 'radio'
  }

  if (kind === 'checkbox') {
    return 'checkbox'
  }
  if (kind === 'multiple_select') {
    return 'multiple_select'
  }


  if (kind === 'progress_bar') {
    return 'progress_bar'
  }

  if (baseTypes[type]) return baseTypes[type]



  return type.charAt(0).toUpperCase() + type.slice(1)
}

export const getTypeFromCollectionTarget = (type, description) => {
  const baseTypes = {
    SingleText: 'text',
    URL: 'url',
    Phone: 'tel',
    Email: 'email',
    Number: 'number',
    Date: 'date',
    Password: 'password',
    File: 'file',
    LongText: 'textarea',
    Boolean: 'boolean',
  }


  if (description === 'progress_bar') {
    return 'progress_bar'
  }

  if (baseTypes[type]) return baseTypes[type]

  if (type === 'OneToOne') {
    return 'OneToOne'
  }

  if (type === 'ManyToMany') {
    return 'ManyToMany'
  }

  if (type === 'OneToMany') {
    return 'OneToMany'
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
  text_content,
  progress_bar,
  collapse_section
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
  const safeFormat = typeof format === 'string' ? format : 'yyyy-MM-dd'
  if (safeFormat.includes('HH:mm')) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    time = `T${hours}:${minutes}`
  }

  return `${year}-${month}-${day}${time}`
}


const ReturnDataInProduction = (dev, string) => {
  return process.env.DEV_MODE ? dev : string
}

export const getAppConfig = () => {
  const appType = process.env.APP_TYPE
  const formBuilderClientId = "SINGLECLIC.LOWCODE.UI"
  const formBuilderClientSecret = "901564A5-E7FE-42CB-B10D-61EF6A8F3658"
  const redirectURLDev = "http://localhost:3000/"




  const clientConfig = {
    "Form Builder": {
      "client_id": formBuilderClientId,
      "client_secret": formBuilderClientSecret,
      redirect_uri: ReturnDataInProduction(redirectURLDev, "https://form-bulider-seven.vercel.app/")
    },
    "View as Admin": {
      "client_id": ReturnDataInProduction(formBuilderClientId, "SINGLECLIC.LOWCODE.INTERNAL.UI"),
      "client_secret": ReturnDataInProduction(formBuilderClientSecret, "901564A5-E7FE-42CB-B10D-61EF6A8F6654"),
      redirect_uri: ReturnDataInProduction(redirectURLDev, "https://view-as-admin.vercel.app/")
    },
    "View as User": {
      "client_id": ReturnDataInProduction(formBuilderClientId, "VIEW.APP"),
      "client_secret": ReturnDataInProduction(formBuilderClientSecret, "901564A5-E7FE-42CB-B10D-61EF6A8F3658"),
      redirect_uri: ReturnDataInProduction(redirectURLDev, "https://view-app-omega.vercel.app/")
    },
  }





  return clientConfig[appType] || clientConfig["Form Builder"]
}

export const getDomain = () => {
  return process.env.DEV_MODE ? 'http://localhost:3000/' : getAppConfig().redirect_uri
}

export const getZIndex = value => {
  return `!z-[${value}]`
}

export const replacePlaceholders = (url, windowLocation) => {
  return url.replace(/\{([^}]+)\}/g, (_, paramName) => {
    const params = new URLSearchParams(windowLocation.search)
    const value = params.get(paramName)

    return value ? value : ''
  })
}

export const getMaxLength = (value, maxLength) => {
  if (maxLength) {
    return value.slice(0, maxLength) + '...'
  }

  return value
}


export const borderTemplates = [
  {
    id: 'border1',
    name: 'حدود مزخرفة هندسية',
    description: 'حدود بنمط هندسي متكرر',
    preview: '🖼️',
    css: `
      position: relative;
      padding: 30px;
      background: white;
      border: 20px solid;
      border-image: repeating-linear-gradient(45deg, #8b5cf6, #8b5cf6 10px, #e0e7ff 10px, #e0e7ff 20px) 20;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: white;
      border: 20px solid;
      border-image: repeating-linear-gradient(45deg, #8b5cf6, #8b5cf6 10px, #e0e7ff 10px, #e0e7ff 20px) 20;
    `
  },
  {
    id: 'border2',
    name: 'حدود بسيطة مع زخارف',
    description: 'حدود رفيعة مع عناصر زخرفية في الزوايا',
    preview: '📐',
    css: `
      position: relative;
      padding: 30px;
      background: white;
      border: 2px solid #000;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: white;
      border: 2px solid #000;
    `
  },
  {
    id: 'border3',
    name: 'حدود كلاسيكية',
    description: 'حدود كلاسيكية أنيقة',
    preview: '🎨',
    css: `
      position: relative;
      padding: 40px;
      background: white;
      border: 15px solid #2d3748;
      box-shadow: inset 0 0 0 2px #fff, 0 0 0 2px #2d3748;
    `,
    borderStyle: `
      position: relative;
      padding: 40px;
      background: white;
      border: 15px solid #2d3748;
      box-shadow: inset 0 0 0 2px #fff, 0 0 0 2px #2d3748;
    `
  },
  {
    id: 'border4',
    name: 'حدود ملونة',
    description: 'حدود ملونة بنمط أوراق',
    preview: '🌿',
    css: `
      position: relative;
      padding: 30px;
      background: #fef3c7;
      border: 8px solid;
      border-image: repeating-linear-gradient(90deg, #10b981 0, #10b981 20px, #f59e0b 20px, #f59e0b 40px) 8;
      box-shadow: inset 0 0 0 2px #fbbf24;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: #fef3c7;
      border: 8px solid;
      border-image: repeating-linear-gradient(90deg, #10b981 0, #10b981 20px, #f59e0b 20px, #f59e0b 40px) 8;
      box-shadow: inset 0 0 0 2px #fbbf24;
    `
  },
  {
    id: 'border5',
    name: 'حدود بسيطة',
    description: 'حدود بسيطة وأنيقة',
    preview: '☀️',
    css: `
      position: relative;
      padding: 30px;
      background: #fffbeb;
      border: 3px solid #fbbf24;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: #fffbeb;
      border: 3px solid #fbbf24;
    `
  },
  {
    id: 'border6',
    name: 'حدود DNA',
    description: 'حدود بنمط DNA helix',
    preview: '🧬',
    css: `
      position: relative;
      padding: 30px;
      background: white;
      border: 10px solid #000;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: white;
      border: 10px solid #000;
    `
  },
  {
    id: 'border7',
    name: 'حدود بزخارف زوايا',
    description: 'حدود بزخارف في الزوايا فقط',
    preview: '✨',
    css: `
      position: relative;
      padding: 30px;
      background: white;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: white;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    `
  },
  {
    id: 'border8',
    name: 'حدود بني',
    description: 'حدود بسيطة بلون بني',
    preview: '📄',
    css: `
      position: relative;
      padding: 30px;
      background: white;
      border: 4px solid #92400e;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: white;
      border: 4px solid #92400e;
    `
  },
  {
    id: 'border9',
    name: 'حدود كروم مع أزهار',
    description: 'حدود بنمط كروم مع أزهار',
    preview: '🌸',
    css: `
      position: relative;
      padding: 30px;
      background: #f3f4f6;
      border: 8px solid #000;
    `,
    borderStyle: `
      position: relative;
      padding: 30px;
      background: #f3f4f6;
      border: 8px solid #000;
    `
  },
  {
    id: 'border_custom',
    name: 'مخصص',
    description: 'إنشاء حدود مخصصة',
    preview: '⚙️',
    css: '',
    borderStyle: ''
  }
]


export const appViewOptions = [
  {
    name_ar: 'جميع العروض',
    name_en: 'All',
    id: 4
  }, {
    name_ar: 'منشئ النماذج',
    name_en: 'Form Builder',
    id: 1
  },
  {
    name_ar: 'عرض كمدير',
    name_en: 'View as Admin',
    id: 2
  },
  {
    name_ar: 'عرض كمستخدم',
    name_en: 'View as User',
    id: 3
  },

]
