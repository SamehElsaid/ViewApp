import { Delete } from '@mui/icons-material'
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
import { toast } from 'react-toastify'
import { replacePlaceholders } from 'src/Components/_Shared'
import { decryptData } from 'src/Components/encryption'
import JsonEditor from 'src/Components/JsonEditor'
import { setApiData } from 'src/store/apps/apiSlice/apiSlice'

export default function ApiData({ open, setOpen, initialDataApi }) {
  const { messages } = useIntl()
  const [links, setLinks] = useState([])
  const [link, setLink] = useState('')
  const dispatch = useDispatch()


  useEffect(() => {
    setLinks(initialDataApi ?? [])
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
    const linksToFetch = links.filter(link => link.loading)

    const authToken = Cookies.get('sub')
    const apiHeaders = {}
    if (authToken) {
      apiHeaders.Authorization = `Bearer ${decryptData(authToken).token.trim()}`
    }
    
    if (linksToFetch.length > 0) {
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
              loading: true,
              headers: linkObj.headers ?? {},
              method: linkObj.method,
              error: error.message
            }))
        })
      ).then(updatedLinks => {
        dispatch(setApiData(updatedLinks))
      })
    }
    
  }, [links, dispatch])

  const [apiHeaders, setApiHeaders] = useState('{}')
  const [method, setMethod] = useState('GET')

  const headersParsed = useMemo(() => {
    try {
      return JSON.parse(apiHeaders)
    } catch (e) {
      return null
    }
  }, [apiHeaders])

  const linkRegex =
    /^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._+~#?&//=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)?(\{[a-zA-Z0-9_]+\})?/i

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>{messages.Api.addApiData}</DialogTitle>
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
          {links.map((link, index) => (
            <div className='p-2 rounded-md border border-dashed border-main-color' key={index}>
              <div className='flex justify-between items-center'>
                <div className='text-main-color break-all'>{link.link}</div>
                <IconButton onClick={() => setLinks(prev => prev.filter((_, i) => i !== index))}>
                  <Delete />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        <div className='flex justify-end'>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              // if (!linkRegex.test(link.trim())) {
              //   return toast.error(messages.Api.invalidLink)
              // }

              setLinks(prev => [
                ...prev,
                {
                  data: null,
                  headers: apiHeaders,
                  method: method,
                  link: link.trim(),
                  loading: true
                }
              ])
              setLink('')
              setApiHeaders('{}')
              setMethod('GET')
            }}
          >
            {messages.add}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
