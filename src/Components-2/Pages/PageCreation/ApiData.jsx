import { Delete } from '@mui/icons-material'
import { Button, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from '@mui/material'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { setApiData } from 'src/store/apps/apiSlice/apiSlice'

export default function ApiData({ open, setOpen,initialDataApi }) {
  const { locale } = useIntl()
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
        linksToFetch.map(linkObj =>
          axios
            .get(linkObj.link)
            .then(response => ({ ...linkObj, data: response.data, loading: true }))
            .catch(error => ({ ...linkObj, data: null, loading: false, error: error.message }))
        )
      ).then(updatedLinks => {
        dispatch(setApiData(updatedLinks))
      })
    }
  }, [links,dispatch])

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle> {locale === 'ar' ? 'اضافة البيانات api' : 'Get Api Data'}</DialogTitle>
      <DialogContent>
        <TextField
          value={link}
          onChange={e => {
            setLink(e.target.value)
          }}
          label={locale === 'ar' ? 'الرابط' : 'The Link'}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Button
                  onClick={() => {
                    if (
                      !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#?&//=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%._\+~#?&//=]*)$/i.test(
                        link
                      )
                    ) {
                      return toast.error(locale === 'ar' ? 'الرابط غير صالح' : 'The Link is not valid')
                    }
                    setLinks(prev => [
                      ...prev,
                      {
                        data: null,
                        link,
                        loading: true
                      }
                    ])
                    setLink('')
                  }}
                >
                  {locale === 'ar' ? 'اضافة' : 'Add'}
                </Button>
              </InputAdornment>
            )
          }}
        />
        <div className='flex flex-col gap-2 mt-4'>
          {links.map((link, index) => (
            <div className='p-2 rounded-md border border-dashed border-main-color' key={index}>
              <div className='flex justify-between items-center'>
                <div className='text-main-color'>{link.link}</div>
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
