import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'

function Tabs({ openTab, handleCloseTab, messages, editTab, tabData, setTabData, addTab }) {
  const invalidArabic = /[^\w\sأ-ي]/.test(tabData?.name_ar || '')
  const invalidEnglish = /[^\w\s]/.test(tabData?.name_en || '')
  
  return (
    <Dialog open={Boolean(openTab)} onClose={handleCloseTab} fullWidth>
      <DialogTitle>{editTab ? messages.Edit_Tab : messages.Add_Tab}</DialogTitle>
      <DialogContent>
        <div className='p-4 mt-5 rounded-md border border-dashed border-main-color'>
       
          <div className='flex flex-col gap-2'>
            <div className='flex flex-col gap-2'>
              <TextField
                label={messages.Name_in_Arabic}
                value={tabData.name_ar}
                variant='filled'
                error={invalidArabic}
                helperText={invalidArabic ? (messages.Invalid_tab_name_characters || 'Only letters, numbers, underscore, spaces, and Arabic letters are allowed') : ''}
                onChange={e => setTabData({ ...tabData, name_ar: e.target.value })}
              />
              <TextField
                label={messages.Name_in_English}
                value={tabData.name_en}
                variant='filled'
                error={invalidEnglish}
                helperText={invalidEnglish ? (messages.Invalid_tab_name_characters || 'Only letters, numbers, underscore and spaces are allowed') : ''}
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

              <FormControl fullWidth>
                <InputLabel>{messages.Visibility || 'Visibility'}</InputLabel>
                <Select
                  variant='filled'
                  value={tabData.visibilityMode ?? 'enable'}
                  onChange={e => setTabData({ ...tabData, visibilityMode: e.target.value })}
                  label={messages.Visibility || 'Visibility'}
                >
                  <MenuItem value={'enable'}>{messages.Enable || 'Enable'}</MenuItem>
                  <MenuItem value={'disable'}>{messages.Disable || 'Disable'}</MenuItem>
                  <MenuItem value={'conditional'}>{messages.Conditional_Visibility || 'Conditional Visibility'}</MenuItem>
                </Select>
              </FormControl>

              {(tabData.visibilityMode === 'conditional') && (
                <TextField
                  label={messages.Visibility_Condition_Function || 'Visibility Condition (JS function)'}
                  helperText={messages.Visibility_Condition_Helper || "Example: (ctx) => ctx.data['status'] === 'approved'"}
                  value={tabData.visibilityCondition || ''}
                  variant='filled'
                  onChange={e => setTabData({ ...tabData, visibilityCondition: e.target.value })}
                  multiline
                  minRows={2}
                />)
              }
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseTab} variant='contained' color='warning'>
          {messages.dialogs.cancel}
        </Button>
        <Button onClick={addTab} variant='contained' color='primary'>
          {editTab ? messages.dialogs.edit : messages.dialogs.add}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Tabs
