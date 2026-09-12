<div align="center">

# BENTO

**Your all-in-one personal productivity app**

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/jiteshoffice1234-star/bento-2/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-lightgrey.svg)](https://github.com/jiteshoffice1234-star/bento-2/releases)

[Download APK](https://github.com/jiteshoffice1234-star/bento-2/releases/latest) • [Report Bug](https://github.com/jiteshoffice1234-star/bento-2/issues)

</div>

---

## About

Bento is a comprehensive personal productivity app that brings together all the tools you need to organize your life in one beautiful interface. Built with React, TypeScript, and Capacitor for a native Android experience.

## Features

| Module | Description |
|--------|-------------|
| **Today** | Daily overview, quick actions, and priorities |
| **Tasks** | Full task management with tags, priorities, and categories |
| **Calendar** | Visual calendar with event tracking |
| **Goals** | Goal setting and progress tracking |
| **Finance** | Expense tracking and financial insights |
| **Habits** | Habit builder with streak tracking |
| **Routines** | Daily and custom routine management |
| **Projects** | Project tracker with status updates |
| **Insights** | Analytics and productivity insights |
| **AI** | AI-powered assistant for smart suggestions |
| **Search** | Global search across all modules |
| **Settings** | Theme customization, data export/import |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **State:** Zustand
- **Routing:** React Router v7
- **Charts:** Recharts
- **Mobile:** Capacitor 8 (Android)
- **UI:** Lucide Icons, custom CSS

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://npmjs.com/)

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Android

```bash
# Sync with Android
npm run build:android

# Open in Android Studio
npm run cap:open:android
```

## Download

Download the latest APK from [Releases](https://github.com/jiteshoffice1234-star/bento-2/releases/latest).

| File | Description |
|------|-------------|
| `Bento-2.1.apk` | Stable release |
| `bento-2.1-debug.apk` | Debug build with dev tools |

## Project Structure

```
bento/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page modules (Today, Tasks, Calendar, etc.)
│   ├── services/      # AI, migration, and utility services
│   ├── store/         # Zustand state management
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions
├── android/           # Capacitor Android project
├── public/            # Static assets
└── capacitor.config.ts
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Made with passion by [Jitesh Solanki](https://github.com/jiteshoffice1234-star)

</div>
