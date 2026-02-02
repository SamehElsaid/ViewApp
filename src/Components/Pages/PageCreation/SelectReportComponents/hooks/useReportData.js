import { useEffect, useState, useMemo } from 'react'
import { axiosGet } from 'src/Components/axiosCall'
import { toast } from 'react-toastify'
import { useIntl } from 'react-intl'

export function useReportData(data, onChange) {
  const { locale, messages } = useIntl()
  const [collection, setCollection] = useState('')
  const [optionsCollection, setOptionsCollection] = useState([])
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [getFields, setGetFields] = useState([])
  const [selectedRelatedCollectionsFields, setSelectedRelatedCollectionsFields] = useState([])
  const [tableData, setTableData] = useState([])

  // Initialize data source
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

  // Get collections
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

  // Get collection fields
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
  }, [locale, data.collectionId, messages.dialogs.loading])

  // Sync selected options
  useEffect(() => {
    if (data.selected) {
      setSelectedOptions(data.selected)
    }
  }, [data.selected])

  // Sync related collections
  useEffect(() => {
    setSelectedRelatedCollectionsFields(data.SelectedRelatedCollectionsFields ?? [])
  }, [data.SelectedRelatedCollectionsFields])

  // Build table data
  useEffect(() => {
    const tableName = data.collectionName
    const columns = data?.selected?.map(ele => ({ columnName: ele })) || []
    const table = [{ table: tableName, columns }]

    if (data.SelectedRelatedCollectionsFields && Array.isArray(data.SelectedRelatedCollectionsFields)) {
      data.SelectedRelatedCollectionsFields.forEach(item => {
        if (item?.collection?.key && item?.selected && Array.isArray(item.selected)) {
          table.push({
            table: item.collection.key,
            columns: item.selected.map(ele => ({ columnName: ele }))
          })
        }
      })
    }

    setTableData(table)
  }, [data.collectionId, data.selected, data.SelectedRelatedCollectionsFields])

  // Available columns memo
  const availableColumns = useMemo(() => {
    if (!tableData || tableData.length === 0) return []
    const columns = []
    tableData.forEach(tbl => {
      ;(tbl.columns || []).forEach(col => {
        columns.push({
          table: tbl.table,
          columnName: col.columnName,
          label: `${tbl.table}.${col.columnName}`
        })
      })
    })

    return columns
  }, [tableData])

  // Available tables memo
  const availableTables = useMemo(() => {
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
      })
    }
    
    return tables
  }, [data.collectionName, data.selected, data.SelectedRelatedCollectionsFields])

  return {
    collection,
    optionsCollection,
    loadingCollection,
    selectedOptions,
    setSelectedOptions,
    getFields,
    selectedRelatedCollectionsFields,
    setSelectedRelatedCollectionsFields,
    tableData,
    availableColumns,
    availableTables
  }
}

