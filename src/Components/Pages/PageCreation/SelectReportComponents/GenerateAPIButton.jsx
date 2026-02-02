import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'
import { axiosPost } from 'src/Components/axiosCall'

const getConditionsForMeasure = (data, measureIndex) => {
  const allConditions = data.Conditions || []

  return allConditions.filter(c => c.measureIndex === measureIndex)
}

export default function GenerateAPIButton({ data, onChange }) {
  const { locale, messages } = useIntl()
  const [loading, setLoading] = useState(false)
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false)
  const [pendingApiData, setPendingApiData] = useState(null)

  const generateAPI = () => {
    setLoading(true)

    const apiData = {
      ReportAPIName: data.reportAPIName || '',
      QueryDefinition: {
        OutputType: data.typeOfReport || 'table',
        Tables: [],
        Aggregate: {
          Aggregates: []
        },
        Conditions: []
      }
    }

    // Build Tables from selected columns
    if (data.collectionName && data.selected && data.selected.length > 0) {
      const mainTableColumns = data.selected.map(columnName => ({
        ColumnName: columnName,
        ColumnAlias: columnName
      }))

      apiData.QueryDefinition.Tables.push({
        Table: data.collectionName,
        Columns: mainTableColumns
      })
    }

    // Add related collections tables
    if (data.SelectedRelatedCollectionsFields && Array.isArray(data.SelectedRelatedCollectionsFields)) {
      data.SelectedRelatedCollectionsFields.forEach(item => {
        if (item?.collection?.key && item?.selected && Array.isArray(item.selected) && item.selected.length > 0) {
          const relatedTableColumns = item.selected.map(columnName => ({
            ColumnName: columnName,
            ColumnAlias: null
          }))

          apiData.QueryDefinition.Tables.push({
            Table: item.collection.key,
            Columns: relatedTableColumns
          })
        }
      })
    }

    // Build Aggregates
    if (data.Aggregates && Array.isArray(data.Aggregates) && data.Aggregates.length > 0) {
      apiData.QueryDefinition.Aggregate.Aggregates = data.Aggregates.map((agg, idx) => {
        const measureConditions = getConditionsForMeasure(data, idx)

        return {
          Table: agg.Table,
          ColumnName: agg.ColumnName,
          ColumnAlias: agg.ColumnAlias || agg.ColumnName,
          Operation: agg.Operation,
          conditions: measureConditions
        }
      })
    }

    // Build Conditions from GlobalConditions
    if (data.GlobalConditions && Array.isArray(data.GlobalConditions) && data.GlobalConditions.length > 0) {
      apiData.QueryDefinition.Conditions = data.GlobalConditions.map((condition, idx) => {
        const conditionObj = {
          Table: condition.Table,
          Column: condition.Column,
          Operator: condition.Operator
        }

        conditionObj.Value = condition.Value

        // Add LogicalOperator from second condition onwards
        if (idx > 0 && condition.LogicalOperator) {
          conditionObj.LogicalOperator = condition.LogicalOperator
        }

        return conditionObj
      })
    }

    // Build GroupBy
    if (data.GroupBy && Array.isArray(data.GroupBy) && data.GroupBy.length > 0) {
      apiData.QueryDefinition.Aggregate.GroupBy = data.GroupBy
    }

    // حفظ الـ data لمحاولة الكتابة في حالة 409
    setPendingApiData(apiData)

    // Save API data
    axiosPost('dynamic-report-data/save-collections-aggregated-data-API', locale, apiData)
      .then(response => {
        if (response.status) {
          toast.success('API generated successfully')
          const reload = data?.reload || 0 
          onChange({
            ...data,
            is_api_generated: true,
            userReportName: apiData.ReportAPIName,
            reload: reload + 1
          })
        } else {

          // لو الـ status 409 نفتح الـ popup
          if (response.code === 409 || response.statusCode === 409) {
            setOverwriteDialogOpen(true)
          }
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return apiData
  }

  const handleOverwriteConfirm = () => {
    if (!pendingApiData) return

    const overwriteData = {
      ...pendingApiData,
      isOverwrite: true
    }

    setLoading(true)

    axiosPost('dynamic-report-data/save-collections-aggregated-data-API', locale, overwriteData)
      .then(response => {
        if (response.status) {
          toast.success('API overwritten successfully!')
          onChange({
            ...data,
            is_api_generated: true,
            userReportName: overwriteData.ReportAPIName
          })
          setOverwriteDialogOpen(false)
          setPendingApiData(null)
        } else {
          toast.error(messages?.errors?.generateAPIFailed || 'Failed to overwrite API')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleOverwriteCancel = () => {
    setOverwriteDialogOpen(false)
  }

  return (
    <div className='mt-4 flex justify-end'>
      <Button
        loading={loading}
        variant='contained'
        disabled={!data.reportAPIName}
        color='primary'
        size='large'
        onClick={generateAPI}
        sx={{ minWidth: 200 }}
      >
        {messages?.dialogs?.generateAPI || 'Generate API'}
      </Button>

      <Dialog open={overwriteDialogOpen} onClose={handleOverwriteCancel}>
        <DialogTitle>{locale === 'ar' ? 'تأكيد استبدال البيانات' : 'Confirm Replace Data'}</DialogTitle>
        <DialogContent>
          <Typography>
            {locale === 'ar'
              ? 'هذا الاسم مستخدم من قبل، هل تريد استبدال البيانات؟'
              : 'This name is already used. Do you want to replace the data?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOverwriteCancel}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button color='primary' variant='contained' onClick={handleOverwriteConfirm}>
            {locale === 'ar' ? 'استبدال البيانات' : 'Replace Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
