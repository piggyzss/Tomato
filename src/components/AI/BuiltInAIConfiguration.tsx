import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { aiService } from '@/services/aiService'
import type { AIAvailability } from '@/types'

// Availability check component
function AvailabilityCheck() {
  const [availability, setAvailability] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    const result = await aiService.getBuiltInAvailabilityStatus()
    setAvailability(result)
    setLoading(false)
  }

  const goodStates = [
    'readily',
    'after-download',
    'downloadable',
    'available',
    'downloading',
  ]

  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <h3 className="text-sm font-semibold mb-2">
        🔍 Check Gemini Nano Availability
      </h3>
      <button
        onClick={handleCheck}
        disabled={loading}
        className="w-full py-2 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Checking...' : 'Check Availability'}
      </button>
      <div className="mt-3 text-sm">
        {availability === null ? (
          <p className="text-white/60">
            Click button to check Gemini Nano availability
          </p>
        ) : goodStates.includes(availability) ? (
          <p className="text-green-300">✅ Available ({availability})</p>
        ) : (
          <p className="text-red-300">❌ Unavailable ({availability})</p>
        )}
      </div>
    </div>
  )
}

interface BuiltInAIConfigurationProps {
  builtInAvailable: AIAvailability
}

export default function BuiltInAIConfiguration({
  builtInAvailable,
}: BuiltInAIConfigurationProps) {
  return (
    <>
      {/* Status */}
      <div
        className={`p-4 rounded-lg ${
          builtInAvailable === 'ready'
            ? 'bg-green-500/20'
            : builtInAvailable === 'unavailable'
              ? 'bg-red-500/20'
              : 'bg-blue-500/20'
        }`}
      >
        <div className="flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            {builtInAvailable === 'checking' && 'Checking API availability...'}
            {builtInAvailable === 'ready' && '✅ Chrome Built-in AI is Ready!'}
            {builtInAvailable === 'unavailable' && (
              <>
                <div className="font-semibold mb-1">
                  ❌ Chrome Built-in AI Unavailable
                </div>
                <div className="text-xs opacity-90">
                  Please ensure:
                  <br />• Use Chrome 127+ version
                  <br />• Enable experimental feature:
                  chrome://flags/#optimization-guide-on-device-model
                  <br />• Enable: chrome://flags/#prompt-api-for-gemini-nano
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Availability Check Component */}
      <AvailabilityCheck />

      {builtInAvailable === 'ready' && (
        <>
          {/* Info */}
          <div className="p-3 bg-white/5 rounded-lg text-xs opacity-80">
            <div className="font-semibold mb-1">About Chrome Built-in AI:</div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Uses Gemini Nano model, runs completely locally</li>
              <li>No network connection required, protects privacy</li>
              <li>Supports custom system prompts</li>
              <li>Suitable for fast, lightweight AI interactions</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-white/10">
              <a
                href="https://developer.chrome.com/docs/ai/built-in?hl=zh-cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                View Complete Documentation →
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Export aiService methods for other components to use
export { aiService }
