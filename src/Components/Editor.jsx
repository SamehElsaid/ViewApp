import dynamic from 'next/dynamic'
import   { useEffect, useRef, useState } from 'react'
import 'suneditor/dist/css/suneditor.min.css'
import { UrlTranAr } from './encryption'
import axios from 'axios'

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

const Editor = ({ initialTemplateName, type, setValue, trigger, setLoadingBtn, setShowDescription, to }) => {
  const [templateName, setTemplateName] = useState(initialTemplateName)
  const ref = useRef('')

  return (
    <SunEditor
      onChange={e => {
        setTemplateName(e)
        setValue(type, e)
        trigger(type)
        ref.current = e
        if (setShowDescription) {
          setShowDescription(false)
          setLoadingBtn(true)
        }
      }}
      lang={'en'}
      onBlur={async e => {
        if (setLoadingBtn) {
          setLoadingBtn(true)
          try {
            const res = await axios.get(UrlTranAr(ref.current.replace(/<[^>]*>/g, ''), 'en'))
            setValue(to, res.data)
            setLoadingBtn(false)
          } catch (err) {
            setLoadingBtn(false)
          }
        }
      }}
      defaultValue={templateName}
      setOptions={{
        buttonList: [
          ['font', 'fontSize', 'formatBlock'],
          ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
          ['align', 'horizontalRule', 'list', 'table'],
          ['fontColor', 'hiliteColor'],
          ['outdent', 'indent'],
          ['undo', 'redo'],
          ['removeFormat'],
          ['outdent', 'indent'],
          ['link', 'image'],
          ['preview', 'print'],
          ['fullScreen', 'showBlocks', 'codeView']
        ]
      }}
      height='300px'
      width='100%'
    />
  )
}

export default Editor
