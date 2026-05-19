import { Link, Rating } from '@mui/material'
import React from 'react'
import ImageLoad from 'src/Components/ImageLoad'
import { getData } from 'src/Components/_Shared'
import { Icon } from '@iconify/react'
import moment from 'moment'

function formatDate(rawValue, dateFormat, dateCustomFormat) {
  if (!rawValue) return ''
  const m = moment(rawValue)
  if (!m.isValid()) return String(rawValue)
  if (dateFormat === 'relative') return m.fromNow()
  if (dateFormat === 'custom') return dateCustomFormat ? m.format(dateCustomFormat) : m.format('DD/MM/YYYY')

  return m.format(dateFormat || 'DD/MM/YYYY')
}

function resolveImageUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:') || raw.startsWith('data:')) return raw

  return `${process.env.API_URL}/file/download/${raw}`
}

function renderNewItem(newitem, index, apiItem, locale, download) {
  if (newitem.type === 'image') {
    const src = (() => {
      if (!apiItem) return newitem.imageBlob || newitem.image || download?.src
      const template = newitem.image || ''
      if (!template) return download?.src
      if (template.includes('{')) {
        return template.replace(/\{([^}]+)\}/g, (_, key) => getData(apiItem, key.trim(), '') ?? '')
      }
      const resolved = getData(apiItem, template, '')

      return resolveImageUrl(typeof resolved === 'string' ? resolved : String(resolved ?? '')) || download?.src
    })()

    const imgHeight = newitem.imageHeight ? `${newitem.imageHeight}px` : '180px'

    return (
      <ImageLoad
        key={index}
        alt='product'
        className={`w-full ${newitem.className || ''}`}
        src={src}
        stop={true}
        style={{ width: '100%', height: imgHeight, minHeight: imgHeight, objectFit: 'cover' }}
      />
    )
  }

  if (newitem.type === 'title') {
    const titleKey = `title_${locale}`

    const text = apiItem
      ? (getData(apiItem, newitem[titleKey], null) ?? 'Product Name')
      : (newitem[titleKey] || 'Product Name')

    const titleLines = newitem.titleLines ? Number(newitem.titleLines) : undefined

    return (
      <h2
        key={index}
        style={{
          color: newitem.titleColor,
          fontSize: newitem.fontSize ? newitem.fontSize + 'px' : undefined,
          fontWeight: newitem.fontWeight || undefined,
          ...(titleLines ? {
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: titleLines,
            WebkitBoxOrient: 'vertical'
          } : {})
        }}
        className={`text-lg font-semibold mt-2 px-3 ${newitem.className || ''}`}
      >
        {text}
      </h2>
    )
  }

  if (newitem.type === 'description') {
    const descKey = `description_${locale}`

    const text = apiItem
      ? (getData(apiItem, newitem[descKey], null) ?? 'Product Description')
      : (newitem[descKey] || 'Product Description')

    const descLines = newitem.descriptionLines ? Number(newitem.descriptionLines) : undefined

    return (
      <p
        key={index}
        style={{
          color: newitem.descriptionColor,
          fontSize: newitem.fontSize ? newitem.fontSize + 'px' : undefined,
          fontWeight: newitem.fontWeight || undefined,
          ...(descLines ? {
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: descLines,
            WebkitBoxOrient: 'vertical'
          } : {})
        }}
        className={`text-sm text-gray-500 mt-1 px-3 ${newitem.className || ''}`}
      >
        {text}
      </p>
    )
  }

  if (newitem.type === 'price') {
    const text = apiItem
      ? (getData(apiItem, newitem.price, '0') ?? '0')
      : (newitem.price || '0')

    return (
      <p
        key={index}
        style={{ color: newitem.priceColor }}
        className={`text-lg font-semibold mt-2 text-end px-3 pb-2 ${newitem.className || ''}`}
      >
        {text}$
      </p>
    )
  }

  if (newitem.type === 'text') {
    const text = apiItem
      ? (getData(apiItem, newitem.text_en, null) ?? newitem[`text_${locale}`] ?? '')
      : (newitem[`text_${locale}`] || newitem.text_en || '')

    const textLines = newitem.textLines ? Number(newitem.textLines) : undefined

    return (
      <div
        key={index}
        style={{
          color: newitem.color,
          background: newitem.backgroundColor,
          fontSize: newitem.fontSize ? newitem.fontSize + 'px' : undefined,
          fontWeight: newitem.fontWeight || undefined,
          ...(textLines ? {
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: textLines,
            WebkitBoxOrient: 'vertical'
          } : {})
        }}
        className={`px-3 ${newitem.className || ''}`}
      >
        {text}
      </div>
    )
  }

  if (newitem.type === 'icon') {
    return (
      <div key={index} className={`flex items-center px-3 ${newitem.className || ''}`}>
        <Icon
          style={{
            color: newitem.color,
            fontSize: newitem.fontSize ? newitem.fontSize + 'px' : '1.5rem'
          }}
          icon={newitem.text_en || 'ph:binary-duotone'}
        />
      </div>
    )
  }

  if (newitem.type === 'rating') {
    const value = apiItem
      ? Number(getData(apiItem, newitem.text_en, 0) ?? 0)
      : Number(newitem.text_en || 0)

    return (
      <div key={index} className={`flex items-center px-3 ${newitem.className || ''}`}>
        <Rating sx={{ color: newitem.color }} readOnly value={value} />
      </div>
    )
  }

  if (newitem.type === 'date') {
    const rawValue = apiItem
      ? (getData(apiItem, newitem.dateKey, '') ?? '')
      : (newitem.dateKey || '')

    const formatted = formatDate(rawValue, newitem.dateFormat, newitem.dateCustomFormat)

    return (
      <p
        key={index}
        style={{
          color: newitem.color,
          fontSize: newitem.fontSize ? newitem.fontSize + 'px' : undefined,
          fontWeight: newitem.fontWeight || undefined
        }}
        className={`px-3 ${newitem.className || ''}`}
      >
        {formatted}
      </p>
    )
  }

  return null
}

export const resolveHref = (template, apiItem) => {
  if (!template) return ''
  if (!apiItem) return template

  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    const val = getData(apiItem, key.trim(), '')

    return val !== null && val !== undefined ? val : ''
  })
}

export default function CardCard({ item, data, locale, readOnly, download }) {
  const newItems = data.newItems || []
  const isHorizontal = data.cardLayout === 'horizontal'

  const firstSectionWidth = data.firstSectionWidth
    ? data.firstSectionWidth + (data.firstSectionWidthUnit || '%')
    : '40%'



  const hrefValue = (() => {
    if (item && data.hrefKey) {
      const fromApi = getData(item, data.hrefKey, '')

      return fromApi ? String(fromApi) : resolveHref(data.href, item)
    }

    return resolveHref(data.href, item)
  })()
  console.log(hrefValue, "hrefValue");
  const cardClassName = data.cardClassName || ''

  const validItems = newItems.filter(Boolean)

  let cardContent

  if (isHorizontal && validItems.length > 0) {
    const firstItem = validItems[0]
    const restItems = validItems.slice(1)

    cardContent = (
      <div
        className={`relative overflow-hidden rounded-md border border-gray-200 hover:shadow-lg hover:translate-y-[-5px] transition-all duration-300 flex flex-row w-full h-full ${cardClassName}`}
      >
        {/* First section */}
        <div className='shrink-0 overflow-hidden' style={{ width: firstSectionWidth }}>
          {renderNewItem(firstItem, 0, item, locale, download)}
        </div>

        {/* Rest of sections */}
        <div className='flex flex-col flex-1 py-1'>
          {restItems.map((newitem, index) =>
            renderNewItem(newitem, index + 1, item, locale, download)
          )}
        </div>
      </div>
    )
  } else {
    cardContent = (
      <div
        className={`relative overflow-hidden rounded-md border border-gray-200 hover:shadow-lg hover:translate-y-[-5px] transition-all duration-300 flex flex-col w-full h-full ${cardClassName}`}
      >
        {validItems.map((newitem, index) =>
          renderNewItem(newitem, index, item, locale, download)
        )}
      </div>
    )
  }

  if (hrefValue) {
    const isFromApi = item && data.hrefKey

    if (isFromApi) {
      return (
        <a href={hrefValue} className='block hover:cursor-pointer w-full h-full'>
          {cardContent}
        </a>
      )
    }

    return (
      <Link href={`/${locale}${hrefValue}`} className='block hover:cursor-pointer w-full h-full'>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className='w-full h-full'>
      {cardContent}
    </div>
  )
}
