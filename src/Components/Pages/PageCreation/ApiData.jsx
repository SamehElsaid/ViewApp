import { Delete } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField
} from '@mui/material'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { replacePlaceholders } from 'src/Components/_Shared'
import { setApiData } from 'src/store/apps/apiSlice/apiSlice'

export default function ApiData({ open, setOpen, initialDataApi }) {
  const { messages } = useIntl()
  const [links, setLinks] = useState([])
  const [link, setLink] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    setLinks(initialDataApi ?? [])
  }, [initialDataApi])



  useEffect(() => {
    const linksToFetch = links.filter(link => link.loading)

    if (linksToFetch.length > 0) {
      Promise.all(
        linksToFetch.map(linkObj => {
          const resolvedLink = replacePlaceholders(linkObj.link, window.location)

          return axios
            .get(resolvedLink)
            .then(response => ({
              ...linkObj,
              data: response.data,
              loading: false
            }))
            .catch(error => ({
              ...linkObj,
              data: null,
              loading: false,
              error: error.message
            }))
        })
      ).then(updatedLinks => {
        dispatch(setApiData(updatedLinks))
      })
    }
  }, [links, dispatch])

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
                <Button
                  onClick={() => {
                    if (!linkRegex.test(link.trim())) {
                      return toast.error(messages.Api.invalidLink)
                    }

                    setLinks(prev => [
                      ...prev,
                      {
                        data: null,
                        link: link.trim(),
                        loading: true
                      }
                    ])
                    setLink('')
                  }}
                >
                  {messages.add}
                </Button>
              </InputAdornment>
            )
          }}
        />

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
      </DialogContent>
    </Dialog>
  )
}
