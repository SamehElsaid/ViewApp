import { Link, Rating } from '@mui/material'
import { useEffect, useState } from 'react'
import ImageLoad from 'src/Components/ImageLoad'
import { Icon } from '@iconify/react'
import CardCard from './CardCard'
import { useSelector } from 'react-redux'
import download from 'src/Components/img/download.png'
import CardAppleWatch from 'src/Components/analytics/CardAppleWatch'
import { getData } from 'src/Components/_Shared'
import EcommerceStatistics from 'src/Components/analytics/EcommerceStatistics'

export default function ViewCart({ data, locale, onChange, readOnly }) {
  const childrenView = data.childrenView ?? 'auto'
  const top = `top-[5px]`
  const left = `left-[5px]`
  const right = `right-[5px]`
  const bottom = `bottom-[5px]`
  const topRight = 'top-[5px] end-[5px]'
  const topLeft = 'top-[5px] start-[5px]'
  const bottomRight = 'bottom-[5px] end-[5px]'
  const center = 'top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'
  const bottomLeft = 'bottom-[5px] start-[5px]'
  const apiData = useSelector(state => state.api.data)
  const [items, setItems] = useState([])
  useEffect(() => {
    const findItems = apiData.find(item => item.link === data.api_url)
    if (findItems) {
      setItems(findItems?.data ?? [])
    }
  }, [apiData, data.api_url])

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
                  title: getData(item, data?.[`title_${locale}`], 'Customer Onboarding'),
                  progress: getData(item, data?.progress, 0),
                  tasksRemaining: getData(item, data?.tasksRemaining, 0),
                  status: getData(item, data?.status, 'active')
                }}
              />
            ) : data.cart_type === 'statistic' ? (
              <EcommerceStatistics
                data={{
                  title: getData(item, data?.[`title_${locale}`], 'title'),
                  value: getData(item, data?.value, "125k"),
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
        </div>
      ) : (
        <div className='relative ||  h-full w-full '>
          {data.cart_type === 'analytic' ? (
            <CardAppleWatch
              data={{
                title: data?.[`title_${locale}`] ?? 'title',
                progress: data.progress,
                tasksRemaining: data.tasksRemaining,
                status: data.status
              }}
            />
          ) : data.cart_type === 'statistic' ? (
            <EcommerceStatistics
              data={{
                title: data?.[`title_${locale}`] ?? 'title',
                value: data.value || '125k',
                color: data.color || 'primary',
                icon: data.icon || 'tabler:chart-pie-2'
              }}
            />
          ) : (
            <Link
              href={`${locale}/${data.href ?? ''}`}
              className='border h-full relative  || border-gray-200 || rounded-md || overflow-hidden || flex || flex-col || hover:shadow-lg || hover:cursor-pointer || transition-all || hover:translate-y-[-5px] || duration-300'
            >
              <ImageLoad
                alt={data.title ?? 'Product'}
                className='w-full'
                src={data?.image ?? download.src}
                style={{
                  width: '100%',
                  height: data.imageHeight ? data.imageHeight + (data.imageHeightUnit ?? 'px') : '250px',
                  objectFit: data.objectFit ?? 'cover',
                  borderRadius: data.borderRadius ? data.borderRadius + (data.borderRadiusUnit ?? 'px') : '0px',
                  display: data.imageDisplay ?? 'block'
                }}
              />
              <div className='px-3 flex-1 || flex || flex-col '>
                <h2
                  style={{
                    color: data.titleColor,
                    fontSize: data.fontSize ? data.fontSize + (data.fontSizeUnit ?? 'px') : '16px',
                    fontWeight: data.fontWeight,
                    fontFamily: data.fontFamily,
                    marginBottom: data.marginBottom ? data.marginBottom + (data.marginBottomUnit ?? 'px') : '0px',
                    textAlign: data.titleTextAlign ?? 'start'
                  }}
                  className='text-lg || font-semibold || mt-2 || flex-1 overLapP'
                >
                  {data?.[`title_${locale}`] ?? 'Product Name'}
                </h2>
                <p
                  style={{
                    color: data.descriptionColor,
                    fontSize: data.descriptionFontSize
                      ? data.descriptionFontSize + (data.descriptionFontSizeUnit ?? 'px')
                      : '16px',
                    fontWeight: data.descriptionFontWeight,
                    fontFamily: data.descriptionFontFamily,
                    marginBottom: data.marginBottom ? data.marginBottom + (data.marginBottomUnit ?? 'px') : '0px',
                    textAlign: data.descriptionTextAlign ?? 'start',
                    display: (data.descriptionDisplay ?? 'block') === 'block' ? 'block' : 'none'
                  }}
                  className='text-sm || text-gray-500 || mt-1 || overLapP'
                >
                  {data?.[`description_${locale}`] ?? 'Product Description'}
                </p>
                <p
                  style={{
                    color: data.priceColor,
                    fontSize: data.priceFontSize ? data.priceFontSize + (data.priceFontSizeUnit ?? 'px') : '16px',
                    fontWeight: data.priceFontWeight,
                    fontFamily: data.priceFontFamily,
                    marginBottom: data.marginBottom ? data.marginBottom + (data.marginBottomUnit ?? 'px') : '0px',
                    display: (data.priceDisplay ?? 'block') === 'block' ? 'block' : 'none',
                    textAlign: data.priceTextAlign ?? 'end'
                  }}
                  className='text-lg || font-semibold || mt-2 || text-end '
                >
                  {data.price ?? 0}$
                </p>
                {data.newItems?.map((newitem, index) =>
                  newitem.type === 'text' ? (
                    <div
                      key={index}
                      style={{
                        borderRadius: newitem?.rounded + '%',
                        background: newitem?.backgroundColor,
                        marginInlineStart: newitem?.textAlign === 'end' ? 'auto' : 'inherit',
                        marginInlineEnd: newitem?.textAlign === 'start' ? 'auto' : 'inherit',
                        marginInline: newitem?.textAlign === 'center' ? 'auto' : 'inherit',
                        position:
                          newitem.position === 'auto'
                            ? 'inherit'
                            : newitem.position === 'none'
                            ? 'inherit'
                            : 'absolute',
                        marginBottom: newitem?.marginBottom
                          ? newitem?.marginBottom + (newitem?.marginBottomUnit ?? 'px')
                          : '0px',
                        zIndex: newitem.zIndex,
                        display: (newitem?.display ?? 'block') === 'block' ? 'block' : 'none'
                      }}
                      className={`flex justify-center items-center w-fit ${
                        newitem.position === 'topRight'
                          ? topRight
                          : newitem.position === 'topLeft'
                          ? topLeft
                          : newitem.position === 'bottomRight'
                          ? bottomRight
                          : newitem.position === 'bottomLeft'
                          ? bottomLeft
                          : newitem.position == 'top'
                          ? top
                          : newitem.position == 'bottom'
                          ? bottom
                          : newitem.position == 'left'
                          ? left
                          : newitem.position == 'right'
                          ? right
                          : newitem.position == 'center'
                          ? center
                          : ''
                      }`}
                    >
                      {newitem?.[`text_${locale}`] ?? ''}
                    </div>
                  ) : newitem.type === 'icon' ? (
                    <div
                      key={index}
                      style={{
                        width: newitem?.width + 'px',
                        height: newitem?.height + 'px',
                        borderRadius: newitem?.rounded + '%',
                        background: newitem?.backgroundColor,
                        display: (newitem?.display ?? 'block') === 'block' ? 'block' : 'none',
                        marginInlineStart: newitem?.textAlign === 'end' ? 'auto' : 'inherit',
                        marginInlineEnd: newitem?.textAlign === 'start' ? 'auto' : 'inherit',
                        marginInline: newitem?.textAlign === 'center' ? 'auto' : 'inherit',
                        position:
                          newitem.position === 'auto'
                            ? 'inherit'
                            : newitem.position === 'none'
                            ? 'inherit'
                            : 'absolute',
                        marginBottom: newitem?.marginBottom
                          ? newitem?.marginBottom + (newitem?.marginBottomUnit ?? 'px')
                          : '0px',
                        zIndex: newitem.zIndex
                      }}
                      className={`flex justify-center items-center w-fit ${
                        newitem.position === 'topRight'
                          ? topRight
                          : newitem.position === 'topLeft'
                          ? topLeft
                          : newitem.position === 'bottomRight'
                          ? bottomRight
                          : newitem.position === 'bottomLeft'
                          ? bottomLeft
                          : newitem.position == 'top'
                          ? top
                          : newitem.position == 'bottom'
                          ? bottom
                          : newitem.position == 'left'
                          ? left
                          : newitem.position == 'right'
                          ? right
                          : newitem.position == 'center'
                          ? center
                          : ''
                      }`}
                    >
                      <Icon
                        style={{
                          color: newitem?.color,
                          fontSize: newitem?.fontSize ? newitem?.fontSize + (newitem?.fontSizeUnit ?? 'px') : '30px'
                        }}
                        icon={newitem?.text_en ? newitem?.text_en : 'ph:binary-duotone'}
                      />
                    </div>
                  ) : (
                    <div
                      key={index}
                      style={{
                        borderRadius: newitem?.rounded + '%',
                        background: newitem?.backgroundColor,
                        marginInlineStart: newitem?.textAlign === 'end' ? 'auto' : 'inherit',
                        marginInlineEnd: newitem?.textAlign === 'start' ? 'auto' : 'inherit',
                        marginInline: newitem?.textAlign === 'center' ? 'auto' : 'inherit',
                        position:
                          newitem.position === 'auto'
                            ? 'inherit'
                            : newitem.position === 'none'
                            ? 'inherit'
                            : 'absolute',
                        marginBottom: newitem?.marginBottom
                          ? newitem?.marginBottom + (newitem?.marginBottomUnit ?? 'px')
                          : '0px',
                        zIndex: newitem.zIndex,
                        display: (newitem?.display ?? 'block') === 'block' ? 'block' : 'none'
                      }}
                      className={`flex justify-center items-center w-fit ${
                        newitem.position === 'topRight'
                          ? topRight
                          : newitem.position === 'topLeft'
                          ? topLeft
                          : newitem.position === 'bottomRight'
                          ? bottomRight
                          : newitem.position === 'bottomLeft'
                          ? bottomLeft
                          : newitem.position == 'top'
                          ? top
                          : newitem.position == 'bottom'
                          ? bottom
                          : newitem.position == 'left'
                          ? left
                          : newitem.position == 'right'
                          ? right
                          : newitem.position == 'center'
                          ? center
                          : ''
                      }`}
                    >
                      <Rating
                        sx={{
                          color: newitem?.color,
                          fontSize: newitem?.fontSize ? newitem?.fontSize + (newitem?.fontSizeUnit ?? 'px') : '30px'
                        }}
                        readOnly={true}
                        value={newitem.text_en ?? 0}
                      />
                    </div>
                  )
                )}
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
