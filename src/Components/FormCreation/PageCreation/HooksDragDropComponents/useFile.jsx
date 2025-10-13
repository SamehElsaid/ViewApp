import { useMemo } from 'react'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import CheckboxControl from '../CheckboxControl'
import { IoCloudUploadOutline } from 'react-icons/io5'

export default function useFile({ locale, advancedEdit }) {
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
      title: locale === 'ar' ? 'رفع الملفات' : 'Uploader',
      description: locale === 'ar' ? 'رفع الملفات' : 'Uploader',
      version: 1,
      icon: <IoCloudUploadOutline  className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <CheckboxControl data={data} onChange={onChange} locale={locale} type='file' />
        )
      }
    }
  }, [locale, advancedEdit])

  return { File }
}
