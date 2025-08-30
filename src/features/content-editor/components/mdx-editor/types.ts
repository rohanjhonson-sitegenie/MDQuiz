export interface MDXEditorProps {
  value: string
  onChange: (value: string, context?: ChangeContext) => void
  onImageUpload?: (file: File) => Promise<string>
  imageBaseUrl?: string
  className?: string
  placeholder?: string
}

export interface ChangeContext {
  isFormatting?: boolean
  action?: string
}

export interface EditorSelection {
  start: number
  end: number
  text: string
}

export interface FormattingAction {
  type:
    | 'bold'
    | 'italic'
    | 'heading'
    | 'link'
    | 'image'
    | 'code'
    | 'list'
    | 'quote'
    | 'table'
  level?: number // for headings
  url?: string // for links
  alt?: string // for images
  ordered?: boolean // for lists
}

export interface EditorState {
  markdown: string
  selection: EditorSelection | null
  isSourceMode: boolean
  history: string[]
  historyIndex: number
}
