/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import DisplayField from './PageCreation/DisplayField'
import { seterrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { IoMdSettings } from 'react-icons/io'
import { useIntl } from 'react-intl'

function ViewInputInTable({
  ele,
  row,
  readOnly,
  disabled,
  data,
  onChange,
  setTriggerData,
  dataRef,
  getDesign,
  triggerData,
  setOpen,
  setGetFields,
  setChangedValue,
  formTable,
  columnId
}) {
  const refError = useRef({})
  const [reload, setReload] = useState(0)
  const dispatch = useDispatch()
  const errorInAllRow = useSelector(state => state.errorInAllRow)
  const findError = errorInAllRow.data.find(el => el.index === row.index)?.error
  const { locale } = useIntl()
  useEffect(() => {
    if (document.getElementById(`btn-actions-${data.collectionId}`)) {
      document.getElementById(`btn-actions-${data.collectionId}`).addEventListener('click', () => {
        const key = ele.type === 'new_element' ? ele.id : ele.key
        dispatch(seterrorInAllRowData({ row, key, error: refError.current[key] }))
      })
    }
  }, [])

  let roles = data?.additional_fields?.find(el => el.key === ele.id)?.roles
  const newRoles = { ...roles }

  if (columnId) {
    if (newRoles?.triggerRow?.rowId === columnId) {
      newRoles.trigger = newRoles?.triggerRow
    }
    if (newRoles?.OnMountTriggerRow?.rowId === columnId) {
      newRoles.onMount = newRoles?.OnMountTriggerRow
    }
  }

  console.log(columnId);


  return (
    <div
      className='relative w-full'
      onBlur={() => {

        console.log(dataRef.current, 'dataRef.current');
        setChangedValue(prev => {
          console.log(prev, 'prev');
          const newPrev = [...prev]
          const findWithId = newPrev.find(e => e.Id === row.Id)
          if (findWithId) {
            findWithId[ele.key] = dataRef.current[ele.key]
          } else {
            newPrev.push({ ...row, [ele.key]: dataRef.current[ele.key] })
          }

          return newPrev
        })
        const newPrev = [...data.newRows]
        const index = newPrev.findIndex(e => e.Id === row.Id)

        if (index !== -1) {
          newPrev[index] = {
            ...newPrev[index],
            ...dataRef.current
          }
        }
        onChange({
          ...data,
          newRows: newPrev
        })

      }}
    >
      {console.log(formTable, 'ele')}
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
              e.stopPropagation()
            }}
            onClick={e => {
              e.stopPropagation()
              setOpen({ ...ele, rowId: columnId })
            }}
            className='w-[30px] || h-[30px] hover:bg-main-color hover:text-white duration-200 || rounded-lg || shadow-2xl text-xl flex || items-center justify-center bg-white border-main-color border'
          >
            <IoMdSettings />
          </button>
        )}
        <DisplayField
          input={ele}
          key={row.index}
          findValue={row?.[ele?.key]}
          design={getDesign(ele.id, ele)}
          readOnly={disabled}
          disabledBtn={!data.type_of_sumbit || (data.type_of_sumbit === 'api' && !data.submitApi)}
          refError={refError}
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
            newRoles ?? {
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
          errorView={findError?.[ele.type === 'new_element' ? ele.id : ele.key]?.[0]}
          findError={findError && typeof findError?.[ele.type === 'new_element' ? ele.id : ele.key] === 'object'}
          hiddenLabel={true}
        />
      </div>
    </div>
  )
}

export default ViewInputInTable
