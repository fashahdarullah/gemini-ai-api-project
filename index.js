import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const app = express()

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const GEMNI_MODEL = 'gemini-2.5-flash'

app.use(cors())

app.use(express.json())

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

app.use(express.static('public'))

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body

  try {
    if (!Array.isArray(conversation)) { throw new Error('Conversation must be an array of messages') }

    const contents = conversation.map(({ role, text }) => ({
        role,
        parts: [{ text }]
    }))

    const response = await ai.models.generateContent({
      model: GEMNI_MODEL,
      contents,
      config: {
        temperature: 0.2,
        systemInstruction: 'You are a helpful nutritionist that provides concise and accurate answers to patient questions. You should only answer questions related to nutrition and diet. If the question is not related to nutrition, respond with "I am sorry, but I can only answer questions related to nutrition."',
      }
    })

    res.status(200).json({ result: response.text })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }

})