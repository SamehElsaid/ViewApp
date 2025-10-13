import React, { useEffect, useState } from 'react'
import {
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { useIntl } from 'react-intl'
import { Icon } from '@iconify/react'
import Collapse from '@kunukn/react-collapse'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import FlexControl from './FlexControl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'

function CartControl({ data, onChange, type, buttonRef }) {
  const { locale } = useIntl()
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
  }, [data.api_url,getApiData])

  return (
    <div>
      <CloseNav text={locale === 'ar' ? 'عرض' : 'Card'} buttonRef={buttonRef} />
      {/* Href Section */}
      {loading ? (
        <div className='flex justify-center items-center h-full min-h-[400px]'>
          <CircularProgress className='!text-main-color' />
        </div>
      ) : (
        <>
          <div className='p-2 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>
              {locale === 'ar' ? 'جلب البيانات من الAPI' : 'Get From API'}
            </h2>
            {/* {renderTextField(locale === 'ar' ? 'جلب البيانات من الAPI' : 'Get From API', 'api_url')} */}
            <TextField
              select
              fullWidth
              value={data.api_url || ''}
              onChange={e => onChange({ ...data, api_url: e.target.value })}
              label={locale === 'ar' ? 'جلب البيانات من الAPI' : 'Get From API'}
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
                {locale === 'ar' ? 'تفريغ البيانات' : 'Clear Data'}
              </Button>
            </div>
          </div>

          <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
            <div className='p-2 my-4 rounded border border-dashed border-main-color'>
              <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'عرض البيانات' : 'View Object'}</h2>
              <SyntaxHighlighter language='json' style={docco}>
                {JSON.stringify(obj, null, 2)}
              </SyntaxHighlighter>
            </div>
          </Collapse>
          <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
            <div className='p-2 my-4 rounded border border-dashed border-main-color'>
              <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'العرض ' : 'Flex Control'}</h2>
              <FlexControl data={data} onChange={onChange} locale={locale} from={'api'} />
            </div>
          </Collapse>

          <div className='p-2 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'المسار' : 'Href'}</h2>
            {renderTextField(locale === 'ar' ? 'المفتاح' : 'Key', 'href')}
          </div>

          {/* Image/Video Upload Section */}
          <div className='p-2 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'الصورة' : 'Image'}</h2>
            <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
              {renderTextField(locale === 'ar' ? 'المفتاح' : 'Key', 'image')}
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
                {locale === 'ar'
                  ? 'رفع ' + (type === 'video' ? 'فيديو' : 'صورة')
                  : 'Upload ' + (type === 'video' ? 'Video' : 'Image')}
              </Button>
            </Collapse>

            {renderTextField('Height', 'imageHeight', 'number', {
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

            {renderTextField(locale === 'ar' ? ' الحدود الدائرية' : 'Border radius', 'borderRadius', 'number')}

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

          {/* Title Section */}
          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'العنوان' : 'Title'}</h2>
            {renderTextField(
              obj
                ? locale === 'ar'
                  ? 'مفتاح العنوان بالعربية'
                  : 'Title ar key'
                : locale === 'ar'
                ? 'العنوان بالعربية'
                : 'Title Ar',
              'title_ar',
              'text'
            )}
            {renderTextField(
              obj
                ? locale === 'ar'
                  ? 'مفتاح العنوان بالانجليزية'
                  : 'Title en key'
                : locale === 'ar'
                ? 'العنوان بالانجليزية'
                : 'Title En',
              'title_en',
              'text'
            )}
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
            {renderSelect(locale === 'ar' ? 'محاذاة' : 'Text align', 'titleTextAlign', [
              { value: 'start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'end', label: 'End' }
            ])}
            {renderSelect('Font Family', 'fontFamily', [
              { value: 'Arial', label: 'Arial' },
              { value: 'Tahoma', label: 'Tahoma' },
              { value: 'Verdana', label: 'Verdana' },
              { value: 'Times New Roman', label: 'Times New Roman' },
              { value: 'Courier New', label: 'Courier New' }
            ])}
            {renderTextField(locale === 'ar' ? 'المسافة بالأسفل' : 'Margin bottom', 'marginBottom', 'number')}
          </div>
          {/* Description Section */}
          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'الوصف' : 'Description'}</h2>
            {renderTextField(
              obj
                ? locale === 'ar'
                  ? 'مفتاح الوصف بالعربية'
                  : 'Description ar key'
                : locale === 'ar'
                ? 'الوصف بالعربية'
                : 'Description Ar',
              'description_ar',
              'text'
            )}
            {renderTextField(
              obj
                ? locale === 'ar'
                  ? 'مفتاح الوصف بالانجليزية'
                  : 'Description en key'
                : locale === 'ar'
                ? 'الوصف بالانجليزية'
                : 'Description En',
              'description_en',
              'text'
            )}
            {renderTextField('Color', 'descriptionColor', 'color')}
            {renderTextField('Font Size', 'descriptionFontSize', 'number', {
              InputProps: {
                endAdornment: <InputAdornment position='end'>px</InputAdornment>
              }
            })}
            {renderSelect(
              'Font Weight',
              'descriptionFontWeight',
              Array.from({ length: 9 }, (_, i) => ({
                value: `${(i + 1) * 100}`,
                label: `${(i + 1) * 100}`
              }))
            )}
            {renderSelect('Font Family', 'descriptionFontFamily', [
              { value: 'Arial', label: 'Arial' },
              { value: 'Tahoma', label: 'Tahoma' },
              { value: 'Verdana', label: 'Verdana' },
              { value: 'Times New Roman', label: 'Times New Roman' },
              { value: 'Courier New', label: 'Courier New' }
            ])}
            {renderSelect(locale === 'ar' ? 'محاذاة' : 'Text align', 'descriptionTextAlign', [
              { value: 'start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'end', label: 'End' }
            ])}
            {renderSelect('show', 'descriptionDisplay', [
              { value: 'block', label: 'Show' },
              { value: 'none', label: 'Hide' }
            ])}
          </div>
          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'السعر' : 'Price'}</h2>
            {renderTextField(
              obj ? (locale === 'ar' ? 'مفتاح السعر ' : 'Price  key') : locale === 'ar' ? 'السعر' : 'Price',
              'price',
              obj ? 'text' : 'number'
            )}
            {renderTextField('Color', 'priceColor', 'color')}
            {renderTextField('Font Size', 'priceFontSize', 'number', {
              InputProps: {
                endAdornment: <InputAdornment position='end'>px</InputAdornment>
              }
            })}
            {renderSelect(
              'Font Weight',
              'priceFontWeight',
              Array.from({ length: 9 }, (_, i) => ({
                value: `${(i + 1) * 100}`,
                label: `${(i + 1) * 100}`
              }))
            )}
            {renderSelect(locale === 'ar' ? 'محاذاة' : 'Text align', 'priceTextAlign', [
              { value: 'end', label: 'End' },
              { value: 'center', label: 'Center' },
              { value: 'start', label: 'Start' }
            ])}
            {renderSelect('Font Family', 'priceFontFamily', [
              { value: 'Arial', label: 'Arial' },
              { value: 'Tahoma', label: 'Tahoma' },
              { value: 'Verdana', label: 'Verdana' },
              { value: 'Times New Roman', label: 'Times New Roman' },
              { value: 'Courier New', label: 'Courier New' }
            ])}
            {renderSelect('show', 'priceDisplay', [
              { value: 'block', label: 'Show' },
              { value: 'none', label: 'Hide' }
            ])}
          </div>

          <div className='p-4 mt-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'المنتجات' : 'Products'}</h2>
            <Button
              variant='outlined'
              fullWidth
              className='!mb-4'
              onClick={handleAddItem}
              startIcon={<Icon icon='ph:plus-circle-fill' />}
            >
              {locale === 'ar' ? 'إضافة عنصر جديد' : 'Add New Item'}
            </Button>
            <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(items.length !== 0)}>
              <div className='p-2 mx-2 rounded-md border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{locale === 'ar' ? 'العنصر' : 'Item'}</h2>
                {items.map((item, index) => (
                  <div key={index} className='p-2 my-2 rounded-md border border-dashed border-main-color'>
                    <h2 className='mb-4 text-2xl text-main-color'>{item.name || ''}</h2>

                    <Select
                      fullWidth
                      value={item.type}
                      onChange={e => handleItemChange(index, 'type', e.target.value)}
                      variant='filled'
                    >
                      <MenuItem value='text'>{locale === 'ar' ? 'نص' : 'Text'}</MenuItem>
                      <MenuItem value='icon'>{locale === 'ar' ? 'ايقون' : 'Icon'}</MenuItem>
                      <MenuItem value='rating'>{locale === 'ar' ? 'تقييم' : 'Rating'}</MenuItem>
                    </Select>
                    <TextField
                      fullWidth
                      defaultValue={item.name || ''}
                      onBlur={e => handleItemChange(index, 'name', e.target.value)}
                      label={locale === 'ar' ? 'الاسم' : 'Name'}
                      variant='filled'
                    />
                    {item.type === 'text' && (
                      <TextField
                        fullWidth
                        defaultValue={item.text_ar || ''}
                        onBlur={e => handleItemChange(index, 'text_ar', e.target.value)}
                        label={
                          obj
                            ? locale === 'ar'
                              ? 'المفتاح الخاص بالعربية'
                              : 'Arabic Key'
                            : locale === 'ar'
                            ? 'النص بالعربية'
                            : 'Text Ar'
                        }
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
                            ? locale === 'ar'
                              ? 'المفتاح'
                              : 'Key'
                            : locale === 'ar'
                            ? 'النص بالانجليزية'
                            : 'Text En'
                          : locale === 'ar'
                          ? 'القيمة'
                          : 'Value'
                      }
                      variant='filled'
                    />
                    {item.type === 'icon' && (
                      <a
                        href='https://iconify.design/icon-sets/ph/'
                        target='_blank'
                        className='my-1 text-sm underline text-main-color'
                      >
                        {locale === 'ar' ? 'من هنا' : 'From Here'}{' '}
                      </a>
                    )}
                    {item.type !== 'rating' && (
                      <>
                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={item.width || ''}
                          onBlur={e => handleItemChange(index, 'width', e.target.value)}
                          label={locale === 'ar' ? 'العرض' : 'Width'}
                          variant='filled'
                        />
                        <TextField
                          fullWidth
                          type='number'
                          defaultValue={item.height || ''}
                          onBlur={e => handleItemChange(index, 'height', e.target.value)}
                          label={locale === 'ar' ? 'الطول' : 'Height'}
                          variant='filled'
                        />
                      </>
                    )}
                    <TextField
                      fullWidth
                      type='number'
                      defaultValue={item.rounded || ''}
                      onBlur={e => handleItemChange(index, 'rounded', e.target.value)}
                      label={locale === 'ar' ? 'التدوير' : 'Rounded'}
                      variant='filled'
                    />

                    <TextField
                      fullWidth
                      type='color'
                      defaultValue={item.color || ''}
                      onBlur={e => handleItemChange(index, 'color', e.target.value)}
                      label={locale === 'ar' ? 'اللون' : 'Color'}
                      variant='filled'
                    />
                    <TextField
                      fullWidth
                      type='color'
                      defaultValue={item.backgroundColor || ''}
                      onBlur={e => handleItemChange(index, 'backgroundColor', e.target.value)}
                      label={locale === 'ar' ? 'اللون الخلفي' : 'Background Color'}
                      variant='filled'
                    />
                    {item.type !== 'icon' && (
                      <TextField
                        fullWidth
                        type='number'
                        defaultValue={item.fontSize || ''}
                        onBlur={e => handleItemChange(index, 'fontSize', e.target.value)}
                        label={locale === 'ar' ? 'الحجم' : 'Size'}
                        variant='filled'
                      />
                    )}
                    {item.type !== 'icon' && (
                      <TextField
                        fullWidth
                        type='number'
                        defaultValue={item.fontWeight || ''}
                        onBlur={e => handleItemChange(index, 'fontWeight', e.target.value)}
                        label={locale === 'ar' ? 'وزن الخط' : 'font Weight'}
                        variant='filled'
                      />
                    )}
                    {item.type !== 'icon' && (
                      <TextField
                        select
                        fullWidth
                        value={item.fontFamily || ''}
                        onChange={e => handleItemChange(index, 'fontFamily', e.target.value)}
                        label={locale === 'ar' ? 'نوع الخط' : 'font Family'}
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
                      label={locale === 'ar' ? 'المسافة بالأسفل' : 'Margin bottom'}
                      variant='filled'
                    />
                    <TextField
                      select
                      fullWidth
                      value={item.textAlign || ''}
                      onChange={e => handleItemChange(index, 'textAlign', e.target.value)}
                      label={locale === 'ar' ? 'المحاذاة' : 'Text align'}
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
                      label={locale === 'ar' ? 'الموضع' : 'Position'}
                      variant='filled'
                    >
                      <MenuItem value='none'>None</MenuItem>
                      <MenuItem value='top'>Top</MenuItem>
                      <MenuItem value='center'>Center</MenuItem>
                      <MenuItem value='bottom'>Bottom</MenuItem>
                      <MenuItem value='topLeft'>Top-Left</MenuItem>
                      <MenuItem value='topRight'>Top-Right</MenuItem>
                      <MenuItem value='bottomLeft'>Bottom-Left</MenuItem>
                      <MenuItem value='bottomRight'>Bottom-Right</MenuItem>
                    </TextField>

                    <TextField
                      fullWidth
                      type='number'
                      defaultValue={item.zIndex || ''}
                      onBlur={e => handleItemChange(index, 'zIndex', e.target.value)}
                      label={locale === 'ar' ? 'الترتيب' : 'Z-Index'}
                      variant='filled'
                    />

                    <TextField
                      select
                      fullWidth
                      defaultValue={item.display || ''}
                      onBlur={e => handleItemChange(index, 'display', e.target.value)}
                      label={locale === 'ar' ? 'العرض' : 'Display'}
                      variant='filled'
                    >
                      <MenuItem value='block'>{locale === 'ar' ? 'عرض' : 'Show'}</MenuItem>
                      <MenuItem value='none'>{locale === 'ar' ? 'إخفاء' : 'Hide'}</MenuItem>
                    </TextField>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        </>
      )}
    </div>
  )
}

export default CartControl
