import { useIntl } from 'react-intl'
import { axiosGet } from '../axiosCall'
import Link from 'next/link'
import { useRef, useState, useEffect, forwardRef } from 'react'
import { Button, Dialog, DialogContent, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import jsPDF from 'jspdf'
import { useReactToPrint } from 'react-to-print'
import PrintContent from '../PrintContent'
import { usePDF } from 'react-to-pdf'
import { toast } from 'react-toastify'

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
  handleSubmit,
  dataRef,
  data,
  refError,
  setTriggerData,
  typeOfSubmit,
  allFields = []
}) {
  const [open, setOpen] = useState(false)
  const { locale, messages } = useIntl()
  const [loadingButton, setLoadingButton] = useState(false)
  const buttonRef = useRef(null)
  const componentRef = useRef()
  const [printData, setPrintData] = useState({ inputsWithValues: [], pages: [], inputsOrder: [], customCSS: '' })


  const { toPDF, targetRef } = usePDF({
    filename: input.name_en + 'form.pdf',
    page: {
      orientation: 'portrait',
      format: 'a4',
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    method: 'save',
    resolution: 2,
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1
    }
  })

  const handlePrint = useReactToPrint({
    contentRef: componentRef, pageStyle: `@media print {
      @page {
         size: 1.5in 4in
               margin: 0;
      }
    }`,

  })

  const [activeIndex, setActiveIndex] = useState(Math.max(0, input?.data?.findIndex(t => t.active) || 0))

  // Keep active tab in sync with input.data when using tabs
  useEffect(() => {
    if (input?.key !== 'tabs') return
    try {
      const list = Array.isArray(input?.data) ? input.data : []
      const idx = list.findIndex(t => t && t.active)
      if (idx >= 0) {
        if (idx !== activeIndex) {
          setActiveIndex(idx)
          setValue(idx)
          if (setTriggerData) {
            setTriggerData(prev => prev + 1)
          }
        }
      } else {
        if (activeIndex !== 0) {
          setActiveIndex(0)
          setValue(0)
          if (setTriggerData) {
            setTriggerData(prev => prev + 1)
          }
        }
      }
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input?.key, JSON.stringify(input?.data || [])])

  useEffect(() => {
    try {
      setValue(activeIndex)
      if (setTriggerData) {
        setTriggerData(prev => prev + 1)
      }
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generatePDF = (inputsWithValues = [], lang = 'ar', pages = []) => {
    const doc = new jsPDF()

    const boxWidth = 180
    const x = 15
    const pageHeight = 297 // A4 height in mm
    const marginTop = 20
    const lineSpacing = 6 // ارتفاع كل سطر

    let y = marginTop

    // 1️⃣ رسم inputsWithValues
    if (inputsWithValues?.length) {
      inputsWithValues.forEach(item => {
        const label = lang === 'ar' ? item.nameAr || item.name_ar : item.nameEn || item.name_en
        const value = String(item.value ?? '')

        // تقسيم النصوص الطويلة على عدة أسطر
        const valueLines = doc.splitTextToSize(value, boxWidth - 4) // 4px padding
        const boxHeight = 12 + valueLines.length * lineSpacing // 12px للعنوان + نص

        // صفحة جديدة إذا تجاوزنا الحد
        if (y + boxHeight + 10 > pageHeight - 20) {
          doc.addPage()
          y = marginTop
        }

        // رسم البوكس
        doc.setDrawColor(0)
        doc.rect(x, y, boxWidth, boxHeight)

        // العنوان
        doc.setFontSize(11)
        doc.text(label, x + boxWidth / 2, y + 8, { align: 'center' })

        // خط فاصل
        doc.line(x, y + 12, x + boxWidth, y + 12)

        // القيمة
        doc.setFontSize(14)
        doc.text(valueLines, x + boxWidth / 2, y + 20, { align: 'center' })

        y += boxHeight + 10
      })
    }

    // 2️⃣ رسم pages بشكل ديناميكي
    if (pages?.length) {
      pages.forEach((page, index) => {
        doc.addPage() // صفحة جديدة لكل content
        let contentHTML = page.content

        // استبدال placeholders بالقيم الفعلية لو موجودة
        if (page.placeholders) {
          Object.keys(page.placeholders).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g')
            contentHTML = contentHTML.replace(regex, page.placeholders[key] || '')
          })
        }

        doc.html(contentHTML, {
          x: x,
          y: marginTop,
          width: boxWidth,
          html2canvas: { scale: 0.5 },
          callback: function (doc) {
            if (index === pages.length - 1) {
              doc.save('form.pdf')
            }
          }
        })
      })
    } else {
      // لو مفيش pages، نرجع حفظ مباشرة
      doc.save('form.pdf')
    }
  }

  // Compute visible tabs with original index and disabled flag at top-level
  const visibleTabs = (input?.key === 'tabs' ? input.data || [] : [])
    .map((item, idx) => {
      let isVisible = true
      const mode = item?.visibilityMode || 'enable'
      if (mode === 'conditional') {
        if (typeof item.visibilityCondition === 'string' && item.visibilityCondition.trim()) {
          try {
            const fn = eval('(' + item.visibilityCondition + ')')
            if (typeof fn === 'function') {
              isVisible = !!fn({ data: dataRef?.current })
            }
          } catch (_) {
            isVisible = true
          }
        }
      }

      return { item, originalIndex: idx, isVisible, isDisabled: mode === 'disable' }
    })
    .filter(t => t.isVisible)

  // Ensure activeIndex points to a visible tab
  useEffect(() => {
    if (input?.key !== 'tabs') return
    try {
      const stillVisible = visibleTabs.some(t => t.originalIndex === activeIndex)
      if (!stillVisible) {
        const firstVisible = visibleTabs[0]?.originalIndex ?? 0
        setActiveIndex(firstVisible)
        setValue(firstVisible)
        if (setTriggerData) setTriggerData(prev => prev + 1)
      }
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input?.key, JSON.stringify(visibleTabs.map(v => ({ i: v.originalIndex, v: v.isVisible }))), activeIndex])

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

  const isConditionSatisfied = () => {
    const trig = roles?.trigger
    if (!trig || !trig?.typeOfValidation || !trig?.selectedField) return true

    const selectedValue = dataRef?.current?.[trig.selectedField]
    const compare = v => (trig?.isEqual === 'equal' ? v == trig?.mainValue : v != trig?.mainValue)

    // For button gating, treat 'optional' and 'enable' as conditions to allow click
    if (trig.typeOfValidation === 'optional' || trig.typeOfValidation === 'enable') {
      return compare(selectedValue)
    }

    // Other trigger types default to allow
    return true
  }

  const handleClick = e => {
    setValue('checked')
    if (roles?.type === 'print') {
      const inputsWithValues = []
      if (roles?.print?.includeInputs) {
        Object.entries(dataRef.current).forEach(([key, value]) => {
          const field = allFields.find(item => item.key === key)

          if (field) {
            inputsWithValues.push({
              ...field,
              value
            })
          }
        })
      }

      setPrintData({ inputsWithValues, pages: roles.print?.pages || [], inputsOrder: roles.print?.inputsOrder || [], customCSS: roles.print?.customCSS || '', selectedBorder: roles.print?.selectedBorder || null, customBorderCSS: roles.print?.customBorderCSS || '' })
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
    if (roles?.type === 'submit') {
      handleSubmit(e, handleSubmitEvent)
    } else {
      handleSubmitEvent()
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
    const onTabClick = index => {
      setActiveIndex(index)
      const selectedValue = index
      setValue(selectedValue)
      try {
        if (setTriggerData) {
          setTriggerData(prev => prev + 1)
        }
      } catch (_) { }
      try {
        if (onChangeEvent) {
          const evaluatedFn = eval('(' + onChangeEvent + ')')
          evaluatedFn({ type: 'tabChange', index })
        }
      } catch { }
    }

    // Determine if Next should be disabled based on assigned fields' errors or an optional per-tab condition
    const isNextDisabled = (() => {
      try {
        const tabsElement = (data?.addMoreElement || []).find(ele => ele.id === input.id)
        const currentTab = tabsElement?.data?.[activeIndex] || {}
        if (currentTab.nextCondition && typeof currentTab.nextCondition === 'string') {
          try {
            const fn = eval('(' + currentTab.nextCondition + ')')
            if (typeof fn === 'function') {
              return !fn({ data: dataRef?.current })
            }
          } catch (_) { }
        }
        const assigned = Array.isArray(currentTab.fields) ? currentTab.fields : []
        if (!assigned.length) return false

        return assigned.some(fid => Array.isArray(refError?.current?.[fid]) && refError.current[fid].length > 0)
      } catch (_) {
        return false
      }
    })()

    const controlsPlacement = input?.controls?.placement || 'bottom' // 'top' | 'bottom'
    const controlsAlign = input?.controls?.align || 'start' // 'start' | 'center' | 'end'

    // Find current tab position in visible tabs
    const currentVisibleTabIndex = visibleTabs.findIndex(t => t.originalIndex === activeIndex)
    const previousVisibleTab = currentVisibleTabIndex > 0 ? visibleTabs[currentVisibleTabIndex - 1] : null

    const nextVisibleTab =
      currentVisibleTabIndex >= 0 && currentVisibleTabIndex < visibleTabs.length - 1
        ? visibleTabs[currentVisibleTabIndex + 1]
        : null

    const Controls = () => (
      <div
        className={`flex items-center gap-3 ${controlsAlign === 'center' ? 'justify-center' : controlsAlign === 'end' ? 'justify-end' : 'justify-start'
          }`}
      >
        <button
          type='button'
          className='px-4 py-1.5 rounded text-sm border border-main-color text-main-color hover:bg-main-color/5 disabled:opacity-40 shadow'
          onClick={() => previousVisibleTab && onTabClick(previousVisibleTab.originalIndex)}
          disabled={!previousVisibleTab}
        >
          {messages?.dialogs?.previous || 'Previous'}
        </button>
        <button
          type='button'
          className='px-4 py-1.5 rounded text-sm bg-main-color text-white hover:bg-main-color/90 disabled:opacity-40 shadow'
          onClick={() => nextVisibleTab && onTabClick(nextVisibleTab.originalIndex)}
          disabled={!nextVisibleTab || isNextDisabled}
        >
          {messages?.dialogs?.next || 'Next'}
        </button>
      </div>
    )

    // visibleTabs computed at top-level

    // visibility guard handled in top-level effect

    return (
      <div className='flex flex-col w-full gap-2'>
        {controlsPlacement === 'top' && <Controls />}
        <div className='flex flex-wrap w-full parent-tabs'>
          {visibleTabs.map(({ item, originalIndex, isDisabled }) => (
            <button
              key={originalIndex}
              type='button'
              className={`btn-tabs ${originalIndex === activeIndex ? 'active' : ''}`}
              onClick={() => !isDisabled && onTabClick(originalIndex)}
              disabled={isDisabled}
            >
              {item[`name_${locale}`]}
            </button>
          ))}
        </div>
        {controlsPlacement === 'bottom' && <Controls />}
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
          <div className='w-full'>
            <a
              href={roles?.onMount?.href}
              className={`btn ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block text-center`}
              onClick={e => {
                handleClick(e)
              }}
              target='_blank'
              rel='noopener noreferrer'
              disabled={isDisable === 'disable'}
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
          <div className='w-full'>
            <Link
              href={`/${locale}${roles?.onMount?.href}`}
              className={`btn block text-center  ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block`}
              onClick={e => {
                handleClick(e)
              }}
              disabled={isDisable === 'disable'}
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
              disabled={disabledBtn}
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
            <div ref={targetRef} className='print-container'>
              <PrintContent printData={printData} />
            </div>
          )}
        </div>
        <button
          disabled={isDisable === 'disable'}
          onClick={e => {
            handleClick(e)
            const loadingToast = toast.loading('Generating PDF...')
            setTimeout(() => {
              try {
                toPDF()
              } finally {
                toast.dismiss(loadingToast)
              }
            }, 500)
          }}
          type='button'
          className={`btn ${isDisable === 'hide' ? (readOnly ? '' : 'hidden') : ''} block `}
        >
          {input[`name_${locale}`]}
        </button>
      </>
    )
  }
}

export default NewElement
