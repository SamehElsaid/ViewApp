/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react'
import CssEditor from './CssEditor'
import { DefaultStyle } from 'src/Components/_Shared'
import { BsPaperclip, BsTrash } from 'react-icons/bs'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { FaCalendarAlt } from 'react-icons/fa'

const CssEditorView = ({ data, locale, defaultValue, type, readOnly }) => {
  const [fileNames, setFileNames] = useState([])
  const [startDate, setStartDate] = useState(new Date())

  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div className='relative w-full'>
      <input className='!ps-[35px] relative ' onClick={onClick} ref={ref} value={value} />
      <div className='absolute top-[0] start-[10px]  w-[20px] h-[100%] flex items-center justify-center z-10'>
        <span className='' id='calendar-icon'>
          <FaCalendarAlt className='text-xl' />
        </span>
      </div>
    </div>
  ))

  const handleChange = useCallback(e => {
    const files = e.target.files
    const names = Array.from(files).map(file => file.name)
    setFileNames(prevNames => [...prevNames, ...names]) // Add new files to the existing list
  }, [])

  // Handle file deletion
  const handleDelete = useCallback((index, e) => {
    e.stopPropagation()
    setTimeout(() => {
      setFileNames(prevNames => prevNames.filter((_, i) => i !== index)) // Remove the file at the specified index
    }, 0)
  }, [])

  const inputElement = useMemo(() => {
    return type === 'textarea' ? (
      <textarea
        id={data.key ?? new Date().getTime()}
        rows={data.rows || 5}
        style={{
          transition: '0.3s'
        }}
        placeholder={
          locale === 'ar' ? data.placeholderAr || 'الحقل بالعربية' : data.placeholderEn || 'The field in English'
        }
      />
    ) : type === 'checkbox' ? (
      <div id='view-input-in-form-engine'>
        <input type='checkbox' id='fruit1' name='fruit-1' value='Apple' />
        <label htmlFor='fruit1'>Apple</label>
        <input type='checkbox' id='fruit3' name='fruit-3' value='Cherry' checked />
        <label htmlFor='fruit3'>Cherry</label>
        <input type='checkbox' id='fruit4' name='fruit-4' value='Strawberry' />
        <label htmlFor='fruit4'>Strawberry</label>
      </div>
    ) : type === 'radio' ? (
      <div id='view-input-in-form-engine'>
        <input type='radio' id='fruit1' name='fruit' value='Apple' />
        <label htmlFor='fruit1'>Apple</label>
        <input type='radio' id='fruit3' name='fruit' checked value='Cherry' />
        <label htmlFor='fruit3'>Cherry</label>
        <input type='radio' id='fruit4' name='fruit' value='Strawberry' />
        <label htmlFor='fruit4'>Strawberry</label>
      </div>
    ) : type === 'select' ? (
      <div id='custom-select'>
        <select>
          <option value='apple'>Apple</option>
          <option value='cherry'>Cherry</option>
          <option value='strawberry'>Strawberry</option>
        </select>
      </div>
    ) : type === 'date' ? (
      <div style={{ width: '100%' }} className='mainParent-date'>
        {readOnly ? (
          <DatePickerWrapper>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              timeInputLabel='Time:'
              dateFormat={`${data.format ? data.format : 'MM/dd/yyyy'}`}
              showMonthDropdown
              showYearDropdown
              showTimeInput={data.showTime === 'true'}
              customInput={<ExampleCustomInput className='example-custom-input' />}
            />
          </DatePickerWrapper>
        ) : (
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            timeInputLabel='Time:'
            dateFormat={`${data.format ? data.format : 'MM/dd/yyyy'}`}
            showMonthDropdown
            showYearDropdown
            showTimeInput={data.showTime === 'true'}
            customInput={<ExampleCustomInput className='example-custom-input' />}
          />
        )}
      </div>
    ) : type === 'file' ? (
      <div id='file-upload-container'>
        <label htmlFor='file-upload-input' id='file-upload-label'>
          <div id='label-color'>
            {defaultValue(
              data,
              locale === 'ar' ? 'labelAr' : 'labelEn',
              locale === 'ar' ? 'الحقل بالعربية' : 'The field in English'
            )}
          </div>
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
              <span className='font-semibold'>{locale === 'ar' ? 'اضف الصورة' : 'Add Image'} </span>
              {locale === 'ar' ? 'أو اسحب وأفلت' : 'or drag and drop'}
            </p>
            <p id='file-upload-subtext'>
              {locale === 'ar' ? 'SVG, PNG, JPG or GIF (MAX. 800x400px)' : 'SVG, PNG, JPG or GIF (MAX. 800x400px)'}
            </p>
            {fileNames.length !== 0 && (
              <div className='flex flex-col gap-1 p-2 mt-5 rounded-md shadow-inner shadow-gray-300 file-names-container'>
                {fileNames.map((name, index) => (
                  <div key={index} className='flex gap-3 items-center file-name-item'>
                    <span className='flex gap-1 items-center file-name w-[calc(100%-25px)]'>
                      <BsPaperclip className='text-xl text-main-color' />
                      <span className='flex-1'>{name}</span>
                    </span>
                    <button
                      className='delete-button w-[25px] h-[25px] bg-red-500/70 rounded-full text-white hover:bg-red-500/90 transition-all duration-300 flex items-center justify-center'
                      onClick={e => handleDelete(index, e)} // Handle delete action
                    >
                      <BsTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type='file'
            id='file-upload-input'
            onChange={handleChange}
            multiple // Allow multiple files
          />
        </label>
      </div>
    ) : (
      <input
        id={data.key ?? new Date().getTime()}
        type={data.type ?? 'text'}
        style={{
          transition: '0.3s'
        }}
        placeholder={
          locale === 'ar' ? data.placeholderAr || 'الحقل بالعربية' : data.placeholderEn || 'The field in English'
        }
      />
    )
  }, [
    type,
    data.key,
    data.rows,
    data.placeholderAr,
    data.placeholderEn,
    data.type,
    locale,
    fileNames,
    readOnly,
    handleChange,
    handleDelete,
    defaultValue
  ])

  const label = useMemo(() => {
    return (
      type !== 'file' && (
        <label htmlFor={data.key ?? new Date().getTime()} id='first-label'>
          {defaultValue(
            data,
            locale === 'ar' ? 'labelAr' : 'labelEn',
            locale === 'ar' ? 'الحقل بالعربية' : 'The field in English'
          )}
        </label>
      )
    )
  }, [data, defaultValue, locale, type])

  return (
    <div className='reset' id={`s${new Date().getTime()}`}>
      <div>{label}</div>
      <style>{`#s${new Date().getTime()} {
    ${data?.css || DefaultStyle(type)}
  }`}</style>
      <div className='relative' style={{ display: 'flex' }}>
        {inputElement}
      </div>
    </div>
  )
}

export default function ViewInputInFormEngine({ data, locale, defaultValue, onChange, advancedEdit, type, readOnly }) {
  return (
    <div className='flex flex-col gap-2 w-full h-full'>
      <CssEditorView data={data} locale={locale} defaultValue={defaultValue} type={type} readOnly={readOnly} />
      <div className='text-blue-500'>
        {advancedEdit && (
          <div className='overflow-scroll w-full h-full'>
            <h2 className='text-xl font-bold text-main-color'>
              {locale === 'ar' ? 'محرر CSS للحقل' : 'CSS Editor For Input'}
            </h2>
            <CssEditor data={data} onChange={onChange} type={type} />
          </div>
        )}
      </div>
    </div>
  )
}
