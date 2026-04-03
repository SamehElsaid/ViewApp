import React, { useMemo } from 'react'
import UpdateRichText from '../UpdateRichText'
import ShowEditor from 'src/Components/Editor/ShowEditor'
import { TbTextCaption } from 'react-icons/tb'
import { getData } from 'src/Components/_Shared'
import { useIntl } from 'react-intl'

function getHtmlModeForLocale(data, locale) {
  const legacy = Boolean(data?.ishtml ?? data?.isHtml)
  if (locale === 'ar') {
    return data?.ishtml_ar !== undefined ? Boolean(data.ishtml_ar) : legacy
  }

  return data?.ishtml_en !== undefined ? Boolean(data.ishtml_en) : legacy
}

const replacePlaceholders = (htmlContent, dataObject) => {
  return htmlContent.replace(/\{\s*([\s\S]*?)\s*\}/g, (_, key) => {
    const cleanKey = key.replace(/<[^>]*>/g, '').trim(); // نشيل أي HTML جوه الـ {}
    const value = dataObject?.[cleanKey]; // ناخد القيمة من object

    return value !== undefined ? value : `{${cleanKey}}`; // لو مش موجود، نسيب الـ placeholder
  });
}


export default function useRichText({ locale, buttonRef }) {
  const { messages } = useIntl()

  const RichText = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const contentLocale = data?.[`content_${locale}`]

        const sharedStyle = {
          color: data.titleColor,
          fontSize: data.fontSize ? data.fontSize + (data.fontSizeUnit ?? 'px') : '16px',
          fontWeight: data.fontWeight,
          fontFamily: data.fontFamily,
          marginBottom: data.marginBottom ? data.marginBottom + (data.marginBottomUnit ?? 'px') : '0px',
          textAlign: data.titleTextAlign ?? 'start',
          whiteSpace: getHtmlModeForLocale(data, locale) ? 'normal' : 'pre-wrap'
        }

        const fontCss = `
                .font-family-control-text {
                  font-family: ${data.fontFamily || 'inherit'} !important;
                }
              `

        // if (data?.api_url) {
        //   const text =
        //     getData(data?.items, contentLocale, messages.dialogs.content) ?? messages.dialogs.content

        //   return (
        //     <div className='font-family-control-text min-h-[100dvh]' style={sharedStyle}>
        //       <style>{fontCss}</style>
        //       {text}
        //     </div>
        //   )
        // }





        return (
          <div className=''>
            <div
              dangerouslySetInnerHTML={{ __html: replacePlaceholders(contentLocale || '', data.items) || '' }}
            ></div>
          </div>
        )
      },
      id: 'richText',
      title: messages.dialogs.richText,
      description: messages.dialogs.richTextDescription,
      version: 1,
      icon: <TbTextCaption className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <UpdateRichText data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { RichText }
}
