import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button, MenuItem, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import CloseNav from './CloseNav'
import {
  getDefaultEventScript,
  buildEventDocument,
  parseEventBodyFromDocument
} from './ViewEvent'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

function EventControl({ data, onChange, buttonRef }) {
  const { messages, locale } = useIntl()
  const getApiData = useSelector(rx => rx.api.data)

  const [obj, setObj] = useState(null)

  // ✅ خلي ده هو المصدر الوحيد للكود
  const [localScript, setLocalScript] = useState(
    data.eventScript ?? getDefaultEventScript(data.eventApiDataVar)
  )

  // ✅ sync بس لما يتغير من برا
  useEffect(() => {
    if (data.eventScript && data.eventScript !== localScript) {
      setLocalScript(data.eventScript)
    }
  }, [data.eventScript])

  // ✅ تحميل الداتا من API
  useEffect(() => {
    if (!data.api_url) {
      setObj(null)
      
      return
    }

    const items = getApiData.find(item => item.link === data.api_url)?.data ?? null

    setObj(items)

    // ⚠️ متبنيش updatedCode هنا
    onChange({ ...data, items })
  }, [data.api_url, getApiData])

  // ✅ build document فقط للعرض
  const monacoDocument = useMemo(() => {
    return buildEventDocument({
      payloadParamName: data.eventApiDataVar,
      snapshot: obj,
      script: localScript,
      selectApiHint: `// ${messages.dialogs.eventFnSelectApiHint}`,
      snapshotHint: `// ${messages.dialogs.eventFnSnapshotHint}`
    })
  }, [data.eventApiDataVar, obj, localScript, messages])

  // ✅ لما المستخدم يكتب
  const handleDocumentChange = value => {
    const parsed = parseEventBodyFromDocument(value || '')

    setLocalScript(parsed)

    onChange({
      ...data,
      eventScript: parsed,
      updatedCode: value || ''
    })
  }

  return (
    <div>
      <CloseNav text={messages.dialogs.event} buttonRef={buttonRef} />

      {/* API Section */}
      <div className='p-2 rounded border border-dashed border-main-color'>
        <h2 className='mb-4 text-2xl text-main-color'>{messages.card.api}</h2>

        <TextField
          select
          fullWidth
          className='!mb-4'
          value={data.api_url || ''}
          onChange={e => onChange({ ...data, api_url: e.target.value })}
          label={messages.dialogs.getFromApi}
          variant='filled'
        >
          {getApiData.map(
            ({ link, data }, index) =>
              !Array.isArray(data) && (
                <MenuItem key={link + index} value={link}>
                  {link}
                </MenuItem>
              )
          )}
        </TextField>

        <div className='flex justify-center'>
          <Button
            className='!mt-4'
            variant='contained'
            color='error'
            onClick={() => {
              setObj(null)
              setLocalScript(getDefaultEventScript(data.eventApiDataVar))

              onChange({
                ...data,
                items: null,
                api_url: '',
                eventScript: '',
                updatedCode: ''
              })
            }}
          >
            {messages.card.clearData}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className='p-2 mt-4 rounded border border-dashed border-main-color'>
        <h2 className='mb-2 text-2xl text-main-color'>
          {messages.dialogs.eventScript}
        </h2>

        <p className='mb-2 text-sm text-gray-600'>
          {messages.dialogs.eventFnEditorHelp}
        </p>

        <p className='mb-3 text-sm text-gray-500'>
          {messages.dialogs.eventScriptOnCanvas}
        </p>

        <div
          className='rounded overflow-hidden border border-gray-600'
          onClick={e => e.stopPropagation()}
        >
          <MonacoEditor
            height='420px'
            width='100%'
            language='javascript'
            theme='vs-dark'
            value={monacoDocument}
            onChange={handleDocumentChange}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default EventControl