# QuizMaster - Interactive Learning Platform 🚀

QuizMaster is a responsive, feature-rich web application built with vanilla HTML, CSS, and modern JavaScript. It offers personalized quizzes across multiple academic and general knowledge subjects with difficulty levels tailored to education tiers.

---

## ✨ Features

- 🎯 **9 Comprehensive Subjects**: Mathematics, Science, History, Geography, Technology, Literature, Art & Culture, Sports, and General Knowledge.
- 🎓 **Personalized Education Tiers**: Content dynamically adapts from Elementary to Middle School, High School, and College/Professional levels.
- ⏱️ **Configurable Timers & Dynamic Skip**: Customizable countdown timers with visual warning states and skip logic.
- 🔀 **Fair Question Distribution**: Built on the Fisher-Yates (Knuth) shuffle algorithm for uniform randomization.
- 📋 **Interactive Answer Review**: In-depth results review breakdown with correct/incorrect status and time-per-question analysis.
- 🔊 **Synthesized Web Audio FX**: Built-in sound effects (correct chime, incorrect tone, timer ticker, victory fanfare) with mute toggle.
- ⌨️ **Keyboard Accessibility**: Fast keyboard shortcuts (`1-4`, `A-D`, `Enter`, `Space`, `S`, `M`).
- 📱 **Fully Responsive**: Sleek dark-mode glassmorphism aesthetic optimized for desktop, tablet, and mobile devices.

---

## 🚀 Getting Started

### Prerequisites
No build tools or package installations required. Works directly in any modern browser!

### Running the App
Simply open [`index.html`](file:///d:/Projects/FWD-ONLINE-QUIZ-APPLICATION/index.html) directly in your browser, or start a local HTTP server:

```bash
# Python 3
python -m http.server 8080

# Or Node.js npx
npx serve .
```

Then visit: `http://localhost:8080` in your web browser.

---

## 📁 File Structure

```text
├── index.html        # Main HTML structure and UI views
├── style.css         # Styling, glassmorphism themes, and animations
├── script.js         # Core quiz engine, question banks, and audio synthesizer
└── README.md         # Project documentation
```

---

## 📜 License
MIT License
