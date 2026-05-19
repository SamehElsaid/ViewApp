import { useEffect, useRef, useState } from 'react'
import CardCard from './CardCard'
import { useSelector } from 'react-redux'
import download from 'src/Components/img/download.png'
import CardAppleWatch from 'src/Components/analytics/CardAppleWatch'
import { getData } from 'src/Components/_Shared'
import EcommerceStatistics from 'src/Components/analytics/EcommerceStatistics'
import get from 'lodash/get'
import SwiperCore, { Navigation, Scrollbar } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.min.css'

SwiperCore.use([Navigation, Scrollbar])

export default function ViewCart({ data, locale, onChange, readOnly }) {
  const childrenView = data.childrenView ?? 'auto'
  const apiData = useSelector(state => state.api.data)
  const [items, setItems] = useState([])
  const [verticalPage, setVerticalPage] = useState(0)
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  useEffect(() => {
    const findItems = apiData.find(item => item.id === data.api_url)
    if (findItems) {
      const raw = findItems?.data ?? []
      const result = data.key ? get(raw, data.key, []) : raw
      setItems(Array.isArray(result) ? result : [])
    } else {
      setItems([])
    }
  }, [apiData, data.api_url, data.key])

  useEffect(() => { setVerticalPage(0) }, [data.slidesPerView, data.api_url, data.key])

  if (data.cart_type === 'slide') {
    const slideItems = data.api_url ? items : [{}]
    const sectionTitle = data[`sectionTitle_${locale}`] || ''
    const sectionDescription = data[`sectionDescription_${locale}`] || ''
    const seeMoreLabel = data[`seeMoreText_${locale}`] || (locale === 'ar' ? 'عرض المزيد' : 'See More')

    const isVertical = data.slideDirection === 'vertical'

    if (isVertical) {
      const perPage = Number(data.slidesPerView) || 3
      const totalPages = Math.ceil(slideItems.length / perPage)
      const visibleItems = slideItems.slice(verticalPage * perPage, verticalPage * perPage + perPage)

      return (
        <div className='w-full'>
          {/* Section Header */}
          {(sectionTitle || sectionDescription || (data.seeMoreShow !== 'none' && data.seeMoreUrl)) && (
            <div className='flex items-start justify-between mb-4 px-1'>
              <div>
                {sectionTitle && <h2 className='text-xl font-bold text-gray-800'>{sectionTitle}</h2>}
                {sectionDescription && <p className='text-sm text-gray-500 mt-1'>{sectionDescription}</p>}
              </div>
              {data.seeMoreShow !== 'none' && data.seeMoreUrl && (
                <a
                  href={data.seeMoreUrl}
                  style={{
                    backgroundColor: data.seeMoreBgColor || 'transparent',
                    color: data.seeMoreTextColor || '#3b5bdb',
                    borderColor: data.seeMoreTextColor || '#3b5bdb'
                  }}
                  className='border rounded-md px-4 py-1 text-sm font-medium shrink-0 transition-opacity hover:opacity-75'
                >
                  {seeMoreLabel}
                </a>
              )}
            </div>
          )}
          {/* Items */}
          <div className='flex flex-col' style={{ gap: `${Number(data.spaceBetween) || 20}px` }}>
            {visibleItems.map((item, index) => (
              <CardCard
                key={verticalPage * perPage + index}
                item={item}
                data={data}
                download={download}
                locale={locale}
                index={verticalPage * perPage + index}
                onChangePerant={onChange}
                readOnly={readOnly}
                api={data.api_url}
              />
            ))}
          </div>
          {/* Up / Down Arrows */}
          <div className={`flex gap-3 mt-4 ${locale === 'ar' ? 'justify-start' : 'justify-end'} ${data.navClassName || ''}`}>
            {/* السابق / Previous */}
            <button
              onClick={() => setVerticalPage(p => Math.max(0, p - 1))}
              disabled={verticalPage === 0}
              className='flex  items-center gap-2 rounded-full px-4 py-2 transition-opacity hover:opacity-80 disabled:opacity-0 disabled:cursor-not-allowed select-none'
              style={{
                backgroundColor: data.arrowBgColor || '#1e3a6e',
                color: data.arrowColor || '#ffffff',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}
            >
              <span className='text-sm font-medium leading-none'>
                {locale === 'ar' ? 'السابق' : 'Prev'}
              </span>
              <span
                className='w-7 h-7 flex items-center justify-center rounded-full text-lg font-bold leading-none'
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                &#8963;
              </span>
            </button>

            {/* المزيد / Next */}
            <button
              onClick={() => setVerticalPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={verticalPage >= totalPages - 1}
              className='flex items-center gap-2 rounded-full px-4 py-2 transition-opacity hover:opacity-80 disabled:opacity-0 disabled:cursor-not-allowed select-none'
              style={{
                backgroundColor: data.arrowBgColor || '#1e3a6e',
                color: data.arrowColor || '#ffffff',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}
            >
              <span
                className='w-7 h-7 flex items-center justify-center rounded-full text-lg font-bold leading-none'
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                &#8964;
              </span>
              <span className='text-sm font-medium leading-none'>
                {locale === 'ar' ? 'المزيد' : 'More'}
              </span>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className='w-full'>
        {/* Section Header */}
        {(sectionTitle || sectionDescription || (data.seeMoreShow !== 'none' && data.seeMoreUrl)) && (
          <div className='flex items-start justify-between mb-4 px-1'>
            <div>
              {sectionTitle && (
                <h2 className='text-xl font-bold text-gray-800'>{sectionTitle}</h2>
              )}
              {sectionDescription && (
                <p className='text-sm text-gray-500 mt-1'>{sectionDescription}</p>
              )}
            </div>
            {data.seeMoreShow !== 'none' && data.seeMoreUrl && (
              <a
                href={data.seeMoreUrl}
                style={{
                  backgroundColor: data.seeMoreBgColor || 'transparent',
                  color: data.seeMoreTextColor || '#3b5bdb',
                  borderColor: data.seeMoreTextColor || '#3b5bdb'
                }}
                className='border rounded-md px-4 py-1 text-sm font-medium shrink-0 transition-opacity hover:opacity-75'
              >
                {seeMoreLabel}
              </a>
            )}
          </div>
        )}
        {/* Swiper — horizontal only */}
        <div className='relative'>
          <Swiper
            slidesPerView={Number(data.slidesPerView) || 3}
            slidesPerGroup={Number(data.slidesPerView) || 3}
            spaceBetween={Number(data.spaceBetween) || 20}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={swiper => {
              swiper.params.navigation.prevEl = prevRef.current
              swiper.params.navigation.nextEl = nextRef.current
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            key={`${locale}-${data.slidesPerView}-${data.spaceBetween}`}
            style={{ paddingBottom: '8px' }}
          >
            {slideItems.map((item, index) => (
              <SwiperSlide key={index} className='!h-auto'>
                <CardCard
                  item={item}
                  data={data}
                  download={download}
                  locale={locale}
                  index={index}
                  onChangePerant={onChange}
                  readOnly={readOnly}
                  api={data.api_url}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={`flex gap-3 mt-4 ${locale === 'ar' ? 'justify-start' : 'justify-end'} ${data.navClassName || ''}`}>
            {/* السابق / Previous */}
            <button
              ref={prevRef}
              className='flex items-center gap-2  absolute top-1/2 start-0 -translate-y-1/2 z-20 rounded-e-full pe-4 ps-1.5 py-2 transition-opacity hover:opacity-80 disabled:opacity-0 disabled:cursor-not-allowed select-none'
              style={{
                backgroundColor: data.arrowBgColor || '#5370b6',
                color: data.arrowColor || '#ffffff',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}
            ><span
              className='w-7 h-7 flex items-center justify-center border border-white rounded-full text-lg font-bold leading-none'
            >
                { '‹'}
              </span>
              <span className='text-sm font-medium leading-none'>
                {locale === 'ar' ? 'السابق' : 'Prev'}
              </span>

            </button>

            {/* المزيد / Next */}
            <button
              ref={nextRef}
              className='flex items-center absolute top-1/2 -translate-y-1/2 z-20 end-0  gap-2 rounded-s-full ps-4 pe-1.5 py-2 transition-opacity hover:opacity-80 disabled:opacity-0 disabled:cursor-not-allowed select-none'
              style={{
                backgroundColor: data.arrowBgColor || '#5370b6',
                color: data.arrowColor || '#ffffff',
                direction: locale === 'ar' ? 'rtl' : 'ltr'
              }}
            ><span className='text-sm font-medium leading-none'>
                {locale === 'ar' ? 'المزيد' : 'More'}
              </span>
              <span
                className='w-7 h-7 flex items-center justify-center border border-white rounded-full text-lg font-bold leading-none'
              >
                {'›'}
              </span>

            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className=''>
      {data.api_url ? (
        <div
          style={{
            display: childrenView === 'auto' ? 'flex' : 'grid',
            gridTemplateColumns: childrenView === 'auto' ? 'auto' : `repeat(${childrenView || 1}, minmax(0, 1fr))`,
            flexDirection: data.flexDirection || 'row',
            height: data.height + data.heightUnit || 'auto',
            gap: data.gap + 'px' || '10px',
            flexWrap: data.flexWrap || 'nowrap',
            justifyContent: data.justifyContent || 'center',
            alignItems: data.alignItems || 'stretch'
          }}
        >
          {items?.map((item, index) =>
            data.cart_type === 'analytic' ? (
              <CardAppleWatch
                key={index}
                data={{
                  title: getData(item, data.newItems?.find(ni => ni.type === 'title')?.[`title_${locale}`] ?? data?.[`title_${locale}`], 'Customer Onboarding'),
                  progress: getData(item, data?.progress, 0),
                  tasksRemaining: getData(item, data?.tasksRemaining, 0),
                  status: getData(item, data?.status, 'active')
                }}
              />
            ) : data.cart_type === 'statistic' ? (
              <EcommerceStatistics
                data={{
                  title: getData(item, data.newItems?.find(ni => ni.type === 'title')?.[`title_${locale}`] ?? data?.[`title_${locale}`], 'title'),
                  value: getData(item, data?.value, '125k'),
                  color: getData(item, data?.color, 'primary'),
                  icon: getData(item, data?.icon, 'tabler:chart-pie-2')
                }}
              />
            ) : (
              <CardCard
                key={index}
                item={item}
                data={data}
                download={download}
                locale={locale}
                index={index}
                onChangePerant={onChange}
                readOnly={readOnly}
                api={data.api_url}
              />
            )
          )}
          {items.length === 0 && (
            <div className='flex justify-center items-center h-full'>
              <p className='text-gray-500'>No items found</p>
            </div>
          )}
        </div>
      ) : (
        <div className={`relative h-full w-full ${data.cardClassName || ''}`}>
          {data.cart_type === 'analytic' ? (
            <CardAppleWatch
              data={{
                title: data.newItems?.find(ni => ni.type === 'title')?.[`title_${locale}`] ?? data?.[`title_${locale}`] ?? 'title',
                progress: data.progress,
                tasksRemaining: data.tasksRemaining,
                status: data.status
              }}
            />
          ) : data.cart_type === 'statistic' ? (
            <EcommerceStatistics
              data={{
                title: data.newItems?.find(ni => ni.type === 'title')?.[`title_${locale}`] ?? data?.[`title_${locale}`] ?? 'title',
                value: data.value || '125k',
                color: data.color || 'primary',
                icon: data.icon || 'tabler:chart-pie-2'
              }}
            />
          ) : (
            <CardCard
              item={null}
              data={data}
              download={download}
              locale={locale}
              readOnly={readOnly}
            />
          )}
        </div>
      )}
    </div>
  )
}
