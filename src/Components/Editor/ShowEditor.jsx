import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

const ShowEditor = ({ initialTemplateName }) => {
  const ref = useRef('')
  const divRef = useRef(null)
  const editorInstance = useRef(null) // ✅ this will store the real SunEditor instance
  const { messages } = useIntl()

  // Update editor content on toggle
  useEffect(() => {
    if (editorInstance.current) {
      try {
        editorInstance?.current?.setContents(initialTemplateName)
      } catch (error) {}
    }
  }, [initialTemplateName])

  return (
    <div ref={divRef} className='customView '>
      <SunEditor
        getSunEditorInstance={sunEditor => {
          editorInstance.current = sunEditor // ✅ store instance here
        }}
        readOnly
        disableToolbar
        hideToolbar
        onChange={e => {
          ref.current = e
        }}
        onLoad={() => {
          const editor = document.querySelector('.sun-editor-editable')
          if (editor) {
            editor.setAttribute('contenteditable', 'false')
            editor.style.pointerEvents = 'auto'
            editor.style.userSelect = 'text'
          }
        }}
        setOptions={{
          buttonList: [],
          resizingBar: false
        }}
        width='100%'
        defaultValue={initialTemplateName}
      />
    </div>
  )
}

export default ShowEditor
