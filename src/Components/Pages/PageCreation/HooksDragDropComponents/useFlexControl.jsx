/* eslint-disable react-hooks/exhaustive-deps */
import { CiGrid42 } from 'react-icons/ci'
import FlexControl from '../FlexControl'
import { useEffect, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'

export default function useFlexControl({ locale, buttonRef }) {
  const { messages } = useIntl()

  const FlexControlCell = useMemo(() => {
    return {
      Renderer: ({ data, children }) => {
        const ref = useRef(null)
        useEffect(() => {
          const childrenView = data.childrenView ?? 'auto'
          if (!Array.isArray(children?.[0])) {
            const divContainer = ref.current.querySelector('div:nth-child(1)')
            if (divContainer) {
              divContainer.querySelectorAll('.react-page-cell').forEach(div => {
                div.style.width = 'fit-content'
                div.style.flexBasis = 'auto'
                div.classList.remove('react-page-cell-sm-6')
                div.classList.remove('react-page-cell-xs-12')
                div.classList.remove('react-page-cell-md-6')
              })

              divContainer.querySelectorAll('.react-page-row').forEach((div, index) => {
                // div.style.flex = 'inherit'
                // div.style.flexWrap = 'inherit'
                // if (index === 0) {
                //   div.style.cssText = `
                //   display: ${childrenView === 'auto' ? 'flex' : 'grid'};
                //   grid-template-columns: ${
                //     childrenView === 'auto' ? 'auto' : `repeat(${data.childrenView || 1}, minmax(0, 1fr))`
                //   };
                //   flex-direction: ${data.flexDirection || 'row'};
                //   // height: ${data.height + data.heightUnit || 'auto'};
                //   gap: ${data.gap + 'px' || '10px'};
                //   flex-wrap: ${data.flexWrap || 'nowrap'};
                //   justify-content: ${data.justifyContent || 'center'};
                //   align-items: ${data.alignItems || 'center'};
                //   `
                // }
              })
              divContainer.style.cssText = `
              display: ${childrenView === 'auto' ? 'flex' : 'grid'};
              grid-template-columns: ${
                childrenView === 'auto' ? 'auto' : `repeat(${data.childrenView || 1}, minmax(0, 1fr))`
              };
              flex-direction: ${data.flexDirection || 'row'};
              min-height: ${data.height + data.heightUnit || 'auto'};
              gap: ${data.gap + 'px' || '10px'};
              flex-wrap: ${data.flexWrap || 'nowrap'};
              justify-content: ${data.justifyContent || 'center'};
              align-items: ${data.alignItems || 'center'};
              `
            }
          }
        }, [children])

        return <div ref={ref}>{children}</div>
      },
      className: 'flex-control',
      id: 'flexControl',
      title: messages.dialogs.flexControl,
      description: messages.dialogs.flexControlDescription,
      version: 1,
      icon: <CiGrid42 className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <FlexControl data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { FlexControlCell }
}
