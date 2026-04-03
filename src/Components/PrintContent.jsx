import { useIntl } from 'react-intl'
import { useMemo } from 'react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

    return input ? formatValue(input.value) : `{${removedTags}}`
  })
}

// عنصر عرض فقط بنفس مكتبة الترتيب (@dnd-kit) — بدون سحب
function PrintSortableItem({ input, layoutItem, locale, data }) {
  const { setNodeRef, transform, transition } = useSortable({
    id: layoutItem.i,
    disabled: true
  })

  const w = layoutItem?.w ?? 12
  const h = layoutItem?.h ?? 1

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${w}`,
    minHeight: `${h * 70}px`,
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '16px',
    backgroundColor: '#fff'
  }

  if (input.kind === 'Table') {
    const tableData = data?.[input.key] || {}
    const header = tableData?.inputsVisibility || []
    const rows = input?.value || []

    const tableWrapperStyle = {
      overflowX: 'auto',
      marginTop: '4px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }

    const tableStyle = {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
      fontFamily: 'inherit'
    }

    const thStyle = {
      padding: '12px 14px',
      textAlign: 'start',
      fontWeight: 600,
      color: '#374151',
      backgroundColor: '#f9fafb',
      borderBottom: '2px solid #e5e7eb',
      whiteSpace: 'nowrap'
    }

    const tdStyle = {
      padding: '10px 14px',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827'
    }

    const trHoverStyle = {
      backgroundColor: '#f9fafb'
    }

    return (
      <div ref={setNodeRef} style={style}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
          {locale === 'ar' ? input.nameAr : input.nameEn} :
        </label>
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {header.map((item) => {
                  const getInputRole = tableData?.additional_fields
                    ?.find(el => el.key === item.id)?.roles

                  const label = getInputRole?.label?.label_ar ?? item.nameAr
                  const labelEn = getInputRole?.label?.label_en ?? item.nameEn

                  return (
                    <th key={item.key} style={thStyle}>
                      {locale === 'ar' ? label : labelEn}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={header.length}
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      padding: '24px'
                    }}
                  >
                    {locale === 'ar' ? 'لا توجد بيانات' : 'No data'}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr
                    key={row.id ?? rowIndex}
                    style={rowIndex % 2 === 1 ? trHoverStyle : undefined}
                  >
                    {header.map((item) => (
                      <td key={item.key} style={tdStyle}>
                        {formatValue(row[item.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        {locale === 'ar' ? input.nameAr : input.nameEn} :
      </label>
      <input type='text' value={formatValue(input.value)} readOnly />
    </div>
  )
}

function PrintContent({ printData, data }) {
  const { locale } = useIntl()
  
  const tabs = data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data || []

  const getCurrentCSS = () => {


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

  // ترتيب وعرض الحقول حسب inputsOrder مع استبعاد المخفية (hiddenShow)
  const { visibleLayout, orderedInputs } = useMemo(() => {
    const visibilityMap = printData.inputsVisibility || {}
    const inputsWithValues = printData.inputsWithValues || []


    const fullLayout =
      printData.inputsOrder && Array.isArray(printData.inputsOrder)
        ? printData.inputsOrder.map((input, index) => ({
          i: input.key ?? input.i,
          x: input.x ?? 0,
          y: input.y !== undefined ? input.y : index,
          w: input.w ?? 12,
          h: input.h ?? 1
        }))
        : inputsWithValues.map((input, index) => ({
          i: input.key,
          x: 0,
          y: index,
          w: 12,
          h: 1
        }))

    // استبعاد الحقول المخفية (Hidden) من الطباعة
    const visibleLayout = fullLayout.filter(
      item => !Boolean(visibilityMap[item.i]?.hiddenShow)
    )

    // ترتيب قائمة الـ inputs حسب ترتيب visibleLayout
    const orderedInputs = visibleLayout
      .map(layoutItem => inputsWithValues.find(inp => inp.key === layoutItem.i))
      .filter(Boolean)

    return { visibleLayout, orderedInputs }
  }, [printData])


  return (
    <div className='p-4' style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
      <div id='print-preview'>
        <style>{`#print-preview { ${getCurrentCSS()} }`}</style>
        <DndContext onDragEnd={() => { }}>
          <SortableContext
            items={visibleLayout.map(item => item.i)}
            strategy={verticalListSortingStrategy}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '10px',
                gridAutoFlow: 'row',
                width: '100%'
              }}
            >
              {(tabs && tabs.length > 0
                ? tabs.map((tab, tabIndex) => {
                  const tabFields = tab.fields || []
                  const tabLayoutItems = visibleLayout.filter(item => tabFields.includes(item.i))

                  if (!tabLayoutItems.length) return null

                  return (
                    <>
                      <div
                        key={`${tab.id || tabIndex}-header`}
                        style={{
                          gridColumn: '1 / -1',
                          marginTop: tabIndex > 0 ? '24px' : 0,
                          marginBottom: '8px',
                          paddingBottom: '4px',
                          borderBottom: '1px solid #e5e7eb',
                          fontWeight: 600,
                          fontSize: '15px',
                          pageBreakBefore: tabIndex > 0 ? 'always' : 'auto'
                        }}
                      >
                        {locale === 'ar' ? tab.name_ar : tab.name_en}
                      </div>

                      {tabLayoutItems.map(layoutItem => {
                        const input = orderedInputs.find(inp => inp.key === layoutItem.i)
                        if (!input) return null

                        return (
                          <PrintSortableItem
                            key={input.key}
                            input={input}
                            layoutItem={layoutItem}
                            locale={locale}
                            data={data}
                          />
                        )
                      })}
                    </>
                  )
                })
                : orderedInputs.map((input, index) => (
                  <PrintSortableItem
                    key={input.key}
                    input={input}
                    layoutItem={visibleLayout[index]}
                    locale={locale}
                    data={data}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {(printData.pages || []).map(page => {
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
