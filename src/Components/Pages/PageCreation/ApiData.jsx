import { Delete, Edit } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useState, useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { replacePlaceholders } from 'src/Components/_Shared'
import { staticToken } from 'src/Components/axiosCall'
import { decryptData } from 'src/Components/encryption'
import JsonEditor from 'src/Components/JsonEditor'
import { removeWithLink, setApiData } from 'src/store/apps/apiSlice/apiSlice'

function generateId() {
  return `api_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function ensureId(item) {
  return item.id ? item : { ...item, id: generateId() }
}

function headersToEditorString(h) {
  if (h == null || h === '') return '{}'
  if (typeof h === 'string') {
    try {
      JSON.parse(h)

      return h
    } catch {
      return '{}'
    }
  }
  if (typeof h === 'object') return JSON.stringify(h, null, 2)

  return '{}'
}

export default function ApiData({ open, setOpen, initialDataApi }) {
  const { messages } = useIntl()
  const [links, setLinks] = useState([])
  const [link, setLink] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const dispatch = useDispatch()


  useEffect(() => {
    setLinks((initialDataApi ?? []).map(ensureId))
  }, [initialDataApi])

  const replaceVars = value => {
    const params = new URLSearchParams(window.location.search)
    const query = Object.fromEntries(params.entries())
    if (typeof value === 'string') {
      return value.replace(/\{\{(.*?)\}\}/g, (_, key) => query[key] ?? '')
    }
    if (Array.isArray(value)) {
      return value.map(replaceVars)
    }
    if (typeof value === 'object' && value !== null) {
      const result = {}
      for (const k in value) result[k] = replaceVars(value[k])

      return result
    }

    return value
  }

  useEffect(() => {
    if (!links || links.length === 0) return

    // Immediately sync links (with their IDs) to Redux so IDs are always
    // persisted in the store before any save, regardless of fetch status.
    dispatch(setApiData(links))

    const linksToFetch = links?.filter(link => link.loading)

    const authToken = Cookies.get('sub')
    const apiHeaders = {}
    if (authToken) {
      apiHeaders.Authorization = staticToken || `Bearer ${decryptData(authToken)?.token?.trim()}`
    }

    if (linksToFetch.length > 0) {
      const snapshotLinks = links
      Promise.all(
        linksToFetch.map(linkObj => {
          const resolvedLink = replacePlaceholders(linkObj.link, window.location)
          const body = replaceVars(linkObj.headers)
          let headers = {}

          try {
            headers = JSON.parse(body)
          } catch (error) {
            headers = {}
          }

          let request

          if (linkObj.method === 'GET') {
            request = axios.get(resolvedLink, { headers: apiHeaders })
          } else {
            request = axios[linkObj.method.toLowerCase()](
              resolvedLink,
              headers,
              { headers: apiHeaders }
            )
          }

          return request
            .then(response => ({
              ...linkObj,
              data: response.data,
              headers: linkObj.headers ?? {},
              method: linkObj.method,
              loading: false
            }))
            .catch(error => ({
              ...linkObj,
              data: null,
              loading: false,
              headers: linkObj.headers ?? {},
              method: linkObj.method,
              error: error.message
            }))
        })
      ).then(fetchedResults => {
        const fetchedById = Object.fromEntries(fetchedResults.map(r => [r.id, r]))
        const merged = snapshotLinks.map(l => fetchedById[l.id] ?? l)
        dispatch(setApiData(merged))
      })
    }

  }, [links, dispatch])

  const [apiHeaders, setApiHeaders] = useState('{}')
  const [method, setMethod] = useState('GET')

  const resetForm = () => {
    setLink('')
    setApiHeaders('{}')
    setMethod('GET')
    setEditingIndex(null)
  }

  const headersParsed = useMemo(() => {
    try {
      return JSON.parse(apiHeaders)
    } catch (e) {
      return null
    }
  }, [apiHeaders])

  const applyAddOrEdit = () => {
    if (headersParsed === null) return
    const trimmed = link.trim()
    if (!trimmed) return

    if (editingIndex !== null) {
      setLinks(prev => {
        const old = prev[editingIndex]
        if (old?.link && old.link !== trimmed) {
          dispatch(removeWithLink(old.link))
        }

        return prev.map((item, i) =>
          i === editingIndex
            ? {
                ...item,
                link: trimmed,
                method,
                headers: apiHeaders,
                data: null,
                loading: true,
                error: undefined
              }
            : item
        )
      })
      resetForm()
    } else {
      setLinks(prev => [
        ...prev,
        {
          id: generateId(),
          data: null,
          headers: apiHeaders,
          method,
          link: trimmed,
          loading: true
        }
      ])
      setLink('')
      setApiHeaders('{}')
      setMethod('GET')
    }
  }


  
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false)
        resetForm()
      }}
      fullWidth
    >
      <DialogTitle>{editingIndex !== null ? messages.Api.editApiData : messages.Api.addApiData}</DialogTitle>
      <DialogContent>
        <div className='mt-3'></div>
        <TextField
          value={link}
          onChange={e => setLink(e.target.value)}
          label={messages.Api.link}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select variant='filled' value={method} onChange={e => setMethod(e.target.value)}>
                  <MenuItem value='GET'>GET</MenuItem>
                  <MenuItem value='POST'>POST</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />
        <div className='mt-4'>
          <JsonEditor
            value={apiHeaders}
            onChange={setApiHeaders}
            height='150px'
            isError={headersParsed === null}
            helperText={headersParsed === null ? messages?.dialogs?.invalidJson || 'Invalid JSON format' : ''}
          />
        </div>
        <div className='flex flex-col gap-2 mt-4'>
          {links && links?.map((link, index) => (
            <div className='p-2 rounded-md border border-dashed border-main-color' key={link.id ?? index}>
              <div className='flex justify-between items-center'>
                <div className='text-main-color break-all'>{link.link}</div>
                <div className='flex items-center shrink-0'>
                  <IconButton
                    aria-label={messages.edit}
                    onClick={() => {
                      setLink(link.link ?? '')
                      setMethod(link.method ?? 'GET')
                      setApiHeaders(headersToEditorString(link.headers))
                      setEditingIndex(index)
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label={messages.delete}
                    onClick={() => {
                      dispatch(removeWithLink(link.link))
                      setLinks(prev => prev.filter((_, i) => i !== index))
                      setEditingIndex(ei => {
                        if (ei === null) return null
                        if (ei === index) return null
                        if (ei > index) return ei - 1

                        return ei
                      })
                    }}
                  >
                    <Delete />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          {editingIndex !== null && (
            <Button variant='outlined' color='secondary' onClick={resetForm}>
              {messages.cancel}
            </Button>
          )}
          <Button variant='contained' color='primary' onClick={applyAddOrEdit}>
            {editingIndex !== null ? messages.save : messages.add}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
