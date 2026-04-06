import { Avatar, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { axiosDelete, axiosGet, axiosPost } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import Link from 'next/link'
import { IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import { useSelector } from 'react-redux'
import GetTimeinTable from 'src/Components/GetTimeinTable'
import { useRouter } from 'next/router'
import LoadingMain from 'src/Components/LoadingMain'

export default function Index() {
  const { locale, messages } = useIntl()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [startSearch, setStartSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)
  const [refresh, setRefresh] = useState(0)
  const [data, setData] = useState([])
  const { data: profile, loading: profileLoading } = useSelector(rx => rx.auth)

  const [includeCustomerAndVendor, setIncludeCustomerAndVendor] = useState({
    includeCustomer: false,
    includeVendor: false,
    loading: true
  })



  console.log(profile, 'profile')

  const router = useRouter()


  useEffect(() => {

    axiosGet(`generic-entities/get-user-collection-data/Entityaccount`).then(res => {
      if (res.status) {
        const findCustomer = res.data.find(ele => ele.EntityType === "customer")
        const findVendor = res.data.find(ele => ele.EntityType === "vendor")
        if (findCustomer) {
          setIncludeCustomerAndVendor(prev => ({ ...prev, includeCustomer: true }))
        }
        if (findVendor) {
          setIncludeCustomerAndVendor(prev => ({ ...prev, includeVendor: true }))
        }
      }
    }).finally(() => {
      setIncludeCustomerAndVendor(prev => ({ ...prev, loading: false }))
    })
  }, [])
  useEffect(() => {


    axiosPost(`facility-task/get`,
      locale,
      {
        userId: profile?.sub
      }
    )
      .then(res => {
        if (res.status) {
          setData(res.data)
          if (profile?.view_type === 'gahar' && res.data.tasks.length === 0) {
            router.push('/FacilityTypee')
          } else {
            setLoading(false)

          }
        } else {
          setLoading(false)
        }
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, paginationModel.page, paginationModel.pageSize, startSearch, refresh, profileLoading])

  useEffect(() => {
    const handleKeyPress = e => {
      if (e.key === 'u' || e.key === 'U') {
        setRefresh(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

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
      headerName: "ID",
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.id ? row.id : '-'}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'taskName',
      disableColumnMenu: true,
      headerName: messages.tasks.taskName,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.name}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'caseId',
      disableColumnMenu: true,
      headerName: "case Id",
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.caseId ? row.caseId : '-'}
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
      flex: 0.5,
      minWidth: 105,
      field: 'actions',
      disableColumnMenu: true,
      headerName: messages.actions,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' className='text-overflow' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          <IconButton
            LinkComponent={Link}
            href=
            {
              `/${row.pageName}?requestId=${row.id}${row.entityId ? `&entityId=${row.entityId}&facilityid=${row.entityId}` : ''}${row.collectionName ? `&collection=${row.collectionName}` : ''
              }${row.workflowInstanceId ? `&MainWfInstanceId=${row.workflowInstanceId}` : ''}${row.caseId ? `&caseId=${row.caseId}` : ''
              }${profile?.sub ? `&sub=${profile?.sub}` : ''}${profile?.name ? `&name=${profile?.name}` : ''}`
            }

          >
            <Icon icon='mdi:eye' />
          </IconButton>
        </Typography>
      )
    }
  ]

  return (
    <div>
      {loading ? <LoadingMain login={true} /> : null}
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
              {messages.tasks.tasks}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {data.totalCount ?? 0}
            </Avatar>
          </div>
          {!includeCustomerAndVendor.loading && profile?.view_type !== 'gahar' && (
            <div className="flex gap-2">
              {!includeCustomerAndVendor.includeCustomer && (
                <Button LinkComponent={Link} href='/CustomerVendorverificationRequest/?type=customer' variant='contained' color='primary' onClick={() => {
                }}>
                  <Icon icon='mdi:plus' />
                  Customer  Verification Request
                </Button>
              )}
              {!includeCustomerAndVendor.includeVendor && (
                <Button LinkComponent={Link} href='/CustomerVendorverificationRequest/?type=vendor' variant='contained' color='primary' onClick={() => {
                }}>
                  <Icon icon='mdi:plus' />
                  Vendor Verification Request
                </Button>
              )}
            </div>
          )}


        </CardContent>
      </Card>
      <Box sx={{ mb: 4 }}>
        <Card className='flex gap-3 flex-wrap md:px-[36px] px-0' sx={{ mb: 6, width: '100%', py: '3.5rem' }}>
          <div className='w-full'>
            <TableEdit
              InvitationsColumns={columns}
              data={
                data.tasks
                  ? data.tasks.map((ele, i) => {
                    const fData = { ...ele }
                    fData.index = i + paginationModel.page * paginationModel.pageSize

                    return fData
                  })
                  : []
              }
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