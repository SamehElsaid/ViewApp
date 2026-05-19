import { Avatar, Button, Card, CardContent, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useIntl } from 'react-intl'
import { axiosGet } from 'src/Components/axiosCall'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import AddDynamicApi from 'src/Components/DynamicApi/AddDynamicApi'
import Breadcrumbs from 'src/Components/breadcrumbs'
import GetTimeinTable from 'src/Components/GetTimeinTable'

export default function Index() {
  const { locale, messages } = useIntl()
  const [open, setOpen] = useState(false)
  const [startSearch, setStartSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [data, setData] = useState([])

  const dataFilter = data?.filter(
    ele =>
      ele.route.toLowerCase().includes(startSearch.toLowerCase()) ||
      ele.queryType.toLowerCase().includes(startSearch.toLowerCase())
    )

  useEffect(() => {
    setLoading(true)
    axiosGet(`API-configuration`, locale)
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
  }, [locale, paginationModel.page, paginationModel.pageSize, refresh])

  const handleClose = () => {
    setOpen(false)
  }



  const columns = [
    {
      flex: 0.005,
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
      flex: 0.05,
      minWidth: 200,
      field: 'route',
      disableColumnMenu: true,
      headerName: messages.dialogs.name,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' className='text-overflow' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.route}
        </Typography>
      )
    },
    {
      flex: 0.05,
      minWidth: 100,
      field: 'queryType',
      disableColumnMenu: true,
      headerName: messages.Api.queryType,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' className='text-overflow' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.queryType}
        </Typography>
      )
    },
    {
      flex: 0.05,
      minWidth: 100,
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
    }
  ]

  return (
    <div>
      <Breadcrumbs loading={loading} routers={[{ name: messages.Api.DynamicAPI, link: '' }]} isDashboard />
      <AddDynamicApi open={open} toggle={handleClose} setRefresh={setRefresh} />
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
              {messages.Api.DynamicAPI}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {dataFilter?.length}
            </Avatar>
          </div>
          <div className='flex gap-2'>
            <Button variant='contained' color='primary' onClick={() => setOpen(true)}>
              {messages.Api.addDynamicAPI}
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
    </div>
  )
}
