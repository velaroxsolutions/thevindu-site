// Research shelf (/library/research). Drive files must be shared "Anyone with the link".
const drive = (id: string) => ({ view: `https://drive.google.com/file/d/${id}/view`, preview: `https://drive.google.com/file/d/${id}/preview` });

export const RESEARCH = [
  {
    id: 'contrastive-gap',
    title: 'The contrastive gap in vision-language models',
    kind: 'Undergraduate research · Fyshe Lab, University of Alberta',
    status: 'Ongoing · Fall 2026',
    lane: 'study' as const,
    text: 'Why do image and text embeddings in contrastive models like CLIP end up in separate regions of the same space? I’m continuing work on this question, building on Fahim, Murphy & Fyshe (2024): running experiments and interpreting what they show.', // VERIFY wording
    links: [{ label: 'The paper it builds on (arXiv)', href: 'https://arxiv.org/abs/2405.18570' }],
    docs: [] as { title: string; date: string; text: string; view: string; preview: string }[],
  },
  {
    id: 'viral-short-form',
    title: 'What makes short-form video go viral',
    kind: 'Personal research · social media',
    status: '11 notes · 2024 — 2025',
    lane: 'build' as const,
    text: 'My notes from studying viral videos while running content: hooks, story structure, editing, thumbnails, colour psychology, and breakdowns of channels like MrBeast. Free to read and use.',
    links: [{ label: 'The whole folder on Google Drive', href: 'https://drive.google.com/drive/folders/1tYeuAt-nm8wamchm7K_234QlxZW-3SuT' }],
    docs: [
      { title: 'Viral video planning', date: 'Jul 2024', text: 'A 13-step process from idea to export: titles, thumbnails, research, story structure, scripting, animation and SEO.', ...drive('1SVBrhQ-C8RMW7Ef1AaCxBW9LMCAJ--vy') },
      { title: 'Hooks: the curiosity loop', date: 'Jan 2025', text: 'How the first seconds open a question the viewer needs answered.', ...drive('1UOfYAInpb0RDWkf_CLXttBN5dEP2nq3p') },
      { title: 'Story', date: 'Jun 2024', text: 'A 12-beat structure, tension and contrast, and writing like you’re talking to a friend.', ...drive('1KcbJnLywFwZQSwMkKACTR2zrld5pGjrv') },
      { title: 'Viral short formula', date: 'Aug 2024', text: 'The shape of a short that holds attention to the end.', ...drive('1i6LUN9P-TY8--bJ00-H8v0Sd7ONVRjrg') },
      { title: 'Thumbnails', date: 'Jun 2024', text: 'Types of thumbnails that work, from shock and big numbers to comparison and blur.', ...drive('1gi8fApTLRVNUCXmbGJDSUhyAUjVY4r-Z') },
      { title: 'Instagram shorts hacks', date: 'Jul 2024', text: 'Platform-specific notes for Reels.', ...drive('1qfl5k0psUDRm89Xsnw32vxe-_mTt7bKS') },
      { title: 'MrBeast video analysis', date: 'Jun 2024', text: 'Scene changes every second, partial reveals, climbing emotion, and why most run 39–40 seconds.', ...drive('1LB1rG9_YGb4ujNpgqsCMX9UmN6ETKgIA') },
      { title: 'Documentary-style video analysis', date: 'Jun 2024', text: 'Explosive opening facts, sources in the corner, and four-second scene changes.', ...drive('12Yb_6QbiNPc2VGkQeO4syvcm4s8mwRrc') },
      { title: 'Editing', date: 'Jul 2024', text: 'Guide the eye to one region, keep movement changing, and sync cuts to the music.', ...drive('1fOlXuX0R4PHcmas8cjg36jGcgjJrMA-n') },
      { title: 'Colour psychology', date: 'Jun 2024', text: 'What each colour signals — red for attention, blue for trust, and the rest.', ...drive('1c4PbbTixCkCs2D89l7QhmlSnW0MF1Uw2') },
      { title: 'Retention tips', date: 'Jun 2024', text: 'Length versus retention: why the 30–40 second range matters.', ...drive('1Yr4KEsMKjYtuNdp8kEkDnBveOX3YsU6v') },
    ],
  },
];
