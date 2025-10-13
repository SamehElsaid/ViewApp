/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useEffect, useState } from 'react'
import Editor from '@react-page/editor'
import '@react-page/editor/lib/index.css'
import { useIntl } from 'react-intl'
import ApiData from './PageCreation/ApiData'
import { useTheme } from '@emotion/react'
import useCellPlugins from './PageCreation/HooksDragDropComponents/useCellPlugins'
import { useDispatch } from 'react-redux'
import { SET_ACTIVE_LOADING } from 'src/store/apps/LoadingPages/LoadingPages'

const ReactPageEditor = ({ initialData, initialDataApi ,pageId}) => {
  const [editorValue, setEditorValue] = useState(initialData ?? null)
  const readOnly = true
  const advancedEdit = false
  const { locale } = useIntl()
  const [openApiData, setOpenApiData] = useState(false)
  const dispatch = useDispatch()

  const theme = useTheme()

  // CellPlugins Hook Calling
  const { cellPlugins } = useCellPlugins({ advancedEdit, locale, readOnly,pageId })

  useEffect(() => {
    setTimeout(() => {
      dispatch(SET_ACTIVE_LOADING())
    }, 1000)
  }, [])

  useEffect(() => {
    setEditorValue(initialData)
  }, [initialData])

  return (
    <div className='relative'>
      <ApiData open={openApiData} setOpen={setOpenApiData} initialDataApi={initialDataApi} />

      <div
        style={{
          background: theme.palette.background.default
        }}
        className={`duration-300 ${readOnly ? ``:'!bg-white'}`}
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
  )
}

export default memo(ReactPageEditor)
