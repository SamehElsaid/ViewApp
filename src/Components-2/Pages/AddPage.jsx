import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import { useIntl } from 'react-intl'
import { MenuItem } from '@mui/material'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LoadingButton } from '@mui/lab'
import { axiosPost, axiosGet } from '../axiosCall'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const AddPage = props => {
  // ** Props
  const { open, toggle, setRefresh } = props
  const { messages, locale } = useIntl()

  const schema = yup.object().shape({
    name: yup
      .string()
      .required(messages['required'])
      .trim()
      .matches(/^(?!-)([A-Za-z0-9]+-?)*[A-Za-z0-9]+$/, messages.nameNotValid),
    description: yup.string().required(messages['required']).trim()
  })

  const defaultValues = {
    name: '',
    description: '',
    versionReason: ''
  }

  const {
    reset,
    control,
    setValue,
    setError,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })
  const [loading, setLoading] = useState(false)

  const [workflows, setWorkflows] = useState([
    { id: '4d731e3e20364b89', name: 'MedicalMember' },
    { id: '6bacd960b225b6f', name: 'Payment' },
    { id: '73a8202ca9d1ab64', name: 'FacilityRegistration' },
    { id: 'DocumentApprovalWorkflow:1.0', name: 'DocumentApprovalWorkflow' }
  ])

  const onSubmit = data => {
    setLoading(true)

    const sendData = {
      name: data.name,
      description: data.description,
      versionReason: data.versionReason
    }
    if (data.workflow) {
      sendData.workflowId = data.workflow
    }

    axiosPost('page', locale, sendData)
      .then(res => {
        if (res.status) {
          toast.success(messages.pageAddedSuccessfully)
          handleClose()
          setRefresh(prev => prev + 1)
        }
      })
      .catch(err => {
        toast.error(messages.ErrorOccurred)
      })
      .finally(_ => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (typeof open !== 'boolean') {
      setValue('name', open.nameAr)
      setValue('description', open.descriptionAr)
      setValue('versionReason', open.versionReason)
      trigger('name')
      trigger('description')
      trigger('versionReason')
    }
  }, [open, setValue, trigger])

  useEffect(() => {
    axiosGet('Workflow/get-workflows', locale).then(res => {
      if (res.status) {
        setWorkflows(res.data)
      }
    })
  }, [locale])

  const handleClose = () => {
    toggle()
    reset()
  }

  return (
    <>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '70%', sm: '50%' } } }}
      >
        <Header>
          <Typography variant='h5'>{typeof open === 'boolean' ? messages.addPage : open.name}</Typography>
          <IconButton
            size='small'
            onClick={handleClose}
            sx={{
              p: '0.438rem',
              borderRadius: 1,
              color: 'text.primary',
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
              }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }} className='h-full'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-4 h-full'>
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={messages['name']}
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  error={Boolean(errors.name)}
                  placeholder={messages['name']}
                  {...(errors.name && { helperText: errors.name.message })}
                />
              )}
            />
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={messages['description']}
                  value={value}
                  multiline
                  rows={4}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  error={Boolean(errors.description)}
                  placeholder={messages['description']}
                  {...(errors.description && { helperText: errors.description.message })}
                />
              )}
            />
            <Controller
              name='versionReason'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='text'
                  label={messages['versionReason']}
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                  error={Boolean(errors.versionReason)}
                  placeholder={messages['versionReason']}
                  {...(errors.versionReason && { helperText: errors.versionReason.message })}
                />
              )}
            />
            <Controller
              name='workflow'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  select
                  type='text'
                  label={'Workflow'}
                  value={value}
                  sx={{ mb: 4 }}
                  onChange={onChange}
                >
                  {workflows.map(workflow => (
                    <MenuItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }} className='gap-4 justify-end py-4 mt-auto'>
              <LoadingButton type='submit' variant='contained' loading={loading}>
                {messages.submit}
              </LoadingButton>
              <Button variant='contained' color='secondary' onClick={handleClose}>
                {messages.cancel}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </>
  )
}

export default AddPage
