const https = require('https')

function postJson(urlString, jsonBody) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString)
      const payload = Buffer.from(JSON.stringify(jsonBody))
      const req = https.request({
        protocol: url.protocol,
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      }, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          const status = res.statusCode || 500
          if (status < 200 || status >= 300) {
            return reject(new Error(`Erreur Gemini ${status}: ${data}`))
          }
          try {
            const json = JSON.parse(data || '{}')
            resolve(json)
          } catch (e) {
            reject(new Error(`Réponse non JSON de Gemini: ${String(e?.message || e)}`))
          }
        })
      })
      req.on('error', reject)
      req.write(payload)
      req.end()
    } catch (e) {
      reject(e)
    }
  })
}

function getJson(urlString) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString)
      const req = https.request({
        protocol: url.protocol,
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          const status = res.statusCode || 500
          if (status < 200 || status >= 300) {
            return reject(new Error(`HTTP ${status}: ${data}`))
          }
          try {
            const json = JSON.parse(data || '{}')
            resolve(json)
          } catch (e) {
            reject(new Error(`Réponse non JSON: ${String(e?.message || e)}`))
          }
        })
      })
      req.on('error', reject)
      req.end()
    } catch (e) {
      reject(e)
    }
  })
}

function sanitizeInput(str, maxLen) {
  if (!str) return ''
  const s = String(str)
  if (s.length <= maxLen) return s
  return s.slice(0, maxLen)
}

function buildRequestBody(message, context, overrides) {
  // Limit prompt size to avoid token limits
  const safeMessage = sanitizeInput(message, 800)
  const safeContext = sanitizeInput(context, 1200)
  const systemText = `Tu es l'assistant IA de l'application MyJalako (gestion de budget personnel). Réponds en français, clair et utile. Si l'utilisateur demande des conseils, base-toi sur le contexte s'il est fourni.`

  const userParts = []
  if (safeContext && String(safeContext).trim().length > 0) {
    userParts.push({ text: `Contexte:\n${safeContext}` })
  }
  userParts.push({ text: `Question utilisateur:\n${safeMessage}` })

  return {
    systemInstruction: { role: 'system', parts: [{ text: systemText }] },
    contents: [
      {
        role: 'user',
        parts: userParts
      }
    ],
    generationConfig: Object.assign({
      temperature: 0.4,
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 1024
    }, overrides || {})
  }
}

async function chatWithGemini(message, context) {
  if (!message || !String(message).trim()) {
    throw new Error('Message requis')
  }

  const apiKey = process.env.GEMINI_API_KEY
  const envUrl = process.env.GEMINI_API_URL
  const baseModel = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim()
  const candidates = []
  // 1) If explicit URL provided, ONLY try it
  if (envUrl && envUrl.includes('/models/')) {
    candidates.push(envUrl)
  } else {
    // 2) If a model is provided, try only that model (+ -latest) across v1beta then v1
    const models = new Set([
      baseModel,
      baseModel.endsWith('-latest') ? baseModel : `${baseModel}-latest`
    ])
    for (const m of models) candidates.push(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`)
    for (const m of models) candidates.push(`https://generativelanguage.googleapis.com/v1/models/${m}:generateContent`)
  }

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY manquant dans les variables d\'environnement')
  }

  let body = buildRequestBody(message, context)
  let lastErr = null
  let usedUrl = ''
  let data
  const tried = []
  for (const endpoint of candidates) {
    const url = `${endpoint}?key=${encodeURIComponent(apiKey)}`
    try {
      data = await postJson(url, body)
      usedUrl = endpoint
      break
    } catch (e) {
      lastErr = e
      tried.push(endpoint)
      // continue trying next candidate on 404 or not supported
      const msg = String(e?.message || e)
      const retriable = msg.includes('404') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('not supported')
      if (!retriable) break
    }
  }
  if (!data) {
    // As a fallback, list available models and pick one that supports generateContent
    const listCandidates = [
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`
    ]
    let models = []
    for (const listUrl of listCandidates) {
      try {
        const resp = await getJson(listUrl)
        if (Array.isArray(resp?.models)) {
          models = resp.models
          break
        }
      } catch (_e) {}
    }
    if (models.length > 0) {
      // Prefer flash, then pro, ensure supports generateContent
      const supportsGen = (m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent')
      const preferred = models
        .filter(supportsGen)
        .sort((a, b) => {
          const an = String(a.name || '')
          const bn = String(b.name || '')
          const ascore = an.includes('flash') ? 0 : an.includes('pro') ? 1 : 2
          const bscore = bn.includes('flash') ? 0 : bn.includes('pro') ? 1 : 2
          return ascore - bscore
        })[0]
      if (preferred?.name) {
        const endpoint = preferred.name.replace(/^models\//, '')
        const pick = preferred.name.includes('/v1/') ? 'v1' : 'v1beta'
        const finalUrl = `https://generativelanguage.googleapis.com/${pick}/models/${endpoint}:generateContent?key=${encodeURIComponent(apiKey)}`
        try {
          data = await postJson(finalUrl, body)
          usedUrl = preferred.name
        } catch (e) {
          lastErr = e
        }
      }
    }
    if (!data) {
      const err = new Error(`${lastErr?.message || 'Appel Gemini impossible'} | tried: ${tried.join(', ')}`)
      throw err
    }
  }
  // Extract text (robust)
  let text = ''
  try {
    const parts = data?.candidates?.[0]?.content?.parts
    if (Array.isArray(parts) && parts.length > 0) {
      text = parts.map((p) => (p?.text || '')).filter(Boolean).join('\n').trim()
    }
    if (!text && typeof data?.candidates?.[0]?.content?.text === 'string') {
      text = data.candidates[0].content.text.trim()
    }
    if (!text && typeof data?.candidates?.[0]?.text === 'string') {
      text = data.candidates[0].text.trim()
    }
  } catch (_e) {}

  // Retry on MAX_TOKENS with adjusted config
  const finishOrBlock = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason
  if (!text && finishOrBlock === 'MAX_TOKENS') {
    try {
      const smaller = buildRequestBody(message, context, { maxOutputTokens: 2048, temperature: 0.3 })
      // Try again on the last successful or first candidate endpoint
      const endpointToUse = usedUrl || (Array.isArray(tried) && tried.length > 0 ? tried[0] : '')
      const url = `${endpointToUse}?key=${encodeURIComponent(apiKey)}`
      const again = endpointToUse ? await postJson(url, smaller) : null
      if (again) {
        const parts2 = again?.candidates?.[0]?.content?.parts
        if (Array.isArray(parts2) && parts2.length > 0) {
          text = parts2.map((p) => (p?.text || '')).filter(Boolean).join('\n').trim()
        }
        if (!text && typeof again?.candidates?.[0]?.text === 'string') {
          text = again.candidates[0].text.trim()
        }
      }
    } catch (_e2) {}
  }

  if (!text) {
    const block = finishOrBlock || 'no_text'
    return { text: '', raw: data, model: baseModel, apiUrl: usedUrl, meta: { blockReason: block } }
  }
  return { text, raw: data, model: baseModel, apiUrl: usedUrl }
}

module.exports = { chatWithGemini }


