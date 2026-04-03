import { useMemo } from 'react'
import { MdOutlinePageview } from 'react-icons/md'
import { useIntl } from 'react-intl'
import CloseNav from '../CloseNav'


export default function useRenderPage({ locale, buttonRef, layoutComponent, FormType }) {
  const { messages } = useIntl()



  const renderPage = useMemo(() => {

    const textAr =
      'سيتم استبدال هذا المحتوى بصفحة حقيقية يتم تحميلها ديناميكياً. هذا المكان هو مجرد معاينة مؤقتة.'

    const textEn =
      'This area will be replaced by a real page loaded dynamically. It is just a temporary placeholder.'
    const description = locale === 'ar' ? textAr : textEn

    return {
      /* ---------------- REQUIRED BY react-page ---------------- */
      id: 'renderPage',
      version: 1,

      /* ---------------- Metadata ---------------- */
      title: messages?.dialogs?.renderPage || 'Render Page',
      description: description,
      hideInMenu: FormType === "layout" ? false : true,

      /* ---------------- Renderer ---------------- */
      Renderer: ({ data }) => (
        layoutComponent ? layoutComponent : <div className='flex justify-center items-center bg-main-color/20 h-[60vh]  w-full'>
          {<h1 className='text-2xl font-bold text-center'>{description}</h1>}
        </div>
      ),

      /* ---------------- Controls ---------------- */
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <>
            <CloseNav text={messages?.dialogs?.renderPage || 'Render Page'} buttonRef={buttonRef} />
            <></>
          </>
        )
      },

      /* ---------------- Icon ---------------- */
      icon: <MdOutlinePageview className="text-2xl" />
    }
  }, [locale, messages?.dialogs?.renderPage, layoutComponent, buttonRef, FormType])

  return { renderPage }
}
