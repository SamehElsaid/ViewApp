import React, { useMemo } from 'react'
import UpdateImage from '../UpdateImage'
import { CiVideoOn } from 'react-icons/ci'
import { useIntl } from 'react-intl'

export default function useUploadVideo({ locale, buttonRef }) {
  const { messages } = useIntl()
  
  const UploadVideo = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <>
          {data.video && (
            <video
              src={data.video.replace('/Uploads/', process.env.API_URL + '/file/download/')}
              alt='video'
              controls
              style={{
                width: data.imageWidth ? `${data.imageWidth}${data.imageWidthUnit || 'px'}` : '100%',
                height: data.imageHeight ? `${data.imageHeight}${data.imageHeightUnit || 'px'}` : 'auto',
                objectFit: data.objectFit || 'cover'
              }}
            />
          )}
        </>
      ),
      id: 'uploadVideo',
      title: messages.dialogs.uploadVideo,
      description: messages.dialogs.uploadVideoDescription,
      version: 1,
      icon: <CiVideoOn className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => {
          return <UpdateImage data={data} onChange={onChange} locale={locale} type='video' buttonRef={buttonRef} />
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { UploadVideo }
}
