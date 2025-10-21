/* eslint-disable react-hooks/exhaustive-deps */
import dynamic from 'next/dynamic'
import { useIntl } from 'react-intl'
import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'

// تحميل Monaco Editor بدون SSR
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const JsEditorOnSubmit = ({ data, onChange, jsCode }) => {
  const { locale, messages } = useIntl()

  const functionTemplate = `async function Action(e, args) {\n  // write your code here\n}`

  const [code, setCode] = useState(jsCode || functionTemplate)

  useEffect(() => {
    setCode(jsCode || functionTemplate)
  }, [jsCode])

  const handleEditorChange = value => {
    const match = value.match(/async function Action\(e, args\) \{([\s\S]*)\}/)
    try {
      if (match) {
        const newContent = match[1]
        const updatedCode = `async function Action(e, args) {${newContent}}`

        onChange({ ...data, onSubmit: updatedCode })
      } else {
        toast.error(messages.dialogs.invalidCode)
        setCode(functionTemplate)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <div className='flex justify-end mb-2'>
        <Button variant='contained' color='error' onClick={() => handleEditorChange(functionTemplate)}>
          {messages.dialogs.resetCode}
        </Button>
      </div>
      <MonacoEditor
        height='300px'
        width='100%'
        language='javascript'
        theme='vs-dark'
        value={code}
        onChange={handleEditorChange}
        options={{
          selectOnLineNumbers: true,
          minimap: { enabled: false },
          readOnly: false
        }}
      />
    </div>
  )
}

export default JsEditorOnSubmit
