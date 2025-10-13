import { useMemo } from 'react'
import { FaTableCells } from 'react-icons/fa6'
import TableView from '../TableView'
import Select from '../Select'

export default function useTable({ advancedEdit, locale, readOnly, buttonRef,pageId }) {
  const table = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (

          <TableView
            readOnly={!advancedEdit}
            selectCollection={data.selectCollection}
            onChange={onChange}
            disabled={!readOnly}
            pageId={pageId}
            data={data}
          />
        )
      },
      id: locale === 'ar' ? 'جدول' : 'Table',
      title: locale === 'ar' ? 'جدول' : 'Table',
      description: locale === 'ar' ? 'يمكن عرض البيانات بشكل منظم في صفوف وأعمدة' : 'Displays structured data in rows and columns.',
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <Select title={locale === 'ar' ? 'جدول' : 'Table'} type='table' onChange={onChange} data={data} buttonRef={buttonRef} />
      },
      icon: <FaTableCells className='text-2xl' />
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedEdit, locale, readOnly,pageId])

  return { table }
}
