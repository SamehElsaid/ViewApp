import React, { useState } from 'react'
import { Button, IconButton, MenuItem, TextField } from '@mui/material'
import { MdAdd, MdDelete } from 'react-icons/md'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'

export default function NewsGridControl({ data, onChange, locale, buttonRef }) {
  const { messages } = useIntl()
  const apiData = useSelector(state => state.api.data)
  const update = patch => onChange({ ...data, ...patch })
  const colorMap = data?.categoryColorMap || []
  const addColorMapping = () => update({ categoryColorMap: [...colorMap, { categoryName: '', color: '#3b5bdb' }] })
  const updateColorMapping = (i, patch) => update({ categoryColorMap: colorMap.map((c, idx) => idx === i ? { ...c, ...patch } : c) })
  const removeColorMapping = i => update({ categoryColorMap: colorMap.filter((_, idx) => idx !== i) })

  return (
    <div>
      <CloseNav text={messages?.newsGrid?.title || 'News Grid'} buttonRef={buttonRef} />
      <div className='p-3 space-y-4'>
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Section Labels</h3>
          <TextField fullWidth size='small' label='Section Title (AR)' value={data?.sectionTitle_ar || ''} onChange={e => update({ sectionTitle_ar: e.target.value })} />
          <TextField fullWidth size='small' label='Section Title (EN)' value={data?.sectionTitle_en || ''} onChange={e => update({ sectionTitle_en: e.target.value })} />
          <TextField fullWidth size='small' label='Section Subtitle (AR)' value={data?.sectionSubtitle_ar || ''} onChange={e => update({ sectionSubtitle_ar: e.target.value })} />
          <TextField fullWidth size='small' label='Section Subtitle (EN)' value={data?.sectionSubtitle_en || ''} onChange={e => update({ sectionSubtitle_en: e.target.value })} />
        </div>
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Data Source</h3>
          <TextField
            select fullWidth label='News API URL' value={data?.api_url || ''}
            onChange={e => update({ api_url: e.target.value })}
          >
            {apiData.map(({ link }, i) => <MenuItem key={i} value={link}>{link}</MenuItem>)}
          </TextField>
          <TextField fullWidth size='small' type='number' label='Max Items (default 4)' value={data?.maxItems || 4} onChange={e => update({ maxItems: Number(e.target.value) })} />
        </div>
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Field Path Mappings</h3>
          <p className='text-xs text-gray-500'>Dot-notation paths, e.g. <code>title_ar</code>, <code>media.cover</code></p>
          <TextField fullWidth size='small' label='Image URL Path' value={data?.imageUrlPath || ''} onChange={e => update({ imageUrlPath: e.target.value })} helperText='e.g. coverImage' />
          <TextField fullWidth size='small' label='Title Path' value={data?.titlePath || ''} onChange={e => update({ titlePath: e.target.value })} helperText='e.g. title_ar' />
          <TextField fullWidth size='small' label='Category Path' value={data?.categoryPath || ''} onChange={e => update({ categoryPath: e.target.value })} helperText='e.g. category' />
          <TextField fullWidth size='small' label='Date Path' value={data?.datePath || ''} onChange={e => update({ datePath: e.target.value })} helperText='e.g. publishedAt' />
          <TextField fullWidth size='small' label='URL Path' value={data?.urlPath || ''} onChange={e => update({ urlPath: e.target.value })} helperText='e.g. url, slug' />
        </div>
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <div className='flex justify-between items-center'>
            <h3 className='text-main-color font-semibold text-lg'>Category Colors</h3>
            <Button size='small' startIcon={<MdAdd />} onClick={addColorMapping}>Add</Button>
          </div>
          {colorMap.map((mapping, i) => (
            <div key={i} className='flex gap-2 items-center'>
              <TextField size='small' label='Category Name' value={mapping.categoryName || ''} onChange={e => updateColorMapping(i, { categoryName: e.target.value })} />
              <input type='color' value={mapping.color || '#3b5bdb'} onChange={e => updateColorMapping(i, { color: e.target.value })} title='Badge color' />
              <IconButton size='small' color='error' onClick={() => removeColorMapping(i)}><MdDelete /></IconButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}