import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { Button, CircularProgress, InputAdornment, MenuItem, Select, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { Icon } from '@iconify/react'
import Collapse from '@kunukn/react-collapse'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import FlexControl from './FlexControl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'

// ─── Memoized CartItem ────────────────────────────────────────────────────────
const CartItem = memo(function CartItem({
  item, index, onItemChange, onDeleteItem,
  messages, obj, locale, cart_type
}) {
  const [isOpen, setIsOpen] = useState(true)

  const onChange = useCallback((key, value) => {
    onItemChange(index, key, value)
  }, [index, onItemChange])

  return (
    <div className='my-2 rounded-md border border-dashed border-main-color overflow-hidden'>
      {/* Header */}
      <div
        className='flex items-center justify-between p-3 cursor-pointer select-none'
        style={{ background: 'rgba(var(--main-color-rgb,0,0,0),0.07)' }}
        onClick={() => setIsOpen(v => !v)}
      >
        <h2 className='text-xl text-main-color font-semibold'>
          {item.name || `Element ${index + 1}`}
        </h2>
        <div className='flex items-center gap-3'>
          <button
            onClick={e => { e.stopPropagation(); onDeleteItem(index) }}
            className='text-red-500 hover:text-red-700 transition-colors'
            title='Delete'
          >
            <Icon icon='ph:trash-fill' fontSize='1.25rem' />
          </button>
          <Icon
            icon={isOpen ? 'ph:caret-up-fill' : 'ph:caret-down-fill'}
            fontSize='1.25rem'
            className='text-main-color'
          />
        </div>
      </div>

      <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={isOpen}>
        <div className='p-2 flex flex-col gap-2'>

          {/* Type selector */}
          <Select
            fullWidth
            value={item.type || 'text'}
            onChange={e => onChange('type', e.target.value)}
            variant='filled'
          >
            <MenuItem value='text'>{messages.card.itemTypeText}</MenuItem>
            <MenuItem value='icon'>{messages.card.itemTypeIcon}</MenuItem>
            <MenuItem value='rating'>{messages.card.itemTypeRating}</MenuItem>
            <MenuItem value='title'>{locale === 'ar' ? 'عنوان' : 'Title'}</MenuItem>
            <MenuItem value='image'>{locale === 'ar' ? 'صورة' : 'Image'}</MenuItem>
            <MenuItem value='description'>{locale === 'ar' ? 'وصف' : 'Description'}</MenuItem>
            <MenuItem value='price'>{locale === 'ar' ? 'سعر' : 'Price'}</MenuItem>
            <MenuItem value='date'>{locale === 'ar' ? 'تاريخ' : 'Date'}</MenuItem>
          </Select>

          {/* Name */}
          <TextField
            fullWidth
            defaultValue={item.name || ''}
            onBlur={e => onChange('name', e.target.value)}
            label={messages.card.itemName}
            variant='filled'
          />

          {/* ─── IMAGE ──────────────────────────────────────────────── */}
          {item.type === 'image' && (
            <>
              <TextField
                fullWidth
                defaultValue={item.className || ''}
                onBlur={e => onChange('className', e.target.value)}
                label={messages.card.itemClassName}
                variant='filled'
                placeholder='e.g. rounded-full w-full'
              />
              <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={Boolean(obj)}>
                <TextField
                  fullWidth
                  defaultValue={item.image || ''}
                  onBlur={e => onChange('image', e.target.value)}
                  label={messages.card.key}
                  variant='filled'
                />
              </Collapse>
              <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={!obj}>
                <Button
                  variant='outlined'
                  className='!mb-2'
                  component='label'
                  fullWidth
                  startIcon={<Icon icon='ph:upload-fill' className='!text-2xl' />}
                >
                  <input
                    type='file'
                    accept='image/*'
                    hidden
                    onChange={e => {
                      const file = e.target.files[0]
                      if (file) {
                        const blobUrl = URL.createObjectURL(new Blob([file], { type: file.type }))
                        onChange('imageBlob', blobUrl)
                      }
                    }}
                  />
                  {messages.card.image}
                </Button>
              </Collapse>
              <TextField
                fullWidth
                type='number'
                defaultValue={item.imageHeight || ''}
                onBlur={e => onChange('imageHeight', e.target.value)}
                label={locale === 'ar' ? 'ارتفاع الصورة (px)' : 'Image Height (px)'}
                variant='filled'
                inputProps={{ min: 0 }}
              />
            </>
          )}

          {/* ─── TITLE ──────────────────────────────────────────────── */}
          {item.type === 'title' && (
            <>
              <TextField
                fullWidth
                defaultValue={item.className || ''}
                onBlur={e => onChange('className', e.target.value)}
                label={messages.card.itemClassName}
                variant='filled'
                placeholder='e.g. font-bold text-center'
              />
              <TextField
                fullWidth
                defaultValue={item.title_ar || ''}
                onBlur={e => onChange('title_ar', e.target.value)}
                label={obj ? messages.card.title_ar_key : messages.card.title_ar}
                variant='filled'
              />
              <TextField
                fullWidth
                defaultValue={item.title_en || ''}
                onBlur={e => onChange('title_en', e.target.value)}
                label={obj ? messages.card.title_en_key : messages.card.title_en}
                variant='filled'
              />
              <TextField
                fullWidth
                type='color'
                defaultValue={item.titleColor || '#000000'}
                onBlur={e => onChange('titleColor', e.target.value)}
                label={messages.dialogs.color}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontSize || ''}
                onBlur={e => onChange('fontSize', e.target.value)}
                label={messages.dialogs.fontSize}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontWeight || ''}
                onBlur={e => onChange('fontWeight', e.target.value)}
                label={messages.card.fontWeight}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.titleLines || ''}
                onBlur={e => onChange('titleLines', e.target.value)}
                label={locale === 'ar' ? 'عدد السطور' : 'Number of Lines'}
                variant='filled'
                inputProps={{ min: 1 }}
              />
            </>
          )}

          {/* ─── DESCRIPTION ────────────────────────────────────────── */}
          {item.type === 'description' && (
            <>
              <TextField
                fullWidth
                defaultValue={item.className || ''}
                onBlur={e => onChange('className', e.target.value)}
                label={messages.card.itemClassName}
                variant='filled'
                placeholder='e.g. text-gray-500 text-sm'
              />
              <TextField
                fullWidth
                defaultValue={item.description_ar || ''}
                onBlur={e => onChange('description_ar', e.target.value)}
                label={obj ? messages.card.description_ar_key : messages.card.description_ar}
                variant='filled'
                inputProps={{ maxLength: 1000 }}
              />
              <TextField
                fullWidth
                defaultValue={item.description_en || ''}
                onBlur={e => onChange('description_en', e.target.value)}
                label={obj ? messages.card.description_en_key : messages.card.description_en}
                variant='filled'
                inputProps={{ maxLength: 1000 }}
              />
              <TextField
                fullWidth
                type='color'
                defaultValue={item.descriptionColor || '#000000'}
                onBlur={e => onChange('descriptionColor', e.target.value)}
                label={messages.card.color}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontSize || ''}
                onBlur={e => onChange('fontSize', e.target.value)}
                label={messages.dialogs.fontSize}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontWeight || ''}
                onBlur={e => onChange('fontWeight', e.target.value)}
                label={messages.card.fontWeight}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.descriptionLines || ''}
                onBlur={e => onChange('descriptionLines', e.target.value)}
                label={locale === 'ar' ? 'عدد السطور' : 'Number of Lines'}
                variant='filled'
                inputProps={{ min: 1 }}
              />
            </>
          )}

          {/* ─── PRICE ──────────────────────────────────────────────── */}
          {item.type === 'price' && (
            <>
              <TextField
                fullWidth
                defaultValue={item.className || ''}
                onBlur={e => onChange('className', e.target.value)}
                label={messages.card.itemClassName}
                variant='filled'
                placeholder='e.g. text-green-600 font-semibold'
              />
              <TextField
                fullWidth
                type={obj ? 'text' : 'number'}
                defaultValue={item.price || ''}
                onBlur={e => onChange('price', e.target.value)}
                label={obj ? messages.card.price_key : messages.card.price}
                variant='filled'
              />
              <TextField
                fullWidth
                type='color'
                defaultValue={item.priceColor || '#000000'}
                onBlur={e => onChange('priceColor', e.target.value)}
                label={messages.card.priceColor}
                variant='filled'
              />
            </>
          )}

          {/* ─── DATE ───────────────────────────────────────────────── */}
          {item.type === 'date' && (
            <>
              <TextField
                fullWidth
                defaultValue={item.className || ''}
                onBlur={e => onChange('className', e.target.value)}
                label={messages.card.itemClassName}
                variant='filled'
                placeholder='e.g. text-gray-400 text-xs'
              />
              <TextField
                fullWidth
                defaultValue={item.dateKey || ''}
                onBlur={e => onChange('dateKey', e.target.value)}
                label={obj ? (locale === 'ar' ? 'مفتاح التاريخ' : 'Date Key') : (locale === 'ar' ? 'قيمة التاريخ' : 'Date Value')}
                variant='filled'
              />
              <TextField
                select
                fullWidth
                value={item.dateFormat || 'DD/MM/YYYY'}
                onChange={e => onChange('dateFormat', e.target.value)}
                label={locale === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}
                variant='filled'
              >
                <MenuItem value='DD/MM/YYYY'>DD/MM/YYYY</MenuItem>
                <MenuItem value='MM/DD/YYYY'>MM/DD/YYYY</MenuItem>
                <MenuItem value='YYYY-MM-DD'>YYYY-MM-DD</MenuItem>
                <MenuItem value='DD MMM YYYY'>DD MMM YYYY</MenuItem>
                <MenuItem value='MMMM DD, YYYY'>MMMM DD, YYYY</MenuItem>
                <MenuItem value='DD/MM/YYYY HH:mm'>DD/MM/YYYY HH:mm</MenuItem>
                <MenuItem value='relative'>{locale === 'ar' ? 'نسبي (منذ...)' : 'Relative (ago…)'}</MenuItem>
                <MenuItem value='custom'>{locale === 'ar' ? 'مخصص' : 'Custom'}</MenuItem>
              </TextField>
              {item.dateFormat === 'custom' && (
                <TextField
                  fullWidth
                  defaultValue={item.dateCustomFormat || ''}
                  onBlur={e => onChange('dateCustomFormat', e.target.value)}
                  label={locale === 'ar' ? 'تنسيق مخصص (e.g. DD-MM-YY)' : 'Custom Format (e.g. DD-MM-YY)'}
                  variant='filled'
                  placeholder='DD-MM-YY'
                />
              )}
              <TextField
                fullWidth
                type='color'
                defaultValue={item.color || '#000000'}
                onBlur={e => onChange('color', e.target.value)}
                label={messages.card.color}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontSize || ''}
                onBlur={e => onChange('fontSize', e.target.value)}
                label={messages.dialogs.fontSize}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontWeight || ''}
                onBlur={e => onChange('fontWeight', e.target.value)}
                label={messages.card.fontWeight}
                variant='filled'
              />
            </>
          )}

          {/* ─── TEXT / ICON / RATING ───────────────────────────────── */}
          {(item.type === 'text' || item.type === 'icon' || item.type === 'rating') && (
            <>
              <TextField
                fullWidth
                defaultValue={item.className || ''}
                onBlur={e => onChange('className', e.target.value)}
                label={messages.card.itemClassName}
                variant='filled'
                placeholder='e.g. font-bold text-blue-500'
              />
              {item.type === 'text' && (
                <TextField
                  fullWidth
                  defaultValue={item.text_ar || ''}
                  onBlur={e => onChange('text_ar', e.target.value)}
                  label={obj ? messages.card.itemTextArKey : messages.card.itemTextAr}
                  variant='filled'
                />
              )}
              <TextField
                fullWidth
                defaultValue={item.text_en || ''}
                onBlur={e => onChange('text_en', e.target.value)}
                label={
                  item.type === 'text'
                    ? obj ? messages.card.itemTextEnKey : messages.card.itemTextEn
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
              <TextField
                fullWidth
                type='color'
                defaultValue={item.color || '#000000'}
                onBlur={e => onChange('color', e.target.value)}
                label={messages.card.color}
                variant='filled'
              />
              <TextField
                fullWidth
                type='color'
                defaultValue={item.backgroundColor || '#ffffff'}
                onBlur={e => onChange('backgroundColor', e.target.value)}
                label={messages.card.backgroundColor}
                variant='filled'
              />
              <TextField
                fullWidth
                type='number'
                defaultValue={item.fontSize || ''}
                onBlur={e => onChange('fontSize', e.target.value)}
                label={messages.dialogs.fontSize}
                variant='filled'
              />
              {item.type === 'text' && (
                <>
                  <TextField
                    fullWidth
                    type='number'
                    defaultValue={item.fontWeight || ''}
                    onBlur={e => onChange('fontWeight', e.target.value)}
                    label={messages.card.fontWeight}
                    variant='filled'
                  />
                  <TextField
                    fullWidth
                    type='number'
                    defaultValue={item.textLines || ''}
                    onBlur={e => onChange('textLines', e.target.value)}
                    label={locale === 'ar' ? 'عدد السطور' : 'Number of Lines'}
                    variant='filled'
                    inputProps={{ min: 1 }}
                  />
                </>
              )}
            </>
          )}

        </div>
      </Collapse>
    </div>
  )
})

const DEFAULT_ITEMS = [
  { type: 'image', name: 'Image' },
  { type: 'title', name: 'Title', title_ar: '', title_en: '', titleColor: '#000000' },
  { type: 'description', name: 'Description', description_ar: '', description_en: '', descriptionColor: '#000000' },
  { type: 'price', name: 'Price', price: '', priceColor: '#000000' }
]

// ─── Main Component ───────────────────────────────────────────────────────────
function CartControl({ data, onChange, type, buttonRef }) {
  const { locale, messages } = useIntl()
  const [items, setItems] = useState(data.newItems || [])
  const getApiData = useSelector(rx => rx.api.data)

  const [loading] = useState(false)
  const [obj, setObj] = useState(false)

  const prevApiItemsRef = useRef(null)

  useEffect(() => {
    if (data.newItems === undefined) {
      setItems(DEFAULT_ITEMS)
      onChange({ ...data, newItems: DEFAULT_ITEMS })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (data.api_url) {
      const apiItems = getApiData.find(item => item.id === data.api_url)?.data
      const apiItemsJson = JSON.stringify(apiItems)
      if (prevApiItemsRef.current !== apiItemsJson) {
        prevApiItemsRef.current = apiItemsJson
        onChange({ ...data, items: apiItems })
        if (apiItems) setObj(apiItems)
      }
    } else {
      if (prevApiItemsRef.current !== null) {
        prevApiItemsRef.current = null
        setObj(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.api_url, getApiData])

  const syntaxContent = useMemo(() => JSON.stringify(obj, null, 2), [obj])


  const handleAddItem = useCallback(() => {
    const newItem = {
      type: 'text',
      name: 'New Element',
      text_ar: '',
      text_en: '',
      color: '#000000',
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Arial',
      backgroundColor: 'transparent',
      marginBottom: 0,
      width: 'auto',
      height: 'auto',
      rounded: 0,
      display: 'block',
      textAlign: 'start',
      position: 'auto',
      zIndex: 0
    }
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    onChange({ ...data, newItems: updatedItems })
  }, [data, items, onChange])

  const handleItemChange = useCallback((index, key, value) => {
    setItems(prev => {
      const updatedItems = [...prev]
      updatedItems[index] = { ...updatedItems[index], [key]: value }
      onChange({ ...data, newItems: updatedItems })

      return updatedItems
    })
  }, [data, onChange])

  const handleDeleteItem = useCallback((index) => {
    setItems(prev => {
      const updatedItems = prev.filter((_, i) => i !== index)
      onChange({ ...data, newItems: updatedItems })

      return updatedItems
    })
  }, [data, onChange])

  const renderTextField = useCallback((label, valueKey, inputType = 'text', options = {}) => (
    <TextField
      fullWidth
      type={inputType}
      defaultValue={data[valueKey] || ''}
      onBlur={e => onChange({ ...data, [valueKey]: e.target.value })}
      label={locale === 'ar' ? options.labelAr || label : label}
      variant='filled'
      {...options}
    />
  ), [data, locale, onChange])

  const renderSelect = useCallback((label, valueKey, optionsList, additionalProps = {}) => (
    <TextField
      select
      fullWidth
      value={data[valueKey] || optionsList[0].value}
      onChange={e => onChange({ ...data, [valueKey]: e.target.value })}
      label={locale === 'ar' ? additionalProps.labelAr || label : label}
      variant='filled'
    >
      {optionsList.map(({ value, label }) => (
        <MenuItem key={value} value={value}>{label}</MenuItem>
      ))}
    </TextField>
  ), [data, locale, onChange])

  return (
    <div>
      <CloseNav text={messages.card.name} buttonRef={buttonRef} />
      {loading ? (
        <div className='flex justify-center items-center h-full min-h-[400px]'>
          <CircularProgress className='!text-main-color' />
        </div>
      ) : (
        <>
          {/* Cart Type */}
          <TextField
            select
            fullWidth
            value={data.cart_type || 'product'}
            onChange={e => onChange({ ...data, cart_type: e.target.value })}
            label={messages.card.type}
            variant='filled'
          >
            <MenuItem value='product'>{messages.card.product}</MenuItem>
            <MenuItem value='analytic'>{messages.card.analytic}</MenuItem>
            <MenuItem value='statistic'>{messages.card.statistic}</MenuItem>
            <MenuItem value='slide'>{messages.card.slide}</MenuItem>
          </TextField>

          {/* API Section */}
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
              {getApiData.map(({ id, link }, index) => (
                <MenuItem key={id + index} value={id}>{link}</MenuItem>
              ))}
            </TextField>
            <div className='flex justify-center'>
              <Button
                className='!mt-4'
                variant='contained'
                color='error'
                onClick={() => {
                  setObj(false)
                  prevApiItemsRef.current = null
                  onChange({ ...data, items: [], api_url: '' })
                }}
              >
                {messages.card.clearData}
              </Button>
            </div>
          </div>

          {/* Object Viewer */}
          <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={Boolean(obj)}>
            <div className='p-2 my-4 rounded border border-dashed border-main-color'>
              <h2 className='mb-4 text-2xl text-main-color'>{messages.card.viewObject}</h2>
              <SyntaxHighlighter language='json' style={docco}>
                {syntaxContent}
              </SyntaxHighlighter>
            </div>
            <TextField
              fullWidth
              value={data.key || ''}
              variant='filled'
              label={messages.itemsPath}
              onChange={e => onChange({ ...data, key: e.target.value })}
            />
          </Collapse>

          {/* FlexControl */}
          <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={Boolean(obj)}>
            <div className='p-2 my-4 rounded border border-dashed border-main-color'>
              <h2 className='mb-4 text-2xl text-main-color'>{messages.card.flexControl}</h2>
              <FlexControl data={data} onChange={onChange} locale={locale} from='api' />
            </div>
          </Collapse>

          {/* ─── Analytic-specific ─────────────────────────────────── */}
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
                    } else if (e.target.value >= 0 && e.target.value <= 100) {
                      onChange({ ...data, progress: e.target.value })
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
                  onChange={e => onChange({ ...data, tasksRemaining: e.target.value })}
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
                    <MenuItem value='active'>{messages.card.active}</MenuItem>
                    <MenuItem value='pending'>{messages.card.pending}</MenuItem>
                    <MenuItem value='inactive'>{messages.card.inactive}</MenuItem>
                  </TextField>
                )}
              </div>
            </>
          )}

          {/* ─── Statistic-specific ────────────────────────────────── */}
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
                  onChange={e => onChange({ ...data, value: e.target.value })}
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
                  onChange={e => onChange({ ...data, icon: e.target.value })}
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
                    fullWidth type='text' value={data.color || ''} label={messages.card.color} variant='filled'
                    onChange={e => onChange({ ...data, color: e.target.value })}
                  />
                ) : (
                  <TextField
                    select fullWidth value={data.color || ''} label={messages.card.color} variant='filled'
                    onChange={e => onChange({ ...data, color: e.target.value })}
                  >
                    <MenuItem value='green'>{messages.card.green}</MenuItem>
                    <MenuItem value='blue'>{messages.card.blue}</MenuItem>
                    <MenuItem value='yellow'>{messages.card.yellow}</MenuItem>
                    <MenuItem value='red'>{messages.card.red}</MenuItem>
                    <MenuItem value='purple'>{messages.card.purple}</MenuItem>
                    <MenuItem value='pink'>{messages.card.pink}</MenuItem>
                  </TextField>
                )}
              </div>
            </>
          )}

          {/* ─── Slide-specific ────────────────────────────────────── */}
          {data.cart_type === 'slide' && (
            <>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.slidesPerView}</h2>
                {renderTextField(messages.card.slidesPerView, 'slidesPerView', 'number')}
                {renderTextField(messages.card.spaceBetween, 'spaceBetween', 'number')}
                {renderSelect(
                  locale === 'ar' ? 'اتجاه السلايدر' : 'Slide Direction',
                  'slideDirection',
                  [
                    { value: 'horizontal', label: locale === 'ar' ? 'أفقي' : 'Horizontal' },
                    { value: 'vertical',   label: locale === 'ar' ? 'عمودي' : 'Vertical' }
                  ]
                )}
                {data.slideDirection === 'vertical' && renderTextField(
                  locale === 'ar' ? 'ارتفاع الحاوية (px)' : 'Container Height (px)',
                  'slideContainerHeight',
                  'number'
                )}
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.title}</h2>
                {renderTextField(messages.card.sectionTitle_ar, 'sectionTitle_ar')}
                {renderTextField(messages.card.sectionTitle_en, 'sectionTitle_en')}
                {renderTextField(messages.card.sectionDescription_ar, 'sectionDescription_ar')}
                {renderTextField(messages.card.sectionDescription_en, 'sectionDescription_en')}
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.navButtons}</h2>
                {renderTextField(messages.card.navClassName, 'navClassName', 'text')}
                {renderTextField(messages.card.arrowColor, 'arrowColor', 'color')}
                {renderTextField(messages.card.arrowBgColor, 'arrowBgColor', 'color')}
              </div>
              <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.card.seeMore}</h2>
                {renderSelect(messages.card.seeMoreShow, 'seeMoreShow', [
                  { value: 'show', label: locale === 'ar' ? 'إظهار' : 'Show' },
                  { value: 'none', label: locale === 'ar' ? 'إخفاء' : 'Hide' }
                ])}
                {renderTextField(messages.card.seeMoreUrl, 'seeMoreUrl')}
                {renderTextField(messages.card.seeMoreText_ar, 'seeMoreText_ar')}
                {renderTextField(messages.card.seeMoreText_en, 'seeMoreText_en')}
                {renderTextField(messages.card.seeMoreBgColor, 'seeMoreBgColor', 'color')}
                {renderTextField(messages.card.seeMoreTextColor, 'seeMoreTextColor', 'color')}
              </div>
            </>
          )}

          {/* ─── Card Layout & Link ──────────────────────────────────── */}
          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>
              {locale === 'ar' ? 'تخطيط الكارت والرابط' : 'Card Layout & Link'}
            </h2>
            <TextField
              fullWidth
              defaultValue={data.href || ''}
              onBlur={e => onChange({ ...data, href: e.target.value })}
              label={messages.card.href}
              variant='filled'
              placeholder='home/?id={id}'
            />
            <TextField
              fullWidth
              defaultValue={data.hrefKey || ''}
              onBlur={e => onChange({ ...data, hrefKey: e.target.value })}
              label={locale === 'ar' ? 'مفتاح الرابط من الـ API' : 'Link Key from API'}
              variant='filled'
              placeholder={locale === 'ar' ? 'مثال: url أو data.link' : 'e.g. url or data.link'}
              helperText={locale === 'ar' ? 'اسم الحقل في الـ API اللي بيحتوي على الرابط كامل' : 'Field name in API response that contains the full link'}
            />
            <TextField
              fullWidth
              defaultValue={data.cardClassName || ''}
              onBlur={e => onChange({ ...data, cardClassName: e.target.value })}
              label={messages.card.cardClassName}
              variant='filled'
            />
            <TextField
              select
              fullWidth
              value={data.cardLayout || 'vertical'}
              onChange={e => onChange({ ...data, cardLayout: e.target.value })}
              label={messages.card.cardLayout}
              variant='filled'
            >
              <MenuItem value='vertical'>{messages.card.cardLayoutVertical}</MenuItem>
              <MenuItem value='horizontal'>{messages.card.cardLayoutHorizontal}</MenuItem>
            </TextField>
            {data.cardLayout === 'horizontal' && (
              <TextField
                fullWidth
                type='number'
                defaultValue={data.firstSectionWidth || ''}
                onBlur={e => onChange({ ...data, firstSectionWidth: e.target.value })}
                label={locale === 'ar' ? 'عرض القسم الأول' : 'First Section Width'}
                variant='filled'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Select
                        value={data.firstSectionWidthUnit || '%'}
                        onChange={e => onChange({ ...data, firstSectionWidthUnit: e.target.value })}
                        variant='standard'
                      >
                        <MenuItem value='%'>%</MenuItem>
                        <MenuItem value='px'>PX</MenuItem>
                      </Select>
                    </InputAdornment>
                  )
                }}
              />
            )}
          </div>

          {/* ─── Elements (Add New Element) ─────────────────────────── */}
          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages.card.products}</h2>
            <Button
              variant='outlined'
              fullWidth
              className='!mb-2'
              onClick={handleAddItem}
              startIcon={<Icon icon='ph:plus-circle-fill' />}
            >
              {messages.card.addItem}
            </Button>
            {items.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                index={index}
                onItemChange={handleItemChange}
                onDeleteItem={handleDeleteItem}
                messages={messages}
                obj={obj}
                locale={locale}
                cart_type={data.cart_type}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CartControl
