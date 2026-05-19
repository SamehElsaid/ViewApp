import React, { useEffect, useState } from 'react'
import { MenuItem, TextField, Switch, FormControlLabel } from '@mui/material'
import { Button } from '@mui/material'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Collapse from '@kunukn/react-collapse'
import get from 'lodash/get'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'

export default function MinistersTimelineControl({ data, onChange, locale, buttonRef }) {
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
            if (items) setObj(items)
            else setObj(prev => prev ? prev : false)

        } else {
            setObj(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.api_url, data.itemsPath])

    return (
        <div>
            <CloseNav text={messages?.ministersTimeline?.title || 'Ministers Timeline'} buttonRef={buttonRef} />
            <div className='p-3 space-y-4'>
                {/* Section Labels */}
                <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
                    <h3 className='text-main-color font-semibold text-lg'>Section Labels</h3>
                    <TextField variant='filled' fullWidth size='small' label='Section Title (AR)' value={data?.sectionTitle_ar || ''} onChange={e => update({ sectionTitle_ar: e.target.value })} />
                    <TextField variant='filled' fullWidth size='small' label='Section Title (EN)' value={data?.sectionTitle_en || ''} onChange={e => update({ sectionTitle_en: e.target.value })} />
                    <TextField variant='filled' fullWidth size='small' label='Section Subtitle (AR)' value={data?.sectionSubtitle_ar || ''} onChange={e => update({ sectionSubtitle_ar: e.target.value })} />
                    <TextField variant='filled' fullWidth size='small' label='Section Subtitle (EN)' value={data?.sectionSubtitle_en || ''} onChange={e => update({ sectionSubtitle_en: e.target.value })} />
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
                                helperText='Dot-notation path to the items array, e.g. data.ministers'
                                onChange={e => onChange({ ...data, itemsPath: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Field Path Mappings */}
                    <div className='rounded border border-dashed border-main-color mb-4'>
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
                                <p className='text-xs text-gray-500'>Dot-notation paths inside each item. Leave blank to use defaults.</p>
                                <p className='text-xs font-semibold text-gray-600 pt-1'>Name</p>
                                <div className='grid grid-cols-2 gap-2'>
                                    <TextField variant='filled' fullWidth size='small' label='Name Path (AR)' value={data?.namePath_ar || ''} onChange={e => update({ namePath_ar: e.target.value })} helperText='e.g. name_ar' />
                                    <TextField variant='filled' fullWidth size='small' label='Name Path (EN)' value={data?.namePath_en || ''} onChange={e => update({ namePath_en: e.target.value })} helperText='e.g. name_en' />
                                </div>
                                <p className='text-xs font-semibold text-gray-600 pt-1'>Period</p>
                                <div className='grid grid-cols-2 gap-2'>
                                    <TextField variant='filled' fullWidth size='small' label='Period From Path' value={data?.periodPath_from || ''} onChange={e => update({ periodPath_from: e.target.value })} helperText='e.g. start_year' />
                                    <TextField variant='filled' fullWidth size='small' label='Period To Path' value={data?.periodPath_to || ''} onChange={e => update({ periodPath_to: e.target.value })} helperText='e.g. end_year' />
                                </div>
                                <p className='text-xs font-semibold text-gray-600 pt-1'>Bio</p>
                                <div className='grid grid-cols-2 gap-2'>
                                    <TextField variant='filled' fullWidth size='small' label='Bio Path (AR)' value={data?.bioPath_ar || ''} onChange={e => update({ bioPath_ar: e.target.value })} helperText='e.g. bio_ar' />
                                    <TextField variant='filled' fullWidth size='small' label='Bio Path (EN)' value={data?.bioPath_en || ''} onChange={e => update({ bioPath_en: e.target.value })} helperText='e.g. bio_en' />
                                </div>
                                <TextField variant='filled' fullWidth size='small' label='Image Path' value={data?.imagePath || ''} onChange={e => update({ imagePath: e.target.value })} helperText='e.g. imageUrl, photo, media.url' />
                            </div>
                        </Collapse>
                    </div>
                    {/* Display Options */}
                    <div className='p-3 rounded border border-dashed border-main-color space-y-3'>
                        <h3 className='text-main-color font-semibold text-sm uppercase tracking-wide'>Display Options</h3>
                        <div className='flex items-center gap-3'>
                            <label className='text-sm text-gray-600 flex-1'>Accent Color</label>
                            <input
                                type='color'
                                value={data?.accentColor || '#1a3d6b'}
                                onChange={e => update({ accentColor: e.target.value })}
                                className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                            />
                        </div>
                        <div className='flex items-center gap-3'>
                            <label className='text-sm text-gray-600 flex-1'>Card Background</label>
                            <input
                                type='color'
                                value={data?.cardBg || '#ffffff'}
                                onChange={e => update({ cardBg: e.target.value })}
                                className='w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5'
                            />
                        </div>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={data?.showImages !== false}
                                    onChange={e => update({ showImages: e.target.checked })}
                                    size='small'
                                />
                            }
                            label={<span className='text-sm text-gray-600'>Show Person Photo</span>}
                        />
                        <TextField
                            variant='filled' fullWidth size='small' type='number'
                            label='Bio Line Limit (0 = no limit)'
                            value={data?.bioLineLimit || 0}
                            onChange={e => update({ bioLineLimit: Number(e.target.value) })}
                            helperText='Maximum lines of bio text to show'
                        />
                        <TextField
                            variant='filled' fullWidth size='small' type='number'
                            label='Detail Panel Min Height (px)'
                            value={data?.minHeight || 300}
                            onChange={e => update({ minHeight: Number(e.target.value) })}
                        />
                    </div>
                </Collapse>
            </div>
        </div>
    )
}