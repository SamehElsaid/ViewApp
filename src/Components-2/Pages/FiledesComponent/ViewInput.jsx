import { BsPaperclip, BsTrash } from 'react-icons/bs'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import addDays from 'date-fns/addDays'
import ExampleCustomInput from './ExampleCustomInput'
import DatePicker from 'react-datepicker'
import ar from 'date-fns/locale/ar-EG'
import en from 'date-fns/locale/en-US'
import { Autocomplete, Button, Dialog, IconButton, InputAdornment, Rating, TextField } from '@mui/material'
import { Icon } from '@iconify/react'

const ViewInput = ({
  input,
  isOpen,
  setIsOpen,
  value,
  onChangeFile,
  from,
  readOnly,
  roles,
  onChange,
  setValue,
  locale,
  handleDelete,
  errorView,
  fileName,
  error,
  showPassword,
  setShowPassword,
  selectedOptions,
  isDisable,
  placeholder,
  onBlur,
  isRedirect,
  setRedirect, isDisabled
}) => {
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
              disabled={isDisable == 'disabled' || isDisabled}
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
        className={`${errorView || error ? 'error' : ''} `}
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
      <div className='px-4 w-full'>
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

              <p id='file-upload-text'>
                <span className='font-semibold'>{locale == 'ar' ? 'اضف الصورة' : 'Add Image'} </span>
                {locale == 'ar' ? 'أو اسحب وأفلت' : 'or drag and drop'}
              </p>
              <p id='file-upload-subtext'>
                {locale == 'ar' ? 'SVG, PNG, JPG or GIF (MAX. 800x400px)' : 'SVG, PNG, JPG or GIF (MAX. 800x400px)'}
              </p>

              {value && (
                <div className='flex flex-col gap-1 p-2 mt-5 rounded-md shadow-inner shadow-gray-300 file-names-container'>
                  <div className='flex gap-3 items-center file-name-item'>
                    <span className='flex gap-1 items-center file-name w-[calc(100%-25px)]'>
                      <BsPaperclip className='text-xl text-main-color' />
                      <span className='flex-1'>{fileName}</span>
                    </span>
                    <button
                      type='button'
                      className='delete-button w-[25px] h-[25px] bg-red-500/70 rounded-full text-white hover:bg-red-500/90 transition-all duration-300 flex items-center justify-center'
                      onClick={e => handleDelete(e)}
                    >
                      <BsTrash />
                    </button>
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
              accept={input?.options?.uiSchema?.xComponentProps?.fileTypes?.join(',')}
            />
          </label>
        </div>
      </div>
    ) : (
      <div className='flex gap-2 items-center'>
        <a
          href={process.env.API_URL + '/file/download/' + value.replaceAll('/Uploads/', '')}
          target='_blank'
          rel='noreferrer'
        >
          {value?.split('/Uploads/')?.[1]?.slice(0, 30) ? (
            value.split('/Uploads/')[1].slice(0, 30) + '.' + value.split('/Uploads/')[1].split('.').pop()
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
              accept={input?.options?.uiSchema?.xComponentProps?.fileTypes?.join(',')}
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

    return !readOnly ? (
      <>
        <div className='relative w-full'>
          <div
            className='absolute top-0 z-10 w-full h-full cursor-pointer start-0'
            onClick={() => setIsOpen(true)}
          ></div>
          <DatePickerWrapper className='w-full'>
            <DatePicker
              selected={value}
              onChange={date => onChange(date)}
              showTimeSelectOnly
              dateFormat='h:mm aa'
              showMonthDropdown
              locale={locale == 'ar' ? ar : en}
              showYearDropdown
              onBlur={e => {
                if (onBlur) {
                  const evaluatedFn = eval('(' + onBlur + ')')

                  evaluatedFn(e)
                }
              }}
              customInput={<ExampleCustomInput type='time' className='example-custom-input' />}
              disabled={isDisable == 'disabled'  || isDisabled}
              minDate={minDate}
              maxDate={maxDate}
            />
          </DatePickerWrapper>
        </div>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <div className='min-h-[80vh] flex flex-col  control-date py-5'>
            <div className='flex gap-2 justify-end px-5'>
              <Button
                type='button'
                variant='contained'
                color='error'
                onClick={() => {
                  setValue(null)
                }}
              >
                {locale == 'ar' ? 'اعادة تعيين' : 'Reset'}
              </Button>
              <Button type='button' variant='contained' color='secondary' onClick={() => setIsOpen(false)}>
                {locale == 'ar' ? 'اغلاق' : 'Close'}
              </Button>
            </div>
            {console.log(value)}
            <DatePickerWrapper className='w-full'>
              <DatePicker
                selected={value}
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
                onChange={date => {
                  onChange(date)
                  setIsOpen(false)
                }}
                dateFormat='h:mm aa'
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
                  <ExampleCustomInput value={value?.toString()} type='time' className='example-custom-input' />
                }
                disabled={isDisable == 'disabled'}
                minDate={minDate}
                maxDate={maxDate}
              />
            </DatePickerWrapper>
          </div>
        </Dialog>
      </>
    ) : (
      <DatePicker
        selected={value}
        locale={locale == 'ar' ? ar : en}
        popperPlacement='bottom-start'
        onChange={date => onChange(date)}
        timeInputLabel='Time:'
        dateFormat='h:mm aa'
        onBlur={e => {
          if (onBlur) {
            const evaluatedFn = eval('(' + onBlur + ')')

            evaluatedFn(e)
          }
        }}
        customInput={<ExampleCustomInput className='example-custom-input' />}
        disabled={isDisable == 'disabled'  || isDisabled}
      />
    )
  }

  if (input.type == 'Date') {
    const lable = JSON.parse(input?.descriptionEn) ?? {
      format: 'yyyy-MM-dd',
      showTime: 'false'
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

    return !readOnly ? (
      <>
        <div className='relative w-full'>
          <div
            className='absolute top-0 z-10 w-full h-full cursor-pointer start-0'
            onClick={() => setIsOpen(true)}
          ></div>
          <DatePickerWrapper className='w-full'>
            <DatePicker
              selected={value}
              onChange={date => onChange(date)}
              timeInputLabel='Time:'
              dateFormat={`${lable.format ? lable.format : 'MM/dd/yyyy'}`}
              showMonthDropdown
              locale={locale == 'ar' ? ar : en}
              showYearDropdown
              onBlur={e => {
                if (onBlur) {
                  const evaluatedFn = eval('(' + onBlur + ')')

                  evaluatedFn(e)
                }
              }}
              showTimeInput={lable.showTime == 'true'}
              customInput={<ExampleCustomInput className='example-custom-input' />}
              disabled={isDisable == 'disabled' || isDisabled}
              minDate={minDate}
              maxDate={maxDate}
            />
          </DatePickerWrapper>
        </div>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <div className='min-h-[80vh] flex flex-col  control-date py-5'>
            <div className='flex gap-2 justify-end px-5'>
              <Button
                type='button'
                variant='contained'
                color='error'
                onClick={() => {
                  setValue(null)
                }}
              >
                {locale == 'ar' ? 'اعادة تعيين' : 'Reset'}
              </Button>
              <Button type='button' variant='contained' color='secondary' onClick={() => setIsOpen(false)}>
                {locale == 'ar' ? 'اغلاق' : 'Close'}
              </Button>
            </div>
            <DatePickerWrapper className='w-full'>
              <DatePicker
                selected={value}
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
                onChange={date => {
                  onChange(date)
                  setIsOpen(false)
                }}
                timeInputLabel={lable.showTime == 'true' ? (locale == 'ar' ? 'الوقت:' : 'Time:') : ''}
                dateFormat={`${lable.format ? lable.format : 'MM/dd/yyyy'}`}
                showMonthDropdown
                locale={locale == 'ar' ? ar : en}
                showYearDropdown
                onBlur={e => {
                  if (onBlur) {
                    const evaluatedFn = eval('(' + onBlur + ')')

                    evaluatedFn(e)
                  }
                }}
                showTimeSelect={lable.showTime == 'true'}
                customInput={<ExampleCustomInput className='example-custom-input' />}
                disabled={isDisable == 'disabled'}
                minDate={minDate}
                maxDate={maxDate}
              />
            </DatePickerWrapper>
          </div>
        </Dialog>
      </>
    ) : (
      <DatePicker
        selected={value}
        locale={locale == 'ar' ? ar : en}
        popperPlacement='bottom-start'
        onChange={date => onChange(date)}
        timeInputLabel='Time:'
        dateFormat={`${lable.format ? lable.format : 'MM/dd/yyyy'}`}
        showMonthDropdown
        onBlur={e => {
          if (onBlur) {
            const evaluatedFn = eval('(' + onBlur + ')')

            evaluatedFn(e)
          }
        }}
        showYearDropdown
        showTimeInput={lable.showTime == 'true'}
        customInput={<ExampleCustomInput className='example-custom-input' />}
        disabled={isDisable == 'disabled' || isDisabled}
      />
    )
  }
  if (input.type == 'OneToOne' && input.descriptionAr == 'select') {
    const lable = JSON.parse(input?.descriptionEn)

    return (
      <div id='custom-select'>
        <select
          value={value}
          onChange={e => onChange(e)}
          disabled={isDisable == 'disabled' || selectedOptions.length == 0}
          onBlur={e => {
            if (isRedirect) {
              const findOption = selectedOptions.find(option => option.Id == e.target.value)
              setRedirect(findOption?.redirect)
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
            <option key={option.Id} value={option.Id}>
              {lable.map(ele => option[ele]).join('-')}
            </option>
          ))}
        </select>
      </div>
    )
  }
  if (input.type == 'OneToOne') {
    const lable = JSON.parse(input?.descriptionEn)

    return (
      <div className=''>
        <div className=''>
          <div className=''>
            <div>
              <div className='flex flex-wrap gap-1'>
                {selectedOptions.map((option, index) => (
                  <div key={option.Id} className=''>
                    <input
                      value={option.Id}
                      name={input.nameEn}
                      checked={value == option.Id}
                      onChange={e => onChange(e)}
                      type='radio'
                      id={option.Id}
                      disabled={isDisable == 'disabled'}
                      onBlur={e => {
                        if (onBlur) {
                          const evaluatedFn = eval('(' + onBlur + ')')

                          evaluatedFn(e)
                        }
                      }}
                    />
                    <label htmlFor={option.Id}>{lable.map(ele => option[ele]).join('-')}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (input.type == 'ManyToMany' && input.descriptionAr == 'multiple_select') {
    const lable = JSON.parse(input?.descriptionEn)

    return (
      <Autocomplete
        multiple
        value={value}
        onChange={(event, newValue) => onChange(event, newValue)}
        sx={{ width: 325 }}
        options={selectedOptions}
        disabled={isDisable == 'disabled'}
        filterSelectedOptions
        id='autocomplete-multiple-outlined'
        getOptionLabel={option => option[lable[0]] || ''}
        renderInput={params => <TextField {...params} style={{ width: '100%' }} placeholder={placeholder} />}
      />
    )
  }
  if (input.type == 'ManyToMany') {
    const lable = JSON.parse(input?.descriptionEn)

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
                {lable.map(ele => option[ele]).join('-')}
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default ViewInput
