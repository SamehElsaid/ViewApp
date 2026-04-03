import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useFieldArray, useController } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import { useIntl } from 'react-intl'
import { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { LoadingButton } from '@mui/lab'
import { axiosPost, axiosGet } from '../axiosCall'
import Autocomplete from '@mui/material/Autocomplete'

/* ================= STABLE SELECT ================= */
const RHFAutocomplete = ({
  name,
  control,
  label,
  required = false,
  options = [],
  onChange: customOnChange,
  disabled = false
}) => {
  const {
    field,
    fieldState: { error }
  } = useController({ name, control })

  return (
    <Autocomplete
      options={options}
      disabled={disabled}
      getOptionLabel={(option) => option.label || ''}
      value={options.find(o => o.value === field.value) || null}
      onChange={(e, newValue) => {
        field.onChange(newValue?.value || '')
        if (customOnChange) customOnChange(newValue?.value)
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={label}
          required={required}
          error={!!error}
          helperText={error?.message}
          sx={{
            '& .MuiFormLabel-asterisk': {
              color: 'error.main'
            }
          }}
        />
      )}
    />
  )
}

/* ================= HEADER ================= */
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const operators = ['=', '!=']

/* ================= COMPONENT ================= */

const AddDynamicApi = ({ open, toggle, setRefresh }) => {

  const { locale, messages } = useIntl()
  const [loading, setLoading] = useState(false)
  const [tables, setTables] = useState([])
  const [columnsByTable, setColumnsByTable] = useState({})
  const [queryTypes, setQueryTypes] = useState([])

  const routePattern = /^[a-zA-Z0-9/_-]+$/

  const schema = yup.object().shape({
    route: yup
      .string()
      .trim()
      .required(messages['required'])
      .matches(routePattern, messages.Api?.routeInvalid),
    queryType: yup.string().required(messages['required']),
    payloadMappings: yup.array(),
    responseMappings: yup.array()
  })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    register,
    formState: { errors }
  } = useForm({
    defaultValues: {
      route: '',
      queryType: '',
      payloadMappings: [],
      responseMappings: []
    },
    resolver: yupResolver(schema),
    mode: 'onChange',
    shouldUnregister: true,
    shouldFocusError: false
  })

  const { fields: payloadFields, append: appendPayload, remove: removePayload } =
    useFieldArray({ control, name: 'payloadMappings' })

  const { fields: responseFields, append: appendResponse, remove: removeResponse } =
    useFieldArray({ control, name: 'responseMappings' })

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!open) return

    axiosGet('API-configuration/get-query-types', locale)
      .then(res => res?.isSuccess && setQueryTypes(res.data))

    axiosGet(
      'collections/get?dataSourceId=479a70ba-bcb1-4bd3-b28d-7ff92fee731b',
      locale
    ).then(res => res?.isSuccess && setTables(res.data))

  }, [open])

  const loadColumns = async (id) => {
    if (!id || columnsByTable[id]) return
    const res = await axiosGet(`collection-fields/get?CollectionId=${id}`, locale)
    if (res?.isSuccess) {
      setColumnsByTable(prev => ({ ...prev, [id]: res.data }))
    }
  }

  /* ================= TABLE MAP (ID → KEY) ================= */

  const tableMap = useMemo(() => {
    const map = {}
    tables.forEach(t => {
      map[t.id] = t.key
    })
    
    return map
  }, [tables])

  const handleClose = () => {
    toggle()
    reset()
  }

  /* ================= SUBMIT ================= */

  const onSubmit = (data) => {
    setLoading(true)

    const transformedPayloadMappings = data.payloadMappings.map(row => ({
      tableName: tableMap[row.tableName] || row.tableName,
      inputField: row.inputField,
      mappedTo: row.inputField
    }))

    const transformedResponseMappings = data.responseMappings.map((row, index, arr) => {

      if (arr.length === 1) {
        return {
          tableName: tableMap[row.tableName] || row.tableName,
          outputField: row.outputField,
          mappedTo: row.outputField,
          joinType: null,
          join: {
            leftTable: '',
            leftColumn: '',
            operator: '',
            rightTable: '',
            rightColumn: ''
          }
        }
      }

      return {
        tableName: tableMap[row.tableName] || row.tableName,
        outputField: row.outputField,
        mappedTo: row.outputField,
        joinType: row.joinType,
        join: {
          leftTable: tableMap[row.join?.leftTable] || '',
          leftColumn: row.join?.leftColumn || '',
          operator: row.join?.operator || '=',
          rightTable: tableMap[row.join?.rightTable] || '',
          rightColumn: row.join?.rightColumn || ''
        }
      }
    })

    const transformedData = {
      ...data,
      payloadMappings: transformedPayloadMappings,
      responseMappings: transformedResponseMappings
    }

    axiosPost('API-configuration/create-endpoint', locale, transformedData)
      .then(res => {
        if (res.status) {
          toast.success(locale === 'ar' ? 'تمت الإضافة بنجاح' : 'Added successfully')
          setRefresh(prev => prev + 1)
          handleClose()
        }
      })
      .finally(() => setLoading(false))
  }

  /* ================= RENDER ================= */

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '65%' } } }}
    >
      <Header>
        <Typography variant='h6'>
          {messages.Api?.addDynamicAPI || 'Add Dynamic API'}
        </Typography>
        <IconButton onClick={handleClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </Header>

      <Box sx={{ p: 6, overflow: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ROUTE */}
          <CustomTextField
            fullWidth
            label='Route'
            required
            sx={{
              '& .MuiFormLabel-asterisk': {
                color: 'error.main',
              },
              mb: 4
            }}
            {...register('route')}
            error={Boolean(errors.route)}
            helperText={errors.route?.message}
          />

          {/* METHOD */}
          <RHFAutocomplete
            name="queryType"
            control={control}
            label="Method"
            required
            options={queryTypes.map(type => ({
              label: locale === 'ar'
                ? type.nameAr || type
                : type.nameEn || type,
              value: type.key || type
            }))}
          />

          {/* ================= PAYLOAD ================= */}

          <Typography variant='h6' sx={{ mt: 6, mb: 3 }}>
            Payload Mappings <span className='text-red-500'>*</span>
          </Typography>

          {payloadFields.map((item, index) => {
            const tableId = watch(`payloadMappings.${index}.tableName`)
            const columns = columnsByTable[tableId] || []

            return (
              <Grid container spacing={2} key={item.id} sx={{ mb: 3 }}>

                <Grid item xs={3}>
                  <RHFAutocomplete
                    name={`payloadMappings.${index}.tableName`}
                    control={control}
                    label="Table"
                    options={tables.map(t => ({
                      label: locale === 'ar' ? t.nameAr : t.nameEn,
                      value: t.id
                    }))}
                    onChange={(val) => loadColumns(val)}
                  />
                </Grid>

                <Grid item xs={3}>
                  <RHFAutocomplete
                    name={`payloadMappings.${index}.inputField`}
                    control={control}
                    label="Input Field"
                    options={columns.map(col => ({
                      label: locale === 'ar' ? col.nameAr : col.nameEn,
                      value: col.key
                    }))}
                  />
                </Grid>

                <Grid item xs={1} className='flex items-end'>
                  <IconButton color="error" onClick={() => removePayload(index)}>
                    <Icon icon="tabler:trash" />
                  </IconButton>
                </Grid>

              </Grid>
            )
          })}

          <Button
            variant="outlined"
            sx={{ mb: 6 }}
            onClick={() =>
              appendPayload({
                tableName: '',
                inputField: ''
              })
            }
          >
            + Add Payload Mapping
          </Button>

          {/* ================= RESPONSE ================= */}

          <Typography variant='h6' sx={{ mb: 3 }}>
            Response Mappings
          </Typography>

          {responseFields.map((item, index) => {

            const tableId = watch(`responseMappings.${index}.tableName`)
            const columns = columnsByTable[tableId] || []

            const leftTableId = watch(`responseMappings.${index}.join.leftTable`)
            const rightTableId = watch(`responseMappings.${index}.join.rightTable`)

            const leftColumns = columnsByTable[leftTableId] || []
            const rightColumns = columnsByTable[rightTableId] || []

            const disableJoin = index === 0

            return (
              <Grid container spacing={2} key={item.id} sx={{ mb: 3 }}>

                <Grid item xs={3}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.tableName`}
                    control={control}
                    label="Table"
                    options={tables.map(t => ({
                      label: locale === 'ar' ? t.nameAr : t.nameEn,
                      value: t.id
                    }))}
                    onChange={(val) => loadColumns(val)}
                  />
                </Grid>

                <Grid item xs={3}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.outputField`}
                    control={control}
                    label="Output Field"
                    options={columns.map(col => ({
                      label: locale === 'ar' ? col.nameAr : col.nameEn,
                      value: col.key
                    }))}
                  />
                </Grid>

                <Grid item xs={2}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.joinType`}
                    control={control}
                    label="Join Type"
                    disabled={disableJoin}
                    options={[
                      { label: 'INNER', value: 'INNER' },
                      { label: 'LEFT', value: 'LEFT' },
                      { label: 'RIGHT', value: 'RIGHT' }
                    ]}
                  />
                </Grid>

                <Grid item xs={2}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.join.leftTable`}
                    control={control}
                    label="Left Table"
                    disabled={disableJoin}
                    options={tables.map(t => ({
                      label: locale === 'ar' ? t.nameAr : t.nameEn,
                      value: t.id
                    }))}
                    onChange={(val) => loadColumns(val)}
                  />
                </Grid>

                <Grid item xs={2}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.join.leftColumn`}
                    control={control}
                    label="Left Column"
                    disabled={disableJoin}
                    options={leftColumns.map(col => ({
                      label: locale === 'ar' ? col.nameAr : col.nameEn,
                      value: col.key
                    }))}
                  />
                </Grid>

                <Grid item xs={1}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.join.operator`}
                    control={control}
                    label="Op"
                    disabled={disableJoin}
                    options={operators.map(op => ({
                      label: op,
                      value: op
                    }))}
                  />
                </Grid>

                <Grid item xs={2}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.join.rightTable`}
                    control={control}
                    label="Right Table"
                    disabled={disableJoin}
                    options={tables.map(t => ({
                      label: locale === 'ar' ? t.nameAr : t.nameEn,
                      value: t.id
                    }))}
                    onChange={(val) => loadColumns(val)}
                  />
                </Grid>

                <Grid item xs={2}>
                  <RHFAutocomplete
                    name={`responseMappings.${index}.join.rightColumn`}
                    control={control}
                    label="Right Column"
                    disabled={disableJoin}
                    options={rightColumns.map(col => ({
                      label: locale === 'ar' ? col.nameAr : col.nameEn,
                      value: col.key
                    }))}
                  />
                </Grid>

                <Grid item xs={1} className='flex items-end'>
                  <IconButton color="error" onClick={() => removeResponse(index)}>
                    <Icon icon="tabler:trash" />
                  </IconButton>
                </Grid>

              </Grid>
            )
          })}

          <Button
            variant="outlined"
            sx={{ mb: 6 }}
            onClick={() =>
              appendResponse({
                tableName: '',
                outputField: '',
                joinType: '',
                join: {
                  leftTable: '',
                  leftColumn: '',
                  operator: '=',
                  rightTable: '',
                  rightColumn: ''
                }
              })
            }
          >
            + Add Response Mapping
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
            <LoadingButton type='submit' variant='contained' loading={loading}>
              Save
            </LoadingButton>
            <Button variant='outlined' onClick={handleClose}>
              Cancel
            </Button>
          </Box>

        </form>
      </Box>
    </Drawer>
  )
}

export default AddDynamicApi
