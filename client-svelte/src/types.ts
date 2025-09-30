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
  createdAt: string
  updatedAt: string
  sponsorId?: string
  parentId?: string
}

export interface Stats {
  totalEntities: number
  byType: Record<string, number>
}

export interface EntityWithChildren extends Entity {
  children?: EntityWithChildren[]
  expanded?: boolean
}
