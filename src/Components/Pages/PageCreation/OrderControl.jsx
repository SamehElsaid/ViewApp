import React from 'react'
import CloseNav from './CloseNav'
import { MenuItem, TextField } from '@mui/material'
import ButtonControl from './ButtonControl'
import { useIntl } from 'react-intl'

function OrderControl({ locale, buttonRef, data, onChange }) {
  const { messages } = useIntl()

  const optionsList = [
    { value: 'order', label: messages.dialogs.orderList },
    { value: 'unordered', label: messages.dialogs.unorderedList }
  ]

  return (
    <div>
      <CloseNav text={messages.dialogs.orderList} buttonRef={buttonRef} />
      <TextField
        select
        fullWidth
        value={data['kind'] || optionsList[0].value}
        onChange={e => onChange({ ...data, ['kind']: e.target.value })}
        label={messages.dialogs.orderKind}
        variant='filled'
      >
        {optionsList.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <ButtonControl type='order' data={data} onChange={onChange} buttonRef={buttonRef} />

      <p>
        {messages.dialogs.toControlTheListCompletely} {messages.dialogs.goToTheEditMode}
      </p>
    </div>
  )
}

export default OrderControl
