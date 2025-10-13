import { useMemo } from 'react'
import { GiClick } from 'react-icons/gi'
import ViewInputInFormEngine from '../ViewInputInFormEngine'
import CheckboxControl from '../CheckboxControl'
import { IoIosArrowDown, IoIosCheckboxOutline, IoMdRadioButtonOn } from 'react-icons/io'

export default function useSelect({ locale, advancedEdit }) {
  const Select = useMemo(() => {
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
              type='select'
            />
          </>
        )
      },
      id: 'select',
      title: locale === 'ar' ? 'قائمة الاختيار السفلية' : 'Dropdown',
      description: locale === 'ar' ? 'قائمة الاختيار السفلية' : 'Dropdown',
      version: 1,
      icon: <IoIosArrowDown className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <CheckboxControl data={data} onChange={onChange} locale={locale} type='select' />
        )
      }
    }
  }, [locale, advancedEdit])

  return { Select }
}
