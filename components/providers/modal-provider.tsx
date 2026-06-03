'use client'	

import { useEffect, useState } from "react"

import { SettingsModal } from "@/components/modals/settings-modal"
import { CoverImageModal } from "@/components/modals/cover-image-modal"
import { AIModal } from "@/components/modals/ai-modal"

export function ModalProvider () {

  const [isMounted,setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  },[])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <SettingsModal/>
      <CoverImageModal/>
      <AIModal/>
    </>
)
}