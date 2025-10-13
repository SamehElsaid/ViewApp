import { useMemo } from 'react'
import { GiClick } from 'react-icons/gi'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import CheckboxControl from '../CheckboxControl'
import { IoIosCheckboxOutline } from 'react-icons/io'

export default function useCheckbox({ locale, advancedEdit  }) {
  const Checkbox = useMemo(() => {
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
            <ViewInputInFormEngine data={data} advancedEdit={advancedEdit} locale={locale} defaultValue={defaultValue} onChange={onChange} type='checkbox'/>
          </>
        )
      },
      id: 'checkbox',
      title: locale === 'ar' ? 'خانة الاختيار' : 'Checkbox',
      description: locale === 'ar' ? 'خانة الاختيار' : 'Checkbox',
      version: 1,
      icon: <IoIosCheckboxOutline  className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <CheckboxControl data={data} onChange={onChange} locale={locale} type='checkbox' />
      }
    }
  }, [locale, advancedEdit])

  return { Checkbox }
}
