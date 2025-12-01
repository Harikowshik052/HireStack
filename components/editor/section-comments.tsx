"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send, X } from "lucide-react"
import { toast } from "sonner"

interface Comment {
  id: string
  userEmail: string
  userName: string | null
  content: string
  mentions: any
  createdAt: string
}

interface TeamMember {
  email: string
  name: string | null
  role: string
}

interface SectionCommentsProps {
  sectionId: string
  companySlug: string
}

export default function SectionComments({ sectionId, companySlug }: SectionCommentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch team members for @mentions
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/companies/${companySlug}/team`)
        if (res.ok) {
          const data = await res.json()
          setTeamMembers(data)
        }
      } catch (error) {
        console.error("Failed to fetch team:", error)
      }
    }
    fetchTeam()
  }, [companySlug])

  // Fetch comments when opened
  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, sectionId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/sections/${sectionId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursor = e.target.selectionStart
    setNewComment(value)
    setCursorPosition(cursor)

    // Check for @ mention
    const textBeforeCursor = value.slice(0, cursor)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1 && lastAtIndex === cursor - 1) {
      // Just typed @
      setShowMentions(true)
      setMentionSearch("")
    } else if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
      if (/^\w*$/.test(textAfterAt)) {
        // Still typing mention
        setShowMentions(true)
        setMentionSearch(textAfterAt)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (member: TeamMember) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    const before = newComment.slice(0, lastAtIndex)
    const after = newComment.slice(cursorPosition)
    const mention = `@${member.name || member.email} `
    
    setNewComment(before + mention + after)
    setShowMentions(false)
    setMentionSearch("")
    
    // Focus back on textarea
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const filteredMembers = teamMembers.filter(member => {
    const searchLower = mentionSearch.toLowerCase()
    const nameMatch = member.name?.toLowerCase().includes(searchLower)
    const emailMatch = member.email.toLowerCase().includes(searchLower)
    return nameMatch || emailMatch
  })

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setIsLoading(true)
    try {
      // Extract mentions from content
      const mentionRegex = /@(\S+)/g
      const mentions: string[] = []
      let match: RegExpExecArray | null
      while ((match = mentionRegex.exec(newComment)) !== null) {
        const mentioned = teamMembers.find(m => 
          m.name === match![1] || m.email === match![1]
        )
        if (mentioned) {
          mentions.push(mentioned.email)
        }
      }

      const res = await fetch(`/api/sections/${sectionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          mentions: mentions.length > 0 ? mentions : null,
        }),
      })

      if (res.ok) {
        setNewComment("")
        await fetchComments()
        toast.success("Comment added")
      } else {
        toast.error("Failed to add comment")
      }
    } catch (error) {
      toast.error("Error adding comment")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Comment Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        variant="outline"
        className="gap-2 hover:bg-blue-50"
      >
        <MessageCircle className="h-4 w-4" />
        {comments.length > 0 && (
          <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">
            {comments.length}
          </span>
        )}
      </Button>

      {/* Comments Panel */}
      {isOpen && (
        <div className="fixed right-4 top-20 z-50 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[calc(100vh-6rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Comments ({comments.length})</h3>
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-gray-900">
                      {comment.userName || comment.userEmail}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <div className="border-t p-3 space-y-2 flex-shrink-0">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={handleTextChange}
                placeholder="Add a comment... (Type @ to mention)"
                className="w-full min-h-[80px] resize-none text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              
              {/* Mention Dropdown */}
              {showMentions && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.email}
                      onClick={() => insertMention(member)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span className="font-medium">{member.name || member.email}</span>
                      {member.name && (
                        <span className="text-xs text-gray-500">{member.email}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !newComment.trim()}
              size="sm"
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
