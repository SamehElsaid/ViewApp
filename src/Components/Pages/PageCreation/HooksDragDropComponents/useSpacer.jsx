import { useMemo } from 'react'
import { TbSpace } from 'react-icons/tb'
import CloseNav from '../CloseNav'
import { useIntl } from 'react-intl'
import { TextField } from '@mui/material'

export default function useSpacer({ locale, buttonRef }) {
  const { messages } = useIntl()
  
  const spacer = useMemo(() => {
    return {
      Renderer: ({ data }) => (
        <div
          style={{
            height: data?.height ? `${data.height}px` : '20px',
            width: '100%',
            backgroundColor: data?.backgroundColor || 'transparent',
            border: data?.showBorder ? `1px dashed ${data?.borderColor || '#ccc'}` : 'none'
          }}
        />
      ),
      id: 'spacer',
      title: messages.dialogs.spacer || 'Spacer',
      description: messages.dialogs.spacerDescription || 'Add vertical spacing between elements',
      version: 1,
      icon: <TbSpace className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <>
            <CloseNav text={messages.dialogs.spacer || 'Spacer'} buttonRef={buttonRef} />
            <TextField
              fullWidth
              type='number'
              value={data?.height || 20}
              onChange={e => onChange({ ...data, height: parseInt(e.target.value) || 20 })}
              variant='filled'
              label={messages.dialogs.height || 'Height (px)'}
            />
         
          </>
        )
      }
    }
  }, [buttonRef, messages])

  return { spacer }
}
