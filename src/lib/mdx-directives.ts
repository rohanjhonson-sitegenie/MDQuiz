import { parse as parseYaml } from 'yaml'

interface DirectiveElement {
  type: string
  props: Record<string, unknown>
}

/**
 * Shared YAML parsing utility extracted from existing frontmatter parser
 */
export function parseYAML(yamlContent: string): Record<string, unknown> {
  try {
    // Normalize line endings to handle Windows/Unix differences
    const normalizedYaml = yamlContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    const parsed = parseYaml(normalizedYaml)
    return parsed || {}
  } catch {
    return {}
  }
}

/**
 * Directive-to-component mapping registry
 */
export interface DirectiveComponent {
  name: string
  transform: (data: Record<string, unknown>) => DirectiveElement
}

/**
 * Registry of available directives for landing page
 * Mapped to current landing page components
 */
export const DIRECTIVE_REGISTRY: Record<string, DirectiveComponent> = {
  hero: {
    name: 'Hero',
    transform: (data) => {
      return {
        type: 'Hero',
        props: data,
      } as DirectiveElement
    },
  },
  'stats-bar': {
    name: 'Statistics',
    transform: (data) => {
      return {
        type: 'Statistics',
        props: data,
      } as DirectiveElement
    },
  },
  features: {
    name: 'Features',
    transform: (data) => {
      return {
        type: 'Features',
        props: data,
      } as DirectiveElement
    },
  },
  services: {
    name: 'Services',
    transform: (data) => {
      return {
        type: 'Services',
        props: data,
      } as DirectiveElement
    },
  },
  about: {
    name: 'About',
    transform: (data) => {
      return {
        type: 'About',
        props: data,
      } as DirectiveElement
    },
  },
  team: {
    name: 'Team',
    transform: (data) => {
      return {
        type: 'Team',
        props: data,
      } as DirectiveElement
    },
  },
  pricing: {
    name: 'Pricing',
    transform: (data) => {
      return {
        type: 'Pricing',
        props: data,
      } as DirectiveElement
    },
  },
  newsletter: {
    name: 'Newsletter',
    transform: (data) => {
      return {
        type: 'Newsletter',
        props: data,
      } as DirectiveElement
    },
  },
  faq: {
    name: 'FAQ',
    transform: (data) => {
      return {
        type: 'FAQ',
        props: data,
      } as DirectiveElement
    },
  },
  'how-it-works': {
    name: 'HowItWorks',
    transform: (data) => {
      return {
        type: 'HowItWorks',
        props: data,
      } as DirectiveElement
    },
  },
  footer: {
    name: 'Footer',
    transform: (data) => {
      return {
        type: 'Footer',
        props: data,
      } as DirectiveElement
    },
  },
}

/**
 * Parse directive content and return component data
 * Implements API contract from spec
 */
export function parseDirectiveContent(
  directiveName: string,
  yamlContent: string
): DirectiveElement {
  const directive = DIRECTIVE_REGISTRY[directiveName]
  if (!directive) {
    // Fallback for unknown directives - render as comment
    return {
      type: 'div',
      props: {
        children: `<!-- Unknown directive: ${directiveName} -->`,
      },
    } as DirectiveElement
  }

  const data = parseYAML(yamlContent)
  return directive.transform(data)
}
