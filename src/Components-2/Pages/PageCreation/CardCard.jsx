import { Link, Rating } from '@mui/material'
import React from 'react'
import ImageLoad from 'src/Components/ImageLoad'
import { getData } from 'src/Components/_Shared'
import { Icon } from '@iconify/react'

export default function CardCard({ item, data, locale, readOnly, download }) {
  const top = `top-[5px]`
  const left = `left-[5px]`
  const right = `right-[5px]`
  const bottom = `bottom-[5px]`
  const topRight = 'top-[5px] end-[5px]'
  const center = 'top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'
  const topLeft = 'top-[5px] start-[5px]'
  const bottomRight = 'bottom-[5px] end-[5px]'
  const bottomLeft = 'bottom-[5px] start-[5px]'

  return (
    <div className={`relative ||  ${readOnly ? '' : ''} overflow-hidden`}>
      <Link
        href={`${locale}/${data.href ?? ''}`}
        className=' h-full  ||  || rounded-md || overflow-hidden || flex || flex-col || hover:shadow-lg || hover:cursor-pointer || transition-all || hover:translate-y-[-5px] || duration-300'
      >
        {data.imageDisplay !== 'none' && (
          <ImageLoad
            alt={item?.[data?.[`title_${locale}`]] ?? 'Product'}
            className='w-full'
            src={getData(item, data.image, download.src) ?? download.src}
            style={{
              width: '100%',
              height: data.imageHeight ? data.imageHeight + (data.imageHeightUnit ?? 'px') : '250px',
              objectFit: data.objectFit ?? 'cover',
              borderRadius: data.borderRadius ? data.borderRadius + (data.borderRadiusUnit ?? 'px') : '0px'
            }}
          />
        )}
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
            className='text-lg || font-semibold || mt-2 ||  overLapP'
          >
            {getData(item, data?.[`title_${locale}`], 'Product Name') ?? 'Product Name'}
          </h2>
          {data.descriptionDisplay !== 'none' && (
            <p
              style={{
                color: data.descriptionColor,
                fontSize: data.descriptionFontSize
                  ? data.descriptionFontSize + (data.descriptionFontSizeUnit ?? 'px')
                  : '16px',
                fontWeight: data.descriptionFontWeight,
                fontFamily: data.descriptionFontFamily,
                marginBottom: data.marginBottom ? data.marginBottom + (data.marginBottomUnit ?? 'px') : '0px',
                textAlign: data.descriptionTextAlign ?? 'start'
              }}
              className='text-sm || text-gray-500 || mt-1 || overLapP flex-1'
            >
              {getData(item, data?.[`description_${locale}`], 'Product Description') ?? 'Product Description'}
            </p>
          )}
          {data.priceDisplay !== 'none' && (
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
              {getData(item, data.price, '0') ?? '0'}$
            </p>
          )}
          {data.newItems?.map(
            (newitem, index) =>
              newitem?.display !== 'none' &&
              (newitem.type === 'text' ? (
                <div
                  key={index}
                  style={{
                    borderRadius: newitem?.rounded + '%',
                    background: newitem?.backgroundColor,
                    marginInlineStart: newitem?.textAlign === 'end' ? 'auto' : 'inherit',
                    marginInlineEnd: newitem?.textAlign === 'start' ? 'auto' : 'inherit',
                    marginInline: newitem?.textAlign === 'center' ? 'auto' : 'inherit',
                    position:
                      newitem.position === 'auto' ? 'inherit' : newitem.position === 'none' ? 'inherit' : 'absolute',
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
                  {getData(item, newitem.text_en, newitem.text_en) ?? ''}
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
                      newitem.position === 'auto' ? 'inherit' : newitem.position === 'none' ? 'inherit' : 'absolute',
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
                      newitem.position === 'auto' ? 'inherit' : newitem.position === 'none' ? 'inherit' : 'absolute',
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
                    value={getData(item, newitem.text_en, newitem.text_en) ?? 0}
                  />
                </div>
              ))
          )}
        </div>
      </Link>
    </div>
  )
}
