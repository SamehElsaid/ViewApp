import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { MdTimeline } from 'react-icons/md'
import { getData } from 'src/Components/_Shared'
import MinistersTimelineControl from '../MinistersTimelineControl'
import get from 'lodash/get'

function resolveImageUrl(raw) {
    if (!raw) return ''
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

    return `${process.env.API_URL}/file/download/${raw}`
}

function localizeDateString(value, locale) {
    if (!value) return value
    const str = String(value).trim()

    // Try to parse as a single ISO/standard date
    const singleDate = new Date(str)
    if (!isNaN(singleDate.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(str)) {
        return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(singleDate)
    }

    // Handle year-only or year-range strings like "2010" or "2010-2023" or "2010 - 2023"
    if (locale === 'ar') {
        return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
    }

    return str
}
function getField(item, path, locale, fallback = '') {
    if (!path) return fallback
    const localized = getData(item, `${path}_${locale}`, null)
    if (localized !== null && localized !== undefined && localized !== '') return localized

    return getData(item, path, fallback)
}

export default function useMinistersTimeline({ locale, buttonRef, advancedEdit }) {
    const { messages } = useIntl()

    const MinistersTimeline = useMemo(() => {
        return {
            Renderer: ({ data }) => {
                const apiData = useSelector(state => state.api.data)
                const [items, setItems] = useState([])
                const [selectedIndex, setSelectedIndex] = useState(0)
                const isRtl = locale === 'ar'
                const accentColor = data?.accentColor || '#1a3d6b'
                const showImages = data?.showImages !== false
                const bioLineLimit = data?.bioLineLimit || 0
                const minHeight = data?.minHeight || 300
                useEffect(() => {
                    if (data?.api_url) {
                        const found = apiData.find(item => item.link === data.api_url)
                        if (found?.data) {
                            const result = data.itemsPath ? get(found.data, data.itemsPath) : found.data
                            if (Array.isArray(result)) {
                                setItems(result)
                                setSelectedIndex(result.length - 1)
                            } else {
                                setItems([])
                            }
                        }
                    } else {
                        setItems([])
                    }
                }, [apiData, data?.api_url, data?.itemsPath])
                const sectionTitle = data?.[`sectionTitle_${locale}`] || data?.sectionTitle_ar || ''
                const sectionSubtitle = data?.[`sectionSubtitle_${locale}`] || ''
                const selected = items[selectedIndex]

                const getName = item => {
                    const localePath = locale === 'ar' ? data?.namePath_ar : data?.namePath_en
                    if (localePath) return getData(item, localePath, '')
                    if (data?.namePath) return getField(item, data.namePath, locale)
                        
                    return getData(item, `name_${locale}`, getData(item, 'name_ar', getData(item, 'name', '')))
                }

                const getPeriod = item => {
                    const fromRaw = data?.periodPath_from
                        ? getData(item, data.periodPath_from, '')
                        : getData(item, 'period_from', getData(item, 'start_year', ''))

                    const toRaw = data?.periodPath_to
                        ? getData(item, data.periodPath_to, '')
                        : getData(item, 'period_to', getData(item, 'end_year', ''))

                    if (fromRaw || toRaw) {
                        const from = fromRaw ? localizeDateString(fromRaw, locale) : ''
                        const to = toRaw ? localizeDateString(toRaw, locale) : (locale === 'ar' ? 'الآن' : 'Now')
                       
                        return from ? `${from} - ${to}` : to
                    }

                    return ''
                }

                const getBio = item => {
                    const localePath = locale === 'ar' ? data?.bioPath_ar : data?.bioPath_en
                    if (localePath) return getData(item, localePath, '')
                    if (data?.bioPath) return getField(item, data.bioPath, locale)

                    return getData(item, `bio_${locale}`, getData(item, 'bio_ar', getData(item, 'bio', getData(item, `description_${locale}`, getData(item, 'description_ar', '')))))
                }

                const getImage = item => {
                    const raw = data?.imagePath
                        ? getData(item, data.imagePath, '')
                        : getData(item, 'imageUrl', getData(item, 'photo', getData(item, 'image', '')))

                    return resolveImageUrl(raw)
                }
                if (items.length === 0) {
                    return (
                        <div
                            className='flex items-center justify-center text-gray-400 text-sm rounded-xl'
                            style={{ minHeight, background: '#f3f4f6' }}
                        >
                            {data?.api_url ? 'Loading...' : 'Configure API URL in settings'}
                        </div>
                    )
                }

                return (
                    <div dir={isRtl ? 'rtl' : 'ltr'} className='py-6 px-4'>
                        <div
                            className='rounded-2xl overflow-hidden'
                            style={{ background: data?.cardBg || '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
                        >
                            {/* Section header */}
                            {(sectionTitle || sectionSubtitle) && (
                                <div className={`px-8 pt-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                                    {sectionTitle && (
                                        <h2 className='text-2xl font-bold' style={{ color: accentColor }}>{sectionTitle}</h2>
                                    )}
                                    {sectionSubtitle && (
                                        <p className='text-sm text-gray-500 mt-1'>{sectionSubtitle}</p>
                                    )}
                                </div>
                            )}
                            {/* Timeline */}
                            <div className='px-8 pt-6 pb-2'>
                                <div className='relative flex items-center' style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                                    {/* Background line */}
                                    <div
                                        className='absolute top-2 w-full h-0.5'
                                        style={{ background: '#d1d5db', zIndex: 0 }}
                                    />
                                    {/* Filled line up to selected dot */}
                                    {(() => {
                                        const pct = items.length > 1
                                            ? (selectedIndex / (items.length - 1)) * 100
                                            : 100
                                        const side = isRtl ? 'right' : 'left'

                                        return (
                                            <div
                                                className='absolute top-2 h-0.5 transition-all duration-300'
                                                style={{ [side]: 0, width: `${pct}%`, background: accentColor, zIndex: 1 }}
                                            />
                                        )
                                    })()}
                                    {/* Dots + labels */}
                                    {items.map((item, i) => {
                                        const isActive = i === selectedIndex
                                        const name = getName(item)

                                        return (
                                            <div
                                                key={i}
                                                className='relative flex flex-col items-center cursor-pointer'
                                                style={{ flex: 1, zIndex: 2 }}
                                                onClick={() => setSelectedIndex(i)}
                                            >
                                                <div
                                                    className='transition-all duration-200'
                                                    style={{
                                                        width: isActive ? 18 : 10,
                                                        height: isActive ? 18 : 10,
                                                        borderRadius: '50%',
                                                        background: isActive ? accentColor : '#9ca3af',
                                                        border: isActive ? `3px solid ${accentColor}` : '2px solid #9ca3af',
                                                        boxShadow: isActive ? `0 0 0 3px ${accentColor}33` : 'none',
                                                        marginTop: isActive ? -4 : 0
                                                    }}
                                                />
                                                <span
                                                    className='mt-2 text-xs text-center leading-tight max-w-20'
                                                    style={{
                                                        color: isActive ? accentColor : '#6b7280',
                                                        fontWeight: isActive ? 700 : 400,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {name}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            {/* Detail panel */}
                            {selected && (
                                <div
                                    className='flex gap-6 px-8 py-6'
                                    style={{
                                        minHeight,
                                        direction: isRtl ? 'rtl' : 'ltr',
                                        flexDirection: isRtl ? 'row' : 'row-reverse'
                                    }}
                                >
                                    {/* Text side */}
                                    <div className='flex-1 min-w-0'>
                                        <h3
                                            className='text-xl font-bold mb-1'
                                            style={{ color: accentColor }}
                                        >
                                            {getName(selected)}
                                        </h3>
                                        {getPeriod(selected) && (
                                            <p className='text-sm text-gray-500 mb-3'>{getPeriod(selected)}</p>
                                        )}
                                        <p
                                            className='text-sm text-gray-700 leading-relaxed'
                                            style={bioLineLimit > 0 ? {
                                                display: '-webkit-box',
                                                WebkitLineClamp: bioLineLimit,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            } : {}}
                                        >
                                            {getBio(selected)}
                                        </p>
                                    </div>
                                    {/* Photo side */}
                                    {showImages && getImage(selected) && (
                                        <div className='shrink-0' style={{ width: 180 }}>
                                            <img
                                                src={getImage(selected)}
                                                alt={getName(selected)}
                                                className='w-full h-full object-cover rounded-lg'
                                                style={{ maxHeight: minHeight }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
            id: 'ministersTimeline',
            title: messages?.ministersTimeline?.title || 'Ministers Timeline',
            description: messages?.ministersTimeline?.description || 'Interactive horizontal timeline of people with bio and photo',
            version: 1,
            icon: <MdTimeline className='text-2xl' />,
            controls: {
                type: 'custom',
                Component: ({ data, onChange }) => (
                    <MinistersTimelineControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
                )
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale, advancedEdit])

    return { MinistersTimeline }
}