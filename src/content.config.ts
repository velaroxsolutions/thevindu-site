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
    featured: z.boolean().default(true), // false = lives under Smaller things, page still exists
    stage: z.enum(['building', 'shipped']).default('shipped'),
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
    repo: z.string().optional(), // falls back to a same-named repo from the live GitHub data
    appstore: z.boolean().default(false), // pull live version, rating and screenshots from the App Store
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
    verdict: z.enum(['Reading', 'Read', 'Worth it', 'Mixed', 'Skim it', 'Shelved', 'Want to read']),
    summary: z.string().optional(), // public Notion link to my summary
    notion: z.string().optional(), // that page's id — lets the summary render on this site (needs NOTION_TOKEN)
    take: z.string().optional(),
    year: z.number().optional(), // year I read it
    cover: z.string().optional(), // /covers/x.jpg in public — optional, falls back to a generated cover
    featured: z.boolean().default(false),
    quote: z.string().optional(),
  }),
});

/* Completed courses + certificates (not lecture notes) */
const courses = defineCollection({
  loader: file('./src/data/courses.yaml'),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    provider: z.string().optional(),
    date: z.coerce.date().optional(),
    certificate: z.boolean().default(false),
    url: z.string().optional(), // certificate link
    notion: z.string().optional(), // Notion page id of my notes, if auto-matching by title misses it
    topics: z.array(z.string()).default([]),
    lane: lane.default('study'),
  }),
});

/* ---------- Lessons learnt (short, honest; longer ones can have a body) ---------- */
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(), // the lesson itself, one line
    context: z.string(), // a sentence or two of why
    type: z.string(), // filter group on /lessons, e.g. Mindset, Habits, Focus, Career
    order: z.number().default(99),
    date: z.coerce.date().optional(),
    lane: lane.default('study'),
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
    group: z.enum(['sw', 'ai', 'to', 'co', 'de']),
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
    year: z.number().optional(),
    href: z.string().optional(),
  }),
});

const ventures = defineCollection({
  loader: file('./src/data/ventures.yaml'),
  schema: z.object({
    title: z.string(),
    stage: z.enum(['shipped', 'next']),
    status: z.string(),
    text: z.string(),
    when: z.string().optional(),
    stack: z.array(z.string()).default([]),
    href: z.string().optional(),
  }),
});

export const collections = { ventures, projects, books, courses, lessons, log, skills, timeline, experiments };
