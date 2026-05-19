import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { MdApps } from 'react-icons/md'
import { getData } from 'src/Components/_Shared'
import ServicesSliderControl from '../ServicesSliderControl'
import get from 'lodash/get'
import Link from 'next/link'
import { resolveHref } from '../CardCard'

function resolveImageUrl(raw) {
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

  return `${process.env.API_URL}/file/download/${raw}`
}

function formatDate(raw, locale) {
  if (!raw) return ''
  try {
    return new Date(raw).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  } catch {

    return raw
  }
}

const BADGE_COLORS = ['#e53e3e', '#2f855a', '#2b6cb0', '#b7791f', '#6b46c1', '#c05621', '#285e61', '#97266d']

function pickColor(index) {
  return BADGE_COLORS[index % BADGE_COLORS.length]
}

function NewsCard({ service, data, locale, isLarge = false, index = 0 }) {
  const isRtl = locale === 'ar'

  const imgSrc = (() => {
    const template = data?.imagePath || data?.iconPath || 'imageUrl'
    if (template.includes('{')) {
      return template.replace(/\{([^}]+)\}/g, (_, key) => getData(service, key, '') ?? '')
    }

    return resolveImageUrl(getData(service, template, ''))
  })()
  const localeTitlePath = locale === 'ar' ? data?.titlePath_ar : data?.titlePath_en
  const title = getData(service, localeTitlePath || data?.titlePath || `title_${locale}`, getData(service, 'title_ar', ''))
  const localeCategoryPath = locale === 'ar' ? data?.categoryPath_ar : data?.categoryPath_en
  const category = getData(service, localeCategoryPath || data?.categoryPath || `category.name_${locale}`, getData(service, 'category.name_ar', ''))

  const badgeColor = (() => {
    if (data?.categoryColorPath) {
      const fromApi = getData(service, data.categoryColorPath, '')
      if (fromApi) return fromApi
    }

    return pickColor(index)
  })()
  const dateRaw = getData(service, data?.datePath || 'publishedAt', '')
  const author = getData(service, data?.authorPath || 'author.name', '')


  const hrefValue = (() => {
    if (service && data.urlPath) {
      const fromApi = getData(service, data.urlPath, '')

      return fromApi ? String(fromApi) : resolveHref(data.urlPath, service)
    }

    return resolveHref(data.urlPath, service)
  })()

  console.log(hrefValue, "hrefValue");

  return (
    <Link
      href={`/${locale}${hrefValue}`}
      className='relative block w-full h-full rounded-xl overflow-hidden group'
      style={{ display: 'block' }}
    >
      {/* Background image */}
      {imgSrc
        ? <img src={imgSrc} alt={title} className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
        : <div className='absolute inset-0 bg-gray-700' />
      }

      {/* Gradient overlay */}
      <div className='absolute inset-0' style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Category badge */}
      {category && (
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} z-10`}>
          <span
            className='text-white text-xs font-semibold px-2.5 py-1 rounded-full'
            style={{ backgroundColor: badgeColor }}
          >
            {category}
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className={`absolute bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-full p-4 z-10`} dir={isRtl ? 'rtl' : 'ltr'}>
        {(author || dateRaw) && (
          <p className='text-gray-300 text-xs mb-1.5 flex items-center gap-2'>
            {author && <span>{author}</span>}
            {author && dateRaw && <span className='opacity-50'>·</span>}
            {dateRaw && <span>{formatDate(dateRaw, locale)}</span>}
          </p>
        )}
        <h3
          className={`text-white font-bold leading-snug line-clamp-3 ${isLarge ? 'text-xl' : 'text-sm'}`}
        >
          {title}
        </h3>
      </div>
    </Link>
  )
}

export default function useServicesSlider({ locale, buttonRef, advancedEdit }) {
  const { messages } = useIntl()

  const ServicesSlider = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const apiData = useSelector(state => state.api.data)
        const [items, setItems] = useState([])
        const isRtl = locale === 'ar'
        const highlightColor = data?.highlightColor || '#3b5bdb'
        const gridHeight = data?.height || 500

        useEffect(() => {
          if (data?.api_url) {
            const found = apiData.find(item => item.link === data.api_url)
            if (found?.data) {
              const result = data.itemsPath ? get(found.data, data.itemsPath) : found.data
              if (Array.isArray(result)) setItems(result)
              else setItems([])
            }
          } else {
            setItems([])
          }
        }, [apiData, data?.api_url, data?.itemsPath])

        const sectionTitle = data?.[`sectionTitle_${locale}`] || data?.sectionTitle_ar || ''
        const sectionSubtitle = data?.[`sectionSubtitle_${locale}`] || ''
        const moreLabel = isRtl ? 'المزيد' : 'More'

        return (
          <div data-section='services-slider' className='' dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Section Header */}
            {(sectionTitle || data?.moreButtonUrl) && (
              <div className='flex items-start justify-between mb-5 max-w-screen-xl mx-auto'>
                <div>
                  {sectionTitle && <h2 className='text-2xl font-bold text-gray-800'>{sectionTitle}</h2>}
                  {sectionSubtitle && <p className='text-sm text-gray-500 mt-1'>{sectionSubtitle}</p>}
                </div>
                {data?.moreButtonUrl && (
                  <a
                    href={data.moreButtonUrl}
                    className='flex items-center gap-1 text-sm font-medium shrink-0 mt-1 hover:underline'
                    style={{ color: highlightColor }}
                  >
                    {moreLabel}
                    <span>{isRtl ? ' ←' : ' →'}</span>
                  </a>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <div
                className='max-w-screen-xl mx-auto rounded-xl flex items-center justify-center text-gray-400 text-sm'
                style={{ height: gridHeight, background: '#f3f4f6' }}
              >
                {data?.api_url ? 'Loading...' : 'Configure API URL in settings'}
              </div>
            ) : (
              <div
                className='max-w-screen-xl mx-auto flex gap-3'
                style={{ height: gridHeight, direction: isRtl ? 'rtl' : 'ltr' }}
              >
                {/* Featured large card — first item */}
                <div className='flex-1 min-w-0'>
                  <NewsCard service={items[0]} data={data} locale={locale} isLarge index={0} />
                </div>

                {/* Right 2×2 grid — items 1..4 */}
                {items.length > 1 && (
                  <div className='flex-1 min-w-0 grid grid-cols-2 gap-3'>
                    {items.slice(1, 5).map((service, i) => (
                      <NewsCard key={i} service={service} data={data} locale={locale} index={i + 1} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      },
      id: 'servicesSlider',
      title: messages?.servicesSlider?.title || 'News Grid',
      description: messages?.servicesSlider?.description || 'Featured news grid: 1 large card + 2×2 smaller cards',
      version: 1,
      icon: <MdApps className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <ServicesSliderControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, advancedEdit])

  return { ServicesSlider }
}
