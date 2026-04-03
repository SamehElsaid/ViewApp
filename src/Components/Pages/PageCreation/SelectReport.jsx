/* eslint-disable react-hooks/exhaustive-deps */
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import Collapse from '@kunukn/react-collapse'
import { axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import CloseNav from './CloseNav'
import { MdDeleteOutline } from 'react-icons/md'
import {
  ReportConfiguration,
  GenerateAPIButton,
  MeasuresSection,
  MeasureConditionDialog,
  ConditionsSection,
  GroupBySection
} from './SelectReportComponents'
import SelectReportSection from './SelectReportSection'
import StatisticsSection from './StatisticsSection'

function SelectReport({ onChange, data, type, buttonRef, title }) {
  const { locale, messages } = useIntl()
  const [collection, setCollection] = useState('')
  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [getFields, setGetFields] = useState([])
  const [SelectedRelatedCollectionsFields, setSelectedRelatedCollectionsFields] = useState([])
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    setLoadingCollection(true)
    axiosGet(`data-source/get`, locale)
      .then(res => {
        if (res.status) {
          onChange({
            ...data,
            data_source_id: res.data[0].id
          })
        }
      })
      .finally(() => {
        setLoadingCollection(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, data.data_source_id])

  useEffect(() => {
    if (!data.data_source_id) return
    setLoadingCollection(true)
    axiosGet(`collections/get/?dataSourceId=${data.data_source_id}`, locale)
      .then(res => {
        if (res.status) {
          setOptionsCollection(res.data ?? [])
        } else {
          setOptionsCollection([])
        }
      })
      .finally(() => {
        setLoadingCollection(false)
      })
  }, [locale, data.data_source_id])
  const addMoreData = data?.addMoreElement ?? []

  useEffect(() => {
    if (data.collectionId) {
      axiosGet(`collections/get-by-id?id=${data.collectionId}`, locale).then(res => {
        if (res.status) {
          if (res.data?.id) {
            const loadingToast = toast.loading(messages.dialogs.loading)
            axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale)
              .then(res => {
                if (res.status) {
                  setGetFields(res.data)
                }
              })
              .finally(() => {
                toast.dismiss(loadingToast)
              })
          }
          setCollection(res.data)
        }
      })
    }
  }, [locale, data.collectionId])

  useEffect(() => {
    if (data.selected) {
      setSelectedOptions(data.selected)
    }
  }, [data.selected])

  const handleInputChange = async (event, value) => {
    try {
      const res = await axiosGet(`collections/get/?dataSourceId=${data.data_source_id}`, locale)
      if (res.status) {
        setOptionsCollection(res.data ?? [])
      } else {
        setCollection('')
      }
    } finally {
      setLoadingCollection(false)
    }
  }

  const handleChange = (event, fieldCategory, skipCheck, field) => {
    // const
    const { value, checked } = event.target
    const isChecked = skipCheck || checked

    setSelectedOptions(prevSelected =>
      isChecked ? [...prevSelected, value] : prevSelected.filter(item => item !== value)
    )
    const selected = isChecked ? [...selectedOptions, value] : selectedOptions.filter(item => item !== value)

    const oldAdditionalFields = data?.additional_fields ?? []
    const filteredAdditionalFields = oldAdditionalFields.filter(inp => inp.key !== field?.id)

    // Tabs assignment logic removed from here; use the inline dropdowns instead
    const addMoreElementLocal = [...(data?.addMoreElement ?? [])]

    if (skipCheck) {
      onChange({
        ...data,
        selected,
        associationsConfig: skipCheck,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    } else {
      onChange({
        ...data,
        selected,
        additional_fields: filteredAdditionalFields,
        addMoreElement: addMoreElementLocal
      })
    }
  }

  const [relatedCollections, setRelatedCollections] = useState([])

  const [relatedCollectionsFields, setRelatedCollectionsFields] = useState([])

  // State for nested related collections (related collections for each related collection)
  const [nestedRelatedCollections, setNestedRelatedCollections] = useState({}) // { collectionKey: [] }
  const [nestedRelatedCollectionsFields, setNestedRelatedCollectionsFields] = useState({}) // { collectionKey: [{ collection, fields }] }

  useEffect(() => {
    if (data?.relatedCollections?.length > 0) {
      const loadingToast = toast.loading(messages.dialogs.loading)
      Promise.all(
        data.relatedCollections.map(async item => {
          const res = await axiosGet(`collection-fields/get?CollectionId=${item.id}`, locale)
          if (res.status) {
            return { collection: item, fields: res.data }
          }

          return null
        })
      )
        .then(results => {
          const validResults = results.filter(Boolean)
          setRelatedCollectionsFields(validResults)
        })
        .finally(() => {
          toast.dismiss(loadingToast)
        })
    }
  }, [data?.relatedCollections?.length])

  // Fetch nested related collections fields
  useEffect(() => {
    const nestedCollections = data?.nestedRelatedCollections || {}
    const collectionKeys = Object.keys(nestedCollections)

    if (collectionKeys.length > 0) {
      const loadingToast = toast.loading(messages.dialogs.loading)
      Promise.all(
        collectionKeys.map(async collectionKey => {
          const collections = nestedCollections[collectionKey] || []

          const fieldsPromises = collections.map(async item => {
            const res = await axiosGet(`collection-fields/get?CollectionId=${item.id}`, locale)
            if (res.status) {
              return { collection: item, fields: res.data }
            }

            return null
          })

          const results = await Promise.all(fieldsPromises)

          return { collectionKey, results: results.filter(Boolean) }
        })
      )
        .then(allResults => {
          const newNestedFields = {}
          allResults.forEach(({ collectionKey, results }) => {
            if (results.length > 0) {
              newNestedFields[collectionKey] = results
            }
          })
          setNestedRelatedCollectionsFields(prev => ({ ...prev, ...newNestedFields }))
        })
        .finally(() => {
          toast.dismiss(loadingToast)
        })
    }
  }, [data?.nestedRelatedCollections, locale])

  useEffect(() => {
    setSelectedRelatedCollectionsFields(data.SelectedRelatedCollectionsFields ?? [])
  }, [data.SelectedRelatedCollectionsFields])

  useEffect(() => {
    const tableName = data.collectionName

    const columns =
      data?.selected?.map(ele => {
        return {
          columnName: ele
        }
      }) || []

    const table = [
      {
        table: tableName,
        columns
      }
    ]

    if (data.SelectedRelatedCollectionsFields && Array.isArray(data.SelectedRelatedCollectionsFields)) {
      data.SelectedRelatedCollectionsFields.forEach(item => {
        if (item?.collection?.key && item?.selected && Array.isArray(item.selected)) {
          table.push({
            table: item.collection.key,
            columns: item.selected.map(ele => {
              return {
                columnName: ele
              }
            })
          })
        }

        // Add nested related collections to table
        if (item?.nestedSelected && Array.isArray(item.nestedSelected)) {
          item.nestedSelected.forEach(nestedItem => {
            if (nestedItem?.collection?.key && nestedItem?.selected && Array.isArray(nestedItem.selected)) {
              table.push({
                table: nestedItem.collection.key,
                columns: nestedItem.selected.map(ele => {
                  return {
                    columnName: ele
                  }
                })
              })
            }
          })
        }
      })
    }

    setTableData(table)
  }, [data.collectionId, data.selected, data.SelectedRelatedCollectionsFields])

  // =========================
  // =========================

  const AGGREGATE_OPERATIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']
  const LOGICAL_OPERATORS = ['AND', 'OR']

  // تهيئة MeasuresRows إذا لم تكن موجودة (للـ rows المؤقتة)
  useEffect(() => {
    if (!data.MeasuresRows || data.MeasuresRows.length === 0) {
      onChange({
        ...data,
        MeasuresRows: [
          {
            table: '',
            columnName: '',
            operation: '',
            alias: ''
          }
        ]
      })
    }
  }, [])

  // تهيئة ConditionsRows إذا لم تكن موجودة (للـ rows المؤقتة)
  useEffect(() => {
    if (!data.ConditionsRows || data.ConditionsRows.length === 0) {
      onChange({
        ...data,
        ConditionsRows: [
          {
            table: '',
            columnName: '',
            operator: '',
            logicalOperator: '',
            value: ''
          }
        ]
      })
    }
  }, [])

  // تهيئة GroupByRows إذا لم تكن موجودة
  useEffect(() => {
    if (!data.GroupByRows || data.GroupByRows.length === 0) {
      onChange({
        ...data,
        GroupByRows: [
          {
            table: '',
            columns: []
          }
        ]
      })
    }
  }, [])

  // جهز قائمة الـ columns المتاحة من الـ tableData
  const availableColumns = React.useMemo(() => {
    if (!tableData || tableData.length === 0) return []
    const columns = []
    tableData.forEach(tbl => {
      ; (tbl.columns || []).forEach(col => {
        columns.push({
          table: tbl.table,
          columnName: col.columnName,
          label: `${tbl.table}.${col.columnName}`
        })
      })
    })

    return columns
  }, [tableData])

  const handleMeasureChange = (index, key, value) => {
    const measuresRows = [...(data.MeasuresRows || [])]
    measuresRows[index] = { ...measuresRows[index], [key]: value }
    onChange({
      ...data,
      MeasuresRows: measuresRows
    })
  }

  const handleColumnNameChange = (index, columnLabel) => {
    const measuresRows = [...(data.MeasuresRows || [])]
    const selectedColumn = availableColumns.find(col => col.label === columnLabel)
    if (selectedColumn) {
      measuresRows[index] = {
        ...measuresRows[index],
        table: selectedColumn.table,
        columnName: selectedColumn.columnName
      }
      onChange({
        ...data,
        MeasuresRows: measuresRows
      })
    }
  }


  const handleAddMeasuresCard = () => {
    const measuresRows = data.MeasuresRows || []
    const existingAggregates = data.Aggregates || []

    // أخذ الـ row الأول الذي يحتوي على بيانات كاملة
    const validRow = measuresRows.find(row => row.operation && row.columnName && row.table)

    if (validRow) {
      const { table, columnName, operation, alias } = validRow

      // التحقق من عدم تكرار columnName
      const isDuplicate = existingAggregates.some(item => item.ColumnName === columnName && item.Table === table)

      const aggregateItem = {
        Table: table,
        ColumnName: columnName,
        Operation: operation.toUpperCase()
      }

      if (alias && alias.trim()) {
        aggregateItem.ColumnAlias = alias.trim()
      }

      // إضافة الـ item الجديد للـ array الموجود
      onChange({
        ...data,
        Aggregates: [...existingAggregates, aggregateItem],
        viewValueInChart: '',
        viewInputValue: '',
        MeasuresRows: [
          {
            table: '',
            columnName: '',
            operation: '',
            alias: ''
          }
        ]
      })

      toast.success(messages?.dialogs?.conditionAddedSuccessfully || 'Added successfully')
    }
  }

  const handleDeleteAggregate = index => {
    const existingAggregates = data.Aggregates || []
    const newAggregates = existingAggregates.filter((_, i) => i !== index)

    // Remove conditions associated with this measure and update indices
    const existingConditions = data.Conditions || []

    const newConditions = existingConditions
      .filter(c => c.measureIndex !== index)
      .map(c => {
        // Update measureIndex for conditions that come after the deleted measure
        if (c.measureIndex > index) {
          return { ...c, measureIndex: c.measureIndex - 1 }
        }

        return c
      })

    onChange({
      ...data,
      Aggregates: newAggregates,
      Conditions: newConditions,
      viewValueInChart: '',
      viewInputValue: '',
    })
  }

  // =========================
  // Conditions Handlers (Similar to Measures)
  // =========================
  const [tempInputValues, setTempInputValues] = useState({}) // For In operator inputs

  const handleConditionChange = (index, key, value) => {
    const conditionsRows = [...(data.ConditionsRows || [])]
    conditionsRows[index] = { ...conditionsRows[index], [key]: value }
    onChange({
      ...data,
      ConditionsRows: conditionsRows
    })
  }

  const handleConditionColumnNameChange = (index, columnLabel) => {
    const conditionsRows = [...(data.ConditionsRows || [])]
    const selectedColumn = availableColumns.find(col => col.label === columnLabel)
    if (selectedColumn) {
      conditionsRows[index] = {
        ...conditionsRows[index],
        table: selectedColumn.table,
        columnName: selectedColumn.columnName
      }
      onChange({
        ...data,
        ConditionsRows: conditionsRows
      })
    }
  }

  const handleRemoveConditionRow = index => {
    // Prevent deleting the first condition
    if (index === 0) {
      return
    }
    const conditionsRows = [...(data.ConditionsRows || [])]
    conditionsRows.splice(index, 1)
    onChange({
      ...data,
      ConditionsRows: conditionsRows
    })
  }

  const handleAddConditionCard = () => {
    const conditionsRows = data.ConditionsRows || []
    const existingGlobalConditions = data.GlobalConditions || []

    // أخذ الـ row الأول الذي يحتوي على بيانات كاملة
    const validRow = conditionsRows.find(row => row.operator && row.columnName && row.table)

    if (validRow) {
      const { table, columnName, operator, logicalOperator, value } = validRow

      const conditionItem = {
        Table: table,
        Column: columnName,
        Operator: operator
      }

      // LogicalOperator is required from the second condition onwards
      const isFirstCondition = existingGlobalConditions.length === 0
      if (isFirstCondition) {
        // First condition should not have LogicalOperator
        if (logicalOperator && logicalOperator.trim()) {
          // Clear logicalOperator for first condition
          conditionItem.LogicalOperator = undefined
        }
      } else {
        // From second condition onwards, LogicalOperator is required
        if (!logicalOperator || !logicalOperator.trim()) {
          toast.error(messages?.dialogs?.logicalOperatorRequired || 'Logical Operator is required from the second condition onwards')

          return
        }
        conditionItem.LogicalOperator = logicalOperator.trim()
      }

      // Handle different operator types
      if (operator === 'IsNull' || operator === 'IsNotNull') {
        // For IsNull and IsNotNull, value should be null
        conditionItem.Value = null
      } else if (operator === 'Between') {
        // For Between, value should be array with 2 values
        if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
          toast.error(messages?.dialogs?.pleaseEnterBothValuesForBetweenOperator || 'Please enter both values for Between operator')

          return
        }
        conditionItem.Value = value
      } else if (operator === 'In') {
        // For In, value should be array with at least 1 value
        if (!Array.isArray(value) || value.length === 0) {
          toast.error(messages?.dialogs?.pleaseAddAtLeastOneValueForInOperator || 'Please add at least one value for In operator')

          return
        }
        conditionItem.Value = value
      } else {
        // For other operators, single value (string)
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(messages?.dialogs?.pleaseEnterTheFields || 'Please enter a value')

          return
        }
        conditionItem.Value = value
      }

      // إضافة الـ item الجديد للـ array الموجود
      onChange({
        ...data,
        GlobalConditions: [...existingGlobalConditions, conditionItem],
        viewValueInChart: '',
        viewInputValue: '',
        ConditionsRows: [
          {
            table: '',
            columnName: '',
            operator: '',
            logicalOperator: '',
            value: ''
          }
        ]
      })

      // Clear temp input values
      setTempInputValues({})

      toast.success(messages?.savedSuccessfully || 'Condition added successfully')
    }
  }

  const handleDeleteConditionCard = index => {
    // Prevent deleting the first condition

    const existingGlobalConditions = data.GlobalConditions || []
    const newGlobalConditions = existingGlobalConditions.filter((_, i) => i !== index)
    onChange({
      ...data,
      GlobalConditions: newGlobalConditions,
      viewValueInChart: '',
      viewInputValue: '',
    })
  }



  const handleGroupByTableChange = (index, tableName) => {
    const groupByRows = [...(data.GroupByRows || [])]
    groupByRows[index] = {
      ...groupByRows[index],
      table: tableName,
      columns: [] // Reset columns when table changes
    }
    onChange({
      ...data,
      GroupByRows: groupByRows
    })
  }

  const handleGroupByColumnToggle = (index, columnName) => {
    const groupByRows = [...(data.GroupByRows || [])]
    const currentColumns = groupByRows[index]?.columns || []
    const columnIndex = currentColumns.indexOf(columnName)

    if (columnIndex > -1) {
      // Remove column
      currentColumns.splice(columnIndex, 1)
    } else {
      // Add column
      currentColumns.push(columnName)
    }

    groupByRows[index] = {
      ...groupByRows[index],
      columns: [...currentColumns]
    }
    onChange({
      ...data,
      GroupByRows: groupByRows
    })
  }

  const handleAddGroupByRow = () => {
    const groupByRows = [...(data.GroupByRows || [])]
    groupByRows.push({
      table: '',
      columns: []
    })
    onChange({
      ...data,
      GroupByRows: groupByRows
    })
  }

  const handleRemoveGroupByRow = index => {
    const groupByRows = [...(data.GroupByRows || [])]
    groupByRows.splice(index, 1)
    onChange({
      ...data,
      GroupByRows: groupByRows
    })
  }

  const handleAddGroupByCard = () => {
    const groupByRows = data.GroupByRows || []
    const validRow = groupByRows.find(row => row.table && row.columns && row.columns.length > 0)

    if (validRow) {
      const { table, columns } = validRow

      const groupByItem = {
        Table: table,
        Columns: columns
      }

      const existingGroupBy = data.GroupBy || []

      // Check for duplicate table
      const isDuplicate = existingGroupBy.some(item => item.Table === table)
      if (isDuplicate) {
        toast.error(messages?.dialogs?.thisTableAlreadyExistsInGroupBy || 'This table already exists in Group By')

        return
      }

      onChange({
        ...data,
        viewValueInChart: '',
        viewInputValue: '',
        GroupBy: [...existingGroupBy, groupByItem],
        GroupByRows: [
          {
            table: '',
            columns: []
          }
        ]
      })

      toast.success(messages?.dialogs?.groupByAddedSuccessfully || 'Group By added successfully')
    } else {
      toast.error(messages?.dialogs?.pleaseSelectATableAndAtLeastOneColumn || 'Please select a table and at least one column')
    }
  }

  const handleDeleteGroupByCard = index => {
    const existingGroupBy = data.GroupBy || []
    const newGroupBy = existingGroupBy.filter((_, i) => i !== index)
    onChange({
      ...data,
      GroupBy: newGroupBy,
      viewValueInChart: '',
      viewInputValue: '',
    })
  }

  // Get available tables
  const availableTables = React.useMemo(() => {
    const tables = []
    if (data.collectionName) {
      tables.push({
        name: data.collectionName,
        columns: data.selected || []
      })
    }
    if (data.SelectedRelatedCollectionsFields && Array.isArray(data.SelectedRelatedCollectionsFields)) {
      data.SelectedRelatedCollectionsFields.forEach(item => {
        if (item?.collection?.key && item?.selected && Array.isArray(item.selected)) {
          tables.push({
            name: item.collection.key,
            columns: item.selected
          })
        }

        // Add nested related collections to available tables
        if (item?.nestedSelected && Array.isArray(item.nestedSelected)) {
          item.nestedSelected.forEach(nestedItem => {
            if (nestedItem?.collection?.key && nestedItem?.selected && Array.isArray(nestedItem.selected)) {
              tables.push({
                name: nestedItem.collection.key,
                columns: nestedItem.selected
              })
            }
          })
        }
      })
    }

    return tables
  }, [data.collectionName, data.selected, data.SelectedRelatedCollectionsFields])

  // =========================
  // Conditions State and Handlers
  // =========================
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false)
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(null)

  const [conditionForm, setConditionForm] = useState({
    table: '',
    column: '',
    operator: '',
    value: ''
  })
  const [tempInputValue, setTempInputValue] = useState('') // For In operator input

  const CONDITION_OPERATORS = [
    'Equals',
    'NotEquals',
    'GreaterThan',
    'GreaterThanOrEqual',
    'LessThan',
    'LessThanOrEqual',
    'In',
    'Between',
    'Like',
    'IsNull',
    'IsNotNull'
  ]

  const handleOpenConditionDialog = measureIndex => {
    // Get the first available column from availableColumns
    const firstColumn = availableColumns.length > 0 ? availableColumns[0] : null
    setCurrentMeasureIndex(measureIndex)
    setConditionForm({
      table: firstColumn?.table || '',
      column: firstColumn?.columnName || '',
      operator: '',
      value: ''
    })
    setTempInputValue('')
    setConditionDialogOpen(true)
  }

  const handleCloseConditionDialog = () => {
    setConditionDialogOpen(false)
    setCurrentMeasureIndex(null)
    setConditionForm({
      table: '',
      column: '',
      operator: '',
      value: ''
    })
    setTempInputValue('')
  }

  const handleSaveCondition = () => {
    // Validate required fields
    if (!conditionForm.table || !conditionForm.column || !conditionForm.operator) {
      toast.error(messages?.dialogs?.pleaseEnterTheFields || 'Please fill in all required fields')

      return
    }

    const newCondition = {
      Table: conditionForm.table,
      Column: conditionForm.column,
      Operator: conditionForm.operator,
      measureIndex: currentMeasureIndex
    }

    // Handle different operator types
    if (conditionForm.operator === 'IsNull' || conditionForm.operator === 'IsNotNull') {
      // For IsNull and IsNotNull, value should be null
      newCondition.Value = null
    } else if (conditionForm.operator === 'Between') {
      // For Between, value should be array with 2 values
      if (
        !Array.isArray(conditionForm.value) ||
        conditionForm.value.length !== 2 ||
        !conditionForm.value[0] ||
        !conditionForm.value[1]
      ) {
        toast.error(messages?.dialogs?.pleaseEnterBothValuesForBetweenOperator || 'Please enter both values for Between operator')

        return
      }
      newCondition.Value = conditionForm.value
    } else if (conditionForm.operator === 'In') {
      // For In, value should be array with at least 1 value
      if (!Array.isArray(conditionForm.value) || conditionForm.value.length === 0) {
        toast.error(messages?.dialogs?.pleaseAddAtLeastOneValueForInOperator || 'Please add at least one value for In operator')

        return
      }
      newCondition.Value = conditionForm.value
    } else {
      // For other operators, single value (string)
      if (!conditionForm.value || (Array.isArray(conditionForm.value) && conditionForm.value.length === 0)) {
        toast.error(messages?.dialogs?.pleaseEnterTheFields || 'Please enter a value')

        return
      }
      newCondition.Value = conditionForm.value
    }

    const existingConditions = data.Conditions || []
    onChange({
      ...data,
      Conditions: [...existingConditions, newCondition]
    })

    toast.success(messages?.dialogs?.conditionAddedSuccessfully || 'Condition added successfully')
    handleCloseConditionDialog()
  }

  const handleDeleteCondition = (measureIndex, conditionIndex) => {
    const existingConditions = data.Conditions || []
    const measureConditions = existingConditions.filter(c => c.measureIndex === measureIndex)
    const conditionToDelete = measureConditions[conditionIndex]

    const newConditions = existingConditions.filter(c => c !== conditionToDelete)
    onChange({
      ...data,
      Conditions: newConditions
    })
  }

  const getConditionsForMeasure = measureIndex => {
    const allConditions = data.Conditions || []

    return allConditions.filter(c => c.measureIndex === measureIndex)
  }


  // Generate API function moved to GenerateAPIButton component

  return (
    <div>
      <div className=''>
        <CloseNav text={title} buttonRef={buttonRef} />
      </div>

      <form
        className='flex flex-col p-4 h-full'
        onSubmit={e => {
          e.preventDefault()
        }}
      >
        <div className='mb-4'></div>

        {/* Report Configuration */}
        <ReportConfiguration data={data} onChange={onChange} />

        <Autocomplete
          options={loadingCollection ? [] : optionsCollection}
          getOptionLabel={option => option?.key || ''}
          loading={loadingCollection}
          onInputChange={handleInputChange}
          value={collection || ''}
          onChange={(e, value) => {
            setCollection(value)
            setRelatedCollections([])
            setRelatedCollectionsFields([])
            setNestedRelatedCollections({})
            setNestedRelatedCollectionsFields({})
            setSelectedOptions([])
            onChange({
              ...data,
              collectionId: value?.id,
              collectionName: value?.key,
              selected: [],
              sortWithId: false,
              relatedCollections: [],
              SelectedRelatedCollectionsFields: [],
              nestedRelatedCollections: {},
              viewValueInChart: '',
              viewInputValue: '',

              // Reset Measures
              MeasuresRows: [
                {
                  table: '',
                  columnName: '',
                  operation: '',
                  alias: ''
                }
              ],
              Aggregates: [],

              // Reset Conditions
              ConditionsRows: [
                {
                  table: '',
                  columnName: '',
                  operator: '',
                  logicalOperator: '',
                  value: ''
                }
              ],
              GlobalConditions: [],
              Conditions: [],

              // Reset Group By
              GroupByRows: [
                {
                  table: '',
                  columns: []
                }
              ],
              GroupBy: [],

              // Reset additional fields
              additional_fields: []
            })
          }}
          renderInput={params => (
            <TextField
              {...params}
              label={messages.dialogs.selectDataModel}
              variant='outlined'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCollection ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />

        <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(collection?.nameEn)}>
          <div className='mt-4'>
            <FormControl component='fieldset' fullWidth>
              <FormLabel component='legend'>{messages.columns}</FormLabel>
              <div className='!flex !flex-row !flex-wrap gap-2'>
                {getFields?.map(value => {
                  const dataValidations = {}
                  value.validationData.forEach(item => {
                    dataValidations[item.ruleType] = item.parameters
                  })
                  if (!value?.options?.isSystemField) {
                    return (
                      <FormControlLabel
                        key={value.key}
                        className='!w-fit capitalize'
                        control={
                          <>
                            <Checkbox
                              value={value.key}
                              checked={selectedOptions.includes(value.key)}
                              onChange={e => {
                                handleChange(e, value.fieldCategory, false, value)
                              }}
                            />
                            {(() => {
                              const tabsElement = (data.addMoreElement || []).find(ele => ele.key === 'tabs')
                              if (!tabsElement) return null
                              const tabs = Array.isArray(tabsElement?.data) ? tabsElement?.data : []

                              const currentIndex = Math.max(
                                -1,
                                tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(value.key))
                              )

                              return (
                                <span className='!ml-2 !flex !items-center !gap-1'>
                                  <select
                                    className='px-1 py-0.5 border rounded text-xs bg-white'
                                    value={currentIndex}
                                    onChange={e => {
                                      const idx = parseInt(e.target.value, 10)
                                      const addMore = [...(data.addMoreElement || [])]
                                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                                      if (tabsIdx === -1) return
                                      const nextTabsEl = { ...addMore[tabsIdx] }
                                      const nextData = [...(nextTabsEl.data || [])]
                                      for (let i = 0; i < nextData.length; i++) {
                                        const t = { ...(nextData[i] || {}) }
                                        const arr = Array.isArray(t.fields) ? t.fields : []
                                        if (arr.includes(value.key)) {
                                          t.fields = arr.filter(id => id !== value.key)
                                          nextData[i] = t
                                        }
                                      }
                                      if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                                        const t = { ...(nextData[idx] || {}) }
                                        const arr = Array.isArray(t.fields) ? t.fields : []
                                        if (!arr.includes(value.key)) {
                                          t.fields = [...arr, value.key]
                                          nextData[idx] = t
                                        }
                                      }
                                      nextTabsEl.data = nextData
                                      addMore[tabsIdx] = nextTabsEl
                                      onChange({ ...data, addMoreElement: addMore })
                                    }}
                                  >
                                    <option value={-1}>{messages?.None || 'None'}</option>
                                    {tabs.map((t, ti) => (
                                      <option key={ti} value={ti}>
                                        {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type='button'
                                    className='px-2 py-0.5 border rounded text-xs'
                                    onClick={() => {
                                      const addMore = [...(data.addMoreElement || [])]
                                      const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                                      if (tabsIdx === -1) return
                                      const nextTabsEl = { ...addMore[tabsIdx] }
                                      const count = (nextTabsEl.data || []).length + 1
                                      nextTabsEl.data = [
                                        {
                                          name_ar: `تبويب ${count}`,
                                          name_en: `Tab ${count}`,
                                          link: '',
                                          active: false,
                                          fields: []
                                        },
                                        ...(nextTabsEl.data || [])
                                      ]
                                      addMore[tabsIdx] = nextTabsEl
                                      onChange({ ...data, addMoreElement: addMore })
                                    }}
                                  >
                                    {messages?.Add_Tab || 'Add Tab'}
                                  </button>
                                </span>
                              )
                            })()}
                          </>
                        }
                        label={
                          <>
                            {value.key} {dataValidations?.Required ? <span className='text-red-500'>*</span> : ''}
                          </>
                        }
                      />
                    )
                  } else {
                    return null
                  }
                })}
              </div>

              {getFields.filter(item => item?.options?.isSystemField === false).length === 0 && (
                <p className='text-red-500 text-center text-sm mt-2'>
                  {messages.dialogs.noFieldsFound}
                </p>
              )}
            </FormControl>
          </div>
          <div className='mt-4 border-2 border-main-color border-dashed p-2 rounded-md'>
            <div className='flex justify-end items-center mb-2'>
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  setRelatedCollections([])
                  const loadingToast = toast.loading(messages.dialogs.loading)
                  axiosGet(`collections/get-related-collections?id=${collection.id}`, locale)
                    .then(res => {
                      if (res.status) {
                        setRelatedCollections(res.data ?? [])
                      }
                    })
                    .finally(() => {
                      toast.dismiss(loadingToast)
                    })
                }}
              >
                {messages.dialogs.getRelatedCollections}
              </Button>
            </div>
            <TextField
              select
              fullWidth
              value={''}
              label={messages.dialogs.addSuBForm}
              id='select-helper'
              variant='filled'
              onChange={e => {
                const oldRelatedCollections = data?.relatedCollections ?? []
                const foundRelatedCollections = relatedCollections.find(item => item.key === e.target.value)
                const findOldRelatedCollections = oldRelatedCollections.find(item => item.key === e.target.value)
                onChange({ ...data, relatedCollections: [...oldRelatedCollections, foundRelatedCollections] })
              }}
            >
              {relatedCollections.map((item, i) => (
                <MenuItem value={item.key} key={i}>
                  {item?.key}
                </MenuItem>
              ))}
            </TextField>

            <Collapse
              transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
              isOpen={Boolean(data.relatedCollections?.length > 0)}
            >
              <div className='flex flex-col gap-2 my-3 '>
                {relatedCollectionsFields?.map((item, i) => (
                  <div key={i} className='border-2 border-main-color border-dashed p-2 rounded-md'>
                    <div className='flex justify-between items-center gap-5'>
                      <div className=''>{item.collection.key}</div>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => {
                          onChange({
                            ...data,
                            relatedCollections: data.relatedCollections.filter(
                              items => items.key !== item?.collection?.key
                            ),
                            SelectedRelatedCollectionsFields: SelectedRelatedCollectionsFields.filter(
                              items => items.collection.key !== item?.collection?.key
                            )
                          })
                        }}
                      >
                        <MdDeleteOutline />
                      </IconButton>
                    </div>
                    {/* Nested Related Collections Section */}
                    <div className='mt-4 border-2 border-main-color border-dashed p-2 rounded-md'>
                      <div className='flex justify-end items-center mb-2'>
                        <Button
                          variant='contained'
                          color='primary'
                          size='small'
                          onClick={() => {
                            const collectionKey = item.collection.key
                            setNestedRelatedCollections(prev => ({ ...prev, [collectionKey]: [] }))
                            const loadingToast = toast.loading(messages.dialogs.loading)
                            axiosGet(`collections/get-related-collections?id=${item.collection.id}`, locale)
                              .then(res => {
                                if (res.status) {
                                  setNestedRelatedCollections(prev => ({ ...prev, [collectionKey]: res.data ?? [] }))
                                }
                              })
                              .finally(() => {
                                toast.dismiss(loadingToast)
                              })
                          }}
                        >
                          {messages.dialogs.getRelatedCollections}
                        </Button>
                      </div>
                      <TextField
                        select
                        fullWidth
                        size='small'
                        value={''}
                        label={messages.dialogs.addSuBForm}
                        id={`select-nested-related-${item.collection.key}`}
                        variant='filled'
                        onChange={e => {
                          const collectionKey = item.collection.key
                          const oldNestedRelatedCollections = data?.nestedRelatedCollections?.[collectionKey] ?? []
                          const availableCollections = nestedRelatedCollections[collectionKey] || []
                          const foundCollection = availableCollections.find(col => col.key === e.target.value)
                          const findOldCollection = oldNestedRelatedCollections.find(col => col.key === e.target.value)

                          if (findOldCollection) {
                            toast.error(messages.dialogs.relatedCollectionAlreadyExists)

                            return
                          }

                          const updatedNested = {
                            ...(data?.nestedRelatedCollections || {}),
                            [collectionKey]: [...oldNestedRelatedCollections, foundCollection]
                          }

                          onChange({ ...data, nestedRelatedCollections: updatedNested })
                        }}
                      >
                        {(nestedRelatedCollections[item.collection.key] || []).map((nestedItem, nestedI) => (
                          <MenuItem value={nestedItem.key} key={nestedI}>
                            {nestedItem?.key}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Display nested related collections */}
                      <Collapse
                        transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
                        isOpen={Boolean(data?.nestedRelatedCollections?.[item.collection.key]?.length > 0)}
                      >
                        <div className='flex flex-col gap-2 my-3'>
                          {(nestedRelatedCollectionsFields[item.collection.key] || []).map((nestedItem, nestedI) => (
                            <div
                              key={nestedI}
                              className='border-2 border-blue-300 border-dashed p-2 rounded-md bg-blue-50'
                            >
                              <div className='flex justify-between items-center gap-5'>
                                <div className='font-semibold text-blue-700'>{nestedItem.collection.key}</div>
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => {
                                    const collectionKey = item.collection.key

                                    const updatedNested = {
                                      ...(data?.nestedRelatedCollections || {}),
                                      [collectionKey]: (data?.nestedRelatedCollections?.[collectionKey] || []).filter(
                                        col => col.key !== nestedItem?.collection?.key
                                      )
                                    }

                                    // Remove from nested fields
                                    const updatedNestedFields = { ...nestedRelatedCollectionsFields }

                                    if (updatedNestedFields[collectionKey]) {
                                      updatedNestedFields[collectionKey] = updatedNestedFields[collectionKey].filter(
                                        fieldItem => fieldItem.collection.key !== nestedItem?.collection?.key
                                      )
                                    }
                                    setNestedRelatedCollectionsFields(updatedNestedFields)

                                    // Remove from selected fields
                                    const updatedSelected = (data?.SelectedRelatedCollectionsFields || []).map(
                                      selItem => {
                                        if (selItem.collection.key === collectionKey) {
                                          return {
                                            ...selItem,
                                            nestedSelected: (selItem.nestedSelected || []).filter(
                                              nestedSel => nestedSel.collection.key !== nestedItem?.collection?.key
                                            )
                                          }
                                        }

                                        return selItem
                                      }
                                    )

                                    onChange({
                                      ...data,
                                      nestedRelatedCollections: updatedNested,
                                      SelectedRelatedCollectionsFields: updatedSelected
                                    })
                                  }}
                                >
                                  <MdDeleteOutline />
                                </IconButton>
                              </div>
                              <div className='mt-2'>
                                <FormControl component='fieldset' fullWidth>
                                  <FormLabel component='legend' className='text-sm'>
                                    {messages.columns}
                                  </FormLabel>
                                  <div className='!flex !flex-row !flex-wrap gap-2'>
                                    {nestedItem.fields?.map(nestedValue => {
                                      const nestedDataValidations = {}

                                      nestedValue.validationData.forEach(validationItem => {
                                        nestedDataValidations[validationItem.ruleType] = validationItem.parameters
                                      })

                                      const parentSelected = SelectedRelatedCollectionsFields?.find(
                                        s => s.collection.key === item.collection.key
                                      )

                                      const nestedFieldSelected = parentSelected?.nestedSelected?.find(
                                        ns => ns.collection.key === nestedItem.collection.key
                                      )

                                      if (nestedValue?.options?.isSystemField === false) {
                                        if (nestedValue.fieldCategory !== 'Associations') {
                                          return (
                                            <FormControlLabel
                                              key={nestedValue.key}
                                              className='!w-fit capitalize text-sm'
                                              control={
                                                <Checkbox
                                                  value={nestedValue.key}
                                                  checked={
                                                    nestedFieldSelected?.selected?.includes(nestedValue.key) || false
                                                  }
                                                  onChange={e => {
                                                    setSelectedRelatedCollectionsFields(prev => {
                                                      const parentSelected = prev.find(
                                                        itemS => itemS.collection.key === item.collection.key
                                                      )

                                                      if (parentSelected) {
                                                        const nestedSelected = parentSelected.nestedSelected || []

                                                        const nestedFieldSelected = nestedSelected.find(
                                                          ns => ns.collection.key === nestedItem.collection.key
                                                        )

                                                        if (nestedFieldSelected) {
                                                          const isAlreadySelected =
                                                            nestedFieldSelected.selected.includes(nestedValue.key)

                                                          const updatedNestedSelected = nestedSelected.map(ns => {
                                                            if (ns.collection.key === nestedItem.collection.key) {
                                                              return {
                                                                ...ns,
                                                                selected: isAlreadySelected
                                                                  ? ns.selected.filter(k => k !== nestedValue.key)
                                                                  : [...ns.selected, nestedValue.key]
                                                              }
                                                            }

                                                            return ns
                                                          })

                                                          const updated = prev.map(itemS => {
                                                            if (itemS.collection.key === item.collection.key) {
                                                              return {
                                                                ...itemS,
                                                                nestedSelected: updatedNestedSelected
                                                              }
                                                            }

                                                            return itemS
                                                          })

                                                          onChange({
                                                            ...data,
                                                            SelectedRelatedCollectionsFields: updated
                                                          })

                                                          return updated
                                                        } else {
                                                          const updatedNestedSelected = [
                                                            ...nestedSelected,
                                                            {
                                                              collection: nestedItem.collection,
                                                              selected: [nestedValue.key]
                                                            }
                                                          ]

                                                          const updated = prev.map(itemS => {
                                                            if (itemS.collection.key === item.collection.key) {
                                                              return {
                                                                ...itemS,
                                                                nestedSelected: updatedNestedSelected
                                                              }
                                                            }

                                                            return itemS
                                                          })

                                                          onChange({
                                                            ...data,
                                                            SelectedRelatedCollectionsFields: updated
                                                          })

                                                          return updated
                                                        }
                                                      }

                                                      return prev
                                                    })
                                                  }}
                                                />
                                              }
                                              label={
                                                <>
                                                  {nestedValue.key}{' '}
                                                  {nestedDataValidations?.Required ? (
                                                    <span className='text-red-500'>*</span>
                                                  ) : (
                                                    ''
                                                  )}
                                                </>
                                              }
                                            />
                                          )
                                        } else {
                                          return null
                                        }
                                      } else {
                                        return null
                                      }
                                    })}
                                  </div>
                                </FormControl>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Collapse>
                    </div>

                    <div className=''>
                      <FormControl component='fieldset' fullWidth>
                        <FormLabel component='legend'>{messages.columns}</FormLabel>
                        <div className='!flex !flex-row !flex-wrap gap-2'>
                          {item.fields?.map(value => {
                            const dataValidations = {}
                            value.validationData.forEach(item => {
                              dataValidations[item.ruleType] = item.parameters
                            })

                            const fieldSelected = SelectedRelatedCollectionsFields?.find(
                              s => s.collection.key === item.collection.key
                            )
                            if (value?.options?.isSystemField === false) {
                              if (value.fieldCategory !== 'Associations') {
                                return (
                                  <FormControlLabel
                                    key={value.key}
                                    className='!w-fit capitalize'
                                    control={
                                      <>
                                        <Checkbox
                                          value={value.key}
                                          checked={fieldSelected?.selected?.includes(value.key)}
                                          onChange={e => {
                                            setSelectedRelatedCollectionsFields(prev => {
                                              const fieldSelected = prev.find(
                                                itemS => itemS.collection.key === item.collection.key
                                              )

                                              // ✅ لو الـ collection موجودة
                                              if (fieldSelected) {
                                                const isAlreadySelected = fieldSelected.selected.includes(value.key)

                                                // تحديث الـ selected داخل الـ collection المحددة
                                                const updated = prev.map(itemS => {
                                                  if (itemS.collection.key === item.collection.key) {
                                                    return {
                                                      ...itemS,
                                                      selected: isAlreadySelected
                                                        ? itemS.selected.filter(k => k !== value.key) // شيل القيمة لو موجودة
                                                        : [...itemS.selected, value.key] // ضيف القيمة لو مش موجودة
                                                    }
                                                  }

                                                  return itemS
                                                })

                                                onChange({ ...data, SelectedRelatedCollectionsFields: updated })

                                                return updated
                                              }

                                              // ✅ لو الـ collection مش موجودة، أضفها جديدة
                                              onChange({
                                                ...data,
                                                SelectedRelatedCollectionsFields: [
                                                  ...prev,
                                                  { collection: item.collection, selected: [value.key] }
                                                ]
                                              })

                                              return [...prev, { collection: item.collection, selected: [value.key] }]
                                            })
                                          }}
                                        />
                                        {(() => {
                                          const tabsElement = (data.addMoreElement || []).find(
                                            ele => ele.key === 'tabs'
                                          )
                                          if (!tabsElement) return null
                                          const tabs = Array.isArray(tabsElement?.data) ? tabsElement?.data : []

                                          const currentIndex = Math.max(
                                            -1,
                                            tabs.findIndex(t => Array.isArray(t.fields) && t.fields.includes(value.key))
                                          )

                                          return (
                                            <span className='!ml-2 !flex !items-center !gap-1'>
                                              <select
                                                className='px-1 py-0.5 border rounded text-xs bg-white'
                                                value={currentIndex}
                                                onChange={e => {
                                                  const idx = parseInt(e.target.value, 10)
                                                  const addMore = [...(data.addMoreElement || [])]
                                                  const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                                                  if (tabsIdx === -1) return
                                                  const nextTabsEl = { ...addMore[tabsIdx] }
                                                  const nextData = [...(nextTabsEl.data || [])]
                                                  for (let i = 0; i < nextData.length; i++) {
                                                    const t = { ...(nextData[i] || {}) }
                                                    const arr = Array.isArray(t.fields) ? t.fields : []
                                                    if (arr.includes(value.key)) {
                                                      t.fields = arr.filter(id => id !== value.key)
                                                      nextData[i] = t
                                                    }
                                                  }
                                                  if (!Number.isNaN(idx) && idx > -1 && idx < nextData.length) {
                                                    const t = { ...(nextData[idx] || {}) }
                                                    const arr = Array.isArray(t.fields) ? t.fields : []
                                                    if (!arr.includes(value.key)) {
                                                      t.fields = [...arr, value.key]
                                                      nextData[idx] = t
                                                    }
                                                  }
                                                  nextTabsEl.data = nextData
                                                  addMore[tabsIdx] = nextTabsEl
                                                  onChange({ ...data, addMoreElement: addMore })
                                                }}
                                              >
                                                <option value={-1}>{messages?.None || 'None'}</option>
                                                {tabs.map((t, ti) => (
                                                  <option key={ti} value={ti}>
                                                    {t?.[locale === 'ar' ? 'name_ar' : 'name_en'] || `Tab ${ti + 1}`}
                                                  </option>
                                                ))}
                                              </select>
                                              <button
                                                type='button'
                                                className='px-2 py-0.5 border rounded text-xs'
                                                onClick={() => {
                                                  const addMore = [...(data.addMoreElement || [])]
                                                  const tabsIdx = addMore.findIndex(ele => ele.id === tabsElement.id)
                                                  if (tabsIdx === -1) return
                                                  const nextTabsEl = { ...addMore[tabsIdx] }
                                                  const count = (nextTabsEl.data || []).length + 1
                                                  nextTabsEl.data = [
                                                    ...(nextTabsEl.data || []),
                                                    {
                                                      name_ar: `تبويب ${count}`,
                                                      name_en: `Tab ${count}`,
                                                      link: '',
                                                      active: false,
                                                      fields: []
                                                    }
                                                  ]
                                                  addMore[tabsIdx] = nextTabsEl
                                                  onChange({ ...data, addMoreElement: addMore })
                                                }}
                                              >
                                                {messages?.Add_Tab || 'Add Tab'}
                                              </button>
                                            </span>
                                          )
                                        })()}
                                      </>
                                    }
                                    label={
                                      <>
                                        {value.key}{' '}
                                        {dataValidations?.Required ? <span className='text-red-500'>*</span> : ''}
                                      </>
                                    }
                                  />
                                )
                              } else {
                                return null
                              }
                            } else {
                              return null
                            }
                          })}
                        </div>
                      </FormControl>
                    </div>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>

          {/* Measures Section */}
          <MeasuresSection
            data={data}
            onChange={onChange}
            tableData={tableData}
            availableColumns={availableColumns}
            handleMeasureChange={handleMeasureChange}
            handleColumnNameChange={handleColumnNameChange}
            handleAddMeasuresCard={handleAddMeasuresCard}
            handleDeleteAggregate={handleDeleteAggregate}
            getConditionsForMeasure={getConditionsForMeasure}
            handleOpenConditionDialog={handleOpenConditionDialog}
          />

          {/* Measure Condition Dialog */}
          <MeasureConditionDialog
            open={conditionDialogOpen}
            onClose={handleCloseConditionDialog}
            conditionForm={conditionForm}
            setConditionForm={setConditionForm}
            tempInputValue={tempInputValue}
            setTempInputValue={setTempInputValue}
            availableColumns={availableColumns}
            onSave={handleSaveCondition}
          />

          {/* Conditions Section */}
          <ConditionsSection
            data={data}
            onChange={onChange}
            tableData={tableData}
            availableColumns={availableColumns}
            handleConditionChange={handleConditionChange}
            handleConditionColumnNameChange={handleConditionColumnNameChange}
            handleAddConditionCard={handleAddConditionCard}
            handleDeleteConditionCard={handleDeleteConditionCard}
            tempInputValues={tempInputValues}
            setTempInputValues={setTempInputValues}
          />

          {/* Group By Section */}
          <GroupBySection
            data={data}
            onChange={onChange}
            tableData={tableData}
            availableTables={availableTables}
            handleGroupByTableChange={handleGroupByTableChange}
            handleGroupByColumnToggle={handleGroupByColumnToggle}
            handleAddGroupByCard={handleAddGroupByCard}
            handleDeleteGroupByCard={handleDeleteGroupByCard}
          />

          {/* Old code removed - using components now */}
          {false && false && (
            <Collapse
              transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
              isOpen={Boolean(tableData && tableData.length > 0)}
            >
              <div className='mt-4 border border-gray-300 rounded-md p-3'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='font-semibold text-lg'>{messages?.dialogs?.measures || 'Measures'}</span>
                  <div className='flex gap-2'>
                    <Button
                      size='small'
                      variant='contained'
                      color='primary'
                      onClick={handleAddMeasuresCard}
                      disabled={
                        !data.MeasuresRows ||
                        data.MeasuresRows.length === 0 ||
                        !data.MeasuresRows.some(r => r.columnName && r.operation && r.table)
                      }
                    >
                      {messages?.add || 'Add'}
                    </Button>
                  </div>
                </div>

                <div className='flex flex-col gap-3'>
                  {(data.MeasuresRows && data.MeasuresRows.length > 0
                    ? data.MeasuresRows
                    : [
                      {
                        table: '',
                        columnName: '',
                        operation: '',
                        alias: ''
                      }
                    ]
                  ).map((row, index) => (
                    <div
                      key={index}
                      className='flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200'
                    >
                      {/* Dropdown for ColumnName */}
                      <TextField
                        select
                        size='small'
                        label={messages?.dialogs?.columnName || 'Column Name'}
                        value={row.columnName ? `${row.table}.${row.columnName}` : ''}
                        onChange={e => handleColumnNameChange(index, e.target.value)}
                        sx={{ minWidth: 200 }}
                        variant='outlined'
                      >
                        {availableColumns.map((col, colIdx) => (
                          <MenuItem key={colIdx} value={col.label}>
                            {col.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Dropdown for Operation */}
                      <TextField
                        select
                        size='small'
                        label={messages?.dialogs?.operation || 'Operation'}
                        value={row.operation}
                        onChange={e => handleMeasureChange(index, 'operation', e.target.value)}
                        sx={{ minWidth: 150 }}
                        variant='outlined'
                      >
                        {AGGREGATE_OPERATIONS.map(op => (
                          <MenuItem key={op} value={op}>
                            {op}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Text input for Alias */}
                      <TextField
                        size='small'
                        label={messages?.Alias || 'Alias'}
                        placeholder={messages?.Alias || 'Alias'}
                        value={row.alias}
                        onChange={e => handleMeasureChange(index, 'alias', e.target.value)}
                        sx={{ minWidth: 150, flex: 1 }}
                        variant='outlined'
                      />
                    </div>
                  ))}
                </div>

                {/* Cards Preview - Measures with Conditions */}
                {data.Aggregates && data.Aggregates.length > 0 && (
                  <div className='mt-4'>
                    <div className='font-semibold mb-3 text-base'>{messages?.dialogs?.measures || 'Measures'}</div>
                    <div className='flex flex-col gap-3'>
                      {data.Aggregates.map((item, idx) => {
                        const measureConditions = getConditionsForMeasure(idx)

                        return (
                          <div
                            key={idx}
                            className='border border-main-color rounded-md p-4 bg-white shadow-sm relative'
                          >
                            {/* First Card - Measure/Aggregate */}
                            <div className='flex items-start justify-between gap-3 mb-3'>
                              <div className='flex-1'>
                                <div className='space-y-2'>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                                      {messages?.dialogs?.table || 'Table'}:
                                    </span>
                                    <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                                      {item.Table || '-'}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                                      {messages?.columnName || 'Column'}:
                                    </span>
                                    <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                                      {item.ColumnName || '-'}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                                      {messages?.dialogs?.operation || 'Operation'}:
                                    </span>
                                    <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium'>
                                      {item.Operation || '-'}
                                    </span>
                                  </div>
                                  {item.ColumnAlias && (
                                    <div className='flex items-center gap-2'>
                                      <span className='font-semibold text-sm text-gray-700 min-w-[100px]'>
                                        {messages?.Alias || 'Alias'}:
                                      </span>
                                      <span className='text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                                        {item.ColumnAlias}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDeleteAggregate(idx)}
                                sx={{ flexShrink: 0 }}
                              >
                                <MdDeleteOutline />
                              </IconButton>
                            </div>

                            {/* Second Card - Conditions */}
                            {measureConditions.length > 0 && (
                              <div className='mt-4 pt-4 border-t border-gray-200'>
                                <div className='font-semibold mb-3 text-sm text-gray-700'>
                                  {messages?.dialogs?.conditions || 'Conditions'}
                                </div>
                                <div className='flex flex-col gap-3'>
                                  {measureConditions.map((condition, conditionIdx) => (
                                    <div
                                      key={conditionIdx}
                                      className='border border-gray-300 rounded-md p-3 bg-gray-50 relative'
                                    >
                                      <div className='flex items-start justify-between gap-3'>
                                        <div className='flex-1 space-y-2'>
                                          <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                              {messages?.dialogs?.table || 'Table'}:
                                            </span>
                                            <span className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'>
                                              {condition.Table || '-'}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                              {messages?.dialogs?.columnName || 'Column'}:
                                            </span>
                                            <span className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'>
                                              {condition.Column || '-'}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                              {messages?.dialogs?.operator || 'Operator'}:
                                            </span>
                                            <span className='text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border font-medium'>
                                              {condition.Operator || '-'}
                                            </span>
                                          </div>
                                          {condition.Value !== undefined && condition.Value !== null && (
                                            <div className='flex items-center gap-2 flex-wrap'>
                                              <span className='text-xs font-semibold text-gray-600 min-w-[80px]'>
                                                {messages?.Value || 'Value'}:
                                              </span>
                                              {Array.isArray(condition.Value) ? (
                                                <div className='flex flex-wrap gap-1'>
                                                  {condition.Value.map((val, valIdx) => (
                                                    <span
                                                      key={valIdx}
                                                      className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'
                                                    >
                                                      {String(val)}
                                                    </span>
                                                  ))}
                                                </div>
                                              ) : (
                                                <span className='text-xs text-gray-800 bg-white px-2 py-1 rounded border'>
                                                  {String(condition.Value)}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <IconButton
                                          size='small'
                                          color='error'
                                          onClick={() => handleDeleteCondition(idx, conditionIdx)}
                                          sx={{ flexShrink: 0 }}
                                        >
                                          <MdDeleteOutline />
                                        </IconButton>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add Condition Button */}
                            <div className='mt-4 flex justify-end'>
                              <Button
                                size='small'
                                variant='outlined'
                                color='primary'
                                onClick={() => handleOpenConditionDialog(idx)}
                              >
                                {messages?.addCondition || 'Add Condition'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Condition Dialog */}
                <Dialog open={conditionDialogOpen} onClose={handleCloseConditionDialog} maxWidth='sm' fullWidth>
                  <DialogTitle>{messages?.addCondition || 'Add Condition'}</DialogTitle>
                  <DialogContent>
                    <div className='flex flex-col gap-3 mt-2'>
                      {/* Column Dropdown */}
                      <TextField
                        select
                        fullWidth
                        label={messages?.dialogs?.columnName || 'Column Name'}
                        value={conditionForm.column ? `${conditionForm.table}.${conditionForm.column}` : ''}
                        onChange={e => {
                          const selectedColumn = availableColumns.find(col => col.label === e.target.value)
                          if (selectedColumn) {
                            setConditionForm({
                              ...conditionForm,
                              table: selectedColumn.table,
                              column: selectedColumn.columnName
                            })
                          }
                        }}
                        variant='outlined'
                        size='small'
                      >
                        {availableColumns.map((col, colIdx) => (
                          <MenuItem key={colIdx} value={col.label}>
                            {col.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Operator Dropdown */}
                      <TextField
                        select
                        fullWidth
                        label={messages?.dialogs?.operator || 'Operator'}
                        value={conditionForm.operator}
                        onChange={e => {
                          const newOperator = e.target.value
                          setConditionForm({
                            ...conditionForm,
                            operator: newOperator,

                            // Reset value when operator changes
                            value: ''
                          })
                          setTempInputValue('')
                        }}
                        variant='outlined'
                        size='small'
                      >
                        {CONDITION_OPERATORS.map(op => (
                          <MenuItem key={op} value={op}>
                            {op}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Between Operator - 2 Values */}
                      {conditionForm.operator === 'Between' && (
                        <div className='flex flex-col gap-2'>
                          <TextField
                            fullWidth
                            label={messages?.Value || 'Value 1'}
                            value={
                              Array.isArray(conditionForm.value) && conditionForm.value[0] ? conditionForm.value[0] : ''
                            }
                            onChange={e => {
                              const currentValue = Array.isArray(conditionForm.value) ? conditionForm.value : ['', '']
                              setConditionForm({ ...conditionForm, value: [e.target.value, currentValue[1] || ''] })
                            }}
                            variant='outlined'
                            size='small'
                            required
                          />
                          <TextField
                            fullWidth
                            label={messages?.Value || 'Value 2'}
                            value={
                              Array.isArray(conditionForm.value) && conditionForm.value[1] ? conditionForm.value[1] : ''
                            }
                            onChange={e => {
                              const currentValue = Array.isArray(conditionForm.value) ? conditionForm.value : ['', '']
                              setConditionForm({ ...conditionForm, value: [currentValue[0] || '', e.target.value] })
                            }}
                            variant='outlined'
                            size='small'
                            required
                          />
                        </div>
                      )}

                      {/* In Operator - Multiple Values */}
                      {conditionForm.operator === 'In' && (
                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center gap-2'>
                            <TextField
                              fullWidth
                              label={messages?.Value || 'Value'}
                              value={tempInputValue}
                              onChange={e => setTempInputValue(e.target.value)}
                              variant='outlined'
                              size='small'
                              onKeyPress={e => {
                                if (e.key === 'Enter' && tempInputValue.trim()) {
                                  e.preventDefault()
                                  const currentArray = Array.isArray(conditionForm.value) ? conditionForm.value : []
                                  setConditionForm({
                                    ...conditionForm,
                                    value: [...currentArray, tempInputValue.trim()]
                                  })
                                  setTempInputValue('')
                                }
                              }}
                            />
                            <Button
                              variant='outlined'
                              size='small'
                              onClick={() => {
                                if (tempInputValue.trim()) {
                                  const currentArray = Array.isArray(conditionForm.value) ? conditionForm.value : []
                                  setConditionForm({
                                    ...conditionForm,
                                    value: [...currentArray, tempInputValue.trim()]
                                  })
                                  setTempInputValue('')
                                }
                              }}
                            >
                              {messages?.add || 'Add'}
                            </Button>
                          </div>
                          {Array.isArray(conditionForm.value) && conditionForm.value.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                              {conditionForm.value.map((val, idx) => (
                                <Chip
                                  key={idx}
                                  label={val}
                                  onDelete={() => {
                                    const newArray = conditionForm.value.filter((_, i) => i !== idx)
                                    setConditionForm({ ...conditionForm, value: newArray })
                                  }}
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Regular Value Input - for other operators */}
                      {conditionForm.operator &&
                        conditionForm.operator !== 'Between' &&
                        conditionForm.operator !== 'In' &&
                        conditionForm.operator !== 'IsNull' &&
                        conditionForm.operator !== 'IsNotNull' && (
                          <TextField
                            fullWidth
                            label={messages?.Value || 'Value'}
                            value={conditionForm.value}
                            onChange={e => setConditionForm({ ...conditionForm, value: e.target.value })}
                            variant='outlined'
                            size='small'
                            required
                          />
                        )}
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseConditionDialog}>{messages?.cancel || 'Cancel'}</Button>
                    <Button onClick={handleSaveCondition} variant='contained' color='primary'>
                      {messages?.save || 'Save'}
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </Collapse>
          )}
          <div className="">
            <TextField
              fullWidth
              label={messages?.dialogs?.titleArabic || 'Title Arabic'}
              value={data.title_ar || ''}
              onChange={e => onChange({ ...data, title_ar: e.target.value })}
              variant='filled'

              size='small'
            />
            <div className="mt-2"></div>

            <TextField
              fullWidth
              label={messages?.dialogs?.titleEnglish || 'Title English'}
              value={data.title_en || ''}
              onChange={e => onChange({ ...data, title_en: e.target.value })}
              variant='filled'
              size='small'
            />
            <div className="mt-2"></div>
            <TextField
              fullWidth
              label={messages?.dialogs?.descriptionArabic || 'Description Arabic  '}
              value={data.description_ar || ''}
              onChange={e => onChange({ ...data, description_ar: e.target.value })}
              variant='filled'
              size='small'
            />
            <div className="mt-2"></div>
            <TextField
              fullWidth
              label={messages?.dialogs?.descriptionEnglish || 'Description English'}
              value={data.description_en || ''}
              onChange={e => onChange({ ...data, description_en: e.target.value })}
              variant='filled'
              size='small'
            />
          </div>

          {/* Generate API Button */}
          <Collapse
            transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
            isOpen={Boolean(data.is_api_generated && data.typeOfReport === 'chart')}
          >
            <SelectReportSection data={data} onChange={onChange} />
          </Collapse>
          <Collapse
            transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`}
            isOpen={Boolean(data.is_api_generated && data.typeOfReport === 'statistics')}
          >
            <StatisticsSection data={data} onChange={onChange} />
          </Collapse>
          <GenerateAPIButton data={data} onChange={onChange} />
        </Collapse>
      </form>
    </div>
  )
}

export default SelectReport
