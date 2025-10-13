import React, { useMemo } from 'react'
import UpdateRichText from '../UpdateRichText'
import { TbTextCaption } from 'react-icons/tb'
import { getData } from 'src/Components/_Shared'

export default function useRichText({ locale, buttonRef }) {
  const RichText = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <div
            className=''
            style={{
              color: data.titleColor,
              fontSize: data.fontSize ? data.fontSize + (data.fontSizeUnit ?? 'px') : '16px',
              fontWeight: data.fontWeight,
              fontFamily: data.fontFamily,
              marginBottom: data.marginBottom ? data.marginBottom + (data.marginBottomUnit ?? 'px') : '0px',
              textAlign: data.titleTextAlign ?? 'start'
            }}
          >
            {data?.api_url
              ? getData(data?.items, data?.[`content_${locale}`], locale === 'ar' ? 'المحتوى' : 'Content') ??
                (locale === 'ar' ? 'المحتوى' : 'Content')
              : data?.[`content_${locale}`]
              ? data?.[`content_${locale}`]
              : locale === 'ar'
              ? 'المحتوى'
              : 'Content'}
          </div>
        )
      },
      id: 'richText',
      title: locale === 'ar' ? 'نص منسق' : 'Text',
      description: locale === 'ar' ? 'يمكن إضافة نص منسق إلى الصفحة' : 'Adds customizable text content to the page.',
      version: 1,
      icon: <TbTextCaption className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <UpdateRichText data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { RichText }
}
