import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string, text: string) => void
  defaultText?: string
  defaultUrl?: string
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultText = '',
  defaultUrl = '',
}) => {
  const [url, setUrl] = useState(defaultUrl)
  const [text, setText] = useState(defaultText)

  useEffect(() => {
    if (open) {
      setUrl(defaultUrl || '')
      setText(defaultText || '')
    }
  }, [open, defaultUrl, defaultText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onSubmit(url, text)
      setUrl('')
      setText('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {defaultUrl ? 'Edit Link' : 'Insert Link'}
            </DialogTitle>
            <DialogDescription>
              {defaultUrl
                ? 'Edit the hyperlink details'
                : 'Add a hyperlink to your content'}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='link-text'>Link Text</Label>
              <Input
                id='link-text'
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Enter link text'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='link-url'>URL</Label>
              <Input
                id='link-url'
                type='text'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder='https://example.com or #anchor'
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>
              {defaultUrl ? 'Update Link' : 'Insert Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
