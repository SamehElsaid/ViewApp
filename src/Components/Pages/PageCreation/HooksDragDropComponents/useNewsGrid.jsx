import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { MdArticle } from 'react-icons/md'
import { getData, getMaxLength, formatDate } from 'src/Components/_Shared'
import NewsGridControl from '../NewsGridControl'

function resolveImageUrl(raw) {
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

  return `${process.env.API_URL}/file/download/${raw}`
}
function CategoryChip({ label, colorMap }) {
  const color = colorMap?.find(c => c.categoryName === label)?.color || '#3b5bdb'

  return (
    <span className='inline-block text-white text-xs px-2 py-0.5 rounded' style={{ backgroundColor: color }}>
      {label}
    </span>
  )
}
function LargeNewsCard({ item, data, locale, colorMap }) {
  const imgSrc = resolveImageUrl(getData(item, data?.imageUrlPath || 'coverImage', ''))
  const title = getMaxLength(getData(item, data?.titlePath || `title_${locale}`, ''), 85)
  const category = getData(item, data?.categoryPath || 'category', '')
  const date = formatDate(getData(item, data?.datePath || 'publishedAt', ''), 'DD MMM YYYY')
  const url = getData(item, data?.urlPath || 'url', '#')

  return (
    <a href={url} className='block relative overflow-hidden rounded-lg group' style={{ minHeight: 380 }}>
      {imgSrc && (
        <img src={imgSrc} alt={title} className='w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300' />
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
      <div className='absolute bottom-0 p-4 w-full'>
        {category && <CategoryChip label={category} colorMap={colorMap} />}
        <h2 className='text-white font-bold text-lg mt-2 leading-snug'>{title}</h2>
        <p className='text-white/70 text-xs mt-1'>{date}</p>
      </div>
    </a>
  )
}
function SmallNewsCard({ item, data, locale, colorMap }) {
  const imgSrc = resolveImageUrl(getData(item, data?.imageUrlPath || 'coverImage', ''))
  const title = getMaxLength(getData(item, data?.titlePath || `title_${locale}`, ''), 50)
  const category = getData(item, data?.categoryPath || 'category', '')
  const date = formatDate(getData(item, data?.datePath || 'publishedAt', ''), 'DD MMM YYYY')
  const url = getData(item, data?.urlPath || 'url', '#')

  return (
    <a href={url} className='flex gap-3 group items-start'>
      {imgSrc && (
        <img src={imgSrc} alt={title} className='w-24 h-20 object-cover rounded shrink-0 group-hover:opacity-90' />
      )}
      <div className='flex-1 min-w-0'>
        {category && <CategoryChip label={category} colorMap={colorMap} />}
        <h3 className='text-gray-800 font-semibold text-sm mt-1 leading-snug group-hover:text-blue-600 transition-colors'>{title}</h3>
        <p className='text-gray-400 text-xs mt-1'>{date}</p>
      </div>
    </a>
  )
}

export default function useNewsGrid({ locale, buttonRef, advancedEdit }) {
  const { messages } = useIntl()

  const NewsGrid = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const apiData = useSelector(state => state.api.data)
        const [news, setNews] = useState([])
        const isRtl = locale === 'ar'
        const colorMap = data?.categoryColorMap || []
        useEffect(() => {
          if (data?.api_url) {
            const found = apiData.find(item => item.link === data.api_url)
            if (found?.data && Array.isArray(found.data)) {
              setNews(found.data.slice(0, data?.maxItems || 4))
            }
          }
        }, [apiData, data?.api_url])
        const sectionTitle = data?.[`sectionTitle_${locale}`] || data?.sectionTitle_ar || ''
        const sectionSubtitle = data?.[`sectionSubtitle_${locale}`] || ''
        
        return (
          <div data-section='news-grid' className='py-10 px-4' dir={isRtl ? 'rtl' : 'ltr'}>
            <div className='max-w-screen-xl mx-auto'>
              {/* Section Header */}
              {sectionTitle && (
                <div className='mb-6 text-end'>
                  <h2 className='text-2xl font-bold text-gray-800'>{sectionTitle}</h2>
                  {sectionSubtitle && <p className='text-sm text-gray-500 mt-1'>{sectionSubtitle}</p>}
                </div>
              )}
              {news.length === 0 ? (
                <div className='text-center text-gray-400 py-10 text-sm'>
                  {data?.api_url ? 'Loading news...' : 'Configure News API URL in settings'}
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                  {/* Large featured card */}
                  <div className='md:col-span-3'>
                    {news[0] && <LargeNewsCard item={news[0]} data={data} locale={locale} colorMap={colorMap} />}
                  </div>
                  {/* Small cards stack */}
                  <div className='md:col-span-2 flex flex-col gap-4 justify-between'>
                    {news.slice(1, 4).map((item, i) => (
                      <SmallNewsCard key={i} item={item} data={data} locale={locale} colorMap={colorMap} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      },
      id: 'newsGrid',
      title: messages?.newsGrid?.title || 'News Grid',
      description: messages?.newsGrid?.description || '1 large + 3 small news cards layout from backend collection',
      version: 1,
      icon: <MdArticle className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <NewsGridControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, advancedEdit])
  
  return { NewsGrid }
}