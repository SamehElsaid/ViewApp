import { useIntl } from 'react-intl'
import { axiosGet } from '../axiosCall'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { Button, Dialog, DialogContent, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useReactToPrint } from 'react-to-print'
import PrintContent from '../PrintContent'
import { usePDF } from 'react-to-pdf'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

function NewElement({
  activeTab,
  input,
  editMode,
  onBlur,
  value,
  setValue,
  roles,
  onChangeEvent,
  disabledBtn,
  isDisable,
  readOnly,
  tabsData,
  handleSubmit,
  dataRef,
  data,
  refError,
  setTriggerData,
  typeOfSubmit,
  allFields = [],
  setActiveTab,
  allSortData = [],
  sortedLoopWithoutTabs = [],
  saveAsDraft
}) {
  const [open, setOpen] = useState(false)
  const { locale, messages } = useIntl()
  const [loadingButton, setLoadingButton] = useState(false)
  const buttonRef = useRef(null)
  const componentRef = useRef()
  const [printData, setPrintData] = useState({ inputsWithValues: [], pages: [], inputsOrder: [], customCSS: '' })




  const handlePrint = useReactToPrint({
    contentRef: componentRef, pageStyle: `@media print {
      @page {
         size: 1.5in 4in
               margin: 0;
      }
    }`,

  })



  useEffect(() => {
    try {
      if (setTriggerData) {
        setTriggerData(prev => prev + 1)
      }
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])




  const handleCheckboxChange = e => {
    if (roles?.onMount?.href) {
      window.open(roles?.onMount?.href, '_blank')
    }

    try {
      if (onChangeEvent) {
        const evaluatedFn = eval('(' + onChangeEvent + ')')

        evaluatedFn(e)
      }
    } catch { }
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


  const route = useRouter()

  const getQueryString = () => {
    const url = new URL(route.asPath, window.location.origin)

    return url.search // دي بترجع "?name=ahmed&age=25"
  }



  const handleClick = e => {

    if (roles?.type === 'saveAsDraft') {
      saveAsDraft(e)

      return
    }

    if (roles?.type === 'print_page' && roles?.href) {

      saveAsDraft(e, roles?.href)

      return
    }
    if (roles?.href) {
      route.push(`/${locale}/${roles?.href}${getQueryString() ? getQueryString() + "&" : '?'}isPrint=true`);
    } else {




      setValue('checked')
      if (roles?.type === 'print') {
        const inputsWithValues = []
        if (roles?.print?.includeInputs) {

          const allSumbitData = { ...tabsData, ...dataRef.current }

          allFields.forEach(item => {
            inputsWithValues.push({
              ...item,
              value: allSumbitData[item.key]
            })
          })
        }

        setPrintData({
          inputsWithValues,
          pages: roles.print?.pages || [],
          inputsOrder: roles.print?.inputsOrder || [],
          inputsVisibility: roles.print?.inputsVisibility || {},
          customCSS: roles.print?.customCSS || '',
          selectedBorder: roles.print?.selectedBorder || null,
          customBorderCSS: roles.print?.customBorderCSS || ''
        })
        setTimeout(() => {
          handlePrint()
        }, 0)
        setTimeout(() => {
          setPrintData({ inputsWithValues: [], pages: [], inputsOrder: [], customCSS: '' })
        }, 500)

        return
      }
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

      const handleSubmitEvent = () => {
        try {
          if (onChangeEvent) {
            const evaluatedFn = eval('(' + onChangeEvent + ')')
            evaluatedFn(e)
          }
        } catch (err) {
          console.log(err)
        }
      }

      if (input?.kind === 'submit') {
        handleSubmit(e, handleSubmitEvent)
      } else {
        handleSubmitEvent()
      }
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
          disabled={isDisable === 'disabled'}
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
    // visibility guard handled in top-level effect


    const tabsData = data?.addMoreElement?.find(ele => ele.key === 'tabs')?.data ?? [];

    return (
      <div className='flex flex-col w-full gap-2'>
        <div className='flex flex-wrap w-full parent-tabs'>
          {tabsData.map((tab, originalIndex) => (
            <button
              key={originalIndex}
              type='button'
              onClick={() => {
                if (editMode) {
                  setActiveTab(originalIndex)
                }
              }}
              className={`btn-tabs ${originalIndex === activeTab ? 'active' : ''}`}

            >
              {tab[`name_${locale}`]}
            </button>
          ))}
        </div>
      </div>
    )
  }
  if (input.key === 'text_content') {
    return <div className='text-element'>{input[`name_${locale}`]}</div>
  }
  if (input.key === 'button') {
    if (isValidURL(roles?.onMount?.href)) {
      return (
        <>

          <div className='w-full relative'>
            {isDisable === 'disabled' &&
              <div className='w-full absolute  inset-0  z-10'>
              </div>
            }

            <a
              href={isDisable === 'disabled' ? '#' : roles?.onMount?.href}
              className={`btn ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block text-center ${isDisable === 'disabled' ? 'opacity-50 !cursor-not-allowed' : ''}`}
              onClick={e => {
                if (isDisable === 'disabled') {
                  return
                }
                handleClick(e)
              }}
              target='_blank'
              rel='noopener noreferrer'
              disabled={isDisable === 'disabled'}
            >
              {input[`name_${locale}`]}
            </a>
          </div>
        </>
      )
    }
    if (roles?.onMount?.href) {
      return (
        <>
          <div className='w-full relative'>
            {isDisable === 'disabled' &&
              <div className='w-full absolute  inset-0  z-10'>
              </div>
            }
            <Link

              href={isDisable === 'disabled' ? '#' : `/${locale}${roles?.onMount?.href}`}
              className={`btn block text-center  ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block ${isDisable === 'disabled' ? 'opacity-50 !cursor-not-allowed' : ''}`}
              onClick={e => {
                if (isDisable === 'disabled') {
                  return
                }
                handleClick(e)
              }}
              disabled={isDisable === 'disabled'}
            >
              {input[`name_${locale}`]}
            </Link>
          </div>
        </>
      )
    }

    if (input.kind === 'submit') {
      return (
        typeOfSubmit !== 'read-only' && (
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
                handleClick(e)
                if (input?.[locale === 'ar' ? 'warningMessageAr' : 'warningMessageEn']) {
                  if (!open) {
                    setOpen(true)
                  }
                }
              }}
              type={input?.[locale === 'ar' ? 'warningMessageAr' : 'warningMessageEn'] ? 'button' : 'submit'}
              className='btn'
              disabled={disabledBtn || isDisable === 'disabled'}
            >
              {input[`name_${locale}`]}
            </button>
          </>
        )
      )
    }





    return (
      <>
        <div className=' fixed  inset-0 z-[-1] opacity-0 overflow-hidden top-0 start-0'>
          {roles?.type === 'print' && (printData.inputsWithValues?.length > 0 || printData.pages?.length > 0) && (
            <div ref={componentRef} className='print-container'>
              <PrintContent printData={printData} data={data} allSortData={allSortData} />
            </div>
          )}
        </div>
        <button
          disabled={isDisable === 'disable' || (input.kind === 'back' && activeTab === 0)}
          onClick={e => {
            if (input.kind === 'back') {
              setActiveTab(prev => prev - 1);

              return
            }
            handleClick(e)
            if (roles?.type === 'print') {
              const loadingToast = toast.loading('Generating PDF...')
              setTimeout(async () => {
                try {
                  handlePrint()
                } catch (err) {
                  console.error(err)
                  toast.error('PDF generation failed')
                } finally {
                }
              }, 500)
              toast.dismiss(loadingToast)
            }
          }}
          type={'button'}
          className={`btn ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block `}
        >
          {input[`name_${locale}`]}
        </button>
      </>
    )
  }
}

export default NewElement
