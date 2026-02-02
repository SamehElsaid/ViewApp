import { useIntl } from 'react-intl'
import { useMemo, useRef } from 'react'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'

const ResponsiveGridLayout = WidthProvider(GridLayout)

const formatValue = value => {
  if (value === null || value === undefined) {
    return ''
  }
  if (value instanceof Date) {
    return value.toLocaleString()
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const replacePlaceholders = (htmlContent, inputsWithValues) => {
  return htmlContent.replace(/\{\s*([\s\S]*?)\s*\}/g, (_, key) => {
    const removedTags = key.replace(/<[^>]*>?/g, '')
    const input = inputsWithValues.find(i => i.key.toLowerCase() === removedTags.trim().toLowerCase())

    console.log(input, 'input', removedTags, formatValue(input.value))

    return input ? formatValue(input.value) : `{${removedTags}}`
  })
}

function PrintContent({ printData }) {
  const { locale } = useIntl()
  const refTest = useRef(null)

  const getCurrentCSS = () => {

    console.log(printData.customCSS, 'printData.customCSS')

    return printData.customCSS || `label {
  margin-bottom: 8px;
  display: block;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}
input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.2s;
}
input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}`
  }

  const layout = useMemo(() => {
    if (printData.inputsOrder && Array.isArray(printData.inputsOrder)) {
      return printData.inputsOrder.map((input, index) => ({
        i: input.key || input.i,
        x: input.x || 0,
        y: input.y !== undefined ? input.y : index,
        w: input.w || 12,
        h: input.h || 1
      }))
    }

    // Fallback: إنشاء layout من inputsWithValues
    return printData.inputsWithValues?.map((input, index) => ({
      i: input.key,
      x: 0,
      y: index,
      w: 12,
      h: 1
    })) || []
  }, [printData.inputsOrder, printData.inputsWithValues])

  console.log(printData)

  return (
    <div className='p-4 ' >
      <div id='print-preview'>
        <style>{`#print-preview { ${getCurrentCSS()} }`}</style>
        <ResponsiveGridLayout
          className='layout'
          layout={Array.isArray(layout) ? layout : []}
          ref={refTest}
          cols={12}
          rowHeight={71}
          onLayoutChange={newLayout => {
            // View only - لا نقوم بأي تحديث
          }}
          draggableHandle='.drag-handle'
          isResizable={false}
          isDraggable={false}
          margin={[10, 10]}
        >
          {printData.inputsWithValues?.map(input => (
            <div key={input.key} className='drag-handle'>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                {locale === 'ar' ? input.nameAr : input.nameEn} :
              </label>
              <input
                type='text'
                value={formatValue(input.value)}
                readOnly
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
      {printData.pages.map(page => {
        // استخدام المحتوى حسب اللغة، مع دعم البنية القديمة (content)
        const contentToUse = locale === 'ar'
          ? (page.content_ar || page.content || '')
          : (page.content_en || page.content || '')

        return (
          <div key={page.id} className='min-h-screen'>
            <div
              dangerouslySetInnerHTML={{ __html: replacePlaceholders(contentToUse, printData.inputsWithValues) }}
            ></div>
          </div>
        )
      })}
    </div>
  )
}

export default PrintContent
