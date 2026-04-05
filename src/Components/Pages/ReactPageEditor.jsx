/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useEffect, useRef, useState } from 'react'
import Editor from '@react-page/editor'
import '@react-page/editor/lib/index.css'
import { useIntl } from 'react-intl'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { Icon } from '@iconify/react'
import ApiData from './PageCreation/ApiData'
import { useTheme } from '@emotion/react'
import { FaEye } from 'react-icons/fa'
import { IoSettingsOutline } from 'react-icons/io5'
import { TbApi } from 'react-icons/tb'
import { axiosGet, axiosPatch } from '../axiosCall'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { LoadingButton } from '@mui/lab'
import { useSelector } from 'react-redux'
import useCellPlugins from './PageCreation/HooksDragDropComponents/useCellPlugins'
import { useDispatch } from 'react-redux'
import { SET_ACTIVE_LOADING } from 'src/store/apps/LoadingPages/LoadingPages'

const ReactPageEditor = ({ pageName, initialData, initialDataApi, handlePrint, setEditorValueNewData, type, pageId, workflowId, entitiesId, collectionName, pageRoles, pageTypeId, readOnly, setReadOnly, children, initialLayout, isPrint, printName, hiddenPrintBtn, startPrint }) => {
  const [newData, setNewData] = useState(initialData)
  const [editorValue, setEditorValue] = useState(null)
  const [advancedEdit, setAdvancedEdit] = useState(false)
  const { locale, messages } = useIntl()
  const [openApiData, setOpenApiData] = useState(false)
  const [openBack, setOpenBack] = useState(false)
  const [saveData, setSaveData] = useState(false)
  const [loadingSaveData, setLoadingSaveData] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const theme = useTheme()
  const { push } = useRouter()
  const apiData = useSelector(state => state.api.data)

  const { query: { FormType } } = useRouter()


  // CellPlugins Hook Calling



  const buttonRef = useRef(null)
  const [openLayoutDialog, setOpenLayoutDialog] = useState(false)
  const [layoutList, setLayoutList] = useState([])
  const [layoutLoading, setLayoutLoading] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState(initialLayout ?? printName ?? '')


  console.log(pageId,"from:ReactPageEditor");

  const { cellPlugins } = useCellPlugins({
    advancedEdit,
    locale,
    readOnly,
    pageId,
    entitiesId,
    collectionName,
    pageName,
    buttonRef,
    FormType,
    layoutComponent: children,
    isPrint
  })

  // نجعل الـ cellPlugins متاحة عالمياً لاستخدامها داخل الـ popup عند عرض صفحات أخرى
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__pageBuilderCellPlugins = cellPlugins
    }
  }, [cellPlugins])

  const dispatch = useDispatch()

  useEffect(() => {
    setTimeout(() => {
      dispatch(SET_ACTIVE_LOADING())
    }, 1000)
  }, [])



  useEffect(() => {
    if (JSON.stringify(editorValue) !== JSON.stringify(newData)) {
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }, [editorValue, newData])

  useEffect(() => {
    const handleBeforeUnload = event => {
      if (isChanged) {
        // Standard message for the browser's confirmation dialog
        const message = messages.AreYouSureYouWantToSaveTheChanges

        // This is the standard way to trigger the browser dialog
        event.preventDefault()
        event.returnValue = message // Required for Chrome

        return message // Required for older browsers
      }
    }

    // Handle browser back/forward navigation
    const handlePopState = event => {
      if (isChanged) {
        window.history.pushState(null, '', window.location.pathname + window.location.search)

        setOpenBack(true)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.history.pushState(null, '', window.location.pathname + window.location.search)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isChanged, locale])

  // Loading State To Stop Rendering Editor
  useEffect(() => {
    setNewData(initialData)
    setEditorValue(initialData)

  }, [initialData])
  useEffect(() => {
    setTimeout(() => {
      dispatch(SET_ACTIVE_LOADING())
    }, 1000)
  }, [])
  useEffect(() => {
    if (advancedEdit) {
      if (document.body) {
        document.body.classList.add('edit-mode')
      }
    } else {
      if (document.body) {
        document.body.classList.remove('edit-mode')
      }
    }
  }, [advancedEdit])
  useEffect(() => {
    document.body.classList.add('page-control')

    return () => {
      document.body.classList.remove('page-control')
    }
  }, [])

  const handleClick = () => {
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true
    })
    document.dispatchEvent(escEvent)
  }

  useEffect(() => {
    const handleClickEvent = e => {
      if (e.target.closest('.react-page-cell-insert-new')) {
        handleClick()
      }
    }

    document.body.addEventListener('mousedown', handleClickEvent)

    return () => {
      document.body.removeEventListener('mousedown', handleClickEvent)
    }
  }, [])



  const uploadPage = () => {
    setLoadingSaveData(true)
    axiosPatch(`page/update/${pageName}`, locale, {
      pageRoles: pageRoles,
      pageTypeId: pageTypeId,
      pageWorkflows: workflowId,
      VersionReason: new Date().toISOString(),
      description: '',
      pageComponents: [],
      jsonData: JSON.stringify({
        editorValue,
        apiData: apiData.map(item => ({ ...item, data: null, loading: true })),
        layout: selectedLayout,

      })
    })
      .then(res => {
        if (res.status) {
          toast.success(messages.ChangesSaved)
          setNewData(editorValue)
          setSaveData(false)
        }
      })
      .finally(_ => {
        setLoadingSaveData(false)
        setOpenLayoutDialog(false)
      })
  }

  return (
    <div className='relative pdf-wrapper' id='pdf-content'>
      {/* PDF Loading Overlay */}
      {loadingPdf && (
        <div className='fixed  no-print inset-0 z-[999999] flex items-center justify-center bg-white animate-in fade-in duration-300'>
          <div className='flex flex-col items-center gap-6'>
            <div className='relative w-20 h-20'>
              <div className='absolute inset-0 border-4 border-blue-200/30 rounded-full'></div>
              <div className='absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin'></div>
              <div
                className='absolute inset-2 border-4 border-blue-300/50 rounded-full border-r-transparent animate-spin'
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              ></div>
            </div>
            <div className='text-center'>
              <p className=' text-xl font-bold mb-2 animate-pulse'>Generating PDF</p>
              <div className='flex gap-1 justify-center'>
                <span
                  className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0s' }}
                ></span>
                <span
                  className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='absolute invisible z-0 no-print'>
        <button
          ref={buttonRef}
          onClick={() => {
            handleClick()
          }}
        ></button>
      </div>

      {type === 'all-pages' ? (
        <div className={`relative ${loadingPdf ? 'generate-pdf' : ''}`}>

          <div

       
            className={`duration-300 pdf-container  ${readOnly ? `` : '!bg-white'}`}
          >
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
      ) : (
        <>
          <ApiData open={openApiData} setOpen={setOpenApiData} initialDataApi={initialDataApi} />
          <Dialog open={openBack} onClose={() => setOpenBack(false)} fullWidth>
            <DialogTitle>{messages.ReturnToPrevious}</DialogTitle>
            <DialogContent>
              <DialogActions>
                <Button variant='contained' color='error' onClick={() => push(`/${locale}/setting/pages`)}>
                  {messages.yes}
                </Button>
                <Button variant='contained' color='secondary' onClick={() => setOpenBack(false)}>
                  {messages.no}
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog>
          <Dialog open={saveData} onClose={() => setSaveData(false)} fullWidth>
            <DialogTitle>{messages.AreYouSureYouWantToSaveTheChanges}</DialogTitle>
            <DialogContent>
              <DialogActions>
                <LoadingButton
                  loading={loadingSaveData}
                  variant='contained'
                  onClick={() => {
                    uploadPage()
                  }}
                >
                  {messages.save}
                </LoadingButton>
                <Button variant='contained' color='error' onClick={() => setSaveData(false)}>
                  {messages.cancel}
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog>
          {!initialLayout &&
            <div className='h-[65px]  no-print'>
              <div
                className={` ${advancedEdit ? 'bgGradient' : 'bg-white'
                  } ${!initialLayout ? 'fixed' : ''} top-0 py-2  duration-300  z-[11111] left-0 right-0 shadow-xl`}
              >
                <div className='container flex gap-2 justify-between'>
                  {advancedEdit ? (
                    <div className='editMode'>
                      <div className='wrapper'>
                        <span className='letter letter1'>E</span>
                        <span className='letter letter2'>d</span>
                        <span className='letter letter3'>i</span>
                        <span className='letter letter4'>t</span>
                        <span className='letter letter5'> </span>
                        <span className='letter letter6'>M</span>
                        <span className='letter letter7'>o</span>
                        <span className='letter letter8'>d</span>
                        <span className='letter letter9'>e</span>
                        <span className='letter letter10'>.</span>
                      </div>
                    </div>
                  ) : (
                    <div className='text-xl font-bold fixed start-[270px] top-0 z-[111111] h-[65.6px]  flex items-center gap-2 '>
                      <span className='text-2xl'>{pageName}</span>
                    </div>
                  )}
                  <div className='flex gap-2 ms-auto'>
                    <Button
                      variant={advancedEdit ? 'contained' : 'outlined'}
                      color={'primary'}
                      title={messages.ApiControl}
                      onClick={() => {
                        setOpenApiData(!openApiData)
                      }}
                    >
                      <TbApi className='text-2xl' />
                    </Button>
                    <Button
                      variant={readOnly || advancedEdit ? 'contained' : 'outlined'}
                      color={'primary'}
                      title={messages.viewMode}
                      onClick={() => {
                        setReadOnly(!readOnly)
                        setEditorValueNewData(editorValue)
                        setAdvancedEdit(false)
                      }}
                    >
                      <FaEye className='text-xl' />
                    </Button>
                    <Button
                      variant={advancedEdit ? 'contained' : 'outlined'}
                      color={'warning'}
                      title={messages.editMode}
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

                    {FormType !== 'layout' && (
                      <Button
                        variant={advancedEdit ? 'contained' : 'outlined'}
                        color={'success'}
                        onClick={async () => {
                          if (JSON.stringify(editorValue) !== JSON.stringify(newData)) {
                            setOpenBack(true)

                            return
                          }
                          const loadingToast = toast.loading(messages.dialogs.loading)

                          setOpenLayoutDialog(true)
                          if (!layoutList.length && !layoutLoading) {
                            setLayoutLoading(true)
                            try {
                              const res = await axiosGet('page/get-pages?FormType=layout', locale)
                              if (res?.status) {
                                setLayoutList(res.data)
                              }
                            } finally {
                              setLayoutLoading(false)
                              toast.dismiss(loadingToast)
                            }
                          }
                        }}
                      >
                        {messages.dialogs.layout}
                      </Button>
                    )}
                    <Button
                      variant={advancedEdit ? 'contained' : 'outlined'}
                      color={'error'}
                      onClick={() => {
                        JSON.stringify(editorValue) === JSON.stringify(newData)
                          ? FormType === 'layout' ? push(`/${locale}/setting/layouts`) : push(`/${locale}/setting/pages`)
                          : setOpenBack(true)
                      }}
                    >
                      {messages.exit}
                    </Button>
                    <Button
                      variant='contained'
                      color={'success'}
                      onClick={() => {
                        setSaveData(true)
                      }}
                    >
                      {messages.saveChanges}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          }
          <div
            style={{
              background: !readOnly ? theme.palette.background.default : 'white'
            }}
            className={`content-editor-print  duration-300 ${readOnly ? `overflow-auto ${!initialLayout ? 'fixed' : 'w-full'} inset-0 pb-10 z-[1111111]` : '!bg-white'}`}
          >

            {isPrint ?

              hiddenPrintBtn ? null :

                <div className="flex justify-end items-center p-3 btn-print">

                  <Button variant="contained" color="primary" onClick={() => handlePrint()}>{messages.print || "click to print"}</Button>
                </div>
              :
              readOnly ? (
                <div className='fixed top-[10px] end-[10px] z-[11111111]'>
                  <IconButton
                    size='large'
                    onClick={() => setReadOnly(false)}
                    className='!text-white !bg-red-500 hover:!bg-red-600'
                  >
                    <Icon icon='tabler:x' fontSize='1.125rem' />
                  </IconButton>
                </div>
              ) : null}
            <div >
              <Editor
                blurGateDisabled={true}
                cellPlugins={cellPlugins}
                theme={theme}
                value={editorValue}
                onChange={(e, editor) => {
                  setEditorValue(e)
                }}

                readOnly={readOnly}
                uiTranslator={(key) => {
                  return messages.pagestranslations[key] || key
                }}
                lang={locale}
                languages={['en', 'ar']}
              /></div>
          </div>
        </>
      )}

      {/* Layout selection dialog for print pages */}
      <Dialog open={openLayoutDialog} onClose={() => setOpenLayoutDialog(false)} fullWidth maxWidth='sm'>
        <DialogTitle>
          {locale === 'ar' ? 'اختر التخطيط المرتبط بهذه الصفحة' : 'Select layout for this page'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 3 }} disabled={layoutLoading}>
            <InputLabel>
              {locale === 'ar' ? 'التخطيط' : 'Layout'}
            </InputLabel>
            <Select
              value={selectedLayout}
              label={locale === 'ar' ? 'التخطيط' : 'Layout'}
              onChange={e => setSelectedLayout(e.target.value)}
            >
              {layoutList.map(layout => (
                <MenuItem key={layout.name} value={layout.name}>
                  {layout.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLayoutDialog(false)}>
            {messages.cancel}
          </Button>
          <LoadingButton
            loading={loadingSaveData}
            variant='contained'

            disabled={!selectedLayout}
            onClick={() => {


              uploadPage()


            }}
          >
            {messages.save || 'Save'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default memo(ReactPageEditor)











