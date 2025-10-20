
"use client"

import React, { useState, useEffect } from "react"
import { Plus, X, Edit3, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface DynamicListItem {
  id: string
  content: string
  order: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface DynamicListProps {
  clientId: string
  framework: "leadership" | "clinical" | "advanced_insights" | "coaching"
  section: string
  subSection?: string
  label: string
  placeholder?: string
  multiline?: boolean
  maxLength?: number
  className?: string
}

export function DynamicList({
  clientId,
  framework,
  section,
  subSection,
  label,
  placeholder,
  multiline = false,
  maxLength = 500,
  className = ""
}: DynamicListProps) {
  const [items, setItems] = useState<DynamicListItem[]>([])
  const [newItemText, setNewItemText] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)

  // Fetch existing notes on mount
  useEffect(() => {
    fetchNotes()
  }, [clientId, framework, section, subSection])

  const fetchNotes = async () => {
    try {
      setIsLoadingInitial(true)
      const params = new URLSearchParams({
        clientId,
        framework,
        section,
        ...(subSection && { subSection })
      })

      const response = await fetch(`/api/coaching/notes?${params}`)
      if (response.ok) {
        const { notes } = await response.json()
        setItems(notes)
      } else {
        console.error("Failed to fetch notes")
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setIsLoadingInitial(false)
    }
  }

  const addItem = async () => {
    if (!newItemText.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/coaching/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          framework,
          section,
          subSection,
          content: newItemText.trim(),
          order: items.length
        })
      })

      if (response.ok) {
        const { note } = await response.json()
        setItems([...items, note])
        setNewItemText("")
      } else {
        console.error("Failed to add note")
      }
    } catch (error) {
      console.error("Error adding note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (item: DynamicListItem) => {
    setEditingId(item.id)
    setEditText(item.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const saveEdit = async () => {
    if (!editingId || !editText.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/coaching/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editText.trim()
        })
      })

      if (response.ok) {
        const { note } = await response.json()
        setItems(items.map(item => 
          item.id === editingId ? note : item
        ))
        setEditingId(null)
        setEditText("")
      } else {
        console.error("Failed to update note")
      }
    } catch (error) {
      console.error("Error updating note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/coaching/notes/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setItems(items.filter(item => item.id !== id))
      } else {
        console.error("Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (editingId) {
        saveEdit()
      } else {
        addItem()
      }
    } else if (event.key === 'Escape') {
      if (editingId) {
        cancelEdit()
      }
    }
  }

  if (isLoadingInitial) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading notes...</span>
      </div>
    )
  }

  const InputComponent = multiline ? Textarea : Input

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Add new item */}
      <div className="flex gap-2">
        <InputComponent
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder || `Add new ${label}...`}
          maxLength={maxLength}
          className="flex-1 text-sm"
          disabled={isSubmitting}
          rows={multiline ? 2 : undefined}
        />
        <Button
          onClick={addItem}
          disabled={!newItemText.trim() || isSubmitting}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span className="sr-only">Add {label}</span>
        </Button>
      </div>

      {/* Character count for multiline */}
      {multiline && newItemText && (
        <div className="text-xs text-gray-500 text-right">
          {newItemText.length}/{maxLength}
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <ul className="space-y-2" role="list" aria-label={`${label} items`}>
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 p-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {editingId === item.id ? (
                <div className="flex-1 flex gap-2">
                  <InputComponent
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 text-sm"
                    maxLength={maxLength}
                    disabled={isSubmitting}
                    autoFocus
                    rows={multiline ? 2 : undefined}
                  />
                  <div className="flex gap-1">
                    <Button
                      onClick={saveEdit}
                      disabled={!editText.trim() || isSubmitting}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      <span className="sr-only">Save changes</span>
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Cancel edit</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {item.content}
                    </p>
                    {item.user.name && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {item.user.name} • {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => startEdit(item)}
                      disabled={isLoading}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span className="sr-only">Edit {label}</span>
                    </Button>
                    <Button
                      onClick={() => deleteItem(item.id)}
                      disabled={isLoading}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Delete {label}</span>
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 && !isLoadingInitial && (
        <p className="text-sm text-gray-500 italic py-2">
          No {label} added yet. Use the form above to add your first entry.
        </p>
      )}
    </div>
  )
}
