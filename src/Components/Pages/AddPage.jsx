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
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LoadingButton } from '@mui/lab'
import { axiosPost, axiosGet, axiosPatch } from '../axiosCall'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { CircularProgress } from '@mui/material'

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
    description: yup.string().required(messages['required']).trim().max(512, messages.maxLengthMustBe512)
  })

  const defaultValues = {
    name: '',
    description: '',
    versionReason: '',
    workflow: []
  }

  const {
    reset,
    control,
    setValue,
    setError,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })
  const [loading, setLoading] = useState(false)

  const [workflows, setWorkflows] = useState([])

  const onSubmit = data => {
    setLoading(true)

    const sendData = {
      name: data.name,
      description: data.description,
      versionReason: data.versionReason
    }
    if (data.workflow?.length > 0) {
      sendData.pageWorkflows = data.workflow.map((workflow, index) => ({
        workflowId: workflow.id,
        order: index + 1
      }))
    }

    if (typeof open !== 'boolean') {
      axiosPatch(`page/update/${open.name}`, locale, sendData)
        .then(res => {
          if (res.status) {
            toast.success(messages.pageUpdatedSuccessfully)
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
    } else {
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
  }

  const [loadingWorkflow, setLoadingWorkflow] = useState(true)

  useEffect(() => {
    if (typeof open !== 'boolean') {
      setValue('name', open.name)
      setValue('description', open.description)
      setValue('versionReason', open.versionReason)
      const workflowArray = []

      open.pageWorkflowNames.forEach(workflow => {
        const workflowData = workflows.find(workflowData => workflowData.name === workflow)
        if (workflowData) {
          workflowArray.push(workflowData)
        }
      })

      setValue('workflow', workflowArray)

      // setValue(
      //   'workflow',
      //   open.pageWorkflows.map(workflow => workflow.workflowId)
      // )
      trigger('name')
      trigger('description')
      trigger('versionReason')
    }
  }, [open, setValue, trigger, loadingWorkflow, workflows])

  useEffect(() => {
    setLoadingWorkflow(true)
    axiosGet('Workflow/get-workflows', locale)
      .then(res => {
        if (res.status) {
          setWorkflows(res.data || [])
        }
      })
      .finally(() => {
        setLoadingWorkflow(false)
      })
  }, [locale, open])

  const handleClose = () => {
    toggle()
    reset()
    setLoadingWorkflow(true)
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
                  disabled={typeof open !== 'boolean'}
                  fullWidth
                  type='text'
                  label={
                    <span>
                      {messages['name']} <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
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
                  label={
                    <span>
                      {messages['description']} <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
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

            <div className='relative'>
              {loadingWorkflow && (
                <div className='absolute top-[10px] left-0 w-full h-full flex justify-end px-3 items-center'>
                  <CircularProgress size={20} />
                </div>
              )}

              {console.log(getValues('workflow'))}
              <Controller
                name='workflow'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    multiple
                    disabled={loadingWorkflow}
                    value={value}
                    options={workflows}
                    key={open}
                    filterSelectedOptions
                    id='autocomplete-multiple-outlined'
                    getOptionLabel={option => option.name || ''}
                    renderInput={params => <CustomTextField {...params} label={messages['workflow']} />}
                    onChange={(event, newValue) => {
                      onChange(newValue)
                    }}
                  />
                )}
              />
            </div>

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
