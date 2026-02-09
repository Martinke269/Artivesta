"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoEmbedProps {
  url: string
  title?: string
  className?: string
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null

  // Remove whitespace
  url = url.trim()

  // Regular YouTube URL
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[7].length === 11) {
    return match[7]
  }

  return null
}

/**
 * VideoEmbed Component
 * 
 * A responsive video embed component with lazy loading support.
 * Currently supports YouTube videos with automatic URL detection.
 * 
 * Features:
 * - Responsive 16:9 aspect ratio
 * - Lazy loading (loads iframe only when user clicks play)
 * - Thumbnail preview with play button
 * - Automatic YouTube URL detection and ID extraction
 * 
 * @param url - The YouTube video URL
 * @param title - Optional title for accessibility
 * @param className - Optional additional CSS classes
 */
export function VideoEmbed({ url, title = "Video", className }: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className={cn(
        "relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center",
        className
      )}>
        <p className="text-sm text-muted-foreground">Ugyldig video URL</p>
      </div>
    )
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`

  if (!isLoaded) {
    return (
      <div className={cn("relative w-full aspect-video group cursor-pointer", className)}>
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg" />
        
        {/* Play Button */}
        <button
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`Afspil video: ${title}`}
        >
          <div className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full aspect-video", className)}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  )
}
