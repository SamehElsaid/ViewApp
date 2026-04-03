import { useMemo, useState, useRef, useEffect } from 'react'
import { MdMenu } from 'react-icons/md'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useIntl } from 'react-intl'
import MenuItemControl from '../MenuItemControl'
import { useSelector } from 'react-redux'

function isValidURL(str) {
  if (!str || typeof str !== 'string') return false

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

/** Parse inline CSS string to React style object (e.g. "margin-top: 10px; color: red" -> { marginTop: '10px', color: 'red' }) */
function parseInlineStyle(str) {
  if (!str || typeof str !== 'string') return {}
  const out = {}
  str.split(';').forEach(part => {
    const colon = part.indexOf(':')
    if (colon === -1) return
    const key = part.slice(0, colon).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const value = part.slice(colon + 1).trim()
    if (key && value) out[key] = value
  })

  return out
}

/** Run custom JS: supports async function Action(e, args) { } like JsEditor; args = { item, index } */
function runCustomJs(code, e, args) {
  if (!code || typeof code !== 'string') return
  try {
    const hasAction = /async\s+function\s+Action\s*\(\s*e\s*,\s*args\s*\)\s*\{[\s\S]*\}/.test(code)
    if (hasAction) {
      const fn = new Function(`return (${code})`)()
      if (typeof fn === 'function') {
        Promise.resolve(fn(e, args)).catch(err => console.error('MenuItem Action error:', err))
      }
    } else {
      const fn = new Function(code)
      fn()
    }
  } catch (err) {
    console.error('MenuItem custom JS error:', err)
  }
}

export default function useMenuItem({ locale, buttonRef }) {
  const userRoles = useSelector(state => state?.auth?.data?.role_id)
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles]
  const { messages } = useIntl()

  const MenuItemCell = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        const [isOpen, setIsOpen] = useState(false)
        const [triggerHover, setTriggerHover] = useState(false)
        const [dropdownHover, setDropdownHover] = useState(false)
        const containerRef = useRef(null)
        const items = data?.items || []
        const triggerLabel = locale === 'ar' ? (data?.triggerLabel_ar ?? data?.triggerLabel_en) : (data?.triggerLabel_en ?? data?.triggerLabel_ar ?? 'Menu')

        useEffect(() => {
          function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
              setIsOpen(false)
            }
          }
          document.addEventListener('mousedown', handleClickOutside)

          return () => document.removeEventListener('mousedown', handleClickOutside)
        }, [])

        const u = (val, unit) => (val != null && val !== '' ? `${val}${unit || 'px'}` : undefined)

        const baseTriggerBg = data?.backgroundColor ?? '#f3f4f6'
        const baseTriggerColor = data?.color ?? '#374151'
        const baseTriggerBorderColor = data?.borderColor ?? '#e5e7eb'
       
        const baseTriggerBorderWidth =
          typeof data?.borderWidth === 'number' ? data.borderWidth : data?.borderWidth ? Number(data.borderWidth) : 1

        const hoverTriggerBg = data?.triggerHoverBackgroundColor ?? baseTriggerBg
        const hoverTriggerColor = data?.triggerHoverColor ?? baseTriggerColor
        const hoverTriggerBorderColor = data?.triggerHoverBorderColor ?? baseTriggerBorderColor
      
        const hoverTriggerBorderWidth =
          typeof data?.triggerHoverBorderWidth === 'number' ? data.triggerHoverBorderWidth : 0

        const triggerStyle = {
          backgroundColor: triggerHover ? hoverTriggerBg : baseTriggerBg,
          color: triggerHover ? hoverTriggerColor : baseTriggerColor,
          padding: `${u(data?.paddingBlock ?? 8, data?.paddingBlockUnit) ?? '8px'} ${u(data?.paddingInline ?? 16, data?.paddingInlineUnit) ?? '16px'}`,
          borderRadius: u(data?.borderRadius ?? 8, data?.borderRadiusUnit) ?? '8px',
          fontSize: u(data?.fontSize ?? 14, data?.fontSizeUnit) ?? '14px',
          fontWeight: data?.fontWeight ?? 'normal',
          border:
            data?.border ||
            `${
              triggerHover && hoverTriggerBorderWidth > 0
                ? hoverTriggerBorderWidth
                : baseTriggerBorderWidth
            }px solid ${triggerHover && hoverTriggerBorderWidth > 0 ? hoverTriggerBorderColor : baseTriggerBorderColor}`,
          boxShadow: data?.triggerBoxShadow ?? undefined,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: data?.triggerWidth != null || data?.triggerHeight != null ? 'center' : undefined,
          gap: u(data?.triggerGap ?? 6, data?.triggerGapUnit) ?? '6px',
          width: u(data?.triggerWidth, data?.triggerWidthUnit),
          height: u(data?.triggerHeight, data?.triggerHeightUnit),
          minWidth: data?.minWidth != null && data.minWidth !== '' ? u(data.minWidth, data?.minWidthUnit) : 'auto',
          ...parseInlineStyle(data?.triggerCustomCss || '')
        }

        const baseDropdownBg = data?.dropdownBgColor ?? '#ffffff'
        const baseDropdownBorderColor = data?.dropdownBorderColor ?? '#e5e7eb'

        const baseDropdownBorderWidth =
          typeof data?.dropdownBorderWidth === 'number'
            ? data.dropdownBorderWidth
            : data?.dropdownBorderWidth
            ? Number(data.dropdownBorderWidth)
            : 1

        const hoverDropdownBg = data?.dropdownHoverBgColor ?? baseDropdownBg
        const hoverDropdownBorderColor = data?.dropdownHoverBorderColor ?? baseDropdownBorderColor
      
        const hoverDropdownBorderWidth =
          typeof data?.dropdownHoverBorderWidth === 'number' ? data.dropdownHoverBorderWidth : 0

        const listStyle = {
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: u(data?.dropdownMarginTop ?? 4, data?.dropdownMarginTopUnit) ?? '4px',
          backgroundColor: dropdownHover ? hoverDropdownBg : baseDropdownBg,
          border:
            data?.dropdownBorder ||
            `${
              dropdownHover && hoverDropdownBorderWidth > 0
                ? hoverDropdownBorderWidth
                : baseDropdownBorderWidth
            }px solid ${
              dropdownHover && hoverDropdownBorderWidth > 0 ? hoverDropdownBorderColor : baseDropdownBorderColor
            }`,
          borderRadius: u(data?.dropdownBorderRadius ?? 8, data?.dropdownBorderRadiusUnit) ?? '8px',
          boxShadow: data?.dropdownShadow ?? '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          width: u(data?.dropdownWidth, data?.dropdownWidthUnit),
          minWidth: data?.dropdownMinWidth != null && data.dropdownMinWidth !== '' ? u(data.dropdownMinWidth, data?.dropdownMinWidthUnit) : '100%',
          maxHeight: u(data?.dropdownMaxHeight, data?.dropdownMaxHeightUnit),
          overflowY: data?.dropdownMaxHeight != null && data.dropdownMaxHeight !== '' ? 'auto' : 'hidden',
          overflowX: 'hidden',
          zIndex: data?.dropdownZIndex != null ? data.dropdownZIndex : 50,
          ...parseInlineStyle(data?.dropdownCustomCss || '')
        }

        const itemBaseStyle = {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: data?.itemGap != null ? `${data.itemGap}px` : '8px',
          padding: `${data?.itemPaddingBlock ?? 10}px ${data?.itemPaddingInline ?? 16}px`,
          fontSize: `${data?.itemFontSize ?? 14}px`,
          color: data?.itemColor ?? '#374151',
          fontWeight: data?.itemFontWeight ?? 'normal',
          textAlign: 'left',
          border: 'none',
          borderBottom: data?.itemBorderBottom ?? 'none',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          transition: 'background-color 0.15s ease',
          ...parseInlineStyle(data?.itemCustomCss || '')
        }

        const itemIconSize = data?.itemIconSize != null ? data.itemIconSize : 20
        const itemIconColor = data?.itemIconColor ?? 'inherit'

        const renderItemContent = (item, label) => (
          <>
            {item?.icon && (
              <Icon
                icon={item.icon}
                width={itemIconSize}
                height={itemIconSize}
                style={{ color: item.iconColor ?? itemIconColor, flexShrink: 0 }}
              />
            )}
            <span>{label}</span>
          </>
        )

        return (
          <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              type='button'
              style={triggerStyle}
              onClick={() => setIsOpen(prev => !prev)}
              onMouseEnter={() => setTriggerHover(true)}
              onMouseLeave={() => setTriggerHover(false)}
              aria-haspopup='true'
              aria-expanded={isOpen}
            >
              {data?.triggerIcon && (
                <Icon
                  icon={data.triggerIcon}
                  width={data?.triggerIconSize ?? 18}
                  height={data?.triggerIconSize ?? 18}
                  style={{ color: data?.triggerIconColor ?? 'inherit' }}
                />
              )}
              <span>{triggerLabel}</span>
              <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {isOpen && items.length > 0 && (
              <div
                style={listStyle}
                role='menu'
                onMouseEnter={() => setDropdownHover(true)}
                onMouseLeave={() => setDropdownHover(false)}
              >
              {items.map((item, index) => {
              // roles handling: if item has role(s) and not "all", only show if user has it
              const itemRoles = Array.isArray(item?.roles) ? item.roles : item?.roles ? [item.roles] : null
              const shouldCheckRoles = itemRoles && !itemRoles.includes('all')
              const hasAccess = !shouldCheckRoles || itemRoles.some(r => rolesArray?.includes(r))

              if (!hasAccess) return null

              const label = locale === 'ar' ? (item?.label_ar ?? item?.label_en) : (item?.label_en ?? item?.label_ar ?? `Item ${index + 1}`)
              const isLink = item?.actionType === 'link' && item?.href
              const isCustomJs = item?.actionType === 'customJs' && item?.customJs
              const isOpenPopup = item?.actionType === 'openPopup' && item?.popupId

              const itemStyle = {
                ...itemBaseStyle
              }

              const handleItemClick = e => {
                setIsOpen(false)
                if (isCustomJs) {
                  runCustomJs(item.customJs, e, { item, index })
                } else if (isOpenPopup && typeof window !== 'undefined') {
                  try {
                    window.dispatchEvent(
                      new CustomEvent('popup-toggle', {
                        detail: {
                          id: item.popupId,
                          action: 'open'
                        }
                      })
                    )
                  } catch (err) {
                    console.error('MenuItem openPopup error:', err)
                  }
                }
              }

                  const openIn = item?.openIn ?? 'same'

                  const hoverBg = item?.hoverBg ?? data?.itemHoverBg ?? '#f3f4f6'
                  const hoverColor = item?.hoverColor ?? data?.itemColor ?? '#374151'
                  const hoverBorderColor = item?.hoverBorderColor ?? data?.itemHoverBorderColor ?? data?.dropdownBorderColor ?? '#e5e7eb'
                 
                  const hoverBorderWidth =
                    typeof (item?.hoverBorderWidth ?? data?.itemHoverBorderWidth) === 'number'
                      ? (item?.hoverBorderWidth ?? data?.itemHoverBorderWidth)
                      : 0

                  if (isLink && isValidURL(item.href)) {
                    return (
                      <a
                        key={index}
                        href={item.href}
                        target={openIn === 'new' ? '_blank' : '_self'}
                        rel={openIn === 'new' ? 'noopener noreferrer' : undefined}
                        style={{
                          ...itemStyle,
                          textDecoration: 'none'
                        }}
                        onMouseEnter={ev => {
                          ev.currentTarget.style.backgroundColor = hoverBg
                          ev.currentTarget.style.color = hoverColor
                          if (hoverBorderWidth > 0) {
                            ev.currentTarget.style.border = `${hoverBorderWidth}px solid ${hoverBorderColor}`
                          }
                        }}
                        onMouseLeave={ev => {
                          ev.currentTarget.style.backgroundColor = 'transparent'
                          ev.currentTarget.style.color = data?.itemColor ?? '#374151'
                          ev.currentTarget.style.border = 'none'
                        }}
                      >
                        {renderItemContent(item, label)}
                      </a>
                    )
                  }

                  if (isLink && item.href) {
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        target={openIn === 'new' ? '_blank' : '_self'}
                        rel={openIn === 'new' ? 'noopener noreferrer' : undefined}
                        style={{
                          ...itemStyle,
                          textDecoration: 'none'
                        }}
                        onMouseEnter={ev => {
                          ev.currentTarget.style.backgroundColor = hoverBg
                          ev.currentTarget.style.color = hoverColor
                          if (hoverBorderWidth > 0) {
                            ev.currentTarget.style.border = `${hoverBorderWidth}px solid ${hoverBorderColor}`
                          }
                        }}
                        onMouseLeave={ev => {
                          ev.currentTarget.style.backgroundColor = 'transparent'
                          ev.currentTarget.style.color = data?.itemColor ?? '#374151'
                          ev.currentTarget.style.border = 'none'
                        }}
                        onClick={() => setIsOpen(false)}
                      >
                        {renderItemContent(item, label)}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={index}
                      type='button'
                      style={itemStyle}
                      onClick={handleItemClick}
                      onMouseEnter={ev => {
                        ev.currentTarget.style.backgroundColor = hoverBg
                        ev.currentTarget.style.color = hoverColor
                        if (hoverBorderWidth > 0) {
                          ev.currentTarget.style.border = `${hoverBorderWidth}px solid ${hoverBorderColor}`
                        }
                      }}
                      onMouseLeave={ev => {
                        ev.currentTarget.style.backgroundColor = 'transparent'
                        ev.currentTarget.style.color = data?.itemColor ?? '#374151'
                        ev.currentTarget.style.border = 'none'
                      }}
                    >
                      {renderItemContent(item, label)}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      },
      id: 'menuItem',
      title: messages.useMenuItem?.menuItem ?? 'Menu Item',
      description: messages.useMenuItem?.menuItemDescription ?? 'Dropdown list with links or custom JavaScript.',
      version: 1,
      icon: <MdMenu className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <MenuItemControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { menuItem: MenuItemCell }
}
