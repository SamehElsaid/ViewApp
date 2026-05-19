import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { MdBusiness } from 'react-icons/md'
import { getData } from 'src/Components/_Shared'
import LogosCarouselControl from '../LogosCarouselControl'
import SwiperCore, { Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.min.css'

SwiperCore.use([Autoplay])
function resolveImageUrl(raw) {
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

  return `${process.env.API_URL}/file/download/${raw}`
}

export default function useLogosCarousel({ locale, buttonRef }) {
  const { messages } = useIntl()

  const LogosCarousel = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const apiData = useSelector(state => state.api.data)
        const [logos, setLogos] = useState(data?.logos || [])
        const isRtl = locale === 'ar'
        useEffect(() => {
          if (data?.api_url) {
            const found = apiData.find(item => item.link === data.api_url)
            if (found?.data && Array.isArray(found.data)) {
              setLogos(found.data)
            }
          } else {
            setLogos(data?.logos || [])
          }
        }, [apiData, data?.api_url, data?.logos])
        const sectionTitle = data?.[`title_${locale}`] || data?.title_ar || ''
        const sectionDesc = data?.[`description_${locale}`] || data?.description_ar || ''
        const grayscale = data?.grayscale !== false

        return (
          <div data-section='logos-carousel' className='py-10 px-4 bg-gray-50' dir={isRtl ? 'rtl' : 'ltr'}>
            <div className='max-w-screen-xl mx-auto'>
              {(sectionTitle || sectionDesc) && (
                <div className='text-center mb-6'>
                  {sectionTitle && <h2 className='text-xl font-bold text-gray-800'>{sectionTitle}</h2>}
                  {sectionDesc && <p className='text-sm text-gray-500 mt-1'>{sectionDesc}</p>}
                </div>
              )}
              {logos.length === 0 ? (
                <div className='text-center text-gray-400 py-6 text-sm'>
                  {data?.api_url ? 'Loading logos...' : 'Configure Logos API URL or add logos in settings'}
                </div>
              ) : (
                <Swiper
                  dir={isRtl ? 'rtl' : 'ltr'}
                  loop
                  autoplay={{ delay: data?.autoplaySpeed || 2500, disableOnInteraction: false }}
                  spaceBetween={24}
                  breakpoints={{
                    0: { slidesPerView: 2 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 }
                  }}
                >
                  {logos.map((logo, i) => {
                    const imgSrc = resolveImageUrl(
                      data?.api_url
                        ? getData(logo, data?.imageUrlPath || 'logoUrl', '')
                        : logo.image || ''
                    )
                    
                    const link = data?.api_url
                      ? getData(logo, data?.linkPath || 'link', '#')
                      : logo.link || '#'

                    const alt = data?.api_url
                      ? getData(logo, data?.altPath || 'alt', '')
                      : logo.alt || ''

                    return (
                      <SwiperSlide key={i} className='flex items-center justify-center'>
                        <a href={link} target='_blank' rel='noopener noreferrer' className='flex items-center justify-center p-2'>
                          <img
                            src={imgSrc}
                            alt={alt}
                            className='h-12 w-auto object-contain transition-all duration-300'
                            style={{
                              filter: grayscale ? 'grayscale(100%)' : 'none',
                              opacity: 0.7
                            }}
                            onMouseEnter={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.opacity = '1' }}
                            onMouseLeave={e => { e.currentTarget.style.filter = grayscale ? 'grayscale(100%)' : 'none'; e.currentTarget.style.opacity = '0.7' }}
                          />
                        </a>
                      </SwiperSlide>
                    )
                  })}
                </Swiper>
              )}
            </div>
          </div>
        )
      },
      id: 'logosCarousel',
      title: messages?.logosCarousel?.title || 'Logos Carousel',
      description: messages?.logosCarousel?.description || 'Auto-playing partner/affiliate logos carousel',
      version: 1,
      icon: <MdBusiness className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <LogosCarouselControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])
  
  return { LogosCarousel }
}