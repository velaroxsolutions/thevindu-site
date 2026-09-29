import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const lane = z.enum(['build', 'study']);

/* ---------- Products / case studies (MDX) ---------- */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    tagline: z.string(),
    lede: z.string(), // may contain <em>
    summary: z.string(),
    status: z.string(),
    hot: z.boolean().default(false),
    accent: z.enum(['build', 'study', 'neutral']).default('build'),
    stack: z.array(z.string()),
    started: z.string(),
    role: z.string().optional(),
    links: z.array(z.object({ label: z.string(), href: z.string(), primary: z.boolean().optional() })).default([]),
    stats: z.array(z.object({ value: z.string(), label: z.string(), count: z.number().optional() })).default([]),
    shots: z.array(z.string()).default([]),
    tradeoffs: z.array(z.object({ decision: z.string(), cost: z.string() })).default([]),
    arch: z
      .object({
        nodes: z.array(z.object({ id: z.string(), label: z.string(), sub: z.string(), x: z.number(), y: z.number() })),
        edges: z.array(z.tuple([z.string(), z.string()])),
      })
      .optional(),
  }),
});

/* ---------- Library ---------- */
const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    verdict: z.enum(['Reading', 'Worth it', 'Mixed', 'Skim it', 'Shelved']),
    take: z.string().optional(),
    year: z.number().optional(), // year I read it
    cover: z.string().optional(), // /covers/x.jpg in public — optional, falls back to a generated cover
    featured: z.boolean().default(false),
    quote: z.string().optional(),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    code: z.string(),
    name: z.string(),
    blurb: z.string(),
    pages: z.number(),
    term: z.string().optional(),
    pdf: z.string().optional(), // /notes/engg-404.pdf in public
    added: z.coerce.date(),
  }),
});

const templates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/templates' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    group: z.enum(['Software', 'AI', 'Content']),
    kind: z.enum(['Repo', 'Guide', 'Doc']),
    href: z.string().optional(), // external repo link; if absent the body is the template
    copyable: z.boolean().default(false),
    added: z.coerce.date(),
  }),
});

/* ---------- Writing ---------- */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    lane: lane.default('study'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* ---------- Structured data (YAML) ---------- */
const log = defineCollection({
  loader: file('./src/data/log.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    kind: z.enum(['Shipped', 'Broke', 'Learned', 'Stuck', 'Reading', 'Started']),
    text: z.string(),
    project: z.string().optional(),
  }),
});

const skills = defineCollection({
  loader: file('./src/data/skills.yaml'),
  schema: z.object({
    name: z.string(),
    group: z.enum(['sw', 'ai', 'co', 'de']),
    level: z.number().min(1).max(12),
    years: z.string(),
    where: z.string(),
    note: z.string(),
  }),
});

const timeline = defineCollection({
  loader: file('./src/data/timeline.yaml'),
  schema: z.object({
    when: z.string(),
    title: z.string(),
    text: z.string(),
    tag: z.string(),
    lane: z.enum(['build', 'study', 'life']),
    order: z.number(),
  }),
});

const experiments = defineCollection({
  loader: file('./src/data/experiments.yaml'),
  schema: z.object({
    title: z.string(),
    text: z.string(),
    kind: z.string(),
    year: z.number(),
    href: z.string().optional(),
  }),
});

export const collections = { projects, books, courses, templates, notes, log, skills, timeline, experiments };
