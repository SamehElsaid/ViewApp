import React, { useEffect, useRef, useState } from 'react'
import { MenuItem, Switch, TextField, FormControlLabel, FormControl, InputLabel, Select, Button, IconButton } from '@mui/material'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Collapse from '@kunukn/react-collapse'
import get from 'lodash/get'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { axiosPost } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'

export default function HeroSliderControl({ data, onChange, locale, buttonRef }) {
  const { messages } = useIntl()
  const apiData = useSelector(state => state.api.data)
  const update = patch => onChange({ ...data, ...patch })
  const illustrationInputRef = useRef(null)

  const [obj, setObj] = useState(false)
  const [showFieldPaths, setShowFieldPaths] = useState(true)
  const [tickerObj, setTickerObj] = useState(false)
  const [showTickerField, setShowTickerField] = useState(true)
  const [uploadingIllustration, setUploadingIllustration] = useState(false)

  const handleIllustrationUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingIllustration(true)
    const loading = toast.loading(messages?.useUploadImage?.uploading || 'Uploading...')
    axiosPost('file/upload', 'en', { file }, true)
      .then(res => {
        if (res?.status) update({ illustrationImage: res.filePath })
      })
      .finally(() => {
        toast.dismiss(loading)
        setUploadingIllustration(false)
        e.target.value = ''
      })
  }

  useEffect(() => {
    if (data.api_url) {
      const apiResponse = apiData.find(item => item.link === data.api_url)?.data
      const items = data.itemsPath ? get(apiResponse, data.itemsPath) : apiResponse
      onChange({ ...data, items: items })
      if (items) {
        setObj(items)
      }
    } else {
      setObj(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.api_url, data.itemsPath])

  useEffect(() => {
    if (data.tickerApi_url) {
      const apiResponse = apiData.find(item => item.link === data.tickerApi_url)?.data
      const items = data.tickerItemsPath ? get(apiResponse, data.tickerItemsPath) : apiResponse
      if (items) setTickerObj(items)
      else setTickerObj(false)
    } else {
      setTickerObj(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tickerApi_url, data.tickerItemsPath])

  return (
    <div>
      <CloseNav text={messages?.heroSlider?.title || 'Hero Slider'} buttonRef={buttonRef} />
      <div className='p-3 space-y-4'>
        {/* Slides Data Source */}
        <TextField
          select
          fullWidth
          className='!mb-4'
          value={data.api_url || ''}
          onChange={e => onChange({ ...data, api_url: e.target.value })}
          label={messages.useUploadImage.api}
          variant='filled'
        >
          {apiData.map(
            ({ link, data }, index) =>
            (
              <MenuItem key={link + index} value={link}>
                {link}
              </MenuItem>
            )
          )}
        </TextField>
        {data.api_url && (
          <div className='flex justify-center'>
            <Button
              className='!my-4'
              variant='contained'
              color='error'
              onClick={() => {
                setObj(false)
                onChange({ ...data, items: [], api_url: '', itemsPath: '' })
              }}
            >
              {messages.useUploadImage.clearData}
            </Button>
          </div>
        )}
        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(obj)}>
          <div className='p-2 my-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages.useUploadImage.viewObject}</h2>
            <SyntaxHighlighter language='json' style={docco}>
              {JSON.stringify(obj, null, 2)}
            </SyntaxHighlighter>
            <div className='mt-4'>
              <TextField
                fullWidth
                value={data.key || ''}
                variant='filled'
                label={messages.itemsPath}
                onChange={e => {
                  onChange({ ...data, key: e.target.value })
                }}
              />
            </div>
          </div>
          {/* Field Path Mappings */}
          <div className='rounded border border-dashed border-main-color'>
            <button
              type='button'
              className='w-full flex items-center justify-between px-3 py-2 text-main-color font-semibold text-sm hover:bg-gray-50 transition-colors rounded'
              onClick={() => setShowFieldPaths(v => !v)}
            >
              <span>{messages.fieldPathMappings || 'Field Path Mappings'}</span>
              {showFieldPaths ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </button>
            <Collapse transition='height 250ms cubic-bezier(.4, 0, .2, 1)' isOpen={showFieldPaths}>
              <div className='p-3 space-y-2'>
                <TextField
                  variant='filled'
                  fullWidth size='small' label={messages.imageUrlPath} value={data?.imageUrlPath || ''}
                  onChange={e => update({ imageUrlPath: e.target.value })}
                  helperText='e.g. imageUrl, media.url, thumbnail.large' />
                <TextField variant='filled' fullWidth size='small' label={messages.titlePath} value={data?.titlePath || ''}
                  onChange={e => update({ titlePath: e.target.value })}
                  helperText='e.g. title_ar, title_en — يظهر كـ badge ملوّن على الشريحة' />
                <TextField variant='filled' fullWidth size='small' label={messages.subtitlePath || 'Description Path'} value={data?.subtitlePath || ''}
                  onChange={e => update({ subtitlePath: e.target.value })}
                  helperText='e.g. description, desc, body — النص تحت الـ badge' />
                <TextField variant='filled' fullWidth size='small' label={messages.ctaLabelPath} value={data?.ctaLabelPath || ''}
                  onChange={e => update({ ctaLabelPath: e.target.value })} />
                <TextField variant='filled' fullWidth size='small' label={messages.ctaUrlPath} value={data?.ctaUrlPath || ''}
                  onChange={e => update({ ctaUrlPath: e.target.value })}
                  helperText={`${messages.example}: url, link, slug`} />
              </div>
            </Collapse>
          </div>
          {/* Search Bar */}
          <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
            <h3 className='text-main-color font-semibold text-lg'>Search Bar</h3>
            <FormControl fullWidth size='small'>
              <InputLabel>Search Mode</InputLabel>
              <Select value={data?.searchMode || 'none'} label='Search Mode' onChange={e => update({ searchMode: e.target.value })}>
                <MenuItem value='none'>None</MenuItem>
                <MenuItem value='simple'>Simple (text only)</MenuItem>
                <MenuItem value='advanced'>Advanced (category + type + text)</MenuItem>
              </Select>
            </FormControl>
            {data?.searchMode === 'advanced' && (
              <TextField
                select fullWidth label='Search Categories API URL' value={data?.searchApi_url || ''}
                onChange={e => update({ searchApi_url: e.target.value })}
              >
                {apiData.map(({ link }, i) => (
                  <MenuItem key={i} value={link}>{link}</MenuItem>
                ))}
              </TextField>
            )}
            {/* Preview skeleton */}
            {(data?.searchMode === 'simple' || data?.searchMode === 'advanced') && (
              <div className='mt-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm'>
                <p className='text-xs text-gray-400 px-3 pt-2 pb-1'>Preview</p>
                <div className='flex items-center gap-2 px-5 pb-4'>
                  <div
                    className='flex items-center gap-2 rounded-full px-4 py-2 w-full'
                    style={{ background: '#f1f3f5' }}
                  >
                    <span className='flex-1 text-sm text-gray-400 text-right'>البحث</span>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <circle cx='11' cy='11' r='8' />
                      <path d='m21 21-4.35-4.35' />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Header Card — shown only when search mode is active */}
          {(data?.searchMode === 'simple' || data?.searchMode === 'advanced') && (
            <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
              <h3 className='text-main-color font-semibold text-lg'>Header Card</h3>

              {/* Accent color */}
              <div className='flex items-center gap-3'>
                <label className='text-sm flex-1'>Accent Color <span className='text-gray-400 text-xs'>(border + shadow + divider)</span></label>
                <input
                  type='color'
                  value={data?.cardAccentColor || '#3b82f6'}
                  onChange={e => update({ cardAccentColor: e.target.value })}
                  className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                  title='Card accent color'
                />
              </div>

              {/* Arabic title */}
              <TextField
                variant='filled'
                fullWidth
                size='small'
                multiline
                minRows={2}
                label='Title (AR)'
                value={data?.siteTitle_ar || ''}
                onChange={e => update({ siteTitle_ar: e.target.value })}
                helperText='العنوان بالعربية — يظهر في البطاقة البيضاء'
                inputProps={{ dir: 'rtl' }}
              />

              {/* English title */}
              <TextField
                variant='filled'
                fullWidth
                size='small'
                multiline
                minRows={2}
                label='Title (EN)'
                value={data?.siteTitle_en || ''}
                onChange={e => update({ siteTitle_en: e.target.value })}
                helperText='Title in English — shown in header card'
              />

              {/* Illustration upload */}
              <div className='space-y-2'>
                <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Illustration Image</p>
                {data?.illustrationImage ? (
                  <div className='flex items-center justify-between p-2 rounded-md border border-dashed border-green-400 bg-green-50'>
                    <div className='flex items-center gap-2'>
                      <img
                        src={`${process.env.API_URL}/file/download/${data.illustrationImage}`}
                        alt='illustration preview'
                        className='h-12 w-auto object-contain rounded'
                      />
                      <span className='text-sm text-green-700'>
                        {locale === 'ar' ? 'تم رفع الصورة' : 'Image uploaded'}
                      </span>
                    </div>
                    <button
                      className='w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full text-xs hover:bg-red-600'
                      onClick={() => update({ illustrationImage: '' })}
                      title={locale === 'ar' ? 'حذف' : 'Remove'}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <Button
                    variant='outlined'
                    fullWidth
                    component='label'
                    disabled={uploadingIllustration}
                    size='small'
                  >
                    <input
                      ref={illustrationInputRef}
                      type='file'
                      accept='image/png,image/jpeg,image/jpg,image/webp,image/svg+xml'
                      hidden
                      onChange={handleIllustrationUpload}
                    />
                    {uploadingIllustration
                      ? (locale === 'ar' ? 'جارٍ الرفع...' : 'Uploading...')
                      : (locale === 'ar' ? 'رفع صورة الـ Illustration' : 'Upload Illustration Image')}
                  </Button>
                )}

                <TextField
                  variant='filled'
                  fullWidth
                  size='small'
                  label='Or paste Image URL'
                  value={data?.illustrationUrl || ''}
                  onChange={e => update({ illustrationUrl: e.target.value })}
                  helperText='Optional: direct URL if not uploading'
                />

                {(data?.illustrationImage || data?.illustrationUrl) && (
                  <div className='space-y-2 pt-1'>
                    <TextField
                      variant='filled' fullWidth size='small' type='number' label='Width'
                      value={data?.illustrationWidth || ''} inputProps={{ min: 0 }}
                      helperText='Leave empty = auto'
                      onChange={e => update({ illustrationWidth: e.target.value === '' ? '' : Number(e.target.value) })}
                      InputProps={{
                        endAdornment: (
                          <Select value={data?.illustrationWidthUnit || 'px'} onChange={e => update({ illustrationWidthUnit: e.target.value })} variant='standard' size='small' sx={{ minWidth: 52 }}>
                            <MenuItem value='px'>px</MenuItem>
                            <MenuItem value='%'>%</MenuItem>
                            <MenuItem value='rem'>rem</MenuItem>
                            <MenuItem value='vw'>vw</MenuItem>
                          </Select>
                        )
                      }}
                    />
                    <TextField
                      variant='filled' fullWidth size='small' type='number' label='Height'
                      value={data?.illustrationHeight || ''} inputProps={{ min: 0 }}
                      helperText='Leave empty = auto'
                      onChange={e => update({ illustrationHeight: e.target.value === '' ? '' : Number(e.target.value) })}
                      InputProps={{
                        endAdornment: (
                          <Select value={data?.illustrationHeightUnit || 'px'} onChange={e => update({ illustrationHeightUnit: e.target.value })} variant='standard' size='small' sx={{ minWidth: 52 }}>
                            <MenuItem value='px'>px</MenuItem>
                            <MenuItem value='%'>%</MenuItem>
                            <MenuItem value='rem'>rem</MenuItem>
                            <MenuItem value='vh'>vh</MenuItem>
                          </Select>
                        )
                      }}
                    />
                    <TextField
                      select variant='filled' fullWidth size='small' label='Object Fit'
                      value={data?.illustrationFit || 'contain'}
                      onChange={e => update({ illustrationFit: e.target.value })}
                    >
                      <MenuItem value='contain'>Contain</MenuItem>
                      <MenuItem value='cover'>Cover</MenuItem>
                      <MenuItem value='fill'>Fill</MenuItem>
                      <MenuItem value='scale-down'>Scale Down</MenuItem>
                      <MenuItem value='none'>None</MenuItem>
                    </TextField>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Breaking News Ticker */}
          <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
            <h3 className='text-main-color font-semibold text-lg'>Breaking News Ticker</h3>
            <TextField
              select
              fullWidth
              className='!mb-4'
              value={data?.tickerApi_url || ''}
              onChange={e => {
                setTickerObj(false)
                update({ tickerApi_url: e.target.value, tickerItemsPath: '', tickerTextField: '' })
              }}
              label='Ticker API URL'
              variant='filled'
              helperText='Leave empty to hide ticker'
            >
              <MenuItem value=''>None</MenuItem>
              {apiData.map(({ link }, i) => (
                <MenuItem key={i} value={link}>{link}</MenuItem>
              ))}
            </TextField>
            {data?.tickerApi_url && (
              <div className='flex justify-center'>
                <Button
                  className='!my-4'
                  variant='contained'
                  color='error'
                  onClick={() => {
                    setTickerObj(false)
                    update({ tickerApi_url: '', tickerItemsPath: '', tickerTextField: '' })
                  }}
                >
                  {messages.useUploadImage.clearData}
                </Button>
              </div>
            )}
            <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={Boolean(tickerObj)}>
              <div className='p-2 my-4 rounded border border-dashed border-main-color'>
                <h2 className='mb-4 text-2xl text-main-color'>{messages.useUploadImage.viewObject}</h2>
                <SyntaxHighlighter language='json' style={docco}>
                  {JSON.stringify(tickerObj, null, 2)}
                </SyntaxHighlighter>
                <div className='mt-4'>
                  <TextField
                    fullWidth
                    value={data?.tickerItemsPath || ''}
                    variant='filled'
                    label={messages.itemsPath}
                    onChange={e => update({ tickerItemsPath: e.target.value, tickerTextField: '' })}
                  />
                </div>
              </div>
              {/* Ticker Text Field */}
              <div className='rounded border border-dashed border-main-color'>
                <button
                  type='button'
                  className='w-full flex items-center justify-between px-3 py-2 text-main-color font-semibold text-sm hover:bg-gray-50 transition-colors rounded'
                  onClick={() => setShowTickerField(v => !v)}
                >
                  <span>Ticker Text Field</span>
                  {showTickerField ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                </button>
                <Collapse transition='height 250ms cubic-bezier(.4, 0, .2, 1)' isOpen={showTickerField}>
                  <div className='p-3 space-y-2'>
                    {(() => {
                      const firstItem = Array.isArray(tickerObj) ? tickerObj[0] : (tickerObj && typeof tickerObj === 'object' ? tickerObj : null)
                      const fields = firstItem ? Object.keys(firstItem) : []

                      return fields.length > 0 ? (
                        <TextField
                          select
                          variant='filled'
                          fullWidth
                          size='small'
                          label='Ticker Text Field'
                          value={data?.tickerTextField || ''}
                          onChange={e => update({ tickerTextField: e.target.value })}
                          helperText='Field from each item to show in the ticker'
                        >
                          {fields.map(f => (
                            <MenuItem key={f} value={f}>{f}</MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          variant='filled'
                          fullWidth
                          size='small'
                          label='Ticker Text Field Path'
                          value={data?.tickerTextField || ''}
                          onChange={e => update({ tickerTextField: e.target.value })}
                          helperText='Dot-notation path to the text field, e.g. title_ar'
                        />
                      )
                    })()}
                  </div>
                </Collapse>
              </div>
              {/* Ticker Colors */}
              <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
                <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Ticker Colors</p>
                <div className='flex items-center gap-3'>
                  <label className='text-sm flex-1'>Background Color</label>
                  <input
                    type='color'
                    value={data?.tickerBgColor || '#dc2626'}
                    onChange={e => update({ tickerBgColor: e.target.value })}
                    className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                    title='Ticker background color'
                  />
                </div>
                <div className='flex items-center gap-3'>
                  <label className='text-sm flex-1'>Text Color</label>
                  <input
                    type='color'
                    value={data?.tickerTextColor || '#ffffff'}
                    onChange={e => update({ tickerTextColor: e.target.value })}
                    className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                    title='Ticker text color'
                  />
                </div>
                <div className='flex items-center gap-3'>
                  <label className='text-sm flex-1'>Badge Background</label>
                  <input
                    type='color'
                    value={data?.tickerBadgeBg || '#ffffff'}
                    onChange={e => update({ tickerBadgeBg: e.target.value })}
                    className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                    title='Breaking badge background'
                  />
                </div>
                <div className='flex items-center gap-3'>
                  <label className='text-sm flex-1'>Badge Text Color</label>
                  <input
                    type='color'
                    value={data?.tickerBadgeTextColor || '#dc2626'}
                    onChange={e => update({ tickerBadgeTextColor: e.target.value })}
                    className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                    title='Breaking badge text color'
                  />
                </div>
              </div>
            </Collapse>
          </div>
          {/* Autoplay */}
          <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
            <h3 className='text-main-color font-semibold text-lg'>Autoplay</h3>
            <FormControlLabel
              control={<Switch checked={data?.autoplay || false} onChange={e => update({ autoplay: e.target.checked })} />}
              label='Enable Autoplay'
            />
            {data?.autoplay && (
              <TextField fullWidth size='small' type='number' label='Autoplay Delay (ms)' value={data?.autoplayDelay || 4000}
                variant='filled'
                onChange={e => update({ autoplayDelay: Number(e.target.value) })} />
            )}
          </div>
          {/* Navigation */}
          <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
            <h3 className='text-main-color font-semibold text-lg'>Navigation Arrows</h3>
            <FormControlLabel
              control={<Switch checked={data?.showNavigation !== false} onChange={e => update({ showNavigation: e.target.checked })} />}
              label='Show Navigation Arrows'
            />
            {data?.showNavigation !== false && (
              <TextField variant='filled' fullWidth size='small' label='Navigation CSS Class'
                value={data?.navigationClass || ''}
                onChange={e => update({ navigationClass: e.target.value })}
                helperText='Extra Tailwind/CSS classes for the arrow buttons' />
            )}
          </div>
          {/* Pagination */}
          <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
            <h3 className='text-main-color font-semibold text-lg'>Pagination Dots</h3>
            <FormControlLabel
              control={<Switch checked={data?.showPagination !== false} onChange={e => update({ showPagination: e.target.checked })} />}
              label='Show Pagination Dots'
            />
            {data?.showPagination !== false && (
              <TextField variant='filled' fullWidth size='small' label='Pagination CSS Class'
                value={data?.paginationClass || ''}
                onChange={e => update({ paginationClass: e.target.value })}
                helperText='Extra Tailwind/CSS classes for the pagination wrapper' />
            )}
          </div>
        </Collapse>
        {/* Button Colors & Style */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
          <h3 className='text-main-color font-semibold text-lg'>Button Colors & Style</h3>

          {/* Nav arrows */}
          <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Navigation Arrows</p>

          {/* Background Color + Opacity on same row */}
          <div className='flex items-center gap-3'>
            <label className='text-sm flex-1'>Background Color</label>
            <input
              type='color'
              value={data?.navBtnBg || '#ffffff'}
              onChange={e => update({ navBtnBg: e.target.value })}
              className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
              title='Nav button background color'
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-sm flex-1'>
              Background Opacity <span className='text-gray-400'>({data?.navBtnOpacity ?? 70}%)</span>
            </label>
            <input
              type='range'
              min={0}
              max={100}
              step={5}
              value={data?.navBtnOpacity ?? 70}
              onChange={e => update({ navBtnOpacity: Number(e.target.value) })}
              className='w-32 accent-blue-600'
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-sm flex-1'>Arrow Icon Color</label>
            <input
              type='color'
              value={data?.navBtnColor || '#333333'}
              onChange={e => update({ navBtnColor: e.target.value })}
              className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
              title='Nav button icon color'
            />
          </div>

          {/* Position & Size */}
          <div className='grid grid-cols-2 gap-2 pt-1'>
            <TextField
              variant='filled'
              size='small'
              type='number'
              label='Position from Edge (px)'
              value={data?.navBtnOffset ?? 20}
              inputProps={{ min: 0, max: 200 }}
              helperText='Distance from left/right edge'
              onChange={e => update({ navBtnOffset: Number(e.target.value) })}
            />
            <TextField
              variant='filled'
              size='small'
              type='number'
              label='Button Size (px)'
              value={data?.navBtnSize ?? 40}
              inputProps={{ min: 24, max: 80 }}
              helperText='Width & height of button'
              onChange={e => update({ navBtnSize: Number(e.target.value) })}
            />
          </div>
          {/* CTA button */}
          <p className='text-xs text-gray-500 font-medium uppercase tracking-wide pt-1'>CTA / Read More Button</p>
          <div className='flex items-center gap-3'>
            <label className='text-sm flex-1'>Button Background</label>
            <input
              type='color'
              value={data?.ctaBgColor || '#f97316'}
              onChange={e => update({ ctaBgColor: e.target.value })}
              className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
              title='CTA button background color'
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-sm flex-1'>Button Text Color</label>
            <input
              type='color'
              value={data?.ctaTextColor || '#ffffff'}
              onChange={e => update({ ctaTextColor: e.target.value })}
              className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
              title='CTA button text color'
            />
          </div>
          {/* Badge color */}
          <p className='text-xs text-gray-500 font-medium uppercase tracking-wide pt-1'>Title Badge</p>
          <div className='flex items-center gap-3'>
            <label className='text-sm flex-1'>Badge Background Color</label>
            <input
              type='color'
              value={data?.badgeBgColor || '#ea580c'}
              onChange={e => update({ badgeBgColor: e.target.value })}
              className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
              title='Badge background color'
            />
          </div>
        </div>
        {/* Slides Count */}
        <div className='p-3 rounded border border-dashed border-main-color'>
          <TextField
            variant='filled'
            fullWidth
            size='small'
            type='number'
            label={messages.slidesCount || 'Slides Per View'}
            value={data?.slidesCount || ''}
            inputProps={{ min: 1 }}
            helperText={messages.slidesCountHelper || 'How many slides are visible at once (default: 1)'}
            onChange={e => {
              const val = e.target.value
              update({ slidesCount: val === '' ? null : Number(val) })
            }}
          />
        </div>
        {/* Slide Content Position */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
          <h3 className='text-main-color font-semibold text-lg'>Slide Content Position</h3>
          <div className='grid grid-cols-2 gap-2'>
            <TextField
              variant='filled'
              size='small'
              type='number'
              label='Horizontal Offset (px)'
              value={data?.contentOffsetX ?? 32}
              inputProps={{ min: 0 }}
              helperText='Distance from start edge'
              onChange={e => update({ contentOffsetX: Number(e.target.value) })}
            />
            <TextField
              variant='filled'
              size='small'
              type='number'
              label='Vertical Offset (px)'
              value={data?.contentOffsetY ?? 48}
              inputProps={{ min: 0 }}
              helperText='Distance from bottom'
              onChange={e => update({ contentOffsetY: Number(e.target.value) })}
            />
          </div>
          <TextField
            variant='filled'
            fullWidth
            size='small'
            type='number'
            label='Content Max Width (%)'
            value={data?.contentMaxWidth ?? 55}
            inputProps={{ min: 10, max: 100 }}
            helperText='Maximum width of content block as % of slide'
            onChange={e => update({ contentMaxWidth: Number(e.target.value) })}
          />
        </div>
        {/* Height */}
        <div className='p-3 rounded border border-dashed border-main-color'>
          <TextField variant='filled' fullWidth size='small' type='number' label='Slider Height (px)' value={data?.height || 480}
            onChange={e => update({ height: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  )
}