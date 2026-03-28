import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { aiAPI, inventoryAPI } from '../services/api'
import { useToast } from '../components/ui/Toast'

// ─────────────────────────────────────────────
// TTS Voice Pre-caching
// ─────────────────────────────────────────────

let _cachedVoices: SpeechSynthesisVoice[] = []
let _voicesReady = false

function _initVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const loadVoices = () => {
    _cachedVoices = window.speechSynthesis.getVoices()
    _voicesReady = _cachedVoices.length > 0
  }
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}
_initVoices()

/** Speak text via Browser TTS. Returns a Promise that resolves when done. */
function speakAsync(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1.05

    const voices = _voicesReady ? _cachedVoices : window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find((v) => v.lang.startsWith('en') && !v.localService)
      || voices.find((v) => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    let resolved = false
    const done = () => { if (!resolved) { resolved = true; resolve() } }
    utterance.onend = done
    utterance.onerror = done
    window.speechSynthesis.speak(utterance)

    // Safety: resolve after 8s max in case onend never fires
    setTimeout(done, 8000)
  })
}

// ─────────────────────────────────────────────
// Local (offline) intent parsing — mirrors the backend logic
// ─────────────────────────────────────────────

const FILLER_WORDS = new Set([
  'please', 'can', 'you', 'i', 'want', 'need', 'get', 'me', 'some',
  'a', 'an', 'the', 'of', 'and', 'to', 'my', 'cart', 'put', 'into', 'in',
])

const UNIT_PATTERN = /(?:kg|kgs|kilogram|kilograms|g|grams?|l|litres?|liters?|ml|packets?|packs?|pieces?|bottles?|bags?|boxes?|dozen|cans?|tubes?)/i

function extractEntities(text: string): { product_name?: string; quantity: number; all_products?: string[] } {
  const lower = text.toLowerCase().trim()
  let quantity = 1
  let rawProduct = lower

  // Pattern: <number> [unit] [of] <product>
  const qtyMatch = lower.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${UNIT_PATTERN.source}?\\s*(?:of\\s+)?(.+)`, 'i'))
  if (qtyMatch) {
    quantity = Math.max(1, Math.round(parseFloat(qtyMatch[1])))
    rawProduct = qtyMatch[2].trim()
  } else {
    const numMatch = lower.match(/(\d+)\s+(.+)/)
    if (numMatch) {
      quantity = parseInt(numMatch[1], 10)
      rawProduct = numMatch[2].trim()
    }
  }

  // Strip command verbs
  rawProduct = rawProduct.replace(/^(?:add|buy|order|get|put|search|find|show|where\s+is|remove|delete|take\s+out)\s+/i, '')
  // Strip cart slang (e.g. "on curt")
  rawProduct = rawProduct.replace(/\s+(?:from|on|in|out\s+of)\s+(?:cart|curt|the\s+cart|my\s+cart)$/i, '')

  // Remove filler words
  const words = rawProduct.split(/\s+/)
  const cleaned = words.filter((w) => !FILLER_WORDS.has(w))
  let productName = cleaned.join(' ').trim().replace(/[.,!?]+$/, '')

  // Handle multi-product "X and Y" – take first
  let allProducts: string[] | undefined
  if (productName.includes(' and ')) {
    const parts = productName.split(' and ').map((p) => p.trim()).filter(Boolean)
    if (parts.length > 1) {
      allProducts = parts
      productName = parts[0]
    }
  }

  const result: { product_name?: string; quantity: number; all_products?: string[] } = { quantity }
  if (productName) result.product_name = productName
  if (allProducts) result.all_products = allProducts
  return result
}

function parseIntentLocally(text: string): { intent: string; entities: ReturnType<typeof extractEntities>; response_text: string } {
  const lower = text.toLowerCase().trim()
  let intent = 'unknown'
  let response_text = "I'm not sure how to help with that."
  let entities = extractEntities(text)

  if (/\b(?:add|buy|order|want|need|get me|put|into cart|i need)\b/.test(lower)) {
    intent = 'add_to_cart'
    const product = entities.product_name || 'item'
    response_text = `Adding ${entities.quantity} ${product} to your cart.`
  } else if (/\b(?:remove|delete|take out|take off)\b/.test(lower)) {
    intent = 'remove_from_cart'
    const product = entities.product_name || 'item'
    response_text = `Removing ${product} from cart.`
  } else if (/\b(?:search|find|where is|look for|do you have|show me)\b/.test(lower)) {
    intent = 'search_product'
    const product = entities.product_name || 'item'
    response_text = `Searching for ${product}.`
  } else if (/\b(?:checkout|pay|bill|done shopping|finish)\b/.test(lower)) {
    intent = 'checkout'
    response_text = 'Proceeding to checkout.'
  } else if (/\b(?:cheapest|lowest price|inexpensive|cheaper)\b/.test(lower)) {
    intent = 'find_cheapest'
    response_text = 'Finding the cheapest item for you.'
  } else if (/\b(?:orders|past orders|order history)\b/.test(lower)) {
    intent = 'view_orders'
    response_text = 'Opening your orders history.'
  } else if (/\b(?:account|profile|my account)\b/.test(lower)) {
    intent = 'view_account'
    response_text = 'Opening your account profile.'
  } else if (/\b(?:show cart|my cart|view cart)\b/.test(lower)) {
    intent = 'view_cart'
    response_text = "Here's your cart."
  } else if (/\b(?:hi|hello|hey|good morning|good evening)\b/.test(lower)) {
    intent = 'greeting'
    response_text = 'Hello! How can I help you today?'
  } else if (/\b(?:help|what can you do|how to)\b/.test(lower)) {
    intent = 'help'
    response_text = "You can say things like 'Add 2 kg rice', 'Find toothpaste', or 'Show my cart'."
  } else if (entities.product_name) {
    // Fallback: if we found a product name, treat as add_to_cart
    intent = 'add_to_cart'
    response_text = `Adding ${entities.quantity} ${entities.product_name} to your cart.`
  }

  return { intent, entities, response_text }
}

// ─────────────────────────────────────────────
// Core handler: process recognized speech text
// ─────────────────────────────────────────────

async function handleVoiceCommand(
  text: string,
  addToCart: (item: any) => void,
  setTranscript: (text: string) => void,
  setIntent: (intent: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  addToast: any,
): Promise<string> {
  let intent = 'unknown'
  let entities: any = {}
  let responseText = "I'm not sure how to help with that. Try asking for things like 'Rice' or 'Bread'."

  try {
    const intentRes = await aiAPI.parseIntent(text)
    intent = intentRes.data.intent
    entities = intentRes.data.entities || {}
    responseText = intentRes.data.response_text || responseText
  } catch {
    console.log('AI service offline, using local intent parsing')
    const local = parseIntentLocally(text)
    intent = local.intent
    entities = local.entities
    responseText = local.response_text
  }

  setIntent(intent)

  if (intent === 'add_to_cart' && (entities?.product_name || entities?.all_products?.length > 0)) {
    const productsToSearch = entities?.all_products?.length > 0 ? entities.all_products : [entities.product_name]
    const qty = entities.quantity || 1
    
    let addedNames: string[] = []
    
    try {
      // Execute searches in parallel if a user asked for "Milk AND Bread"
      const searchPromises = productsToSearch.map((p: string) => inventoryAPI.searchProducts(p))
      const results = await Promise.allSettled(searchPromises)

      for (let i = 0; i < results.length; i++) {
        const res = results[i]
        if (res.status === 'fulfilled' && res.value.data?.length > 0) {
          const product = res.value.data[0]
          addToCart({
            product_id: product.id || product._id,
            product_name: product.name,
            product_emoji: product.emoji || '📦',
            quantity: qty,
            unit_price: product.selling_price || product.price,
            total_price: (product.selling_price || product.price) * qty,
            added_via: 'voice',
          })
          addedNames.push(product.name)
          addToast({ title: `${product.emoji || '📦'} ${product.name} added`, message: `Added ${qty} unit(s) via voice`, type: 'success', duration: 3000 })
        }
      }
    } catch {
       // Silent fail
    }

    if (addedNames.length > 0) {
      responseText = `Added ${addedNames.join(" and ")} to your cart.`
      setTranscript(`✅ Added ${addedNames.join(" & ")}`)
    } else {
      const q = productsToSearch.join(" and ")
      responseText = `Sorry, I couldn't find "${q}" in our store.`
      setTranscript(`❌ "${q}" not found`)
    }
  } else if (intent === 'remove_from_cart' && entities?.product_name) {
    const { cartItems, removeFromCart } = useStore.getState()
    const hit = cartItems.find((ci) => ci.product_name.toLowerCase().includes(entities.product_name.toLowerCase()))
    
    if (hit) {
      removeFromCart(hit.product_id)
      responseText = `Removed ${hit.product_name} from your cart.`
      setTranscript(`🗑️ Removed ${hit.product_name}`)
      addToast({ title: `${hit.product_emoji} ${hit.product_name} removed`, message: 'Removed via voice command', type: 'error', duration: 3000 })
    } else {
      responseText = `I couldn't find ${entities.product_name} in your cart to remove.`
      setTranscript(`❌ "${entities.product_name}" is not in your cart`)
    }
  } else if (intent === 'find_cheapest') {
    setTranscript(`🔍 Looking up the lowest price...`)
    try {
      const res = await inventoryAPI.listProducts()
      if (res.data?.length > 0) {
        const sorted = res.data.sort((a: any, b: any) => (a.selling_price || a.price) - (b.selling_price || b.price))
        const cheapest = sorted[0]
        responseText = `The cheapest item is ${cheapest.name} for ${cheapest.selling_price || cheapest.price} rupees.`
        setTranscript(`🏷️ Cheapest: ${cheapest.name}`)
      }
    } catch {
      responseText = "Sorry, I'm unable to check prices right now."
    }
  } else if (intent === 'search_product' && entities?.product_name) {
    setTranscript(`🔍 Searching for "${entities.product_name}"...`)
    navigate('/browse')
  } else if (intent === 'view_cart') {
    setTranscript('🛒 Opening your cart...')
    navigate('/cart')
  } else if (intent === 'view_orders') {
    setTranscript('📦 Opening your past orders...')
    navigate('/history')
  } else if (intent === 'view_account') {
    setTranscript('👤 Opening your profile...')
    navigate('/profile')
  } else if (intent === 'checkout') {
    setTranscript('💳 Opening secure checkout...')
    navigate('/checkout')
  } else {
    try {
      const res = await inventoryAPI.listProducts()
      if (res.data?.length >= 2) {
        const shuffled = res.data.sort(() => 0.5 - Math.random())
        const s1 = shuffled[0].name.split(' (')[0]
        const s2 = shuffled[1].name.split(' (')[0]
        responseText = `I didn't quite catch that. But I can help you find things like ${s1} or ${s2}?`
        setTranscript(`🤔 Try asking for "${s1}"`)
      } else {
        setTranscript(responseText)
      }
    } catch {
      setTranscript(responseText)
    }
  }

  return responseText
}

// ─────────────────────────────────────────────
// useVoice Hook
// ─────────────────────────────────────────────

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)
  const navigate = useNavigate()

  const { setTranscript, setIntent, addToCart, closeVoiceOverlay } = useStore()
  const { addToast } = useToast()

  const startRecording = useCallback(async () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setTranscript('⚠️ Your browser does not support Speech Recognition. Use Chrome or Edge.')
        setTimeout(() => closeVoiceOverlay(), 3000)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognitionRef.current = recognition

      recognition.onstart = () => {
        setIsRecording(true)
        setTranscript('')
      }

      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript
        setIsRecording(false)
        setIsProcessing(true)
        setTranscript(`🎯 "${text}"`)

        try {
          // Process the voice command (handles backend + offline fallback)
          const feedbackText = await handleVoiceCommand(text, addToCart, setTranscript, setIntent, navigate, addToast)

          setIsProcessing(false)

          // Speak response, then close overlay
          if (feedbackText) {
            await speakAsync(feedbackText)
          }
          setTimeout(() => closeVoiceOverlay(), 800)

        } catch (error) {
          console.error('Voice processing error:', error)
          setTranscript('⚠️ Could not process command. Try again.')
          setIsProcessing(false)
          setTimeout(() => closeVoiceOverlay(), 2500)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        setIsProcessing(false)

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setTranscript('🎙️ Microphone permission denied. Please allow access.')
        } else if (event.error === 'no-speech') {
          setTranscript('🔇 No speech detected. Try again.')
        } else if (event.error === 'network') {
          setTranscript('🌐 Network error. Check your connection.')
        } else {
          setTranscript(`⚠️ Error: ${event.error}. Try again.`)
        }

        setTimeout(() => closeVoiceOverlay(), 2500)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
    } catch (err) {
      console.error('Error starting speech recognition:', err)
      setTranscript('⚠️ Mic permission denied.')
      setTimeout(() => closeVoiceOverlay(), 2000)
    }
  }, [setTranscript, setIntent, addToCart, closeVoiceOverlay])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
      setIsRecording(false)
    }
  }, [])

  return {
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
  }
}
