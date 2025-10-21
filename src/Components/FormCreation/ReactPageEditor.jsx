/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import Editor from '@react-page/editor'
import '@react-page/editor/lib/index.css'
import { useIntl } from 'react-intl'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { MdOutlineSaveAs } from 'react-icons/md'
import { RiArrowGoBackFill } from 'react-icons/ri'
import { Icon } from '@iconify/react'
import { useTheme } from '@emotion/react'
import { FaEye } from 'react-icons/fa'
import { IoSettingsOutline } from 'react-icons/io5'
import { TbApi } from 'react-icons/tb'
import { useRouter } from 'next/router'
import { LoadingButton } from '@mui/lab'
import useCellPlugins from './PageCreation/HooksDragDropComponents/useCellPlugins'
import { toast } from 'react-toastify'
import { DefaultStyle, getType } from '../_Shared'
import { axiosGet, axiosPost } from '../axiosCall'

const ReactPageEditor = () => {
  const [editorValue, setEditorValue] = useState(null)
  const [readOnly, setReadOnly] = useState(false)
  const [advancedEdit, setAdvancedEdit] = useState(false)
  const { locale, messages } = useIntl()
  const [openApiData, setOpenApiData] = useState(false)
  const [openBack, setOpenBack] = useState(false)
  const [saveData, setSaveData] = useState(false)
  const [loadingSaveData, setLoadingSaveData] = useState(false)
  const theme = useTheme()

  const {
    push,
    query: { addFiles, dataSourceId }
  } = useRouter()

  // CellPlugins Hook Calling
  const { cellPlugins } = useCellPlugins({ advancedEdit, locale, readOnly })

  const [fields, setFields] = useState([])

  useEffect(() => {
    if (addFiles) {
      axiosGet(`collections/get-by-id?id=${addFiles}`, locale).then(res => {
        if (res.status) {
          setFields(res.data)
        }
      })
    }
  }, [addFiles])

  return (
    <div className='relative'>
      <Dialog open={openBack} onClose={() => setOpenBack(false)} fullWidth>
        <DialogTitle>
          {messages.dialogs.returnToPreviousPageWithoutSaveChanges}
        </DialogTitle>
        <DialogContent>
          <DialogActions>
            <Button variant='contained' color='error' onClick={() => push(`/${locale}/setting/pages`)}>
              {messages.dialogs.yes}
            </Button>
            <Button variant='contained' color='secondary' onClick={() => setOpenBack(false)}>
              {messages.dialogs.no}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Dialog open={saveData} onClose={() => setSaveData(false)} fullWidth>
        <DialogTitle>
          {messages.dialogs.areYouSureYouWantToSaveTheChanges}
        </DialogTitle>
        <DialogContent>
          <DialogActions>
            <LoadingButton
              loading={loadingSaveData}
              variant='contained'
              onClick={() => {
                const stop = []
                const addData = []
                editorValue?.rows.map((row, index) => {
                  row.cells.map(cell => {
                    const data = { options: { uiSchema: { xComponentProps: {} } } }
                    const dataMain = cell?.dataI18n?.default || {}
                    const validationData = []
                    if (dataMain.required) {
                      validationData.push({ RuleType: 'Required', Parameters: {} })
                    }

                    if (dataMain.maxLength) {
                      validationData.push({ RuleType: 'MaxLength', Parameters: { maxLength: dataMain.maxLength } })
                    }
                    if (dataMain.minLength) {
                      validationData.push({ RuleType: 'MinLength', Parameters: { minLength: dataMain.minLength } })
                    }

                    if (dataMain.maxValue && dataMain.type === 'number') {
                      validationData.push({ RuleType: 'MaxValue', Parameters: { maxValue: dataMain.maxValue } })
                    }
                    if (dataMain.minValue && dataMain.type === 'number') {
                      validationData.push({ RuleType: 'MinValue', Parameters: { minValue: dataMain.minValue } })
                    }

                    if (dataMain.type === 'url') {
                      validationData.push({ RuleType: 'Url', Parameters: {} })
                    }
                    if (dataMain.type === 'email') {
                      validationData.push({ RuleType: 'Email', Parameters: {} })
                    }
                    if (cell?.plugin?.id === 'date') {
                      validationData.push({
                        RuleType: 'ColumnDataType',
                        Parameters: { expectedType: 'System.DateTime' }
                      })
                    }
                    if (dataMain.type === 'number') {
                      validationData.push({ RuleType: 'ColumnDataType', Parameters: { expectedType: 'System.Int64' } })
                    }
                    if (
                      cell?.plugin?.id === 'input' ||
                      cell?.plugin?.id === 'textarea' ||
                      cell?.plugin?.id === 'file' ||
                      cell?.plugin?.id === 'date'
                    ) {
                      data.type = getType(
                        cell?.plugin?.id === 'textarea'
                          ? 'textarea'
                          : cell?.plugin?.id === 'file'
                          ? 'file'
                          : cell?.plugin?.id === 'date'
                          ? 'date'
                          : dataMain.type || 'text'
                      )
                      data.collectionId = addFiles
                      data.key = dataMain.key
                      data.descriptionAr = dataMain.labelAr || ''
                      data.descriptionEn =
                        cell?.plugin?.id === 'textarea'
                          ? data.rows || '5'
                          : cell?.plugin?.id === 'file'
                          ? `${dataMain.multiple ? 'true' : 'false'}` || ''
                          : cell?.plugin?.id === 'date'
                          ? JSON.stringify({
                              format: dataMain.format || 'MM/dd/yyyy',
                              showTime: dataMain.showTime || 'false'
                            })
                          : dataMain.labelEn || ''
                      data.nameAr = dataMain.labelAr || ''
                      data.nameEn = dataMain.labelEn || ''
                      const placeholderAr = dataMain.placeholderAr || ''
                      const placeholderEn = dataMain.placeholderEn || ''
                      data.options.uiSchema.xComponentProps.placeholder = JSON.stringify({
                        ar: placeholderAr,
                        en: placeholderEn
                      })
                      data.FieldCategory = 'Basic'
                      data.options.uiSchema.xComponentProps.fileTypes = dataMain.fileTypes || []
                      data.options.uiSchema.xComponentProps.regex = dataMain.regex || ''
                      const regexMessageAr = dataMain.regexMessageAr || ''
                      const regexMessageEn = dataMain.regexMessageEn || ''
                      data.options.uiSchema.xComponentProps.errorMessage =
                        JSON.stringify({ ar: regexMessageAr, en: regexMessageEn }) || ''
                      data.options.uiSchema.xComponentProps.cssClass = dataMain.css || DefaultStyle(cell?.plugin?.id)
                      data.validationData = validationData
                      if (!data.key) {
                        toast.error(`${messages.dialogs.keyRequired} ${index + 1}`)
                        stop.push(false)
                      }
                      if (!data.nameAr) {
                        toast.error(`${messages.dialogs.labelRequired} ${index + 1}`)
                        stop.push(false)
                      }
                      if (!data.nameEn) {
                        toast.error(`${messages.dialogs.labelRequired} ${index + 1}`)
                        stop.push(false)
                      }
                      if (!data.nameAr || !data.nameEn || !data.key) {
                        return
                      }
                      addData.push(data)
                    }
                    if (cell?.plugin?.id === 'checkbox' || cell?.plugin?.id === 'radio' || cell?.plugin?.id === 'select') {
                      data.type = getType(
                        cell?.plugin?.id === 'checkbox' ? 'checkbox' : cell?.plugin?.id === 'radio' ? 'radio' : 'select'
                      )
                      data.collectionId = addFiles
                      data.key = dataMain.key
                      data.descriptionAr =
                        cell?.plugin?.id === 'checkbox' ? 'checkbox' : cell?.plugin?.id === 'radio' ? 'radio' : 'select'
                      data.descriptionEn = JSON.stringify(dataMain.selected) || ''
                      data.nameAr = dataMain.labelAr || ''
                      data.nameEn = dataMain.labelEn || ''
                      data.FieldCategory = 'Associations'
                      data.options.uiSchema.xComponentProps.cssClass = dataMain.css || DefaultStyle(cell?.plugin?.id)
                      data.validationData = validationData
                      data.options.source = dataMain.collectionName
                      data.options.target = fields.key
                      data.key = `${dataMain.collectionName}${fields.key}`
                      if (cell?.plugin?.id === 'checkbox') {
                        data.options.junctionTable = `${dataMain.collectionName}${fields.key}`
                      } else {
                        data.options.foreignKey = `${dataMain.collectionName}${fields.key}`
                        data.options.sourceKey = 'id'
                        data.options.targetKey = fields.key
                      }

                      if (!data.nameAr) {
                        toast.error(`${messages.dialogs.labelRequired} ${index + 1}`)
                        stop.push(false)
                      }
                      if (!data.nameEn) {
                        toast.error(`${messages.dialogs.labelRequired} ${index + 1}`)
                        stop.push(false)
                      }
                      if (!dataMain.collectionName) {
                        toast.error(`${messages.dialogs.collectionNameRequired} ${index + 1}`)
                        stop.push(false)
                      }
                      if (!data.nameAr || !data.nameEn || !dataMain.collectionName) {
                        return
                      }

                      addData.push(data)
                    }
                    if (dataMain.unique) {
                      validationData.push({
                        RuleType: 'Unique',
                        Parameters: {
                          tableName: fields.key,
                          columnNames: [dataMain.key.trim()]
                        }
                      })
                    }
                  })
                })
                if (addData.length === 0) {
                  toast.error(messages.dialogs.noFieldsToAdd)

                  return
                }

                // return
                setLoadingSaveData(true)
                Promise.all(
                  addData.map(item =>
                    axiosPost('collection-fields/configure-fields', locale, item).then(res => {
                      if (res.status) {
                        const find = editorValue.rows.find(row => row.cells[0].dataI18n.default.key === item.key)

                        if (find?.id) {
                          setEditorValue(prev => ({ ...prev, rows: prev.rows.filter(ele => ele.id !== find.id) }))
                        }
                      }

                      return res.status
                    })
                  )
                )
                  .then(res => {
                    if (res.includes(false)) {
                      toast.error(messages.dialogs.anErrorOccurred)
                    } else {
                      toast.success(messages.dialogs.changesSavedSuccessfully)
                    }
                    setSaveData(false)
                  })
                  .finally(() => {
                    setLoadingSaveData(false)
                  })
              }}
            >
              {messages.dialogs.save}
            </LoadingButton>
            <Button variant='contained' color='error' onClick={() => setSaveData(false)}>
              {messages.dialogs.cancel}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <div className={`container flex gap-2 justify-end mb-2`}>
        <Button
          variant='contained'
          color={'success'}
          onClick={() => {
            setSaveData(true)
          }}
        >
          <MdOutlineSaveAs className='text-xl me-1' />
          {messages.dialogs.addInputs}
        </Button>
        <Button
          variant='contained'
          color={!advancedEdit ? 'warning' : 'primary'}
          onClick={() => {
            setOpenApiData(!openApiData)
          }}
        >
          <TbApi className='text-2xl' />
        </Button>
        <Button
          variant='contained'
          color={'primary'}
          onClick={() => {
            setReadOnly(!readOnly)
            setAdvancedEdit(false)
          }}
        >
          <FaEye className='text-xl' />
        </Button>
        <Button
          variant='contained'
          color={advancedEdit ? 'warning' : 'primary'}
          onClick={() => {
            setAdvancedEdit(!advancedEdit)
            if (document.querySelector('[data-testid="DevicesIcon"]')) {
              if (!advancedEdit) {
                document.querySelector('[data-testid="DevicesIcon"]').parentElement.click()
              } else {
                document.querySelector('[data-testid="CreateIcon"]').parentElement.click()
              }
            }
          }}
        >
          <IoSettingsOutline className='text-xl' />
        </Button>
        <Button
          variant='contained'
          color={'error'}
          onClick={() => {
            setOpenBack(true)
          }}
        >
          <RiArrowGoBackFill className='text-xl' />
        </Button>
      </div>
      <div
        style={{
          background: theme.palette.background.default
        }}
        className={`duration-300 ${readOnly ? `overflow-auto fixed inset-0 pb-10` : '!bg-white'}`}
      >
        {readOnly && (
          <div className='fixed top-[10px] end-[10px] z-[11111111]'>
            <IconButton
              size='large'
              onClick={() => setReadOnly(false)}
              className='!text-white !bg-red-500 hover:!bg-red-600'
            >
              <Icon icon='tabler:x' fontSize='1.125rem' />
            </IconButton>
          </div>
        )}
        <Editor
          cellPlugins={cellPlugins}
          theme={theme}
          value={editorValue}
          onChange={(e, editor) => {
            setEditorValue(e)
          }}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export default ReactPageEditor
