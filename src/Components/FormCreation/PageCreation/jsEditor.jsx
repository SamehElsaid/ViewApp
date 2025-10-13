/* eslint-disable react-hooks/exhaustive-deps */
import dynamic from 'next/dynamic'
import { useIntl } from 'react-intl'
import { useState, useEffect } from 'react'
import { objectToCss } from 'src/Components/_Shared'
import { Button } from '@mui/material'

// تحميل Monaco Editor بدون SSR
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const JsEditor = ({ data, onChange, jsCode, open, Css, type, roles }) => {
  const { locale } = useIntl()

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
        setCode(updatedCode)
        const additional_fields = data.additional_fields ?? []
        const findMyInput = additional_fields.find(inp => inp.key === open.id)
        if (findMyInput) {
          findMyInput.roles.event = {
            ...findMyInput.roles.event,
            [type ?? 'onChange']: updatedCode
          }
        } else {
          const myEdit = {
            key: open.id,
            design: objectToCss(Css).replaceAll('NaN', ''),
            roles: {
              ...roles,
              event: {
                [type ?? 'onChange']: updatedCode
              }
            }
          }
          additional_fields.push(myEdit)
        }
        onChange({ ...data, additional_fields: additional_fields })
      } else {
        toast.error(locale === 'ar' ? 'خطأ في الكود' : 'Invalid code')
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
          {locale === 'ar' ? 'اعادة الكود' : 'Reset Code'}
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

export default JsEditor
