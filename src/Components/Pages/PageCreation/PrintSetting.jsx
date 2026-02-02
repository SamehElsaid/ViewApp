import { useState, useMemo, useRef, useEffect } from 'react'
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
import GridLayout, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import Editor from 'src/Components/Editor/Editor'
import ShowEditor from 'src/Components/Editor/ShowEditor'
import { borderTemplates } from 'src/Components/_Shared'

const ResponsiveGridLayout = WidthProvider(GridLayout)

// Component منفصل لعنصر الـ input في الترتيب - لكن يجب استخدامه مباشرة في map
const RenderPrintInputItem = ({ field, layoutItem, setInputsLayout }) => {
  const ref = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      setInputsLayout(prev => {
        return prev.map(item => {
          if (item.i === layoutItem.i) {
            return { ...item, h: ref.current.scrollHeight / 70 }
          }

          return item
        })
      })
    }, 100)
  }, [ref, layoutItem.i, setInputsLayout])


  return (
    <div
      ref={ref}>
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
}

function PrintSetting({ open, roles, onChange, data, fields }) {
  const { messages, locale } = useIntl()
  console.log(fields, 'fields');


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

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewIndex, setViewIndex] = useState(null)

  const [isInputsOrderDialogOpen, setIsInputsOrderDialogOpen] = useState(false)



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

  console.log(inputsLayout, 'inputsLayout');

  const refTest = useRef(null)

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

  const handleToggleInputInclude = (fieldKey, checked) => {
    updatePrintConfig(prev => {
      const currentVisibility = prev.inputsVisibility || {}

      return {
        ...prev,
        inputsVisibility: {
          ...currentVisibility,
          [fieldKey]: {
            ...(currentVisibility[fieldKey] || {}),
            include: checked
          }
        }
      }
    })
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
    setIsPageDialogOpen(true)
  }

  const closePageDialog = () => {
    setIsPageDialogOpen(false)
    setEditingIndex(null)
    setPageTitle('')
    setPageContent({ content_ar: '', content_en: '' })
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

        // إزالة content القديم إذا كان موجوداً
        if (current.content) {
          delete current.content
        }
        list[editingIndex] = current
      } else {
        list.push({
          id: Date.now(),
          title: title || `صفحة ${list.length + 1}`,
          content_ar: contentAr,
          content_en: contentEn
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
    // تهيئة layout من printConfig أو إنشاء layout جديد
    const additionalFields = data?.additional_fields || []
    const currentLayout = printConfig.inputsOrder || []

    // إنشاء layout للـ inputs التي لا توجد في layout الحالي
    const existingIds = currentLayout.map(item => item.i)

    const newLayout = additionalFields
      .filter(field => field.key !== open?.id && !existingIds.includes(field.key))
      .map((field, index) => ({
        i: field.key,
        x: 0,
        y: currentLayout.length + index,
        w: 12,
        h: 1
      }))

    setInputsLayout([...currentLayout, ...newLayout])
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

  const currentViewPage = viewIndex !== null && viewIndex >= 0 && viewIndex < pages.length ? pages[viewIndex] : null

  const [loadingSave, setLoadingSave] = useState(false)

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
              الحقول المضمنة في الطباعة
            </Typography>
            {(inputsLayout || []).map(layoutItem => {
              const fieldsList = fields || data?.additional_fields || []
              const field = fieldsList.find(f => f.key === layoutItem.i)

              if (!field) return null

              const visibility = (printConfig.inputsVisibility || {})[field.key] || {}

              return (
                <Box
                  key={layoutItem.i}
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
                    {field.nameAr || field.nameEn || field.key}
                  </Typography>
                  <Box display='flex' alignItems='center' columnGap={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color='primary'
                          checked={Boolean(visibility.include)}
                          onChange={(_, checked) => handleToggleInputInclude(field.key, checked)}
                          size='small'
                        />
                      }
                      label='Include'
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          color='primary'
                          checked={Boolean(visibility.hiddenShow)}
                          onChange={(_, checked) => handleToggleInputHiddenShow(field.key, checked)}
                          size='small'
                        />
                      }
                      label='Hidden-Show'
                    />
                  </Box>
                </Box>
              )
            })}
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
              ترتيب عرض inputs
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
                <Typography variant='subtitle2' color='primary' fontWeight='bold' mb={1}>
                  {messages.dialogs.titleAr || 'المحتوى بالعربية'}
                </Typography>
                <Editor
                  loadingSave={loadingSave}
                  setLoadingSave={setLoadingSave}
                  initialTemplateName={pageContent.content_ar || ''}
                  refresh={0}
                  onChange={e => setPageContent(prev => ({ ...prev, content_ar: e }))}
                />
              </Box>
              <Box mt={3}>
                <Typography variant='subtitle2' color='primary' fontWeight='bold' mb={1}>
                  {messages.dialogs.titleEn || 'المحتوى بالإنجليزية'}
                </Typography>
                <Editor
                  loadingSave={loadingSave}
                  setLoadingSave={setLoadingSave}
                  initialTemplateName={pageContent.content_en || ''}
                  refresh={0}
                  onChange={e => setPageContent(prev => ({ ...prev, content_en: e }))}
                />
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
              {/* {currentViewPage?.content || messages.dialogs.printNoContent} */}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView} color='inherit'>
              {messages.dialogs.close}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog ترتيب عرض inputs */}
        <Dialog open={isInputsOrderDialogOpen} onClose={handleCloseInputsOrder} maxWidth='lg' fullWidth>
          <DialogTitle>ترتيب عرض inputs</DialogTitle>
          <DialogContent dividers sx={{ minHeight: '400px', p: 2 }}>
            <Box id='print-preview'>
              <style>{`#print-preview { ${getCurrentCSS()} }`}</style>
              {inputsLayout.length === 0 ? (
                <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
                  لا توجد inputs للعرض
                </Typography>
              ) : (
                <ResponsiveGridLayout
                  className='layout'
                  layout={inputsLayout}
                  ref={refTest}
                  cols={12}
                  rowHeight={97} allowOverlap={false}
                  onLayoutChange={newLayout => {
                    setInputsLayout(newLayout)
                  }}
                  draggableHandle='.drag-handle'
                  isResizable={true}
                  isDraggable={true}
                  margin={[10, 10]}
                >
                  {inputsLayout.map(layoutItem => {
                    // البحث عن الـ field المقابل
                    const fieldsList = fields || data?.additional_fields || []
                    const field = fieldsList.find(f => f.key === layoutItem.i)

                    if (!field) return null

                    // يجب أن يكون العنصر مباشرة بدون wrapper component
                    return (
                      <div
                        key={layoutItem.i}
                        className='drag-handle'
                        style={{
                          border: '1px solid',
                          borderColor: '#e0e0e0',
                          borderRadius: '4px',
                          padding: '16px',
                          backgroundColor: '#ffffff',
                          cursor: 'move',
                          height: '100%',
                          width: '100%'
                        }}
                      >
                        <RenderPrintInputItem field={field} layoutItem={layoutItem} setInputsLayout={setInputsLayout} />
                      </div>
                    )
                  })}
                </ResponsiveGridLayout>
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
