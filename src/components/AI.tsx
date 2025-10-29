import { useSettingsStore } from '@/store/useSettingsStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useTimerStore } from '@/store/useTimerStore'
import { GeneratedAIMessage } from '@/types'
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Trash2, 
  ArrowLeft,
  MessageCircle,
  BarChart3,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'
import { useState, useEffect } from 'react'

// AI view navigation type
type AIView = 'menu' | 'catMessages' | 'dailySummary'

// Types for Gemini Nano API
interface AIWriter {
  write: (prompt: string) => Promise<string>
}

interface AICapabilities {
  available: 'readily' | 'after-download' | 'no'
}

interface AISummarizer {
  summarize: (text: string) => Promise<string>
}

interface SummarizerCapabilities {
  available: 'readily' | 'after-download' | 'no'
}

interface AITranslator {
  translate: (text: string, options: { sourceLanguage: string, targetLanguage: string }) => Promise<string>
}

interface TranslatorCapabilities {
  available: 'readily' | 'after-download' | 'no'
}

declare global {
  interface Window {
    ai: {
      writer: {
        capabilities: () => Promise<AICapabilities>
        create: () => Promise<AIWriter>
      }
      summarizer: {
        capabilities: () => Promise<SummarizerCapabilities>
        create: () => Promise<AISummarizer>
      }
      translator: {
        capabilities: () => Promise<TranslatorCapabilities>
        create: (options: { sourceLanguage: string, targetLanguage: string }) => Promise<AITranslator>
      }
    }
  }
}

export default function AI() {
  const { theme, aiMessages, updateSettings, useAIMessages, language } = useSettingsStore()
  const { status, mode, remainingSeconds } = useTimerStore()
  const { currentTaskId, tasks } = useTaskStore()
  
  // Navigation state
  const [currentView, setCurrentView] = useState<AIView>('menu')
  
  // API availability state
  const [apiStatus, setApiStatus] = useState({
    aiAvailable: false,
    writerAvailable: false,
    summarizerAvailable: false,
    translatorAvailable: false,
    writerStatus: 'checking',
    summarizerStatus: 'checking',
    translatorStatus: 'checking'
  })
  
  // Cat Messages states
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [aiWriter, setAIWriter] = useState<AIWriter | null>(null)
  const [selectedMessageLanguage, setSelectedMessageLanguage] = useState(language)
  
  // Daily Summary states
  const [aiSummarizer, setAISummarizer] = useState<AISummarizer | null>(null)
  const [summaryText, setSummaryText] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [selectedSummaryLanguage, setSelectedSummaryLanguage] = useState(language)

  // Check API availability and provide user guidance
  const checkAPIAvailability = async () => {
    const status = {
      aiAvailable: 'ai' in window,
      writerAvailable: false,
      summarizerAvailable: false,
      translatorAvailable: false,
      writerStatus: 'not-found',
      summarizerStatus: 'not-found',
      translatorStatus: 'not-found'
    }

    if (status.aiAvailable) {
      try {
        // Check Writer API
        if ('writer' in window.ai) {
          const writerCapabilities = await window.ai.writer.capabilities()
          status.writerAvailable = writerCapabilities.available === 'readily'
          status.writerStatus = writerCapabilities.available
        }

        // Check Summarizer API  
        if ('summarizer' in window.ai) {
          const summarizerCapabilities = await window.ai.summarizer.capabilities()
          status.summarizerAvailable = summarizerCapabilities.available === 'readily'
          status.summarizerStatus = summarizerCapabilities.available
        }

        // Check Translator API
        if ('translator' in window.ai) {
          const translatorCapabilities = await window.ai.translator.capabilities()
          status.translatorAvailable = translatorCapabilities.available === 'readily'
          status.translatorStatus = translatorCapabilities.available
        }
      } catch (error) {
        console.error('API capability check failed:', error)
      }
    }

    console.log('Gemini Nano API Status:', status)
    return status
  }

  // Initialize Gemini Nano APIs
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const status = await checkAPIAvailability()
        setApiStatus(status)
        
        if (!status.aiAvailable) {
          console.warn('❌ Gemini Nano not available. Please use Chrome Canary with flags enabled.')
          return
        }

        if ('ai' in window) {
          // Initialize Writer API
          if ('writer' in window.ai) {
            const writerCapabilities = await window.ai.writer.capabilities()
            if (writerCapabilities.available === 'readily') {
              const writer = await window.ai.writer.create()
              setAIWriter(writer)
              console.log('Gemini Nano Writer initialized')
            }
          }
          
          // Initialize Summarizer API
          if ('summarizer' in window.ai) {
            const summarizerCapabilities = await window.ai.summarizer.capabilities()
            if (summarizerCapabilities.available === 'readily') {
              const summarizer = await window.ai.summarizer.create()
              setAISummarizer(summarizer)
              console.log('Gemini Nano Summarizer initialized')
            }
          }
          
          // Translator API will be initialized on-demand for each translation
        }
      } catch (error) {
        console.log('Gemini Nano initialization failed:', error)
      }
    }
    
    initializeAI()
  }, [language])

  // Get current context for AI generation
  const getCurrentContext = () => {
    const currentTask = tasks.find(t => t.id === currentTaskId)
    const timeLeft = Math.ceil(remainingSeconds / 60)
    
    if (status === 'running' && mode === 'pomodoro') {
      return `User is working on a Pomodoro session${currentTask ? ` on task "${currentTask.title}"` : ''}. ${timeLeft} minutes remaining. Need encouragement to stay focused.`
    } else if (status === 'running' && mode === 'shortBreak') {
      return `User is on a short break. ${timeLeft} minutes remaining. Need relaxing, refreshing message.`
    } else if (status === 'running' && mode === 'longBreak') {
      return `User is on a long break. ${timeLeft} minutes remaining. Need restorative, peaceful message.`
    } else if (status === 'paused') {
      return `User paused their session. Need gentle motivation to continue.`
    } else if (status === 'idle' && remainingSeconds === 0) {
      return `Session just finished. Need celebration and transition message.`
    } else {
      return `User is ready to start. Need motivational startup message.`
    }
  }

  // Fallback message templates
  const getRandomTemplate = (context: string) => {
    const templates = {
      working: [
        "🐾 You're in your focus zone! Just like a cat stalking its prey, stay concentrated and catch your goals! 💪",
        "😸 Purrfect focus! You're doing great - keep that productivity flowing like a contented cat's purr! ✨",
        "🐱 Sharp focus, just like a cat! You've got this - stay determined and make every minute count! 🎯"
      ],
      shortBreak: [
        "😴 Time to stretch like a sleepy cat! Take a moment to relax and recharge your energy~ ☕",
        "🐾 Break time! Just like cats need their rest, you deserve this peaceful moment to breathe~ 🌸"
      ],
      longBreak: [
        "🐾 Long break, just like a cat's afternoon nap! Take your time to truly rest and restore~ 🌙",
        "😴 Extended relaxation time! Like a content cat in a sunny spot, enjoy this peaceful break~ ☀️"
      ],
      paused: [
        "⏸️ Taking a pause, like a cat deciding its next move! When you're ready, jump back in~ 🐾",
        "😸 Sometimes even cats pause to think! Take your time, and continue when you feel ready~ ✨"
      ],
      finished: [
        "🎉 Mission accomplished! You've been as dedicated as a cat with its favorite toy! Time to celebrate~ ✨",
        "😸 Fantastic work! You've shown the determination of a cat - focused, persistent, and successful! 🏆"
      ],
      ready: [
        "👋 Ready to begin? Like a cat preparing to pounce, let's focus and make this session amazing! 🐾",
        "😸 Time to start your productive journey! Channel your inner cat - alert, focused, and ready! ⚡"
      ]
    }

    let category = 'ready'
    if (context.includes('working') || context.includes('Pomodoro')) category = 'working'
    else if (context.includes('short break')) category = 'shortBreak'
    else if (context.includes('long break')) category = 'longBreak'
    else if (context.includes('paused')) category = 'paused'
    else if (context.includes('finished')) category = 'finished'

    const messages = templates[category as keyof typeof templates] || templates.ready
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Generate AI message with translation
  const generateMessage = async () => {
    setIsGenerating(true)
    
    try {
      const context = getCurrentContext()
      let message = ''
      
      if (aiWriter) {
        const prompt = `Write a short, encouraging message (max 50 words) from a friendly cat companion for a Pomodoro timer app. Context: ${context}. Requirements: - Warm, supportive tone - Use cat-related expressions occasionally - Be specific to the situation - Include appropriate emoji - Keep it personal and motivating`
        const response = await aiWriter.write(prompt)
        message = response.trim()
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
        message = getRandomTemplate(context)
      }

      // Translate if target language is different from English
      if (selectedMessageLanguage !== 'en-US') {
        console.log('Selected language:', selectedMessageLanguage, 'Original message:', message)
        const translatedMessage = await translateText(message, selectedMessageLanguage)
        console.log('Translated message:', translatedMessage)
        setGeneratedMessage(translatedMessage)
      } else {
        setGeneratedMessage(message)
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      const context = getCurrentContext()
      const fallbackMessage = getRandomTemplate(context)
      setGeneratedMessage(fallbackMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // Save message
  const saveMessage = () => {
    if (!generatedMessage) return
    
    const newMessage: GeneratedAIMessage = {
      id: Date.now().toString(),
      text: generatedMessage,
      context: getCurrentContext(),
      createdAt: Date.now()
    }
    
    updateSettings({
      aiMessages: [newMessage, ...aiMessages]
    })
    setGeneratedMessage('')
  }

  // Delete message
  const deleteMessage = (id: string) => {
    updateSettings({
      aiMessages: aiMessages.filter(msg => msg.id !== id)
    })
  }

  // Toggle using AI messages
  const toggleAIMessages = () => {
    updateSettings({
      useAIMessages: !useAIMessages
    })
  }

  // Language options for AI translation
  const languageOptions = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  ]

  // Convert locale codes to simple language codes for Gemini Nano API
  const getSimpleLanguageCode = (localeCode: string): string => {
    const mapping: Record<string, string> = {
      'en-US': 'en',
      'zh-CN': 'zh',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
      'es-ES': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'pt-PT': 'pt',
      'ru-RU': 'ru',
      'it-IT': 'it',
    }
    return mapping[localeCode] || localeCode.split('-')[0]
  }

  // Translate text using AI or fallback
  const translateText = async (text: string, targetLanguage: string) => {
    try {
      if (targetLanguage === 'en-US' || targetLanguage === 'en') {
        return text // No translation needed for English
      }

      // Convert to simple language code
      const simpleTargetLang = getSimpleLanguageCode(targetLanguage)
      console.log(`Converting ${targetLanguage} to ${simpleTargetLang}`)

      // Check if Translator API is available
      if ('translator' in window.ai) {
        const translatorCapabilities = await window.ai.translator.capabilities()
        console.log('Translator capabilities:', translatorCapabilities)
        
        if (translatorCapabilities.available === 'readily') {
          // Create a new translator instance for this specific translation
          const translator = await window.ai.translator.create({
            sourceLanguage: 'en',
            targetLanguage: simpleTargetLang
          })
          console.log(`Translating to ${simpleTargetLang}:`, text)
          const translatedText = await translator.translate(text, {
            sourceLanguage: 'en',
            targetLanguage: simpleTargetLang
          })
          console.log(`Translation result:`, translatedText)
          return translatedText
        } else {
          console.log('Translator not readily available:', translatorCapabilities.available)
        }
      } else {
        console.log('Translator API not found in window.ai')
      }
      
      console.log('Translation not available, returning original text')
      return text // Return original if translation not available
    } catch (error) {
      console.error('Translation failed:', error)
      console.error('Error details:', error)
      return text // Return original text on error
    }
  }

  // Generate daily summary with translation
  const generateDailySummary = async () => {
    setIsSummarizing(true)
    
    try {
      const completedTasks = tasks.filter(t => t.status === 'completed')
      const totalFocusTime = Math.round(tasks.reduce((acc, task) => acc + (task.totalTimeSpent || 0), 0) / 60)
      const totalTasks = tasks.length
      
      const summaryData = `Today's Productivity Summary:
- Completed ${completedTasks.length} out of ${totalTasks} tasks
- Total focus time: ${totalFocusTime} minutes
- Tasks: ${tasks.map(t => `"${t.title}" (${t.status})`).join(', ')}`

      let summary = ''
      
      if (aiSummarizer) {
        summary = await aiSummarizer.summarize(summaryData + '\\n\\nProvide encouraging analysis with specific insights about productivity patterns and motivational suggestions for improvement.')
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (completedTasks.length === 0) {
          summary = `🐾 Today was a planning day! You set up ${totalTasks} tasks, which shows great intention. Tomorrow, try the "2-minute rule" - if a task takes less than 2 minutes, do it right away. Your cat companion believes in you! 💪`
        } else if (completedTasks.length === totalTasks && totalTasks > 0) {
          summary = `🎉 Purrfect day! You completed all ${totalTasks} tasks with ${totalFocusTime} minutes of focused work. You're like a determined cat who caught all the mice! Keep this momentum going tomorrow! ✨`
        } else if (completedTasks.length / totalTasks >= 0.7) {
          summary = `🌟 Great productivity! You finished ${completedTasks.length} out of ${totalTasks} tasks (${Math.round(completedTasks.length/totalTasks*100)}%) with ${totalFocusTime} minutes of focus. Like a smart cat, you're learning the balance between work and rest. Try time-blocking tomorrow to boost efficiency! 📅`
        } else if (completedTasks.length > 0) {
          summary = `🐱 Making progress! You completed ${completedTasks.length} tasks and focused for ${totalFocusTime} minutes. Every step counts, just like how cats learn to hunt one pounce at a time. Tomorrow, try starting with your easiest task to build momentum! 🚀`
        } else {
          summary = `😸 A reflection day! Sometimes we need to pause and plan, just like cats observing before they act. With ${totalTasks} tasks ready, tomorrow is full of potential. Start with just one small task - you've got this! 🌱`
        }
      }

      // Translate if target language is different from English
      if (selectedSummaryLanguage !== 'en-US') {
        console.log('Selected summary language:', selectedSummaryLanguage, 'Original summary:', summary)
        const translatedSummary = await translateText(summary, selectedSummaryLanguage)
        console.log('Translated summary:', translatedSummary)
        setSummaryText(translatedSummary)
      } else {
        setSummaryText(summary)
      }
    } catch (error) {
      console.error('Summary generation failed:', error)
      const errorMessage = '😿 Unable to generate summary right now. But remember - every day you show up is a victory! Keep going, productivity champion! 💫'
      
      if (selectedSummaryLanguage !== 'en-US') {
        const translatedError = await translateText(errorMessage, selectedSummaryLanguage)
        setSummaryText(translatedError)
      } else {
        setSummaryText(errorMessage)
      }
    } finally {
      setIsSummarizing(false)
    }
  }

  // AI menu configuration
  const aiMenu = [
    {
      id: 'catMessages' as AIView,
      title: 'Cat Messages',
      description: 'Generate personalized motivational messages',
      icon: MessageCircle,
      color: 'bg-blue-500',
    },
    {
      id: 'dailySummary' as AIView,
      title: 'Daily Summary',
      description: 'AI-powered productivity analysis',
      icon: BarChart3,
      color: 'bg-green-500',
    },
  ]

  // Render main menu
  const renderMainMenu = () => (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          🤖 AI Assistant
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Enhance your productivity with AI
        </p>
      </div>

      {/* API Status Display */}
      {!apiStatus.aiAvailable && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-red-400 bg-red-900/20' 
            : 'border-red-300 bg-red-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500">⚠️</span>
            <span className={`font-medium text-sm ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              Gemini Nano Not Available
            </span>
          </div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            To use AI features, please use <strong>Chrome Canary</strong> with these flags enabled:
          </p>
          <ul className={`text-xs mt-2 space-y-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <li>• chrome://flags/#optimization-guide-on-device-model</li>
            <li>• chrome://flags/#prompt-api-for-gemini-nano</li>
            <li>• chrome://flags/#translation-api</li>
          </ul>
        </div>
      )}

      {apiStatus.aiAvailable && (
        <div className={`p-3 rounded-lg border ${
          theme === 'dark' 
            ? 'border-blue-400 bg-blue-900/20' 
            : 'border-blue-300 bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-500">ℹ️</span>
            <span className={`font-medium text-xs ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              API Status
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className={apiStatus.writerAvailable ? '🟢' : apiStatus.writerStatus === 'after-download' ? '🟡' : '🔴'}>
                {apiStatus.writerAvailable ? '●' : apiStatus.writerStatus === 'after-download' ? '●' : '●'}
              </span>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Writer</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={apiStatus.summarizerAvailable ? '🟢' : apiStatus.summarizerStatus === 'after-download' ? '🟡' : '🔴'}>
                {apiStatus.summarizerAvailable ? '●' : apiStatus.summarizerStatus === 'after-download' ? '●' : '●'}
              </span>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Summarizer</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={apiStatus.translatorAvailable ? '🟢' : apiStatus.translatorStatus === 'after-download' ? '🟡' : '🔴'}>
                {apiStatus.translatorAvailable ? '●' : apiStatus.translatorStatus === 'after-download' ? '●' : '●'}
              </span>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Translator</span>
            </div>
          </div>
          <p className={`text-xs mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            🟢 Ready • 🟡 Download needed • 🔴 Not available
          </p>
          {(apiStatus.writerStatus === 'after-download' || 
            apiStatus.summarizerStatus === 'after-download' || 
            apiStatus.translatorStatus === 'after-download') && (
            <p className={`text-xs mt-2 italic ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              💡 Try generating content to trigger model downloads
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {aiMenu.map(feature => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              onClick={() => setCurrentView(feature.id)}
              className={`w-full p-4 rounded-xl transition-all border ${
                theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-700/70 border-gray-600 hover:border-gray-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <Icon size={24} color="white" />
                </div>
                <div className="text-left flex-1">
                  <div className={`font-semibold text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </div>
                </div>
                <div className={`${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <ArrowLeft size={20} className="rotate-180" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Bot className={`w-4 h-4 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <span className={`font-medium text-sm ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            AI Status
          </span>
        </div>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {aiWriter || aiSummarizer ? (
            <p className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              ✨ Gemini Nano active - Advanced AI features enabled
            </p>
          ) : (
            <p>
              🤖 Using fallback systems - Smart templates and analysis available
            </p>
          )}
        </div>
      </div>
    </div>
  )

  // Render Cat Messages view
  const renderCatMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            🐱 Cat Messages
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Generate personalized motivational messages
          </p>
        </div>
      </div>

      <div className={`p-3 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <strong>Current Context:</strong> {getCurrentContext()}
        </p>
      </div>

      {/* Language Selection for Messages */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-700/30' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`font-medium mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          🌍 Message Language
        </h3>
        <select
          value={selectedMessageLanguage}
          onChange={(e) => setSelectedMessageLanguage(e.target.value as typeof selectedMessageLanguage)}
          className={`w-full p-2 rounded-lg border text-sm ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <p className={`text-xs mt-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Choose the language for generated cat messages
        </p>
      </div>

      <button
        onClick={generateMessage}
        disabled={isGenerating}
        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300 ${
          isGenerating
            ? theme === 'dark'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isGenerating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isGenerating ? 'Generating...' : 'Generate Message'}
      </button>

      <div className={`text-xs text-center ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {aiWriter ? (
          <p className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            ✨ Gemini Nano AI active - Advanced generation enabled
          </p>
        ) : (
          <p>
            🤖 Using smart template system - Works without Gemini Nano
          </p>
        )}
      </div>

      {generatedMessage && (
        <div className={`p-4 rounded-lg border-2 border-dashed ${
          theme === 'dark' 
            ? 'border-green-400 bg-green-900/20' 
            : 'border-green-300 bg-green-50'
        }`}>
          <p className={`text-sm mb-3 ${
            theme === 'dark' ? 'text-green-300' : 'text-green-800'
          }`}>
            {generatedMessage}
          </p>
          <div className="flex gap-2">
            <button
              onClick={saveMessage}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={() => setGeneratedMessage('')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              <Trash2 className="w-3 h-3" />
              Discard
            </button>
          </div>
        </div>
      )}

      <div className={`p-3 rounded-lg border ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-700/30' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useAIMessages}
            onChange={toggleAIMessages}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Use AI messages for cat companion
          </span>
        </label>
        <p className={`text-xs mt-1 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Replace default cat messages with your AI-generated ones
        </p>
      </div>

      {aiMessages.length > 0 && (
        <div>
          <h4 className={`font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Saved Messages ({aiMessages.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {aiMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700/30'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {message.text}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Render Daily Summary view
  const renderDailySummary = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            📊 Daily Summary
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            AI-powered productivity analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Award className={`w-4 h-4 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <span className={`font-medium text-xs ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Completed Tasks
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {tasks.filter(t => t.status === 'completed').length}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-4 h-4 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`font-medium text-xs ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Focus Time
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {Math.round(tasks.reduce((acc, task) => acc + (task.totalTimeSpent || 0), 0) / 60)}m
          </div>
        </div>
      </div>

      {/* Language Selection for Summary */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'border-gray-600 bg-gray-700/30' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          🌍 Summary Language
        </h3>
        <select
          value={selectedSummaryLanguage}
          onChange={(e) => setSelectedSummaryLanguage(e.target.value as typeof selectedSummaryLanguage)}
          className={`w-full p-2 rounded-lg border text-sm ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <p className={`text-xs mt-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Choose the language for your daily productivity summary
        </p>
      </div>

      <button
        onClick={generateDailySummary}
        disabled={isSummarizing}
        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300 ${
          isSummarizing
            ? theme === 'dark'
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : theme === 'dark'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isSummarizing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <BarChart3 className="w-4 h-4" />
        )}
        {isSummarizing ? 'Analyzing...' : 'Generate Daily Summary'}
      </button>

      {summaryText && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'border-blue-400 bg-blue-900/20' 
            : 'border-blue-300 bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className={`w-4 h-4 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <span className={`font-medium text-sm ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Today's Productivity Summary
            </span>
          </div>
          <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
            theme === 'dark' ? 'text-blue-200' : 'text-blue-900'
          }`}>
            {summaryText}
          </div>
        </div>
      )}

      <div className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'
      }`}>
        <h3 className={`font-medium mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          💡 Summary Features
        </h3>
        <div className={`space-y-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p>• Analyzes your completed tasks and focus time</p>
          <p>• Provides personalized productivity insights</p>
          <p>• Suggests improvements for tomorrow</p>
          <p>• Encourages or motivates based on performance</p>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={`w-full max-w-lg mx-auto mt-4 rounded-xl p-6 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/90 backdrop-blur border border-gray-700'
          : 'bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100'
      }`}
    >
      {currentView === 'menu' && renderMainMenu()}
      {currentView === 'catMessages' && renderCatMessages()}
      {currentView === 'dailySummary' && renderDailySummary()}
    </div>
  )
}