import { useIntl } from 'react-intl'
import { axiosGet } from '../axiosCall'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { Button, Dialog, DialogContent, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'

function NewElement({
  input,
  onBlur,
  value,
  setValue,
  roles,
  onChangeEvent,
  disabledBtn,
  isDisable,
  readOnly,
  handleSubmit
}) {
  const [open, setOpen] = useState(false)
  const { locale, messages } = useIntl()
  const [loadingButton, setLoadingButton] = useState(false)
  const buttonRef = useRef(null)

  const handleValidationChanges = e => {
    setValue('checked')
  }

  const handleCheckboxChange = e => {
    if (roles?.onMount?.href) {
      window.open(roles?.onMount?.href, '_blank')
    }
    try {
      if (onChangeEvent) {
        const evaluatedFn = eval('(' + onChangeEvent + ')')

        evaluatedFn(e)
      }
    } catch {}
    if (e.target.checked) {
      if (roles?.onMount?.file) {
        const file = roles?.onMount?.file.replaceAll('/Uploads/', '')
        axiosGet(`file/download/${file}`).then(res => {
          const url = window.URL.createObjectURL(new Blob([res.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', file)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        })
      }
    }
    setValue(prev => !prev)
  }

  const handleClick = e => {
    setValue('checked')
    if (roles?.onMount?.print) {
      window.print()
    }
    if (roles?.onMount?.file) {
      const fileUrl = roles?.onMount?.file.replace('/Uploads/', process.env.API_URL + '/file/download/') // Replace with your file URL

      // Create an anchor element
      const link = document.createElement('a')
      link.href = fileUrl

      // Set the download attribute (optional: specify a custom filename)
      link.download = 'custom-filename.pdf' // Replace with desired filename

      // Append the anchor to the body (required for Firefox)
      document.body.appendChild(link)

      // Programmatically click the anchor to trigger the download
      link.click()

      // Remove the anchor from the document
      document.body.removeChild(link)
    }

    try {
      if (onChangeEvent) {
        const evaluatedFn = eval('(' + onChangeEvent + ')')
        evaluatedFn(e)
      }
    } catch (err) {
      console.log(err)
    }
    console.log(roles, 'roles')
    if (roles?.externalApiUrl) {
      handleSubmit(e, roles?.externalApiUrl)
    }
  }

  function isValidURL(str) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i'
    )

    return !!pattern.test(str)
  }

  if (input.key === 'check_box') {
    return (
      <div>
        <input
          name={input.name_en}
          type='checkbox'
          checked={value}
          onChange={handleCheckboxChange}
          id={input.id}
          onBlur={e => {
            if (onBlur) {
              const evaluatedFn = eval('(' + onBlur + ')')

              evaluatedFn(e)
            }
          }}
        />
        <label htmlFor={input.id}>{input[`name_${locale}`]}</label>
      </div>
    )
  }
  if (input.key === 'tabs') {
    return (
      <div className='flex flex-wrap w-full parent-tabs'>
        {input.data.map((item, index) =>
          isValidURL(item.link) ? (
            <a
              onClick={handleValidationChanges}
              key={index}
              href={item.link}
              target='_blank'
              rel='noopener noreferrer'
              className={`btn-tabs ${item.active ? 'active' : ''}`}
            >
              {item[`name_${locale}`]}
            </a>
          ) : item.link ? (
            <Link
              onClick={handleValidationChanges}
              href={`/${locale}/${item.link.replace(/^\/+/, '')}`}
              className={`btn-tabs ${item.active ? 'active' : ''}`}
            >
              {item[`name_${locale}`]}
            </Link>
          ) : (
            <button
              onClick={handleValidationChanges}
              key={index}
              type='button'
              className={`btn-tabs ${item.active ? 'active' : ''}`}
            >
              {item[`name_${locale}`]}
            </button>
          )
        )}
      </div>
    )
  }
  if (input.key === 'text_content') {
    return <div className='text-element'>{input[`name_${locale}`]}</div>
  }
  if (input.key === 'button') {
    if (isValidURL(roles?.onMount?.href)) {
      return (
        <div className='w-full'>
          <a
            href={roles?.onMount?.href}
            className={`btn ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block text-center`}
            onClick={handleClick}
            target='_blank'
            rel='noopener noreferrer'
            disabled={isDisable === 'disable'}
          >
            {input[`name_${locale}`]}
          </a>
        </div>
      )
    }
    if (roles?.onMount?.href) {
      return (
        <div className='w-full'>
          <Link
            href={`/${locale}${roles?.onMount?.href}`}
            className={`btn block text-center  ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block`}
            onClick={handleClick}
            disabled={isDisable === 'disable'}
          >
            {input[`name_${locale}`]}
          </Link>
        </div>
      )
    }

    if (input.kind === 'submit') {
      return (
        <>
          {input?.[locale === 'ar' ? 'warningMessageAr' : 'warningMessageEn'] && (
            <Dialog
              open={Boolean(open)}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
              onClose={() => {
                setOpen(false)
              }}
            >
              <DialogContent>
                <div className='flex flex-col gap-5 justify-center items-center px-1 py-5'>
                  <Typography variant='body1' className='!text-lg' id='alert-dialog-description'>
                    {input?.[locale === 'ar' ? 'warningMessageAr' : 'warningMessageEn']}
                  </Typography>
                  <div className='flex gap-5 justify-between items-end'>
                    <LoadingButton
                      variant='contained'
                      color='primary'
                      type='submit'
                      loading={loadingButton}
                      onClick={e => {
                        handleClick(e)
                        buttonRef.current.type = 'submit'
                        setTimeout(() => {
                          buttonRef.current.click()
                          buttonRef.current.type = 'button'
                          setOpen(false)
                        }, 0)
                      }}
                    >
                      {messages.dialogs.submit}
                    </LoadingButton>
                    <Button color='secondary' variant='contained' onClick={() => setOpen(false)}>
                      {messages.dialogs.cancel}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <button
            ref={buttonRef}
            onClick={e => {
              if (input?.[locale === 'ar' ? 'warningMessageAr' : 'warningMessageEn']) {
                if (!open) {
                  setOpen(true)
                }
              } else {
                handleClick(e)
              }
            }}
            type={input?.[locale === 'ar' ? 'warningMessageAr' : 'warningMessageEn'] ? 'button' : 'submit'}
            className='btn'
            disabled={disabledBtn}
          >
            {input[`name_${locale}`]}
          </button>
        </>
      )
    }

    console.log(roles, 'roles')

    return (
      <button
        disabled={isDisable === 'disable'}
        onClick={handleClick}
        type='button'
        className={`btn ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block `}
      >
        {input[`name_${locale}`]}s
      </button>
    )
  }
}

export default NewElement
