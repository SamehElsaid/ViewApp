/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import DisplayField from './PageCreation/DisplayField'
import { seterrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { IoMdSettings } from 'react-icons/io'
import { useIntl } from 'react-intl'
import { CircularProgress } from '@mui/material'

function ViewInputInTable({
  loadingAssociationsInput,
  associationsDataInput,
  refErrorFromTable,
  ele,
  row,
  allData,
  readOnly,
  disabled,
  data,
  onChange,
  setTriggerData,
  dataRef,
  getDesign,
  triggerData,
  setOpen,
  allErrorsRef,
  setChangedValue,
  formTable,
  columnId,
  reloadErrors,
  currentData
}) {
  const refError = useRef({})
  const [reload, setReload] = useState(0)
  const dispatch = useDispatch()
  const [findError, setFindError] = useState(false)
  const { locale } = useIntl()


  console.log(row?.[ele?.key],row.Id,data.newRows,dataRef,ele.key, "associationsDataInputassociationsDataInput");
  useEffect(() => {
    if (document.getElementById(`btn-actions-${data.collectionId}`)) {
      document.getElementById(`btn-actions-${data.collectionId}`).addEventListener('click', () => {
        const key = ele.type === 'new_element' ? ele.id : ele.key
        dispatch(seterrorInAllRowData({ row, key, error: refError.current[key] }))
      })
    }
  }, [])

  let roles = data?.additional_fields?.find(el => el.key === ele.id)?.roles
  let rowValidation = data?.rowValidation?.find(el => el.key === ele.id && el.rowId === columnId)?.roles

  const newRoles = { ...roles }

  if (columnId) {
    if (newRoles?.triggerRow?.rowId === columnId) {
      newRoles.trigger = newRoles?.triggerRow
    }
    if (newRoles?.OnMountTriggerRow?.rowId === columnId) {
      newRoles.onMount = newRoles?.OnMountTriggerRow
    }
  }
  useEffect(() => {
    const error = allErrorsRef.current[ele.type === 'new_element' ? ele.id : ele.key + '_' + columnId]
    if (error) {
      setFindError(error)
    }

  }, [reloadErrors])








  return (
    <div
      key={columnId + ele.key + "inputView"}
      tabIndex={0}
      onClick={() => {
        setFindError(false)
      }}
      className='relative w-full'
      onBlur={() => {

        console.log(dataRef, "dataRefdataRefdataRef");

        setChangedValue(prev => {
          const newPrev = [...prev]

          const findWithId = newPrev.find(e => e.Id === row.Id)
          if (findWithId) {
            findWithId[ele.key] = dataRef.current[ele.key]
          } else {
            newPrev.push({ [ele.key]: dataRef.current[ele.key] })
          }

          return newPrev
        })
        const newPrev = [...(data?.newRows || [])]

        const index = newPrev.findIndex(
          e => e.Id === row.Id && row.Id !== undefined
        )

        if (index !== -1) {
          newPrev[index][ele.key] = dataRef.current[ele.key]
        }



        const cleanObject = (obj) =>
          Object.fromEntries(
            Object.entries(obj).filter(([key]) => !key.startsWith('undefined'))
          )

        const cleanArray = (arr) =>
          arr.map(item => cleanObject(item))

        // 👇 بعد ما خلصت التعديلات على newPrev
        const cleanedNewPrev = cleanArray(newPrev)




        onChange({
          ...data,
          newRows: cleanedNewPrev
        })

      }}
    >
      {!readOnly && formTable === 'table' && (
        <div
          onContextMenu={e => {
            e.preventDefault()
          }}
          className='absolute inset-0 z-20'
        ></div>
      )}
      <div className="flex items-center gap-2">

        {!readOnly && (
          <button
            type='button'
            title={locale !== 'ar' ? 'Setting' : 'التحكم'}
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={e => {
              e.stopPropagation()

              setOpen({ ...ele, rowId: columnId })
            }}
            className='w-[30px] || h-[30px] z-20 relative hover:bg-main-color hover:text-white duration-200 || rounded-lg || shadow-2xl text-xl flex || items-center justify-center bg-white border-main-color border'
          >
            <IoMdSettings />
          </button>
        )}
        {loadingAssociationsInput && ele.fieldCategory == 'Associations' && (
          <div className='absolute inset-0 z-20 flex justify-center items-center bg-white'>
            <CircularProgress />
          </div>
        )}
        <DisplayField
          input={ele}
          key={row.index}
          findValue={row?.[ele?.key]}
          design={getDesign(ele.key, ele)}
          readOnly={disabled}
          disabledBtn={!data.type_of_sumbit || (data.type_of_sumbit === 'api' && !data.submitApi)}
          refError={refError}
          refErrorFromTable={refErrorFromTable}
          allErrorsRef={allErrorsRef}
          columnId={columnId}
          setLayout={false}
          triggerData={triggerData}
          from='table'
          dirtyProps={true}
          data={data}
          layout={false}
          onChangeData={onChange}
          dataRef={dataRef}
          setTriggerData={setTriggerData}
          roles={
            rowValidation ?? newRoles ?? {
              onMount: { type: '', value: '' },
              placeholder: {
                placeholder_ar: '',
                placeholder_en: ''
              },
              hover: {
                hover_ar: '',
                hover_en: ''
              },
              hint: {
                hint_ar: '',
                hint_en: ''
              },
              size: '',
              trigger: {
                selectedField: null,
                triggerKey: null,
                typeOfValidation: null,
                isEqual: 'equal',
                currentField: 'Id',
                mainValue: '',
                parentKey: ''
              },
              event: {
                onChange: '',
                onBlur: '',
                onUnmount: ''
              },
              afterDateType: '',
              afterDateValue: '',
              beforeDateType: '',
              beforeDateValue: '',
              regex: {
                regex: '',
                message_ar: '',
                message_en: ''
              }
            }
          }
          reload={reload}
          dataAssociations={associationsDataInput}
          errorView={findError}
          findError={findError && typeof findError === 'object'}
          hiddenLabel={true}
        />
      </div>
    </div>
  )
}

export default ViewInputInTable
