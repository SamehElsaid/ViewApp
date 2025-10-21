import { useMemo } from 'react'
import { MdOutlineColorLens } from 'react-icons/md'
import Background from '../Background'  
import { useIntl } from 'react-intl'

export default function useBackground({ locale, buttonRef }) {
  const { messages } = useIntl()
  
  const backgroundPlugin = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <div
          className='flex justify-center items-center background-container'
          style={{
            backgroundColor: data.backgroundColor || 'transparent',
            backgroundImage: data.backgroundImage
              ? `url(${data.backgroundImage.replace('/Uploads/', process.env.API_URL + '/file/download/')})`
              : 'none',
            backgroundSize: data.backgroundSize || 'cover',
            backgroundPosition: data.backgroundPosition || 'center',
            backgroundAttachment: data.backgroundAttachment || 'scroll',
            backgroundRepeat: data.backgroundRepeat || 'no-repeat',
            minHeight: data.backgroundHeight ? `${data.backgroundHeight}${data.backgroundHeightUnit || 'px'}` : 'auto',
            width: data.backgroundWidth ? `${data.backgroundWidth}${data.backgroundWidthUnit || 'px'}` : '100%',
            margin:
              data.backgroundAlignment === 'start'
                ? '0 auto 0 0'
                : data.backgroundAlignment === 'end'
                ? '0 0 0 auto'
                : 'auto'
          }}
        >
          <div className='w-[100%] h-fit'>{children}</div>
        </div>
      ),
      id: 'backgroundPlugin',
      title: messages.dialogs.background,
      description: messages.dialogs.backgroundDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => <Background data={data} onChange={onChange} buttonRef={buttonRef} />
      },
      icon: <MdOutlineColorLens className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { backgroundPlugin }
}
