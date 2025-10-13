import { useMemo } from 'react'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import CheckboxControl from '../CheckboxControl'
import { IoMdRadioButtonOn } from 'react-icons/io'

export default function useRadio({ locale, advancedEdit  }) {
  const Radio = useMemo(() => {
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
            <ViewInputInFormEngine data={data}  advancedEdit={advancedEdit} locale={locale} defaultValue={defaultValue} onChange={onChange} type='radio'/>
          </>
        )
      },
      id: 'radio',
      title: locale === 'ar' ? 'خانة الاختيار المنفردة'  : 'Radio',
      description: locale === 'ar' ? 'خانة الاختيار المنفردة' : 'Radio',
      version: 1,
      icon: <IoMdRadioButtonOn   className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <CheckboxControl data={data} onChange={onChange} locale={locale} type='radio' />
      }
    }
  }, [locale, advancedEdit])

  return { Radio }
}
