import { useMemo, useState } from 'react'
import { MdMenu, MdClose } from 'react-icons/md'
import { useIntl } from 'react-intl'
import PortalNavControl from '../PortalNavControl'

export default function usePortalNav({ locale, buttonRef }) {
  const { messages } = useIntl()

  const PortalNav = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const [isOpen, setIsOpen] = useState(false)
        const isRtl = locale === 'ar'
        const links = data?.navLinks || []
        const bg = data?.backgroundColor || '#ffffff'
        const textColor = data?.textColor || '#333333'
        const loginBg = data?.loginButtonBgColor || '#3b5bdb'

        const logoSrc = data?.logoUrl
          ? data.logoUrl.startsWith('http://') || data.logoUrl.startsWith('https://')
            ? data.logoUrl
            : `${process.env.API_URL}/file/download/${data.logoUrl}`
          : ''
          
        return (
          <nav
            data-section='portal-nav'
            className='relative w-full z-50'
            style={{ backgroundColor: bg, borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className='flex items-center justify-between px-6 py-3 max-w-screen-xl mx-auto'>
              {/* Logo */}
              <div className='flex items-center gap-3 shrink-0'>
                {logoSrc && (
                  <img src={logoSrc} alt={data?.logoAlt || 'Logo'} style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
                )}
                {data?.siteName && (
                  <span className='font-bold text-sm leading-tight' style={{ color: textColor, maxWidth: 120 }}>
                    {data.siteName}
                  </span>
                )}
              </div>
              {/* Desktop Nav Links */}
              <div className={`hidden md:flex items-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {links.map((link, i) => (
                  <div key={i} className='relative group'>
                    <a
                      href={link.url || '#'}
                      className='text-sm font-medium hover:opacity-70 transition-opacity'
                      style={{ color: link.isActive ? '#3b5bdb' : textColor }}
                    >
                      {link[`label_${locale}`] || link.label_en || ''}
                      {link.children?.length > 0 && <span className='ms-1'>▾</span>}
                    </a>
                    {link.children?.length > 0 && (
                      <div
                        className='absolute top-full start-0 hidden group-hover:block bg-white shadow-lg rounded py-1 min-w-[160px] z-50'
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        {link.children.map((child, ci) => (
                          <a
                            key={ci}
                            href={child.url || '#'}
                            className='block px-4 py-2 text-sm hover:bg-gray-50'
                            style={{ color: textColor }}
                          >
                            {child[`label_${locale}`] || child.label_en || ''}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Right: Login button + hamburger */}
              <div className='flex items-center gap-3'>
                {data?.showLoginButton && (
                  <a
                    href={data?.loginButtonLink || '/login'}
                    className='hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90'
                    style={{ backgroundColor: loginBg }}
                  >
                    <span>👤</span>
                    {data?.[`loginButtonText_${locale}`] || (locale === 'ar' ? 'تسجيل الدخول' : 'Login')}
                  </a>
                )}
                <button
                  className='md:hidden text-2xl'
                  style={{ color: textColor }}
                  onClick={() => setIsOpen(o => !o)}
                  aria-label='Toggle menu'
                >
                  {isOpen ? <MdClose /> : <MdMenu />}
                </button>
              </div>
            </div>
            {/* Mobile Menu */}
            {isOpen && (
              <div className='md:hidden px-6 pb-4' style={{ backgroundColor: bg, borderTop: '1px solid #e5e7eb' }}>
                {links.map((link, i) => (
                  <a key={i} href={link.url || '#'} className='block py-2 text-sm' style={{ color: textColor }}>
                    {link[`label_${locale}`] || link.label_en || ''}
                  </a>
                ))}
                {data?.showLoginButton && (
                  <a
                    href={data?.loginButtonLink || '/login'}
                    className='block mt-2 px-4 py-2 rounded-md text-sm font-medium text-white text-center'
                    style={{ backgroundColor: loginBg }}
                  >
                    {data?.[`loginButtonText_${locale}`] || (locale === 'ar' ? 'تسجيل الدخول' : 'Login')}
                  </a>
                )}
              </div>
            )}
          </nav>
        )
      },
      id: 'portalNav',
      title: messages?.portalNav?.title || 'Portal Nav',
      description: messages?.portalNav?.description || 'Government portal navigation bar with logo, links and login button',
      version: 1,
      icon: <MdMenu className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <PortalNavControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { PortalNav }
}