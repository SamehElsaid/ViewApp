import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack,
  TextField,
  CircularProgress,
  Autocomplete
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box, Button, Typography, IconButton, Divider } from '@mui/material'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import { useIntl } from 'react-intl'
import IconifyIcon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import { axiosGet, axiosPost } from '../axiosCall'
import { LoadingButton } from '@mui/lab'

const typeLabelMap = {
  OneToOne: 'oneToOne',
  OneToMany: 'oneToMany',
  ManyToMany: 'manyToMany'
}

function AddRelation({ dataParent, relationOpen, setRelationOpen, setRefresh }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [relationStep, setRelationStep] = useState(0)
  const [relationType, setRelationType] = useState('OneToOne')
  const [loading, setLoading] = useState(false)
  const [relationForm, setRelationForm] = useState({ name_en: '', name_ar: '', key: '' })

  // removed unused: relationNumber, setupFields, selectedOptions, valueCollection, collection
  // use selectedCollection.first as the chosen collection
  const { messages, locale } = useIntl()
  const [collections, setCollections] = useState([])
  const [loadingCollections, setLoadingCollections] = useState(true)

  const [selectedCollection, setSelectedCollection] = useState({
    first: '',
    second: ''
  })

  const {
    query: { dataSourceId }
  } = useRouter()

  // Stable callbacks and memoized values for performance
  const resetForm = useCallback(() => {
    setRelationStep(0)
    setRelationType('oneToOne')
    setRelationForm({ name_en: '', name_ar: '', key: '' })
    setSelectedCollection({ first: '', second: '' })
  }, [])

  const selectedCollectionId = selectedCollection?.first?.id || ''

  const isSetupStepValid = useMemo(() => {
    return Boolean(selectedCollectionId)
  }, [selectedCollectionId])

  useEffect(() => {
    if (!dataSourceId) return
    setLoadingCollections(true)
    axiosGet(`collections/get/?dataSourceId=${dataSourceId}`, locale)
      .then(res => {
        if (res.status) {

          setCollections(res.data.filter(item => item.id !== dataParent?.id))
        }
      })
      .finally(() => {
        setLoadingCollections(false)
      })
  }, [locale, dataSourceId, relationOpen, dataParent])

  const filteredCollections = useMemo(() => {
    return (collections || []).filter(item => item.id !== selectedCollectionId)
  }, [collections, selectedCollectionId])

  const getOptionLabel = useCallback(option => (locale === 'ar' ? option.nameAr : option.nameEn) || '', [locale])

  const handleCollectionChange = useCallback((e, value) => {
    setSelectedCollection(prev => ({ ...prev, first: value }))
  }, [])

  const handleSave = () => {
    const sendData = {
      nameEn: selectedCollection.first.key,
      nameAr: selectedCollection.first.key,
      key: `${new Date().getTime()}`,
      FieldCategory: 'Associations',
      collectionId: dataParent.id,
      type: relationType,
      ParentCollectionId: selectedCollection.first.id,
      options: {
        source: selectedCollection.first.key,
        sourceKey: 'id',
        target: dataParent.key,
        targetKey: selectedCollection.first.key + 'Id',
        foreignKey: selectedCollection.first.key + 'Id'
      },
      validationData: []
    }

    setLoading(true)
    axiosPost('collection-fields/configure-fields', locale, sendData)
      .then(res => {
        if (res.status) {
          toast.success(res.message)
          resetForm()
          setRefresh(prev => prev + 1)
          setRelationOpen(false)
        }
      })
      .finally(_ => {
        setLoading(false)
      })
  }

  return (
    <Dialog open={relationOpen} onClose={() => setRelationOpen(false)} fullWidth maxWidth='md' fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h6'>{messages['addRelation.title'] || 'Add Relation'}</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {messages['addRelation.subtitle'] || 'Configure relation type, labels and setup.'}
          </Typography>
        </Box>
        <IconButton onClick={() => setRelationOpen(false)}>
          <IconifyIcon icon='tabler:x' />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Stepper alternativeLabel>
          {[
            { key: 'type', label: messages['addRelation.steps.type'] || 'Type', icon: 'tabler:git-branch' },
            { key: 'setup', label: messages['addRelation.steps.setup'] || 'Setup', icon: 'tabler:settings' }
          ].map((s, i) => (
            <Step key={s.key}>
              <StepLabel
                icon={
                  <IconifyIcon
                    icon={s.icon}
                    className={`${relationStep >= i ? 'text-main-color' : 'text-text-secondary'}`}
                  />
                }
              >
                <span className={`${relationStep >= i ? 'text-main-color' : 'text-text-secondary'}`}>{s.label}</span>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Divider sx={{ my: 3 }} />
        {relationStep === 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              {messages['addRelation.selectRelationType'] || 'Select relation type'}
            </Typography>
            <ToggleButtonGroup
              color='primary'
              value={relationType}
              exclusive
              onChange={(e, val) => {
                if (val) setRelationType(val)
              }}
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value='OneToOne' sx={{ px: 3 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <IconifyIcon icon='tabler:git-commit' />
                  <span>{messages['addRelation.relationTypes.oneToOne'] || 'One To One'}</span>
                </Stack>
              </ToggleButton>
              <ToggleButton value='OneToMany' sx={{ px: 3 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <IconifyIcon icon='tabler:git-branch' />
                  <span>{messages['addRelation.relationTypes.oneToMany'] || 'One To Many'}</span>
                </Stack>
              </ToggleButton>
              <ToggleButton value='ManyToMany' sx={{ px: 3 }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <IconifyIcon icon='tabler:git-merge' />
                  <span>{messages['addRelation.relationTypes.manyToMany'] || 'Many To Many'}</span>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
              {messages['addRelation.chooseRelationDescription'] || 'Choose how entities relate to each other.'}
            </Typography>
          </Box>
        )}
        {/* collections debug log removed */}
        {relationStep === 1 && (
          <Box className='grid md:grid-cols-2 gap-4' sx={{ mt: 1 }}>
            <Autocomplete
              options={loadingCollections ? [] : filteredCollections}
              getOptionLabel={getOptionLabel}
              loading={loadingCollections}
              value={selectedCollection.first}
              onChange={handleCollectionChange}
              renderInput={params => (
                <TextField
                  {...params}
                  label={messages.Select_Collection}
                  variant='outlined'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCollections ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box sx={{ direction: locale === 'ar' ? 'rtl' : '' }} component='li' {...props}>
                  {locale === 'ar' ? option.nameAr : option.nameEn}
                </Box>
              )}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip
            size='small'
            variant='outlined'
            label={`${messages['addRelation.stepIndicator'] || 'Step'} ${relationStep + 1} / 2`}
          />
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {messages['addRelation'][typeLabelMap[relationType]]}
            {relationForm.name_en ? ` • ${relationForm.name_en}` : ''}
            {relationForm.key ? ` • ${messages['addRelation.key'] || 'key'}: ${relationForm.key}` : ''}
            {selectedCollectionId
              ? ` • ${messages['collection.collectionName'] || 'collection'}: ${
                  collections.find(c => c.id === selectedCollectionId)?.key
                }`
              : ''}
          </Typography>
        </Stack>
        <Box>
          <Button onClick={() => setRelationOpen(false)} color='secondary' sx={{ mr: 1 }}>
            {messages.cancel || 'Cancel'}
          </Button>
          {relationStep > 0 && (
            <Button onClick={() => setRelationStep(prev => prev - 1)} color='inherit' sx={{ mr: 1 }}>
              {messages.back || 'Back'}
            </Button>
          )}
          {relationStep < 1 ? (
            <Button variant='contained' onClick={() => setRelationStep(prev => prev + 1)} disabled={false}>
              {messages.next || 'Next'}
            </Button>
          ) : (
            <LoadingButton
              loading={loading}
              variant='contained'
              color='primary'
              disabled={!isSetupStepValid}
              onClick={() => {
                handleSave()

                // setRelationOpen(false)
                // resetForm()
                // toast.success(messages['addRelation.relationConfigured'] || 'Relation configured')
              }}
            >
              {messages.save || 'Save'}
            </LoadingButton>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default AddRelation

AddRelation.propTypes = {
  relationOpen: PropTypes.bool.isRequired,
  setRelationOpen: PropTypes.func.isRequired
}
