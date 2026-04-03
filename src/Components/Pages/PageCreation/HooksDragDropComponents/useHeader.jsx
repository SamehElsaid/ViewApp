import React, { useEffect, useMemo, useState } from 'react'
import { FaBars } from 'react-icons/fa'
import { MdMenu } from 'react-icons/md'
import HeaderControl from './HeaderControl'
import { useIntl } from 'react-intl'
import { Autocomplete, TextField } from '@mui/material'
import { useSelector } from 'react-redux'

export default function useHeader({ locale, buttonRef }) {
  const { messages } = useIntl()

  const Header = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        const [isOpen, setIsOpen] = useState(false)
        const [selectedOption, setSelectedOption] = useState(data?.defaultOption || '')
        const apiData = useSelector(state => state.api.data)

        useEffect(() => {
          setSelectedOption(data?.defaultOption || '')
        }, [data?.defaultOption])

        const handleRightButtonClick = () => {
          switch (data?.rightButtonAction) {
            case 'link':
              if (data?.rightButtonLink) {
                window.location.href = data.rightButtonLink
              }
              break
            case 'alert':
              if (data?.rightButtonAlertMessage) {
                alert(data.rightButtonAlertMessage)
              }
              break
            case 'custom':
              // If a custom function is provided, call it
              if (data?.rightButtonCustomAction && typeof data.rightButtonCustomAction === 'function') {
                data.rightButtonCustomAction()
              }
              break
            default:
              // Default to link behavior if no action specified
              if (data?.rightButtonLink) {
                window.location.href = data.rightButtonLink
              }
          }
        }

        const toggleMenu = () => {
          setIsOpen(!isOpen)
        }

        const padY =
          data?.paddingY !== undefined && data?.paddingY !== null && String(data.paddingY).trim() !== ''
            ? `${data.paddingY}px`
            : '12px'

        const padX =
          data?.paddingX !== undefined && data?.paddingX !== null && String(data.paddingX).trim() !== ''
            ? `${data.paddingX}px`
            : '16px'

        const lm = data?.logoMedia || {}
        const showLogo = data?.showLogo !== false

        const resolveLogoConditionValue = () => {
          const cond = lm?.visibilityCondition
          if (!cond || cond?.enabled !== true) return null
          if (cond.source === 'api') {
            const link = lm?.api_url || cond.api_url
            if (!link) return null
            const found = Array.isArray(apiData) ? apiData.find(item => item.link === link) : null
            const obj = found?.data
            if (!obj || !cond.key) return null
            try {
              return cond.key.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj)
            } catch {
              return null
            }
          }
          if (cond.source === 'query') {
            if (typeof window === 'undefined') return null
            const params = new URLSearchParams(window.location.search)

            return params.get(cond.key || '')
          }

          return null
        }

        const evaluateCondition = (left, operator, right) => {
          const numLeft = Number(left)
          const numRight = Number(right)
          const canNum = !Number.isNaN(numLeft) && !Number.isNaN(numRight)
          const l = canNum ? numLeft : (left ?? '').toString()
          const r = canNum ? numRight : (right ?? '').toString()

          switch (operator) {
            case '==':
              return l == r
            case '!=':
              return l != r
            case '>':
              return canNum ? numLeft > numRight : l > r
            case '<':
              return canNum ? numLeft < numRight : l < r
            case '>=':
              return canNum ? numLeft >= numRight : l >= r
            case '<=':
              return canNum ? numLeft <= numRight : l <= r
            case 'contains':
              return (l || '').toString().includes((r || '').toString())
            default:
              return false
          }
        }

        const logoConditionTrue = (() => {
          const cond = lm?.visibilityCondition
          if (!cond || cond?.enabled !== true) return null
          const left = resolveLogoConditionValue()

          return evaluateCondition(left, cond.operator || '==', cond.value ?? '')
        })()

        const logoHiddenByCondition = (() => {
          const cond = lm?.visibilityCondition
          if (!cond || cond?.enabled !== true || logoConditionTrue === null) return false
          const behavior = cond.behavior || 'showWhenTrue'
          if (behavior === 'hideWhenTrue') return logoConditionTrue === true

          return logoConditionTrue === false
        })()

        const logoFilePath = lm?.image

        const logoUrlFallback =
          data?.logoUrl !== undefined && data?.logoUrl !== null ? String(data.logoUrl).trim() : ''

        const logoSrc = logoFilePath
          ? logoFilePath.startsWith('http://') || logoFilePath.startsWith('https://')
            ? logoFilePath
            : `${process.env.API_URL}/file/download/${logoFilePath}`
          : logoUrlFallback || ''

        const logoDisplayStyle = logoHiddenByCondition ? 'none' : 'block'

        return (
          <header
            className='relative w-full'
            style={{
              backgroundColor: data?.backgroundColor || '#ffffff',
              borderBottom: `1px solid ${data?.borderColor || '#e5e7eb'}`,
              padding: `${padY} ${padX}`,
              boxShadow: data?.showShadow ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <div className='flex relative justify-between items-center min-h-[48px] gap-3'>
              {/* Left Section with Selector */}
              <div className='flex relative z-[1] items-center min-w-0 flex-1 md:flex-none'>
                {data?.showMobileMenu && (
                  <button
                    className='mr-3 text-xl md:hidden'
                    onClick={toggleMenu}
                    style={{ color: data?.mobileMenuColor || '#000000' }}
                  >
                    <MdMenu />
                  </button>
                )}

                {data?.showSelector && (
                  <div className='relative z-[1] min-w-[200px] max-w-[min(100%,280px)]'>
                    <Autocomplete
                      options={(data?.options || []).map(o => ({ label: o?.[`label_${locale}`], value: o.value }))}
                      getOptionLabel={o => o?.label || ''}
                      value={(data?.options || [])
                        .map(o => ({ label: o?.[`label_${locale}`], value: o.value }))
                        .find(o => o.value === selectedOption) || null}
                      onChange={(e, newVal) => {
                        const v = newVal?.value || ''
                        setSelectedOption(v)
                        if (data?.onSelectChange && typeof data.onSelectChange === 'function') {
                          data.onSelectChange(v)
                        }
                      }}
                      clearOnEscape
                      renderInput={params => (
                        <TextField
                          {...params}
                          placeholder={'---select---'}
                          size='small'
                        />
                      )}
                    />
                  </div>
                )}

                {/* Custom Left Content */}
                {data?.customLeftContent && <div className='ml-4'>{data?.customLeftContent}</div>}
              </div>

              {/* Center Logo — uses logoMedia.image (upload/API) then logoUrl fallback */}
              <div
                className='flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 justify-center items-center max-w-[40%] pointer-events-none'
                aria-hidden={!showLogo || !logoSrc}
              >
                {showLogo && logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={data?.logoAlt || 'Logo'}
                    className='max-w-full object-contain select-none'
                    style={{
                      display: logoDisplayStyle,
                      width: lm.imageWidth ? `${lm.imageWidth}${lm.imageWidthUnit || 'px'}` : 'auto',
                      height: lm.imageHeight ? `${lm.imageHeight}${lm.imageHeightUnit || 'px'}` : '40px',
                      maxHeight: lm.imageHeight ? undefined : '48px',
                      objectFit: lm.objectFit || 'contain',
                      margin:
                        lm.textAlign === 'right'
                          ? '0 0 0 auto'
                          : lm.textAlign === 'left'
                            ? '0 auto 0 0'
                            : '0 auto'
                    }}
                  />
                ) : null}
              </div>

              {/* Right Section */}
              <div className='flex relative z-[1] items-center shrink-0'>
                {/* Custom Right Content */}
                {data?.customRightContent ? (
                  data?.customRightContent
                ) : (
                  <div className='flex items-center space-x-4'>
                    {data?.rightLinks?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        className='hidden md:block'
                        style={{
                          color: data?.rightLinksColor || '#374151',
                          fontWeight: data?.rightLinksFontWeight || 'normal'
                        }}
                      >
                        {link?.[`text_${locale}`]}
                      </a>
                    ))}

                    {data?.showRightButton && (
                      <button
                        className='px-4 py-2 rounded-md'
                        style={{
                          backgroundColor: data?.rightButtonBgColor || '#4f46e5',
                          color: data?.rightButtonTextColor || '#ffffff',
                          border: data?.rightButtonBorder || 'none'
                        }}
                        onClick={handleRightButtonClick}
                        id={data?.rightButtonId || 'header-right-button'}
                      >
                        { data?.[`rightButtonText_${locale}`] || messages.dialogs.button}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && data?.showMobileMenu && (
              <div
                className='absolute left-0 top-full z-10 w-full md:hidden'
                style={{
                  backgroundColor: data?.mobileMenuBgColor || '#ffffff',
                  borderTop: `1px solid ${data?.borderColor || '#e5e7eb'}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className='p-4'>
                  {data?.rightLinks?.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      className='block py-2'
                      style={{
                        color: data?.rightLinksColor || '#374151',
                        fontWeight: data?.rightLinksFontWeight || 'normal'
                      }}
                    >
                      {link?.[`text_${locale}`]}
                    </a>
                  ))}

                  {data?.mobileMenuItems?.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      className='block py-2'
                      style={{
                        color: data?.mobileMenuItemColor || '#374151',
                        fontWeight: data?.mobileMenuItemFontWeight || 'normal'
                      }}
                    >
                      {item?.[`text_${locale}`]}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </header>
        )
      },
      id: 'header',
      title: messages.dialogs.header,
      description: messages.dialogs.headerDescription,
      version: 1,
      icon: <FaBars className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <HeaderControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { Header }
}
