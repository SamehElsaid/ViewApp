import { useEffect, useMemo, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { MdViewCarousel, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { getData, getMaxLength } from 'src/Components/_Shared'
import HeroSliderControl from '../HeroSliderControl'
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.min.css'
import get from 'lodash/get'
import { BiSolidRightArrow } from 'react-icons/bi'

SwiperCore.use([Autoplay, Navigation, Pagination])

function hexToRgba(hex, opacity) {
    if (!hex || !hex.startsWith('#')) {
        return `rgba(0,0,0,${opacity})`
    }

    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return `rgba(${r},${g},${b},${opacity})`
}

function resolveImageUrl(raw) {
    if (!raw) return ''
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

    return `${process.env.API_URL}/file/download/${raw}`
}

function Skeleton() {

    return (
        <div className='w-full animate-pulse' style={{ height: 480, background: '#e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className='text-gray-400 text-sm'>Configure Slides API URL in settings</span>
        </div>
    )
}

export default function useHeroSlider({ locale, buttonRef, advancedEdit }) {
    const { messages } = useIntl()

    const HeroSlider = useMemo(() => {

        return {
            Renderer: ({ data }) => {
                const apiData = useSelector(state => state.api.data)
                const [slides, setSlides] = useState([])
                const [tickerItems, setTickerItems] = useState([])
                const [searchQuery, setSearchQuery] = useState('')
                const [searchCategory, setSearchCategory] = useState('')
                const [searchType, setSearchType] = useState('')
                const [searchOptions, setSearchOptions] = useState([])
                const prevRef = useRef(null)
                const nextRef = useRef(null)
                const [swiperInstance, setSwiperInstance] = useState(null)
                const isRtl = locale === 'ar'
                const height = data?.height || 480

                const navBtnBg = hexToRgba(data?.navBtnBg || '#ffffff', (data?.navBtnOpacity ?? 70) / 100)
                const navBtnColor = data?.navBtnColor || '#333333'
                const ctaBgColor = data?.ctaBgColor || '#f97316'
                const ctaTextColor = data?.ctaTextColor || '#ffffff'
                const badgeBgColor = data?.badgeBgColor || '#ea580c'

                useEffect(() => {
                    if (swiperInstance && prevRef.current && nextRef.current) {
                        swiperInstance.params.navigation.prevEl = prevRef.current
                        swiperInstance.params.navigation.nextEl = nextRef.current
                        swiperInstance.navigation.destroy()
                        swiperInstance.navigation.init()
                        swiperInstance.navigation.update()
                    }
                }, [swiperInstance])

                useEffect(() => {
                    if (data?.api_url) {
                        const found = apiData.find(item => item.link === data.api_url)
                        if (found?.data) {
                            const result = data.key ? get(found.data, data.key) : found.data
                            if (Array.isArray(result)) setSlides(result)
                        }
                    }
                }, [apiData, data?.api_url, data?.key])
                useEffect(() => {
                    if (data?.tickerApi_url) {
                        const found = apiData.find(item => item.link === data.tickerApi_url)
                        if (found?.data) {
                            const result = data.tickerItemsPath ? get(found.data, data.tickerItemsPath) : found.data
                            if (Array.isArray(result)) setTickerItems(result)
                        }
                    }
                }, [apiData, data?.tickerApi_url, data?.tickerItemsPath])
                useEffect(() => {
                    if (data?.searchApi_url) {
                        const found = apiData.find(item => item.link === data.searchApi_url)
                        if (found?.data && Array.isArray(found.data)) {
                            setSearchOptions(found.data)
                        }
                    }
                }, [apiData, data?.searchApi_url])
                if (!data?.api_url || slides.length === 0) return <Skeleton />
                const slidesPerView = data?.slidesCount ? parseInt(data.slidesCount, 10) : 1
                const illustrationSrc = resolveImageUrl(data?.illustrationImage || data?.illustrationUrl)

                const siteTitle = locale === 'ar'
                    ? (data?.siteTitle_ar || data?.siteTitle_en || '')
                    : (data?.siteTitle_en || data?.siteTitle_ar || '')
                const hasHeaderCard = illustrationSrc || siteTitle
                const hasSearch = data?.searchMode === 'simple' || data?.searchMode === 'advanced'

                const accentColor = data?.cardAccentColor || '#3b82f6'
                const accentRgba = hexToRgba(accentColor, 0.28)

                return (
                    <div data-section='hero-slider' className='relative w-full ' style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                        {/* Breaking news ticker */}
                        {data?.tickerApi_url && tickerItems.length > 0 && (
                            <div className='text-sm py-2 relative z-40' style={{ background: data?.tickerBgColor || '#dc2626', color: data?.tickerTextColor || '#ffffff' }}>
                                <Marquee speed={50} pauseOnHover={true} gradient={false}>
                                    {tickerItems.map((t, i) => (
                                        <span key={i} className='mx-8'>{getData(t, data?.tickerTextField || 'title', '')}</span>
                                    ))}
                                </Marquee>
                            </div>
                        )}

                        {(hasSearch) && (
                            <div className="pt-[10px] mt-10 relative">
                                <>
                                    <div
                                        className='absolute -top-5 z-30 '
                                        style={{
                                            left: '5%',
                                            right: '5%',

                                        }}
                                    >
                                        <div className="flex gap-6">
                                            <div style={{ backgroundColor: accentColor }} className="w-[4px]  rounded-full"></div>

                                            <div
                                                className="bg-white w-full rounded-lg"
                                                style={{
                                                    boxShadow: `4px 6px 24px ${accentRgba}, 0 2px 8px rgba(0,0,0,0.08)`,
                                                }}>
                                                <div className='flex w-full items-stretch px-5  gap-5' dir={isRtl ? 'rtl' : 'ltr'}>
                                                    {/* Illustration */}
                                                 

                                                    {/* Vertical accent divider */}
                                                

                                                    {/* Right column: title + search */}
                                                    {(siteTitle || hasSearch) && (
                                                        <div className='flex-1 flex flex-col justify-center gap-3 ps-5 py-5'>
                                                            {siteTitle && (
                                                                <p
                                                                    className='font-bold text-gray-800 leading-snug whitespace-pre-line '
                                                                    style={{ fontSize: '2.15rem' }}
                                                                    dir={isRtl ? 'rtl' : 'ltr'}
                                                                >
                                                                    {siteTitle}
                                                                </p>
                                                            )}
                                                            {hasSearch && (
                                                                <div
                                                                    className='flex items-center rounded-full px-4 py-2 gap-2'
                                                                    style={{ background: '#f1f3f5' }}
                                                                    dir={isRtl ? 'rtl' : 'ltr'}
                                                                >
                                                                    {data?.searchMode === 'advanced' && searchOptions.length > 0 && (
                                                                        <>
                                                                            <select
                                                                                className='border-0 bg-transparent text-sm outline-none text-gray-500'
                                                                                value={searchCategory}
                                                                                onChange={e => setSearchCategory(e.target.value)}
                                                                            >
                                                                                <option value=''>{isRtl ? 'القسم' : 'Category'}</option>
                                                                                {searchOptions.map((opt, oi) => (
                                                                                    <option key={oi} value={getData(opt, 'value', oi)}>
                                                                                        {getData(opt, `label_${locale}`, getData(opt, 'label', oi))}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                className='border-0 bg-transparent text-sm outline-none text-gray-500'
                                                                                value={searchType}
                                                                                onChange={e => setSearchType(e.target.value)}
                                                                            >
                                                                                <option value=''>{isRtl ? 'الاختيار' : 'Type'}</option>
                                                                            </select>
                                                                        </>
                                                                    )}     <svg
                                                                        width='16' height='16'
                                                                        viewBox='0 0 24 24'
                                                                        fill='none'
                                                                        stroke='#9ca3af'
                                                                        strokeWidth='2.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        className='flex-shrink-0'
                                                                    >
                                                                        <circle cx='11' cy='11' r='8' />
                                                                        <path d='m21 21-4.35-4.35' />
                                                                    </svg>
                                                                    <input
                                                                        type='text'
                                                                        className='flex-1 bg-transparent outline-none text-sm text-gray-500 '
                                                                        placeholder={isRtl ? 'البحث' : 'Search...'}
                                                                        value={searchQuery}
                                                                        onChange={e => setSearchQuery(e.target.value)}
                                                                        dir={isRtl ? 'rtl' : 'ltr'}
                                                                    />

                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                       {illustrationSrc && (
                                                        <div style={{
                                                            width: data?.illustrationWidth
                                                                ? `${data.illustrationWidth}${data?.illustrationWidthUnit || 'px'}`
                                                                : 'auto',
                                                            height: data?.illustrationHeight
                                                                ? `${data.illustrationHeight}${data?.illustrationHeightUnit || 'px'}`
                                                                : 'auto',
                                                        }} className='flex-shrink-0 flex items-center  pe-4 my-auto'>
                                                            <img
                                                                src={illustrationSrc}
                                                                alt=''
                                                                className='w-full h-full '
                                                                style={{
                                                                    objectFit: data?.illustrationFit || 'contain',
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </>
                                {/* Header overlay card */}
                            </div>
                        )}
                        <div className='relative'>
                            {/* Swiper */}
                            <Swiper
                                key={`swiper-${slidesPerView}`}
                                dir={isRtl ? 'rtl' : 'ltr'}
                                onSwiper={setSwiperInstance}
                                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                                pagination={data?.showPagination !== false ? { clickable: true } : false}
                                autoplay={data?.autoplay ? { delay: data?.autoplayDelay || 4000, disableOnInteraction: false } : false}
                                slidesPerView={slidesPerView}
                                spaceBetween={slidesPerView > 1 ? 16 : 0}
                                loop={slides.length > slidesPerView}
                                style={{ width: '100%', height }}
                            >
                                {slides.map((slide, i) => {
                                    const imgSrc = (() => {
                                        const template = data?.imageUrlPath || 'imageUrl'
                                        if (template.includes('{')) {
                                            return template.replace(/\{([^}]+)\}/g, (_, key) => getData(slide, key, '') ?? '')
                                        }

                                        return resolveImageUrl(getData(slide, template, ''))
                                    })()
                                    const badgeText = data?.titlePath ? getData(slide, data.titlePath, '') : ''
                                    const description = data?.subtitlePath ? getMaxLength(getData(slide, data.subtitlePath, ''), 120) : ''
                                    const ctaLabel = data?.ctaLabelPath ? getData(slide, data.ctaLabelPath, '') : ''
                                    const ctaUrl = data?.ctaUrlPath ? getData(slide, data.ctaUrlPath, '#') : '#'

                                    return (
                                        <SwiperSlide key={i} style={{ height }}>
                                            <div
                                                className='relative w-full h-full'
                                                style={{
                                                    background: imgSrc ? `url(${imgSrc}) center/cover no-repeat` : '#1e3a5f',
                                                    height: '100%'
                                                }}
                                            >
                                                {/* Bottom gradient overlay */}
                                                <div
                                                    className='absolute inset-0'
                                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 75%)' }}
                                                />
                                                {/* Slide bottom content */}
                                                <div
                                                    className={`absolute z-10 ${isRtl ? 'text-right' : 'text-left'}`}
                                                    style={{
                                                        bottom: data?.contentOffsetY ?? 48,
                                                        ...(isRtl
                                                            ? { right: data?.contentOffsetX ?? 32 }
                                                            : { left: data?.contentOffsetX ?? 32 }),
                                                        maxWidth: `${data?.contentMaxWidth ?? 55}%`,
                                                    }}
                                                >
                                                    {badgeText && (
                                                        <span
                                                            className='inline-block px-4 py-2 text-sm font-bold rounded-lg mb-3'
                                                            style={{ background: badgeBgColor, color: '#fff' }}
                                                        >
                                                            {badgeText}
                                                        </span>
                                                    )}
                                                    {description && (
                                                        <p className='text-white text-base leading-relaxed mb-4'>{description}</p>
                                                    )}
                                                    {ctaLabel && (
                                                        <a
                                                            href={ctaUrl}
                                                            className={`inline-flex items-center gap-3 text-white text-sm font-medium hover:opacity-80 transition-opacity `}
                                                        >
                                                            <span
                                                                className='w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md'
                                                                style={{ background: ctaBgColor }}
                                                            >
                                                                <BiSolidRightArrow color={ctaTextColor || 'black'} className={`${locale === 'ar' ? 'rotate-180' : ''} text-xl`} />
                                                            </span>
                                                            <span>{ctaLabel}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>



                            {/* Navigation arrows */}
                            {data?.showNavigation !== false && (
                                <>
                                    <button
                                        ref={isRtl ? nextRef : prevRef}
                                        className={`absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${data?.navigationClass || ''}`}
                                        style={{
                                            left: data?.navBtnOffset ?? 20,
                                            width: data?.navBtnSize ?? 40,
                                            height: data?.navBtnSize ?? 40,
                                            background: navBtnBg,
                                            color: navBtnColor,
                                        }}
                                        aria-label={isRtl ? 'التالي' : 'Previous'}
                                    >
                                        {isRtl ? <MdChevronRight size={(data?.navBtnSize ?? 40) * 0.6} /> : <MdChevronLeft size={(data?.navBtnSize ?? 40) * 0.6} />}
                                    </button>
                                    <button
                                        ref={isRtl ? prevRef : nextRef}
                                        className={`absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${data?.navigationClass || ''}`}
                                        style={{
                                            right: data?.navBtnOffset ?? 20,
                                            width: data?.navBtnSize ?? 40,
                                            height: data?.navBtnSize ?? 40,
                                            background: navBtnBg,
                                            color: navBtnColor,
                                        }}
                                        aria-label={isRtl ? 'السابق' : 'Next'}
                                    >
                                        {isRtl ? <MdChevronLeft size={(data?.navBtnSize ?? 40) * 0.6} /> : <MdChevronRight size={(data?.navBtnSize ?? 40) * 0.6} />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )
            },
            id: 'heroSlider',
            title: messages?.heroSlider?.title || 'Hero Slider',
            description: messages?.heroSlider?.description || 'Full-width hero slider with dynamic slides from backend API',
            version: 1,
            icon: <MdViewCarousel className='text-2xl' />,
            controls: {
                type: 'custom',
                Component: ({ data, onChange }) => (
                    <HeroSliderControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
                )
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale, advancedEdit])

    return { HeroSlider }
}