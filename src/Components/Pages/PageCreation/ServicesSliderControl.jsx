import React, { useEffect, useState } from 'react'
import { MenuItem, TextField, Button } from '@mui/material'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Collapse from '@kunukn/react-collapse'
import get from 'lodash/get'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'

export default function ServicesSliderControl({ data, onChange, locale, buttonRef }) {
  const { messages } = useIntl()
  const apiData = useSelector(state => state.api.data)
  const update = patch => onChange({ ...data, ...patch })

  const [obj, setObj] = useState(false)
  const [showFieldPaths, setShowFieldPaths] = useState(true)

  useEffect(() => {
    if (data.api_url) {
      const apiResponse = apiData.find(item => item.link === data.api_url)?.data
      const items = data.itemsPath ? get(apiResponse, data.itemsPath) : apiResponse
      onChange({ ...data, items })
      setObj(apiResponse || false)
    } else {
      setObj(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.api_url, data.itemsPath])

  return (
    <div>
      <CloseNav text={messages?.servicesSlider?.title || 'News Grid'} buttonRef={buttonRef} />
      <div className='p-3 space-y-4'>

        {/* Section Labels */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
          <h3 className='text-main-color font-semibold text-lg'>Section Labels</h3>
          <TextField variant='filled' fullWidth size='small' label='Section Title (AR)' value={data?.sectionTitle_ar || ''} onChange={e => update({ sectionTitle_ar: e.target.value })} />
          <TextField variant='filled' fullWidth size='small' label='Section Title (EN)' value={data?.sectionTitle_en || ''} onChange={e => update({ sectionTitle_en: e.target.value })} />
          <TextField variant='filled' fullWidth size='small' label='Section Subtitle (AR)' value={data?.sectionSubtitle_ar || ''} onChange={e => update({ sectionSubtitle_ar: e.target.value })} />
          <TextField variant='filled' fullWidth size='small' label='Section Subtitle (EN)' value={data?.sectionSubtitle_en || ''} onChange={e => update({ sectionSubtitle_en: e.target.value })} />
          <TextField variant='filled' fullWidth size='small' label='"More" Button URL' value={data?.moreButtonUrl || ''} onChange={e => update({ moreButtonUrl: e.target.value })} />
        </div>

        {/* Data Source */}
        <TextField
          select fullWidth className='!mb-4'
          value={data.api_url || ''}
          onChange={e => {
            setObj(false)
            onChange({ ...data, api_url: e.target.value, itemsPath: '', items: [] })
          }}
          label={messages?.useUploadImage?.api || 'API URL'}
          variant='filled'
        >
          {apiData.map(({ link }, index) => (
            <MenuItem key={link + index} value={link}>{link}</MenuItem>
          ))}
        </TextField>

        {data.api_url && (
          <div className='flex justify-center'>
            <Button
              className='!my-4' variant='contained' color='error'
              onClick={() => {
                setObj(false)
                onChange({ ...data, items: [], api_url: '', itemsPath: '' })
              }}
            >
              {messages?.useUploadImage?.clearData || 'Clear Data'}
            </Button>
          </div>
        )}

        <Collapse transition='height 300ms cubic-bezier(.4, 0, .2, 1)' isOpen={Boolean(obj)}>
          {/* JSON Preview */}
          <div className='p-2 my-4 rounded border border-dashed border-main-color'>
            <h2 className='mb-4 text-2xl text-main-color'>{messages?.useUploadImage?.viewObject || 'API Response'}</h2>
            <SyntaxHighlighter language='json' style={docco}>
              {JSON.stringify(obj, null, 2)}
            </SyntaxHighlighter>
            <div className='mt-4'>
              <TextField
                fullWidth value={data.itemsPath || ''} variant='filled'
                label={messages?.itemsPath || 'Items Path'}
                helperText='Dot-notation path to the items array, e.g. data.news'
                onChange={e => onChange({ ...data, itemsPath: e.target.value })}
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
              <span>{messages?.fieldPathMappings || 'Field Path Mappings'}</span>
              {showFieldPaths ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </button>
            <Collapse transition='height 250ms cubic-bezier(.4, 0, .2, 1)' isOpen={showFieldPaths}>
              <div className='p-3 space-y-2'>
                <p className='text-xs text-gray-500'>Dot-notation paths inside each item</p>
                <p className='text-xs font-semibold text-gray-600 pt-1'>Title</p>
                <div className='grid grid-cols-2 gap-2'>
                  <TextField variant='filled' fullWidth size='small' label='Title Path (AR)' value={data?.titlePath_ar || ''} onChange={e => update({ titlePath_ar: e.target.value })} helperText='e.g. title_ar' />
                  <TextField variant='filled' fullWidth size='small' label='Title Path (EN)' value={data?.titlePath_en || ''} onChange={e => update({ titlePath_en: e.target.value })} helperText='e.g. title_en' />
                </div>
                <TextField variant='filled' fullWidth size='small' label='Card Image Path' value={data?.imagePath || ''} onChange={e => update({ imagePath: e.target.value })} helperText='e.g. imageUrl, media.url, thumbnail' />
                <p className='text-xs font-semibold text-gray-600 pt-1'>Category / Badge</p>
                <div className='grid grid-cols-2 gap-2'>
                  <TextField variant='filled' fullWidth size='small' label='Category Path (AR)' value={data?.categoryPath_ar || ''} onChange={e => update({ categoryPath_ar: e.target.value })} helperText='e.g. category.name_ar' />
                  <TextField variant='filled' fullWidth size='small' label='Category Path (EN)' value={data?.categoryPath_en || ''} onChange={e => update({ categoryPath_en: e.target.value })} helperText='e.g. category.name_en' />
                </div>
                <TextField variant='filled' fullWidth size='small' label='Category Color Path' value={data?.categoryColorPath || ''} onChange={e => update({ categoryColorPath: e.target.value })} helperText='e.g. category.color (hex). Falls back to Badge Color below' />
                <TextField variant='filled' fullWidth size='small' label='Date Path' value={data?.datePath || ''} onChange={e => update({ datePath: e.target.value })} helperText='e.g. publishedAt, created_at — يُعرض بالعربي تلقائياً' />
                <TextField variant='filled' fullWidth size='small' label='Author Path' value={data?.authorPath || ''} onChange={e => update({ authorPath: e.target.value })} helperText='e.g. author.name, reporter' />
                <TextField variant='filled' fullWidth size='small' label='URL Path' value={data?.urlPath || ''} onChange={e => update({ urlPath: e.target.value })} helperText='e.g. url, link, slug' />
              </div>
            </Collapse>
          </div>

          {/* Colors */}
          <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
            <h3 className='text-main-color font-semibold text-sm uppercase tracking-wide'>Colors</h3>
            <div className='flex items-center gap-3'>
              <label className='text-sm text-gray-600 flex-1'>Badge Color (fallback)</label>
              <input type='color' value={data?.highlightColor || '#3b5bdb'} onChange={e => update({ highlightColor: e.target.value })}
                className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5' />
            </div>
          </div>

          {/* Grid Height */}
          <div className='p-3 rounded border border-dashed border-main-color'>
            <TextField
              variant='filled' fullWidth size='small' type='number'
              label='Grid Height (px)'
              value={data?.height || 500}
              onChange={e => update({ height: Number(e.target.value) })}
              helperText='Total height of the featured grid block'
            />
          </div>
        </Collapse>
      </div>
    </div>
  )
}
