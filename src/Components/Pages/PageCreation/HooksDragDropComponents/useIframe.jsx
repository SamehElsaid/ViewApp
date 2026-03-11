import { useMemo } from 'react'
import { FaWindowRestore } from 'react-icons/fa6'
import { useIntl } from 'react-intl'

import IFrameRenderer from './IFrameRenderer'
import SelectIframe from '../SelectIframe'

export default function useIFrame({
  advancedEdit,
  locale,
  readOnly,
  buttonRef
}) {
  const { messages } = useIntl()

  const iFrame = useMemo(() => {
    return {
      /* ---------------- REQUIRED BY react-page ---------------- */
      id: 'iframe',
      version: 1,

      /* ---------------- Metadata ---------------- */
      title: messages?.dialogs?.iFrame || 'iFrame',
      description: messages?.dialogs?.iframeDescription || 'iFrame',

      /* ---------------- Renderer ---------------- */
      Renderer: ({ data }) => (
        <IFrameRenderer data={data} readOnly={readOnly} />
      ),

      /* ---------------- Controls ---------------- */
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <SelectIframe
            data={data}
            onChange={onChange}
            locale={locale}
            buttonRef={buttonRef}
            title={messages?.dialogs?.iFrame || 'iFrame'}
          />
        )
      },

      /* ---------------- Icon ---------------- */
      icon: <FaWindowRestore className="text-2xl" />
    }
  }, [advancedEdit, locale, readOnly, messages, buttonRef])

  return { iFrame }
}
