import { useMemo, useState, useEffect } from 'react'
import { MdOutlineOpenInNew } from 'react-icons/md'
import { useIntl } from 'react-intl'
import { TextField, InputAdornment, Checkbox, FormControlLabel } from '@mui/material'
import CloseNav from '../CloseNav'
import { axiosGet } from 'src/Components/axiosCall'
import Editor from '@react-page/editor'

export default function usePopup({ locale, buttonRef, readOnly }) {
  const { messages } = useIntl()

  const popup = useMemo(() => {
    return {
      /* ---------------- REQUIRED BY react-page ---------------- */
      id: 'popup',
      version: 1,

      /* ---------------- Metadata ---------------- */
      title: messages?.dialogs?.popup || (locale === 'ar' ? 'نافذة منبثقة' : 'Popup'),
      description:
        messages?.dialogs?.popupDescription ||
        (locale === 'ar'
          ? 'بلوك يظهر كنافذة منبثقة في وضع العرض'
          : 'Block that appears as a popup in view mode'),

      /* ---------------- Renderer ---------------- */
      Renderer: ({ data, children }) => (
        <PopupRenderer data={data} readOnly={readOnly} locale={locale}>
        </PopupRenderer>
      ),

      /* ---------------- Controls ---------------- */
      controls: {
        type: 'custom',
        Component: ({ data = {}, onChange }) => {
          const title = messages?.dialogs?.popup || (locale === 'ar' ? 'نافذة منبثقة' : 'Popup')

          const handleChange = (field, value) => {
            const next = { ...(data || {}), [field]: value }
            onChange(next)
          }

          return (
            <div style={{ padding: 16 }}>
              <CloseNav text={title} buttonRef={buttonRef} />

              <TextField
                fullWidth
                variant='filled'
                label={locale === 'ar' ? 'Popup ID' : 'Popup ID'}
                helperText={
                  locale === 'ar'
                    ? 'استخدم هذا الـ ID للتحكم في إظهار / إخفاء الـ popup من زر أو كود JavaScript'
                    : 'Use this ID to toggle the popup from a button or custom JavaScript'
                }
                margin='normal'
                value={data?.popupId || ''}
                onChange={e => handleChange('popupId', e.target.value)}
              />

              <TextField
                fullWidth
                variant='filled'
                label={locale === 'ar' ? 'اسم الصفحة لعرضها داخل الـ Popup' : 'Page name to load inside popup'}
                helperText={
                  locale === 'ar'
                    ? 'اكتب اسم الصفحة (pageName) ليتم جلب بياناتها من الـ API وعرضها داخل الـ popup'
                    : 'Enter pageName to fetch its data from API and render it inside the popup'
                }
                margin='normal'
                value={data?.targetPageName || ''}
                onChange={e => handleChange('targetPageName', e.target.value)}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={data?.defaultOpen ?? false}
                    onChange={e => handleChange('defaultOpen', e.target.checked)}
                  />
                }
                label={
                  locale === 'ar'
                    ? 'يفتح افتراضياً في وضع العرض'
                    : 'Open by default in view mode'
                }
              />

              <TextField
                fullWidth
                type='number'
                variant='filled'
                label={locale === 'ar' ? 'العرض (px)' : 'Width (px)'}
                margin='normal'
                value={data?.width ?? 500}
                onChange={e => handleChange('width', Number(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position='end'>px</InputAdornment>
                }}
              />

              <TextField
                fullWidth
                type='number'
                variant='filled'
                label={locale === 'ar' ? 'الارتفاع (px)' : 'Height (px)'}
                margin='normal'
                value={data?.height ?? 300}
                onChange={e => handleChange('height', Number(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position='end'>px</InputAdornment>
                }}
              />

              <TextField
                fullWidth
                type='number'
                variant='filled'
                label={locale === 'ar' ? 'زاوية الانحناء (px)' : 'Border radius (px)'}
                margin='normal'
                value={data?.borderRadius ?? 8}
                onChange={e => handleChange('borderRadius', Number(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position='end'>px</InputAdornment>
                }}
              />

              <TextField
                fullWidth
                type='color'
                variant='filled'
                label={locale === 'ar' ? 'لون الخلفية' : 'Background color'}
                margin='normal'
                value={data?.backgroundColor || '#ffffff'}
                onChange={e => handleChange('backgroundColor', e.target.value)}
              />

              <TextField
                fullWidth
                type='number'
                variant='filled'
                label='z-index'
                margin='normal'
                value={data?.zIndex ?? 1000}
                onChange={e => handleChange('zIndex', Number(e.target.value) || 1000)}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={data?.showBackdrop ?? true}
                    onChange={e => handleChange('showBackdrop', e.target.checked)}
                  />
                }
                label={
                  locale === 'ar'
                    ? 'إظهار خلفية داكنة خلف الـ popup'
                    : 'Show dark backdrop behind popup'
                }
              />
            </div>
          )
        }
      },

      /* ---------------- Icon ---------------- */
      icon: <MdOutlineOpenInNew className='text-2xl' />
    }
  }, [buttonRef, locale, messages, readOnly])

  return { popup }
}

function PopupRenderer({ data, children, readOnly, locale }) {
  const { locale: intlLocale, messages } = useIntl()
  const effectiveLocale = locale || intlLocale
  const popupId = data?.popupId || undefined
  const targetPageName = data?.targetPageName || ''
  const width = data?.width || 500
  const height = data?.height || 300
  const borderRadius = data?.borderRadius ?? 8
  const showBackdrop = data?.showBackdrop ?? true
  const zIndex = data?.zIndex ?? 1000
  const backgroundColor = data?.backgroundColor || '#ffffff'

  // في وضع العرض نخلي الـ popup مقفول افتراضياً، ونقدر نتحكم فيه من بره عن طريق الـ id
  const initialOpen = !!data?.defaultOpen
  const [open, setOpen] = useState(initialOpen)
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState(null)
  const [pageInfo, setPageInfo] = useState(null)


  // نسمع لحدث عام عشان نقدر نفتحه/نقفله من أي زر أو كود JavaScript
  useEffect(() => {
    if (!popupId) return

    const handler = e => {
      const detail = e.detail || {}
      if (detail.id !== popupId) return

      const action = detail.action || 'toggle'
      if (action === 'open') setOpen(true)
      else if (action === 'close') setOpen(false)
      else if (action === 'toggle') setOpen(prev => !prev)
    }

    window.addEventListener('popup-toggle', handler)

    return () => window.removeEventListener('popup-toggle', handler)
  }, [popupId])



  useEffect(() => {
    if (!open || !targetPageName) return

    let cancelled = false

    const fetchPage = async () => {
      try {
        setPageLoading(true)
        setPageError(null)
        const res = await axiosGet(`page/get-latest-version/${targetPageName.trim()}/`, effectiveLocale)
        if (!cancelled && res?.status && res?.jsonData) {
          const parsed = JSON.parse(res.jsonData || '{}')
          setPageInfo({
            editorValue: parsed?.editorValue ?? null,
            apiData: parsed?.apiData ?? null
          })
        }
      } finally {

        if (!cancelled) setPageLoading(false)
      }
    }

    fetchPage()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetPageName, locale])

  if (!readOnly) {
    // Edit mode: يظهر كبلوك عادي داخل الصفحة
    return (
      <div
        id={popupId}
        style={{
          border: '1px dashed #9ca3af',
          borderRadius: borderRadius + 'px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            insetInlineEnd: 12,
            fontSize: 12,
            color: '#6b7280'
          }}
        >
          {locale === 'ar'
            ? `Popup: ${popupId || 'بدون ID (لن يمكن التحكم به من زر)'}`
            : `Popup: ${popupId || 'No ID (cannot be controlled from button)'}`}
        </div>
      </div>
    )
  }

  // View mode: يظهر كـ popup فوق الصفحة (عن طريق الـ id + event تقدر تتحكم في إظهاره وإخفائه فقط)

  // عند الفتح + وجود اسم صفحة، نجيب بياناتها من الـ API ونخزنها في state


  // لو مفيش id أو مش مفتوح حالياً → منعرضش حاجة في الـ view
  if (!popupId || !open) {
    return null
  }

  const backdropStyle = showBackdrop
    ? {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex
    }
    : {
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex
    }

  const boxStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: '95vw',
    height: typeof height === 'number' ? `${height}px` : height,
    maxHeight: '90vh',
    backgroundColor,
    borderRadius: borderRadius + 'px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    overflow: 'auto',
    padding: '16px',
    pointerEvents: 'auto',
    position: 'relative'
  }

  // نحاول نستخدم نفس الـ cellPlugins المستخدمة في المحرر الرئيسي لو كانت متاحة على window
  const globalCellPlugins =
    typeof window !== 'undefined' && window.__pageBuilderCellPlugins
      ? window.__pageBuilderCellPlugins
      : []

  return (
    <div id={popupId} style={backdropStyle}>
      <div style={boxStyle}>
        {/* زر إغلاق داخلي */}
        <button
          type='button'
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 8,
            insetInlineEnd: 12,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            color: '#6b7280'
          }}
          aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
        >
          ×
        </button>

        {/* لو فيه targetPageName نعرض حالة الـ API */}
        {targetPageName && (
          <div style={{ marginBottom: 16 }}>

            {pageLoading && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                {effectiveLocale === 'ar' ? 'جاري تحميل بيانات الصفحة...' : 'Loading page data...'}
              </div>
            )}
            {pageError && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#b91c1c' }}>
                {pageError}
              </div>
            )}
    
            <Editor
              blurGateDisabled={true}
              cellPlugins={globalCellPlugins}
              value={pageInfo?.editorValue}
              onChange={(e, editor) => {
              }}
              readOnly={true}
              uiTranslator={(key) => {
                return messages.pagestranslations?.[key] || key
              }}
              lang={effectiveLocale}
              languages={['en', 'ar']}
            />


          </div>
        )}

        {/* المحتوى اليدوي (children) من البيلدر */}
      </div>
    </div>
  )
}

