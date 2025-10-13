import { useMemo } from 'react'
import { IoMdResize } from 'react-icons/io'
import FlexBoxControl from '../FlexBoxControl'

export default function useBox({ locale, buttonRef }) {
  const BoxControl = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <div
          style={{
            height: data.backgroundHeight ? `${data.backgroundHeight}${data.backgroundHeightUnit || 'px'}` : 'auto',
            width: data.backgroundWidth ? `${data.backgroundWidth}${data.backgroundWidthUnit || 'px'}` : '100%'
          }}
        >
          {children}
        </div>
      ),
      id: 'boxControl',
      title: locale === 'ar' ? 'محتوى' : 'Box',
      description: locale === 'ar' ? 'يمكن أن يحتوي المحتوى على نص أو صور أو عناصر أخرى' : 'A structured content block that can hold text, images, or other elements',
      version: 1,
      icon: <IoMdResize className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <FlexBoxControl data={data} onChange={onChange} buttonRef={buttonRef} />
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { BoxControl }
}
