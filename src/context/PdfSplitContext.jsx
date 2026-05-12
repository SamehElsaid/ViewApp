import { createContext, useCallback, useContext, useState } from 'react'

const PdfSplitContext = createContext(null)

export const PdfSplitProvider = ({ children }) => {
  const [pdfState, setPdfState] = useState(null) // { blobUrl, fileName }

  const openPdf = useCallback((blobUrl, fileName) => {
    setPdfState({ blobUrl, fileName })
  }, [])

  const closePdf = useCallback(() => {
    setPdfState(prev => {
      if (prev?.blobUrl) URL.revokeObjectURL(prev.blobUrl)

      return null
    })
  }, [])

  return (
    <PdfSplitContext.Provider value={{ pdfState, openPdf, closePdf }}>
      {children}
    </PdfSplitContext.Provider>
  )
}

export const usePdfSplit = () => useContext(PdfSplitContext)
