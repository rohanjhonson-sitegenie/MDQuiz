import React from 'react'
import { About } from '@/features/public-content/components/about'
import { FAQ } from '@/features/public-content/components/faq'
import { Features } from '@/features/public-content/components/features'
import { Hero } from '@/features/public-content/components/hero'
import { HowItWorks } from '@/features/public-content/components/how-it-works'
import { Newsletter } from '@/features/public-content/components/newsletter'
import { Pricing } from '@/features/public-content/components/pricing'
import { Services } from '@/features/public-content/components/services'
import { Statistics } from '@/features/public-content/components/statistics'
import { Team } from '@/features/public-content/components/team'

interface DirectiveElement {
  type: string
  props: Record<string, unknown>
}

interface EnhancedMarkdownContentProps {
  content: string
  directives?: Record<string, DirectiveElement>
}

// Component mapping for directive rendering
const ComponentMap: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  Hero,
  Statistics,
  Features,
  Services,
  About,
  Team,
  Pricing,
  Newsletter,
  FAQ,
  HowItWorks,
}

export function EnhancedMarkdownContent({
  content,
  directives = {},
}: EnhancedMarkdownContentProps) {
  // Replace directive placeholders with actual components
  const renderDirectives = (htmlContent: string) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Find all directive placeholders
    const placeholderPattern = /<!-- DIRECTIVE_([A-Z_]+)_PLACEHOLDER -->/g
    let match

    while ((match = placeholderPattern.exec(htmlContent)) !== null) {
      // Add content before this placeholder
      if (match.index > lastIndex) {
        const beforeContent = htmlContent.slice(lastIndex, match.index)
        if (beforeContent.trim()) {
          parts.push(
            <div
              key={`content-${lastIndex}`}
              dangerouslySetInnerHTML={{ __html: beforeContent }}
            />
          )
        }
      }

      // Get directive info
      const placeholderName = match[1]
      const directiveName = placeholderName.toLowerCase().replace(/_/g, '-')

      // Find matching directive
      const directive = directives[directiveName]
      if (directive) {
        const Component = ComponentMap[directive.type]
        if (Component) {
          parts.push(
            <Component
              key={`directive-${directiveName}`}
              {...directive.props}
            />
          )
        }
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining content
    if (lastIndex < htmlContent.length) {
      const remainingContent = htmlContent.slice(lastIndex)
      if (remainingContent.trim()) {
        parts.push(
          <div
            key={`content-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: remainingContent }}
          />
        )
      }
    }

    return parts
  }

  const renderedContent = renderDirectives(content)

  return <>{renderedContent}</>
}
