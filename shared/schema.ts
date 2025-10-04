
// @todo note this schema is obsolete - and was based around psql anyway
// @todo this was a replit generated tool - unused atm

import { z } from "zod";

export const portfolioObjectSchema = z.object({
  path: z.string(),
  name: z.string(),
  sponsors: z.string().optional(),
  created: z.string(),
  updated: z.string().optional(),
  begins: z.string().optional(),
  ends: z.string().optional(),
  description: z.string(),
  tags: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  coordinates: z.array(z.number()).optional(),
  radius: z.number().optional(),
  size: z.number().optional(),
  color: z.string().optional(),
  image: z.string().optional(),
  duration: z.number().optional(),
  depiction: z.string().optional(),
  category: z.string().optional(),
  viewType: z.enum(['default', 'photos', 'gallery', 'timeline', 'listview', 'library']).default('default').optional(),
  photos: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    date: z.string().optional(),
  })).optional(),
  // For listview objects - array of object references
  objects: z.array(z.object({
    path: z.string(),
    name: z.string(),
    created: z.string(),
    category: z.string(),
    description: z.string().optional(),
    tags: z.string().optional(),
    sponsors: z.string().optional(),
    image: z.string().optional(),
  })).optional(),
  // Long form content (markdown)
  content: z.string().optional(),
  // Cache metadata
  _cached: z.number().optional(),
});

export type PortfolioObject = z.infer<typeof portfolioObjectSchema>;

export const portfolioCollectionSchema = z.object({
  objects: z.array(portfolioObjectSchema),
  path: z.string(),
  lastFetched: z.number(),
});

export type PortfolioCollection = z.infer<typeof portfolioCollectionSchema>;

export const portfolioIndexSchema = z.object({
  name: z.string(),
  description: z.string(),
  created: z.string(),
  category: z.string(),
  objects: z.array(z.object({
    path: z.string(),
    name: z.string(),
    created: z.string(),
    category: z.string(),
    // Optional fields that may be in stubs for display optimization
    description: z.string().optional(),
    tags: z.string().optional(),
    sponsors: z.string().optional(),
    image: z.string().optional(),
  })),
});

export type PortfolioIndex = z.infer<typeof portfolioIndexSchema>;
