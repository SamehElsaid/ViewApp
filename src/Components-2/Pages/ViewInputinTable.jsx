/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import DisplayField from './PageCreation/DisplayField'
import { seterrorInAllRowData } from 'src/store/apps/errorInAllRow/errorInAllRow'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

function ViewInputInTable({
  ele,
  row,
  readOnly,
  disabled,
  data,
  onChange,
  setTriggerData,
  getDesign,
  triggerData,
  setOpen,
  notFound
}) {
  const refError = useRef({})
  const [reload, setReload] = useState(0)
  const dataRef = useRef({})
  const dispatch = useDispatch()
  const errorInAllRow = useSelector(state => state.errorInAllRow)
  const findError = errorInAllRow.data.find(el => el.index === row.index)?.error

  useEffect(() => {
    if (document.getElementById(`btn-actions-${data.collectionId}`)) {
      document.getElementById(`btn-actions-${data.collectionId}`).addEventListener('click', () => {
        const key = ele.type === 'new_element' ? ele.id : ele.key
        dispatch(seterrorInAllRowData({ row, key, error: refError.current[key] }))
      })
    }
  }, [])

  return (
    <div className='relative w-full'>
      {!readOnly && (
        <div
          onContextMenu={e => {
            e.preventDefault()
            setOpen(ele)
          }}
          className='absolute inset-0 z-20'
        ></div>
      )}
      <DisplayField
        input={ele}
        key={row.index}
        findValue={ele.type === 'Date' ? (notFound ? row?.[ele?.key] : new Date()) : row?.[ele?.key]}
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
          data?.additional_fields?.find(ele => ele.key === ele.id)?.roles ?? {
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
      />
    </div>
  )
}

export default ViewInputInTable
