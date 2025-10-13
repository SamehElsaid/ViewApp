import { Icon } from '@iconify/react'
import { MenuItem, TextField } from '@mui/material'
import { useMemo } from 'react'
import { TfiThemifyFavicon } from 'react-icons/tfi'
import CloseNav from '../CloseNav'
import { useIntl } from 'react-intl'

export default function useIconView({ locale, buttonRef }) {
  const { messages } = useIntl()

  const IconView = useMemo(() => {
    return {
      Renderer: ({ data }) => {
        return (
          <div
            style={{
              width: data?.width ? data?.width + (data?.widthUnit ?? 'px') : '30px',
              height: data?.height ? data?.height + (data?.heightUnit ?? 'px') : '30px',
              borderRadius: data?.borderRadius ? data?.borderRadius + (data?.borderRadiusUnit ?? 'px') : '0px',
              backgroundColor: data?.backgroundColor,
              marginBottom: data?.marginBottom ? data?.marginBottom + (data?.marginBottomUnit ?? 'px') : '0px'
            }}
            className='flex justify-center items-center'
          >
            <Icon
              style={{
                color: data?.color,
                fontSize: data?.fontSize ? data?.fontSize + (data?.fontSizeUnit ?? 'px') : '30px',
                fontWeight: data?.fontWeight,
                fontFamily: data?.fontFamily
              }}
              icon={data?.text_en ? data?.text_en : 'ph:binary-duotone'}
            />
          </div>
        )
      },
      id: 'Icon',
      title: messages.useIconView.icon,
      description: messages.useIconView.iconDescription,
      version: 1,
      icon: <TfiThemifyFavicon   className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <div>
            <CloseNav text={messages.useIconView.icon} buttonRef={buttonRef} />
            <TextField
              fullWidth
              type='text'
              value={data.text_en}
              onChange={e => onChange({ ...data, text_en: e.target.value })}
              variant='filled'
              label={messages.useIconView.icon}
            />
            <a
              href='https://iconify.design/icon-sets/ph/'
              target='_blank'
              className='my-1 text-sm underline text-main-color'
            >
              {messages.useIconView.iconFromHere}
            </a>
            <TextField
              fullWidth
              type='text'
              value={data.width}
              onChange={e => onChange({ ...data, width: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconWidth}
            />
            <TextField
              fullWidth
              type='text'
              value={data.height}
              onChange={e => onChange({ ...data, height: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconHeight}
            />
            <TextField
              fullWidth
              type='text'
              value={data.borderRadius}
              onChange={e => onChange({ ...data, borderRadius: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconBorderRadius}
            />
            <TextField
              fullWidth
              type='color'
              value={data.color}
              onChange={e => onChange({ ...data, color: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconColor}
            />
            <TextField
              fullWidth
              type='color'
              value={data.backgroundColor}
              onChange={e => onChange({ ...data, backgroundColor: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconBackgroundColor}
            />
            <TextField
              fullWidth
              type='text'
              value={data.fontSize}
              onChange={e => onChange({ ...data, fontSize: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconFontSize}
            />
            <TextField
              fullWidth
              type='text'
              value={data.fontWeight}
              onChange={e => onChange({ ...data, fontWeight: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconFontWeight}
              select
            >
              <MenuItem value='100'>100</MenuItem>
              <MenuItem value='200'>200</MenuItem>
              <MenuItem value='300'>300</MenuItem>
              <MenuItem value='400'>400</MenuItem>
              <MenuItem value='500'>500</MenuItem>
              <MenuItem value='600'>600</MenuItem>
              <MenuItem value='700'>700</MenuItem>
              <MenuItem value='800'>800</MenuItem>
              <MenuItem value='900'>900</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type='text'
              value={data.marginBottom}
              onChange={e => onChange({ ...data, marginBottom: e.target.value })}
              variant='filled'
              label={messages.useIconView.iconMarginBottom}
            />
          </div>
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return {IconView}
}
