
"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface Badge {
  variant: "low" | "moderate" | "high"
  label: string
}

interface AccordionItem {
  key: string
  title: string
  badge?: Badge
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpenKeys?: string[]
  allowMultiple?: boolean
  className?: string
  onToggle?: (key: string, isOpen: boolean) => void
}

const badgeClass = (variant: Badge["variant"]) => {
  if (variant === "low") return "bg-blue-50 text-blue-700 border-blue-200"
  if (variant === "moderate") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-rose-50 text-rose-700 border-rose-200"
}

export function Accordion({ 
  items, 
  defaultOpenKeys = [], 
  allowMultiple = true,
  className = "",
  onToggle 
}: AccordionProps) {
  const initial: Record<string, boolean> = {}
  defaultOpenKeys.forEach((k) => {
    initial[k] = true
  })
  
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initial)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const reset: Record<string, boolean> = {}
    defaultOpenKeys.forEach((k) => {
      reset[k] = true
    })
    setOpenMap(reset)
  }, [defaultOpenKeys])

  const toggle = (key: string) => {
    setOpenMap((prev) => {
      const newOpenMap = { ...prev }
      
      if (!allowMultiple && !prev[key]) {
        // Close all other items if not allowing multiple
        Object.keys(newOpenMap).forEach(k => {
          if (k !== key) newOpenMap[k] = false
        })
      }
      
      newOpenMap[key] = !prev[key]
      
      // Call onToggle callback if provided
      onToggle?.(key, newOpenMap[key])
      
      return newOpenMap
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent, key: string) => {
    const currentIndex = items.findIndex(item => item.key === key)
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        toggle(key)
        break
        
      case 'ArrowDown':
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % items.length
        const nextKey = items[nextIndex].key
        buttonRefs.current[nextKey]?.focus()
        break
        
      case 'ArrowUp':
        event.preventDefault()
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        const prevKey = items[prevIndex].key
        buttonRefs.current[prevKey]?.focus()
        break
        
      case 'Home':
        event.preventDefault()
        const firstKey = items[0]?.key
        if (firstKey) buttonRefs.current[firstKey]?.focus()
        break
        
      case 'End':
        event.preventDefault()
        const lastKey = items[items.length - 1]?.key
        if (lastKey) buttonRefs.current[lastKey]?.focus()
        break
    }
  }

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="Coaching framework sections">
      {items.map((item) => {
        const isOpen = openMap[item.key]
        const contentId = `accordion-content-${item.key}`
        const headerId = `accordion-header-${item.key}`
        
        return (
          <section
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <header>
              <button
                ref={(el) => { buttonRefs.current[item.key] = el }}
                id={headerId}
                type="button"
                onClick={() => toggle(item.key)}
                onKeyDown={(e) => handleKeyDown(e, item.key)}
                className="w-full cursor-pointer select-none px-5 py-4 flex items-center justify-between hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
                aria-expanded={isOpen}
                aria-controls={contentId}
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800 text-left">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badgeClass(item.badge.variant)}`}
                      aria-label={`Priority: ${item.badge.label}`}
                    >
                      {item.badge.label}
                    </span>
                  )}
                </div>
                <div 
                  className="text-gray-400 transition-transform duration-200 ease-in-out"
                  style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  aria-hidden="true"
                >
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>
            </header>
            
            {/* Content panel with smooth animation */}
            <div
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="px-5 pb-5">
                <div className="prose prose-sm max-w-none">
                  {item.content}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

// Specialized accordion for coaching workflows
export function CoachingAccordion(props: AccordionProps) {
  return (
    <Accordion
      {...props}
      className={`coaching-workflow ${props.className || ''}`}
    />
  )
}
