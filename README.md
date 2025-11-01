# 🍅🐱 Tomato Cat Timer

> An AI-powered Pomodoro timer Chrome extension that helps you stay focused and productive.

[![Chrome Built-in AI](https://img.shields.io/badge/Chrome%20Built--in%20AI-Enabled-blue)](https://developer.chrome.com/docs/ai/built-in)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Tomato Cat Timer** combines the proven Pomodoro Technique with Chrome's Built-in AI to provide intelligent productivity insights and companionship. All AI features run locally on your device for complete privacy.

---

## ✨ Features

### 🤖 AI-Powered Features

- **Chat Cat** - Your friendly AI companion that provides encouragement and support during work sessions (uses Chrome Prompt API)
- **Daily Summary** - Automatically generates intelligent insights about your productivity patterns (uses Chrome Summarizer API)
- **Smart AI Switching** - Seamlessly falls back to cloud AI when needed, with user preference controls

### 📊 Core Productivity Features

- **Pomodoro Timer** - Customizable work/break intervals (default: 25/5/15 minutes)
- **Task Management** - Create, track, and complete tasks with automatic time tracking
- **Analytics Dashboard** - View task completion rates and time analysis with flexible filtering
- **Multi-language Support** - English, Chinese (简体中文), and Japanese (日本語)
- **Dark/Light Mode** - Comfortable viewing in any environment
- **Data Persistence** - All your data is saved locally using Chrome Storage API

---

## 🚀 Quick Start

### Prerequisites

- Chrome/Edge browser version **131+** (Dev or Canary channel recommended)
- Chrome Built-in AI enabled (see [Setup Guide](doc/CHROME_AI_SETUP.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tomato-cat-timer.git
   cd tomato-cat-timer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder
   - Pin the extension to your toolbar

### Enable Chrome Built-in AI

For AI features to work, you need to enable Chrome's Built-in AI:

1. Enable flags at:
   - `chrome://flags/#prompt-api-for-gemini-nano`
   - `chrome://flags/#summarization-api-for-gemini-nano`

2. Download the Gemini Nano model (~1.5GB):
   - Visit `chrome://components/`
   - Find "Optimization Guide On Device Model"
   - Click "Check for update"

📖 **Detailed setup guide**: [doc/CHROME_AI_SETUP.md](doc/CHROME_AI_SETUP.md)

---

## 💡 How to Use

### Basic Workflow

1. **Add a task** - Type your task name and click "Save"
2. **Select the task** - Click on it to make it active
3. **Start the timer** - Click "START" to begin your Pomodoro session
4. **Focus on work** - Work until the timer rings (default: 25 minutes)
5. **Take a break** - Enjoy a short break (5 minutes)
6. **Repeat** - After 4 Pomodoros, take a longer break (15 minutes)

### AI Features

#### Chat Cat
- Click the Bot icon (🤖) at the bottom
- Select "💬 Chat Cat"
- Chat with your AI companion for motivation and support
- Works completely offline!

#### Daily Summary
- Complete some Pomodoro sessions
- Click Bot icon → "📊 Daily Summary"
- Click "Generate Summary" to get AI-powered insights
- Review recommendations to improve your productivity

#### AI Configuration
- Click Bot icon → "⚙️ AI Configuration"
- Choose between Built-in AI (offline) or Cloud AI (requires API key)
- View availability status and configure settings

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5.x
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **AI Integration**: Chrome Built-in AI APIs (Prompt API + Summarizer API)
- **Cloud AI Fallback**: Google Gemini API (optional)

---

## 📁 Project Structure

```
tomato-cat-timer/
├── src/
│   ├── components/          # React components
│   │   ├── AI/             # AI-related features
│   │   ├── Analysis/       # Analytics dashboard
│   │   ├── Settings/       # Settings panels
│   │   └── Common/         # Shared components
│   ├── services/           # Business logic
│   │   ├── aiService.ts              # AI service layer
│   │   └── builtInSummaryService.ts  # Summarizer API wrapper
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand state management
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript definitions
├── doc/                    # Documentation
│   ├── CHROME_AI_SETUP.md           # AI setup guide
│   ├── AI_FEATURES_USER_GUIDE.md    # User guide
│   └── GEMINI_API_KEY_SETUP.md      # Cloud AI setup
└── public/
    └── manifest.json       # Chrome extension manifest
```

---

## 🎨 Chrome Built-in AI Implementation

### Prompt API (Language Model)

Used for conversational AI in Chat Cat:

```typescript
const session = await window.ai.languageModel.create({
  systemPrompt: "You are a cute, encouraging tomato cat assistant..."
});
const response = await session.prompt(userMessage);
```

### Summarizer API

Used for generating daily productivity summaries:

```typescript
const summarizer = await window.ai.summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium'
});
const summary = await summarizer.summarize(productivityData);
```

### Privacy & Offline Features

✅ **100% Local Processing** - All AI runs on your device  
✅ **No Data Upload** - Your data never leaves your machine  
✅ **Offline Capable** - Full functionality without internet  
✅ **Fast Response** - Instant AI feedback

---

## 🔧 Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Development Workflow

1. Make changes to source files in `src/`
2. Run `npm run dev` for development mode
3. Load/reload extension in Chrome
4. Test your changes
5. Run `npm run build` for production build

---

## 📚 Documentation

- **[Chrome AI Setup Guide](doc/CHROME_AI_SETUP.md)** - Complete setup instructions for Chrome Built-in AI
- **[AI Features User Guide](doc/AI_FEATURES_USER_GUIDE.md)** - How to use AI features
- **[Gemini API Key Setup](doc/GEMINI_API_KEY_SETUP.md)** - Optional cloud AI fallback setup
- **[AI Quick Reference](doc/AI_QUICK_REFERENCE.md)** - Developer reference for AI integration
- **[Changelog](doc/CHANGELOG.md)** - Version history and updates

---

## 🙋 FAQ

**Q: Do I need a Gemini API key?**  
A: No! The extension works fully with Chrome Built-in AI. Cloud AI is an optional fallback.

**Q: Does this work offline?**  
A: Yes! All Built-in AI features work completely offline once the model is downloaded.

**Q: What data is collected?**  
A: None. All data stays local on your device. We don't collect or transmit any user data.

**Q: Which Chrome version do I need?**  
A: Chrome 131+ (Dev or Canary channel recommended for best AI support).

**Q: Why isn't the AI working?**  
A: Make sure you've enabled the Chrome flags and downloaded the Gemini Nano model. See [Setup Guide](doc/CHROME_AI_SETUP.md).

**Q: Can I use this in production?**  
A: Yes, but note that Chrome Built-in AI is currently experimental and may change.

---

## 🎯 Roadmap

- [x] Core Pomodoro timer functionality
- [x] Task management system
- [x] Chrome Built-in AI integration (Prompt API)
- [x] Chrome Built-in AI integration (Summarizer API)
- [x] Daily summary and insights
- [x] Analytics dashboard
- [x] Dark/Light theme
- [x] Multi-language support
- [ ] Advanced AI features (Writer API, Rewriter API)
- [ ] Team collaboration features
- [ ] Browser sync across devices
- [ ] Mobile companion app

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏅 Acknowledgments

- **Chrome Built-in AI Team** - For the amazing on-device AI APIs
- **Google Gemini Team** - For the cloud AI fallback option
- **Open Source Community** - For inspiration and tools

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/tomato-cat-timer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tomato-cat-timer/discussions)
- **Email**: your.email@example.com

---

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others

---

> **Note for Judges**: If you're evaluating this project for the Chrome Built-in AI Challenge 2025, please see [JUDGES_README.md](JUDGES_README.md) for quick testing instructions.

---

**Built with ❤️ and 🍅**

*Combining productivity, AI, and a touch of cuteness* 🐱✨
