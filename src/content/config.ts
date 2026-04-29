// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const sections = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sections" }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    eyebrowNumber: z.string(),
    accent: z.enum(["red", "gold", "neutral"]),
    kanji: z.string(),
    lede: z.string().optional(),
  }),
});

const dojos = defineCollection({
  loader: file("./src/content/dojos.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    address: z.object({
      street: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
    }),
    geo: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    photo: z.string(),
    schedule: z.array(
      z.object({
        day: z.string(),
        time: z.string(),
        modality: z.enum(["kendo", "iaido"]),
      })
    ),
  }),
});

const faq = defineCollection({
  loader: file("./src/content/faq.json"),
  schema: z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { sections, dojos, faq };
