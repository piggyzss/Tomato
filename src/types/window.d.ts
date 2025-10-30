// Chrome AI API type declarations
interface AILanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no'
}

interface AILanguageModel {
  capabilities(): Promise<AILanguageModelCapabilities>
  create(options?: { temperature?: number; topK?: number }): Promise<any>
}

interface AI {
  languageModel?: AILanguageModel
  writer?: any
  summarizer?: any
}

declare global {
  interface Window {
    ai?: AI
  }
}

export {}
