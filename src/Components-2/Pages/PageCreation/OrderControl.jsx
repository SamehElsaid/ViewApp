import React from 'react'
import CloseNav from './CloseNav'
import { MenuItem, TextField } from '@mui/material'
import ButtonControl from './ButtonControl'

function OrderControl({ locale, buttonRef, data, onChange }) {
  const optionsList = [
    { value: 'order', label: 'Order List' },
    { value: 'unordered', label: 'Unordered List' }
  ]

  return (
    <div>
      <CloseNav text={locale === 'ar' ? 'قائمة الطلبات' : 'Order list'} buttonRef={buttonRef} />
      <TextField
        select
        fullWidth
        value={data['kind'] || optionsList[0].value}
        onChange={e => onChange({ ...data, ['kind']: e.target.value })}
        label={locale === 'ar' ? 'نوع الطلبات' : 'Order kind'}
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
        {locale === 'ar'
          ? 'لتحكم كامل في القائمة اذهب الي وضع التعديلات'
          : 'To control the list completely, go to the edit mode'}
      </p>
    </div>
  )
}

export default OrderControl
