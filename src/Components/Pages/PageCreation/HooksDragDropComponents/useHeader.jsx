import React, { useMemo, useState } from 'react'
import { FaBars, FaChevronDown } from 'react-icons/fa'
import { MdMenu } from 'react-icons/md'
import HeaderControl from './HeaderControl'
import { useIntl } from 'react-intl'

export default function useHeader({ locale, buttonRef }) {
  const { messages } = useIntl()

  const Header = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        const [isOpen, setIsOpen] = useState(false)
        const [selectedOption, setSelectedOption] = useState(data?.defaultOption || '')

        const handleSelectChange = event => {
          setSelectedOption(event.target.value)
          if (data?.onSelectChange && typeof data.onSelectChange === 'function') {
            data.onSelectChange(event.target.value)
          }
        }

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

        return (
          <header
            className='relative w-full'
            style={{
              backgroundColor: data?.backgroundColor || '#ffffff',
              borderBottom: `1px solid ${data?.borderColor || '#e5e7eb'}`,
              padding: `${data?.paddingY + 'px' || '12px'} ${data?.paddingX + 'px' || '16px'}`,
              boxShadow: data?.showShadow ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div className='flex justify-between items-center'>
              {/* Left Section with Selector */}
              <div className='flex items-center'>
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
                  <div className='relative'>
                    <select
                      value={selectedOption}
                      onChange={handleSelectChange}
                      className='px-3 py-2 pr-8 rounded-md appearance-none'
                      style={{
                        backgroundColor: data?.selectorBgColor || '#f3f4f6',
                        color: data?.selectorTextColor || '#374151',
                        border: `1px solid ${data?.selectorBorderColor || '#d1d5db'}`,
                        fontWeight: data?.selectorFontWeight || 'normal'
                      }}
                    >
                      {!data?.options || data?.options.length === 0 ? (
                        <option value=''>{messages.dialogs.select}</option>
                      ) : (
                        data.options.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option?.[`label_${locale}`]}
                          </option>
                        ))
                      )}
                    </select>
                    <div className='absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                      <FaChevronDown size={12} style={{ color: data?.selectorTextColor || '#374151' }} />
                    </div>
                  </div>
                )}

                {/* Custom Left Content */}
                {data?.customLeftContent && <div className='ml-4'>{data?.customLeftContent}</div>}
              </div>

              {/* Center Logo */}
              <div className='flex absolute left-1/2 justify-center items-center transform -translate-x-1/2'>
                {/* {data?.logoUrl ? ( */}
                <img
                  src={'https://www.gahar.gov.eg/Front/images/logo.svg'}
                  alt={data?.logoAlt || 'Logo'}
                  className='max-h-12'
                  style={{
                    height: data?.logoHeight || '40px',
                    width: 'auto'
                  }}
                />
           
              </div>

              {/* Right Section */}
              <div className='flex items-center'>
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
