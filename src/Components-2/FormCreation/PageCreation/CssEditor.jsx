import CodeMirror from '@uiw/react-codemirror'
import { css } from '@codemirror/lang-css'
import cssbeautify from 'cssbeautify'
import { Button } from '@mui/material'
import { useIntl } from 'react-intl'

const CssEditor = ({ data, onChange, Css, open, roles }) => {
  const { locale } = useIntl()

  const handleChange = value => {
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

  return (
    <div className=''>
      <Button
        variant='contained'
        onClick={() => {
          handleChange(
            cssbeautify(Css, {
              indent: '  ',
              openbrace: 'end-of-line',
              autosemicolon: true
            })
          )
        }}
      >
        {locale === 'ar' ? 'تنسيق' : 'Format'}
      </Button>
      <CodeMirror value={Css} width='100%' className='100%' extensions={[css()]} onChange={handleChange} />
    </div>
  )
}

export default CssEditor
