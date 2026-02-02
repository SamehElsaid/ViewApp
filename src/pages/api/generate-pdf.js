// pages/api/generate-pdf-simple.js
import puppeteer from 'puppeteer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { htmlContent, pageName } = req.body

  if (!htmlContent) {
    return res.status(400).json({ message: 'HTML content is required' })
  }



  let browser = null

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Simple HTML template
    const template = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `

    await page.setContent(template, { waitUntil: 'domcontentloaded' })
    await new Promise(resolve => setTimeout(resolve, 1000))

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    })

    await browser.close()

    // Set headers before sending response
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(pageName || 'page')}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    // Send PDF buffer
    res.status(200).end(pdfBuffer)
  } catch (error) {
    console.error('PDF Generation Error:', error)

    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        console.error('Error closing browser:', e)
      }
    }

    return res.status(500).json({
      message: 'Error generating PDF',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
    responseLimit: '50mb'
  },
  maxDuration: 60
}
