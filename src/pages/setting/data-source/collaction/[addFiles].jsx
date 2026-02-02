// // pages/index.js

import { Avatar, Button, Card, CardContent, Chip, IconButton, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getTypeFromCollectionTarget } from 'src/Components/_Shared'
import { axiosDelete, axiosGet } from 'src/Components/axiosCall'
import Breadcrumbs from 'src/Components/breadcrumbs'
import FormBuilder from 'src/Components/Collection/FormBuilder'
import FormEdit from 'src/Components/FormEdit'
import GetCollectionName from 'src/Components/GetCollectionName'
import IconifyIcon from 'src/Components/icon'
import DeletePopUp from 'src/Components/DeletePopUp'
import AddRelation from 'src/Components/Popup/AddRelation'
import TableEdit from 'src/Components/TableEdit/TableEdit'
import ViewField from 'src/Components/ViewFiled'

function AddField() {
  const { locale, messages } = useIntl()
  const [data, setData] = useState({ collection: null, fields: [] })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [refresh, setRefresh] = useState(0)
  const [startSearch, setStartSearch] = useState('')
  const [edit, setEdit] = useState(null)
  const [view, setView] = useState(null)
  const [relationOpen, setRelationOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const {
    query: { addFiles }
  } = useRouter()

  useEffect(() => {
    if (addFiles) {
      Promise.all([
        axiosGet(`collections/get-by-id?id=${addFiles}`),
        axiosGet(`collection-fields/get?CollectionId=${addFiles}`)
      ])
        .then(([res1, res2]) => {
          if (res1.status) {
            setData(prev => ({ ...prev, collection: res1.data }))
          }
          if (res2.status) {
            setData(prev => ({ ...prev, fields: res2.data }))
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [addFiles])

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
      field: 'name_en',
      disableColumnMenu: true,
      headerName: messages.dialogs.fieldInEnglish,
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
      field: 'name_ar',
      disableColumnMenu: true,
      headerName: messages.dialogs.fieldInArabic,
      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {row.nameAr === 'CreatedAt'
            ? 'تاريخ الإنشاء'
            : row.nameAr === 'Id'
            ? 'المعرف'
            : row.nameAr === 'UpdatedAt'
            ? 'تاريخ التحديث'
            : row.nameAr === 'DeletedAt'
            ? 'تاريخ الحذف'
            : row.nameAr === 'UpdatedBy'
            ? 'المستخدم المحدث'
            : row.nameAr === 'DeletedBy'
            ? 'المستخدم المحذف'
            : row.nameAr === 'CreatedBy'
            ? 'المستخدم المنشئ'
            : row.nameAr}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'type',
      disableColumnMenu: true,
      headerName: messages.dialogs.type,
      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {messages[getTypeFromCollectionTarget(row.type, row.descriptionAr)]}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'relation',
      disableColumnMenu: true,
      headerName: messages.dialogs.relation,

      renderCell: ({ row }) => (
        <Typography
          variant='subtitle2'
          className='capitalize text-overflow'
          sx={{ fontWeight: 500, color: 'text.secondary' }}
        >
          {true && (row.type === 'OneToOne' || row.type === 'ManyToMany' || row.type === 'OneToMany') ? (
            <GetCollectionName name={row.options.source} />
          ) : (
            <Chip label={messages.dialogs.notFound} />
          )}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 130,
      field: 'action',
      sortable: false,
      headerName: messages.dialogs.actions,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={messages.dialogs.viewField}>
            <IconButton
              size='small'
              onClick={e => {
                setView(params.row)
              }}
            >
              <IconifyIcon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
          <Tooltip title={messages.dialogs.editField}>
            <IconButton
              size='small'
              onClick={e => {
                setEdit(params.row)
              }}
            >
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
          <Tooltip title={messages.dialogs.delete}>
            <IconButton
              size='small'
              onClick={e => {
                setDeleteItem(params.row)
              }}
            >
              <IconifyIcon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const handleDelete = () => {
    if (deleteItem) {
      setDeleteLoading(true)
      axiosDelete(`collection-fields/delete?collectionFieldId=${deleteItem.id}`, locale)
        .then(res => {
          if (res.status) {
            toast.success(messages.dialogs.fieldDeletedSuccessfully)
            setRefresh(prev => prev + 1)
          }
        })
        .finally(() => {
          setDeleteLoading(false)
          setDeleteItem(null)
        })
    }
  }

  const dataFilter = data?.fields.filter(
    ele =>
      (ele.nameEn.toLowerCase().includes(startSearch.toLowerCase()) ||
        ele.nameAr.toLowerCase().includes(startSearch.toLowerCase())) &&
      ele.type !== 'ManyToMany'
  )

  // Filter ManyToMany relations
  const manyToManyRelations = data?.fields.filter(field => field.type === 'ManyToMany') || []

  // ManyToMany relations table columns
  const manyToManyColumns = [
    {
      flex: 0.1,
      minWidth: 80,
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
      flex: 0.35,
      minWidth: 200,
      field: 'related_collection',
      disableColumnMenu: true,
      headerName: 'Related Data Model',
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <IconifyIcon icon='tabler:database' size={18} color='#666' />
          <Typography
            variant='body1'
            className='capitalize text-overflow'
            sx={{
              fontWeight: 500,
              color: '#333',
              fontSize: '0.9rem'
            }}
          >
            <GetCollectionName name={row.options?.source} />
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.35,
      minWidth: 200,
      field: 'junction_collection',
      disableColumnMenu: true,
      headerName: 'Junction Data Model',
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <IconifyIcon icon='tabler:link' size={18} color='#666' />
          <Typography
            variant='body1'
            className='capitalize text-overflow'
            sx={{
              fontWeight: 500,
              color: '#333',
              fontSize: '0.9rem'
            }}
          >
            <GetCollectionName name={row.key} />
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'relation_type',
      disableColumnMenu: true,
      headerName: 'Type',
      renderCell: ({ row }) => (
        <Chip
          icon={<IconifyIcon icon='tabler:git-merge' size={16} />}
          label='Many-to-Many'
          color='primary'
          variant='filled'
          size='small'
          sx={{
            fontWeight: 500,
            '& .MuiChip-label': {
              fontSize: '0.8rem'
            }
          }}
        />
      )
    }
  ]

  useEffect(() => {
    if (refresh) {
      axiosGet(`collection-fields/get?CollectionId=${addFiles}`)
        .then(res => {
          if (res.status) {
            setData(prev => ({ ...prev, fields: res.data }))
          }
        })
        .finally(() => {
          setLoading(false)
          setRefresh(0)
        })
    }
  }, [refresh, addFiles])

  return (
    <div>
      <Breadcrumbs
        loading={loading}
        routers={[
          { name: messages.collection.collectionName, link: `/${locale}/setting/data-source/collaction` },
          {
            name: locale === 'ar' ? data?.collection?.nameAr : data?.collection?.nameEn,
            link: `/${locale}/setting/data-source/collaction/${addFiles}`
          }
        ]}
        isDashboard
      />
      <FormBuilder open={open} setOpen={setOpen} setRefresh={setRefresh} />
      <FormEdit open={edit} setOpen={setEdit} setData={setData} />
      <ViewField open={view} setOpen={setView} />
      <AddRelation
        setRefresh={setRefresh}
        dataParent={data?.collection}
        relationOpen={relationOpen}
        setRelationOpen={setRelationOpen}
      />
      <DeletePopUp
        open={deleteItem}
        setOpen={setDeleteItem}
        handleDelete={handleDelete}
        loadingButton={deleteLoading}
      />

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
            <Typography
              variant='h5'
              sx={{ color: 'primary.main', fontWeight: 'bold' }}
              className='capitalize text-overflow-2 max-w-[250px]'
            >
              {locale === 'ar' ? data?.collection?.nameAr : data?.collection?.nameEn}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {data?.fields?.length}
            </Avatar>
          </div>
          <div className='flex gap-2'>
            <Button variant='contained' color='primary' onClick={() => setRelationOpen(true)}>
              {messages.dialogs.addRelation}
            </Button>
            <Button variant='contained' color='primary' onClick={() => setOpen(data.collection)}>
              {messages.dialogs.addField}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Box sx={{ mb: 4 }}>
        <Card className='flex gap-3 flex-wrap md:px-[36px] px-0' sx={{ mb: 6, width: '100%', py: '3.5rem' }}>
          <div className='w-full'>
            <form
              onSubmit={e => {
                e.preventDefault()
              }}
              className='px-5 ~~ mb-5 || flex ~~ flex-col  items-center md:items-end w-full || md:flex-row || gap-2'
            >
              <CustomTextField
                id='input'
                label={messages.dialogs.search}
                value={startSearch}
                onChange={e => {
                  setStartSearch(e.target.value)
                }}
              />
              {startSearch && (
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => {
                    setStartSearch('')
                  }}
                >
                  {messages.dialogs.reset}
                </Button>
              )}
            </form>
            <TableEdit
              InvitationsColumns={columns}
              data={dataFilter?.map((ele, i) => {
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

      {/* ManyToMany Relations Table */}
      {manyToManyRelations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Card
            className='flex gap-3 flex-wrap md:px-[36px] px-0'
            sx={{
              mb: 6,
              width: '100%',
              py: '2rem',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className='w-full'>
              <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                <Typography
                  variant='h5'
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <IconifyIcon icon='tabler:git-merge' />
                  Many-to-Many Relations
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mt: 1,
                    fontStyle: 'italic'
                  }}
                >
                  Junction Data Models are used to manage many-to-many relationships
                </Typography>
              </Box>
              <TableEdit
                InvitationsColumns={manyToManyColumns}
                data={manyToManyRelations.map((ele, i) => {
                  const fData = { ...ele }
                  fData.index = i

                  return fData
                })}
                getRowId={row => row.index}
                loading={loading}
                locale={locale}
                noRow='No Many-to-Many relations found'
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
              />
            </div>
          </Card>
        </Box>
      )}
    </div>
  )
}

export default AddField
