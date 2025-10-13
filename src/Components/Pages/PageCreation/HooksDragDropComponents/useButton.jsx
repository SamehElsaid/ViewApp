import { useMemo, useState } from 'react'
import { GiClick } from 'react-icons/gi'
import ButtonControl from '../ButtonControl'
import Link from 'next/link'
import { useIntl } from 'react-intl'

export default function useButton({ locale, buttonRef }) {
  const { messages } = useIntl()

  const ButtonCell = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const [hover, setHover] = useState(false)

        const options = {
          onMouseEnter: () => setHover(true),
          onMouseLeave: () => setHover(false),
          style: {
            width: data.width || 'fit-content',
            backgroundColor: hover
              ? data.hoverBackgroundColor ?? data.backgroundColor ?? 'transparent'
              : data.backgroundColor ?? 'transparent',
            color: hover ? data.hoverColor ?? data.color ?? 'black' : data.color ?? 'black',
            paddingBlock: data.paddingBlock + 'px' || '10px',
            paddingInline: data.paddingInline + 'px' || '20px',
            borderRadius: data.borderRadius + 'px' || '5px',
            fontSize: data.fontSize + 'px' || '16px',
            fontWeight: data.fontWeight || 'bold',
            border: data.border || 'none',
            borderWidth: data.borderWidth + 'px' || '1px',
            borderColor: hover ? data.hoverBorderColor || 'white' : data.borderColor || 'white',
            borderStyle: data.borderStyle || 'solid',
            transition: 'all 0.1s ease-in-out'
          }
        }

        function isValidURL(str) {
          const pattern = new RegExp(
            '^(https?:\\/\\/)?' +
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
              '((\\d{1,3}\\.){3}\\d{1,3}))' +
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
              '(\\?[;&a-z\\d%_.~+=-]*)?' +
              '(\\#[-a-z\\d_]*)?$',
            'i'
          )

          return !!pattern.test(str)
        }

        return isValidURL(data.href) ? (
          <a href={data.href} target='_blank' rel='noopener noreferrer' {...options}>
            {(locale === 'ar' ? data.buttonTextAr : data.buttonTextEn) ?? 'Button'}
          </a>
        ) : data.href ? (
          <Link href={data.href} {...options}>
            {(locale === 'ar' ? data.buttonTextAr : data.buttonTextEn) ?? 'Button'}
          </Link>
        ) : (
          <button {...options}>{(locale === 'ar' ? data.buttonTextAr : data.buttonTextEn) ?? 'Button'} </button>
        )
      },
      id: 'button',
      title: messages.useButton.button,
      description: messages.useButton.buttonDescription,
      version: 1,
      icon: <GiClick className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <ButtonControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { ButtonCell }
}
