import React, { useState } from 'react'
import { Button, IconButton, TextField } from '@mui/material'
import { MdAdd, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useIntl } from 'react-intl'
import CloseNav from './CloseNav'

export default function PortalFooterControl({ data, onChange, locale, buttonRef }) {
  const { messages } = useIntl()
  const [expandedCol, setExpandedCol] = useState(null)
  const update = patch => onChange({ ...data, ...patch })
  const columns = data?.columns || []
  const addColumn = () => update({ columns: [...columns, { title_ar: '', title_en: '', links: [] }] })
  const updateColumn = (i, patch) => update({ columns: columns.map((c, idx) => idx === i ? { ...c, ...patch } : c) })
  const removeColumn = i => update({ columns: columns.filter((_, idx) => idx !== i) })
 
  const addLink = i => {
    const next = columns.map((c, idx) => idx === i ? { ...c, links: [...(c.links || []), { label_ar: '', label_en: '', url: '' }] } : c)
    update({ columns: next })
  }

  const updateLink = (ci, li, patch) => {
    const next = columns.map((c, idx) => idx === ci ? { ...c, links: c.links.map((l, lidx) => lidx === li ? { ...l, ...patch } : l) } : c)
    update({ columns: next })
  }

  const removeLink = (ci, li) => {
    const next = columns.map((c, idx) => idx === ci ? { ...c, links: c.links.filter((_, lidx) => lidx !== li) } : c)
    update({ columns: next })
  }
  
  return (
    <div>
      <CloseNav text={messages?.portalFooter?.title || 'Portal Footer'} buttonRef={buttonRef} />
      <div className='p-3 space-y-4'>
        {/* Colors */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Colors</h3>
          <div className='flex gap-4 flex-wrap'>
            <div className='flex gap-2 items-center'><label className='text-xs text-gray-500'>Background</label><input type='color' value={data?.backgroundColor || '#2d3748'} onChange={e => update({ backgroundColor: e.target.value })} /></div>
            <div className='flex gap-2 items-center'><label className='text-xs text-gray-500'>Text</label><input type='color' value={data?.textColor || '#e2e8f0'} onChange={e => update({ textColor: e.target.value })} /></div>
            <div className='flex gap-2 items-center'><label className='text-xs text-gray-500'>Links</label><input type='color' value={data?.linkColor || '#a0aec0'} onChange={e => update({ linkColor: e.target.value })} /></div>
          </div>
        </div>
        {/* Logo + Copyright */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Logo & Copyright</h3>
          <TextField fullWidth size='small' label='Logo URL or file path' value={data?.logoUrl || ''} onChange={e => update({ logoUrl: e.target.value })} />
          <TextField fullWidth size='small' label='Copyright (AR)' value={data?.copyright_ar || ''} onChange={e => update({ copyright_ar: e.target.value })} />
          <TextField fullWidth size='small' label='Copyright (EN)' value={data?.copyright_en || ''} onChange={e => update({ copyright_en: e.target.value })} />
        </div>
        {/* Social */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Social Media URLs</h3>
          <TextField fullWidth size='small' label='Twitter / X URL' value={data?.twitterUrl || ''} onChange={e => update({ twitterUrl: e.target.value })} />
          <TextField fullWidth size='small' label='Instagram URL' value={data?.instagramUrl || ''} onChange={e => update({ instagramUrl: e.target.value })} />
          <TextField fullWidth size='small' label='Facebook URL' value={data?.facebookUrl || ''} onChange={e => update({ facebookUrl: e.target.value })} />
        </div>
        {/* Columns */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
          <div className='flex justify-between items-center'>
            <h3 className='text-main-color font-semibold text-lg'>Columns</h3>
            <Button size='small' variant='outlined' startIcon={<MdAdd />} onClick={addColumn}>Add Column</Button>
          </div>
          {columns.map((col, ci) => (
            <div key={ci} className='border border-gray-200 rounded p-2 space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-xs font-medium text-gray-500'>Column {ci + 1}</span>
                <div className='flex gap-1'>
                  <IconButton size='small' onClick={() => setExpandedCol(expandedCol === ci ? null : ci)}>
                    {expandedCol === ci ? <MdExpandLess /> : <MdExpandMore />}
                  </IconButton>
                  <IconButton size='small' color='error' onClick={() => removeColumn(ci)}><MdDelete /></IconButton>
                </div>
              </div>
              <TextField fullWidth size='small' label='Title (AR)' value={col.title_ar || ''} onChange={e => updateColumn(ci, { title_ar: e.target.value })} />
              <TextField fullWidth size='small' label='Title (EN)' value={col.title_en || ''} onChange={e => updateColumn(ci, { title_en: e.target.value })} />
              {expandedCol === ci && (
                <div className='ms-2 space-y-2 border-l-2 border-blue-200 pl-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-500'>Links (max 37 chars each)</span>
                    <Button size='small' onClick={() => addLink(ci)}>+ Add Link</Button>
                  </div>
                  {(col.links || []).map((link, li) => (
                    <div key={li} className='flex gap-1 items-center flex-wrap'>
                      <TextField size='small' label='Label (AR)' value={link.label_ar || ''} onChange={e => updateLink(ci, li, { label_ar: e.target.value })} />
                      <TextField size='small' label='Label (EN)' value={link.label_en || ''} onChange={e => updateLink(ci, li, { label_en: e.target.value })} />
                      <TextField size='small' label='URL' value={link.url || ''} onChange={e => updateLink(ci, li, { url: e.target.value })} />
                      <IconButton size='small' color='error' onClick={() => removeLink(ci, li)}><MdDelete /></IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

