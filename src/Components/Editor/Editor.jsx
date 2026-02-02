/* eslint-disable react-hooks/exhaustive-deps */
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { CircularProgress, Skeleton } from '@mui/material'
import { useIntl } from 'react-intl'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

const Editor = ({ initialTemplateName, onChange, loadingData, loadingSave, setLoadingSave }) => {
  const [templateName, setTemplateName] = useState(initialTemplateName)
  const [loading, setLoading] = useState(true)
  const ref = useRef('')
  const refreshEditor = useRef()
  const { messages } = useIntl()

  useEffect(() => {
    setTemplateName(initialTemplateName)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 0)
  }, [loadingData])

  console.log(loadingSave)

  return loading ? (
    <div className='w-full'>
      <Skeleton variant='rectangular' width='100%' height='400px' sx={{ borderRadius: '10px' }} />
    </div>
  ) : (
    <div className='relative'>
      {loadingSave && (
        <div className='flex absolute bottom-0 z-50 gap-1 justify-center items-center p-2 text-white rounded-ss-lg bg-main-color/70 end-0'>
          <CircularProgress color='inherit' size={15} /> {messages.home.loadingSave}
        </div>
      )}
      <SunEditor
        ref={refreshEditor}
        onInput={() => {
          setLoadingSave(true)
        }}
        onChange={e => {
          setTemplateName(e)
          onChange(e)
          ref.current = e
          setLoadingSave(false)
        }}
        defaultValue={templateName}
        setOptions={{
          buttonList: [
            ['fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['align', 'horizontalRule', 'list'],
            ['fontColor', 'hiliteColor'],
            ['outdent', 'indent'],
            ['undo', 'redo'],
            ['removeFormat',"table"],
            ['preview']
          ]
        }}
        height='400px'
        width='100%'
      />
    </div>
  )
}

export default Editor
