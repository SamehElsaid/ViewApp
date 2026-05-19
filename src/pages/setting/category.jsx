import { Avatar, Button, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { axiosDelete, axiosGet } from 'src/Components/axiosCall'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useIntl } from 'react-intl'
import { LoadingButton } from '@mui/lab'
import PagnationTable from 'src/Components/TableEdit/PagnationTable'
import IconifyIcon from 'src/Components/icon'
import AddCategory from 'src/Components/AddCategory'
import DeletePopUp from 'src/Components/DeletePopUp'

function Category() {
  const { messages, locale } = useIntl()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [search, setSearch] = useState('')
  const [startSearch, setStartSearch] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

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
      field: 'nameAr',
      disableColumnMenu: true,
      headerName: messages.dialogs.nameAr,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.nameAr}
        </Typography>
      )
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'nameEn',
      disableColumnMenu: true,
      headerName: messages.dialogs.nameEn,
      renderCell: ({ row }) => (
        <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.nameEn}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'action',
      sortable: false,
      headerName: messages.actions,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={messages.edit}>
            <IconButton
              size='small'
              onClick={e => {
                setAddCategoryOpen(params.row)
              }}
            >
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
          <Tooltip title={messages.delete}>
            <IconButton
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

  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    setLoading(true)
    const loadingToast = toast.loading(messages.loading)
    axiosGet(`Category/?PageNumber=${paginationModel.page + 1}&page_size=${paginationModel.pageSize}&Name=${startSearch}`, locale)
      .then(res => {
        if (res.status) {
          setData(res.items)
          setTotalRows(res.totalCount)
        }
      })
      .finally(() => {
        setLoading(false)
        toast.dismiss(loadingToast)
      })
  }, [locale, paginationModel.page, paginationModel.pageSize, startSearch, refresh, messages])

  const inputRef = useRef(null)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleDelete = () => {
    setDeleteLoading(true)
    axiosDelete(`Category/delete/${deleteOpen}`, locale).then(res => {
      if (res.status) {
        setDeleteOpen(false)
        setRefresh(prev => prev + 1)
        toast.success(messages.categoryDeletedSuccessfully)
      }
    }).finally(() => {
      setDeleteLoading(false)
    })
  }

  return (
    <div>
      <DeletePopUp open={deleteOpen} setOpen={setDeleteOpen} handleDelete={handleDelete} loadingButton={deleteLoading} />
      <AddCategory open={addCategoryOpen} setOpen={setAddCategoryOpen} setRefresh={setRefresh} />
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
              {messages.dialogs.category}
            </Typography>
            <Avatar skin='light' sx={{ width: 30, height: 30 }}>
              {totalRows}
            </Avatar>
          </div>
          <Button variant='contained' color='primary' onClick={() => setAddCategoryOpen(true)}>
            {messages.dialogs.addCategory}
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
                defaultValue={search}
                ref={inputRef}
                onBlur={e => {
                  setSearch(e.target.value)
                  if (e.target.value === '') {
                    setStartSearch('')
                  }
                }}
              />

              {startSearch ? (
                <LoadingButton
                  loading={loading}
                  variant='contained'
                  type='button'
                  color='error'
                  onClick={() => {
                    setSearch('')
                    setStartSearch('')
                    setPaginationModel({ page: 0, pageSize: 10 })
                    inputRef.current.value = ''
                  }}
                >
                  {messages.dialogs.reset}
                </LoadingButton>
              ) : (
                <LoadingButton loading={loading} variant='contained' type='submit' color='primary'>
                  {messages.dialogs.search}
                </LoadingButton>
              )}
            </form>

            <PagnationTable
              Invitationscolumns={columns}
              data={data?.map((ele, i) => {
                const fData = { ...ele }
                fData.index = i + paginationModel.page * paginationModel.pageSize

                return fData
              })}
              totalRows={totalRows}
              getRowId={row => row.id}
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

export default Category
