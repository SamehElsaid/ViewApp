import { useMemo } from 'react'
import { MdOutlinePageview } from 'react-icons/md'
import { useIntl } from 'react-intl'
import CloseNav from '../CloseNav'


export default function useRenderPrint({ locale, buttonRef, FormType }) {
  const { messages } = useIntl()


  const renderPrint = useMemo(() => {

    const textAr =
      'سيتم استبدال هذا المحتوى بصفحة حقيقية يتم تحميلها ديناميكياً. هذا المكان هو مجرد معاينة مؤقتة.'

    const textEn =
      'This area will be replaced by a real page loaded dynamically. It is just a temporary placeholder.'
    const description = locale === 'ar' ? textAr : textEn

    return {
      /* ---------------- REQUIRED BY react-page ---------------- */
      id: 'renderPrint',
      version: 1,

      /* ---------------- Metadata ---------------- */
      title: messages?.dialogs?.renderPrint || 'Render Print',
      description: description,
      hideInMenu: FormType === "print" ? false : true,

      /* ---------------- Renderer ---------------- */
      Renderer: ({ data }) => (
        <div className='flex justify-center items-center bg-main-color/20 h-[60vh]  w-full'>
          {<h1 className='text-2xl font-bold text-center'>{description}</h1>}
        </div>
      ),

      /* ---------------- Controls ---------------- */
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <>
            <CloseNav text={messages?.dialogs?.renderPrint || 'Render Print'} buttonRef={buttonRef} />
            <></>
          </>
        )
      },

      /* ---------------- Icon ---------------- */
      icon: <MdOutlinePageview className="text-2xl" />
    }
  }, [locale, messages?.dialogs?.renderPrint, buttonRef, FormType])

  return { renderPrint }
}
