import React, { useState } from 'react'
import { Button, IconButton, Switch, TextField, FormControlLabel } from '@mui/material'
import { MdAdd, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useIntl } from 'react-intl'
import CloseNav from './CloseNav'

export default function PortalNavControl({ data, onChange, locale, buttonRef }) {
  const { messages } = useIntl()
  const [expandedLink, setExpandedLink] = useState(null)
  const links = data?.navLinks || []
  const update = patch => onChange({ ...data, ...patch })

  const addLink = () => {
    update({ navLinks: [...links, { label_ar: '', label_en: '', url: '', isActive: false, children: [] }] })
  }

  const updateLink = (i, patch) => {
    const next = links.map((l, idx) => (idx === i ? { ...l, ...patch } : l))
    update({ navLinks: next })
  }

  const removeLink = i => {
    update({ navLinks: links.filter((_, idx) => idx !== i) })
  }

  const addChild = i => {
    const next = links.map((l, idx) =>
      idx === i ? { ...l, children: [...(l.children || []), { label_ar: '', label_en: '', url: '' }] } : l
    )
    update({ navLinks: next })
  }

  const updateChild = (i, ci, patch) => {
    const next = links.map((l, idx) =>
      idx === i
        ? { ...l, children: l.children.map((c, cidx) => (cidx === ci ? { ...c, ...patch } : c)) }
        : l
    )
    update({ navLinks: next })
  }

  const removeChild = (i, ci) => {
    const next = links.map((l, idx) =>
      idx === i ? { ...l, children: l.children.filter((_, cidx) => cidx !== ci) } : l
    )
    update({ navLinks: next })
  }
  
  return (
    <div>
      <CloseNav text={messages?.portalNav?.title || 'Portal Nav'} buttonRef={buttonRef} />
      <div className='p-3 space-y-4'>
        {/* Logo */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold'>Logo</h3>
          <TextField
            fullWidth size='small' label='Logo URL or file path'
            value={data?.logoUrl || ''}
            onChange={e => update({ logoUrl: e.target.value })}
            helperText='Full URL or file path from /file/download/'
          />
          <TextField
            fullWidth size='small' label='Site Name'
            value={data?.siteName || ''}
            onChange={e => update({ siteName: e.target.value })}
          />
        </div>
        {/* Colors */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold'>Colors</h3>
          <div className='flex gap-2 items-center'>
            <label className='text-sm text-gray-600'>Background</label>
            <input type='color' value={data?.backgroundColor || '#ffffff'} onChange={e => update({ backgroundColor: e.target.value })} />
          </div>
          <div className='flex gap-2 items-center'>
            <label className='text-sm text-gray-600'>Text Color</label>
            <input type='color' value={data?.textColor || '#333333'} onChange={e => update({ textColor: e.target.value })} />
          </div>
        </div>
        {/* Login Button */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold'>Login Button</h3>
          <FormControlLabel
            control={<Switch checked={data?.showLoginButton || false} onChange={e => update({ showLoginButton: e.target.checked })} />}
            label='Show Login Button'
          />
          {data?.showLoginButton && (
            <>
              <TextField fullWidth size='small' label='Label (AR)' value={data?.loginButtonText_ar || ''} onChange={e => update({ loginButtonText_ar: e.target.value })} />
              <TextField fullWidth size='small' label='Label (EN)' value={data?.loginButtonText_en || ''} onChange={e => update({ loginButtonText_en: e.target.value })} />
              <TextField fullWidth size='small' label='Login URL' value={data?.loginButtonLink || ''} onChange={e => update({ loginButtonLink: e.target.value })} />
              <div className='flex gap-2 items-center'>
                <label className='text-sm text-gray-600'>Button Color</label>
                <input type='color' value={data?.loginButtonBgColor || '#3b5bdb'} onChange={e => update({ loginButtonBgColor: e.target.value })} />
              </div>
            </>
          )}
        </div>
        {/* Nav Links */}
        <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
          <div className='flex justify-between items-center'>
            <h3 className='text-main-color font-semibold'>Navigation Links</h3>
            <Button size='small' variant='outlined' startIcon={<MdAdd />} onClick={addLink}>Add Link</Button>
          </div>
          {links.map((link, i) => (
            <div key={i} className='border border-gray-200 rounded p-2 space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-xs font-medium text-gray-500'>Link {i + 1}</span>
                <div className='flex gap-1'>
                  <IconButton size='small' onClick={() => setExpandedLink(expandedLink === i ? null : i)}>
                    {expandedLink === i ? <MdExpandLess /> : <MdExpandMore />}
                  </IconButton>
                  <IconButton size='small' color='error' onClick={() => removeLink(i)}><MdDelete /></IconButton>
                </div>
              </div>
              <TextField fullWidth size='small' label='Label (AR)' value={link.label_ar || ''} onChange={e => updateLink(i, { label_ar: e.target.value })} />
              <TextField fullWidth size='small' label='Label (EN)' value={link.label_en || ''} onChange={e => updateLink(i, { label_en: e.target.value })} />
              <TextField fullWidth size='small' label='URL' value={link.url || ''} onChange={e => updateLink(i, { url: e.target.value })} />
              {expandedLink === i && (
                <div className='ms-3 mt-2 space-y-2 border-l-2 border-blue-200 pl-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-500'>Dropdown Items</span>
                    <Button size='small' onClick={() => addChild(i)}>+ Add</Button>
                  </div>
                  {(link.children || []).map((child, ci) => (
                    <div key={ci} className='space-y-1'>
                      <div className='flex gap-1 items-center'>
                        <TextField size='small' label='Label (AR)' value={child.label_ar || ''} onChange={e => updateChild(i, ci, { label_ar: e.target.value })} />
                        <TextField size='small' label='Label (EN)' value={child.label_en || ''} onChange={e => updateChild(i, ci, { label_en: e.target.value })} />
                        <IconButton size='small' color='error' onClick={() => removeChild(i, ci)}><MdDelete /></IconButton>
                      </div>
                      <TextField fullWidth size='small' label='URL' value={child.url || ''} onChange={e => updateChild(i, ci, { url: e.target.value })} />
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

