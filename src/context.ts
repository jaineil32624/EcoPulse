import { createContext, useContext } from 'react'
import type { AppState, Footprint, TabKey } from './types.ts'

export interface ToastOptions {
  icon?: string
  undo?: () => void
}

export interface Api {
  state: AppState
  footprint: Footprint
  update: (fn: (s: AppState) => AppState) => void
  logAction: (actionId: string, note?: string, origin?: HTMLElement | null, dayOffset?: number) => void
  unlogToday: (actionId: string) => void
  toast: (message: string, opts?: ToastOptions) => void
  go: (tab: TabKey) => void
  openLog: (actionId?: string) => void
  share: (title: string, text: string, tab?: TabKey) => void
  celebrate: (origin?: HTMLElement | null) => void
  openDialog: (d: DialogKey) => void
}

export type DialogKey = 'help' | 'getapp' | 'palette' | 'calculator' | null

export const ApiContext = createContext<Api | null>(null)

export function useApi(): Api {
  const api = useContext(ApiContext)
  if (!api) throw new Error('ApiContext missing')
  return api
}
