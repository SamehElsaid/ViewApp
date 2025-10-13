import { useMemo } from 'react'
import { CiImageOn } from 'react-icons/ci'
import UpdateImage from '../UpdateImage'
import { useIntl } from 'react-intl'

export default function useUploadImage({ locale, buttonRef }) {
  const { messages } = useIntl()

  const UploadImage = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <>
          {data.image && (
            <img
              src={data.image.replace('/Uploads/', process.env.API_URL + '/file/download/')}
              alt='image'
              style={{
                width: data.imageWidth ? `${data.imageWidth}${data.imageWidthUnit || 'px'}` : '100%',
                height: data.imageHeight ? `${data.imageHeight}${data.imageHeightUnit || 'px'}` : 'auto',
                objectFit: data.objectFit || 'cover'
              }}
            />
          )}
        </>
      ),
      id: 'uploadImage',
      title: messages.useUploadImage.image,
      description: messages.useUploadImage.uploadImageDescription,
      version: 1,
      icon: <CiImageOn className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => {
          return <UpdateImage data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { UploadImage }
}
