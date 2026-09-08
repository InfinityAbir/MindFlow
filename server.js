import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Proxy /api/ai to Groq
app.use('/api/ai', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not set' })
    }

    const targetUrl = `https://api.groq.com/openai/v1${req.url}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.text()
    res.status(response.status).set('Content-Type', 'application/json').send(data)
  } catch (err) {
    console.error('Proxy error:', err)
    res.status(500).json({ error: 'Proxy request failed' })
  }
})

// Serve static build
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`MindFlow running on port ${PORT}`)
})
