import { useCallback, useEffect, useRef, useState } from 'react'

// Web Speech API — built into Chrome, Edge, and Safari (desktop + mobile).
// Firefox doesn't ship it; feature-detect and render nothing there.
const SpeechRecognitionImpl =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export const speechSupported = Boolean(SpeechRecognitionImpl)

// Plain-language messages, grade 6-8 reading level — no browser jargon
const ERROR_MESSAGES = {
  'not-allowed':         'Voice search needs permission to use your microphone. Check the microphone setting in your browser, or type your search instead.',
  'service-not-allowed': 'Voice search needs permission to use your microphone. Check the microphone setting in your browser, or type your search instead.',
  'no-speech':           "We didn't hear anything. Press the Voice search button and try speaking again.",
  'audio-capture':       "We couldn't find a microphone on this device. You can type your search instead.",
  'network':             'Voice search needs an internet connection. Please try again, or type your search instead.',
  'aborted':             null, // user stopped it on purpose — not an error worth showing
}
const SILENCE_MS = 2500
const MAX_MS = 20000

const FALLBACK_MESSAGE = "Voice search didn't work this time. Please try again, or type your search instead."

/**
 * One-shot dictation: start() listens for a phrase and streams interim +
 * final transcripts to onResult(transcript). stop() ends it early.
 *
 * Browsers end a non-continuous session at the first short pause, which cut
 * testers off mid-sentence ("I want to…", V5 round 3). So we listen
 * continuously and end it ourselves once the speaker has been quiet for
 * SILENCE_MS, with a hard cap of MAX_MS.
 */
export function useSpeechToText(onResult) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return
    setError(null)

    const recognition = new SpeechRecognitionImpl()
    recognition.lang = 'en-CA'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = true

    let silenceTimer = null
    const armSilenceTimer = () => {
      clearTimeout(silenceTimer)
      silenceTimer = setTimeout(() => recognition.stop(), SILENCE_MS)
    }
    const maxTimer = setTimeout(() => recognition.stop(), MAX_MS)

    recognition.onresult = (event) => {
      armSilenceTimer()
      const transcript = [...event.results]
        .map((result) => result[0].transcript)
        .join(' ')
        .trim()
      if (transcript) onResultRef.current?.(transcript)
    }
    recognition.onerror = (event) => {
      const message = ERROR_MESSAGES[event.error]
      if (message !== null) setError(message ?? FALLBACK_MESSAGE)
    }
    recognition.onend = () => {
      clearTimeout(silenceTimer)
      clearTimeout(maxTimer)
      recognitionRef.current = null
      setListening(false)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      recognitionRef.current = null
      setError(FALLBACK_MESSAGE)
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  // Kill any in-flight session if the component unmounts mid-listen
  useEffect(() => () => recognitionRef.current?.abort(), [])

  return { supported: speechSupported, listening, error, start, stop, clearError }
}
