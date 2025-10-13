import { Stack } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'


function TableEdit({
  data,
  InvitationsColumns,
  paginationModel,
  setPaginationModel,
  locale,
  noRow,
  loading,
  getRowId
}) {
  return (
    <div className='mx-2 || rounded-md || overflow-hidden'>
      {paginationModel && setPaginationModel ? (
        <DataGrid
          components={{
            NoRowsOverlay: () => (
              <Stack height='100%' alignItems='center' flexDirection='row' gap={2} justifyContent='center'>
                <h2>{noRow}</h2>
              </Stack>
            )
          }}
          autoHeight
          getRowHeight={() => 'auto'}
          rows={data}
          getRowId={getRowId ? getRowId : false}
          loading={loading}
          columns={InvitationsColumns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          disableColumnFilter
          onPaginationModelChange={setPaginationModel}
          localeText={{
            MuiTablePagination: {
              labelDisplayedRows: ({ from, to, count }) =>
                locale === 'ar' ? `${from} - ${to} من ${count}` : `${from} - ${to} of more than ${count}`,
              labelRowsPerPage: locale === 'ar' ? 'الصفوف لكل صفحة :' : 'Rows per page:'
            },
            columnMenuHideColumn: locale === 'ar' ? 'اخفاء هذا العمود' : 'Hide column',
            columnMenuManageColumns: locale === 'ar' ? 'التحكم في الاعمدة' : 'Manage columns',
            columnMenuSortAsc: locale === 'ar' ? 'ترتيب تصاعديا' : 'Sort by ASC',
            columnMenuSortDesc: locale === 'ar' ? 'ترتيب تنازليا' : 'Sort by DESC',
            columnMenuUnsort: locale === 'ar' ? 'إلغاء الترتيب' : 'Unsort',
            columnsPanelTextFieldPlaceholder: locale === 'ar' ? 'عنوان العمود' : 'Column Title',
            columnsPanelTextFieldLabel: locale === 'ar' ? 'البحث في الأعمدة' : 'Find Column',
            columnsPanelHideAllButton: locale === 'ar' ? 'إخفاء الكل' : 'Hide All',
            columnsPanelShowAllButton: locale === 'ar' ? 'إظهار الكل' : 'Show All'
          }}
        />
      ) : (
        <DataGrid
          components={{
            NoRowsOverlay: () => (
              <Stack height='100%' alignItems='center' flexDirection='row' gap={2} justifyContent='center'>
                <h2>{noRow}</h2>
              </Stack>
            )
          }}
          autoHeight
          getRowHeight={() => 'auto'}
          rows={data}
          getRowId={getRowId ? getRowId : false}
          loading={loading}
          columns={InvitationsColumns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          disableColumnFilter
          localeText={{
            MuiTablePagination: {
              labelDisplayedRows: ({ from, to, count }) =>
                locale === 'ar' ? `${from} - ${to} من ${count}` : `${from} - ${to} of more than ${count}`,
              labelRowsPerPage: locale === 'ar' ? 'الصفوف لكل صفحة :' : 'Rows per page:'
            },
            columnMenuHideColumn: locale === 'ar' ? 'اخفاء هذا العمود' : 'Hide column',
            columnMenuManageColumns: locale === 'ar' ? 'التحكم في الاعمدة' : 'Manage columns',
            columnMenuSortAsc: locale === 'ar' ? 'ترتيب تصاعديا' : 'Sort by ASC',
            columnMenuSortDesc: locale === 'ar' ? 'ترتيب تنازليا' : 'Sort by DESC',
            columnMenuUnsort: locale === 'ar' ? 'إلغاء الترتيب' : 'Unsort',
            columnsPanelTextFieldPlaceholder: locale === 'ar' ? 'عنوان العمود' : 'Column Title',
            columnsPanelTextFieldLabel: locale === 'ar' ? 'البحث في الأعمدة' : 'Find Column',
            columnsPanelHideAllButton: locale === 'ar' ? 'إخفاء الكل' : 'Hide All',
            columnsPanelShowAllButton: locale === 'ar' ? 'إظهار الكل' : 'Show All'
          }}
        />
      )}
    </div>
  )
}

export default TableEdit
