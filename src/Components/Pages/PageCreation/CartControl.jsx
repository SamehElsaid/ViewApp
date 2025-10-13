import React, { useEffect, useState } from 'react'
import { Button, CircularProgress, InputAdornment, MenuItem, Select, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { Icon } from '@iconify/react'
import Collapse from '@kunukn/react-collapse'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import FlexControl from './FlexControl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'

function CartControl({ data, onChange, type, buttonRef }) {
  const { locale, messages } = useIntl()
  const [items, setItems] = useState(data.newItems || [])
  const getApiData = useSelector(rx => rx.api.data)

  const handleFileUpload = (event, index) => {
    const file = event.target.files[0]
    if (file) {
      const blob = new Blob([file], { type: file.type })
      const blobUrl = URL.createObjectURL(blob)
      if (type === 'video') {
        onChange({ ...data, video: blobUrl })
      } else {
        if (index) {
          const updatedItems = [...items]
          updatedItems[index].image = blobUrl
          setItems(updatedItems)
          onChange({ ...data, items: updatedItems })
        } else {
          onChange({ ...data, image: blobUrl })
        }
      }
    }
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        type: 'text',
        value: {},
        text_ar: '',
        text_en: '',
        color: '#000',
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Arial',
        backgroundColor: 'transparent',
        marginBottom: 0,
        name: 'New Item',
        width: 'auto',
        height: 'auto',
        rounded: 0,
        display: 'block',
        textAlign: 'start',
        position: 'auto',
        zIndex: 0
      }
    ])
    onChange({
      ...data,
      newItems: [
        ...items,
        {
          type: 'text',
          value: {},
          text_ar: '',
          text_en: '',
          color: '#000',
          fontSize: 16,
          fontWeight: 400,
          fontFamily: 'Arial',
          backgroundColor: 'transparent',
          marginBottom: 0,
          name: 'New Item',
          width: 'auto',
          height: 'auto',
          rounded: 0,
          display: 'block',
          textAlign: 'start',
          position: 'auto',
          zIndex: 0
        }
      ]
    })
  }

  const renderTextField = (label, valueKey, inputType = 'text', options = {}) => (
    <TextField
      fullWidth
      type={inputType}
      defaultValue={data[valueKey] || ''}
      onBlur={e => onChange({ ...data, [valueKey]: e.target.value })}
      label={locale === 'ar' ? options.labelAr || label : label}
      variant='filled'
      {...options}
    />
  )

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...items]

    updatedItems[index][key] = value
    setItems(updatedItems)
    onChange({ ...data, newItems: updatedItems })
  }

  const renderSelect = (label, valueKey, optionsList, additionalProps = {}) => (
    <TextField
      select
      fullWidth
      value={data[valueKey] || optionsList[0].value}
      onChange={e => onChange({ ...data, [valueKey]: e.target.value })}
      label={locale === 'ar' ? additionalProps.labelAr || label : label}
      variant='filled'
    >
      {optionsList.map(({ value, label }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  )
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
      <CloseNav text={messages.card.name} buttonRef={buttonRef} />
      {/* Href Section */}
      {loading ? (
        <div className='flex justify-center items-center h-full min-h-[400px]'>
          <CircularProgress className='!text-main-color' />
        </div>
      ) : (
        <>
          <TextField
            select
            fullWidth
            value={data.cart_type || 'product'}
            onChange={e => onChange({ ...data, cart_type: e.target.value })}
            label={messages.card.type}
            variant='filled'
          >
            <MenuItem value={'product'}>{messages.card.product}</MenuItem>
            <MenuItem value={'analytic'}>{messages.card.analytic}</MenuItem>
            <MenuItem value={'statistic'}>{messages.card.statistic}</MenuItem>
          </TextField>
          <div className='p-2 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages.card.api}</h2>
            <TextField
              select
              fullWidth
              value={data.api_url || ''}
              onChange={e => onChange({ ...data, api_url: e.target.value })}
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
                  onChange({ ...data, items: [], api_url: '' })
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
          <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
            <div className='p-2 my-4 rounded border border-dashed border-main-color'>
              <h2 className='mb-4 text-2xl text-main-color'>{messages.card.flexControl}</h2>
              <FlexControl data={data} onChange={onChange} locale={locale} from={'api'} />
            </div>
          </Collapse>
          {data.cart_type === 'product' && (
            <>
              <div className='p-2 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.href}</h2>
                {renderTextField(messages.card.key, 'href')}
              </div>
              {/* Image/Video Upload Section */}
              <div className='p-2 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.image}</h2>
                <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
                  {renderTextField(messages.card.key, 'image')}
                </Collapse>
                <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(!obj)}>
                  <Button
                    variant='outlined'
                    className='!mb-4'
                    component='label'
                    fullWidth
                    startIcon={<Icon icon='ph:upload-fill' fontSize='2.25rem' className='!text-2xl' />}
                  >
                    <input
                      type='file'
                      accept={type === 'video' ? 'video/*' : 'image/*'}
                      hidden
                      onChange={handleFileUpload}
                    />
                    {messages.card.image}
                  </Button>
                </Collapse>

                {renderTextField(messages.card.height, 'imageHeight', 'number', {
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Select
                          value={data.imageHeightUnit || 'px'}
                          onChange={e => onChange({ ...data, imageHeightUnit: e.target.value })}
                          displayEmpty
                          variant='standard'
                        >
                          <MenuItem value='px'>PX</MenuItem>
                          <MenuItem value='vh'>VH</MenuItem>
                        </Select>
                      </InputAdornment>
                    )
                  }
                })}

                {renderTextField(messages.card.borderRadius, 'borderRadius', 'number')}

                {renderSelect('Object Fit', 'objectFit', [
                  { value: 'cover', label: 'Cover' },
                  { value: 'contain', label: 'Contain' },
                  { value: 'fill', label: 'Fill' },
                  { value: 'none', label: 'None' },
                  { value: 'scale-down', label: 'Scale Down' }
                ])}

                {renderSelect('show', 'imageDisplay', [
                  { value: 'block', label: 'Show' },
                  { value: 'none', label: 'Hide' }
                ])}
              </div>
            </>
          )}

          {/* Title Section */}
          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages.card.title}</h2>
            {renderTextField(obj ? messages.card.title_ar_key : messages.card.title_ar, 'title_ar', 'text')}
            {renderTextField(obj ? messages.card.title_en_key : messages.card.title_en, 'title_en', 'text')}
            {(data.cart_type === 'product' || !data.cart_type) && (
              <>
                {renderTextField('Color', 'titleColor', 'color')}
                {renderTextField('Font Size', 'fontSize', 'number', {
                  InputProps: {
                    endAdornment: <InputAdornment position='end'>px</InputAdornment>
                  }
                })}
                {renderSelect(
                  'Font Weight',
                  'fontWeight',
                  Array.from({ length: 9 }, (_, i) => ({
                    value: `${(i + 1) * 100}`,
                    label: `${(i + 1) * 100}`
                  }))
                )}
                {renderSelect(messages.card.titleTextAlign, 'titleTextAlign', [
                  { value: 'start', label: 'Start' },
                  { value: 'center', label: 'Center' },
                  { value: 'end', label: 'End' }
                ])}
                {renderSelect(messages.card.fontFamily, 'fontFamily', [
                  { value: 'Arial', label: 'Arial' },
                  { value: 'Tahoma', label: 'Tahoma' },
                  { value: 'Verdana', label: 'Verdana' },
                  { value: 'Times New Roman', label: 'Times New Roman' },
                  { value: 'Courier New', label: 'Courier New' }
                ])}
                {renderTextField(messages.card.marginBottom, 'marginBottom', 'number')}
              </>
            )}
          </div>
          {data.cart_type === 'analytic' && (
            <>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.progress}</h2>
                <TextField
                  fullWidth
                  type={obj ? 'text' : 'number'}
                  value={data.progress || ''}
                  label={messages.card.progress}
                  variant='filled'
                  onChange={e => {
                    if (obj) {
                      onChange({ ...data, progress: e.target.value })
                    } else {
                      if (e.target.value >= 0 && e.target.value <= 100) {
                        onChange({ ...data, progress: e.target.value })
                      }
                    }
                  }}
                />
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.tasksRemaining}</h2>
                <TextField
                  fullWidth
                  type={obj ? 'text' : 'number'}
                  value={data.tasksRemaining || ''}
                  label={messages.card.tasksRemaining}
                  variant='filled'
                  onChange={e => {
                    if (obj) {
                      onChange({ ...data, tasksRemaining: e.target.value })
                    } else {
                      onChange({ ...data, tasksRemaining: e.target.value })
                    }
                  }}
                />
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.status}</h2>
                {obj ? (
                  <TextField
                    fullWidth
                    value={data.status}
                    onChange={e => onChange({ ...data, status: e.target.value })}
                    label={messages.card.status}
                    variant='filled'
                  />
                ) : (
                  <TextField
                    select
                    fullWidth
                    value={data.status || 'active'}
                    onChange={e => onChange({ ...data, status: e.target.value })}
                    label={messages.card.status}
                    variant='filled'
                  >
                    <MenuItem value={'active'}>{messages.card.active}</MenuItem>
                    <MenuItem value={'pending'}>{messages.card.pending}</MenuItem>
                    <MenuItem value={'inactive'}>{messages.card.inactive}</MenuItem>
                  </TextField>
                )}
              </div>
            </>
          )}
          {data.cart_type === 'statistic' && (
            <>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.value}</h2>
                <TextField
                  fullWidth
                  type='text'
                  value={data.value || ''}
                  label={messages.card.value}
                  variant='filled'
                  onChange={e => {
                    onChange({ ...data, value: e.target.value })
                  }}
                />
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.icon}</h2>
                <TextField
                  fullWidth
                  type='text'
                  value={data.icon || ''}
                  label={messages.card.icon}
                  variant='filled'
                  onChange={e => {
                    onChange({ ...data, icon: e.target.value })
                  }}
                />
                <a
                  href='https://icon-sets.iconify.design/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-1 text-sm underline text-main-color'
                >
                  {messages.useIconView.iconFromHere}
                </a>
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.color}</h2>
                {obj ? (
                  <TextField
                    fullWidth
                    type='text'
                    value={data.color || ''}
                    label={messages.card.color}
                    variant='filled'
                    onChange={e => {
                      onChange({ ...data, color: e.target.value })
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    type='text'
                    value={data.color || ''}
                    label={messages.card.color}
                    variant='filled'
                    select
                    onChange={e => {
                      onChange({ ...data, color: e.target.value })
                    }}
                  >
                    <MenuItem value={'green'}>{messages.card.green}</MenuItem>
                    <MenuItem value={'blue'}>{messages.card.blue}</MenuItem>
                    <MenuItem value={'yellow'}>{messages.card.yellow}</MenuItem>
                    <MenuItem value={'red'}>{messages.card.red}</MenuItem>
                    <MenuItem value={'purple'}>{messages.card.purple}</MenuItem>
                    <MenuItem value={'pink'}>{messages.card.pink}</MenuItem>
                  </TextField>
                )}
              </div>
            </>
          )}
          {/* Description Section */}
          {(data.cart_type === 'product' || !data.cart_type) && (
            <>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.description}</h2>
                {renderTextField(
                  obj ? messages.card.description_ar_key : messages.card.description_ar,
                  'description_ar',
                  'text'
                )}
                {renderTextField(
                  obj ? messages.card.description_en_key : messages.card.description_en,
                  'description_en',
                  'text'
                )}
                {renderTextField(messages.card.color, 'descriptionColor', 'color')}
                {renderTextField(messages.card.fontSize, 'descriptionFontSize', 'number', {
                  InputProps: {
                    endAdornment: <InputAdornment position='end'>px</InputAdornment>
                  }
                })}
                {renderSelect(
                  messages.card.fontWeight,
                  'descriptionFontWeight',
                  Array.from({ length: 9 }, (_, i) => ({
                    value: `${(i + 1) * 100}`,
                    label: `${(i + 1) * 100}`
                  }))
                )}
                {renderSelect(messages.card.fontFamily, 'descriptionFontFamily', [
                  { value: 'Arial', label: 'Arial' },
                  { value: 'Tahoma', label: 'Tahoma' },
                  { value: 'Verdana', label: 'Verdana' },
                  { value: 'Times New Roman', label: 'Times New Roman' },
                  { value: 'Courier New', label: 'Courier New' }
                ])}
                {renderSelect(messages.card.descriptionTextAlign, 'descriptionTextAlign', [
                  { value: 'start', label: 'Start' },
                  { value: 'center', label: 'Center' },
                  { value: 'end', label: 'End' }
                ])}
                {renderSelect(messages.card.descriptionDisplay, 'descriptionDisplay', [
                  { value: 'block', label: 'Show' },
                  { value: 'none', label: 'Hide' }
                ])}
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.price}</h2>
                {renderTextField(obj ? messages.card.price_key : messages.card.price, 'price', obj ? 'text' : 'number')}
                {renderTextField(messages.card.priceColor, 'priceColor', 'color')}
                {renderTextField(messages.card.priceFontSize, 'priceFontSize', 'number', {
                  InputProps: {
                    endAdornment: <InputAdornment position='end'>px</InputAdornment>
                  }
                })}
                {renderSelect(
                  messages.card.priceFontWeight,
                  'priceFontWeight',
                  Array.from({ length: 9 }, (_, i) => ({
                    value: `${(i + 1) * 100}`,
                    label: `${(i + 1) * 100}`
                  }))
                )}
                {renderSelect(messages.card.priceTextAlign, 'priceTextAlign', [
                  { value: 'end', label: 'End' },
                  { value: 'center', label: 'Center' },
                  { value: 'start', label: 'Start' }
                ])}
                {renderSelect(messages.card.priceFontFamily, 'priceFontFamily', [
                  { value: 'Arial', label: 'Arial' },
                  { value: 'Tahoma', label: 'Tahoma' },
                  { value: 'Verdana', label: 'Verdana' },
                  { value: 'Times New Roman', label: 'Times New Roman' },
                  { value: 'Courier New', label: 'Courier New' }
                ])}
                {renderSelect(messages.card.priceDisplay, 'priceDisplay', [
                  { value: 'block', label: 'Show' },
                  { value: 'none', label: 'Hide' }
                ])}
              </div>

              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.products}</h2>
                <Button
                  variant='outlined'
                  fullWidth
                  className='!mb-4'
                  onClick={handleAddItem}
                  startIcon={<Icon icon='ph:plus-circle-fill' />}
                >
                  {messages.card.addItem}
                </Button>
                <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(items.length !== 0)}>
                  <div className='p-2 mx-2 rounded-md border border-dashed border-main-color'>
                    <h2 className='mb-4 text-2xl text-main-color'>{messages.card.item}</h2>
                    {items.map((item, index) => (
                      <div key={index} className='p-2 my-2 rounded-md border border-dashed border-main-color'>
                        <h2 className='mb-4 text-2xl text-main-color'>{item.name || ''}</h2>

                        <Select
                          fullWidth
                          value={item.type}
                          onChange={e => handleItemChange(index, 'type', e.target.value)}
                          variant='filled'
                        >
                          <MenuItem value='text'>{messages.card.itemTypeText}</MenuItem>
                          <MenuItem value='icon'>{messages.card.itemTypeIcon}</MenuItem>
                          <MenuItem value='rating'>{messages.card.itemTypeRating}</MenuItem>
                        </Select>
                        <TextField
                          fullWidth
                          defaultValue={item.name || ''}
                          onBlur={e => handleItemChange(index, 'name', e.target.value)}
                          label={messages.card.itemName}
                          variant='filled'
                        />
                        {item.type === 'text' && (
                          <TextField
                            fullWidth
                            defaultValue={item.text_ar || ''}
                            onBlur={e => handleItemChange(index, 'text_ar', e.target.value)}
                            label={obj ? messages.card.itemTextArKey : messages.card.itemTextAr}
                            variant='filled'
                          />
                        )}
                        <TextField
                          fullWidth
                          defaultValue={item.text_en || ''}
                          onBlur={e => handleItemChange(index, 'text_en', e.target.value)}
                          label={
                            item.type === 'text'
                              ? obj
                                ? messages.card.itemTextEnKey
                                : messages.card.itemTextEn
                              : messages.card.itemValue
                          }
                          variant='filled'
                        />
                        {item.type === 'icon' && (
                          <a
                            href='https://iconify.design/icon-sets/ph/'
                            target='_blank'
                            className='my-1 text-sm underline text-main-color'
                          >
                            {messages.card.iconLink}
                          </a>
                        )}
                        {item.type !== 'rating' && (
                          <>
                            <TextField
                              fullWidth
                              type='number'
                              defaultValue={item.width || ''}
                              onBlur={e => handleItemChange(index, 'width', e.target.value)}
                              label={messages.card.itemWidth}
                              variant='filled'
                            />
                            <TextField
                              fullWidth
                              type='number'
                              defaultValue={item.height || ''}
                              onBlur={e => handleItemChange(index, 'height', e.target.value)}
                              label={messages.card.itemHeight}
                              variant='filled'
                            />
                          </>
                        )}
                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={item.rounded || ''}
                          onBlur={e => handleItemChange(index, 'rounded', e.target.value)}
                          label={messages.card.borderRadius}
                          variant='filled'
                        />

                        <TextField
                          fullWidth
                          type='color'
                          defaultValue={item.color || ''}
                          onBlur={e => handleItemChange(index, 'color', e.target.value)}
                          label={messages.card.color}
                          variant='filled'
                        />
                        <TextField
                          fullWidth
                          type='color'
                          defaultValue={item.backgroundColor || ''}
                          onBlur={e => handleItemChange(index, 'backgroundColor', e.target.value)}
                          label={messages.card.backgroundColor}
                          variant='filled'
                        />
                        {item.type !== 'icon' && (
                          <TextField
                            fullWidth
                            type='number'
                            defaultValue={item.fontSize || ''}
                            onBlur={e => handleItemChange(index, 'fontSize', e.target.value)}
                            label={messages.card.fontSize}
                            variant='filled'
                          />
                        )}
                        {item.type !== 'icon' && (
                          <TextField
                            fullWidth
                            type='number'
                            defaultValue={item.fontWeight || ''}
                            onBlur={e => handleItemChange(index, 'fontWeight', e.target.value)}
                            label={messages.card.fontWeight}
                            variant='filled'
                          />
                        )}
                        {item.type !== 'icon' && (
                          <TextField
                            select
                            fullWidth
                            value={item.fontFamily || ''}
                            onChange={e => handleItemChange(index, 'fontFamily', e.target.value)}
                            label={messages.card.fontFamily}
                            variant='filled'
                          >
                            <MenuItem value='Arial'>Arial</MenuItem>
                            <MenuItem value='Tahoma'>Tahoma</MenuItem>
                            <MenuItem value='Verdana'>Verdana</MenuItem>
                            <MenuItem value='Times New Roman'>Times New Roman</MenuItem>
                            <MenuItem value='Courier New'>Courier New</MenuItem>
                          </TextField>
                        )}
                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={item.marginBottom || ''}
                          onBlur={e => handleItemChange(index, 'marginBottom', e.target.value)}
                          label={messages.card.marginBottom}
                          variant='filled'
                        />
                        <TextField
                          select
                          fullWidth
                          value={item.textAlign || ''}
                          onChange={e => handleItemChange(index, 'textAlign', e.target.value)}
                          label={messages.card.textAlign}
                          variant='filled'
                        >
                          <MenuItem value='start'>Start</MenuItem>
                          <MenuItem value='center'>Center</MenuItem>
                          <MenuItem value='end'>End</MenuItem>
                        </TextField>
                        <TextField
                          select
                          fullWidth
                          defaultValue={item.position || ''}
                          onBlur={e => handleItemChange(index, 'position', e.target.value)}
                          label={messages.card.position}
                          variant='filled'
                        >
                          <MenuItem value='none'>{messages.card.positionNone}</MenuItem>
                          <MenuItem value='top'>{messages.card.positionTop}</MenuItem>
                          <MenuItem value='center'>{messages.card.positionCenter}</MenuItem>
                          <MenuItem value='bottom'>{messages.card.positionBottom}</MenuItem>
                          <MenuItem value='topLeft'>{messages.card.positionTopLeft}</MenuItem>
                          <MenuItem value='topRight'>{messages.card.positionTopRight}</MenuItem>
                          <MenuItem value='bottomLeft'>{messages.card.positionBottomLeft}</MenuItem>
                          <MenuItem value='bottomRight'>{messages.card.positionBottomRight}</MenuItem>
                        </TextField>

                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={item.zIndex || ''}
                          onBlur={e => handleItemChange(index, 'zIndex', e.target.value)}
                          label={messages.card.zIndex}
                          variant='filled'
                        />

                        <TextField
                          select
                          fullWidth
                          defaultValue={item.display || ''}
                          onBlur={e => handleItemChange(index, 'display', e.target.value)}
                          label={messages.card.display}
                          variant='filled'
                        >
                          <MenuItem value='block'>{messages.card.displayBlock}</MenuItem>
                          <MenuItem value='none'>{messages.card.displayNone}</MenuItem>
                        </TextField>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CartControl
