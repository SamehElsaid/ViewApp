import slate from '@react-page/plugins-slate'
import '@react-page/plugins-slate/lib/index.css'
import '@react-page/plugins-spacer/lib/index.css'
import useInput from './useInput'
import useTextArea from './useTextArea'
import useCheckbox from './useCheckbox'
import useRadio from './useRadio'
import useSelect from './useSelect'
import useFile from './useFile'
import useDate from './useDate'

export default function useCellPlugins({ advancedEdit, locale, readOnly }) {
  // Hooks Drag Drop Components
  const { Input } = useInput({ locale, advancedEdit })
  const { TextArea } = useTextArea({ locale, advancedEdit })
  const { Checkbox } = useCheckbox({ locale, advancedEdit })
  const { Radio } = useRadio({ locale, advancedEdit })
  const { Select } = useSelect({ locale, advancedEdit })
  const { Date } = useDate({ locale, advancedEdit,readOnly })
  const { File } = useFile({ locale, advancedEdit })
  const cellPlugins = [slate(), Input, TextArea, Checkbox, Radio, Select, Date, File]

  return { cellPlugins }
}
