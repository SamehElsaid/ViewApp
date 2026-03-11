import { useState, useMemo, useEffect, useCallback, Fragment } from 'react'
import { UnmountClosed } from 'react-collapse'
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Stack,
  Grid,
  Paper
} from '@mui/material'
import { useIntl } from 'react-intl'
import CodeMirror from '@uiw/react-codemirror'
import { css } from '@codemirror/lang-css'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Editor from 'src/Components/Editor/Editor'
import ShowEditor from 'src/Components/Editor/ShowEditor'
import HtmlEditor from 'src/Components/FormCreation/PageCreation/HtmlEditor'
import { borderTemplates } from 'src/Components/_Shared'

// عرض عنصر input فقط (بدون تحديث ارتفاع)
const RenderPrintInputItem = ({ field }) => (
  <div>
    <label style={{ display: 'block', marginBottom: '8px' }}>
      {field.nameAr || field.nameEn || field.key}:
    </label>
    <input
      type='text'
      placeholder='Enter value...'
      readOnly
      style={{
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
      }}
    />
  </div>
)

// عنصر قابل للسحب مع تحكم العرض والارتفاع (نفس فكرة ViewCollection: Width / Height)
function SortablePrintInputItem({ field, layoutItem, layout, setInputsLayout, locale }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layoutItem.i
  })

  const currentLayoutItem = layout.find(l => l.i === layoutItem.i) || layoutItem
  const currentWidth = currentLayoutItem?.w ?? 12
  const currentHeight = currentLayoutItem?.h ?? (field?.type === 'LongText' ? 1.8 : 1)

  const handleWidthChange = delta => {
    const newWidth = Math.max(1, Math.min(12, currentWidth + delta))
    setInputsLayout(prev =>
      prev.map(item => (item.i === layoutItem.i ? { ...item, w: newWidth } : item))
    )
  }

  const handleHeightChange = delta => {
    const newHeight = Math.max(0.5, Math.min(10, Math.round((currentHeight + delta) * 10) / 10))
    setInputsLayout(prev =>
      prev.map(item => (item.i === layoutItem.i ? { ...item, h: newHeight } : item))
    )
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${currentWidth}`,
    minHeight: `${currentHeight * 70}px`
  }

  const isAr = locale === 'ar'
  const widthLabel = isAr ? 'العرض' : 'Width'
  const heightLabel = isAr ? 'الارتفاع' : 'Height'

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        ...style,
        border: '1px solid',
        borderColor: '#e0e0e0',
        borderRadius: '4px',
        padding: '16px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        position: 'relative'
      }}
    >
      {/* تحكم العرض والارتفاع - نفس ViewCollection */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          gap: 1,
          border: '1px dashed',
          borderColor: 'primary.main',
          borderRadius: 1,
          p: 1,
          pointerEvents: 'none'
        }}
      >
        <Box sx={{ pointerEvents: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Width */}
          <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'primary.main', overflow: 'hidden' }}>
            <Typography variant='caption' sx={{ px: 1, py: 0.5, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              {widthLabel}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                size='small'
                sx={{ minWidth: 28, height: 28, p: 0 }}
                onClick={e => { e.stopPropagation(); handleWidthChange(-1) }}
                title={isAr ? 'تقليل العرض' : 'Decrease Width'}
              >
                -
              </Button>
              <Typography variant='caption' sx={{ px: 1, minWidth: 28, textAlign: 'center' }}>
                {currentWidth}
              </Typography>
              <Button
                size='small'
                sx={{ minWidth: 28, height: 28, p: 0 }}
                onClick={e => { e.stopPropagation(); handleWidthChange(1) }}
                title={isAr ? 'زيادة العرض' : 'Increase Width'}
              >
                +
              </Button>
            </Box>
          </Box>
          {/* Height */}
          <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'primary.main', overflow: 'hidden' }}>
            <Typography variant='caption' sx={{ px: 1, py: 0.5, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              {heightLabel}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                size='small'
                sx={{ minWidth: 28, height: 28, p: 0 }}
                onClick={e => { e.stopPropagation(); handleHeightChange(-0.1) }}
                title={isAr ? 'تقليل الارتفاع' : 'Decrease Height'}
              >
                -
              </Button>
              <Typography variant='caption' sx={{ px: 1, minWidth: 36, textAlign: 'center' }}>
                {currentHeight.toFixed(1)}
              </Typography>
              <Button
                size='small'
                sx={{ minWidth: 28, height: 28, p: 0 }}
                onClick={e => { e.stopPropagation(); handleHeightChange(0.1) }}
                title={isAr ? 'زيادة الارتفاع' : 'Increase Height'}
              >
                +
              </Button>
            </Box>
          </Box>
          {/* Drag handle - listeners فقط على المقبض لتفعيل السحب منه فقط */}
          <Box
            {...listeners}
            sx={{
              cursor: 'grab',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.main',
              '&:active': { cursor: 'grabbing' }
            }}
            title={isAr ? 'اسحب للترتيب' : 'Drag to reorder'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="7" cy="5" r="1.5" />
              <circle cx="13" cy="5" r="1.5" />
              <circle cx="7" cy="10" r="1.5" />
              <circle cx="13" cy="10" r="1.5" />
              <circle cx="7" cy="15" r="1.5" />
              <circle cx="13" cy="15" r="1.5" />
            </svg>
          </Box>
        </Box>
      </Box>
      <div style={{ flex: 1, minWidth: 0, paddingTop: '36px' }}>
        <RenderPrintInputItem field={field} />
      </div>
    </div>
  )
}

function PrintSetting({ open, roles, onChange, data, fields }) {
  const { messages, locale } = useIntl()


  const printConfig = roles?.print || {
    includeInputs: false,
    pages: [],
    selectedTemplate: null,
    customCSS: '',
    inputsOrder: [],
    selectedBorder: null,
    customBorderCSS: '',
    inputsVisibility: {}
  }
  const pages = Array.isArray(printConfig.pages) ? printConfig.pages : []

  // قوالب جاهزة للتصميم مع CSS لكل قالب
  const printTemplates = [
    {
      id: 'template1',
      name: messages.dialogs.printTemplate1Name,
      description: messages.dialogs.printTemplate1Description,
      preview: '📄',
      css: `label {
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
    },
    {
      id: 'template2',
      name: messages.dialogs.printTemplate2Name,
      description: messages.dialogs.printTemplate2Description,
      preview: '✨',
      css: `label {
  margin-bottom: 8px;
  display: block;
  color: #6366f1;
  font-weight: 600;
  font-size: 14px;
}
input {
  width: 100%;
  padding: 11px 16px;
  border: 2px solid #e0e7ff;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.2s;
}
input:focus {
  outline: none;
  border-color: #6366f1;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}`
    },
    {
      id: 'template3',
      name: messages.dialogs.printTemplate3Name,
      description: messages.dialogs.printTemplate3Description,
      preview: '📋',
      css: `label {
  margin-bottom: 8px;
  display: block;
  color: #1f2937;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #374151;
  border-radius: 4px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.2s;
}
input:focus {
  outline: none;
  border-color: #1f2937;
  box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
}`
    },
    {
      id: 'template4',
      name: messages.dialogs.printTemplate4Name,
      description: messages.dialogs.printTemplate4Description,
      preview: '🎨',
      css: `label {
  margin-bottom: 8px;
  display: block;
  color: #db2777;
  font-weight: 600;
  font-size: 14px;
}
input {
  width: 100%;
  padding: 11px 16px;
  border: 2px solid #fce7f3;
  border-radius: 8px;
  font-size: 14px;
  color: #831843;
  background-color: #fdf2f8;
  transition: all 0.2s;
}
input:focus {
  outline: none;
  border-color: #db2777;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.1);
}`
    },
    {
      id: 'template5',
      name: messages.dialogs.printTemplate5Name,
      description: messages.dialogs.printTemplate5Description,
      preview: '📝',
      css: `label {
  margin-bottom: 8px;
  display: block;
  color: #6b7280;
  font-weight: 400;
  font-size: 13px;
}
input {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 0;
  font-size: 14px;
  color: #374151;
  background-color: transparent;
  transition: all 0.2s;
}
input:focus {
  outline: none;
  border-bottom-color: #6b7280;
  border-bottom-width: 2px;
}`
    },
    {
      id: 'custom',
      name: messages.dialogs.printTemplateCustomName,
      description: messages.dialogs.printTemplateCustomDescription,
      preview: '⚙️',
      css: printConfig.customCSS || ''
    }
  ]

  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [pageTitle, setPageTitle] = useState('')
  const [pageContent, setPageContent] = useState({ content_ar: '', content_en: '' })
  const [isHtml, setIsHtml] = useState(false)

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewIndex, setViewIndex] = useState(null)

  const [isInputsOrderDialogOpen, setIsInputsOrderDialogOpen] = useState(false)

  const tabs = data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data || []

  console.log(tabs);



  const [inputsLayout, setInputsLayout] = useState([])

  useEffect(() => {
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      // إذا لم يكن fields موجوداً، نحصل على الـ fields من data
      const additionalFields = data?.additional_fields || []
      const filteredFields = additionalFields.filter(field => field.key !== open?.id)

      if (filteredFields.length > 0) {
        const savedLayout = printConfig.inputsOrder || []
        const existingIds = savedLayout.map(item => item.i)

        // دمج الـ layout المحفوظ مع الـ fields الجديدة
        const newLayout = filteredFields.map((field, index) => {
          const existing = savedLayout.find(item => item.i === field.key)
          if (existing) return existing

          return {
            i: field.key,
            x: 0,
            y: savedLayout.length + index,
            w: 12,
            h: field.type === 'LongText' ? 1.8 : 1
          }
        })

        setInputsLayout(newLayout)
      }
    } else {
      const savedLayout = printConfig.inputsOrder || []

      const newLayout = fields.map((field, index) => {
        const existing = savedLayout.find(item => item.i === field.key)
        if (existing) return existing

        return {
          i: field.key,
          x: 0,
          y: savedLayout.length + index,
          w: 12,
          h: field.type === 'LongText' ? 1.8 : 1
        }
      })

      setInputsLayout(newLayout)
    }
  }, [fields, data?.additional_fields, printConfig.inputsOrder, open?.id, isInputsOrderDialogOpen])



  const updatePrintConfig = updater => {
    if (!data?.additional_fields || !open?.id) return

    const additional_fields = [...data.additional_fields]
    const idx = additional_fields.findIndex(inp => inp.key === open.id)
    if (idx === -1) return

    const current = { ...additional_fields[idx] }
    const currentRoles = current.roles || {}
    const currentPrint = currentRoles.print || { includeInputs: false, pages: [] }

    const nextPrint = typeof updater === 'function' ? updater(currentPrint) : updater

    current.roles = { ...currentRoles, print: nextPrint }
    additional_fields[idx] = current

    onChange({ ...data, additional_fields })
  }

  const handleToggleIncludeInputs = checked => {
    updatePrintConfig(prev => ({
      ...prev,
      includeInputs: checked
    }))
  }


  const handleToggleInputHiddenShow = (fieldKey, checked) => {
    updatePrintConfig(prev => {
      const currentVisibility = prev.inputsVisibility || {}

      return {
        ...prev,
        inputsVisibility: {
          ...currentVisibility,
          [fieldKey]: {
            ...(currentVisibility[fieldKey] || {}),
            hiddenShow: checked
          }
        }
      }
    })
  }

  const handleTemplateChange = templateId => {
    const selectedTemplate = printTemplates.find(t => t.id === templateId)
    if (!selectedTemplate) return

    updatePrintConfig(prev => {
      const newConfig = {
        ...prev,
        selectedTemplate: templateId
      }

      // إذا لم يكن custom، نطبق CSS الخاص بالقالب
      if (templateId !== 'custom' && selectedTemplate.css) {
        newConfig.customCSS = selectedTemplate.css
      }

      return newConfig
    })
  }

  const handleCustomCSSChange = css => {
    updatePrintConfig(prev => ({
      ...prev,
      customCSS: css,
      inputsOrder: inputsLayout,
      selectedTemplate: 'custom' // عند التعديل على CSS، نختار custom تلقائياً
    }))
  }

  const handleBorderChange = borderId => {
    const selectedBorder = borderTemplates.find(b => b.id === borderId)
    if (!selectedBorder) return

    updatePrintConfig(prev => {
      const newConfig = {
        ...prev,
        selectedBorder: borderId
      }

      // إذا لم يكن custom، نطبق CSS الخاص بالحدود
      if (borderId !== 'border_custom' && selectedBorder.borderStyle) {
        newConfig.customBorderCSS = selectedBorder.borderStyle
      }

      return newConfig
    })
  }

  const handleCustomBorderCSSChange = css => {
    updatePrintConfig(prev => ({
      ...prev,
      customBorderCSS: css,
      selectedBorder: 'border_custom' // عند التعديل على CSS، نختار custom تلقائياً
    }))
  }

  // الحصول على CSS الحدود الحالي
  const getCurrentBorderCSS = () => {
    if (printConfig.selectedBorder === 'border_custom') {
      return printConfig.customBorderCSS || ''
    }

    const selectedBorder = borderTemplates.find(b => b.id === printConfig.selectedBorder)

    return selectedBorder?.borderStyle || ''
  }

  // الحصول على CSS الحالي للعرض
  const getCurrentCSS = () => {
    if (printConfig.selectedTemplate === 'custom') {
      return printConfig.customCSS || ''
    }
    const selectedTemplate = printTemplates.find(t => t.id === printConfig.selectedTemplate)

    return selectedTemplate?.css || printConfig.customCSS || `label {
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

  const openAddDialog = () => {
    setEditingIndex(null)
    setPageTitle('')
    setPageContent({ content_ar: '', content_en: '' })
    setIsHtml(false)
    setIsPageDialogOpen(true)
  }

  const openEditDialog = index => {
    const page = pages[index]
    if (!page) return
    setEditingIndex(index)
    setPageTitle(page.title || '')

    // دعم البنية القديمة (content) والجديدة (content_ar, content_en)
    if (page.content_ar || page.content_en) {
      setPageContent({
        content_ar: page.content_ar || '',
        content_en: page.content_en || ''
      })
    } else {
      // إذا كان content موجود (البنية القديمة)، نضعه في content_ar
      setPageContent({
        content_ar: page.content || '',
        content_en: ''
      })
    }

    // استعادة حالة HTML
    setIsHtml(Boolean(page.ishtml))

    setIsPageDialogOpen(true)
  }

  const closePageDialog = () => {
    setIsPageDialogOpen(false)
    setEditingIndex(null)
    setPageTitle('')
    setPageContent({ content_ar: '', content_en: '' })
    setIsHtml(false)
  }

  const handleSavePage = () => {
    const title = pageTitle.trim()
    const contentAr = (pageContent.content_ar || '').trim()
    const contentEn = (pageContent.content_en || '').trim()
    if (!title && !contentAr && !contentEn) {
      // لا نقوم بالحفظ إذا كانت البيانات فاضية تماماً
      return
    }

    updatePrintConfig(prev => {
      const list = Array.isArray(prev.pages) ? [...prev.pages] : []

      if (editingIndex !== null && editingIndex >= 0 && editingIndex < list.length) {
        const current = { ...list[editingIndex] }
        current.title = title || current.title || `صفحة ${editingIndex + 1}`
        current.content_ar = contentAr
        current.content_en = contentEn
        current.ishtml_ar = isHtml.ishtml_ar
        current.ishtml_en = isHtml.ishtml_en

        // إزالة content القديم إذا كان موجوداً
        if (current.content) {
          delete current.content
        }

        // إزالة html_ar و html_en القديمين إذا كانا موجودين
        if (current.html_ar) {
          delete current.html_ar
        }
        if (current.html_en) {
          delete current.html_en
        }
        list[editingIndex] = current
      } else {
        list.push({
          id: Date.now(),
          title: title || `صفحة ${list.length + 1}`,
          content_ar: contentAr,
          content_en: contentEn,
          ishtml: isHtml
        })
      }

      return {
        ...prev,
        pages: list
      }
    })

    closePageDialog()
  }

  const handleDeletePage = index => {
    updatePrintConfig(prev => {
      const list = Array.isArray(prev.pages) ? [...prev.pages] : []
      if (index < 0 || index >= list.length) return prev
      list.splice(index, 1)

      return {
        ...prev,
        pages: list
      }
    })

    if (viewIndex === index) {
      setIsViewDialogOpen(false)
      setViewIndex(null)
    }
  }

  const handleOpenView = index => {
    const page = pages[index]
    if (!page) return
    setViewIndex(index)
    setIsViewDialogOpen(true)
  }

  const handleCloseView = () => {
    setIsViewDialogOpen(false)
    setViewIndex(null)
  }

  const handleOpenInputsOrder = () => {
    // نفس فكرة ViewCollection: بناء القائمة من الحقول المتاحة مع احترام الترتيب المحفوظ
    const fieldsList = fields || data?.additional_fields || []
    const availableFields = fieldsList.filter(f => f.key !== open?.id)
    const savedOrder = Array.isArray(printConfig.inputsOrder) ? printConfig.inputsOrder : []
    const savedIds = savedOrder.map(l => l.i)

    // ترتيب: أولاً العناصر المحفوظة (الموجودة في الحقول)، ثم أي حقل جديد غير موجود في المحفوظ
    const orderedIds = [
      ...savedIds.filter(id => availableFields.some(f => f.key === id)),
      ...availableFields.map(f => f.key).filter(key => !savedIds.includes(key))
    ]

    const newLayout = orderedIds.map((id, y) => {
      const prev = savedOrder.find(l => l.i === id)
      const field = availableFields.find(f => f.key === id)

      return {
        i: id,
        x: 0,
        y,
        w: prev?.w ?? 12,
        h: prev?.h ?? (field?.type === 'LongText' ? 1.8 : 1)
      }
    })

    setInputsLayout(newLayout)
    setIsInputsOrderDialogOpen(true)
  }

  const handleCloseInputsOrder = () => {
    setIsInputsOrderDialogOpen(false)
  }

  const handleSaveInputsOrder = () => {
    updatePrintConfig(prev => ({
      ...prev,
      inputsOrder: inputsLayout
    }))
    handleCloseInputsOrder()
  }

  // @dnd-kit: نفس ViewCollection - sensors و onDragEnd لإعادة ترتيب القائمة
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor)
  )

  const handleInputsOrderDragEnd = useCallback(event => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fieldsList = fields || data?.additional_fields || []
    const visibilityMap = printConfig.inputsVisibility || {}

    const visibleLayout = inputsLayout.filter(item => {
      const field = fieldsList.find(f => f.key === item.i)

      return field && !Boolean(visibilityMap[field.key]?.hiddenShow)
    })

    const hiddenLayout = inputsLayout.filter(item => {
      const field = fieldsList.find(f => f.key === item.i)

      return field && Boolean(visibilityMap[field.key]?.hiddenShow)
    })
    const oldIndex = visibleLayout.findIndex(item => item.i === active.id)
    const newIndex = visibleLayout.findIndex(item => item.i === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reorderedVisible = arrayMove(visibleLayout, oldIndex, newIndex)
    const newVisibleWithY = reorderedVisible.map((item, y) => ({ ...item, y }))
    const newHiddenWithY = hiddenLayout.map((item, y) => ({ ...item, y: newVisibleWithY.length + y }))
    setInputsLayout([...newVisibleWithY, ...newHiddenWithY])
  }, [inputsLayout, fields, data?.additional_fields, printConfig.inputsVisibility])

  const currentViewPage = viewIndex !== null && viewIndex >= 0 && viewIndex < pages.length ? pages[viewIndex] : null

  // في نافذة الترتيب نعرض فقط الحقول غير المخفية (Hidden غير مفعّل)
  const visibleInSortLayout = useMemo(() => {
    const fieldsList = fields || data?.additional_fields || []
    const visibilityMap = printConfig.inputsVisibility || {}

    return inputsLayout.filter(item => {
      const field = fieldsList.find(f => f.key === item.i)

      return field && !Boolean(visibilityMap[field.key]?.hiddenShow)
    })
  }, [inputsLayout, fields, data?.additional_fields, printConfig.inputsVisibility])

  const [loadingSave, setLoadingSave] = useState(false)

  const allFieldsList = fields || data?.additional_fields || []

  const renderPrintInputRow = field => {
    const visibility = (printConfig.inputsVisibility || {})[field.key] || {}

    return (
      <Box
        key={field.key}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          mb: 1
        }}
      >
        <Typography variant='body2'>
          {locale === 'ar' ? field.nameAr : field.nameEn || field.key}
        </Typography>
        <Box display='flex' alignItems='center' columnGap={2}>
          <FormControlLabel
            control={
              <Checkbox
                color='primary'
                checked={Boolean(visibility.hiddenShow)}
                onChange={(_, checked) => handleToggleInputHiddenShow(field.key, checked)}
                size='small'
              />
            }
            label={locale === 'ar' ? 'مخفي' : 'Hidden'}
          />
        </Box>
      </Box>
    )
  }

  // قوالب الحدود (PDF Borders)


  // الحصول على الـ inputs للعرض في الترتيب


  return (
    <UnmountClosed isOpened={Boolean(roles?.type === 'print')}>
      <Box pt={2} borderTop={2} borderColor='primary.main' borderTopStyle='dashed'>
        <Typography variant='h6' color='primary' fontWeight='bold' mt={2}>
          {messages.dialogs.printSettingsTitle}
        </Typography>

        {/* Checkbox include inputs in print */}
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                color='primary'
                checked={Boolean(printConfig.includeInputs)}
                onChange={(_, checked) => handleToggleIncludeInputs(checked)}
              />
            }
            label={messages.dialogs.printIncludeInputs}
          />
        </Box>

        {/* قائمة الـ inputs مع Checkboxes لكل واحد */}
        {Boolean(printConfig.includeInputs) && (
          <Box mt={2}>
            <Typography variant='subtitle2' color='text.secondary' mb={1}>
              {locale === 'ar' ? 'الحقول المضمنة في الطباعة' : 'Printed Fields'}
            </Typography>
            {(tabs && tabs.length > 0
              ? tabs.map(tab => (
                <Box key={tab.id} mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' mb={0.5}>
                    {locale === 'ar' ? tab.name_ar : tab.name_en}
                  </Typography>

                  {(tab.fields || []).map(fieldKey => {
                    const field = allFieldsList.find(f => f.key === fieldKey)

                    if (!field) return null

                    return renderPrintInputRow(field)
                  })}
                </Box>
              ))
              : (inputsLayout || []).map(layoutItem => {
                const field = allFieldsList.find(f => f.key === layoutItem.i)

                if (!field) return null

                return renderPrintInputRow(field)
              })
            )}
          </Box>
        )}

        {/* زر ترتيب عرض inputs */}
        {Boolean(printConfig.includeInputs) && (
          <Box mt={2}>
            <Button
              variant='outlined'
              color='primary'
              size='small'
              onClick={handleOpenInputsOrder}
            >
              {locale === 'ar' ? 'ترتيب عرض inputs' : 'View Inputs Order'}
            </Button>
          </Box>
        )}

        {/* Print Style Settings - يظهر فقط عند تفعيل includeInputs */}
        {Boolean(printConfig.includeInputs) && (
          <Box mt={3} p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant='subtitle1' color='primary' fontWeight='bold' mb={2}>
              {messages.dialogs.printDesignTitle}
            </Typography>

            {/* اختيار القالب */}
            <Box mb={3}>
              <Typography variant='body2' color='text.secondary' mb={1.5}>
                {messages.dialogs.printSelectTemplate}
              </Typography>
              <Grid container spacing={2}>
                {printTemplates.map(template => {
                  const isSelected = printConfig.selectedTemplate === template.id
                  const templateCSS = template.id === 'custom' ? printConfig.customCSS : template.css || ''

                  return (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                      <Paper
                        elevation={isSelected ? 6 : 2}
                        sx={{
                          p: 2.5,
                          cursor: 'pointer',
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'primary.main' : 'background.paper',
                          color: isSelected ? 'white' : 'inherit',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': isSelected
                            ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              bgcolor: 'primary.dark'
                            }
                            : {},
                          '&:hover': {
                            elevation: 4,
                            borderColor: 'primary.main',
                            transform: 'translateY(-4px)',
                            boxShadow: theme =>
                              `0 8px 16px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'}`
                          }
                        }}
                        onClick={() => handleTemplateChange(template.id)}
                      >
                        <Box display='flex' alignItems='flex-start' gap={1.5} mb={1.5}>
                          <Box
                            sx={{
                              fontSize: '2rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 48,
                              height: 48,
                              borderRadius: 1.5,
                              bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'action.hover',
                              color: isSelected ? 'white' : 'text.primary',
                              transition: 'all 0.3s'
                            }}
                          >
                            {template.preview}
                          </Box>
                          <Box flex={1}>
                            <Typography variant='subtitle1' fontWeight='bold' color={isSelected ? 'white' : 'text.primary'}>
                              {template.name}
                            </Typography>
                            <Typography variant='caption' color={isSelected ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
                              {template.description}
                            </Typography>
                          </Box>
                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>

            {/* Preview مشترك - يطبق عليه CSS القالب المختار */}
            {printConfig.selectedTemplate && (
              <Box mb={3} p={2.5} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography variant='body2' color='text.secondary' mb={2} fontWeight='medium'>
                  Preview:
                </Typography>
                <Box
                  id='print-preview'
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <style>{`#print-preview { ${getCurrentCSS()} }`}</style>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Field Label</label>
                  <input
                    type='text'
                    placeholder='Enter value...'
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    readOnly
                  />
                </Box>
              </Box>
            )}

            {/* CSS مخصص */}
            <Box>
              <Typography variant='body2' color='text.secondary' mb={1.5}>
                {messages.dialogs.printCustomCSS}
              </Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <CodeMirror
                  value={getCurrentCSS()}
                  width='100%'
                  height='300px'
                  extensions={[css()]}
                  onChange={handleCustomCSSChange}
                  placeholder={messages.dialogs.printCustomCSSPlaceholder}
                />
              </Box>
              <Typography variant='caption' color='text.secondary' mt={0.5} display='block'>
                {messages.dialogs.printCustomCSSDescription}
              </Typography>
            </Box>
          </Box>
        )}

        {/* PDF Borders Section */}
        <Box mt={4} p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant='subtitle1' color='primary' fontWeight='bold' mb={2}>
            حدود PDF (PDF Borders)
          </Typography>

          {/* اختيار قالب الحدود */}
          <Box mb={3}>
            <Typography variant='body2' color='text.secondary' mb={1.5}>
              اختر قالب الحدود:
            </Typography>
            <Grid container spacing={2}>
              {borderTemplates.map(border => {
                const isSelected = printConfig.selectedBorder === border.id

                return (
                  <Grid item xs={12} sm={6} md={4} key={border.id}>
                    <Paper
                      elevation={isSelected ? 6 : 2}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                        color: isSelected ? 'white' : 'inherit',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': isSelected
                          ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            bgcolor: 'primary.dark'
                          }
                          : {},
                        '&:hover': {
                          elevation: 4,
                          borderColor: 'primary.main',
                          transform: 'translateY(-4px)',
                          boxShadow: theme =>
                            `0 8px 16px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'}`
                        }
                      }}
                      onClick={() => handleBorderChange(border.id)}
                    >
                      <Box display='flex' alignItems='center' gap={1.5} mb={1}>
                        <Box
                          sx={{
                            fontSize: '1.5rem',
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'action.hover',
                            color: isSelected ? 'white' : 'text.primary',
                            transition: 'all 0.3s'
                          }}
                        >
                          {border.preview}
                        </Box>
                        <Box flex={1}>
                          <Typography variant='subtitle2' fontWeight='bold' color={isSelected ? 'white' : 'text.primary'}>
                            {border.name}
                          </Typography>
                          <Typography variant='caption' color={isSelected ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
                            {border.description}
                          </Typography>
                        </Box>
                        {isSelected && (
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: 'white',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            ✓
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          </Box>

          {/* Preview للحدود */}
          {printConfig.selectedBorder && (
            <Box mb={3} p={2.5} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant='body2' color='text.secondary' mb={2} fontWeight='medium'>
                معاينة الحدود:
              </Typography>
              <Box
                id='border-preview'
                sx={{
                  minHeight: '200px',
                  bgcolor: 'white',
                  borderRadius: 1,
                  position: 'relative'
                }}
              >
                <style>{`
                  #border-preview {
                    ${getCurrentBorderCSS()}
                  }
                `}</style>
                <Box sx={{ p: 2 }}>
                  <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
                    معاينة الحدود - سيتم تطبيقها على صفحات PDF
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* CSS مخصص للحدود */}
          {printConfig.selectedBorder === 'border_custom' && (
            <Box>
              <Typography variant='body2' color='text.secondary' mb={1.5}>
                CSS مخصص للحدود:
              </Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <CodeMirror
                  value={getCurrentBorderCSS()}
                  width='100%'
                  height='200px'
                  extensions={[css()]}
                  onChange={handleCustomBorderCSSChange}
                  placeholder='أدخل CSS مخصص للحدود...'
                />
              </Box>
              <Typography variant='caption' color='text.secondary' mt={0.5} display='block'>
                يمكنك إضافة CSS مخصص للتحكم الكامل في تصميم الحدود
              </Typography>
            </Box>
          )}
        </Box>

        {/* Extra PDF pages */}
        <Stack direction='row' alignItems='center' justifyContent='space-between' gap={2} mt={4}>
          <Typography variant='subtitle1' color='primary' fontWeight='bold'>
            {messages.dialogs.printExtraPagesTitle}
          </Typography>
          <Button variant='contained' color='primary' size='small' onClick={openAddDialog}>
            {messages.dialogs.printAddNewPage}
          </Button>
        </Stack>

        <Stack mt={2} spacing={1.5}>
          {pages.length === 0 && (
            <Typography variant='caption' color='text.secondary'>
              {messages.dialogs.printNoExtraPages}
            </Typography>
          )}

          {pages.map((page, index) => (
            <Card key={page.id || index} variant='outlined'>
              <CardContent>
                <Typography variant='subtitle2' color='primary' fontWeight='bold'>
                  {page.title || `${messages.dialogs.printPageNameLabel} ${index + 1}`}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                <Button size='small' variant='outlined' color='primary' onClick={() => openEditDialog(index)}>
                  {messages.edit}
                </Button>
                <Button size='small' variant='outlined' color='primary' onClick={() => handleOpenView(index)}>
                  {messages.dialogs.view}
                </Button>
                <Button size='small' variant='outlined' color='error' onClick={() => handleDeletePage(index)}>
                  {messages.delete}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>

        {/* Add / Edit page popup */}
        <Dialog open={isPageDialogOpen} onClose={closePageDialog} maxWidth='lg' fullWidth>
          <DialogTitle>
            {editingIndex !== null ? messages.dialogs.printEditPageTitle : messages.dialogs.printAddPageTitle}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} mt={1}>
              <TextField
                label={messages.dialogs.printPageNameLabel}
                variant='filled'
                value={pageTitle}
                onChange={e => setPageTitle(e.target.value)}
                placeholder={messages.dialogs.printPageNamePlaceholder}
                fullWidth
                size='small'
              />
              <Box>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                  <Typography variant='subtitle2' color='primary' fontWeight='bold'>
                    {messages.dialogs.titleAr || 'المحتوى بالعربية'}
                  </Typography>
                  <Button
                    size='small'
                    variant={isHtml ? 'contained' : 'outlined'}
                    color='primary'
                    onClick={() => setIsHtml(!isHtml)}
                  >
                    Insert HTML
                  </Button>
                </Box>
                {isHtml ? (
                  <HtmlEditor
                    Html={pageContent.content_ar || ''}
                    onValueChange={value => setPageContent(prev => ({ ...prev, content_ar: value }))}
                    height='400px'
                  />
                ) : (
                  <Editor
                    loadingSave={loadingSave}
                    setLoadingSave={setLoadingSave}
                    initialTemplateName={pageContent.content_ar || ''}
                    refresh={0}
                    onChange={e => setPageContent(prev => ({ ...prev, content_ar: e }))}
                  />
                )}
              </Box>
              <Box mt={3}>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                  <Typography variant='subtitle2' color='primary' fontWeight='bold'>
                    {messages.dialogs.titleEn || 'المحتوى بالإنجليزية'}
                  </Typography>
                  <Button
                    size='small'
                    variant={isHtml ? 'contained' : 'outlined'}
                    color='primary'
                    onClick={() => setIsHtml(!isHtml)}
                  >
                    Insert HTML
                  </Button>
                </Box>
                {isHtml ? (
                  <HtmlEditor
                    Html={pageContent.content_en || ''}
                    onValueChange={value => setPageContent(prev => ({ ...prev, content_en: value }))}
                    height='400px'
                  />
                ) : (
                  <Editor
                    loadingSave={loadingSave}
                    setLoadingSave={setLoadingSave}
                    initialTemplateName={pageContent.content_en || ''}
                    refresh={0}
                    onChange={e => setPageContent(prev => ({ ...prev, content_en: e }))}
                  />
                )}
              </Box>
              {/* <TextField
                 label={messages.dialogs.printPageContentLabel}
                 value={pageContent}
                 onChange={e => setPageContent(e.target.value)}
                 placeholder={messages.dialogs.printPageContentPlaceholder}
                 fullWidth
                 size='small'
                 multiline
                 minRows={4}
               /> */}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closePageDialog} color='inherit'>
              {messages.dialogs.cancel}
            </Button>
            <Button onClick={handleSavePage} color='primary' variant='contained'>
              {editingIndex !== null ? messages.edit : messages.add}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View page popup (read-only, not textarea) */}
        <Dialog open={isViewDialogOpen && Boolean(currentViewPage)} onClose={handleCloseView} maxWidth='sm' fullWidth>
          <DialogTitle>{currentViewPage?.title || messages.dialogs.printViewPageTitleFallback}</DialogTitle>
          <DialogContent dividers>
            {currentViewPage?.ishtml ? (
              <Box dangerouslySetInnerHTML={{ __html: locale === 'ar' ? (currentViewPage?.content_ar || '') : (currentViewPage?.content_en || '') }} />
            ) : (
              <Typography
                variant='body2'
                sx={{
                  whiteSpace: 'pre-wrap'
                }}
              >
                <ShowEditor
                  initialTemplateName={
                    locale === 'ar'
                      ? (currentViewPage?.content_ar || currentViewPage?.content || '')
                      : (currentViewPage?.content_en || currentViewPage?.content || '')
                  }
                />
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView} color='inherit'>
              {messages.dialogs.close}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog ترتيب عرض inputs - نفس أسلوب ViewCollection مع @dnd-kit */}
        <Dialog open={isInputsOrderDialogOpen} onClose={handleCloseInputsOrder} fullScreen fullWidth>
          <DialogTitle>ترتيب عرض  inputs</DialogTitle>
          <DialogContent dividers sx={{ minHeight: '400px', p: 2 }}>
            <Box id='print-preview'>
              <style>{`#print-preview { ${getCurrentCSS()} }`}</style>
              {inputsLayout.length === 0 ? (
                <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
                  لا توجد inputs للعرض
                </Typography>
              ) : visibleInSortLayout.length === 0 ? (
                <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
                  جميع الحقول مخفية — قم بإلغاء تفعيل Hidden من القائمة أعلاه
                </Typography>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleInputsOrderDragEnd}
                >
                  <SortableContext
                    items={visibleInSortLayout.map(item => item.i)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        gap: '10px',
                        gridAutoFlow: 'row',
                        width: '100%'
                      }}
                    >
                      {(tabs && tabs.length > 0
                        ? tabs.map((tab, tabIndex) => {
                          const tabLayoutItems = (visibleInSortLayout || []).filter(
                            layoutItem => (tab.fields || []).includes(layoutItem.i)
                          )
                          if (!tabLayoutItems.length) return null

                          return (
                            <Fragment key={tab.id || tabIndex}>
                              <Box mb={2} sx={{ gridColumn: '1 / -1' }}>
                                <Typography variant='subtitle2' color='text.secondary' mb={0.5}>
                                  {locale === 'ar' ? tab.name_ar : tab.name_en}
                                </Typography>
                              </Box>

                              {tabLayoutItems.map(layoutItem => {
                                const field = allFieldsList.find(f => f.key === layoutItem.i)
                                if (!field) return null

                                return (
                                  <SortablePrintInputItem
                                    key={layoutItem.i}
                                    field={field}
                                    layoutItem={layoutItem}
                                    layout={inputsLayout}
                                    setInputsLayout={setInputsLayout}
                                    locale={locale}
                                  />
                                )
                              })}
                            </Fragment>
                          )
                        })
                        : visibleInSortLayout.map(layoutItem => {
                          const field = allFieldsList.find(f => f.key === layoutItem.i)
                          if (!field) return null

                          return (
                            <SortablePrintInputItem
                              key={layoutItem.i}
                              field={field}
                              layoutItem={layoutItem}
                              layout={inputsLayout}
                              setInputsLayout={setInputsLayout}
                              locale={locale}
                            />
                          )
                        })
                      )}
                    </Box>
                  </SortableContext>
                </DndContext>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInputsOrder} color='inherit'>
              {messages.dialogs.cancel}
            </Button>
            <Button onClick={handleSaveInputsOrder} color='primary' variant='contained'>
              {messages.dialogs.save}
            </Button>
          </DialogActions>
        </Dialog>
      </Box >
    </UnmountClosed >
  )
}

export default PrintSetting
