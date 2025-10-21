import { TextField } from '@mui/material'
import { useMemo } from 'react'
import { TbContainer } from 'react-icons/tb'
import CloseNav from '../CloseNav'
import { useIntl } from 'react-intl'

export default function useContainer({ locale, buttonRef }) {
  const { messages } = useIntl()
  
  const ContainerPlugin = useMemo(() => {
    return {
      Renderer: ({ data, children }) => (
        <div
          style={{
            padding: `${data.paddingStart ?? 0}px ${data.paddingEnd ?? 0}px ${data.paddingTop ?? 0}px ${
              data.paddingBottom ?? 0
            }px`
          }}
          className='container'
        >
          {children}
        </div>
      ),
      id: 'containerPlugin',
      title: messages.dialogs.container,
      description: messages.dialogs.containerDescription,
      version: 1,
      icon: <TbContainer className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <>
            <CloseNav text={messages.dialogs.container} buttonRef={buttonRef} />
            <TextField
              fullWidth
              type='text'
              value={data.paddingStart}
              onChange={e => onChange({ ...data, paddingStart: e.target.value })}
              variant='filled'
              label={messages.dialogs.paddingStart}
            />

            <TextField
              fullWidth
              type='text'
              value={data.paddingEnd}
              onChange={e => onChange({ ...data, paddingEnd: e.target.value })}
              variant='filled'
              label={messages.dialogs.paddingEnd}
            />
            <TextField
              fullWidth
              type='text'
              value={data.paddingTop}
              onChange={e => onChange({ ...data, paddingTop: e.target.value })}
              variant='filled'
              label={messages.dialogs.paddingTop}
            />
            <TextField
              fullWidth
              type='text'
              value={data.paddingBottom}
              onChange={e => onChange({ ...data, paddingBottom: e.target.value })}
              variant='filled'
              label={messages.dialogs.paddingBottom}
            />
          </>
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { ContainerPlugin }
}
