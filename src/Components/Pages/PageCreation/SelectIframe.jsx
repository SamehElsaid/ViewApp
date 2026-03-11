/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  TextField
} from '@mui/material'
import { useIntl } from 'react-intl'
import { axiosGet } from 'src/Components/axiosCall'
import CloseNav from './CloseNav'

function SelectIframe({ data, onChange, buttonRef, title }) {
  const { locale, messages } = useIntl()

  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)

  const [localData, setLocalData] = useState({
    src: '',
    width: '100%',
    height: 600,
    title: ''
  })

  /* ---------------- Sync react-page data ---------------- */
  useEffect(() => {
    if (data) {
      setLocalData(prev => ({ ...prev, ...data }))
    }
  }, [data])

  /* ---------------- Load iframe URLs ---------------- */
  useEffect(() => {
    let mounted = true
    setLoading(true)

    axiosGet('static-lookup/get-all-iframe-URLs', locale)
      .then(res => {
        if (mounted && res?.status && res?.isSuccess) {
          setOptions(res.data ?? [])
        } else {
          setOptions([])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [locale])

  /* ---------------- Helper ---------------- */
  const update = next => {
    setLocalData(next)
    onChange(next)
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="h-full flex flex-col">
      <CloseNav text={title} buttonRef={buttonRef} />

      <form className="flex flex-col gap-4 p-4" onSubmit={e => e.preventDefault()}>
        {/* Iframe URL */}
        <FormControl fullWidth>
          <Autocomplete
            options={loading ? [] : options}
            loading={loading}
            value={
              options.find(o => o === localData.src) || null
            }
            getOptionLabel={option => option || ''}
            onChange={(e, value) => {
              update({
                ...localData,
                src: value || ''
              })
            }}
            renderInput={params => (
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                {...params}
                label={messages?.dialogs?.iframeUrl || 'Iframe URL'}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </FormControl>

        {/* Height */}
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          label={messages?.dialogs?.height || 'Height (px)'}
          type="number"
          value={localData.height}
          inputProps={{ min: 100 }}
          onChange={e => update({ ...localData, height: Number(e.target.value) }) }
        />

        {/* Width */}
        <TextField
            variant="outlined"
            size="small"
            fullWidth
            label={messages?.dialogs?.width || 'Width'}
            value={localData.width}
            onChange={e => update({ ...localData, width: e.target.value }) }
          />
      </form>
    </div>
  )
}

export default SelectIframe
