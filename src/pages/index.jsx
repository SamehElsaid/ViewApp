import { Avatar, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useIntl } from 'react-intl'
import { axiosDelete, axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import Link from 'next/link'
import { IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import { useSelector } from 'react-redux'

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
  const profile = useSelector(rx => rx.auth.data)
  console.log(profile, 'profile')

  useEffect(() => {
    setLoading(true)
    const loadingToast = toast.loading(locale === 'ar' ? 'جاري التحميل...' : 'Loading...')
    axiosGet(`request/get-requests`, locale)
      .then(res => {
        if (res.status) {
          setData(res.data)
          console.log(res.data)
        }
      })
      .finally(() => {
        setLoading(false)
        toast.dismiss(loadingToast)
      })
  }, [locale, paginationModel.page, paginationModel.pageSize, startSearch, refresh])

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
      field: 'id',
      disableColumnMenu: true,
      headerName: messages.RequestId,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.id}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'status',
      disableColumnMenu: true,
      headerName: messages.status,
      renderCell: ({ row }) => (
        <Chip label={row.status} color={row.status === 'Completed' ? 'success' : 'error'} variant='outlined' />
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'requestType',
      disableColumnMenu: true,
      headerName: messages.requestType,
      renderCell: ({ row }) => (
        <Chip
          label={row.requestType}
          color={row.requestType === 'Facility Registeration' ? 'success' : 'error'}
          variant='filled'
        />
      )
    },

    {
      flex: 0.5,
      minWidth: 200,
      field: 'actions',
      disableColumnMenu: true,
      headerName: messages.actions,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' className='text-overflow' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          <IconButton
            LinkComponent={Link}
            href={`/${row.pageName}?requestId=${row.id}${row.entityId ? `&entityId=${row.entityId}` : ''}${
              row.collectionName ? `&collection=${row.collectionName}` : ''
            }${row.caseId ? `&caseId=${row.caseId}` : ''}${profile.sub ? `&sub=${profile.sub}` : ''}${
              profile.name ? `&name=${profile.name}` : ''
            }`}
          >
            <Icon icon='mdi:eye' />
          </IconButton>
        </Typography>
      )
    }
  ]

  return (
    <div>
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
              {messages.requests}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {data?.length}
            </Avatar>
          </div>
          {(Array.isArray(profile?.role)
            ? profile.role.includes('SuperAdmin') || profile.role.includes('Pharmacist')
            : profile?.role === 'SuperAdmin' || profile?.role === 'Pharmacist') && (
            <Button variant='contained' color='primary' LinkComponent={Link} href={`/CreatorPage?${profile.sub ? `sub=${profile.sub}` : ''}${
              profile.name ? `&name=${profile.name}` : ''
            }`}>
              <Icon icon='mdi:plus' className='text-2xl' />
              Create incident report
            </Button>
          )}
          
        </CardContent>
      </Card>
      <Box sx={{ mb: 4 }}>
        <Card className='flex gap-3 flex-wrap md:px-[36px] px-0' sx={{ mb: 6, width: '100%', py: '3.5rem' }}>
          <div className='w-full'>
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
              noRow={locale === 'ar' ? 'لا يوجد' : 'Not Found'}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />
          </div>
        </Card>
      </Box>
    </div>
  )
}
