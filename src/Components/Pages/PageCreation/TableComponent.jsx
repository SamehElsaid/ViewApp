import {
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { useIntl } from 'react-intl'
import ViewValueInTable from './ViewValueInTable'
import GetTimeinTable from 'src/Components/GetTimeinTable'
import ViewInputInTable from '../ViewInputinTable'
import IconifyIcon from 'src/Components/icon'

function TableComponent({
  filterWithSelect,
  columns,
  paginationModel,
  setPaginationModel,
  totalCount,
  loadingEntity,
  loadingHeader,
  readOnly,
  disabled,
  onChange,
  setTriggerData,
  getDesign,
  triggerData,
  errorAllRef,
  data,
  setGetFields,
  editAction,
  deleteAction,
  setEditOpen,
  setDeleteOpen,
  setChangedValue
}) {
  const { locale, messages } = useIntl()

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {loadingHeader ? (
        <div className='flex justify-center items-center p-4'>
          <CircularProgress />
        </div>
      ) : (
        <>
          <TableContainer>
            <Table
              stickyHeader
              sx={{
                border: '1px solid rgba(224, 224, 224, 1)',
       
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    '&:not(:last-child) td, &:not(:last-child) th': {
                      borderBottom: '1px solid rgba(224, 224, 224, 1)' 
                    }
                  }}
                >
                  {filterWithSelect.map(column => (
                    <TableCell
                      className='uppercase'
                      key={column.id}
                      sx={{
                        borderInlineEnd: '1px solid rgba(224, 224, 224, 1)',
                        '&:last-child': { borderInlineEnd: 0 } 
                      }}
                    >
                      {locale === 'ar' ? column.nameAr : column.nameEn}
                    </TableCell>
                  ))}
                  {(data.kind === 'form-table' || editAction || deleteAction) && (
                    <TableCell className='uppercase' sx={{ maxWidth: '150px', width: '150px' }}>
                      {messages.actions}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingEntity ? (
                  <TableRow>
                    <TableCell colSpan={filterWithSelect.length + 1} className='flex justify-center items-center'>
                      <div className='flex justify-center items-center p-4 rounded-md'>
                        <CircularProgress />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  columns.map(column => (
                    <TableRow key={column.id}>
                      {filterWithSelect.map(parentKey => (
                        <TableCell key={parentKey.id} sx={{ borderInlineEnd: '1px solid rgba(224, 224, 224, 1)' }}>
                          <Typography variant='subtitle2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {data.kind === 'form-table' ? (
                              <ViewInputInTable
                                ele={parentKey}
                                row={column}
                                readOnly={readOnly}
                                disabled={disabled}
                                data={data}
                                setGetFields={setGetFields}
                                onChange={onChange}
                                setTriggerData={setTriggerData}
                                getDesign={getDesign}
                                triggerData={triggerData}
                                errorAllRef={errorAllRef}
                                notFound={Object.keys(column?.[parentKey?.key]).length !== 0}
                                setChangedValue={setChangedValue}
                              />
                            ) : (
                              <>
                                {parentKey?.fieldCategory === 'Associations' ? (
                                  <ViewValueInTable data={parentKey} value={column[parentKey.key] ?? ''} />
                                ) : parentKey?.type === 'Date' ? (
                                  <>
                                    {Object.keys(column?.[parentKey?.key]).length !== 0 ? (
                                      <GetTimeinTable data={column[parentKey.key]} />
                                    ) : (
                                      '-'
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {Object.keys(column?.[parentKey?.key]).length !== 0 ? (
                                      column?.[parentKey?.key].includes('/Uploads/') ? (
                                        <a
                                          href={
                                            process.env.API_URL +
                                            '/file/download/' +
                                            column?.[parentKey?.key].replaceAll('/Uploads/', '')
                                          }
                                          target='_blank'
                                          rel='noreferrer'
                                        >
                                          {column?.[parentKey?.key].split('/Uploads/')[1].slice(0, 30) +
                                            '.' +
                                            column?.[parentKey?.key].split('/Uploads/')[1].split('.').pop()}
                                        </a>
                                      ) : (
                                        column?.[parentKey?.key]
                                      )
                                    ) : (
                                      <>{column?.[parentKey?.key] ?? '-'}</>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </Typography>
                        </TableCell>
                      ))}
                      {data.kind === 'form-table' ? (
                        <TableCell className='flex justify-center items-center' sx={{ borderBlockEnd: '1px solid rgba(224, 224, 224, 1)' }}>
                          <Tooltip title={messages.delete}>
                            <IconButton
                              size='small'
                              onClick={e => {
                                setGetFields(prev => prev.filter(ele => ele.id !== column.id))
                              }}
                            >
                              <IconifyIcon icon='tabler:trash' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      ) : editAction || deleteAction ? (
                        <>
                          <TableCell
                            sx={{ maxWidth: '150px', width: '150px' }}
                            className='flex justify-center items-center'
                          >
                            {editAction && (
                              <Tooltip title={messages.edit}>
                                <IconButton
                                  size='small'
                                  onClick={e => {
                                    setEditOpen(column)
                                  }}
                                >
                                  <IconifyIcon icon='tabler:edit' />
                                </IconButton>
                              </Tooltip>
                            )}
                            {deleteAction && (
                              <Tooltip title={messages.delete}>
                                <IconButton
                                  size='small'
                                  onClick={e => {
                                    setDeleteOpen(column)
                                  }}
                                >
                                  <IconifyIcon icon='tabler:trash' />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </>
                      ) : (
                        <></>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component='div'
            count={totalCount}
            page={paginationModel.page}
            onPageChange={(event, value) => {
              setPaginationModel({ ...paginationModel, page: value })
            }}
            rowsPerPage={paginationModel.pageSize}
            onRowsPerPageChange={event => {
              setPaginationModel({ ...paginationModel, pageSize: event.target.value })
            }}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </>
      )}
    </Paper>
  )
}

export default TableComponent
