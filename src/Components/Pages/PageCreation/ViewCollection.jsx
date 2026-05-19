/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { axiosGet, axiosPost, axiosPut } from 'src/Components/axiosCall'
import DisplayField from './DisplayField'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import InputControlDesign from './InputControlDesign'
import { DndContext, closestCenter, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors, KeyboardSensor, DragOverlay, useDroppable } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DefaultStyle, getTypeFromCollection } from 'src/Components/_Shared'
import { IoMdSettings } from 'react-icons/io'
import { useIntl } from 'react-intl'
import { CircularProgress, Skeleton } from '@mui/material'
import { useDispatch } from 'react-redux'
import AssociationsSetup from 'src/Components/Popup/AssociationsSetup'
import { resolveTableApiQueryFilter } from './TableReport'



function isTable(collectionsArray) {
  const includeTable = []

  collectionsArray.forEach(item => {
    if (item.isTable) {
      includeTable.push(item.collection.key)
    }
  })

  return includeTable
}

const flattenDynamic = (data, SelectedRelatedCollectionsFields) => {
  const collectionsArray = isTable(SelectedRelatedCollectionsFields || [])

  const result = {};


  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        result[key] = "";
      } else if (value[0] && typeof value[0] === 'object') {
        if (key.toLowerCase() === 'contact') {
          // لو array اسمها Contact
          value.forEach(item => {
            Object.entries(item).forEach(([subKey, subValue]) => {
              result[`${subKey}[${key}]`] = subValue ?? "";
            });
          });
        } else {
          // أي array object تانية تتحول form-table[key]
          if (collectionsArray.includes(key)) {
            result[`form-table[${key}]`] = value.map(item => {
              const newItem = {};
              Object.entries(item).forEach(([subKey, subValue]) => {
                newItem[subKey] = subValue ?? false;
              });

              return newItem;
            });
          } else {

            const firstItem = value[0]; // أول عنصر
            if (firstItem) {
              Object.entries(firstItem).forEach(([subKey, subValue]) => {
                // هنا يطلع كل حقل على شكل Field[key]: value

                result[`${subKey}[${key}]`] = subValue ?? "";

              });
            }
          }
        }
      } else {
        // array بسيطة
        result[key] = value.map(v => v ?? false);
      }
    } else if (value && typeof value === 'object') {
      // object عادي
      Object.entries(value).forEach(([subKey, subValue]) => {
        result[`${subKey}[${key}]`] = subValue ?? "";
      });
    } else {
      // primitive
      result[key] = value ?? "";
    }
  });



  return result;
};

// Drop zone rendered after each visual row in edit mode
function SoloRowDropZone({ id, locale, clickToMoveEnabled, onClickMove }) {
  const { setNodeRef, isOver, active } = useDroppable({ id })
  const isDragging = !!active

  return (
    <div
      ref={setNodeRef}
      onClick={() => {
        if (clickToMoveEnabled) {
          onClickMove?.(id)
        }
      }}
      style={{ gridColumn: 'span 12' }}
      className={`my-1 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-200 ${clickToMoveEnabled ? 'cursor-pointer hover:border-main-color hover:bg-main-color/10' : ''
        } ${isOver
          ? 'min-h-[80px] border-main-color bg-main-color/10'
          : isDragging
            ? 'min-h-[64px] border-main-color/40 bg-main-color/3'
            : 'bg-transparent min-h-[28px] border-main-color/20'
        }`}
    >
      <span className={`font-medium select-none transition-all pointer-events-none ${isOver
          ? 'text-sm text-main-color'
          : isDragging
            ? 'text-xs text-main-color/50'
            : 'text-main-color/30 text-[10px]'
        }`}>
        {isOver
          ? (locale === 'ar' ? '← أفلت هنا' : 'Drop here →')
          : clickToMoveEnabled
            ? (locale === 'ar' ? 'انقر للنقل هنا' : 'Click to move here')
            : '+ Solo Row'}
      </span>
    </div>
  )
}

function EmptySpaceCard({ id, span, locale, clickToMoveEnabled, onClickMove }) {
  const safeSpan = Math.max(1, Math.min(12, Number(span) || 1))

  return (
    <div
      style={{ gridColumn: `span ${safeSpan}` }}
      onClick={() => {
        if (clickToMoveEnabled) {
          onClickMove?.(id, safeSpan)
        }
      }}
      className={`rounded-lg border-2 border-dashed min-h-[80px] flex items-center justify-center transition-all duration-200 ${clickToMoveEnabled
          ? 'cursor-pointer border-main-color/50 bg-main-color/5 hover:bg-main-color/10 hover:border-main-color'
          : 'bg-transparent border-main-color/20'
        }`}
    >
      <span className='text-[11px] text-main-color/60 select-none pointer-events-none'>
        {clickToMoveEnabled
          ? (locale === 'ar' ? 'انقل هنا للمساحة الفاضية' : 'Move into empty space')
          : (locale === 'ar' ? 'مساحة فاضية' : 'Empty Space')}
      </span>
    </div>
  )
}

function SortableCollapseSectionHeader({
  filed,
  readOnly,
  stopSort,
  locale,
  layout,
  layoutMap,
  setLayout,
  onChange,
  data,
  setOpen,
  isOpen,
  onToggle,
  moveSourceId,
  onSelectMoveSource,
  onMoveToItem,
  onAssignToSection,
  design
}) {
  const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({
    id: filed.id,
    disabled: readOnly || stopSort
  })

  const isMoveSource = moveSourceId === filed.id
  const canMoveHere = !!moveSourceId && moveSourceId !== filed.id

  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.35 : 1,
    gridColumn: 'span 12',
    position: 'relative'
  }

  const sectionName = filed[`name_${locale}`] || filed.name_en || filed.name_ar || 'Collapse Section'

  // Parse design CSS to extract .collapse-header styles (handles values with colons like gradients)
  const headerInlineStyle = {}
  if (design) {
    try {
      const block = design.match(/\.collapse-header\s*\{([^}]*)\}/)
      if (block) {
        block[1].split(';').forEach(rule => {
          const colonIdx = rule.indexOf(':')
          if (colonIdx === -1) return
          const prop = rule.slice(0, colonIdx).trim()
          const val = rule.slice(colonIdx + 1).trim() // rest after first colon = full value
          if (prop && val) {
            const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
            headerInlineStyle[camel] = val
          }
        })
      }
    } catch (_) {}
  }

  return (
    <div ref={setNodeRef} style={style} className='w-full' {...(!readOnly && !stopSort ? attributes : {})}>
      <div className='flex gap-2 items-center px-2 mt-2' style={{ marginBottom: isOpen ? 0 : '4px' }}>

        {/* Toggle button — styled via design CSS */}
        <button
          type='button'
          onClick={onToggle}
          style={{
            flex: 1,
            ...(Object.keys(headerInlineStyle).length === 0 && isOpen ? {
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0'
            } : {}),
            ...(Object.keys(headerInlineStyle).length === 0 && !isOpen ? {
              borderRadius: '6px'
            } : {}),
            ...headerInlineStyle
          }}
          className={Object.keys(headerInlineStyle).length === 0
            ? 'flex items-center justify-between px-4 py-2 text-sm font-semibold border cursor-pointer select-none text-main-color border-main-color hover:bg-main-color/10 transition-colors duration-200'
            : 'flex items-center justify-between w-full transition-colors duration-200'}
        >
          {sectionName}
          <span
            className='collapse-arrow'
            style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >▼</span>
        </button>

        {/* Add to Section — shown when a Move source is active */}
        {canMoveHere && (
          <button
            type='button'
            onClick={e => { e.stopPropagation(); onAssignToSection?.(moveSourceId, filed.id) }}
            className='px-2 py-1 text-xs text-white bg-main-color rounded-full border border-main-color hover:opacity-80'
          >
            {locale === 'ar' ? '← أضف للقسم' : 'Add to Section →'}
          </button>
        )}

        {/* Edit-mode controls */}
        {!readOnly && !stopSort && (
          <>
            {/* Tab assignment dropdown — same as regular elements */}
            {(() => {
              const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
              if (!tabsElement) return null

              const tabs = tabsElement.data || []
              const fieldId = filed.id // collapse section is new_element → use id

              const currentIndex = Math.max(
                -1,
                tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(fieldId))
              )

              return (
                <select
                  className='p-1 text-sm bg-white rounded border border-main-color'
                  value={currentIndex}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    const idx = parseInt(e.target.value, 10)
                    const addMore = [...(data.addMoreElement || [])]
                    const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                    if (tabsIdx === -1) return

                    const nextTabsEl = { ...addMore[tabsIdx] }
                    const nextData = [...(nextTabsEl.data || [])]

                    for (let ti = 0; ti < nextData.length; ti++) {
                      const t = { ...(nextData[ti] || {}) }
                      const arr = Array.isArray(t.fields) ? t.fields : []
                      if (arr.includes(fieldId)) {
                        t.fields = arr.filter(id => id !== fieldId)
                        nextData[ti] = t
                      }
                    }

                    if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                      const t = { ...(nextData[idx] || {}) }
                      const arr = Array.isArray(t.fields) ? t.fields : []
                      if (!arr.includes(fieldId)) {
                        t.fields = [...arr, fieldId]
                        nextData[idx] = t
                      }
                    }

                    nextTabsEl.data = nextData
                    addMore[tabsIdx] = nextTabsEl
                    onChange({ ...data, addMoreElement: addMore })
                  }}
                >
                  <option value={-1}>{locale === 'ar' ? 'بدون تاب' : 'No Tab'}</option>
                  {tabs.map((t, ti) => (
                    <option key={ti} value={ti}>
                      {t?.[`name_${locale}`] || t?.name_en || t?.name_ar || `Tab ${ti + 1}`}
                    </option>
                  ))}
                </select>
              )
            })()}

            <button
              type='button'
              onClick={e => { e.stopPropagation(); onSelectMoveSource?.(filed.id) }}
              className={`px-2 py-1 text-xs bg-white rounded border border-main-color hover:bg-main-color hover:text-white ${isMoveSource ? '!bg-main-color !text-white' : ''}`}
            >
              {isMoveSource ? (locale === 'ar' ? 'إلغاء' : 'Cancel') : (locale === 'ar' ? 'نقل' : 'Move')}
            </button>
            <button
              type='button'
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setOpen(filed) }}
              className='w-[28px] h-[28px] hover:bg-main-color hover:text-white duration-200 rounded-lg shadow text-lg flex items-center justify-center bg-white border-main-color border'
            >
              <IoMdSettings />
            </button>
          </>
        )}

      </div>
    </div>
  )
}

// Dnd Kit Sortable Item Component
function areEqual(prev, next) {
  // Only re-render if this item's swap-target status changed
  const prevIsTarget = prev.overId === prev.filed.id
  const nextIsTarget = next.overId === next.filed.id
  if (prevIsTarget !== nextIsTarget) return false
  if (nextIsTarget && prev.dragMode !== next.dragMode) return false

  return (
    prev.filed === next.filed &&
    prev.layout === next.layout &&
    prev.data === next.data &&
    prev.errors === next.errors &&
    prev.entitiesData === next.entitiesData &&
    prev.loadingEntitiesData === next.loadingEntitiesData &&
    prev.stopSort === next.stopSort &&
    prev.readOnly === next.readOnly &&
    prev.activeTab === next.activeTab &&
    prev.triggerData === next.triggerData &&
    prev.tabsData === next.tabsData &&
    prev.loading === next.loading &&
    prev.locale === next.locale &&
    prev.disabled === next.disabled &&
    prev.advancedEdit === next.advancedEdit &&
    prev.reload === next.reload &&
    prev.loadingSaveAsDraft === next.loadingSaveAsDraft &&
    prev.gridColumnSpan === next.gridColumnSpan &&
    prev.hoverText === next.hoverText &&
    prev.hintText === next.hintText &&
    prev.FormType === next.FormType &&
    prev.isEntitiesData === next.isEntitiesData &&
    prev.allowDrag === next.allowDrag &&
    prev.moveSourceId === next.moveSourceId
  )
}

const SortableGridItem = memo(function SortableGridItem({
  loadingSaveAsDraft,
  refErrorFromTable,
  tabsData,
  filed,
  advancedEdit,
  activeTab,
  readOnly,
  stopSort,
  locale,
  data,
  getDesign,
  setOpen,
  refError,
  setLayout,
  triggerData,
  onChange,
  layout,
  layoutMap,
  dataRef,
  dataRefWithCollectionId, setActiveTab,
  sortedLoop,
  setTriggerData,
  entitiesData,
  errors,
  addMoreElement,
  gridColumnSpan,
  className,
  hoverText,
  hintText,
  roles,
  handleSubmit,
  loading,
  disabled,
  reload,
  messages,
  sortedLoopWithoutTabs,
  FormType,
  saveAsDraft,
  loadingEntitiesData,
  reloadValue,
  isEntitiesData,
  overId,
  dragMode,
  allowDrag,
  moveSourceId,
  onSelectMoveSource,
  onMoveToItem
}) {
  const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({
    id: filed.id,
    disabled: readOnly || stopSort || !allowDrag
  })

  const layoutItem = layoutMap ? layoutMap.get(filed.id) : layout.find(l => l.i === filed.id)
  const currentWidth = layoutItem?.w || gridColumnSpan || 12
  const currentHeight = layoutItem?.h != null ? layoutItem.h : (filed.type === 'LongText' ? 1.2 : 1)

  const handleWidthChange = delta => {
    const newWidth = Math.max(1, Math.min(12, currentWidth + delta))

    const updatedLayout = layout.map(item =>
      item.i === filed.id
        ? { ...item, w: newWidth }
        : item
    )

    setLayout(updatedLayout)
    onChange({ ...data, layout: updatedLayout })
  }

  const handleWidthSet = value => {
    const newWidth = Math.max(1, Math.min(12, Number(value)))
    if (isNaN(newWidth)) return

    const updatedLayout = layout.map(item =>
      item.i === filed.id
        ? { ...item, w: newWidth }
        : item
    )

    setLayout(updatedLayout)
    onChange({ ...data, layout: updatedLayout })
  }

  const handleHeightChange = delta => {
    const newHeight = Math.max(0.5, Math.min(10, currentHeight + delta))

    const updatedLayout = layout.map(item =>
      item.i === filed.id
        ? { ...item, h: newHeight }
        : item
    )

    setLayout(updatedLayout)
    onChange({ ...data, layout: updatedLayout })
  }

  const handleHeightSet = value => {
    const newHeight = Math.max(0.5, Math.min(10, Number(value)))
    if (isNaN(newHeight)) return

    const updatedLayout = layout.map(item =>
      item.i === filed.id
        ? { ...item, h: newHeight }
        : item
    )

    setLayout(updatedLayout)
    onChange({ ...data, layout: updatedLayout })
  }

  const isSwapTarget = overId === filed.id && dragMode === 'swap'
  const isMoveSource = moveSourceId === filed.id
  const canMoveHere = !!moveSourceId && moveSourceId !== filed.id

  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.35 : 1,
    gridColumn: `span ${currentWidth}`,
    minHeight: `${currentHeight * 100}px`,
    overflow: currentHeight === 0 ? 'hidden' : undefined,
    position: 'relative',
    ...(isDragging ? {
      outline: '2px dashed var(--main-color, #3b82f6)',
      borderRadius: '6px',
      background: 'rgba(59,130,246,0.08)',
      zIndex: 0
    } : {}),
    ...(isSwapTarget ? {
      outline: '2px solid #f97316',
      borderRadius: '6px',
      background: 'rgba(249,115,22,0.07)'
    } : {}),
    ...(isMoveSource ? {
      outline: '2px solid #3b82f6',
      borderRadius: '6px',
      background: 'rgba(59,130,246,0.08)'
    } : {}),
  }




  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-full ${className} ${!readOnly ? 'px-2' : ''} ${hoverText || hintText ? '!z-[5555555]' : ''}`}
      {...(allowDrag && !readOnly && !stopSort ? attributes : {})}
    >
      {isSwapTarget && (
        <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] px-2 py-0.5 text-[10px] font-bold text-white bg-orange-500 rounded-full shadow pointer-events-none'>
          {locale === 'ar' ? 'تبديل' : 'SWAP'}
        </div>
      )}

      {loadingEntitiesData && (
        <div className="overflow-hidden absolute inset-0 z-20 bg-white rounded-md">
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
      )}

      {!readOnly && !stopSort && (
        <div className='flex absolute inset-0 z-20 flex-wrap gap-1 justify-end items-start p-1 rounded-md border border-dashed border-main-color'>
          {/* Width Controls */}
          <div className='flex flex-col items-center bg-white rounded border shadow-sm border-main-color'>
            <div className='px-1 w-full text-xs text-center text-gray-600 border-b border-gray-200'>
              {locale !== 'ar' ? 'Width' : 'العرض'}
            </div>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleWidthChange(-1)
                }}
                className='flex justify-center items-center w-6 h-6 text-xs font-bold hover:bg-main-color hover:text-white'
                title={locale !== 'ar' ? 'Decrease Width' : 'تقليل العرض'}
              >
                -
              </button>
              <input
                type='number'
                min={1}
                max={12}
                step={1}
                value={currentWidth}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  e.stopPropagation()
                  handleWidthSet(e.target.value)
                }}
                className='w-[38px] text-xs text-center border-x border-gray-200 outline-none bg-transparent py-0.5'
              />
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleWidthChange(1)
                }}
                className='flex justify-center items-center w-6 h-6 text-xs font-bold hover:bg-main-color hover:text-white'
                title={locale !== 'ar' ? 'Increase Width' : 'زيادة العرض'}
              >
                +
              </button>
            </div>
          </div>

          {/* Height Controls */}
          <div className='flex flex-col items-center bg-white rounded border shadow-sm border-main-color'>
            <div className='px-1 w-full text-xs text-center text-gray-600 border-b border-gray-200'>
              {locale !== 'ar' ? 'Height' : 'الارتفاع'}
            </div>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleHeightChange(-0.1)
                }}
                className='flex justify-center items-center w-6 h-6 text-xs font-bold hover:bg-main-color hover:text-white'
                title={locale !== 'ar' ? 'Decrease Height' : 'تقليل الارتفاع'}
              >
                -
              </button>
              <input
                type='number'
                min={0.5}
                max={10}
                step={0.1}
                value={parseFloat(currentHeight.toFixed(1))}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  e.stopPropagation()
                  handleHeightSet(e.target.value)
                }}
                className='w-[44px] text-xs text-center border-x border-gray-200 outline-none bg-transparent py-0.5'
              />
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  handleHeightChange(0.1)
                }}
                className='flex justify-center items-center w-6 h-6 text-xs font-bold hover:bg-main-color hover:text-white'
                title={locale !== 'ar' ? 'Increase Height' : 'زيادة الارتفاع'}
              >
                +
              </button>
            </div>
          </div>

          <button
            type='button'
            title={locale !== 'ar' ? 'Pick Item To Move' : 'اختيار العنصر للنقل'}
            onClick={e => {
              e.stopPropagation()
              onSelectMoveSource?.(filed.id)
            }}
            className={`px-2 py-1 text-xs bg-white rounded border border-main-color hover:bg-main-color hover:text-white ${isMoveSource ? 'text-white bg-main-color' : ''}`}
          >
            {isMoveSource
              ? (locale === 'ar' ? 'إلغاء النقل' : 'Cancel Move')
              : (locale === 'ar' ? 'نقل' : 'Move')}
          </button>
          {canMoveHere && (
            <button
              type='button'
              title={locale !== 'ar' ? 'Replace With Selected Item' : 'استبدال بهذا العنصر'}
              onClick={e => {
                e.stopPropagation()
                onMoveToItem?.(filed.id)
              }}
              className='px-2 py-1 text-xs text-white bg-green-600 rounded border border-green-700 hover:bg-green-700'
            >
              {locale === 'ar' ? 'استبدل هنا' : 'Replace Here'}
            </button>
          )}
          <button
            type='button'
            title={locale !== 'ar' ? 'Setting' : 'التحكم'}
            onMouseDown={e => {
              e.stopPropagation()
            }}
            onClick={e => {
              e.stopPropagation()
              setOpen(filed)
            }}
            className='w-[30px] h-[30px] hover:bg-main-color hover:text-white duration-200 rounded-lg shadow-2xl text-xl flex items-center justify-center bg-white border-main-color border'
          >
            <IoMdSettings />
          </button>
          {/* Quick tab assign */}
          {(() => {
            const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
            if (!tabsElement) return null
            const tabs = tabsElement.data || []
            const fieldId = filed.type === 'new_element' ? filed.id : filed.key

            const currentIndex = Math.max(
              -1,
              tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(fieldId))
            )

            return (
              <select
                className='p-1 ml-2 text-sm bg-white rounded border'
                value={currentIndex}
                onChange={e => {
                  const idx = parseInt(e.target.value, 10)
                  const addMore = [...(data.addMoreElement || [])]
                  const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                  if (tabsIdx === -1) return
                  const nextTabsEl = { ...addMore[tabsIdx] }
                  const nextData = [...(nextTabsEl.data || [])]
                  for (let i = 0; i < nextData.length; i++) {
                    const t = { ...(nextData[i] || {}) }
                    const arr = Array.isArray(t.fields) ? t.fields : []
                    if (arr.includes(fieldId)) {
                      t.fields = arr.filter(id => id !== fieldId)
                      nextData[i] = t
                    }
                  }
                  if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                    const t = { ...(nextData[idx] || {}) }
                    const arr = Array.isArray(t.fields) ? t.fields : []
                    if (!arr.includes(fieldId)) {
                      t.fields = [...arr, fieldId]
                      nextData[idx] = t
                    }
                  }
                  nextTabsEl.data = nextData
                  addMore[tabsIdx] = nextTabsEl
                  onChange({ ...data, addMoreElement: addMore })
                }}
              >
                <option value={-1}>{messages?.None || 'None'}</option>
                {tabs.map((t, ti) => (
                  <option key={ti} value={ti}>
                    {t?.[`name_${locale}`] || t?.name_en || t?.name_ar || `Tab ${ti + 1}`}
                  </option>
                ))}
              </select>
            )
          })()}

          {/* Quick collapse section assign */}
          {(() => {
            const collapseSections = (data.addMoreElement || []).filter(ele => ele.key === 'collapse_section')
            if (!collapseSections.length) return null

            // Match by id OR key so both assignment paths work
            const currentSection = collapseSections.find(s => {
              const fields = Array.isArray(s.data?.fields) ? s.data.fields : []

              return fields.includes(filed.id) || fields.includes(filed.key)
            })
            const currentSectionId = currentSection?.id ?? ''

            // The canonical fieldId to store: prefer key for collection fields (tab convention),
            // but also keep id so the cross-index map finds it
            const fieldKey = filed.type === 'new_element' ? filed.id : filed.key
            const fieldId = filed.id // used to remove old assignments added via Move button

            return (
              <select
                className='p-1 ml-2 text-sm bg-white rounded border'
                value={currentSectionId}
                title={locale === 'ar' ? 'قسم قابل للطي' : 'Collapse Section'}
                onChange={e => {
                  const newSectionId = e.target.value

                  const addMore = (data.addMoreElement || []).map(ele => {
                    if (ele.key !== 'collapse_section') return ele

                    // Remove all traces of this field (both id and key) then add once
                    const fields = (ele.data?.fields || []).filter(id => id !== fieldId && id !== fieldKey)

                    if (ele.id === newSectionId) {
                      return { ...ele, data: { ...ele.data, fields: [...fields, fieldKey] } }
                    }

                    return { ...ele, data: { ...ele.data, fields } }
                  })

                  // When assigning to a section, move field below section + set full width
                  let newLayout = layout
                  if (newSectionId) {
                    const sectionItem = layout.find(l => l.i === newSectionId)
                    const sectionY = sectionItem?.y ?? 0
                    const sectionElement = (data.addMoreElement || []).find(ele => ele.id === newSectionId)
                    const existingFieldIds = new Set(sectionElement?.data?.fields || [])

                    const existingMaxY = layout
                      .filter(l => existingFieldIds.has(l.i))
                      .reduce((max, l) => Math.max(max, l.y), sectionY)
                    const targetY = existingMaxY + 1

                    newLayout = layout.map(l =>
                      l.i === filed.id ? { ...l, w: 12, y: targetY } : l
                    )
                  }

                  setLayout(newLayout)
                  onChange({ ...data, addMoreElement: addMore, layout: newLayout })
                }}
              >
                <option value=''>{locale === 'ar' ? 'بدون قسم' : 'No Section'}</option>
                {collapseSections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s[`name_${locale}`] || s.name_en || s.name_ar}
                  </option>
                ))}
              </select>
            )
          })()}
        </div>
      )}










      <DisplayField
        handleSubmit={handleSubmit}
        tabsData={tabsData}
        loadingBtn={loading}
        input={filed}
        FormType={FormType}
        design={getDesign(filed.id, filed)}
        isEntitiesData={isEntitiesData}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        loadingSaveAsDraft={loadingSaveAsDraft}
        readOnly={disabled}
        disabledBtn={data.type_of_sumbit === 'api' && !data.submitApi}
        refError={refError}
        refErrorFromTable={refErrorFromTable}
        setLayout={setLayout}
        triggerData={triggerData}
        data={data}
        layout={layout}
        onChangeData={onChange}
        saveAsDraft={saveAsDraft}
        dataRef={dataRef}
        dataRefWithCollectionId={dataRefWithCollectionId}
        allFields={sortedLoopWithoutTabs}
        setTriggerData={setTriggerData}
        findValue={tabsData?.[filed?.key] || entitiesData?.[filed?.key] || entitiesData?.[filed?.key]}
        roles={roles}
        advancedEdit={readOnly}
        editMode={advancedEdit}
        reload={reload}
        reloadValue={reloadValue}
        errorView={errors?.[filed.type === 'new_element' ? filed.id : filed.key]?.[0]}
        findError={
          errors && typeof errors?.[filed.type === 'new_element' ? filed.id : filed.key] === 'object'
        }
      />
    </div>
  )
}, areEqual)

export default function ViewCollection({
  data,
  locale,
  onChange,
  readOnly,
  disabled,
  pageId,
  advancedEdit,
  entitiesId,
  collectionName,
  pageName,
  FormType,
  isPrint
}) {
  const [getFields, setGetFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [stopSort, setStopSort] = useState(false)
  const [reload, setReload] = useState(0)
  const [errors, setErrors] = useState(false)
  const refError = useRef({})
  const refErrorFromTable = useRef({})
  const dataRef = useRef({})
  const dataRefWithCollectionId = useRef({})
  const [triggerData, setTriggerData] = useState(0)

  const [entitiesData, setEntitiesData] = useState()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState(0)
  const [tabsData, setTabsData] = useState(null)
  const [stopSortLayout, setStopSortLayout] = useState(false)




  useEffect(() => {
    setStopSortLayout(!readOnly ? true : false)
  }, [readOnly])

  useEffect(() => {
    refError.current = {}
    dataRef.current = {}
    refErrorFromTable.current = {}
  }, [activeTab])






  const findActiveTab = data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data?.find((ele, index) => index === activeTab)

  const { pathname, query, push, replace } = useRouter()


  const requestId = query.requestId
  const collection = query.collection
  const { messages } = useIntl()

  const [layout, setLayout] = useState(Array.isArray(data?.layout) ? data.layout : [])
  const addMoreElement = data.addMoreElement ?? []
  const dataLength = getFields.length + addMoreElement.length

  const sortedData = useMemo(() => {
    const groups = layout
      ? Object.values(
        layout.reduce((acc, item) => {
          const key = Math.floor(item.y)
            ; (acc[key] = acc[key] || []).push(item)

          return acc
        }, {})
      )
      : []

    return groups.map(group => group.sort((a, b) => a.x - b.x)).flat()
  }, [layout])
  const filterSelect = getFields





  useEffect(() => {
    if (!loading) {
      const layout = Array.isArray(data?.layout) ? [...data.layout] : []
      const items = [...filterSelect, ...addMoreElement]
      const lastY = layout.at(-1)?.y ?? 0
      items.forEach(item => {
        if (!layout.find(l => l.i === item.id)) {
          layout.push({
            i: item.id,
            x: 0,
            y: lastY + 1,
            w: 12,
            h: item.type === 'LongText' ? 1.8 : 1
          })
        }
      })

      setLayout(layout.map(item => ({ ...item, minH: 0 })))
    }
  }, [loading, data?.selected, dataLength])


  useEffect(() => {
    if (data.collectionId) {
      Promise.all([
        ...(data?.SelectedRelatedCollectionsFields?.map(async item => {
          if (item.isTable) {
            const tableKey = 'form-table[' + (item.collection?.key ?? '') + ']'

            const tableInput = {
              ...item.collection,
              nameAr: item.collection.nameAr,
              nameEn: item.collection.nameEn,
              type: "OneToMany",
              fieldCategory: "Associations",
              key: tableKey,
              id: tableKey,
              descriptionEn: JSON.stringify(item.selected),
              validationData: [], options: { source: item.collection.key },
              kind: 'Table'
            }

            return [tableInput]
          }
          const res = await axiosGet(`collection-fields/get?CollectionId=${item.collection.id}`, locale)
          if (res.status) {
            const selectedFields = res.data.filter(field => item.selected.includes(field.key))



            return selectedFields.map(field => ({ ...field, key: field.key + '[' + item.collection.key + ']' }))
          }

          return []
        }) || []),

        axiosGet(`collection-fields/get?CollectionId=${data.collectionId}`, locale).then(res => {
          if (res.status) {


            const filterData = res.data
              .filter(field => data?.selected?.includes(field?.key))

            // .map(field => {
            //   const find = associationsConfig.find(item => item?.key === field?.key)
            //   const filedData = { ...field }
            //   if (find) {

            //     filedData.kind = find.viewType
            //     filedData.descriptionEn = JSON.stringify(find.selectedOptions)
            //     filedData.getDataForm = find.dataSourceType
            //     filedData.externalApi = find.externalApi
            //     filedData.staticData = find.staticData
            //     filedData.selectedValueSend = JSON.stringify(find.selectedValueSend)
            //     filedData.apiHeaders = find.apiHeaders
            //     filedData.body = find.body
            //     filedData.method = find.method
            //     filedData.viewAsInput = find.viewAsInput
            //   }

            //   return field
            // })

            return filterData
          }

          return []
        })
      ])
        .then(results => {
          const validResults = results.filter(Boolean)
          const flatResults = validResults.flat()



          setGetFields(flatResults)
        })
        .finally(() => setLoading(false))
    } else {
      setGetFields([])
      setLoading(true)
    }
  }, [locale, data.collectionId, data.SelectedRelatedCollectionsFields, data.selected])

  const [isEntitiesData, setIsEntitiesData] = useState(false)
  const [loadingEntitiesData, setLoadingEntitiesData] = useState(true)


  useEffect(() => {
    const stopFetchingDataFromApi = data.stopFetchingDataFromApi ?? false

    if (entitiesId !== null && collectionName !== null && collectionName === data.collectionName && entitiesId && !stopFetchingDataFromApi) {
      axiosGet(`generic-entities/${collectionName}/${entitiesId}`, locale).then(res => {
        if (res.status) {
          setEntitiesData(flattenDynamic(res?.data?.entities?.[0], data?.SelectedRelatedCollectionsFields))
          setIsEntitiesData(true)
        }
      }).finally(() => setLoadingEntitiesData(false))
    } else {
      setLoadingEntitiesData(false)
    }
  }, [entitiesId, collectionName, pageName])






  const resolveQueryPlaceholders = useCallback(
    value => {
      if (Array.isArray(value)) {
        return value.map(item => resolveQueryPlaceholders(item))
      }

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, itemValue]) => [key, resolveQueryPlaceholders(itemValue)])
        )
      }

      if (typeof value === 'string') {
        return value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, queryKey) => {
          const queryValue = query?.[queryKey]
          if (Array.isArray(queryValue)) {
            return queryValue[0] ?? ''
          }
          if (queryValue !== undefined && queryValue !== null) {
            return queryValue
          }

          // Fallback to real URL search params when Next router query is not hydrated yet.
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search || '')
            const allValues = params.getAll(queryKey)
            if (allValues.length > 0) {
              return allValues[0] ?? ''
            }
          }

          return ''
        })
      }

      return value
    },
    [query]
  )

  const transformCollectionOutputBeforeSubmit = useCallback(
    (outputData, allDataPayload) => {
      const jsCode = data?.collectionBeforeSubmitJsData?.trim()
      if (!jsCode) {
        return resolveQueryPlaceholders(outputData)
      }

      try {
        const transformFn = new Function('output', 'allData', 'routerQuery', jsCode)
        const transformed = transformFn(outputData, allDataPayload, query)

        if (transformed && typeof transformed === 'object' && !Array.isArray(transformed)) {
          return resolveQueryPlaceholders({ ...outputData, ...transformed })
        }

        return resolveQueryPlaceholders(outputData)
      } catch (error) {
        console.error('collectionBeforeSubmitJsData execution error:', error)
        toast.error(messages?.dialogs?.invalidCode || 'Invalid JS code for submit data')

        return resolveQueryPlaceholders(outputData)
      }
    },
    [data?.collectionBeforeSubmitJsData, messages?.dialogs?.invalidCode, query, resolveQueryPlaceholders]
  )



  const handleSubmit = async (e, handleSubmitEvent) => {
    e.preventDefault()


    const initialSendData = { ...dataRef.current }
    if (data.submitApi?.includes('/api/Account/Register')) {
      delete initialSendData.pageWorkflows
      initialSendData.createdBy = 'system'
    }
    const sendData = {}
    Object.keys(initialSendData).forEach(key => {
      const keyData = key

      if (initialSendData[keyData] !== null) {
        sendData[keyData] = initialSendData[keyData]
      }
      if (Array.isArray(initialSendData[keyData]) && !keyData.startsWith("form-table[")) {
        sendData[keyData] = initialSendData[keyData].map(item => item.Id || item)
      }
    })
    if (data.type_of_sumbit === 'api' && !data.submitApi) {
      return
    }

    const errors = []


    if (refError.current) {
      for (const key in refError.current) {
        if (refError.current[key]) {
          errors.push(refError.current[key])
        }
      }
    }

    if (refErrorFromTable.current) {

      for (const key in refErrorFromTable.current) {
        if (refErrorFromTable.current[key]) {
          errors.push(refErrorFromTable.current[key])
        }
      }
    }

    const getBtnCheckErrors = document.querySelectorAll('.check-errors')

    getBtnCheckErrors.forEach(ele => {

      ele.click()
    })

    if (errors.find(ele => typeof ele === 'object')) {

      return setErrors(refError.current)
    }

    let output = {}

    const allData = { ...(tabsData || {}), ...sendData }



    Object.entries(allData).forEach(([key, value]) => {

      // 👈 لو form-table
      if (key.startsWith("form-table[")) {

        const match = key.match(/^form-table\[(.+)\]$/)

        if (match) {

          const arrayName = match[1]

          const tableData = allData[key]

          if (Array.isArray(tableData)) {

            const cleaned = tableData.map(item => {

              const newItem = {}

              Object.entries(item).forEach(([k, v]) => {

                // ❌ نشيل Id
                if (k === "Id") return

                // ❌ نشيل s + أرقام
                if (/^s\d+$/.test(k)) return

                // ❌ نشيل undefined.form-table
                if (k.startsWith("undefined.form-table")) return

                // ❌ نشيل uuid.Anything
                if (/^[a-f0-9-]+\./i.test(k)) return


                // ✅ لو Date نحوله
                if (v instanceof Date && !isNaN(v)) {
                  const localISO = new Date(
                    v.getTime() - v.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 19)

                  newItem[k] = localISO
                } else {
                  newItem[k] = v
                }

              })

              return newItem
            })

            output[arrayName] = cleaned
          }
        }

        return
      }




      // 👇 باقي المعالجة الطبيعية
      const match = key.match(/^(.+)\[(.+)\]$/)

      if (match) {
        const [, mainKey, subKey] = match
        output[subKey] = output[subKey] || {}
        output[subKey][mainKey] = value
      } else {
        if (value instanceof Date && !isNaN(value)) {
          const date = new Date(
            value.getTime() - value.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 19)

          output[key] = date
        } else {
          output[key] = value
        }
      }
    })



    const tabsDataArray = data?.addMoreElement.find(ele => ele.key === 'tabs')?.data ?? [];


    if (tabsDataArray.length > 0 && activeTab + 1 < tabsDataArray.length) {
      setActiveTab(prev => prev + 1)
      setTabsData(prev => ({ ...prev, ...dataRef.current }))
      const getTabId = document.getElementById(`tab-${data.collectionName}`)
      if (getTabId) {
        const yOffset = -100 // علشان يوقف قبل العنصر بـ 100px
        const y = getTabId.getBoundingClientRect().top + window.pageYOffset + yOffset

        window.scrollTo({
          top: y,
          behavior: 'smooth' // أو 'instant' لو عايز بدون animation
        })
      }

      return
    } else {
      output = { ...output }

    }





    setLoading(true)

    const apiCall =
      data.type_of_sumbit === 'api'
        ? data.submitApi
        : `generic-entities/${data.collectionName}/?pageId=${pageId}${requestId ? `&requestId=${requestId}` : ''}`



    const payloadOutput =
      data.type_of_sumbit === 'collection' ? transformCollectionOutputBeforeSubmit(output, allData) : output

    const draftOutput = transformCollectionOutputBeforeSubmit(output, {})
    axiosPost(apiCall, locale, draftOutput, false, false, data.type_of_sumbit !== 'collection' ? true : false)
      .then(res => {
        if (res.status) {
          toast.success(messages.dialogs.dataSentSuccessfully)
          if (data.onSubmit) {
            const evaluatedFn = eval('(' + data?.onSubmit + ')')
            if (handleSubmitEvent) {
              handleSubmitEvent()
            } else {
              evaluatedFn()
            }
          }
          if (data?.redirect) {
            const newHref = resolveTableApiQueryFilter(data.redirect, query)
            push(`/${locale}/${newHref === '/' ? '' : newHref}`)
          }
        }
      })
      .finally(() => setLoading(false))
  }


  const [loadingSaveAsDraft, setLoadingSaveAsDraft] = useState(false)


  const saveAsDraft = async (e, href) => {
    e?.preventDefault()


    const initialSendData = { ...dataRef.current }
    if (data.submitApi?.includes('/api/Account/Register')) {
      delete initialSendData.pageWorkflows
      initialSendData.createdBy = 'system'
    }
    const sendData = {}
    Object.keys(initialSendData).forEach(key => {
      const keyData = key

      if (initialSendData[keyData] !== null) {
        sendData[keyData] = initialSendData[keyData]
      }
      if (Array.isArray(initialSendData[keyData])) {
        sendData[keyData] = initialSendData[keyData].map(item => item.Id || item)
      }
    })

    let output = {}


    const allData = { ...(tabsData || {}), ...sendData }

    Object.entries(allData).forEach(([key, value]) => {

      // 👈 لو form-table
      if (key.startsWith("form-table[")) {

        const match = key.match(/^form-table\[(.+)\]$/)

        if (match) {
          const arrayName = match[1]

          const tableData = dataRef.current[key]

          if (Array.isArray(tableData)) {

            const cleaned = tableData.map(item => {

              const newItem = {}

              Object.entries(item).forEach(([k, v]) => {

                // ❌ نشيل Id
                if (k === "Id") return

                // ❌ نشيل s + أرقام
                if (/^s\d+$/.test(k)) return

                // ❌ نشيل undefined.form-table
                if (k.startsWith("undefined.form-table")) return

                // ❌ نشيل uuid.Anything
                if (/^[a-f0-9-]+\./i.test(k)) return


                // ✅ لو Date نحوله
                if (v instanceof Date && !isNaN(v)) {
                  const localISO = new Date(
                    v.getTime() - v.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 19)

                  newItem[k] = localISO
                } else {
                  newItem[k] = v
                }

              })

              return newItem
            })

            output[arrayName] = cleaned
          }
        }

        return
      }

      // 👇 باقي المعالجة الطبيعية
      const match = key.match(/^(.+)\[(.+)\]$/)

      if (match) {
        const [, mainKey, subKey] = match
        output[subKey] = output[subKey] || {}
        output[subKey][mainKey] = value
      } else {
        if (value instanceof Date && !isNaN(value)) {
          const date = new Date(
            value.getTime() - value.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 19)

          output[key] = date
        } else {
          output[key] = value
        }
      }
    })








    const draftOutput = transformCollectionOutputBeforeSubmit(output, allData)
    setLoadingSaveAsDraft(true)
    axiosPost(`generic-entities/${data.collectionName}/draft?pageId=${pageId}`, locale, draftOutput).then(res => {
      if (res.status) {


        if (href) {
          push(`/${locale}/${href}?collection=${data.collectionName}&requestId=${res?.data?.Id}&isPrint=true`);
        } else {

          const newRequestId =
            res?.data?.Id ?? res?.id ?? (typeof res?.data === 'string' || typeof res?.data === 'number' ? res.data : null)
          if (newRequestId != null && String(newRequestId) !== '') {
            const newUrl = `/${locale}/${query.page.join('/')}?${new URLSearchParams({
              ...query,
              collection: data.collectionName,
              entityId: String(newRequestId),
            })}`;

            window.history.replaceState(null, '', newUrl);
          }
          toast.success(messages.dialogs.dataSentSuccessfully)
        }
      }
    }).finally(() => setLoadingSaveAsDraft(false))



  }



  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const defaultDesign =
    open?.type === 'new_element'
      ? DefaultStyle(open?.key)
      : DefaultStyle(getTypeFromCollection(open?.type ?? 'SingleText', open?.descriptionAr === 'progress_bar' ? 'progress_bar' : open?.kind))
  let additionalField = null
  const additionalFieldDesign = data?.additional_fields?.find(ele => ele.key === open?.id)?.design
  if (additionalFieldDesign) {
    if (additionalFieldDesign.length === 0) {
      additionalField = null
    } else {
      additionalField = additionalFieldDesign
    }
  }
  const design = additionalField ?? defaultDesign ?? ``

  const roles = data?.additional_fields?.find(ele => ele.key === open?.id)?.roles ?? {
    onMount: { type: '', value: '' },
    trigger: {
      selectedField: null,
      triggerKey: null,
      typeOfValidation: null,
      isEqual: 'equal',
      currentField: 'id'
    },
    placeholder: {
      placeholder_ar: '',
      placeholder_en: ''
    },
    hover: {
      hover_ar: '',
      hover_en: ''
    },
    hint: {
      hint_ar: '',
      hint_en: ''
    },
    event: {},
    afterDateType: '',
    afterDateValue: '',
    beforeDateType: '',
    beforeDateValue: '',
    regex: {
      regex: '',
      message_ar: '',
      message_en: ''
    },
    size: '',
    api_url: '',
    apiKeyData: ''
  }




  // O(1) lookup maps — eliminates O(n²) .find() calls inside the render loop
  const associationsConfigMap = useMemo(() => {
    const map = new Map()
      ; (data?.associationsConfig ?? []).forEach(item => { if (item?.key) map.set(item.key, item) })

    return map
  }, [data?.associationsConfig])

  const additionalFieldsMap = useMemo(() => {
    const map = new Map()
      ; (data?.additional_fields ?? []).forEach(item => { if (item?.key) map.set(item.key, item) })

    return map
  }, [data?.additional_fields])

  const layoutMap = useMemo(() => {
    const map = new Map()
    layout.forEach(item => map.set(item.i, item))

    return map
  }, [layout])

  const getDesign = useCallback(
    (key, field) => {
      let defaultDesign = null
      if (field?.type === 'new_element') {
        defaultDesign = DefaultStyle(field?.key)
      } else {
        defaultDesign = DefaultStyle(getTypeFromCollection(field.type, field.descriptionAr === 'progress_bar' ? 'progress_bar' : field.kind || field.descriptionAr))
      }
      const additionalFieldDesign = additionalFieldsMap.get(key)?.design
      const additionalField = (additionalFieldDesign && additionalFieldDesign.length > 0) ? additionalFieldDesign : null

      return additionalField ?? defaultDesign ?? ``
    },
    [additionalFieldsMap]
  )

  const sortedLoop = useMemo(() => {
    const items = [...filterSelect, ...addMoreElement]
    const fixedKeys = ["tabs", "submit", "back", "saveAsDraft"]
    const sortedIndexMap = new Map(sortedData.map((field, index) => [field.i, index]))

    const sorted = [...items].sort((a, b) => {
      const indexA = sortedIndexMap.get(a.id)
      const indexB = sortedIndexMap.get(b.id)

      return (indexA ?? Infinity) - (indexB ?? Infinity)
    })

    const getY = id => layoutMap.get(id)?.y ?? 9999

    // Helper: re-position collapse headers before their first field AND inject footer virtual items
    const repositionCollapseHeaders = combinedArr => {
      const collapseSections = addMoreElement.filter(ele => ele.key === 'collapse_section')
      if (!collapseSections.length) return

      collapseSections.forEach(section => {
        const sectionFieldIds = section.data?.fields || []

        // Check BOTH key and id so fields added via "Add to Section" or dropdown are found
        const fieldYs = combinedArr
          .filter(c => {
            if (!c.item || c.item.type === '__tab_header__') return false

            return sectionFieldIds.includes(c.item.key) || sectionFieldIds.includes(c.item.id)
          })
          .map(c => c.y)

        const entry = combinedArr.find(c => c.item?.id === section.id)

        if (sectionFieldIds.length > 0 && fieldYs.length > 0) {
          // Header: just before first field
          if (entry) entry.y = Math.min(...fieldYs) - 0.5
        }
      })
    }

    if (stopSortLayout) {
      const tabsElement = addMoreElement.find(ele => ele.key === 'tabs')
      const tabs = tabsElement?.data || []

      const allRealItemsMeta = sorted.map(ele => ({
        item: ele,
        y: getY(ele.id),
        isFixed: fixedKeys.includes(ele.kind || ele.key),
        fieldId: ele.type === 'new_element' ? ele.id : ele.key
      }))

      const combined = allRealItemsMeta.map(ele => ({ item: ele.item, y: ele.y }))

      if (tabs.length > 0) {
        // Inject tab header virtual items
        tabs.forEach((tab, tabIndex) => {
          const tabFieldIds = Array.isArray(tab.fields) ? tab.fields : []

          const tabFieldsYValues = allRealItemsMeta
            .filter(ele => !ele.isFixed && tabFieldIds.includes(ele.fieldId))
            .map(ele => ele.y)

          const minY = tabFieldsYValues.length > 0
            ? Math.min(...tabFieldsYValues) - 0.5
            : tabIndex * 1000

          combined.push({
            item: {
              id: `__tab_header_${tabIndex}`,
              type: '__tab_header__',
              tabName: tab?.[`name_${locale}`] || tab?.name_en || tab?.name_ar || `Tab ${tabIndex + 1}`,
              tabIndex
            },
            y: minY
          })
        })
      }

      // Auto-position collapse headers before their fields
      repositionCollapseHeaders(combined)

      combined.sort((a, b) => a.y - b.y)

      return combined.map(entry => entry.item)
    }

    // View mode
    let lastSort = sorted
    if (isPrint) {
      lastSort = sorted.filter(ele => ele.key !== 'button')
    } else {
      lastSort = sorted.filter(ele =>
        findActiveTab
          ? fixedKeys.includes(ele.kind || ele.key)
            ? true
            : findActiveTab?.fields?.includes(ele.type === 'new_element' ? ele.id : ele.key)
          : true
      )
    }

    // Auto-position collapse headers before their fields in view mode too
    const viewCombined = lastSort.map(ele => ({ item: ele, y: getY(ele.id) }))

    repositionCollapseHeaders(viewCombined)
    viewCombined.sort((a, b) => a.y - b.y)

    return viewCombined.map(entry => entry.item)





  }, [filterSelect, addMoreElement, stopSortLayout, sortedData, layoutMap, locale, isPrint, findActiveTab])

  const sortedLoopWithoutTabs = useMemo(() => {
    const items = [...filterSelect, ...addMoreElement]
    const sortedIndexMap = new Map(sortedData.map((field, index) => [field.i, index]))

    const sorted = [...items].sort((a, b) => {
      const indexA = sortedIndexMap.get(a.id)
      const indexB = sortedIndexMap.get(b.id)

      return (indexA ?? Infinity) - (indexB ?? Infinity)
    })



    if (isPrint) {
      return sorted.filter(sortItem => sortItem.key !== 'button')
    } else {
      return sorted
    }

  }, [filterSelect, addMoreElement, sortedData, isPrint])

  // Dnd Kit sensors — drag is bound to the dedicated handle, so it can start immediately.
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor)
  )

  const collisionDetectionStrategy = useCallback(args => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions?.length) {
      return pointerCollisions
    }

    return closestCenter(args)
  }, [])

  const [activeId, setActiveId] = useState(null)
  const [activeOverlay, setActiveOverlay] = useState(null)
  const [overId, setOverId] = useState(null)
  const [dragMode, setDragMode] = useState(null) // 'swap' | 'insert'
  const dragModeRef = useRef(null) // ref for reliable access in handleDragEnd
  const [moveSourceId, setMoveSourceId] = useState(null)

  // z-index effect — runs after drag ends (skipped while dragging)
  useEffect(() => {
    if (activeId) return
    if (layout) {
      sortedData.forEach((ele, index) => {
        const element = document.querySelector('.ss' + ele.i)
        if (element) {
          element.style.zIndex = sortedData.length + 50000 - index
        }
      })
    }
  }, [layout, activeId])

  // Keep latest values in refs so drag handlers have no stale-closure deps
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const sortedLoopRef = useRef(null)
  sortedLoopRef.current = sortedLoop
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const dataPropsRef = useRef(data)
  dataPropsRef.current = data

  useEffect(() => {
    if (!moveSourceId) return
    const exists = sortedLoop.some(item => item.id === moveSourceId)
    if (!exists || readOnly || stopSort) {
      setMoveSourceId(null)
    }
  }, [moveSourceId, sortedLoop, readOnly, stopSort])

  const applyTabTransferByTarget = useCallback((currentData, items, sourceId, targetId, swapTarget = false) => {
    const addMore = currentData?.addMoreElement ?? []
    const tabsElementIndex = addMore.findIndex(ele => ele.key === 'tabs')
    if (tabsElementIndex === -1) {
      return { nextData: currentData, targetTabIndex: -1 }
    }

    const tabsElement = addMore[tabsElementIndex]
    const tabs = Array.isArray(tabsElement?.data) ? tabsElement.data : []
    if (tabs.length === 0) {
      return { nextData: currentData, targetTabIndex: -1 }
    }

    const sourceItem = items.find(i => i.id === sourceId)
    const targetItem = items.find(i => i.id === targetId)
    if (!sourceItem || !targetItem) {
      return { nextData: currentData, targetTabIndex: -1 }
    }

    const sourceFieldId = sourceItem.type === 'new_element' ? sourceItem.id : sourceItem.key
    const targetFieldId = targetItem.type === 'new_element' ? targetItem.id : targetItem.key
    if (!sourceFieldId || !targetFieldId) {
      return { nextData: currentData, targetTabIndex: -1 }
    }

    const sourceTabIndex = tabs.findIndex(tab => Array.isArray(tab.fields) && tab.fields.includes(sourceFieldId))
    const targetTabIndex = tabs.findIndex(tab => Array.isArray(tab.fields) && tab.fields.includes(targetFieldId))
    if (targetTabIndex === -1 || sourceTabIndex === targetTabIndex) {
      return { nextData: currentData, targetTabIndex }
    }

    const nextTabs = tabs.map(tab => ({
      ...tab,
      fields: Array.isArray(tab.fields) ? [...tab.fields] : []
    }))
    let changed = false

    const moveFieldToTab = (fieldId, toTabIndex) => {
      if (!fieldId || toTabIndex < 0 || toTabIndex >= nextTabs.length) return

      nextTabs.forEach((tab, idx) => {
        if (idx !== toTabIndex && tab.fields.includes(fieldId)) {
          tab.fields = tab.fields.filter(id => id !== fieldId)
          changed = true
        }
      })

      if (!nextTabs[toTabIndex].fields.includes(fieldId)) {
        nextTabs[toTabIndex].fields.push(fieldId)
        changed = true
      }
    }

    moveFieldToTab(sourceFieldId, targetTabIndex)

    if (swapTarget && sourceTabIndex !== -1) {
      moveFieldToTab(targetFieldId, sourceTabIndex)
    }

    if (!changed) {
      return { nextData: currentData, targetTabIndex }
    }

    const nextAddMore = [...addMore]
    nextAddMore[tabsElementIndex] = { ...tabsElement, data: nextTabs }

    return {
      nextData: { ...currentData, addMoreElement: nextAddMore },
      targetTabIndex
    }
  }, [])

  const moveItemToSoloRow = useCallback((sourceId, afterId) => {
    const layout = layoutRef.current
    const sortedLoop = sortedLoopRef.current
    const data = dataPropsRef.current
    const onChange = onChangeRef.current

    const items = sortedLoop.filter(i => i.type !== '__tab_header__')
    const activeItem = items.find(i => i.id === sourceId)
    const afterItem = items.find(i => i.id === afterId)
    if (!activeItem || !afterItem) return

    // Compute visual rows to find which row the active item came from
    const visualRows = []
    let colUsed = 0
    let currentRowItems = []
    for (const item of items) {
      const w = layout.find(l => l.i === item.id)?.w ?? 12
      if (colUsed + w > 12 && currentRowItems.length > 0) {
        visualRows.push([...currentRowItems])
        currentRowItems = [item]
        colUsed = w
      } else {
        currentRowItems.push(item)
        colUsed += w
      }
      if (colUsed >= 12) { visualRows.push([...currentRowItems]); currentRowItems = []; colUsed = 0 }
    }
    if (currentRowItems.length > 0) visualRows.push([...currentRowItems])

    const activeOriginalRow = visualRows.find(row => row.some(i => i.id === sourceId)) ?? []
    const remainingInOriginalRow = activeOriginalRow.filter(i => i.id !== sourceId)

    // Build new order: move active to just after afterId
    const withoutActive = items.filter(i => i.id !== sourceId)
    const insertIdx = withoutActive.findIndex(i => i.id === afterId) + 1
    withoutActive.splice(insertIdx, 0, activeItem)

    // Rebuild layout; active item gets w=12
    let yCounter = 0

    const newLayout = withoutActive.map(item => {
      const existing = layout.find(l => l.i === item.id)

      return {
        i: item.id,
        x: 0,
        y: yCounter++,
        w: item.id === sourceId ? 12 : (existing?.w ?? 12),
        h: existing?.h ?? 1,
        minH: 0
      }
    })

    // Redistribute widths of items remaining in the original row evenly across 12
    if (remainingInOriginalRow.length > 0) {
      const baseW = Math.floor(12 / remainingInOriginalRow.length)
      const remainder = 12 - baseW * remainingInOriginalRow.length
      remainingInOriginalRow.forEach((item, idx) => {
        const li = newLayout.findIndex(l => l.i === item.id)
        if (li !== -1) {
          newLayout[li] = {
            ...newLayout[li],
            w: baseW + (idx === remainingInOriginalRow.length - 1 ? remainder : 0)
          }
        }
      })
    }

    const { nextData, targetTabIndex } = applyTabTransferByTarget(data, items, sourceId, afterId, false)

    setLayout(newLayout)
    onChange({ ...nextData, layout: newLayout })
    if (targetTabIndex > -1) {
      setActiveTab(targetTabIndex)
    }
  }, [applyTabTransferByTarget])

  const swapItemWithTarget = useCallback((sourceId, targetId) => {
    const layout = layoutRef.current
    const sortedLoop = sortedLoopRef.current
    const data = dataPropsRef.current
    const onChange = onChangeRef.current

    const items = sortedLoop.filter(i => i.type !== '__tab_header__')
    const oldIndex = items.findIndex(item => item.id === sourceId)
    const targetIndex = items.findIndex(item => item.id === targetId)
    if (oldIndex === -1 || targetIndex === -1 || oldIndex === targetIndex) return

    const sourceLayout = layout.find(l => l.i === sourceId)
    const targetLayout = layout.find(l => l.i === targetId)
    const sourceW = sourceLayout?.w ?? 12
    const sourceH = sourceLayout?.h ?? 1
    const targetW = targetLayout?.w ?? 12
    const targetH = targetLayout?.h ?? 1

    const swappedLoop = [...items]
    swappedLoop[oldIndex] = items[targetIndex]
    swappedLoop[targetIndex] = items[oldIndex]

    let yCounter = 0
    const newLayout = []
    swappedLoop.forEach(item => {
      const existingLayout = layout.find(l => l.i === item.id)
      let w = existingLayout?.w ?? 12
      let h = existingLayout?.h ?? (item.type === 'LongText' ? 1.8 : 1)
      if (item.id === sourceId) {
        w = targetW
        h = targetH
      } else if (item.id === targetId) {
        w = sourceW
        h = sourceH
      }

      newLayout.push({
        i: item.id,
        x: existingLayout?.x ?? 0,
        y: yCounter,
        w,
        h,
        minH: 0
      })
      yCounter++
    })

    const { nextData, targetTabIndex } = applyTabTransferByTarget(data, items, sourceId, targetId, true)

    setLayout(newLayout)
    onChange({ ...nextData, layout: newLayout })
    if (targetTabIndex > -1) {
      setActiveTab(targetTabIndex)
    }
  }, [applyTabTransferByTarget])

  const handleSelectMoveSource = useCallback(id => {
    setMoveSourceId(prev => prev === id ? null : id)
  }, [])

  const handleMoveSelectedToItem = useCallback(targetId => {
    if (!moveSourceId || moveSourceId === targetId) return
    swapItemWithTarget(moveSourceId, targetId)
    setMoveSourceId(null)
  }, [moveSourceId, swapItemWithTarget])

  const handleAssignToSection = useCallback((sourceItemId, sectionId) => {
    if (!sourceItemId || !sectionId) return

    const currentData = dataPropsRef.current
    const currentLayout = layoutRef.current || []

    // Update addMoreElement — store raw id; cross-index map & dropdown handle both key and id
    const newAddMoreElement = (currentData.addMoreElement || []).map(ele => {
      if (ele.key !== 'collapse_section') return ele

      const fields = (ele.data?.fields || []).filter(id => id !== sourceItemId)

      if (ele.id === sectionId) {
        return { ...ele, data: { ...ele.data, fields: [...fields, sourceItemId] } }
      }

      return { ...ele, data: { ...ele.data, fields } }
    })

    // Find the collapse section's y position in the layout
    const sectionLayoutItem = currentLayout.find(item => item.i === sectionId)
    const sectionY = sectionLayoutItem?.y ?? 0

    // Find max y among fields already in this section
    const sectionElement = (currentData.addMoreElement || []).find(ele => ele.id === sectionId)
    const existingFieldIds = new Set(sectionElement?.data?.fields || [])

    const existingMaxY = currentLayout
      .filter(item => existingFieldIds.has(item.i))
      .reduce((max, item) => Math.max(max, item.y), sectionY)

    // Place the new field just after the section's last field (full width, new row)
    const targetY = existingMaxY + 1

    const newLayout = currentLayout.map(item => {
      if (item.i === sourceItemId) {
        return { ...item, w: 12, y: targetY }
      }

      return item
    })

    setLayout(newLayout)
    onChangeRef.current({ ...currentData, addMoreElement: newAddMoreElement, layout: newLayout })
    setMoveSourceId(null)
  }, [])

  const handleMoveSelectedToSoloRow = useCallback(zoneId => {
    if (!moveSourceId || !zoneId) return
    const afterId = String(zoneId).replace('add-row-after-', '')
    if (!afterId || moveSourceId === afterId) return
    moveItemToSoloRow(moveSourceId, afterId)
    setMoveSourceId(null)
  }, [moveSourceId, moveItemToSoloRow])

  const moveItemToEmptySpace = useCallback((sourceId, afterId, spanWidth) => {
    const layout = layoutRef.current
    const sortedLoop = sortedLoopRef.current
    const data = dataPropsRef.current
    const onChange = onChangeRef.current

    const items = sortedLoop.filter(i => i.type !== '__tab_header__')
    const sourceItem = items.find(i => i.id === sourceId)
    const afterItem = items.find(i => i.id === afterId)
    if (!sourceItem || !afterItem) return

    const safeWidth = Math.max(1, Math.min(12, Number(spanWidth) || 12))
    const withoutSource = items.filter(i => i.id !== sourceId)
    const insertIdx = withoutSource.findIndex(i => i.id === afterId) + 1
    withoutSource.splice(insertIdx, 0, sourceItem)

    let yCounter = 0

    const newLayout = withoutSource.map(item => {
      const existing = layout.find(l => l.i === item.id)

      return {
        i: item.id,
        x: existing?.x ?? 0,
        y: yCounter++,
        w: item.id === sourceId ? safeWidth : (existing?.w ?? 12),
        h: existing?.h ?? (item.type === 'LongText' ? 1.8 : 1),
        minH: 0
      }
    })

    const { nextData, targetTabIndex } = applyTabTransferByTarget(data, items, sourceId, afterId, false)

    setLayout(newLayout)
    onChange({ ...nextData, layout: newLayout })
    if (targetTabIndex > -1) {
      setActiveTab(targetTabIndex)
    }
  }, [applyTabTransferByTarget])

  const handleMoveSelectedToEmptySpace = useCallback((zoneId, spanWidth) => {
    if (!moveSourceId || !zoneId) return
    const afterId = String(zoneId).replace('empty-space-after-', '')
    if (!afterId || moveSourceId === afterId) return
    moveItemToEmptySpace(moveSourceId, afterId, spanWidth)
    setMoveSourceId(null)
  }, [moveSourceId, moveItemToEmptySpace])

  const handleDragStart = useCallback(event => {
    const activeRect = event.active.rect.current.initial
    const draggedItem = sortedLoopRef.current?.find(i => i.id === event.active.id)

    setActiveId(event.active.id)
    setActiveOverlay({
      id: event.active.id,
      width: activeRect?.width,
      height: activeRect?.height,
      label: draggedItem?.nameEn || draggedItem?.nameAr || draggedItem?.key || event.active.id
    })
    setOverId(null)
    setDragMode(null)
    dragModeRef.current = null
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setActiveOverlay(null)
    setOverId(null)
    setDragMode(null)
    dragModeRef.current = null
  }, [])

  const handleDragOver = useCallback(event => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      setOverId(null)
      setDragMode(null)
      dragModeRef.current = null

      return
    }

    setOverId(over.id)

    if (String(over.id).startsWith('add-row-after-')) {
      setDragMode('solo-row')
      dragModeRef.current = 'solo-row'
    } else {
      // Always swap when hovering directly over an element
      setDragMode('swap')
      dragModeRef.current = 'swap'
    }
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(event => {
    const { active, over } = event
    const currentDragMode = dragModeRef.current // always up-to-date

    setActiveId(null)
    setActiveOverlay(null)
    setOverId(null)
    setDragMode(null)
    dragModeRef.current = null

    if (!over || active.id === over.id) return

    // Handle drop onto a Solo Row zone
    if (String(over.id).startsWith('add-row-after-')) {
      const afterId = String(over.id).replace('add-row-after-', '')
      const layout = layoutRef.current
      const sortedLoop = sortedLoopRef.current
      const data = dataPropsRef.current
      const onChange = onChangeRef.current

      const items = sortedLoop.filter(i => i.type !== '__tab_header__')
      const activeItem = items.find(i => i.id === active.id)
      const afterItem = items.find(i => i.id === afterId)
      if (!activeItem || !afterItem) return

      // Compute visual rows to find which row the active item came from
      const visualRows = []
      let colUsed = 0
      let currentRowItems = []
      for (const item of items) {
        const w = layout.find(l => l.i === item.id)?.w ?? 12
        if (colUsed + w > 12 && currentRowItems.length > 0) {
          visualRows.push([...currentRowItems])
          currentRowItems = [item]
          colUsed = w
        } else {
          currentRowItems.push(item)
          colUsed += w
        }
        if (colUsed >= 12) { visualRows.push([...currentRowItems]); currentRowItems = []; colUsed = 0 }
      }
      if (currentRowItems.length > 0) visualRows.push([...currentRowItems])

      const activeOriginalRow = visualRows.find(row => row.some(i => i.id === active.id)) ?? []
      const remainingInOriginalRow = activeOriginalRow.filter(i => i.id !== active.id)

      // Build new order: move active to just after afterId
      const withoutActive = items.filter(i => i.id !== active.id)
      const insertIdx = withoutActive.findIndex(i => i.id === afterId) + 1
      withoutActive.splice(insertIdx, 0, activeItem)

      // Rebuild layout; active item gets w=12
      let yCounter = 0

      const newLayout = withoutActive.map(item => {
        const existing = layout.find(l => l.i === item.id)

        return {
          i: item.id,
          x: 0,
          y: yCounter++,
          w: item.id === active.id ? 12 : (existing?.w ?? 12),
          h: existing?.h ?? 1,
          minH: 0
        }
      })

      // Redistribute widths of items remaining in the original row evenly across 12
      if (remainingInOriginalRow.length > 0) {
        const baseW = Math.floor(12 / remainingInOriginalRow.length)
        const remainder = 12 - baseW * remainingInOriginalRow.length
        remainingInOriginalRow.forEach((item, idx) => {
          const li = newLayout.findIndex(l => l.i === item.id)
          if (li !== -1) {
            newLayout[li] = {
              ...newLayout[li],
              w: baseW + (idx === remainingInOriginalRow.length - 1 ? remainder : 0)
            }
          }
        })
      }

      setLayout(newLayout)
      onChange({ ...data, layout: newLayout })

      return
    }

    const layout = layoutRef.current
    const sortedLoop = sortedLoopRef.current
    const data = dataPropsRef.current
    const onChange = onChangeRef.current

    const oldIndex = sortedLoop.findIndex(item => item.id === active.id)
    const newIndex = sortedLoop.findIndex(item => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    let yCounter = 0
    const newLayout = []

    if (currentDragMode === 'swap') {
      // True swap: only exchange positions of the two elements, others stay unchanged
      const activeLayout = layout.find(l => l.i === active.id)
      const overLayout = layout.find(l => l.i === over.id)
      const activeW = activeLayout?.w ?? 12
      const activeH = activeLayout?.h ?? 1
      const overW = overLayout?.w ?? 12
      const overH = overLayout?.h ?? 1

      // Swap positions in sortedLoop array (true exchange, no arrayMove)
      const swappedLoop = [...sortedLoop]
      swappedLoop[oldIndex] = sortedLoop[newIndex]
      swappedLoop[newIndex] = sortedLoop[oldIndex]

      swappedLoop.forEach(item => {
        if (item.type === '__tab_header__') return
        const existingLayout = layout.find(l => l.i === item.id)
        let w = existingLayout?.w ?? 12
        let h = existingLayout?.h ?? (item.type === 'LongText' ? 1.8 : 1)
        if (item.id === active.id) { w = overW; h = overH }
        else if (item.id === over.id) { w = activeW; h = activeH }
        newLayout.push({ i: item.id, x: existingLayout?.x ?? 0, y: yCounter, w, h, minH: 0 })
        yCounter++
      })
    } else {
      // Insert mode: reorder only, keep original dimensions
      const newSortedLoop = arrayMove(sortedLoop, oldIndex, newIndex)
      newSortedLoop.forEach(item => {
        if (item.type === '__tab_header__') return
        const existingLayout = layout.find(l => l.i === item.id)
        newLayout.push({
          i: item.id,
          x: existingLayout?.x ?? 0,
          y: yCounter,
          w: existingLayout?.w ?? 12,
          h: existingLayout?.h ?? (item.type === 'LongText' ? 1.8 : 1),
          minH: 0
        })
        yCounter++
      })
    }

    setLayout(newLayout)
    onChange({ ...data, layout: newLayout })
  }, [])

  const handleTabReorder = (oldIndex, newIndex) => {
    const tabsElement = data?.addMoreElement?.find(ele => ele.key === 'tabs')
    if (!tabsElement) return

    const addMore = [...(data.addMoreElement || [])]
    const tabsIdx = addMore.findIndex(ele => ele.key === 'tabs')
    if (tabsIdx === -1) return

    const nextTabsEl = { ...addMore[tabsIdx] }
    const nextData = [...(nextTabsEl.data || [])]

    // arrayMove على الـ tabs
    const reordered = arrayMove(nextData, oldIndex, newIndex)
    nextTabsEl.data = reordered
    addMore[tabsIdx] = nextTabsEl

    onChange({ ...data, addMoreElement: addMore })
  }

  const gridRef = useRef(null)

  const [associationsOpen, setAssociationsOpen] = useState(false)
  const [associationsConfig] = useState(data?.associationsConfig ?? [])



  const handleChange = (event, fieldCategory, skipCheck, field) => {
    // const
    const { value, checked } = event.target
    const isChecked = skipCheck || checked


    const oldAdditionalFields = data?.additional_fields ?? []
    const filteredAdditionalFields = oldAdditionalFields.filter(inp => inp.key !== field?.id)

    // Tabs assignment logic removed from here; use the inline dropdowns instead
    const addMoreElementLocal = [...(data?.addMoreElement ?? [])]

    //     additional_fields: filteredAdditionalFields,
    //     addMoreElement: addMoreElementLocal);

    if (skipCheck) {
      onChange({
        ...data,
        associationsConfig: skipCheck,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    } else {
      onChange({
        ...data,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    }
  }



  // Compute which items are visually last in their row (based on accumulated column widths)
  const lastInRowSet = useMemo(() => {
    const s = new Set()
    let colUsed = 0
    let lastNonTabIdx = -1
    sortedLoop.forEach((item, idx) => {
      if (item.type === '__tab_header__') {
        if (lastNonTabIdx >= 0) s.add(sortedLoop[lastNonTabIdx].id)
        colUsed = 0
        lastNonTabIdx = -1

        return
      }
      const w = layoutMap.get(item.id)?.w ?? 12
      if (colUsed + w > 12 && lastNonTabIdx >= 0) {
        s.add(sortedLoop[lastNonTabIdx].id)
        colUsed = w
      } else {
        colUsed += w
      }
      lastNonTabIdx = idx
      if (colUsed >= 12) { s.add(item.id); colUsed = 0; lastNonTabIdx = -1 }
    })
    if (lastNonTabIdx >= 0) s.add(sortedLoop[lastNonTabIdx].id)

    return s
  }, [sortedLoop, layoutMap])

  const rowGapMap = useMemo(() => {
    const map = new Map()
    let colUsed = 0
    let lastNonTabId = null

    sortedLoop.forEach(item => {
      if (item.type === '__tab_header__') {
        if (lastNonTabId && colUsed > 0 && colUsed < 12) {
          map.set(lastNonTabId, 12 - colUsed)
        }
        colUsed = 0
        lastNonTabId = null

        return
      }

      const w = layoutMap.get(item.id)?.w ?? 12
      if (colUsed + w > 12 && lastNonTabId) {
        const remaining = 12 - colUsed
        if (remaining > 0) {
          map.set(lastNonTabId, remaining)
        }
        colUsed = w
        lastNonTabId = item.id
      } else {
        colUsed += w
        lastNonTabId = item.id
      }

      if (colUsed >= 12) {
        colUsed = 0
        lastNonTabId = null
      }
    })

    if (lastNonTabId && colUsed > 0 && colUsed < 12) {
      map.set(lastNonTabId, 12 - colUsed)
    }

    return map
  }, [sortedLoop, layoutMap])

  const [collapseOpenState, setCollapseOpenState] = useState({})

  const collapseSectionByFieldId = useMemo(() => {
    const map = new Map()
    const allItems = [...filterSelect, ...addMoreElement]

    addMoreElement.forEach(ele => {
      if (ele.key === 'collapse_section') {
        ;(ele.data?.fields || []).forEach(storedId => {
          map.set(storedId, ele)

          // Cross-index: also map the "other" identifier (key↔id) so nothing slips through
          const found = allItems.find(item => item.key === storedId || item.id === storedId)
          if (found) {
            if (found.key) map.set(found.key, ele)
            if (found.id) map.set(found.id, ele)
          }
        })
      }
    })

    return map
  }, [addMoreElement, filterSelect])

  return (
    <div className={`${disabled ? 'text-main' : 'relative'}`}>
      {loading && (
        <div className='flex absolute inset-0 z-50 justify-center items-center w-full h-full bg-white'>
          {/* <img src={photo.src} alt='loading' className='w-[25px] h-[25px] scale-150 ' /> */}
          <CircularProgress />
        </div>
      )}

      <AssociationsSetup
        open={associationsOpen}
        onClose={() => {
          setAssociationsOpen(false)
        }}
        initialConfig={associationsConfig}
        onSave={config => {

          let newConfig = data?.associationsConfig ?? []

          const found = newConfig.find(item => item.key === config.key)
          if (found) {
            newConfig = newConfig.map(item => (item.key === config.key ? config : item))
          } else {
            newConfig = [...newConfig, config]
          }


          handleChange({ target: { value: config.key } }, '', newConfig)
        }}
      />
      <InputControlDesign
        open={open}
        handleClose={handleClose}
        design={design}
        locale={locale}
        setAssociationsOpen={setAssociationsOpen}

        roles={roles}
        data={data}
        onChange={onChange}
        fields={filterSelect}
      />
      {!readOnly && (
        <>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-main-color'>
              {moveSourceId
                ? (locale === 'ar' ? 'تم اختيار عنصر. اضغط "استبدل هنا" أو على مساحة فاضية.' : 'Item selected. Click "Replace Here" or an empty space.')
                : (locale === 'ar' ? 'اختَر "نقل" من العنصر ثم "استبدل هنا" أو اضغط على مساحة فاضية.' : 'Click "Move", then "Replace Here" or click an empty space.')}
            </div>
            <button
              onClick={() => {
                setStopSort(!stopSort)
              }}
              className={`ms-auto mb-3 ${!stopSort ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-4 py-2 rounded-md`}
            >
              {!stopSort ? 'Disable Sort' : 'Enable Sort'}
            </button>
          </div>


        </>
      )}

      <form className={`w-[calc(100%)] ${loading ? 'opacity-0' : ''}`} onClick={(e) => {
        const button = e.target.closest('button')

        if (button?.type === 'submit') {
          return
        } else {
          setErrors(false)
        }

      }} onSubmit={handleSubmit}>

        {/* <TabsComponent data={data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data} setActiveTab={setActiveTab} /> */}
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sortedLoop.filter(i => i.type !== '__tab_header__').map(item => item.id)}
            strategy={() => ({})}
          >
            <div
              ref={gridRef}
              className='layout'
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: isPrint ? '0px' : '10px',
                width: '100%'
              }}
            >
              {(() => {
                // Track which fields have been rendered inside a section wrapper
                const sectionAlreadyRendered = new Set()

                return sortedLoop.flatMap((filed, i) => {
                // Skip fields already rendered inside a collapse section wrapper
                if (sectionAlreadyRendered.has(filed.id)) return []

                // Render collapse section header + content wrapper
                if (filed.key === 'collapse_section') {
                  const isSectionOpen = collapseOpenState[filed.id] ?? (filed.data?.defaultOpen ?? true)

                  // Collect all fields belonging to this section, in display order
                  const sectionFields = sortedLoop.filter(f => {
                    const owner = collapseSectionByFieldId.get(f.key) ?? collapseSectionByFieldId.get(f.id)

                    return owner?.id === filed.id
                  })

                  sectionFields.forEach(f => sectionAlreadyRendered.add(f.id))

                  const sectionContent = isSectionOpen ? (
                    <div
                      key={`section-content-${filed.id}`}
                      style={{
                        gridColumn: 'span 12',
                        padding: '16px',

                        borderRadius: '0 0 6px 6px',
                        background: 'rgba(248,250,252,1)'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
                        {sectionFields.map(sf => {
                          const sfFind = associationsConfigMap.get(sf?.key)

                          const sfData = sfFind ? {
                            ...sf,
                            kind: sfFind.viewType,
                            descriptionEn: JSON.stringify(sfFind.selectedOptions),
                            getDataForm: sfFind.dataSourceType,
                            externalApi: sfFind.externalApi,
                            staticData: sfFind.staticData,
                            selectedValueSend: JSON.stringify(sfFind.selectedValueSend),
                            apiHeaders: sfFind.apiHeaders,
                            body: sfFind.body,
                            method: sfFind.method,
                            viewAsInput: sfFind.viewAsInput
                          } : sf

                          const sfRoles = additionalFieldsMap.get(sf.id)?.roles ?? {
                            onMount: { type: '', value: '' },
                            placeholder: { placeholder_ar: '', placeholder_en: '' },
                            hover: { hover_ar: '', hover_en: '' },
                            hint: { hint_ar: '', hint_en: '' },
                            trigger: {
                              selectedField: null, triggerKey: null, typeOfValidation: null,
                              isEqual: 'equal', currentField: 'Id', mainValue: '', parentKey: ''
                            },
                            event: { onChange: '', onBlur: '', onUnmount: '' },
                            afterDateType: '', afterDateValue: '',
                            beforeDateType: '', beforeDateValue: '',
                            regex: { regex: '', message_ar: '', message_en: '' },
                            size: ''
                          }

                          const sfLayoutItem = layoutMap.get(sf.id)
                          const sfGridSpan = sfLayoutItem?.w || 12
                          const sfClassName = sf.type === 'new_element' ? `s${sf.id}` : `ss${sf.id}`
                          const sfHoverText = sfRoles?.hover?.hover_ar || sfRoles?.hover?.hover_en
                          const sfHintText = sfRoles?.hint?.hint_ar || sfRoles?.hint?.hint_en

                          return (
                            <SortableGridItem
                              key={sf.id}
                              tabsData={tabsData}
                              advancedEdit={advancedEdit}
                              filed={sfData}
                              index={i}
                              readOnly={readOnly}
                              stopSort={stopSort}
                              locale={locale}
                              data={data}
                              loadingEntitiesData={loadingEntitiesData}
                              getDesign={getDesign}
                              setOpen={setOpen}
                              refError={refError}
                              refErrorFromTable={refErrorFromTable}
                              saveAsDraft={saveAsDraft}
                              loadingSaveAsDraft={loadingSaveAsDraft}
                              setLayout={setLayout}
                              triggerData={triggerData}
                              onChange={onChange}
                              layout={layout}
                              layoutMap={layoutMap}
                              dataRef={dataRef}
                              dataRefWithCollectionId={dataRefWithCollectionId}
                              sortedLoop={sortedLoop}
                              setTriggerData={setTriggerData}
                              entitiesData={entitiesData}
                              errors={errors}
                              addMoreElement={addMoreElement}
                              gridColumnSpan={sfGridSpan}
                              className={sfClassName}
                              hoverText={sfHoverText}
                              hintText={sfHintText}
                              roles={sfRoles}
                              setActiveTab={setActiveTab}
                              FormType={FormType}
                              activeTab={activeTab}
                              isEntitiesData={isEntitiesData}
                              handleSubmit={handleSubmit}
                              sortedLoopWithoutTabs={sortedLoopWithoutTabs}
                              loading={loading}
                              disabled={disabled}
                              reload={reload}
                              messages={messages}
                              overId={overId}
                              dragMode={dragMode}
                              allowDrag={false}
                              moveSourceId={moveSourceId}
                              onSelectMoveSource={handleSelectMoveSource}
                              onMoveToItem={handleMoveSelectedToItem}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ) : null

                  return [
                    <SortableCollapseSectionHeader
                      key={filed.id}
                      filed={filed}
                      readOnly={readOnly}
                      stopSort={stopSort}
                      locale={locale}
                      layout={layout}
                      layoutMap={layoutMap}
                      setLayout={setLayout}
                      onChange={onChange}
                      data={data}
                      setOpen={setOpen}
                      isOpen={isSectionOpen}
                      onToggle={() => setCollapseOpenState(prev => ({ ...prev, [filed.id]: !isSectionOpen }))}
                      moveSourceId={moveSourceId}
                      onSelectMoveSource={handleSelectMoveSource}
                      onMoveToItem={handleMoveSelectedToItem}
                      onAssignToSection={handleAssignToSection}
                      design={getDesign(filed.id, filed)}
                    />,
                    sectionContent
                  ].filter(Boolean)
                }

                const find = associationsConfigMap.get(filed?.key)

                const filedData = find ? {
                  ...filed,
                  kind: find.viewType,
                  descriptionEn: JSON.stringify(find.selectedOptions),
                  getDataForm: find.dataSourceType,
                  externalApi: find.externalApi,
                  staticData: find.staticData,
                  selectedValueSend: JSON.stringify(find.selectedValueSend),
                  apiHeaders: find.apiHeaders,
                  body: find.body,
                  method: find.method,
                  viewAsInput: find.viewAsInput
                } : filed


                if (filed.type === '__tab_header__') {
                  const tabsElement = data?.addMoreElement?.find(ele => ele.key === 'tabs')
                  const tabs = tabsElement?.data || []
                  const totalTabs = tabs.length
                  const currentTabIndex = filed.tabIndex

                  return [(
                    <div
                      key={filed.id}
                      style={{ gridColumn: 'span 12' }}
                      className='px-2 mt-4 mb-1 w-full'
                    >
                      <div className='flex gap-2 items-center'>
                        <div className='flex-1 h-px opacity-30 bg-main-color' />
                        <span className='px-3 py-1 text-sm font-semibold rounded-full border text-main-color border-main-color'>
                          {filed.tabName}
                        </span>

                        {/* أزرار تحريك الـ tab */}
                        {!readOnly && currentTabIndex !== -1 && (
                          <div className='flex flex-col gap-0.5'>
                            <button
                              type='button'
                              disabled={currentTabIndex === 0}
                              onClick={() => handleTabReorder(currentTabIndex, currentTabIndex - 1)}
                              className='flex justify-center items-center w-5 h-5 text-xs rounded border border-main-color hover:bg-main-color hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                              title={locale === 'ar' ? 'تحريك لأعلى' : 'Move Up'}
                            >
                              ▲
                            </button>
                            <button
                              type='button'
                              disabled={currentTabIndex === totalTabs - 1}
                              onClick={() => handleTabReorder(currentTabIndex, currentTabIndex + 1)}
                              className='flex justify-center items-center w-5 h-5 text-xs rounded border border-main-color hover:bg-main-color hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                              title={locale === 'ar' ? 'تحريك لأسفل' : 'Move Down'}
                            >
                              ▼
                            </button>
                          </div>
                        )}

                        <div className='flex-1 h-px opacity-30 bg-main-color' />
                      </div>
                    </div>
                  )]
                }

                const roles = additionalFieldsMap.get(filed.id)?.roles ?? {
                  onMount: { type: '', value: '' },
                  placeholder: {
                    placeholder_ar: '',
                    placeholder_en: ''
                  },
                  hover: {
                    hover_ar: '',
                    hover_en: ''
                  },
                  hint: {
                    hint_ar: '',
                    hint_en: ''
                  },
                  trigger: {
                    selectedField: null,
                    triggerKey: null,
                    typeOfValidation: null,
                    isEqual: 'equal',
                    currentField: 'Id',
                    mainValue: '',
                    parentKey: ''
                  },
                  event: {
                    onChange: '',
                    onBlur: '',
                    onUnmount: ''
                  },
                  afterDateType: '',
                  afterDateValue: '',
                  beforeDateType: '',
                  beforeDateValue: '',
                  regex: {
                    regex: '',
                    message_ar: '',
                    message_en: ''
                  },
                  size: ''
                }
                const hoverText = roles?.hover?.hover_ar || roles?.hover?.hover_en
                const hintText = roles?.hint?.hint_ar || roles?.hint?.hint_en

                const className = filed.type === 'new_element' ? `s${filed.id}` : 'ss' + filed.id
                const layoutItem = layoutMap.get(filed.id)
                const gridColumnSpan = layoutItem?.w || 12

                const gridItem = (
                  <SortableGridItem
                    tabsData={tabsData}
                    key={filed.id}
                    advancedEdit={advancedEdit}
                    filed={filedData}
                    index={i}
                    readOnly={readOnly}
                    stopSort={stopSort}
                    locale={locale}
                    data={data}
                    loadingEntitiesData={loadingEntitiesData}
                    getDesign={getDesign}
                    setOpen={setOpen}
                    refError={refError}
                    refErrorFromTable={refErrorFromTable}
                    saveAsDraft={saveAsDraft}
                    loadingSaveAsDraft={loadingSaveAsDraft}
                    setLayout={setLayout}
                    triggerData={triggerData}
                    onChange={onChange}
                    layout={layout}
                    layoutMap={layoutMap}
                    dataRef={dataRef}
                    dataRefWithCollectionId={dataRefWithCollectionId}
                    sortedLoop={sortedLoop}
                    setTriggerData={setTriggerData}
                    entitiesData={entitiesData}
                    errors={errors}
                    addMoreElement={addMoreElement}
                    gridColumnSpan={gridColumnSpan}
                    className={className}
                    hoverText={hoverText}
                    hintText={hintText}
                    roles={roles}
                    setActiveTab={setActiveTab}
                    FormType={FormType}
                    activeTab={activeTab}
                    isEntitiesData={isEntitiesData}
                    handleSubmit={handleSubmit}
                    sortedLoopWithoutTabs={sortedLoopWithoutTabs}
                    loading={loading}
                    disabled={disabled}
                    reload={reload}
                    messages={messages}
                    overId={overId}
                    dragMode={dragMode}
                    allowDrag={false}
                    moveSourceId={moveSourceId}
                    onSelectMoveSource={handleSelectMoveSource}
                    onMoveToItem={handleMoveSelectedToItem}
                  />
                )

                // Determine if this is the last item in its visual row
                if (readOnly || stopSort) return [gridItem]

                if (!lastInRowSet.has(filed.id)) return [gridItem]

                const rowKey = `add-row-after-${filed.id}`
                const emptySpaceKey = `empty-space-after-${filed.id}`
                const gapSpan = rowGapMap.get(filed.id) ?? 0

                return [
                  gridItem,
                  ...(gapSpan > 0 ? [(
                    <EmptySpaceCard
                      key={emptySpaceKey}
                      id={emptySpaceKey}
                      span={gapSpan}
                      locale={locale}
                      clickToMoveEnabled={!!moveSourceId}
                      onClickMove={handleMoveSelectedToEmptySpace}
                    />
                  )] : []),
                  <SoloRowDropZone
                    key={rowKey}
                    id={rowKey}
                    locale={locale}
                    clickToMoveEnabled={!!moveSourceId}
                    onClickMove={handleMoveSelectedToSoloRow}
                  />
                ]
              })
            })()}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false} dropAnimation={null}>
            {activeOverlay ? (
              <div
                style={{
                  width: activeOverlay.width ? `${activeOverlay.width}px` : undefined,
                  height: activeOverlay.height ? `${activeOverlay.height}px` : undefined
                }}
                className='flex justify-center items-center px-4 py-3 bg-white rounded-lg border-2 shadow-xl opacity-95 cursor-grabbing border-main-color'
              >
                <svg className='mr-2 text-main-color shrink-0' width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="7" cy="5" r="1.5" />
                  <circle cx="13" cy="5" r="1.5" />
                  <circle cx="7" cy="10" r="1.5" />
                  <circle cx="13" cy="10" r="1.5" />
                  <circle cx="7" cy="15" r="1.5" />
                  <circle cx="13" cy="15" r="1.5" />
                </svg>
                <span className='text-sm font-medium truncate text-main-color'>{activeOverlay.label}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </form>


    </div>
  )
}
