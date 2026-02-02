import { useMemo, useEffect } from 'react'
import { MdOutlineColorLens } from 'react-icons/md'
import Background from '../Background'  
import { useIntl } from 'react-intl'

// Component to apply background styles to body
const BackgroundRenderer = ({ data, children }) => {
  // Apply background styles to body and html elements
  useEffect(() => {
    if (data && typeof document !== 'undefined') {
      const body = document.body
      const html = document.documentElement
      
      // Apply background position and other background properties to body
      if (data.backgroundPosition) {
        body.style.backgroundPosition = data.backgroundPosition
        html.style.backgroundPosition = data.backgroundPosition
      }
      
      if (data.backgroundImage) {
        const imageUrl = data.backgroundImage.replace('/Uploads/', process.env.API_URL + '/file/download/')
        body.style.backgroundImage = `url(${imageUrl})`
        html.style.backgroundImage = `url(${imageUrl})`
      } else {
        body.style.backgroundImage = 'none'
        html.style.backgroundImage = 'none'
      }
      
      if (data.backgroundSize) {
        body.style.backgroundSize = data.backgroundSize
        html.style.backgroundSize = data.backgroundSize
      }
      
      if (data.backgroundRepeat) {
        body.style.backgroundRepeat = data.backgroundRepeat
        html.style.backgroundRepeat = data.backgroundRepeat
      }
      
      if (data.backgroundAttachment) {
        body.style.backgroundAttachment = data.backgroundAttachment
        html.style.backgroundAttachment = data.backgroundAttachment
      }
      
      if (data.backgroundColor) {
        body.style.backgroundColor = data.backgroundColor
        html.style.backgroundColor = data.backgroundColor
      }
      
      // Cleanup function to reset styles when component unmounts or data changes
      return () => {
        body.style.backgroundPosition = ''
        body.style.backgroundImage = ''
        body.style.backgroundSize = ''
        body.style.backgroundRepeat = ''
        body.style.backgroundAttachment = ''
        body.style.backgroundColor = ''
        html.style.backgroundPosition = ''
        html.style.backgroundImage = ''
        html.style.backgroundSize = ''
        html.style.backgroundRepeat = ''
        html.style.backgroundAttachment = ''
        html.style.backgroundColor = ''
      }
    }
  }, [data])
  
  return (
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
  )
}

export default function useBackground({ locale, buttonRef }) {
  const { messages } = useIntl()
  
  const backgroundPlugin = useMemo(() => {
    return {
      Renderer: BackgroundRenderer,
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
