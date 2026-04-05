/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { axiosGet, axiosPost } from 'src/Components/axiosCall'
import { Icon } from '@iconify/react'
import { FaEyeSlash } from 'react-icons/fa'
import NewElement from '../NewElement'
import { toast } from 'react-toastify'
import { getData, replacePlaceholders, VaildId } from 'src/Components/_Shared'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import { formatDate } from '@fullcalendar/core'
import ViewInput from '../FiledesComponent/ViewInput'
import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from 'src/Components/encryption'
import { useSelector } from 'react-redux'

export default function DisplayField({
  tabsData,
  loadingSaveAsDraft,
  dataAssociations,
  onChangeData,
  advancedEdit,
  saveAsDraft,
  editMode,
  from,
  input,
  activeTab,
  dirtyProps,
  dataRefWithCollectionId,
  data,
  handleSubmit,
  reload,
  refError,
  refErrorFromTable,
  dataRef,
  errorView,
  disabledBtn,
  setLayout,
  setTriggerData,
  findError,
  readOnly,
  findValue,
  roles,
  setActiveTab,
  layout,
  design,
  triggerData,
  isRedirect,
  setRedirect,
  isDisabled,
  hiddenLabel,
  loadingBtn,
  disabled,
  allFields = [],
  sortedLoopWithoutTabs = [],
  allErrorsRef,
  columnId,
  FormType,
  isEntitiesData
}) {

  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [dirty, setDirty] = useState(dirtyProps)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const { locale, messages } = useIntl()
  const [validations, setValidations] = useState({})
  const [selectedOptions, setSelectedOptions] = useState([])
  const xComponentProps = useMemo(() => input?.options?.uiSchema?.xComponentProps ?? {}, [input])
  const [fileName, setFile] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [regex, setRegex] = useState(roles?.regex?.regex)
  const [isDisable, setIsDisable] = useState(disabled ? 'disabled' : roles?.onMount?.type == 'hide' ? 'hidden' : null)
  const getApiData = useSelector(rx => rx.api.data)
  const [lastValue, setLastValue] = useState(null)
  const [refreshHeight, setRefreshHeight] = useState(0)



  useEffect(() => {
    if (isDisabled) {
      setIsDisable('disabled')
    }
  }, [isDisabled])


  console.log(value)
  useEffect(() => {
    if (!input) {
      setValue('')
      setFile('')
      setError(false)
      setDirty(false)
      setShowPassword(false)
      setValidations({})
    } else {
      if (input.type != 'new_element') {
        const dataValidations = {}
        input.validationData.forEach(item => {
          dataValidations[item.ruleType] = item.parameters
        })

        setValidations(dataValidations)
      }
    }
  }, [input])

  const FilterData = [] || [
    {
      facilityType: '3d548052-ebf3-4c33-b8b0-489f07f97f43',
      EmptypesId: [
        {
          Id: '53fc1e93-5ffa-48e0-a7f0-5843c63c2b9b',
          IsDeleted: false,
          CreatedAt: '2026-01-12T12:00:57.67',
          CreatedBy: 'ca3568ce-156c-4175-9909-bd79cbd793a8',
          UpdatedAt: '2026-01-12T12:00:57.67',
          UpdatedBy: null,
          TypeName: 'مدير'
        },
        {
          Id: '270c0962-0616-4481-96e7-9a28143dd69c',
          IsDeleted: false,
          CreatedAt: '2026-01-12T12:01:00.783',
          CreatedBy: 'ca3568ce-156c-4175-9909-bd79cbd793a8',
          UpdatedAt: '2026-01-12T12:01:00.783',
          UpdatedBy: null,
          TypeName: 'موظف'
        },
        {
          Id: '1b30000d-ef11-401a-b303-1a9197761bec',
          IsDeleted: false,
          CreatedAt: '2026-01-12T12:01:07.217',
          CreatedBy: 'ca3568ce-156c-4175-9909-bd79cbd793a8',
          UpdatedAt: '2026-01-12T12:01:07.217',
          UpdatedBy: null,
          TypeName: 'اداري'
        }
      ]
    },
    {
      facilityType: '225ea3e7-ffd1-4ff9-bb1e-a4013faac02a',
      EmptypesId: [
        {
          Id: '53fc1e93-5ffa-48e0-a7f0-5843c63c2b9b',
          IsDeleted: false,
          CreatedAt: '2026-01-12T12:00:57.67',
          CreatedBy: 'ca3568ce-156c-4175-9909-bd79cbd793a8',
          UpdatedAt: '2026-01-12T12:00:57.67',
          UpdatedBy: null,
          TypeName: 'مدير'
        },
        {
          Id: '270c0962-0616-4481-96e7-9a28143dd69c',
          IsDeleted: false,
          CreatedAt: '2026-01-12T12:01:00.783',
          CreatedBy: 'ca3568ce-156c-4175-9909-bd79cbd793a8',
          UpdatedAt: '2026-01-12T12:01:00.783',
          UpdatedBy: null,
          TypeName: 'موظف'
        }
      ]
    },
    {
      facilityType: 'df31c39a-93ce-44f2-a36c-df4bb9274f86',
      EmptypesId: [
        {
          Id: '53fc1e93-5ffa-48e0-a7f0-5843c63c2b9b',
          IsDeleted: false,
          CreatedAt: '2026-01-12T12:00:57.67',
          CreatedBy: 'ca3568ce-156c-4175-9909-bd79cbd793a8',
          UpdatedAt: '2026-01-12T12:00:57.67',
          UpdatedBy: null,
          TypeName: 'مدير'
        }
      ]
    }
  ]
  const [reloadValue, setReloadValue] = useState(0)

  useEffect(() => {
    if (loading || !roles?.trigger) return

    const trigger = roles.trigger
    const currentValue = dataRef?.current?.[trigger.selectedField]

    if (currentValue === undefined) return

    const isEqual = trigger.isEqual === 'equal'
    const isBasic = input.fieldCategory === 'Basic'
    const shouldResetValue = input?.kind === 'search' || input?.kind === 'checkbox'

    const resetValueIfNeeded = () => {
      if (shouldResetValue) setValue([])
    }

    const compare = (a, b) => (isEqual ? a == b : a != b)

    const getAPIData = async () => {
      if (!trigger.parentKey || !currentValue) return null

      const res = await axiosGet(
        `generic-entities/${trigger.parentKey}/${currentValue}`
      )

      if (res?.status) {
        return res?.data?.entities?.[0] ?? null
      }

      return null
    }

    const handleWithPossibleAPI = async (callback) => {
      if (trigger.parentKey) {
        const data = await getAPIData()
        if (data) callback(data[trigger.triggerKey])
      } else {
        callback(currentValue)
      }
    }

    // =========================
    // FILTER
    // =========================
    if (trigger.typeOfValidation === 'filter') {
      resetValueIfNeeded()

      const key = trigger.currentField === 'id' ? 'Id' : trigger.currentField

      setSelectedOptions(prev =>
        prev.filter(item => compare(item?.[key], currentValue))
      )
    }

    // =========================
    // FILTER FROM API
    // =========================
    if (trigger.typeOfValidation === 'filterDataFromAPI') {
      resetValueIfNeeded()

      const found = FilterData.find(
        ele => ele?.[trigger.mainValue] == currentValue
      )

      setSelectedOptions(found?.[input?.key] || [])
    }

    // =========================
    // DISABLE / ENABLE
    // =========================
    const handleDisableEnable = async (mode) => {
      await handleWithPossibleAPI(value => {
        if (!trigger.mainValue) {
          const hasValue = Array.isArray(value)
            ? value.length !== 0
            : !!value

          setIsDisable(
            hasValue
              ? mode === 'enable'
                ? 'enable'
                : 'disabled'
              : roles?.onMount?.type === mode
                ? mode === 'enable'
                  ? 'disabled'
                  : 'hidden'
                : null
          )

          return
        }

        const result = compare(value, trigger.mainValue)

        if (mode === 'disable') {
          setIsDisable(result ? 'disabled' : roles?.onMount?.type === 'hide' ? 'hidden' : null)
        } else {
          setIsDisable(result ? 'enable' : roles?.onMount?.type === 'disable' ? 'disabled' : null)
        }
      })
    }

    if (trigger.typeOfValidation === 'disable') {
      handleDisableEnable('disable')
    }

    if (trigger.typeOfValidation === 'enable') {
      handleDisableEnable('enable')
    }

    // =========================
    // OPTIONAL / REQUIRED
    // =========================
    const toggleRequired = (shouldBeRequired) => {
      setValidations(prev => {
        const newState = { ...prev }

        if (shouldBeRequired) newState.Required = true
        else delete newState.Required

        return newState
      })
    }

    const handleValidation = async (type) => {
      await handleWithPossibleAPI(value => {
        if (!trigger.mainValue) {
          const hasValue = Array.isArray(value)
            ? value.length !== 0
            : !!value

          toggleRequired(type === 'required' ? hasValue : !hasValue)

          return
        }

        const result = compare(value, trigger.mainValue)
        toggleRequired(type === 'required' ? result : !result)
      })
    }

    if (trigger.typeOfValidation === 'optional') {
      handleValidation('optional')
    }

    if (trigger.typeOfValidation === 'required') {
      handleValidation('required')
    }

    // =========================
    // EMPTY
    // =========================
    if (trigger.typeOfValidation === 'empty') {
      handleWithPossibleAPI(value => {
        const result = trigger.mainValue
          ? compare(value, trigger.mainValue)
          : value !== lastValue

        if (result) {
          setLastValue(true)
          setValue(typeof value === 'object' ? [] : '')
        } else {
          setLastValue(false)
        }
      })
    }

    // =========================
    // HIDDEN / VISIBLE
    // =========================
    const handleVisibility = async (mode) => {
      await handleWithPossibleAPI(value => {
        if (!trigger.mainValue) {
          const hasValue = Array.isArray(value)
            ? value.length !== 0
            : !!value

          setIsDisable(
            hasValue
              ? mode === 'visible'
                ? null
                : 'hidden'
              : mode === 'visible'
                ? 'hidden'
                : null
          )

          return
        }

        const result = compare(value, trigger.mainValue)

        if (mode === 'hidden') {
          setIsDisable(result ? 'hidden' : null)
        } else {
          setIsDisable(result ? null : 'hidden')
        }
      })
    }

    if (trigger.typeOfValidation === 'hidden') {
      handleVisibility('hidden')
    }

    if (trigger.typeOfValidation === 'visible') {
      handleVisibility('visible')
    }

  }, [roles, loading, triggerData, reloadValue])



  useEffect(() => {
    if (!roles?.event?.onUnmount) {
      return
    }

    if (roles?.event?.onUnmount == 'async function Action(e, args) {\n  // write your code here\n}') {
      return
    }

    const handleBeforeUnload = e => {
      e.preventDefault()

      const evaluatedFn = eval('(' + roles?.event?.onUnmount + ')')
      evaluatedFn(e)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [roles])


  const inputMemo = useMemo(() => input, [input.type, input.kind]);

  useEffect(() => {
    if (findValue !== undefined && findValue !== null && findValue !== '' && findValue !== false) {
      if (input?.type == 'Date') {
        setValue(new Date(findValue))
      } else {
        console.log(findValue, "findValuefindValuefindValue");
        setValue(findValue)
      }
    } else {
      if (input?.kind == 'search' || input?.kind == 'checkbox') {
        setValue([])
      }
      if (input?.type == 'Date') {
        if (!roles?.api_url) {

          setValue()
        }
      }
    }
  }, [inputMemo, findValue])

  useEffect(() => {
    if (reload != 0) {
      setValue('')
      if (input?.kind == 'search' || input?.kind == 'checkbox') {
        setValue([])
      }
      setRegex('')
      setFile('')
      setError(false)
      setDirty(false)
      setShowPassword(false)
    }
  }, [reload, input])


  const [loadingValue, setLoadingValue] = useState(false)



  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (roles?.onMount?.type == 'disable') {
          setIsDisable('disabled')
        }

        if (roles?.onMount?.type == 'required') {
          setValidations(prev => ({ ...prev, Required: true }))
        }

        if (roles?.minRow) {
          setValidations(prev => ({ ...prev, minRow: roles?.minRow }))
        }
        if (roles?.maxRow) {
          setValidations(prev => ({ ...prev, maxRow: roles?.maxRow }))
        }
        if (roles?.onMount?.type == 'enable') {
          setIsDisable('enable')
        }
        if (roles?.onMount?.type == 'hide') {
          setIsDisable('hidden')
        }
        if (roles?.onMount?.type == 'empty Data') {
          setIsDisable('null')
        }

        if (roles?.onMount?.value) {
          if (roles?.api_url) {
            const items = getApiData.find(item => item.link === roles.api_url)?.data
            const valueFromApi = getData(items, roles?.onMount?.value, '')
            if (input?.type == 'Date') {
              setValue(valueFromApi ? new Date(valueFromApi) : null)
            } else {
              setValue(valueFromApi)
            }
          } else {
            let newValue = roles?.onMount?.value
            const searchParams = new URLSearchParams(window.location.search)

            if (typeof newValue === 'string' && newValue.startsWith('{') && newValue.endsWith('}')) {
              const key = newValue.slice(1, -1)
              newValue = searchParams.get(key) || ''
            }

            if (input?.type == 'Date') {
              const valueDate = new Date(newValue)

              if (isNaN(valueDate.getTime())) {
                // invalid date
                newValue = new Date()
              } else {
                newValue = valueDate
              }
            }
            setValue(findValue ?? newValue)
          }
        }
        setReloadValue(prev => prev + 1)
      }, 0)
    }
  }, [roles?.onMount?.type, roles?.onMount?.value, loading])

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const appendSearchEntities = useCallback(entities => {
    if (!Array.isArray(entities) || entities.length === 0) return
    setSelectedOptions(prev => [...prev, ...entities])
  }, [])

  const replaceSearchCollectionOptions = useCallback((entities, total) => {
    setSelectedOptions(entities ?? [])
    setTotalCount(total ?? 0)
    setPage(1)
  }, [])

  const onChange = (e, newValue) => {
    if (roles?.onMount?.includeInQuery) {
      const query = new URLSearchParams(window.location.search)
      query.set(input.key, e.target.value)
      window.history.pushState({}, '', window.location.pathname + '?' + query.toString())
    }
    try {
      if (roles?.event?.onChange) {
        const evaluatedFn = eval('(' + roles.event.onChange + ')')

        evaluatedFn(e)
      }
    } catch { }

    setDirty(true)
    let isTypeNew = true

    if (input?.kind == 'search' || input?.kind == 'checkbox') {
      isTypeNew = false
    }
    if (input?.type == 'date') {
      isTypeNew = false
    }

    let newData = value
    if (input?.kind == 'search' || input?.kind == 'checkbox') {
      if (input.kind == 'search') {
        const maxLength = validations?.MaxLength?.maxLength ?? 9999999999
        if (newValue.length > +maxLength) {
          const newSelection = [...newValue.slice(0, maxLength - 1), newValue.at(-1)]

          setValue(newSelection)
          newData = newSelection
        } else {
          setValue(newValue)
          newData = newValue
        }
      } else {
        setValue(e.target.checked ? [...value, e.target.value] : value.filter(v => v != e.target.value))
        newData = e.target.checked ? [...value, e.target.value] : value.filter(v => v != e.target.value)
      }
    } else {
      if (input?.type == 'Date') {
        setValue(e || '')
      } else {
        input.type == 'Number' ? setValue(+e.target.value) : setValue(e.target.value)
      }
    }

    if (dirty) {
      if (validations.Required && e?.target?.value?.length == 0 && isTypeNew) {
        return setError(messages.required)
      }

      if (regex) {
        // Remove surrounding quotes if present
        const cleanedRegex = regex.replace(/^"(.*)"$/, '$1')
        const regexMatch = cleanedRegex.match(/^\/(.*)\/([gimuy]*)$/)
        if (!regexMatch) {

          return
        }
        const [, pattern, flags] = regexMatch
        const regExp = new RegExp(pattern, flags)
        if (!regExp.test(e?.target?.value)) {

          return setError(locale == 'ar' ? roles?.regex?.message_ar : roles?.regex?.message_en)
        }
      }

      if (input.type == 'Phone' && validations.Required && e?.length == 0 && isTypeNew) {
        return setError(messages.required)
      }
      if (input.type == 'Phone' && !isPossiblePhoneNumber('+' + e?.target?.value ?? '')) {
        return setError(messages.Invalid_Phone)
      }

      if (validations.Required && newData.length == 0 && !isTypeNew) {
        return setError(messages.required)
      }

      if (input.type == 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e?.target?.value)) {
        return setError(messages.Invalid_Email)
      }

      if (
        input.type == 'URL' &&
        !/^(https:\/\/)(www\.)?([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,6}(\/[-a-zA-Z0-9@:%._\+~#?&//=]*)?$/i.test(
          e?.target?.value
        )
      ) {
        return setError(messages.Invalid_URL)
      }
      if (
        validations.MinLength &&
        e?.target?.value?.length != 0 &&
        e?.target?.value?.length < +validations?.MinLength?.minLength
      ) {
        return setError(messages.Min_Length + ' ' + +validations?.MinLength?.minLength)
      }

      if (
        validations.MaxLength &&
        e?.target?.value?.length != 0 &&
        e?.target?.value?.length > +validations?.MaxLength?.maxLength
      ) {
        return setError(messages.Max_Length + ' ' + +validations?.MaxLength?.maxLength)
      }

      setError(false)
    }
  }


  useEffect(() => {
    if (setTriggerData) {
      setTriggerData(prev => prev + 1)
    }
  }, [value])



  useEffect(() => {
    if (!input) return
    let errorWithoutDirty = []
    const errorMessages = []
    if (validations.Required && (value?.length == 0 || value == '')) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.required)
    }

    if (validations.minRow || validations.maxRow) {
      let validationsMinRow = false;
      let validationsMaxRow = false;
      const valueLength = value?.length || 0;


      if (validations?.minRow) {
        if (valueLength < validations?.minRow) {
          validationsMinRow = messages.Min_Length + ' ' + validations?.minRow;
        }
      }

      if (validations.maxRow) {
        if (valueLength > validations?.maxRow) {
          validationsMaxRow = messages.Max_Length + ' ' + validations?.maxRow;
        }
      }

      if (validationsMinRow || validationsMaxRow) {
        errorWithoutDirty.push(true)
        errorMessages.push(validationsMinRow || validationsMaxRow)
      }
    }

    if (input.type == 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value != '') {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Invalid_Email)
    }

    if (regex) {
      // Remove surrounding quotes if present
      const cleanedRegex = regex.replace(/^"(.*)"$/, '$1')
      const regexMatch = cleanedRegex.match(/^\/(.*)\/([gimuy]*)$/)
      if (!regexMatch) {
        console.error('Invalid regex format:', cleanedRegex)

        return
      }
      const [, pattern, flags] = regexMatch
      const regExp = new RegExp(pattern, flags)
      if (!regExp.test(value)) {
        errorWithoutDirty.push(true)
        errorMessages.push(locale == 'ar' ? roles?.regex?.message_ar : roles?.regex?.message_en)
      }
    }

    if (
      input.type == 'URL' &&
      !/^(https:\/\/)(www\.)?([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,6}(\/[-a-zA-Z0-9@:%._\+~#?&//=]*)?$/i.test(
        value
      ) &&
      value != ''
    ) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Invalid_URL)
    }
    if (validations.MinLength && `${value}`.length != 0 && `${value}`.length < +validations?.MinLength?.minLength) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Min_Length + ' ' + +validations?.MinLength?.minLength)
    }
    if (validations.MaxLength && `${value}`.length != 0 && `${value}`.length > +validations?.MaxLength?.maxLength) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Max_Length + ' ' + +validations?.MaxLength?.maxLength)
    }
    if (input.type == 'Phone' && !isPossiblePhoneNumber('+' + value ?? '') && value != '') {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Invalid_Phone)
    }
    if (dataRef) {
      if (input.type == 'Date') {
        try {
          const parsed = JSON.parse(input?.descriptionEn)
          const lable = parsed && typeof parsed === 'object' ? parsed : { format: 'yyyy-MM-dd', showTime: 'false' }

          dataRef.current[input.type == 'new_element' ? input.id : input.key] =
            value ?? formatDate(value, lable?.format)

          if (dataRefWithCollectionId) {
            dataRefWithCollectionId.current[
              input.type == 'new_element' ? input.id : input.collectionId + '.' + input.key
            ] = value ?? formatDate(value, lable?.format)
          }
        } catch (error) {
          dataRef.current[input.type == 'new_element' ? input.id : input.key] = ''
          if (dataRefWithCollectionId) {
            dataRefWithCollectionId.current[
              input.type == 'new_element' ? input.id : input.collectionId + '.' + input.key
            ] = ''
          }
        }
      } else {
        dataRef.current[input.type == 'new_element' ? input.id : input.key] = value
        if (dataRefWithCollectionId) {
          dataRefWithCollectionId.current[
            input.type == 'new_element' ? input.id : input.collectionId + '.' + input.key
          ] = value
        }
      }


    }
    if (refError) {

      refError.current = {
        ...refError.current,
        [input.type == 'new_element' ? input.id : input.key]: errorWithoutDirty.includes(true) ? errorMessages : false
      }
      if (columnId) {
        allErrorsRef.current = {
          ...allErrorsRef.current,
          [input.type == 'new_element' ? input.id : input.key + '_' + columnId]: errorWithoutDirty.includes(true) ? errorMessages : false
        }
      }
      if (refErrorFromTable && columnId) {
        refErrorFromTable.current = {
          ...refErrorFromTable.current,
          [input.type == 'new_element' ? input.id : input.key + '_' + columnId]: errorWithoutDirty.includes(true) ? errorMessages : false
        }
      }
    }

  }, [refError, input, value, validations])

  const collectionOptionsDeps = `${input?.getDataForm ?? ''}|${input?.options?.source ?? ''}|${input?.kind ?? ''}`

  const staticDataDeps =
    input?.getDataForm === 'static' ? JSON.stringify(input?.staticData ?? []) : ''

  useEffect(() => {
    if (!input?.getDataForm || (!input?.options?.source && !input?.staticData)) {
      setSelectedOptions([])
      setLoading(false)

      return
    }

    if (from === "table") {
      console.log(dataAssociations, "dataAssociations");
      setSelectedOptions(dataAssociations)
      setLoading(false)

      return
    }

    if (input?.getDataForm === 'collection' && input?.options?.source && from !== "table") {
      const isSearchKind = input?.kind === 'search'
      const collectionListParams = isSearchKind ? { pageNumber: 1, pageSize: 10 } : {}

      axiosGet(`generic-entities/${input?.options?.source}`, locale, undefined, collectionListParams)
        .then(res => {
          if (res.status) {
            setSelectedOptions(res?.data?.entities ?? [])
            setTotalCount(res?.data?.totalCount ?? 0)
            setPage(1)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }

    if (input?.getDataForm === 'static') {
      setSelectedOptions(input?.staticData || [])
      setLoading(false)
    }
  }, [collectionOptionsDeps, staticDataDeps, locale, dataAssociations])


  const [queryParams, setQueryParams] = useState(null)

  useEffect(() => {
    const handleChange = () => {
      const params = new URLSearchParams(window.location.search)
      const api = input?.externalApi
      const queryParams = typeof api === 'string' ? [...api.matchAll(/\{(.*?)\}/g)].map(m => m[1]) : []
      const filteredQuery = queryParams.map(param => params.get(param))
      setQueryParams(filteredQuery.length > 0 ? JSON.stringify(filteredQuery) : null)
    }

    window.addEventListener('popstate', handleChange)
    window.addEventListener('pushstate', handleChange)
    window.addEventListener('replacestate', handleChange)

    handleChange()

    return () => {
      window.removeEventListener('popstate', handleChange)
      window.removeEventListener('pushstate', handleChange)
      window.removeEventListener('replacestate', handleChange)
    }
  }, [])

  const replaceVars = value => {
    const params = new URLSearchParams(window.location.search)
    const query = Object.fromEntries(params.entries())
    if (typeof value === 'string') {
      return value.replace(/\{\{(.*?)\}\}/g, (_, key) => query[key] ?? '')
    }
    if (Array.isArray(value)) {
      return value.map(replaceVars)
    }
    if (typeof value === 'object' && value !== null) {
      const result = {}
      for (const k in value) result[k] = replaceVars(value[k])

      return result
    }

    return value
  }

  useEffect(() => {
    if (input?.getDataForm === 'api') {
      const apiHeaders = input.apiHeaders ?? {}
      const authToken = Cookies.get('sub')
      const resolvedLink = replacePlaceholders(input?.externalApi, window.location)
      const body = replaceVars(input?.body ?? '')
      const method = input?.method ?? 'GET'

      let sendBody = {}

      try {
        sendBody = JSON.parse(body)
      } catch (error) {
        sendBody = {}
      }

      if (authToken) {
        apiHeaders.Authorization = `Bearer ${decryptData(authToken)?.token?.trim()}`
      }

      setLoading(true)

      let request

      if (method === 'GET') {
        request = axios.get(resolvedLink, { headers: apiHeaders })
      } else {
        request = axios[method.toLowerCase()](resolvedLink, sendBody, { headers: apiHeaders })
      }

      request
        .then(res => {
          const selectData = res?.data?.data || res.result || res.data.result || res.data

          if (Array.isArray(selectData)) {
            setSelectedOptions(selectData)
          }
        })
        .catch(err => {
          setSelectedOptions([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [input?.getDataForm, queryParams])



  useEffect(() => {
    setTimeout(() => {
      if (layout && !loading && !from === "table") {
        if (mainRef.current) {
          setLayout(prev => {
            return prev.map(ele =>
              `${ele.i}` == `${input.id}`
                ? { ...ele, h: isDisable == 'hidden' && !readOnly ? 0 : mainRef.current.scrollHeight / 71 }
                : ele
            )
          })
        }
      }
    }, 100)
  }, [isDisable, readOnly, layout?.length, loading, triggerData, refreshHeight, from])

  const mainRef = useRef()

  const onChangeFile = async e => {
    const file = e.target.files[0]
    const size = roles?.size ? roles?.size * 1024 : 500 * 1024

    if (file?.size > size) {
      toast.error(locale == 'ar' ? `حجم الملف أكبر من ${size / 1024} كيلوبايت` : `File size exceeds ${size / 1024}KB`)

      return
    }
    if (roles?.event?.onChange) {
      try {
        const evaluatedFn = eval('(' + roles.event.onChange + ')')
        evaluatedFn(e)
      } catch { }
    }
    if (!file) {
      toast.error(locale == 'ar' ? 'لم يتم اختيار الملف' : 'No file selected')

      return
    }

    const isValid = input?.options?.uiSchema?.xComponentProps?.fileTypes?.some(type =>
      file.type.includes(type.replace('.', '/'))
    )

    if (isValid) {
      const file = event.target.files[0]
      const loading = toast.loading(locale == 'ar' ? 'جاري الرفع' : 'Uploading...')
      if (file) {
        axiosPost(
          'file/upload',
          'en',
          {
            file: file
          },
          true
        )
          .then(res => {
            if (res.status) {
              setFile(file.name)
              setValue(res.filePath)
            }
          })
          .finally(() => {
            toast.dismiss(loading)
          })
        event.target.value = ''
      }
    } else {
      setError('Invalid File Type')
      setValue('')
      setFile('')
    }

    e.target.value = ''
  }

  const handleDelete = e => {
    e.stopPropagation()
    setTimeout(() => {
      setValue('')
      setFile('')
    }, 0)
    if (validations.Required) {
      setError('Required')
    }
  }

  useEffect(() => {
    if (data?.type_of_sumbit === 'read-only') {
      setIsDisable('disabled')
    }
  }, [data?.type_of_sumbit])

  const label = hiddenLabel ? null : (
    <label htmlFor={input.key} style={{ textTransform: 'capitalize' }}>
      {locale == 'ar' ? roles?.label?.label_ar || input.nameAr : roles?.label?.label_en || input.nameEn}
    </label>
  )

  const hoverText = roles?.hover?.hover_ar || roles?.hover?.hover_en
  const hintText = roles?.hint?.hint_ar || roles?.hint?.hint_en



  const requiredMessage =
    errorView === 'This field is required'
      ? roles?.required?.requiredMessageEn || roles?.required?.requiredMessageAr || ''
      : ''


  return (
    <div
      className={`reset ${isDisable == 'hidden' && !readOnly ? 'hidden' : ''} relative group w-full`}
      id={
        input.type == 'new_element'
          ? `s${input.id}`
          : VaildId(input.key.trim() + input.nameEn.trim().replaceAll('.', ''))
      }
    >
      <style>{`#${input.type == 'new_element'
        ? `s${input.id}`
        : VaildId(input.key.trim() + input.nameEn.trim().replaceAll('.', ''))
        } {
        ${input.kind == 'search' ? '' : design}
      }`}</style>
      {hoverText && (
        <div className='absolute bg-white w-full glass-effect z-10 start-0 border border-main-color border-dashed top-[calc(100%+5px)] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300'>
          <div className='arrow-up w-fit absolute top-[-8px] '></div>
          {hoverText}
        </div>
      )}
      <div ref={mainRef} id='parent-input'>
        <div className='flex gap-2 justify-between items-center mb-2'>
          <div className='flex gap-2 items-center'>
            {input.type != 'File' && label}{' '}
            {input.key !== 'button' && input.key !== 'check_box' && validations.Required && (
              <span className='text-xs text-red-500'>*</span>
            )}
          </div>
          {hintText && (
            <button
              type='button'
              className='text-lg relative bg-main-color hint-btn   rounded-full w-[35px] h-[35px] flex items-center justify-center cursor-pointer'
            >
              <Icon fontSize='1.25rem' icon='tabler:info-circle' className='text-white' />
              <div className='absolute glass-effect z-10 w-fit end-[0] top-[calc(100%+5px)] invisible  hint-text transition-all duration-300'>
                {hintText}
              </div>
            </button>
          )}
        </div>
        <div
          className='relative'

        >
          {isDisable == 'hidden' && readOnly && (
            <div className='flex absolute inset-0 z-10 justify-center items-center text-sm text-white rounded-md bg-main-color/20'>
              <div className=' w-[30px] || h-[30px] || bg-main-color || rounded-full || flex || items-center || justify-center'>
                <FaEyeSlash />
              </div>
            </div>
          )}
          {FormType && FormType !== "print" &&
            <div className="absolute z-10 inset-0 "></div>
          }

          {input.type == 'new_element' ? (
            <NewElement
              saveAsDraft={saveAsDraft}
              tabsData={tabsData}
              allFields={allFields}
              editMode={editMode}
              sortedLoopWithoutTabs={sortedLoopWithoutTabs || []}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              typeOfSubmit={data?.type_of_sumbit}
              handleSubmit={handleSubmit}
              loadingBtn={loadingBtn}
              isDisable={isDisable}
              readOnly={readOnly}
              onChangeData={onChange}
              data={data}
              dataRef={dataRef}
              refError={refError}
              loadingSaveAsDraft={loadingSaveAsDraft}
              disabledBtn={disabledBtn}
              input={input}
              roles={roles}
              onChangeEvent={roles?.event?.onChange}
              onBlur={roles?.event?.onBlur}
              value={value}
              setValue={setValue}
              setTriggerData={setTriggerData}
            />
          ) : (
            <ViewInput
              refErrorFromTable={refErrorFromTable}
              totalCount={totalCount}
              page={page}
              setPage={setPage}
              setTotalCount={setTotalCount}
              data={data}
              isEntitiesData={isEntitiesData}
              input={input}
              xComponentProps={xComponentProps}
              readOnly={readOnly}
              value={value}
              onBlur={roles?.event?.onBlur}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              onChange={onChange}
              dataRef={dataRefWithCollectionId}
              triggerData={triggerData}
              sortedLoop={allFields}
              onChangeData={onChangeData}
              advancedEdit={advancedEdit}
              from={from}
              setValue={setValue}
              roles={roles}
              onChangeFile={onChangeFile}
              isRedirect={isRedirect}
              setRedirect={setRedirect}
              fileName={fileName}
              locale={locale}
              columnId={columnId}
              findError={findError}
              selectedOptions={selectedOptions}
              isDisable={isDisable}
              placeholder={locale == 'ar' ? roles?.placeholder?.placeholder_ar : roles?.placeholder?.placeholder_en}
              errorView={errorView}
              handleDelete={handleDelete}
              error={error}
              setShowPassword={setShowPassword}
              showPassword={showPassword}
              setTriggerData={setTriggerData}
              appendSearchEntities={appendSearchEntities}
              replaceSearchCollectionOptions={replaceSearchCollectionOptions}
              FilterData={FilterData}
              isFilterWithAPI={roles?.trigger?.typeOfValidation == 'filterDataFromAPI'}
              filterWithAPIValue={{
                value: roles?.trigger?.mainValue,
                changedValue: dataRef.current?.[roles?.trigger?.selectedField]
              }}
            />
          )}
        </div>

      </div>

      <div
        className={`${errorView || error ? 'opacity-100 visible' : 'opacity-0 invisible'
          } w-fit text-[#fb866e]   text-2xl end-[2px]  z-10 mt-1 px-2 absolute top-[calc(50%+13px)] -translate-y-1/2 rounded-md transition-all duration-300`}
      >
        <IoMdInformationCircleOutline />
      </div>
      <div
        className={`${errorView || error ? 'opacity-100 visible' : 'opacity-0 invisible'
          } !text-sm bg-[#fb866e] text-white  z-10 w-fit end-[0] mt-1 px-2 absolute top-[100%] rounded-md transition-all duration-300`}
      >
        {requiredMessage || errorView || error}
      </div>
    </div>
  )
}
