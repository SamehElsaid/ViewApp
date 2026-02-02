import { FormControl, MenuItem, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { axiosPost } from 'src/Components/axiosCall'

function SelectReportSection({ data, onChange }) {
  const { locale, messages } = useIntl()
  const [loading, setLoading] = useState(false)
  const [selectedDataNumeric, setSelectedDataNumeric] = useState([])
  const [selectedDataString, setSelectedDataString] = useState([])

  useEffect(() => {
    if (data.is_api_generated) {
      setLoading(true)
      axiosPost(`dynamic-report-data/get-collections-data-by-API-name`, locale, {
        reportAPIName: data.userReportName,
        pageSize: 0,
        pageNumber: 0
      })
        .then(res => {
          if (res.status) {
            const firstItem = res?.data?.result[0] || {}

            const getKeyOfNumericOnly = Object.keys(firstItem).filter(key => {
              return typeof firstItem[key] === 'number'
            })
            setSelectedDataNumeric(getKeyOfNumericOnly)

            const getKeyOfStringOnly = Object.keys(firstItem).filter(key => {
              return typeof firstItem[key] === 'string'
            })
            setSelectedDataString(getKeyOfStringOnly)
          }else{
            console.log('Failed to get data:', res.data);
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.is_api_generated, locale, data.reload])

  return (
    <div>
      <div className='mt-4 border border-gray-300 rounded-md p-3'>
        <div className='flex items-center justify-between mb-3'>
          <span className='font-semibold text-lg'>{messages?.viewValueInChart || 'View Value in Chart'}</span>
        </div>
        <FormControl fullWidth>
          <TextField
            select
            fullWidth
            value={data?.viewValueInChart || ''}
            label={messages?.selectValueInChart || 'Select Value in Chart'}
            variant='outlined'
            size='small'
            onChange={e => {
              onChange({
                ...data,
                viewValueInChart: e.target.value
              })
            }}
          >
            {selectedDataNumeric.map((row, index) => {
              const label = `${row}`

              const value = row

              return (
                <MenuItem key={index} value={value}>
                  {label}
                </MenuItem>
              )
            })}
          </TextField>
        </FormControl>
      </div>
      <div className='mt-4 border border-gray-300 rounded-md p-3'>
        <div className='flex items-center justify-between mb-3'>
          <span className='font-semibold text-lg'>{messages?.viewInputValue || 'View Input Value'}</span>
        </div>
        <FormControl fullWidth>
          <TextField
            select
            fullWidth
            value={data?.viewInputValue || ''}
            label={messages?.selectInputValue || 'Select Input Value'}
            variant='outlined'
            size='small'
            onChange={e => {
              onChange({
                ...data,
                viewInputValue: e.target.value
              })
            }}
          >
            {selectedDataString.map((row, index) => {
              const label = `${row}`

              const value = row

              return (
                <MenuItem key={index} value={value}>
                  {label}
                </MenuItem>
              )
            })}
          </TextField>
        </FormControl>
      </div>
    </div>
  )
}

export default SelectReportSection
