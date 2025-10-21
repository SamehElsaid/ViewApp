import { useMemo } from 'react'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import CheckboxControl from '../CheckboxControl'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { useIntl } from 'react-intl'

export default function useFile({ locale, advancedEdit }) {
  const { messages } = useIntl()
  
  const File = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        const defaultValue = (data, key, defaultValue) => {
          if (data[key]) {
            return data[key]
          }

          return defaultValue
        }

        return (
          <>
            <ViewInputInFormEngine
              data={data}
              advancedEdit={advancedEdit}
              locale={locale}
              defaultValue={defaultValue}
              onChange={onChange}
              type='file'
            />
          </>
        )
      },
      id: 'file',
      title: messages.dialogs.uploader,
      description: messages.dialogs.uploader,
      version: 1,
      icon: <IoCloudUploadOutline  className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <CheckboxControl data={data} onChange={onChange} locale={locale} type='file' />
        )
      }
    }
  }, [locale, advancedEdit, messages])

  return { File }
}
