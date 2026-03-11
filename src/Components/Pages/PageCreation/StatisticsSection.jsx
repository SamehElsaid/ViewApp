import { TextField, IconButton, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { axiosPost } from 'src/Components/axiosCall'
import { MdEdit, MdCheck, MdClose } from 'react-icons/md'
import { Icon } from '@iconify/react'

function StatisticsSection({ data, onChange }) {
  const { locale, messages } = useIntl()
  const [loading, setLoading] = useState(false)
  const [apiData, setApiData] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [editForm, setEditForm] = useState({ icon: 'mdi:chart-bar', color: 'blue' })
  const [localStatisticsValues, setLocalStatisticsValues] = useState([])

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
            // تحويل البيانات من API إلى array من objects
            const result = res?.data?.result

            if (Array.isArray(result)) {
              setApiData(result)


              // تهيئة statisticsValues محلياً فقط بدون حفظ
              if (!data.statisticsValues || data.statisticsValues.length === 0) {
                const initialValues = result.map(item => {
                  const key = Object.keys(item)[0]
                  const value = item[key]

                  return {
                    key: key,
                    value: value,
                    icon: data.statisticsIcon || 'mdi:chart-bar',
                    color: data.statisticsColor || 'blue'
                  }
                })
                setLocalStatisticsValues(initialValues)
              } else {
                setLocalStatisticsValues(data.statisticsValues)
              }
            } else if (result && typeof result === 'object') {
              // إذا كانت البيانات object وليست array
              const dataArray = Object.entries(result).map(([key, value]) => ({ [key]: value }))
              setApiData(dataArray)
              if (!data.statisticsValues || data.statisticsValues.length === 0) {
                const initialValues = Object.entries(result).map(([key, value]) => ({
                  key: key,
                  value: value,
                  icon: data.statisticsIcon || 'mdi:chart-bar',
                  color: data.statisticsColor || 'blue'
                }))
                setLocalStatisticsValues(initialValues)
              } else {
                setLocalStatisticsValues(data.statisticsValues)
              }
            }
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.is_api_generated, locale, data.reload])

  // تهيئة البيانات المحلية من data.statisticsValues إذا كانت موجودة ولم يتم تحميلها من API
  useEffect(() => {
    if (data.statisticsValues && data.statisticsValues.length > 0 && localStatisticsValues.length === 0 && !loading) {
      setLocalStatisticsValues(data.statisticsValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.statisticsValues, loading])

  const statisticsValues = localStatisticsValues.length > 0 ? localStatisticsValues : data?.statisticsValues || []

  const handleSaveAll = () => {
    
    onChange({
      ...data,
      statisticsValues: localStatisticsValues,
      reload: data?.reload || 0 + 1
    })
  }

  const handleEdit = index => {
    const item = statisticsValues[index]
    setEditForm({
      icon: item.icon || '',
      color: item.color || '#0ea5e9'
    })
    setEditingIndex(index)

  }

  const handleSaveEdit = () => {
    if (editingIndex === null) return
    if (!editForm.icon || !editForm.color) return

    const updatedValues = [...localStatisticsValues]
    updatedValues[editingIndex] = {
      ...updatedValues[editingIndex],
      icon: editForm.icon,
      color: editForm.color
    }

    setLocalStatisticsValues(updatedValues)
    setEditingIndex(null)
    setEditForm({ icon: 'mdi:chart-bar', color: 'blue' })

    const reload = data?.reload || 0 
    onChange({
      ...data,
      statisticsValues: updatedValues,
      reload: reload + 1
    })
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditForm({ icon: 'mdi:chart-bar', color: 'blue' })
  }

  return (
    <div>
      <div className='mt-4 border border-gray-300 rounded-md p-3'>
        <div className='flex items-center justify-between mb-3'>
          <span className='font-semibold text-lg'>{messages?.statisticsValues || 'Statistics Values'}</span>
        
        </div>

        {loading && (
          <div className='text-center py-4'>
            <span>{messages?.loading || 'Loading...'}</span>
          </div>
        )}


        {/* Display API data as readonly inputs */}
        {!loading && statisticsValues.length > 0 && (
          <div className='mt-4'>
            <div className='flex flex-col gap-3'>
              {statisticsValues.map((item, index) => (
                <div key={index} className='bg-gray-100 border border-gray-300 rounded-md p-3'>
                  {editingIndex === index ? (
                    <div className='flex flex-col gap-3'>
                      {/* Readonly Key and Value inputs */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        <TextField
                          fullWidth
                          size='small'
                          variant='outlined'
                          label={messages?.key || 'Key'}
                          value={item.key || ''}
                          InputProps={{
                            readOnly: true
                          }}
                        />
                        <TextField
                          fullWidth
                          size='small'
                          variant='outlined'
                          label={messages?.value || 'Value'}
                          value={item.value || ''}
                          InputProps={{
                            readOnly: true
                          }}
                        />
                      </div>
                      {/* Editable Icon & Color inputs */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        <TextField
                          fullWidth
                          size='small'
                          variant='outlined'
                          required
                          label={messages?.selectIcon || 'Select Icon'}
                          placeholder='ex: mdi:chart-bar'
                          value={editForm.icon}
                          onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                          helperText={
                            <span className='text-xs'>
                              {messages?.browseIcons || 'Browse icons'}:{' '}
                              <a
                                href='https://icon-sets.iconify.design/'
                                target='_blank'
                                rel='noreferrer'
                                className='text-blue-600 underline'
                              >
                                icon-sets.iconify.design
                              </a>
                            </span>
                          }
                        />
                        <TextField
                          fullWidth
                          size='small'
                          variant='outlined'
                          required
                          label={messages?.selectColor || 'Select Color'}
                          type='color'
                          value={editForm.color}
                          onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </div>
                      <div className='flex gap-2 justify-end'>
                        <IconButton
                          size='small'
                          color='success'
                          onClick={handleSaveEdit}
                          disabled={!editForm.icon || !editForm.color}
                        >
                          <MdCheck />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={handleCancelEdit}>
                          <MdClose />
                        </IconButton>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        {item.icon && (
                          <div className='flex items-center justify-center' style={{ color: item.color || '#0ea5e9' }}>
                            <Icon icon={item.icon} fontSize={24} />
                          </div>
                        )}
                        {item.color && !item.icon && (
                          <div className='w-6 h-6 rounded' style={{ backgroundColor: item.color }} />
                        )}
                        <div className='grid grid-cols-2 gap-3 flex-1'>
                          <TextField
                            fullWidth
                            size='small'
                            variant='outlined'
                            label={messages?.key || 'Key'}
                            value={item.key || ''}
                            InputProps={{
                              readOnly: true
                            }}
                          />
                          <TextField
                            fullWidth
                            size='small'
                            variant='outlined'
                            label={messages?.value || 'Value'}
                            value={item.value || ''}
                            InputProps={{
                              readOnly: true
                            }}
                          />
                        </div>
                      </div>
                      <div className='flex gap-1 ml-3'>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(index)}>
                          <MdEdit />
                        </IconButton>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && statisticsValues.length === 0 && (
          <div className='text-center py-4 text-gray-500'>
            <span>{messages?.notFound || 'No data available'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsSection
