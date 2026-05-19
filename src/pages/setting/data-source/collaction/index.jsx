/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Button, Card, CardContent, IconButton, Tooltip, Typography, MenuItem } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useIntl } from 'react-intl'
import { axiosDelete, axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import IconifyIcon from 'src/Components/icon'
import AddCollection from 'src/Components/Collection/AddCollection'
import { useRouter } from 'next/router'
import Breadcrumbs from 'src/Components/breadcrumbs'
import { useTheme } from '@mui/material/styles'
import GetTimeinTable from 'src/Components/GetTimeinTable'
import DeletePopUp from 'src/Components/DeletePopUp'

export default function Index() {
  const { locale, messages } = useIntl()
  const [open, setOpen] = useState(false)
  const [startSearch, setStartSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [data, setData] = useState([])
  const [dataSources, setDataSources] = useState([])
  const [selectedDataSource, setSelectedDataSource] = useState('')

  const theme = useTheme()

  const router = useRouter()

  // Filter data based on search term and selected data source
  const dataFilter = data?.filter(
    ele =>
      (ele.nameEn.toLowerCase().includes(startSearch.toLowerCase()) ||
        ele.nameAr.toLowerCase().includes(startSearch.toLowerCase())) &&
      (selectedDataSource ? ele.dataSourceId === selectedDataSource : true)
  )

  // Fetch data sources
  useEffect(() => {
    setLoading(true)

    axiosGet(`data-source/get`, locale).then(res => {
      if (res.status) {
        setDataSources(res.data)
        if (!selectedDataSource && res.data.length > 0) {
          setSelectedDataSource(res.data[0].id)
        }
      }
    })
  }, [locale, refresh])

  // Fetch collections based on selected data source
  useEffect(() => {
    if (!selectedDataSource) return
    setLoading(true)
    axiosGet(`collections/get/?dataSourceId=${selectedDataSource}`, locale)
      .then(res => {
        if (res.status) {
          if (res.data) {
            setData(res.data)
          }
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [locale, paginationModel.page, paginationModel.pageSize, refresh, selectedDataSource])

  // Fetch fields for selected collection in Setup step

  const handleClose = () => {
    setOpen(false)
  }

  const [deletePage, setDeletePage] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { push } = useRouter()

  const handleDelete = () => {
    if (!deletePage) return
    setDeleteLoading(true)
    const loadingToast = toast.loading(messages.delete)
    axiosDelete(`collections/delete?collectionId=${deletePage}`, locale)
      .then(res => {
        if (res.status) {
          toast.success(messages.deleteSuccess)
          setRefresh(prev => prev + 1)
        }
      })
      .finally(() => {
        toast.dismiss(loadingToast)
        setDeleteLoading(false)
        setDeletePage(false)
      })
  }

  const handleDataSourceChange = event => {
    const dataSourceId = event.target.value
    setSelectedDataSource(dataSourceId)
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, dataSourceId }
      },
      undefined,
      { shallow: true }
    )
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
      flex: 0.2,
      minWidth: 200,
      field: 'key',
      disableColumnMenu: true,
      headerName: messages.key,
      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.key}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'nameEn',
      disableColumnMenu: true,
      headerName: messages.collectionNameEN,
      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.nameEn}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'nameAr',
      disableColumnMenu: true,
      headerName: messages.collectionNameAR,
      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.nameAr}
        </Typography>
      )
    },
    {
      flex: 0.05,
      minWidth: 150,
      field: 'createdAt',
      disableColumnMenu: true,
      headerName: messages.createdAt,
      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.createdAt ? <GetTimeinTable data={row.createdAt} /> : '-'}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 130,
      field: 'action',
      sortable: false,
      headerName: messages.actions,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={messages.collection.viewAllFields}>
            <IconButton
              size='small'
              onClick={() => {
                push(`/${locale}/setting/data-source/collaction/${params.row.id}?dataSourceId=${selectedDataSource}`)
              }}
            >
              <IconifyIcon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
          <Tooltip title={messages.collection.editCollection}>
            <IconButton
              size='small'
              onClick={() => {
                setOpen(params.row)
              }}
            >
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
          <Tooltip title={messages.delete}>
            <IconButton
              size='small'
              onClick={() => {
                setDeletePage(params.row.id)
              }}
            >
              <IconifyIcon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <div>
      <DeletePopUp
        open={deletePage}
        setOpen={setDeletePage}
        handleDelete={handleDelete}
        loadingButton={deleteLoading}
      />
      <Breadcrumbs loading={loading} routers={[{ name: messages.collection.collectionName, link: '' }]} isDashboard />
      <AddCollection open={open} toggle={handleClose} setRefresh={setRefresh} selectedDataSource={selectedDataSource} />
      <Card className='w-[100%] mb-5 py-4'>
        <CardContent
          className='h-full'
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
              {messages.collection.collectionName}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {dataFilter?.length}
            </Avatar>
          </div>
          <div className='flex gap-2'>
            <Button variant='contained' color='primary' onClick={() => setOpen(true)} disabled={!selectedDataSource}>
              {messages.collection.addCollection}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Box sx={{ mb: 4 }}>
        <Card className='flex gap-3 flex-wrap md:px-[36px] px-0' sx={{ mb: 6, width: '100%', py: '3.5rem' }}>
          <div className='w-full'>
            <div className='grid gap-4 justify-between items-center px-5 mb-5 w-full md:grid-cols-3 md:flex-row'>
              <CustomTextField
                id='input'
                fullWidth
                value={selectedDataSource}
                label={messages.collection.dataSource}
                onChange={handleDataSourceChange}
                select
              >
                {' '}
                {dataSources.map(source => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
              </CustomTextField>
              <CustomTextField
                id='input'
                fullWidth
                label={messages.search}
                value={startSearch}
                onChange={e => {
                  setStartSearch(e.target.value)
                }}
              />
            </div>
            <div className='flex gap-2 justify-end mb-5'>
              <Button
                variant='contained'
                color='error'
                disabled={!startSearch}
                className={`${!startSearch ? '!opacity-50' : ''}`}
                onClick={() => {
                  setStartSearch('')
                }}
              >
                {messages.reset}
              </Button>
            </div>

            <TableEdit
              InvitationsColumns={columns}
              data={dataFilter?.map((ele, i) => {
                const fData = { ...ele }
                fData.index = i

                return fData
              })}
              getRowId={row => row.index}
              loading={loading}
              locale={locale}
              noRow={messages.notFound}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />
          </div>
        </Card>
      </Box>

      {/* Add Relation Modal */}
    </div>
  )
}
