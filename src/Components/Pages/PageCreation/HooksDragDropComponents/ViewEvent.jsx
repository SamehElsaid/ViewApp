import { useSelector } from 'react-redux'

import { Button, Typography } from '@mui/material'

import { useIntl } from 'react-intl'
import { useEffect } from 'react'



export const EVENT_BODY_START = '// <event>'

export const EVENT_BODY_END = '// </event>'

/** Default first-argument name for __eventHandler when setting is empty or invalid. */
export const DEFAULT_EVENT_PAYLOAD_PARAM = '_document'

export function getEventApiDataParamName(raw) {

  if (typeof raw !== 'string' || !raw.trim()) {

    return DEFAULT_EVENT_PAYLOAD_PARAM

  }

  const name = raw.trim()



  return /^[$A-Za-z_][$0-9A-Za-z_]*$/.test(name) ? name : DEFAULT_EVENT_PAYLOAD_PARAM

}

/** Default body between // <event> markers; `payloadParamName` is the setting (or resolved) first-arg name. */
export function getDefaultEventScript(payloadParamName) {
  const p = getEventApiDataParamName(payloadParamName)

  return `// First parameter: API payload (${p})

// locale: current locale string (e.g. "ar", "en")

return ${p}`

}

export const DEFAULT_EVENT_SCRIPT = getDefaultEventScript(DEFAULT_EVENT_PAYLOAD_PARAM)



export function parseEventBodyFromDocument(text) {

  if (!text || typeof text !== 'string') {

    return ''

  }

  const re = /\/\/ <event>\s*([\s\S]*?)\s*\/\/ <\/event>/

  const m = text.match(re)



  return (m ? m[1] : text).trim()

}



export function buildEventDocument({ payloadParamName, snapshot, script, selectApiHint, snapshotHint }) {

  const param = getEventApiDataParamName(payloadParamName)

  const hasSnapshot = snapshot != null && snapshot !== false

  let snapshotLiteral = 'null'

  if (hasSnapshot) {

    try {

      snapshotLiteral = JSON.stringify(snapshot, null, 2)

    } catch {

      snapshotLiteral = JSON.stringify(String(snapshot))

    }

  }

  const snapshotComment = hasSnapshot ? snapshotHint : selectApiHint

  const head = `  ${snapshotComment}\n  const __apiSnapshot__ = ${snapshotLiteral}\n\n`

  return `function __eventHandler(${param}, locale) {

${head}${EVENT_BODY_START}

${script}

${EVENT_BODY_END}

}`

}



/** Execute full handler document: defines __eventHandler then runs fn(livePayload, locale). */

function runEventHandlerFromDocument(fullCode, apiPayload, locale) {

  if (!fullCode || typeof fullCode !== 'string' || !fullCode.trim()) {

    return { ok: true, value: Promise.resolve(undefined) }

  }

  try {

    const factory = new Function(`"use strict";\n${fullCode}\nreturn __eventHandler;`)

    const fn = factory()

    if (typeof fn !== 'function') {

      return { ok: false, error: '__eventHandler is not a function' }

    }

    const value = fn(apiPayload, locale)



    return { ok: true, value: Promise.resolve(value) }

  } catch (e) {

    return { ok: false, error: e?.message || String(e) }

  }

}



/** Live API row from Redux, then persisted `data.items` if store not ready yet (e.g. preview). */

function resolveEventApiPayload(apiUrl, getApiData, storedItems) {

  if (!apiUrl || !Array.isArray(getApiData)) {

    return storedItems !== undefined ? storedItems : undefined

  }

  const row = getApiData.find(item => item.link === apiUrl)

  if (row && 'data' in row && row.data !== undefined) {

    return row.data

  }



  return storedItems !== undefined ? storedItems : undefined

}



export default function ViewEvent({ data, locale, readOnly, children }) {

  const { messages } = useIntl()

  const getApiData = useSelector(state => state.api.data)



  const handleRunClick = () => {

    const payload = resolveEventApiPayload(data.api_url, getApiData, data.items)

    const apiData = payload
    const eventScript = data?.updatedCode







    const apiDataString = JSON.stringify(apiData ?? null, null, 2)

    const updatedScript = eventScript.replace(
      /const __apiSnapshot__\s*=\s*{[\s\S]*?}\s*(?=\/\/ <event>)/,
      `const __apiSnapshot__ = ${apiDataString}\n`
    )
    const cleanedScript = updatedScript.replace(/},\s*,/g, '},')
    const runEvent = new Function(cleanedScript + '; return __eventHandler;')()

    console.log(cleanedScript);
    runEvent(document, 'en')



  }

  useEffect(() => {
    const payload = resolveEventApiPayload(data.api_url, getApiData, data.items)
    console.log(payload)

    if (readOnly) {

      const timer = setTimeout(() => {
        handleRunClick()
      }, 1000)

      return () => clearTimeout(timer) // clean up if component unmounts
    }
  }, []) // empty deps → run only once on mount





  return (readOnly ? "" :

    <div className='p-2 rounded-md border border-dashed border-main-color min-h-[48px] flex flex-col gap-2'>

      <div className='flex justify-end' onClick={e => e.stopPropagation()}>

        <Button variant='contained' size='small' color='primary' onClick={handleRunClick}>

          {messages.dialogs.eventRunEvent}

        </Button>

      </div>

      {readOnly ? null : <div className='p-2 mt-4 rounded border border-dashed border-main-color'>
        <h2 className='mb-4 text-2xl text-main-color'>{messages.dialogs.event}</h2>
        <Typography variant='body2' color='text.secondary'>
          {messages.dialogs.eventDescription}
        </Typography>
      </div>}

    </div>

  )

}

