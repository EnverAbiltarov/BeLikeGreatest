'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAI } from "@/hooks/use-ai"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AIModal() {
  const ai = useAI()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Пожалуйста, введите запрос')
      return
    }

    setIsLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при запросе к AI')
      }

      setResponse(data.text || 'Нет ответа')
      toast.success('Ответ получен!')
    } catch (error: any) {
      console.error('Ошибка:', error)
      toast.error(error.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    ai.onClose()
    setPrompt('')
    setResponse('')
  }

  return (
    <Dialog open={ai.isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Помощник (Gemini)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Ваш запрос:
            </label>
            <Input
              placeholder="Напишите ваш запрос здесь..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Сгенерировать
              </>
            )}
          </Button>
          {response && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ответ AI:
              </label>
              <div className="p-4 bg-muted rounded-md border min-h-[100px] whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
