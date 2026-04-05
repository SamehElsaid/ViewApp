import { BsPaperclip, BsTrash } from 'react-icons/bs'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import addDays from 'date-fns/addDays'
import ExampleCustomInput from './ExampleCustomInput'
import DatePicker from 'react-datepicker'
import ar from 'date-fns/locale/ar-EG'
import en from 'date-fns/locale/en-US'
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  Paper,
  Rating,
  Skeleton,
  TextField
} from '@mui/material'
import { Icon } from '@iconify/react'
import { forwardRef, memo, useEffect, useRef, useState } from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'
import TableView from '../PageCreation/TableView'
import { axiosGet } from 'src/Components/axiosCall'

const SEARCH_COLLECTION_PAGE_SIZE = 10

/** Footer lives in Paper, not inside the listbox <ul>, to avoid MUI/React removeChild conflicts. */
const SearchAutocompletePaper = forwardRef(function SearchAutocompletePaper(props, ref) {
  const {
    children,
    showSeeMore,
    onSeeMore,
    loadingMore,
    locale,
    ownerState: _ownerState,
    ...other
  } = props

  return (
    <Paper ref={ref} {...other}>
      {children}
      {showSeeMore ? (
        <div role='presentation' onMouseDown={e => e.preventDefault()}>
          <Button
            fullWidth
            size='small'
            variant='text'
            disabled={loadingMore}
            onClick={onSeeMore}
            sx={{ justifyContent: 'center', borderRadius: 0 }}
          >
            {locale === 'ar' ? 'عرض المزيد' : 'See more'}
          </Button>
        </div>
      ) : null}
    </Paper>
  )
})

function convertMomentToDateFnsFormat(format) {
  if (!format || typeof format !== 'string') return 'yyyy-MM-dd'

  return format
    .replace(/DD/g, 'dd') // Day
    .replace(/YYYY/g, 'yyyy') // Year full
    .replace(/YY/g, 'yy') // Year short
    .replace(/HH/g, 'HH') // 24-hour format (unchanged)
    .replace(/mm/g, 'mm') // minutes (unchanged)
    .replace(/ss/g, 'ss') // seconds (unchanged)
}

const ViewInput = ({
  refErrorFromTable,
  dataRef,
  advancedEdit,
  sortedLoop,
  FilterData,
  isFilterWithAPI,
  filterWithAPIValue,
  totalCount,
  page,
  setPage,
  setTotalCount,
  input,
  data,
  value,
  onChangeFile,
  from,
  readOnly,
  roles,
  onChange,
  onChangeData,
  locale,
  handleDelete,
  errorView,
  columnId,
  fileName,
  error,
  showPassword,
  setShowPassword,
  selectedOptions,
  setTriggerData,
  isDisable,
  placeholder,
  onBlur,
  isRedirect,
  setRedirect,
  triggerData,
  appendSearchEntities,
  replaceSearchCollectionOptions,
  isEntitiesData
}) => {

  const [isOpen, setIsOpen] = useState(false)
  const [searchLoadingMore, setSearchLoadingMore] = useState(false)
  const [searchInputValue, setSearchInputValue] = useState('')
  const [searchTypingLoading, setSearchTypingLoading] = useState(false)
  const skipInitialEmptySearchFetch = useRef(true)
  const committedSearchRef = useRef('')

  const handleKeyDown = event => {
    if (input.type != 'Phone') return
    if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
      event.preventDefault()
    }
  }

  const handleWheel = event => {
    if (input.type != 'Phone') return
    event.preventDefault()
  }

  const [collectionData, setCollectionData] = useState({ data: null, loading: true })
  const [tableData, setTableData] = useState(null)

  useEffect(() => {
    if (input?.kind == 'Table') {
      console.log("fromHere7");

      axiosGet(`collections/get-by-key?key=${input?.options?.source}`)
        .then(res => {
          if (res.status) {

            const selected = JSON.parse(input?.descriptionEn) || []
            setCollectionData(prev => ({ ...prev, data: res.data }))
            const findDataFromAllData = data[input.key]
            setTableData({
              ...findDataFromAllData,
              collectionId: res.data.id,
              collectionName: res.data.key,
              showOldData: roles?.showOldData,
              showBtn: roles?.showBtn ?? true,
              delete: roles?.delete ?? true,
              edit: false,
              kind: 'form-table',
              selected: selected
            })
          }
        })
        .finally(() => {
          setCollectionData(prev => ({ ...prev, loading: false }))
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input?.key, input?.kind, roles?.showBtn, roles?.showOldData, roles?.delete])

  useEffect(() => {
    setSearchInputValue('')
    committedSearchRef.current = ''
    skipInitialEmptySearchFetch.current = true
  }, [input?.key])

  useEffect(() => {
    if (input?.kind !== 'search') return
    if (!input?.options?.source || typeof replaceSearchCollectionOptions !== 'function') return

    let cancelled = false

    const t = setTimeout(() => {
      const sourceKey = input.options.source
      const trimmed = searchInputValue.trim()

      if (skipInitialEmptySearchFetch.current && trimmed === '') {
        skipInitialEmptySearchFetch.current = false

        return
      }
      skipInitialEmptySearchFetch.current = false

      setSearchTypingLoading(true)

      const params = {
        pageNumber: 1,
        pageSize: SEARCH_COLLECTION_PAGE_SIZE
      }
      if (trimmed) {
        params.search = trimmed
      }
      axiosGet(`generic-entities/${sourceKey}`, locale, undefined, params)
        .then(res => {
          if (cancelled || !res.status) return
          committedSearchRef.current = trimmed
          replaceSearchCollectionOptions(res?.data?.entities ?? [], res?.data?.totalCount ?? 0)
        })
        .finally(() => {
          if (!cancelled) setSearchTypingLoading(false)
        })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [searchInputValue, input?.kind, input?.options?.source, locale, replaceSearchCollectionOptions])

  if (input?.kind == 'select') {
    const label = JSON.parse(input?.descriptionEn) || []
    const valueSend = JSON.parse(input?.selectedValueSend) || []



    return (
      <div id='custom-select'>
        <select
          value={value}
          onChange={e => onChange(e)}
          disabled={isDisable == 'disabled' || selectedOptions.length == 0}
          onBlur={e => {
            if (isRedirect) {
              const findOption = selectedOptions.find(option => option.Id == e.target.value)
              setRedirect(findOption.redirect)
            }
            if (onBlur) {
              const evaluatedFn = eval('(' + onBlur + ')')

              evaluatedFn(e)
            }
          }}
        >
          <option selected value={''}>
            {placeholder ? placeholder : locale == 'ar' ? 'اختر ' : 'Select'}
          </option>
          {selectedOptions.map((option, index) => (
            <option key={index} value={valueSend.length > 0 ? option[valueSend[0]] || option.id : option?.Id}>
              {label?.map(ele => option[ele]).join('-')}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (input.kind == 'radio') {
    const label = JSON.parse(input?.descriptionEn)
    const valueSend = JSON.parse(input?.selectedValueSend) || []


    return (
      <div className=''>
        <div className=''>
          <div className=''>
            <div>
              <div className='flex flex-wrap gap-1'>
                {selectedOptions.map((option, index) => {
                  const valueSendOption = valueSend.length > 0 ? option[valueSend[0]] || option.id : option?.Id

                  return (
                    <div key={index + 'radio' + valueSendOption || index} className=''>
                      <input
                        value={valueSendOption}
                        name={input.nameEn + (columnId ? `_${columnId}` : '')}
                        checked={valueSendOption === value}
                        onChange={e => {
                          onChange(e)
                        }}
                        type='radio'
                        id={valueSendOption + (columnId ? `_${columnId}` : '')}
                        disabled={isDisable == 'disabled'}
                        onBlur={e => {
                          if (onBlur) {
                            const evaluatedFn = eval('(' + onBlur + ')')

                            evaluatedFn(e)
                          }
                        }}
                      />
                      <label htmlFor={valueSendOption + (columnId ? `_${columnId}` : '')}>{label.map(ele => option[ele]).join('-')}</label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (input.kind == 'search') {
    const label = JSON.parse(input?.descriptionEn)
    const sourceKey = input?.options?.source
    const loadedCount = selectedOptions?.length ?? 0

    const showSeeMore =
      Boolean(sourceKey) &&
      typeof appendSearchEntities === 'function' &&
      typeof setPage === 'function' &&
      totalCount > loadedCount

    const handleSearchSeeMore = async e => {
      e.stopPropagation()
      e.preventDefault()
      if (!sourceKey || !appendSearchEntities || !setPage || searchLoadingMore) return
      const nextPage = (page ?? 1) + 1

      setSearchLoadingMore(true)

      const params = {
        pageNumber: nextPage,
        pageSize: SEARCH_COLLECTION_PAGE_SIZE
      }
      const committed = committedSearchRef.current?.trim()
      if (committed) {
        params.search = committed
      }
      const res = await axiosGet(`generic-entities/${sourceKey}`, locale, undefined, params)
      if (res.status && Array.isArray(res?.data?.entities)) {
        appendSearchEntities(res.data.entities)
        setPage(nextPage)
        if (typeof setTotalCount === 'function' && res?.data?.totalCount != null) {
          setTotalCount(res.data.totalCount)
        }
      }
      setSearchLoadingMore(false)
    }

    return (
      <Autocomplete
        multiple
        disablePortal
        value={value}
        inputValue={searchInputValue}
        onInputChange={(event, newInputValue) => {
          setSearchInputValue(newInputValue ?? '')
        }}
        onChange={(event, newValue) => {
          onChange(event, newValue)
        }}
        sx={{ width: 325 }}
        options={selectedOptions}
        disabled={isDisable == 'disabled'}
        filterSelectedOptions
        filterOptions={options => options}
        id='autocomplete-multiple-outlined'
        popupIcon={<IoMdArrowDropdown style={{ transform: 'scale(0.7,1.6)' }} size={25} color='#f3f4f6' />}
        getOptionLabel={option => option[label[0]] || ''}
        PaperComponent={SearchAutocompletePaper}
        componentsProps={{
          paper: {
            showSeeMore,
            onSeeMore: handleSearchSeeMore,
            loadingMore: searchLoadingMore,
            locale
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            style={{ width: '100%' }}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {searchTypingLoading ? (
                    <CircularProgress color='inherit' size={18} sx={{ mr: 0.5 }} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    )
  }

  if (input.kind == 'checkbox' || input.type == 'Boolean') {
    let label = []

    try {
      label = input?.descriptionEn ? JSON.parse(input.descriptionEn) : []
    } catch (e) {
      label = input.descriptionEn // أو []
    }

    return (
      <div className='w-full'>
        <div className='flex flex-wrap gap-1'>
          {input.type ?
            <div className=" flex flex-wrap gap-2">

              <div className='flex gap-1 items-center'>
                <input
                  id={input.key + 'radio-yes' + (columnId ? `_${columnId}` : '')}
                  name={input.nameEn + (columnId ? `_${columnId}` : '')}
                  checked={value === true || value === 'true'}
                  onChange={() => {
                    onChange({ target: { value: true } })
                  }}
                  type='radio'
                  disabled={isDisable == 'disabled'}
                />
                <label
                  style={{
                    color: isDisable == 'disabled' ? 'gray' : '',
                    cursor: isDisable == 'disabled' ? 'not-allowed' : '',
                    marginBottom: '0'
                  }}
                  htmlFor={input.key + 'radio-yes' + (columnId ? `_${columnId}` : '')}
                >
                  {locale == 'ar' ? 'نعم' : 'Yes'}
                </label>
              </div>
              <div className='flex gap-1 items-center'>
                <input
                  id={input.key + 'radio-no' + (columnId ? `_${columnId}` : '')}
                  name={input.nameEn + (columnId ? `_${columnId}` : '')}
                  checked={value === false || value === 'false'}
                  onChange={() => {
                    onChange({ target: { value: false } })
                  }}
                  type='radio'
                  disabled={isDisable == 'disabled'}
                />
                <label
                  style={{
                    color: isDisable == 'disabled' ? 'gray' : '',
                    cursor: isDisable == 'disabled' ? 'not-allowed' : '',
                    marginBottom: '0'
                  }}
                  htmlFor={input.key + 'radio-no' + (columnId ? `_${columnId}` : '')}
                >
                  {locale == 'ar' ? 'لا' : 'No'}
                </label>

              </div>
            </div>
            : selectedOptions.map((option, index) => (
              <div key={option.Id} className='flex gap-1 items-center'>
                <input
                  value={option.Id}
                  name={input.nameEn + (columnId ? `_${columnId}` : '')}
                  checked={value?.find(v => v == option.Id)}
                  onChange={e => onChange(e)}
                  type='checkbox'
                  id={option.Id + (columnId ? `_${columnId}` : '')}
                  disabled={isDisable == 'disabled'}
                  className={`${isDisable == 'disabled' ? '!color-gray-400' : ''}`}
                  onBlur={e => {
                    if (onBlur) {
                      const evaluatedFn = eval('(' + onBlur + ')')

                      evaluatedFn(e)
                    }
                  }}
                />
                <label
                  style={{
                    color: isDisable == 'disabled' ? 'gray' : '',
                    cursor: isDisable == 'disabled' ? 'not-allowed' : ''
                  }}
                  htmlFor={option.Id}
                >
                  {label.map(ele => option[ele]).join('-')}
                </label>
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (input.type == 'Number' && input.descriptionAr == 'progress_bar') {
    const progress = Math.min(100, Math.max(0, Number(value ?? 0)))

    const segments = (roles?.progressBarSegments ?? [])
      .map(s => ({
        ...s,
        percentage: Number(s.percentage)
      }))
      .sort((a, b) => a.percentage - b.percentage)

    const currentSegment = segments
      .filter(segment => progress >= segment.percentage)
      .pop()


    return (
      <div className="progress-container" style={{ width: '100%' }}>
        <div className="progress-bar" id="myBar" style={{ width: `${progress}%`, background: currentSegment?.backgroundColor ?? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);' }}>
          <span className="progress-text absolute inset-0 flex items-center justify-center">{placeholder ?? ""} {progress} %</span>
        </div>
      </div>
    )
  }



  if (input.type == 'Currency' || input.type == 'Decimal' || input.type == 'Percent' || input.type == 'Integer' || input.type == 'Float' || input.type == 'Double') {

    if (input.descriptionEn == 'rate') {
      return (
        <>
          <Rating
            name={input.nameEn}
            id={input.key}
            sx={{
              '& .MuiRating-iconFilled': {
                color: roles?.color ? roles.color : '#faac00'
              }
            }}
            value={value}
            precision={0.5}
            max={placeholder ? +placeholder : 5}
            onChange={e => {
              onChange(e)
            }}
            onBlur={e => {
              if (onBlur) {
                const evaluatedFn = eval('(' + onBlur + ')')

                evaluatedFn(e)
              }
            }}
            disabled={isDisable == 'disabled'}
            className={`${errorView || error ? 'error' : ''} `}
            style={{ transition: '0.3s' }}
          />
        </>
      )
    }

    return (
      <input
        id={input.key}
        type={"number"}
        value={value}
        name={input.nameEn}
        onChange={e => {
          onChange(e)
        }}
        onBlur={e => {
          if (onBlur) {
            const evaluatedFn = eval('(' + onBlur + ')')

            evaluatedFn(e)
          }
        }}
        placeholder={placeholder}
        disabled={isDisable == 'disabled'}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        className={`${errorView || error ? 'error' : ''} `}
        style={{ transition: '0.3s' }}
      />
    )
  }

  if (
    input.type == 'SingleText' ||
    input.type == 'Number' ||
    input.type == 'Email' ||
    input.type == 'URL' ||
    input.type == 'Password' ||
    input.type == 'Phone'
  ) {
    return (
      <>

        <>
          <input
            id={input.key}
            type={
              showPassword
                ? 'text'
                : input.type == 'URL'
                  ? 'text'
                  : input.type == 'SingleText'
                    ? 'text'
                    : input.type == 'Phone'
                      ? 'number'
                      : input.type
            }
            value={value}
            name={input.nameEn}
            onChange={e => {
              onChange(e)
            }}
            onBlur={e => {
              if (onBlur) {
                const evaluatedFn = eval('(' + onBlur + ')')

                evaluatedFn(e)
              }
            }}
            placeholder={placeholder}
            disabled={isDisable == 'disabled'}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            className={`${errorView || error ? 'error' : ''} `}
            style={{ transition: '0.3s' }}
          />
          {input.type == 'Password' && (
            <div className='absolute top-1/2 || -translate-y-1/2 || end-[15px]'>
              <InputAdornment position='end'>
                <IconButton
                  edge='end'
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                </IconButton>
              </InputAdornment>
            </div>
          )}
        </>
      </>
    )
  }
  if (input.type == 'LongText') {
    return (
      <textarea
        id={input.key}
        value={value}
        name={input.nameEn}
        onChange={e => {
          onChange(e)
        }}
        rows={4}
        placeholder={placeholder}
        disabled={isDisable == 'disabled'}
        className={`${errorView || error ? 'error' : ''} resize-none`}
        style={{ transition: '0.3s' }}
        onBlur={e => {
          if (onBlur) {
            const evaluatedFn = eval('(' + onBlur + ')')

            evaluatedFn(e)
          }
        }}
      />
    )
  }

  if (input.type == 'File') {
    return from != 'table' ? (
      <div className='px-4 w-full relative'>
        {isDisable === 'disabled' && <div className='absolute inset-0 opacity-50 bg-black/20 z-10'></div>}
        <div id='file-upload-container'>
          <label htmlFor={input.key} id='file-upload-label'>
            <div id='label-color'>{locale == 'ar' ? input.nameAr : input.nameEn}</div>
            <div id='file-upload-content'>
              <svg
                id='file-upload-icon'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 20 16'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                />
              </svg>

              <p id='file-upload-text'>{locale == 'ar' ? ' اسحب وأفلت' : 'Drag and Drop'}</p>
              <p id='file-upload-subtext'>
                {input?.options?.uiSchema?.xComponentProps?.fileTypes?.length > 0
                  ? input.options.uiSchema.xComponentProps.fileTypes.join(', ').toUpperCase()
                  : locale == 'ar'
                    ? 'SVG, PNG, JPG أو GIF (MAX. 800x400px)'
                    : 'SVG, PNG, JPG or GIF (MAX. 800x400px)'}
              </p>


              {value && (
                <div className='flex flex-col gap-1 p-2 mt-5 rounded-md shadow-inner shadow-gray-300 file-names-container'>
                  <div className='flex gap-3 items-center file-name-item'>
                    <span className='flex gap-1 items-center file-name w-[calc(100%-110px)]'>
                      <BsPaperclip className='text-xl text-main-color' />
                      <span className='flex-1'>{fileName}</span>
                    </span>
                    <div className='flex gap-2 items-center'>
                      <a
                        href={process.env.API_URL + "/file/download/" + value}
                        target='_blank'
                        rel='noreferrer'
                        className='view-button w-[25px] h-[25px] bg-main-color rounded-full text-white hover:bg-red-500/90 transition-all duration-300 flex items-center justify-center'
                      >
                        <Icon icon='tabler:eye' fontSize='1.25rem' />
                      </a>
                      <a
                        href={process.env.API_URL + "/file/download/" + value}
                        download
                        target='_blank'
                        className='download-button w-[25px] h-[25px] bg-main-color rounded-full text-white hover:bg-red-500/90 transition-all duration-300 flex items-center justify-center'
                      >
                        <Icon icon='tabler:download' fontSize='1.25rem' />
                      </a>
                      <button
                        type='button'
                        className='delete-button w-[25px] h-[25px] bg-red-500/70 rounded-full text-white hover:bg-red-500/90 transition-all duration-300 flex items-center justify-center'
                        onClick={e => handleDelete(e)}
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <input
              type='file'
              disabled={isDisable == 'disabled'}
              id={input.key}
              onChange={onChangeFile}
              onBlur={e => {
                if (onBlur) {
                  const evaluatedFn = eval('(' + onBlur + ')')

                  evaluatedFn(e)
                }
              }}
              accept={
                input?.options?.uiSchema?.xComponentProps?.fileTypes?.length
                  ? input.options.uiSchema.xComponentProps.fileTypes.join(',')
                  : undefined
              }
            />
          </label>
        </div>
      </div>
    ) : (
      <div className='flex gap-2 items-center relative'>
        <a
          href={process.env.API_URL + "/file/download/" + value}
          target='_blank'
          rel='noreferrer'
        >
          {value?.slice(0, 30) ? (
            value.slice(0, 30) + '.' + value.split('.').pop()
          ) : (
            <></>
          )}
        </a>
        <div className=''>
          <Button
            variant='outlined'
            component='label'
            className='!w-[30px] !h-[30px] !rounded-full  !max-w-[30px] !max-h-[30px]  !min-h-0 !p-0 !min-w-0 !flex !items-center !justify-center'
          >
            <Icon
              icon={value?.split('/Uploads/')?.[1]?.slice(0, 30) ? 'tabler:edit' : 'tabler:upload'}
              width={25}
              height={25}
            />
            <input
              type='file'
              disabled={isDisable == 'disabled'}
              id={input.key}
              hidden
              onChange={onChangeFile}
              onBlur={e => {
                if (onBlur) {
                  const evaluatedFn = eval('(' + onBlur + ')')

                  evaluatedFn(e)
                }
              }}
              accept={
                input?.options?.uiSchema?.xComponentProps?.fileTypes?.length
                  ? input.options.uiSchema.xComponentProps.fileTypes.join(',')
                  : undefined
              }
            />
          </Button>
        </div>
      </div>
    )
  }

  if (input.type == 'Date' && input.descriptionEn == 'timeOnly') {
    const today = new Date()
    let minDate = null
    let maxDate = null

    if (roles?.beforeDateType == 'days') {
      minDate = addDays(today, roles?.beforeDateValue)
    } else if (roles?.beforeDateType == 'date') {
      minDate = new Date(roles?.beforeDateValue)
    }

    if (roles?.afterDateType == 'days') {
      maxDate = addDays(today, roles?.afterDateValue)
    } else if (roles?.afterDateType == 'date') {
      maxDate = new Date(roles?.afterDateValue)
    }
    const timeFormat = roles?.timeFormat == '12hrs' ? 'h:mm aa' : 'HH:mm'

    const datePicker = inline => {
      return (
        <DatePicker
          selected={value}
          onChange={date => {
            onChange(date)
          }}
          dateFormat={timeFormat}
          showTimeSelect
          showTimeSelectOnly
          locale={locale == 'ar' ? ar : en}
          onBlur={e => {
            if (onBlur) {
              const evaluatedFn = eval('(' + onBlur + ')')

              evaluatedFn(e)
            }
          }}
          customInput={
            <ExampleCustomInput
              disabled={isDisable == 'disabled'}
              value={value?.toString()}
              type='time'
              className='example-custom-input'
            />
          }
          disabled={isDisable == 'disabled'}
          minDate={minDate}
          maxDate={maxDate}
          inline={inline}
        />
      )
    }

    return !readOnly ? (
      <>
        <div className='relative w-full'>
          <div
            onClick={() => {
              if (isDisable !== 'disabled') {
                setIsOpen(true)
              }
            }}
            className='absolute top-0 z-10 w-full h-full cursor-pointer start-0'
          ></div>
          <DatePickerWrapper className='w-full'>{datePicker()}</DatePickerWrapper>
        </div>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
          className='bg-transparent-popup'
        >
          {' '}
          <div className='absolute top-0 end-0 py-0 z-10'>
            <IconButton size='small' color='error' onClick={() => setIsOpen(false)} className=''>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </IconButton>
          </div>
          <DatePickerWrapper className='w-full mx-auto flex justify-center items-center '>
            {datePicker(true)}
          </DatePickerWrapper>
        </Dialog>
      </>
    ) : (
      datePicker()
    )
  }

  if (input.type == 'Date') {
    const raw = JSON.parse(input?.descriptionEn ?? '{}')

    const format = convertMomentToDateFnsFormat(raw.format)

    const label = {
      format,
      showTime: raw.showTime === 'true'
    }

    const today = new Date()
    let minDate = null
    let maxDate = null

    if (roles?.beforeDateType == 'days') {
      minDate = addDays(today, -roles?.beforeDateValue)
    } else if (roles?.beforeDateType == 'date') {
      minDate = new Date(roles?.beforeDateValue)
    }

    if (roles?.afterDateType == 'days') {
      maxDate = addDays(today, roles?.afterDateValue)
    } else if (roles?.afterDateType == 'date') {
      maxDate = new Date(roles?.afterDateValue)
    }


    const datePicker = inline => {
      return (
        <DatePicker
          selected={value}
          onChange={date => {
            onChange(date)
          }}
          timeInputLabel={label.showTime == 'true' ? (locale == 'ar' ? 'الوقت:' : 'Time:') : ''}
          dateFormat={`${label.format ? label.format : 'MM/dd/yyyy'}`}
          showMonthDropdown
          locale={locale == 'ar' ? ar : en}
          showYearDropdown
          onBlur={e => {
            if (onBlur) {
              const evaluatedFn = eval('(' + onBlur + ')')

              evaluatedFn(e)
            }
          }}
          showTimeSelect={label.showTime == 'true'}
          customInput={<ExampleCustomInput disabled={isDisable == 'disabled'} className='example-custom-input' />}
          disabled={isDisable == 'disabled'}
          minDate={minDate}
          maxDate={maxDate}
          popperPlacement='bottom-start'
          inline={inline}
        />
      )
    }

    return !readOnly ? (
      <>
        <div className='relative w-full'>
          <div
            onClick={() => {
              if (isDisable !== 'disabled') {
                setIsOpen(true)
              }
            }}
            className='absolute top-0 z-20  w-full h-full cursor-pointer start-0'
          ></div>
          <DatePickerWrapper className='w-full'>{datePicker()}</DatePickerWrapper>
          <Dialog
            open={isOpen}
            onClose={() => {
              if (isDisable !== 'disabled') {
                setIsOpen(false)
              }
            }}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='bg-transparent-popup'
          >
            {' '}
            <div className='absolute top-0 end-2 py-2 z-10'>
              <IconButton size='small' color='error' onClick={() => setIsOpen(false)} className=''>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </IconButton>
            </div>
            <DatePickerWrapper className='w-full mx-auto flex  justify-center items-center '>
              {datePicker(true)}
            </DatePickerWrapper>
          </Dialog>
        </div>
      </>
    ) : (
      datePicker()
    )
  }

  if (input.kind == 'Table') {
    if (collectionData.loading) {
      return <Skeleton variant="rectangular" width="100%" height={300} />
    }

    const onChangeTable = e => {
      setTableData(e)
      onChangeData({
        ...data,
        [input.key]: e
      })
    }







    const tableStyle =
    {
      headerBackgroundColor: roles?.backgroundColor ?? '#f5f5f5',
      headerTextColor: roles?.textColor ?? '#333333',
      tableBorderColor: roles?.borderColor ?? 'rgba(224, 224, 224, 1)'
    }

    console.log(isEntitiesData, value, "isEntitiesData");


    return (
      <div className='w-full '>
        <TableView
          refErrorFromTable={refErrorFromTable}
          setValue={onChange}
          input={input}
          data={{ ...tableData, ...(isEntitiesData ? { newRows: value } : {}) }}
          reloadHight={setTriggerData}
          locale={locale}
          onChange={onChangeTable}
          readOnly={advancedEdit}
          sortedLoop={sortedLoop}
          allData={dataRef}
          reloadRef={triggerData}
          type='from-collection'
          FilterData={FilterData}
          isFilterWithAPI={isFilterWithAPI}
          filterWithAPIValue={filterWithAPIValue}
          tableStyle={tableStyle}
        />
      </div>
    )
  }
}

export default memo(ViewInput)
