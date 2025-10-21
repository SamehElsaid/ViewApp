/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useEffect, useRef, useState } from 'react'
import Editor from '@react-page/editor'
import '@react-page/editor/lib/index.css'
import { useIntl } from 'react-intl'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import ApiData from './PageCreation/ApiData'
import { useTheme } from '@emotion/react'
import { FaEye } from 'react-icons/fa'
import { IoSettingsOutline } from 'react-icons/io5'
import { TbApi } from 'react-icons/tb'
import { axiosPatch } from '../axiosCall'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { LoadingButton } from '@mui/lab'
import { useSelector } from 'react-redux'
import useCellPlugins from './PageCreation/HooksDragDropComponents/useCellPlugins'
import { useDispatch } from 'react-redux'
import { SET_ACTIVE_LOADING } from 'src/store/apps/LoadingPages/LoadingPages'

const ReactPageEditor = ({ pageName, initialData, initialDataApi, workflowId, pageId }) => {
  const [newData, setNewData] = useState(initialData)
  const [editorValue, setEditorValue] = useState(initialData ?? null)
  const [readOnly, setReadOnly] = useState(false)
  const [advancedEdit, setAdvancedEdit] = useState(false)
  const { locale, messages } = useIntl()
  const [openApiData, setOpenApiData] = useState(false)
  const [openBack, setOpenBack] = useState(false)
  const [saveData, setSaveData] = useState(false)
  const [loadingSaveData, setLoadingSaveData] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const theme = useTheme()
  const { push } = useRouter()
  const apiData = useSelector(state => state.api.data)

  // CellPlugins Hook Calling

  const buttonRef = useRef(null)
  const { cellPlugins } = useCellPlugins({ advancedEdit, locale, readOnly, buttonRef, workflowId, pageId })
  const dispatch = useDispatch()

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

  return (
    <div className='relative'>
      <div className='absolute invisible z-0'>
        <button
          ref={buttonRef}
          onClick={() => {
            handleClick()
          }}
        ></button>
      </div>
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
                const apiUrls = apiData.map(item => item.link)
                setLoadingSaveData(true)
                axiosPatch(`page/update/${pageName}`, locale, {
                  VersionReason: new Date().toISOString(),
                  description: '',
                  pageComponents: [],
                  jsonData: JSON.stringify({ editorValue, apiData })
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
                  })
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
      <div className='h-[65px] '>
        <div
          className={` ${
            advancedEdit ? 'bgGradient' : 'bg-white'
          } fixed top-0 py-2  duration-300  z-[11111] left-0 right-0 shadow-xl`}
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

              <Button
                variant={advancedEdit ? 'contained' : 'outlined'}
                color={'error'}
                onClick={() => {
                  JSON.stringify(editorValue) === JSON.stringify(newData)
                    ? push(`/${locale}/setting/pages`)
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
      <div
        style={{
          background: !readOnly ? theme.palette.background.default : 'white'
        }}
        className={`duration-300 ${readOnly ? `overflow-auto fixed inset-0 pb-10 z-[1111111]` : '!bg-white'}`}
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
          blurGateDisabled={true}
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

export default memo(ReactPageEditor)
