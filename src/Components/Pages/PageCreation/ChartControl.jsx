import React, { useEffect, useState } from 'react'
import { Button, CircularProgress, InputAdornment, MenuItem, Select, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import Collapse from '@kunukn/react-collapse'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import FlexControl from './FlexControl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'

function ChartControl({ data, onChange, type, buttonRef }) {
  const { locale, messages } = useIntl()
  const [items, setItems] = useState(data.newItems || [])
  const getApiData = useSelector(rx => rx.api.data)

  const [loading, setLoading] = useState(false)
  const [obj, setObj] = useState(false)

  useEffect(() => {
    if (data.api_url) {
      const items = getApiData.find(item => item.link === data.api_url)?.data
      onChange({ ...data, items: data.api_url })
      if (items[0]) {
        setObj(items[0])
      }
    } else {
      setObj(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.api_url, getApiData])

  return (
    <div>
      <CloseNav text={messages.useChart.title} buttonRef={buttonRef} />
      {/* Href Section */}
      {loading ? (
        <div className='flex justify-center items-center h-full min-h-[400px]'>
          <CircularProgress className='!text-main-color' />
        </div>
      ) : (
        <>
          <div className='p-2 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages.card.api}</h2>
            <TextField
              select
              fullWidth
              value={data.api_url || ''}
              onChange={e => onChange({ ...data, api_url: e.target.value, items: [] })}
              label={messages.card.api}
              variant='filled'
            >
              {getApiData.map(
                ({ link, data }, index) =>
                  typeof data?.[0] === 'object' && (
                    <MenuItem key={link + index} value={link}>
                      {link}
                    </MenuItem>
                  )
              )}
            </TextField>
            <div className='flex justify-center'>
              <Button
                className='!mt-4'
                variant='contained'
                color='error'
                onClick={() => {
                  setObj(false)
                  onChange({ ...data, api_url: '' })
                }}
              >
                {messages.card.clearData}
              </Button>
            </div>
          </div>

          <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
            <div className='p-2 my-4 rounded border border-dashed border-main-color'>
              <h2 className='mb-4 text-2xl text-main-color'>{messages.card.viewObject}</h2>
              <SyntaxHighlighter language='json' style={docco}>
                {JSON.stringify(obj, null, 2)}
              </SyntaxHighlighter>
            </div>
          </Collapse>

          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(!obj)}>
              <div className='flex flex-wrap gap-1 justify-between mb-4'>
                <h2 className='text-2xl text-main-color'>{messages.useChart.addItem}</h2>
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => {
                    const dataOld = data.itemsValue || []
                    onChange({ ...data, itemsValue: [...dataOld, { value: '', label: '', color: '' }] })
                  }}
                >
                  {messages.useChart.addItem}
                </Button>
              </div>
            </Collapse>
            {obj ? (
              <>
                <TextField
                  label={messages.useChart.value}
                  value={data.value}
                  variant='filled'
                  fullWidth
                  onChange={e => {
                    onChange({ ...data, value: e.target.value })
                  }}
                />
                <TextField
                  label={messages.useChart.label}
                  value={data.label}
                  variant='filled'
                  fullWidth
                  onChange={e => {
                    onChange({ ...data, label: e.target.value })
                  }}
                />
                <TextField
                  label={messages.useChart.color}
                  value={data.color}
                  variant='filled'
                  fullWidth
                  onChange={e => {
                    onChange({ ...data, color: e.target.value })
                  }}
                />
              </>
            ) : (
              data.itemsValue?.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-col gap-2 p-4 mt-4 rounded border border-dashed border-main-color'
                >
                  <div className='flex justify-end'>
                    <button
                      variant='contained'
                      size='small'
                      className='bg-red-500 text-white w-[30px] h-[30px] rounded-full hover:bg-red-600 transition-all duration-300 flex items-center justify-center'
                      onClick={() => {
                        onChange({ ...data, itemsValue: data.itemsValue.filter((_, i) => i !== index) })
                      }}
                    >
                      x
                    </button>
                  </div>
                  <TextField
                    label={messages.useChart.value}
                    value={item.value}
                    variant='filled'
                    fullWidth
                    onChange={e => {
                      const valueNumber = e.target.value.replace(/[^0-9]/g, '')
                      const newItems = [...data.itemsValue]
                      newItems[index].value = valueNumber
                      onChange({ ...data, itemsValue: newItems })
                    }}
                  />
                  <TextField
                    label={messages.useChart.label}
                    value={item.label}
                    fullWidth
                    variant='filled'
                    onChange={e => {
                      const newItems = [...data.itemsValue]
                      newItems[index].label = e.target.value
                      onChange({ ...data, itemsValue: newItems })
                    }}
                  />
                  <TextField
                    label={messages.useChart.color}
                    value={item.color}
                    fullWidth
                    type='color'
                    variant='filled'
                    onChange={e => {
                      const newItems = [...data.itemsValue]
                      newItems[index].color = e.target.value
                      onChange({ ...data, itemsValue: newItems })
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ChartControl
