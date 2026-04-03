/* eslint-disable react-hooks/exhaustive-deps */
import { Icon } from '@iconify/react'
import { Box, Drawer, IconButton, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { cssToObject, objectToCss } from 'src/Components/_Shared'
import { UnmountClosed } from 'react-collapse'
import { useIntl } from 'react-intl'
import { axiosGet } from 'src/Components/axiosCall'

import Trigger from '../ControlDesignAndValidation/Trigger'
import SwitchView from '../ControlDesignAndValidation/SwitchView'
import TriggerControl from '../ControlDesignAndValidation/TriggerControl'

/** أنماط الجدول الافتراضية - تُستخدم في شكل الجدول */
export const DEFAULT_TABLE_STYLE = {
  headerBackgroundColor: '#f5f5f5',
  headerTextColor: '#333333',
  tableBorderColor: 'rgba(224, 224, 224, 1)'
}

const Header = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '20px 10px',
  justifyContent: 'space-between',
  position: 'sticky',
  background: '#fff',
  borderBottom: '1px solid #00d0e7',
  zIndex: 50,
  top: 0
}))

export default function TableColumnControl({ open, handleClose, design, locale, data, onChange, roles, fields, isRowSetting }) {
  const Css = cssToObject(design)
  const { messages } = useIntl()
  const [selected, setSelect] = useState('roles')
  const [openTrigger, setOpenTrigger] = useState(false)
  const [currentFields, setCurrentFields] = useState([])
  const [parentFields, setParentFields] = useState([])
  const [parentKey, setParentKey] = useState(null)
  const [showTrigger, setShowTrigger] = useState(false)

  const tableStyle = data?.tableStyle ?? DEFAULT_TABLE_STYLE



  const handleTableStyleChange = (key, value) => {
    onChange({
      ...data,
      tableStyle: {
        ...tableStyle,
        [key]: value
      }
    })
  }

  useEffect(() => {
    if (open && (open.type === 'OneToOne' || open.type === 'OneToMany' || open.type === 'ManyToMany')) {
      try {
        axiosGet(`collections/get-by-key?key=${open.options.source}`, locale).then(res => {
          if (res.status) {
            axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale).then(res => {
              if (res.status) {
                setCurrentFields(res.data)
              }
            })
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }, [open])

  useEffect(() => {
    if (parentKey) {
      axiosGet(`collections/get-by-key?key=${parentKey}`).then(res => {
        if (res.status) {
          axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale).then(res => {
            if (res.status) {
              setParentFields(res.data)
            }
          })
        }
      })
    }
  }, [parentKey])



  return (
    <>
      <Trigger
        isRowSetting={isRowSetting}
        openTrigger={openTrigger}
        messages={messages}
        locale={locale}
        fields={fields ?? []}
        data={data}
        onChange={onChange}
        open={open}
        setOpenTrigger={setOpenTrigger}
        currentFields={currentFields}
        parentFields={parentFields}
        setParentKey={setParentKey}
        parentKey={parentKey}
        Css={design}
        roles={roles}
        design={design}
        objectToCss={objectToCss}
        type={'column'}
      />

      <Drawer
        open={Boolean(open)}
        anchor='right'
        variant='temporary'
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '70%' } } }}
      >
        <Header>
          <Typography className='capitalize text-[#555] !font-bold' variant='h4'>
            {locale === 'ar' ? open?.nameAr ?? open?.name_ar : open?.nameEn ?? open?.name_en}
          </Typography>
          <IconButton
            size='small'
            onClick={handleClose}
            color='error'
            variant='contained'
            sx={{
              p: '0.438rem',
              borderRadius: 50,
              backgroundColor: 'action.selected'
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>
        <Box className='h-full'>
          <div className='flex flex-col p-4 h-full'>
            {/* أنماط الجدول - Table style */}
            {!isRowSetting && (
              <Box sx={{ mb: 3, p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
                  {locale === 'ar' ? 'أنماط الجدول' : 'Table style'}
                </Typography>
                <Box className='flex flex-col gap-2'>
                  <Box className='flex items-center gap-2'>
                    <input
                      type='color'
                      value={tableStyle.headerBackgroundColor || '#f5f5f5'}
                      onChange={e => handleTableStyleChange('headerBackgroundColor', e.target.value)}
                      style={{ width: 36, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <TextField
                      size='small'
                      label={locale === 'ar' ? 'لون خلفية الهيدر' : 'Header background'}
                      value={tableStyle.headerBackgroundColor || ''}
                      onChange={e => handleTableStyleChange('headerBackgroundColor', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Box className='flex items-center gap-2'>
                    <input
                      type='color'
                      value={tableStyle.headerTextColor || '#333333'}
                      onChange={e => handleTableStyleChange('headerTextColor', e.target.value)}
                      style={{ width: 36, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <TextField
                      size='small'
                      label={locale === 'ar' ? 'لون نص الهيدر' : 'Header text color'}
                      value={tableStyle.headerTextColor || ''}
                      onChange={e => handleTableStyleChange('headerTextColor', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Box className='flex items-center gap-2'>
                    <input
                      type='color'
                      value={tableStyle.tableBorderColor?.startsWith('rgba') ? '#e0e0e0' : (tableStyle.tableBorderColor || '#e0e0e0')}
                      onChange={e => handleTableStyleChange('tableBorderColor', e.target.value)}
                      style={{ width: 36, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <TextField
                      size='small'
                      label={locale === 'ar' ? 'لون حدود الجدول' : 'Table border color'}
                      value={tableStyle.tableBorderColor || ''}
                      onChange={e => handleTableStyleChange('tableBorderColor', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
            {open && (
              <div className='flex flex-col gap-2 py-5'>
                <UnmountClosed isOpened={Boolean(selected === 'roles')}>
                  <div>
                    <SwitchView title={messages.Triggers} show={showTrigger} setShow={setShowTrigger}>
                      <TriggerControl
                        roles={roles}
                        setOpenTrigger={setOpenTrigger}
                        messages={messages}
                        data={data}
                        keyInput={open.key}
                        onChange={onChange}
                        open={open}
                        objectToCss={objectToCss}
                        Css={Css}
                        type='column'
                      />
                    </SwitchView>
                  </div>
                </UnmountClosed>
              </div>
            )}
          </div>
        </Box>
      </Drawer>
    </>
  )
}
