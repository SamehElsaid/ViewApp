import { BsPaperclip, BsTrash } from 'react-icons/bs'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import addDays from 'date-fns/addDays'
import ExampleCustomInput from './ExampleCustomInput'
import DatePicker from 'react-datepicker'
import ar from 'date-fns/locale/ar-EG'
import en from 'date-fns/locale/en-US'
import { Autocomplete, Button, Dialog, IconButton, InputAdornment, Rating, TextField } from '@mui/material'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'
import TableView from '../PageCreation/TableView'
import { axiosGet } from 'src/Components/axiosCall'

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
  dataRef,
  advancedEdit,
  sortedLoop,
  FilterData,
  isFilterWithAPI,
  filterWithAPIValue,
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
  triggerData
}) => {
  const [isOpen, setIsOpen] = useState(false)

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
      axiosGet(`/collections/get-by-key?key=${input?.options?.source}`)
        .then(res => {
          const selected = JSON.parse(input?.descriptionEn) || []
          setCollectionData(prev => ({ ...prev, data: res.data }))
          const findDataFromAllData = data[input.key]

          setTableData({
            ...findDataFromAllData,
            collectionId: res.data.id,
            collectionName: res.data.key,

            delete: true,
            edit: true,
            kind: 'form-table',
            selected: selected
          })
        })
        .finally(() => {
          setCollectionData(prev => ({ ...prev, loading: false }))
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

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
                        name={input.nameEn}
                        checked={valueSendOption === value}
                        onChange={e => {
                          onChange(e)
                        }}
                        type='radio'
                        id={valueSendOption}
                        disabled={isDisable == 'disabled'}
                        onBlur={e => {
                          if (onBlur) {
                            const evaluatedFn = eval('(' + onBlur + ')')

                            evaluatedFn(e)
                          }
                        }}
                      />
                      <label htmlFor={valueSendOption}>{label.map(ele => option[ele]).join('-')}</label>
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

    return (
      <Autocomplete
        multiple
        value={value}
        onChange={(event, newValue) => {
          onChange(event, newValue)
        }}
        sx={{ width: 325 }}
        options={selectedOptions}
        disabled={isDisable == 'disabled'}
        filterSelectedOptions
        id='autocomplete-multiple-outlined'
        popupIcon={<IoMdArrowDropdown size={25} color='#3498ff' />}
        getOptionLabel={option => option[label[0]] || ''}
        renderInput={params => <TextField {...params} style={{ width: '100%' }} placeholder={placeholder} />}
      />
    )
  }

  if (input.kind == 'checkbox') {
    const label = JSON.parse(input?.descriptionEn)

    return (
      <div className='w-full'>
        <div className='flex flex-wrap gap-1'>
          {selectedOptions.map((option, index) => (
            <div key={option.Id} className='flex gap-1 items-center'>
              <input
                value={option.Id}
                name={input.nameEn}
                checked={value?.find(v => v == option.Id)}
                onChange={e => onChange(e)}
                type='checkbox'
                id={option.Id}
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
        {input.descriptionEn == 'rate' ? (
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
        ) : (
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
        )}
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
      (isDisable === 'disabled' && value) ? <div className='flex flex-col gap-1 p-2 mt-5 rounded-md shadow-inner shadow-gray-300 file-names-container'>
        <div className='flex gap-3 items-center file-name-item'>
          <span className='flex gap-1 items-center file-name w-[calc(100%-110px)]'>
            <BsPaperclip className='text-xl text-main-color' />
            <span className='flex-1'>{fileName || value}</span>
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

          </div>
        </div>
      </div> :
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
      minDate = addDays(today, roles?.beforeDateValue)
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
            className='absolute top-0 z-10 w-full h-full cursor-pointer start-0'
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
      return <></>
    }

    const onChangeTable = e => {
      setTableData(e)
      onChangeData({
        ...data,
        [input.key]: e
      })
    }

    return (
      <div className='w-full '>
        <TableView
          input={input}
          data={tableData}
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
        />
      </div>
    )
  }
}

export default ViewInput
