// The résumé. /cv renders this; print it (or "Save as PDF") for the PDF version.
export const CV = {
  summary:
    'Third-year computer engineering student who builds and ships production software. Founder of Velarox, where I’ve designed, built, and launched three products end to end — frontend, backend, data, and deployment. Comfortable across Python and TypeScript, and increasingly focused on machine learning.',
  experience: [
    {
      title: 'Velarox — Founder',
      when: '2024 — present',
      org: 'Edmonton, Alberta · Solo',
      points: [
        'Designed and shipped Aperis, a dating app matching on a weighted five-dimension compatibility model rather than photos; now live on the App Store.',
        'Built Reflct, an AI journaling tool on the Anthropic API with a contextual memory layer that carries state across sessions.',
        'Built Cadence, a multi-platform content scheduler with an adapter-per-platform architecture, OAuth integration, and a background publishing worker.',
        'Own the full stack across all three: React/TypeScript frontends, FastAPI backends, Firestore, Firebase Auth, and deployment.',
      ],
    },
  ],
  projects: [
    { title: 'Aperis', when: '2024 — present', text: 'Appearance-blind dating app. React Native (Expo), FastAPI, Firestore, Firebase Auth. Hand-tuned scoring engine with nightly batch matching.' },
    { title: 'Reflct', when: '2025 — present', text: 'AI journaling companion. React + Vite, FastAPI, Anthropic API. Contextual memory across entries.' },
    { title: 'Cadence', when: '2025 — present', text: 'Content scheduling tool. React, FastAPI, OAuth, Tauri desktop build. Adapter pattern per platform.' },
    { title: 'Reinforcement learning agents', when: '2025', text: 'MaskablePPO agents on custom Gymnasium environments using Stable-Baselines3.' },
  ],
  skills: [
    ['Languages', 'Python, TypeScript, JavaScript, SQL, C'],
    ['ML', 'PyTorch, NumPy, Pandas, scikit-learn, Stable-Baselines3, Gymnasium, Anthropic API'],
    ['Product', 'React, React Native, Next.js, FastAPI, Firebase Auth, Firestore, Tauri'],
    ['Tools', 'Git, Linux, Docker, Figma, Vercel'],
  ],
  education: [{ title: 'University of Alberta', when: '2023 — 2028', org: 'BSc Computer Engineering — Software Option, Co-op Program' }],
  languages: [
    ['Fluent', 'English, Sinhala'],
    ['Learning', 'French (A2, working toward B2)'],
  ],
};
