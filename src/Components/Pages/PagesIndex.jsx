import { Avatar, Button, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useIntl } from 'react-intl'
import { axiosDelete, axiosGet, axiosPost } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import IconifyIcon from 'src/Components/icon'
import AddPage from 'src/Components/Pages/AddPage'
import Link from 'next/link'
import DeletePopUp from 'src/Components/DeletePopUp'
import ClonePagePopUp from 'src/Components/Pages/ClonePagePopUp'
import Breadcrumbs from 'src/Components/breadcrumbs'

const PagesIndex = ({ formType }) => {
  const { locale, messages } = useIntl()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [startSearch, setStartSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const [refresh, setRefresh] = useState(0)
  const [data, setData] = useState([])

  useEffect(() => {
    setLoading(true)
    const loadingToast = toast.loading(messages.dialogs.loading)
    axiosGet(`page/get-pages${formType === 'layout' ? '?FormType=layout' : formType === 'print' ? '?FormType=print' : ''}`, locale)
      .then(res => {
        if (res.status) {
          setData(res.data)
        }
      })
      .finally(() => {
        setLoading(false)
        toast.dismiss(loadingToast)
      })
  }, [locale, paginationModel.page, paginationModel.pageSize, startSearch, refresh, messages, formType])

  const [deletePage, setDeletePage] = useState(false)
  const [clonePageName, setClonePageName] = useState(false)
  const [cloneLoading, setCloneLoading] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const columns = [
    {
      flex: 0.05,
      minWidth: 60,
      field: 'index',
      disableColumnMenu: true,
      headerName: '#',
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {`${row.index + 1}`}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'name',
      disableColumnMenu: true,
      headerName: messages.dialogs.name,
      renderCell: ({ row }) => (
        <Typography
          component={Link}
          href={`/${locale}/setting/pages/${row.name}${formType === 'layout' ? '?FormType=layout' : formType === 'print' ? '?FormType=print' : ''}`}
          variant='subtitle2'
          className='underline capitalize !text-main-color text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.name}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'description',
      disableColumnMenu: true,
      headerName: messages.dialogs.description,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' className='text-overflow' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.description}
        </Typography>
      )
    },
    ...(formType !== 'layout'
      ? [
        {
          flex: 0.5,
          minWidth: 200,
          field: 'pageWorkflowNames',
          disableColumnMenu: true,
          headerName: messages.dialogs.workflow,
          renderCell: () => (
            <div className='flex gap-2 flex-wrap'>{/* workflows placeholder */}</div>
          )
        }
      ]
      : []),
    {
      flex: 0.1,
      minWidth: 120,
      field: 'action',
      hideable: false,
      sortable: false,
      headerName: messages.dialogs.actions,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={messages.dialogs.edit}>
            <IconButton
              size='small'
              onClick={() => {
                let parsedJson = { editorValue: '', apiData: '' }
                try {
                  if (params.row.jsonData) {
                    parsedJson = JSON.parse(params.row.jsonData)
                  }
                } catch (err) {
                  console.warn('Invalid jsonData:', err)
                }
                setOpen({
                  ...params.row,
                  editorValue: parsedJson.editorValue,
                  apiData: parsedJson.apiData
                })
              }}
            >
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
          </Tooltip>

          <Tooltip title={messages.dialogs?.clonePage || 'Clone Page'}>
            <IconButton size='small' onClick={() => setClonePageName(params.row.name)}>
              <IconifyIcon icon='tabler:copy' />
            </IconButton>
          </Tooltip>

          <Tooltip title={messages.dialogs.delete}>
            <IconButton
              size='small'
              onClick={() => {
                setDeletePage(params.row.name)
              }}
            >
              <IconifyIcon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleDelete = () => {
    setDeleteLoading(true)
    const loadingToast = toast.loading(messages.dialogs.deletingPage)
    axiosDelete(`page/${deletePage}/`, locale)
      .then(res => {
        if (res.status) {
          toast.success(messages.dialogs.pageDeletedSuccessfully)
          setData(data.filter(ele => ele.name !== deletePage))
          setRefresh(prev => prev + 1)
        }
      })
      .finally(() => {
        toast.dismiss(loadingToast)
        setDeleteLoading(false)
        setDeletePage(false)
      })
  }

  const handleClone = (pageName, pageTypeId) => {
    setCloneLoading(true)
    const loadingToast = toast.loading(messages.dialogs?.cloningPage || 'Cloning page...')
    axiosPost(`page/clone-page/${pageName}?pageType=${pageTypeId}`, locale, {})
      .then(res => {
        if (res.status) {
          toast.success(messages.dialogs?.pageClonedSuccessfully || 'Page cloned successfully')
          setRefresh(prev => prev + 1)
          setClonePageName(false)
        } else {
          toast.error(messages.dialogs?.cloneFailed || 'Clone failed')
        }
      })
      .finally(() => {
        toast.dismiss(loadingToast)
        setCloneLoading(false)
      })
  }

  return (
    <div>
      <Breadcrumbs
        routers={[{ name: formType === 'layout' ? (messages.dialogs.layouts || 'Layouts') :formType === 'print' ? (messages.dialogs.print || 'Print') : messages.dialogs.pages }]}
        isDashboard
      />

      <DeletePopUp
        open={deletePage}
        setOpen={setDeletePage}
        handleDelete={handleDelete}
        loadingButton={deleteLoading}
      />

      <ClonePagePopUp
        open={clonePageName}
        setOpen={setClonePageName}
        pageName={clonePageName}
        onConfirm={handleClone}
        loading={cloneLoading}
      />

      <AddPage  open={open} toggle={handleClose} setRefresh={setRefresh} formType={formType} />

      <Card className='w-[100%]  mb-5 py-4 '>
        <CardContent
          className='flex-col gap-2 h-full md:flex-row'
          sx={{
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: '0 !important'
          }}
        >
          <div className='flex gap-2 justify-center items-center'>
            <Typography variant='h5' sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {formType === 'layout' ? (messages.dialogs.layouts || 'Layouts') : formType === 'print' ? (messages.dialogs.print || 'Print') : messages.dialogs.pages}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {data?.length}
            </Avatar>
          </div>
          <Button variant='contained' color='primary' onClick={() => setOpen(true)}>
            {messages.dialogs.addPage}
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }}>
        <Card className='flex gap-3 flex-wrap md:px-[36px] px-0' sx={{ mb: 6, width: '100%', py: '3.5rem' }}>
          <div className='w-full'>
            <form
              onSubmit={e => {
                e.preventDefault()
                setStartSearch(e.target.elements.input.value)
                setPaginationModel({ page: 0, pageSize: 10 })
              }}
              className='px-5 ~~ mb-5 || flex ~~ flex-col  items-center md:items-end w-full || md:flex-row || gap-2'
            >
              <CustomTextField
                id='input'
                label={messages.dialogs.search}
                value={search}
                ref={inputRef}
                onChange={e => {
                  setSearch(e.target.value.replace(/\s+/g, ''))
                }}
              />
            </form>
            <div className='flex gap-2 justify-end mb-5'>
              <Button
                variant='contained'
                color='error'
                disabled={!search}
                className={`${!startSearch ? '!opacity-50' : ''}`}
                onClick={() => {
                  setSearch('')
                }}
              >
                {messages.reset}
              </Button>
            </div>

            <TableEdit
              InvitationsColumns={columns}
              data={data
                ?.filter(ele => ele.name.toLowerCase().includes(search.toLowerCase()))
                .map((ele, indexOfPage) => {
                  const fData = { ...ele }
                  fData.index = indexOfPage

                  return fData
                })}
              getRowId={row => row.index}
              loading={loading}
              locale={locale}
              noRow={messages.dialogs.noRow}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />
          </div>
        </Card>
      </Box>
    </div>
  )
}

export default PagesIndex

