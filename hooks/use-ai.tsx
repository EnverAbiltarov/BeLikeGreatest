import { create } from 'zustand'

type AIStore = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useAI = create<AIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}))
