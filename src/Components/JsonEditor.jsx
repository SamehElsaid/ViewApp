/* eslint-disable react-hooks/exhaustive-deps */
import dynamic from 'next/dynamic'
import { Box, Typography } from '@mui/material'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const JsonEditor = ({ value, onChange, height = '260px', isError = false, helperText = '' }) => {
  return (
       <div>
      <MonacoEditor
        height={height}
        width='100%'
        language='json'
        theme='vs-dark'
        value={value}
        onChange={val => onChange?.(val ?? '')}
        onClick={e => e.stopPropagation()}  
        options={{
          selectOnLineNumbers: true,
          minimap: { enabled: false },
          readOnly: false
        }}
      />
      {isError && (
        <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </div>
  )
}

export default JsonEditor
