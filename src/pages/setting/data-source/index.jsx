import { Avatar, Button, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useIntl } from 'react-intl'
import { axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import IconifyIcon from 'src/Components/icon'
import AddDataSource from 'src/Components/Collection/AddDataSource'
import Link from 'next/link'

export default function Index() {
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
    const loadingToast = toast.loading(messages.loading)
    axiosGet(`data-source/get`, locale)
      .then(res => {
        if (res.status) {
          setData(res.data)
        }
      })
      .finally(() => {
        setLoading(false)
        toast.dismiss(loadingToast)
      })
  }, [locale, paginationModel.page, paginationModel.pageSize, startSearch, refresh, messages])

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
        <Typography variant='subtitle2' className='text-overflow' sx={{ fontWeight: 500, color: 'text.secondary' }}>
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
          href={`/${locale}/setting/data-source/collaction?dataSourceId=${row.id}`}
          variant='subtitle2'
          className='capitalize !text-main-color underline text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.name}
        </Typography>
      )
    },

    {
      flex: 0.2,
      minWidth: 200,
      field: 'action',
      sortable: false,
      headerName: messages.dialogs.actions,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={messages.dialogs.edit}>
            <IconButton
              disabled
              size='small'
              onClick={e => {
                setOpen(params.row)
              }}
            >
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
          <Tooltip title={messages.dialogs.delete}>
            <IconButton
              disabled
              size='small'
              onClick={e => {
                setDeleteOpen(params.row.id)
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
      <AddDataSource open={open} toggle={handleClose} setRefresh={setRefresh} />

      <Card className='w-[100%]  mb-5 py-4 '>
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
              {messages.dialogs.dataSource}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {data?.length}
            </Avatar>
          </div>
          
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
                defaultValue={search}
                ref={inputRef}
                onBlur={e => {
                  setSearch(e.target.value)
                }}
              />
            </form>

            <TableEdit
              InvitationsColumns={columns}
              data={data?.map((ele, i) => {
                const fData = { ...ele }
                fData.index = i + paginationModel.page * paginationModel.pageSize

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
