// The résumé. /cv renders this; print it (or "Save as PDF") for the PDF version.
export const CV = {
  summary:
    'Computer engineering student at the University of Alberta who builds and ships full-stack and AI products, mostly on my own. Currently a junior curriculum developer at the University of Alberta, and building Aperis, an appearance-blind dating app live on the App Store and in closed testing on Google Play. Most interested in AI engineering: turning models into things people actually use.',
  experience: [
    {
      title: 'Junior Curriculum Developer',
      when: 'Sep 2026 — present',
      org: 'University of Alberta · Edmonton, AB',
      points: ['Research and development on making learning more effective: developing new projects and approaches to how course material is taught.'], // VERIFY wording
    },
    {
      title: 'Marketing Intern',
      when: 'Jun 2025 — Aug 2025',
      org: 'Overhill Games · Edmonton, AB',
      points: [
        'Built and executed social media campaigns generating 100K+ views on Instagram.',
        'Launched a crowdfunding campaign reaching 300+ wishlists and grew the community by 500+ followers across platforms.',
        'Produced graphics and short-form video with the development team to align messaging with the product.',
      ],
    },
  ],
  projects: [
    { title: 'Aperis', when: 'Apr 2026 — present', text: 'Appearance-blind dating app, live on the App Store and in Google Play closed testing. React Native, FastAPI, Firestore. Weighted matching across 5 psychological dimensions with an attachment-style multiplier; 5-layer profile reveal driven by a conversation health score.' },
    { title: 'Reflct', when: '2026', text: 'AI journaling companion with a memory layer that carries context across entries. React, FastAPI, Claude API.' },
    { title: 'Cadence', when: '2026', text: 'Free multi-platform content scheduler. React, FastAPI, OAuth, Tauri desktop build; one adapter per platform and a background publishing worker.' },
    { title: 'Reinforcement learning agent', when: 'Jan — Feb 2026', text: 'Custom Gymnasium environment; MaskablePPO trained through 100,000 timesteps of self-play to a 100% win rate. React/Vite on Vercel, FastAPI on Render.' },
    { title: 'Athenyx', when: 'Jul 2025 — Jan 2026', text: 'Student productivity platform with automatic flashcard generation, calendar-synced to-dos, and an AI assistant. Next.js, React, Firebase.' },
    { title: 'FEPS', when: 'Jan — Mar 2024', text: 'Assistive accessories for users with limited hand mobility (ENGG 160 design project).' },
  ],
  skills: [
    ['Languages', 'Python, JavaScript, HTML/CSS, SQL'],
    ['AI', 'Claude API, Stable-Baselines3, Gymnasium, scikit-learn, NumPy, Pandas'],
    ['Product', 'React, Next.js, React Native, Expo, Node.js, FastAPI, Firebase, Tauri'],
    ['Tools & design', 'Git, Postman, Vercel, Render, EAS, Figma, Illustrator, Blender'],
  ],
  education: [{ title: 'University of Alberta', when: '2023 — 2028', org: 'BSc Computer Engineering — Software Option, Co-op · President’s International Distinction Scholarship' }],
  certificates: [
    ['CS50x', 'edX · Feb 2025'],
    ['Machine Learning A-Z', 'Udemy · May 2025'],
    ['Complete Full Stack Web Development Bootcamp', 'Udemy · Mar 2025'],
    ['AI Foundations: Thinking Machines', 'LinkedIn Learning · Dec 2024'],
    ['Introduction to Generative AI', 'Google Cloud · Dec 2024'],
  ],
  awards: [
    ['President’s International Distinction Scholarship', 'University of Alberta · Sep 2023 — present'],
    ['International Admission Scholarship', 'University of Alberta · 2023'],
  ],
  languages: [
    ['Fluent', 'English'],
    ['Conversational', 'Sinhala'],
    ['Beginner', 'French, Hindi'],
  ],
};
