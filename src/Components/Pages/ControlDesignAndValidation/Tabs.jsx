import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField
} from '@mui/material'
import { useIntl } from 'react-intl'

function Tabs({ openTab, handleCloseTab, messages, editTab, tabData, setTabData, addTab }) {
  const { locale } = useIntl()

  return (
    <Dialog open={openTab} onClose={handleCloseTab} fullWidth>
      <DialogTitle>{editTab ? messages.Edit_Tab : messages.Add_Tab}</DialogTitle>
      <DialogContent>
        <div className='p-4 mt-5 rounded-md border border-dashed border-main-color'>
       
          <div className='flex flex-col gap-2'>
            <div className='flex flex-col gap-2'>
              <TextField
                label={messages.Name_in_Arabic}
                value={tabData.name_ar}
                variant='filled'
                onChange={e => setTabData({ ...tabData, name_ar: e.target.value })}
              />
              <TextField
                label={messages.Name_in_English}
                value={tabData.name_en}
                variant='filled'
                onChange={e => setTabData({ ...tabData, name_en: e.target.value })}
              />
              <TextField
                label={messages.Link}
                value={tabData.link}
                variant='filled'
                onChange={e => setTabData({ ...tabData, link: e.target.value })}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tabData.active}
                    onChange={e => setTabData({ ...tabData, active: e.target.checked })}
                  />
                }
                label={messages.Active}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseTab} variant='contained' color='warning'>
          {messages.cancel}
        </Button>
        <Button onClick={addTab} variant='contained' color='primary'>
          {editTab ? (locale === 'ar' ? 'تعديل' : 'Edit') : locale === 'ar' ? 'اضافة' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Tabs
