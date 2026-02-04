import React, { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { axiosGet } from 'src/Components/axiosCall'
import DisplayField from '../PageCreation/DisplayField'
import { DefaultStyle, getTypeFromCollection } from 'src/Components/_Shared'

function ViewAsInputTrigger({ collectionInput, viewAsInput, setRefreshHeight, value }) {
  const { locale } = useIntl()
  const [getFields, setGetFields] = useState([])
  const [entitiesData, setEntitiesData] = useState(null)

  useEffect(() => {
    if (collectionInput) {
      axiosGet(`collections/get-by-key?key=${collectionInput}`, locale).then(res => {
        if (res.status) {
          axiosGet(`collection-fields/get?CollectionId=${res.data.id}`, locale).then(res => {
            if (res.status) {
              console.log(res.data, 'res.data')
              const filterFields = res.data.filter(field => viewAsInput?.includes(field?.key))
              console.log(filterFields, 'filterFields')
              setGetFields(filterFields)
              setRefreshHeight(prev => prev + 1)
            }
          })
        }
      })
    }
  }, [collectionInput, viewAsInput, locale, setRefreshHeight])

  useEffect(() => {
    if (value) {
      axiosGet(`/generic-entities/${collectionInput}/${value}`, locale).then(res => {
        if (res.status) {
          // setValue(res.data)
          console.log(res?.data?.entities?.[0], 'res.data')
          setEntitiesData(res?.data?.entities?.[0])
        }
      })
    }
  }, [value, locale, collectionInput])


  const getDesign = useCallback((key, field) => {
    let defaultDesign = null
    if (field?.type === 'new_element') {
      defaultDesign = DefaultStyle(field?.key)
    } else {
      if (field?.kind) {
        defaultDesign = DefaultStyle(getTypeFromCollection(field.type, field.kind || field.descriptionAr))
      } else {
        if (field?.options?.uiSchema?.xComponentProps?.cssClass) {
          defaultDesign = field?.options?.uiSchema?.xComponentProps?.cssClass
        } else {
          defaultDesign = DefaultStyle(getTypeFromCollection(field.type, field.kind || field.descriptionAr))
        }
      }
    }
    let additionalField = null

    const design = additionalField ?? defaultDesign ?? ``

    return design
  }, [])

  return (
    <div className='flex flex-col gap-2 mt-2'>
      {getFields.map(field => (
        <DisplayField
          disabled={true}
          key={field.id}
          input={field}
          design={getDesign(field.id, field)}
          readOnly={true}
          refError={null}
          setLayout={null}
          triggerData={null}
          data={null}
          layout={null}
          onChangeData={null}
          dataRef={null}
          setTriggerData={null}
          findValue={entitiesData?.[field?.key]}
          roles={null}
          reload={null}
          errorView={null}
          findError={null}
        />
      ))}
    </div>
  )
}

export default ViewAsInputTrigger
