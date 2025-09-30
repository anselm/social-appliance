import { writable } from 'svelte/store'
import type { Entity, EntityWithChildren } from '../types'

export const entities = writable<Entity[]>([])
export const treeEntities = writable<EntityWithChildren[]>([])
export const loadingEntities = writable(false)
export const selectedEntity = writable<Entity | null>(null)
export const editingEntity = writable<Entity | null>(null)
