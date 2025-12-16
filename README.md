<p align="center">
  <img src="assets/logo.png" alt="Unlurk" width="120" />
</p>

<h1 align="center">Unlurk</h1>

<p align="center">
  <strong>Turn lurkers into contributors. One click.</strong>
</p>

<p align="center">
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#how-it-works">How it Works</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/unlurk" alt="npm version" />
  <img src="https://img.shields.io/github/stars/baaakgun4543/unlurk?style=social" alt="GitHub stars" />
  <img src="https://img.shields.io/github/license/baaakgun4543/unlurk" alt="License" />
</p>

---

## The Problem

**90% of community members never post.**

They read. They scroll. They leave.

Not because they have nothing to say—but because:
- "What should I write?"
- "Is this worth posting?"
- "I'll do it later..."

---

## The Solution

**Unlurk writes the first draft. Users just hit post.**

<p align="center">
  <img src="assets/demo.gif" alt="Unlurk Demo" width="600" />
</p>

```
Before:  [Write a comment...          ] → 😰 → leaves

After:   [I've been dealing with      ] → 😮 → [Post]
         [this for 3 months too...    ]
```

---

## Installation

```bash
npm install unlurk
```

Or via CDN:

```html
<script src="https://unpkg.com/unlurk/dist/unlurk.min.js"></script>
```

---

## Usage

### Basic (OpenAI)

```javascript
import Unlurk from 'unlurk';

Unlurk.init({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
});

Unlurk.enhance('#comment-input');
```

### With Context (Better Results)

```javascript
Unlurk.enhance('#comment-input', {
  context: {
    userId: 'user_123',
    userName: 'Sarah',
    userHistory: ['joined 6 months ago', 'kidney disease stage 3'],
    currentPage: 'community/daily-checkin',
    communityTone: 'supportive',
  }
});
```

### Other Providers

```javascript
// Anthropic Claude
Unlurk.init({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-haiku-20240307',
});

// Local Ollama
Unlurk.init({
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434',
});

// Custom provider
Unlurk.init({
  generateFn: async (prompt, context) => {
    // Your custom LLM logic
    return 'Generated draft...';
  },
});
```

---

## How it Works

```
┌─────────────────────────────────────────────────────────┐
│  1. User lands on page with text input                  │
├─────────────────────────────────────────────────────────┤
│  2. Unlurk reads context:                               │
│     - User profile & history                            │
│     - Current page/thread                               │
│     - Community patterns                                │
├─────────────────────────────────────────────────────────┤
│  3. AI generates what user might say                    │
│     (not a question—a draft post)                       │
├─────────────────────────────────────────────────────────┤
│  4. Draft appears in text field                         │
│                                                         │
│     ┌─────────────────────────────────────────────┐     │
│     │ I've been dealing with this for 3 months   │     │
│     │ too. The fatigue is the hardest part...    │     │
│     └─────────────────────────────────────────────┘     │
│              [Edit]  [Post as is]                       │
├─────────────────────────────────────────────────────────┤
│  5. User clicks [Post] → Done. They participated.       │
│                                                         │
│  6. They get replies/likes → Come back → Real member    │
└─────────────────────────────────────────────────────────┘
```

---

## Why It Works

The **1-9-90 Rule** of online communities:
- 1% create content
- 9% engage (comments, likes)
- 90% lurk

Unlurk moves people from the **90%** to the **9%**.

Once they get their first reply or like, they're hooked.

---

## Configuration

```javascript
Unlurk.init({
  // LLM Provider (required)
  provider: 'openai',        // 'anthropic', 'ollama', 'custom'
  apiKey: 'your-api-key',
  model: 'gpt-4o-mini',
  baseUrl: 'http://localhost:11434', // for Ollama

  // Behavior
  trigger: 'focus',          // 'focus', 'hover', 'auto'
  delay: 500,                // ms before generating
  showEditButton: true,
  showPostButton: true,

  // Styling
  theme: 'light',            // 'light', 'dark', 'auto'
  position: 'inline',        // 'inline', 'overlay'
});
```

---

## Framework Support

| Framework | Package | Status |
|-----------|---------|--------|
| Vanilla JS | `unlurk` | ✅ Ready |
| React | `@unlurk/react` | ✅ Ready |
| Vue | `@unlurk/vue` | 🚧 Coming |
| Svelte | `@unlurk/svelte` | 🚧 Coming |

### React Example

```jsx
import { UnlurkInput } from '@unlurk/react';

function CommentBox() {
  return (
    <UnlurkInput
      context={{
        userId: user.id,
        currentThread: thread.id,
      }}
      onPost={(text) => submitComment(text)}
    />
  );
}
```

---

## Use Cases

### Patient Communities
```javascript
// User with kidney disease visits daily check-in
context: {
  condition: 'CKD Stage 3',
  memberSince: '2024-01',
  lastPost: null, // never posted
}

// Generated draft:
"Today was tough. The fatigue hit hard after dialysis."
```

### E-commerce Reviews
```javascript
// User bought running shoes 2 weeks ago
context: {
  product: 'Nike Pegasus 40',
  purchaseDate: '2024-11-01',
  usageData: 'worn 8 times (fitness tracker)',
}

// Generated draft:
"Super comfortable for daily runs. Fits true to size."
```

### Online Courses
```javascript
// Student stuck on lesson 3 for 2 days
context: {
  course: 'Python Basics',
  currentLesson: 'Variables',
  timeOnLesson: '2 days',
}

// Generated draft:
"I'm confused about the difference between let and const."
```

### SaaS Feedback
```javascript
// Power user, never left feedback
context: {
  plan: 'Pro',
  usage: 'daily, 45 min avg',
  feature: 'dashboard',
}

// Generated draft:
"Love the new dashboard. Would be great to add dark mode."
```

---

## Privacy & Ethics

**Unlurk is transparent by design:**

- ✅ Users see AI-generated draft clearly
- ✅ [Edit] button always visible
- ✅ No fake engagement—real users, assisted expression
- ✅ No data sold to third parties
- ✅ GDPR compliant

**What Unlurk is NOT:**
- ❌ A fake review generator
- ❌ A bot that posts without user consent
- ❌ A way to manipulate engagement metrics

---

## Roadmap

- [x] Core SDK (Vanilla JS)
- [x] React bindings
- [ ] Vue bindings
- [ ] Svelte bindings
- [ ] Browser extension (for testing on any site)
- [ ] WordPress plugin
- [ ] Multi-language support

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Clone the repo
git clone https://github.com/baaakgun4543/unlurk.git

# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test
```

---

## License

MIT
