import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { CiImageOn } from 'react-icons/ci'
import UpdateImage from '../UpdateImage'
import { useIntl } from 'react-intl'

export default function useUploadImage({ locale, buttonRef }) {
  const { messages } = useIntl()

  const UploadImage = useMemo(() => {
    return {
      Renderer: ({ data, children }) => {
        const apiData = useSelector(state => state.api.data)

        const resolveValue = () => {
          const cond = data?.visibilityCondition
          if (!cond || cond?.enabled !== true) return null
          if (cond.source === 'api') {
            const link = data?.api_url || cond.api_url
            if (!link) return null
            const found = Array.isArray(apiData) ? apiData.find(item => item.link === link) : null
            const obj = found?.data
            if (!obj || !cond.key) return null
            try {
              // simple dot path resolution
              return cond.key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj)
            } catch (_) {
              return null
            }
          }
          if (cond.source === 'query') {
            if (typeof window === 'undefined') return null
            const params = new URLSearchParams(window.location.search)

            return params.get(cond.key || '')
          }

          return null
        }

        const evaluate = (left, operator, right) => {
          // convert numerics if possible
          const numLeft = Number(left)
          const numRight = Number(right)
          const canNum = !Number.isNaN(numLeft) && !Number.isNaN(numRight)
          const l = canNum ? numLeft : (left ?? '').toString()
          const r = canNum ? numRight : (right ?? '').toString()

          switch (operator) {
            case '==':
              return l == r
            case '!=':
              return l != r
            case '>':
              return canNum ? numLeft > numRight : l > r
            case '<':
              return canNum ? numLeft < numRight : l < r
            case '>=':
              return canNum ? numLeft >= numRight : l >= r
            case '<=':
              return canNum ? numLeft <= numRight : l <= r
            case 'contains':
              return (l || '').toString().includes((r || '').toString())
            default:
              return false
          }
        }

        const isConditionTrue = (() => {
          const cond = data?.visibilityCondition
          if (!cond || cond?.enabled !== true) return null
          const left = resolveValue()

          return evaluate(left, cond.operator || '==', cond.value ?? '')
        })()

        const shouldHideByCondition = (() => {
          const cond = data?.visibilityCondition
          if (!cond || cond?.enabled !== true || isConditionTrue === null) return false
          const behavior = cond.behavior || 'showWhenTrue'
          if (behavior === 'hideWhenTrue') return isConditionTrue === true

          return isConditionTrue === false
        })()

        const displayStyle = shouldHideByCondition ? 'none' : 'block'

        return (
          <>
            {data.image ? (
              <img
                src={process.env.API_URL + "/file/download/" + data.image}
                alt='image'
                style={{
                  display: displayStyle,
                  width: data.imageWidth ? `${data.imageWidth}${data.imageWidthUnit || 'px'}` : '100%',
                  height: data.imageHeight ? `${data.imageHeight}${data.imageHeightUnit || 'px'}` : 'auto',
                  objectFit: data.objectFit || 'cover',
                  margin: data.textAlign === 'right' ? '0 0 0 auto' : data.textAlign === 'left' ? '0 auto 0 0' : 'auto'
                }}
              />
            ) :
              <p>No image</p>
            }
          </>
        )
      },
      id: 'uploadImage',
      title: messages.useUploadImage?.image || (locale === 'ar' ? 'صورة' : 'Image'),
      description:
        messages.useUploadImage?.uploadImageDescription ||
        (locale === 'ar' ? 'عرض الصور أو الأيقونات أو الرسومات.' : 'Display photos, icons, or illustrations.'),
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
