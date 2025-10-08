export interface User {
  id: string
  slug: string
  title?: string
}

export interface Entity {
  id: string
  slug?: string
  type: string
  title?: string
  content?: string
  depiction?: string
  view?: string
  auth?: string
  sponsorId?: string
  parentId?: string
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt: string
  metadata?: any
}

export interface Stats {
  totalEntities: number
  byType: Record<string, number>
}

export interface EntityWithChildren extends Entity {
  children?: EntityWithChildren[]
  expanded?: boolean
}
