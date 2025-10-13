import React, { useMemo } from 'react'
import UpdateImage from '../UpdateImage'
import { CiVideoOn } from 'react-icons/ci'

export default function useUploadVideo({ locale, buttonRef }) {
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
      title: locale === 'ar' ? 'فيديو' : ' Video',
      description: locale === 'ar' ? 'مشغل فيديو لعرض محتوى الوسائط': ' Video player to showcase media content',
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
