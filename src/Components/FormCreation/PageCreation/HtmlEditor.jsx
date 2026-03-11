import CodeMirror from '@uiw/react-codemirror'
import jsBeautify from 'js-beautify'
import { Button } from '@mui/material'
import { useIntl } from 'react-intl'

const HtmlEditor = ({ data, onChange, Html, open, roles, onValueChange, height = '400px' }) => {
  const { locale, messages } = useIntl()

  const handleChange = value => {
    // إذا كان onValueChange موجود، استخدمه مباشرة (للاستخدام البسيط)
    if (onValueChange) {
      onValueChange(value)

      return
    }

    // البنية القديمة للتوافق مع CssEditor
    if (data && onChange && open) {
      const additional_fields = data.additional_fields ?? []
      const findMyInput = additional_fields.find(inp => inp.key === open.id)

      if (findMyInput) {
        findMyInput.design = value
      } else {
        const myEdit = {
          key: open.id,
          design: value,
          roles: { ...roles }
        }
        additional_fields.push(myEdit)
      }

      onChange({ ...data, additional_fields: additional_fields })
    }
  }

  

  return (
    <div className=''>
      
      <div className="max-h-[400px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: Html || '' }} ></div>
      <CodeMirror value={Html || ''} width='100%' height={height} onChange={handleChange} />
    </div>
  )
}

export default HtmlEditor
