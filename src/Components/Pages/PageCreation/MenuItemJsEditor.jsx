/* eslint-disable react-hooks/exhaustive-deps */
import dynamic from 'next/dynamic'
import { useIntl } from 'react-intl'
import { useState, useEffect } from 'react'
import { Button } from '@mui/material'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const functionTemplate = `async function Action(e, args) {\n  // e: click event, args: { item, index }\n  // write your code here\n}`

export default function MenuItemJsEditor({ value, onChange, onReset }) {
  const { messages } = useIntl()
  const [code, setCode] = useState(value || functionTemplate)

  useEffect(() => {
    setCode(value || functionTemplate)
  }, [value])

  const handleEditorChange = newValue => {
    const match = newValue && newValue.match(/async function Action\s*\(\s*e\s*,\s*args\s*\)\s*\{([\s\S]*)\}/)
    try {
      if (match) {
        const body = match[1]
        const updatedCode = `async function Action(e, args) {${body}}`
        setCode(updatedCode)
        onChange(updatedCode)
      } else {
        setCode(functionTemplate)
        onChange(functionTemplate)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleReset = () => {
    setCode(functionTemplate)
    onChange(functionTemplate)
    onReset?.()
  }

  return (
    <div>
      <div className='flex justify-end mb-2'>
        <Button variant='contained' color='error' size='small' onClick={handleReset}>
          {messages.dialogs?.resetCode ?? 'Reset code'}
        </Button>
      </div>
      <MonacoEditor
        height='220px'
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
