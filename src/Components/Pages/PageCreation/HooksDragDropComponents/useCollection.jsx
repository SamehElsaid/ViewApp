import { FaWpforms } from 'react-icons/fa6'
import { useMemo } from 'react'
import Select from '../Select'
import ViewCollection from '../ViewCollection'

export default function useCollection({
  advancedEdit,
  locale,
  readOnly,
  buttonRef,
  workflowId,
  pageId,
  entitiesId,
  collectionName,
  pageName
}) {
  const collection = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <ViewCollection
            data={data}
            locale={locale}
            onChange={onChange}
            readOnly={!advancedEdit}
            disabled={!readOnly}
            workflowId={workflowId}
            pageId={pageId}
            entitiesId={entitiesId}
            collectionName={collectionName}
            pageName={pageName}
          />
        )
      },
      id: 'collection',
      title: locale === 'ar' ? 'مدخل البيانات' : 'Form Input',
      description:
        locale === 'ar'
          ? 'يمكن أن يحتوي المدخل على نص أو أرقام أو بيانات أخرى'
          : 'A field for users to enter text, numbers, or other data in forms.',
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <Select
            title={locale === 'ar' ? 'مدخل البيانات' : 'Form Input'}
            onChange={onChange}
            data={data}
            buttonRef={buttonRef}
          />
        )
      },
      icon: <FaWpforms className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, advancedEdit, readOnly])

  return { collection }
}
