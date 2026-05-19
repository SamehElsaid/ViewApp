import React from 'react'
import { Button, FormControlLabel, IconButton, MenuItem, Switch, TextField } from '@mui/material'
import { MdAdd, MdDelete } from 'react-icons/md'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'

export default function LogosCarouselControl({ data, onChange, locale, buttonRef }) {
  const { messages } = useIntl()
  const apiData = useSelector(state => state.api.data)
  const update = patch => onChange({ ...data, ...patch })
  const logos = data?.logos || []
  const addLogo = () => update({ logos: [...logos, { image: '', link: '#', alt: '' }] })
  const updateLogo = (i, patch) => update({ logos: logos.map((l, idx) => idx === i ? { ...l, ...patch } : l) })
  const removeLogo = i => update({ logos: logos.filter((_, idx) => idx !== i) })
  
  return (
    <div>
      <CloseNav text={messages?.logosCarousel?.title || 'Logos Carousel'} buttonRef={buttonRef} />
      <div className='p-3 space-y-4'>
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Section Labels</h3>
          <TextField fullWidth size='small' label='Title (AR)' value={data?.title_ar || ''} onChange={e => update({ title_ar: e.target.value })} />
          <TextField fullWidth size='small' label='Title (EN)' value={data?.title_en || ''} onChange={e => update({ title_en: e.target.value })} />
          <TextField fullWidth size='small' label='Description (AR)' value={data?.description_ar || ''} onChange={e => update({ description_ar: e.target.value })} />
          <TextField fullWidth size='small' label='Description (EN)' value={data?.description_en || ''} onChange={e => update({ description_en: e.target.value })} />
        </div>
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Dynamic Data Source (optional)</h3>
          <TextField
            select fullWidth label='Logos API URL' value={data?.api_url || ''}
            onChange={e => update({ api_url: e.target.value })}
            helperText='If set, logos are fetched from backend. Otherwise use the static list below.'
          >
            <MenuItem value=''>None (use static list)</MenuItem>
            {apiData.map(({ link }, i) => <MenuItem key={i} value={link}>{link}</MenuItem>)}
          </TextField>
          {data?.api_url && (
            <>
              <TextField fullWidth size='small' label='Image URL Path' value={data?.imageUrlPath || ''} onChange={e => update({ imageUrlPath: e.target.value })} helperText='e.g. logoUrl' />
              <TextField fullWidth size='small' label='Link Path' value={data?.linkPath || ''} onChange={e => update({ linkPath: e.target.value })} helperText='e.g. website' />
              <TextField fullWidth size='small' label='Alt Text Path' value={data?.altPath || ''} onChange={e => update({ altPath: e.target.value })} helperText='e.g. name' />
            </>
          )}
        </div>
        {!data?.api_url && (
          <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
            <div className='flex justify-between items-center'>
              <h3 className='text-main-color font-semibold text-lg'>Static Logos</h3>
              <Button size='small' startIcon={<MdAdd />} onClick={addLogo}>Add Logo</Button>
            </div>
            {logos.map((logo, i) => (
              <div key={i} className='border border-gray-200 rounded p-2 space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-xs text-gray-500'>Logo {i + 1}</span>
                  <IconButton size='small' color='error' onClick={() => removeLogo(i)}><MdDelete /></IconButton>
                </div>
                <TextField fullWidth size='small' label='Image URL or path' value={logo.image || ''} onChange={e => updateLogo(i, { image: e.target.value })} />
                <TextField fullWidth size='small' label='Link URL' value={logo.link || ''} onChange={e => updateLogo(i, { link: e.target.value })} />
                <TextField fullWidth size='small' label='Alt text' value={logo.alt || ''} onChange={e => updateLogo(i, { alt: e.target.value })} />
              </div>
            ))}
          </div>
        )}
        <div className='p-3 rounded border border-dashed border-main-color space-y-2'>
          <h3 className='text-main-color font-semibold text-lg'>Display Options</h3>
          <FormControlLabel
            control={<Switch checked={data?.grayscale !== false} onChange={e => update({ grayscale: e.target.checked })} />}
            label='Grayscale (color on hover)'
          />
          <TextField fullWidth size='small' type='number' label='Autoplay Speed (ms)' value={data?.autoplaySpeed || 2500} onChange={e => update({ autoplaySpeed: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  )
}