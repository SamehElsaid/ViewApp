import React, { useEffect, useMemo, useRef } from 'react'
import { MdCss } from 'react-icons/md'
import { useIntl } from 'react-intl'
import Editor from '@monaco-editor/react'
import CloseNav from '../CloseNav'
import { Box, Typography } from '@mui/material'

/* ── Renderer ─────────────────────────────────────────────────────────── */
function StyleRenderer({ data, readOnly }) {
  const css = data?.css || ''
  const styleId = useRef(`custom-style-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let tag = document.getElementById(styleId.current)
    if (!tag) {
      tag = document.createElement('style')
      tag.id = styleId.current
      document.head.appendChild(tag)
    }
    tag.textContent = css

    return () => {
      const el = document.getElementById(styleId.current)
      if (el) el.remove()
    }
  }, [css])

  console.log(readOnly, "css")

  return !readOnly ?
    <>
      <code>{css}</code>
    </> : null
}

/* ── Controls ─────────────────────────────────────────────────────────── */
function StyleControls({ data, onChange, buttonRef, title }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CloseNav text={title} buttonRef={buttonRef} />
      <Box sx={{ flex: 1, p: 1 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
          CSS سيُطبَّق على الصفحة كلها
        </Typography>
        <Editor
          height='60vh'
          defaultLanguage='css'
          value={data?.css || ''}
          onChange={value => onChange({ ...data, css: value || '' })}
          theme='vs-dark'
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </Box>
    </Box>
  )
}

/* ── Hook ─────────────────────────────────────────────────────────────── */
export default function useStyle({ locale, buttonRef, readOnly }) {
  const { messages } = useIntl()

  const title = messages?.dialogs?.customStyle || 'Custom CSS'

  const stylePlugin = useMemo(() => {
    return {
      id: 'customStyle',
      version: 1,
      title,
      description: messages?.dialogs?.customStyleDescription || 'Write custom CSS applied to the whole page',
      icon: <MdCss className='text-2xl' />,
      Renderer: ({ data }) => <StyleRenderer data={data} readOnly={readOnly} />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <StyleControls
            data={data}
            onChange={onChange}
            buttonRef={buttonRef}
            title={title}
          />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, buttonRef, title, readOnly])

  return { stylePlugin }
}
