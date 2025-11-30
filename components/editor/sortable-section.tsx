"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GripVertical, Trash2, Eye, EyeOff, Columns, Columns3, Maximize, Bold, Italic, Underline } from "lucide-react"
import { useState, useRef } from "react"

interface Section {
  id: string
  type: string
  title: string
  content: any
  layout?: string
  order: number
  isVisible: boolean
}

interface SortableSectionProps {
  section: Section
  onUpdate: (id: string, updates: Partial<Section>) => void
  onDelete: (id: string) => void
}

export default function SortableSection({ section, onUpdate, onDelete }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleContentChange = (value: string) => {
    onUpdate(section.id, {
      content: { html: value }
    })
  }

  const wrapSelectedText = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    
    if (!selectedText) return

    const openTag = `<${tag}>`
    const closeTag = `</${tag}>`
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)
    
    const newContent = beforeText + openTag + selectedText + closeTag + afterText
    handleContentChange(newContent)
    
    // Re-focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + openTag.length + selectedText.length + closeTag.length,
        start + openTag.length + selectedText.length + closeTag.length
      )
    }, 0)
  }

  const handleLayoutChange = (layout: string) => {
    onUpdate(section.id, { layout })
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 py-3">
          <button
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <Input
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="flex-1"
            placeholder="Section Title"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdate(section.id, { isVisible: !section.isVisible })}
          >
            {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "▲" : "▼"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(section.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Layout</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={section.layout === 'FULL_WIDTH' || !section.layout ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange('FULL_WIDTH')}
                >
                  <Maximize className="h-4 w-4 mr-1" />
                  Full Width
                </Button>
                <Button
                  type="button"
                  variant={section.layout === 'TWO_COLUMN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange('TWO_COLUMN')}
                >
                  <Columns className="h-4 w-4 mr-1" />
                  2 Columns
                </Button>
                <Button
                  type="button"
                  variant={section.layout === 'THREE_COLUMN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange('THREE_COLUMN')}
                >
                  <Columns3 className="h-4 w-4 mr-1" />
                  3 Columns
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Content</Label>
              <div className="flex gap-1 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => wrapSelectedText('strong')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => wrapSelectedText('em')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => wrapSelectedText('u')}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                ref={textareaRef}
                className="w-full min-h-[150px] px-3 py-2 border rounded-md font-mono text-sm"
                value={typeof section.content === 'string' ? section.content : section.content.html || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Add your content here (HTML supported)..."
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Tip: Select text and use formatting buttons. For 2/3 columns, separate content with <code>|||</code>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
