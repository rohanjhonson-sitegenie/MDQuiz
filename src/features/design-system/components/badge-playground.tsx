import { useState } from 'react'
import {
  RefreshCw,
  Star,
  Heart,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CodePreview } from './code-preview'

const iconOptions = {
  none: null,
  star: Star,
  heart: Heart,
  zap: Zap,
  shield: Shield,
  alert: AlertCircle,
  check: CheckCircle,
}

export function BadgePlayground() {
  const [variant, setVariant] = useState<string>('default')
  const [size, setSize] = useState<string>('md')
  const [emphasis, setEmphasis] = useState<string>('heavy')
  const [text, setText] = useState('Badge Text')
  const [icon, setIcon] = useState<string>('none')
  const [iconPosition, setIconPosition] = useState<'left' | 'right'>('left')
  const [removable, setRemovable] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [shimmer, setShimmer] = useState(false)

  const IconComponent =
    iconOptions[icon as keyof typeof iconOptions] || undefined

  const resetToDefaults = () => {
    setVariant('default')
    setSize('md')
    setEmphasis('heavy')
    setText('Badge Text')
    setIcon('none')
    setIconPosition('left')
    setRemovable(false)
    setPulse(false)
    setShimmer(false)
  }

  const badgeProps = {
    variant: variant as BadgeProps['variant'],
    size: size as BadgeProps['size'],
    emphasis: emphasis as BadgeProps['emphasis'],
    icon: IconComponent,
    iconPosition,
    removable,
    pulse,
    shimmer,
    onRemove: removable ? () => alert('Remove clicked!') : undefined,
  }

  const generateCode = () => {
    const props = []
    if (variant !== 'default') props.push(`variant="${variant}"`)
    if (size !== 'md') props.push(`size="${size}"`)
    if (emphasis !== 'heavy') props.push(`emphasis="${emphasis}"`)
    if (IconComponent) {
      props.push(`icon={${icon.charAt(0).toUpperCase() + icon.slice(1)}}`)
      if (iconPosition !== 'left') props.push(`iconPosition="${iconPosition}"`)
    }
    if (removable) {
      props.push('removable')
      props.push('onRemove={() => handleRemove()}')
    }
    if (pulse) props.push('pulse')
    if (shimmer) props.push('shimmer')

    const propsString = props.length > 0 ? ' ' + props.join(' ') : ''
    return `<Badge${propsString}>${text}</Badge>`
  }

  return (
    <div className='space-y-8'>
      {/* Preview Area */}
      <Card className='bg-muted/50'>
        <CardContent className='flex items-center justify-center py-16'>
          <Badge {...badgeProps}>{text}</Badge>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Text Input */}
        <div className='space-y-2'>
          <Label htmlFor='text'>Badge Text</Label>
          <Input
            id='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Enter badge text'
          />
        </div>

        {/* Variant */}
        <div className='space-y-2'>
          <Label>Variant</Label>
          <Select value={variant} onValueChange={setVariant}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='default'>Default</SelectItem>
              <SelectItem value='secondary'>Secondary</SelectItem>
              <SelectItem value='destructive'>Destructive</SelectItem>
              <SelectItem value='outline'>Outline</SelectItem>
              <SelectItem value='informative'>Informative</SelectItem>
              <SelectItem value='success'>Success</SelectItem>
              <SelectItem value='warning'>Warning</SelectItem>
              <SelectItem value='error'>Error</SelectItem>
              <SelectItem value='neutral'>Neutral</SelectItem>
              <SelectItem value='brand'>Brand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <div className='space-y-2'>
          <Label>Size</Label>
          <RadioGroup value={size} onValueChange={setSize}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='sm' id='size-sm' />
              <Label htmlFor='size-sm'>Small</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='md' id='size-md' />
              <Label htmlFor='size-md'>Medium</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='lg' id='size-lg' />
              <Label htmlFor='size-lg'>Large</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='dot' id='size-dot' />
              <Label htmlFor='size-dot'>Dot</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='microdot' id='size-microdot' />
              <Label htmlFor='size-microdot'>Microdot</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Emphasis */}
        <div className='space-y-2'>
          <Label>Emphasis</Label>
          <RadioGroup value={emphasis} onValueChange={setEmphasis}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='heavy' id='emphasis-heavy' />
              <Label htmlFor='emphasis-heavy'>Heavy</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='medium' id='emphasis-medium' />
              <Label htmlFor='emphasis-medium'>Medium</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='light' id='emphasis-light' />
              <Label htmlFor='emphasis-light'>Light</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Icon */}
        <div className='space-y-2'>
          <Label>Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>None</SelectItem>
              <SelectItem value='star'>Star</SelectItem>
              <SelectItem value='heart'>Heart</SelectItem>
              <SelectItem value='zap'>Zap</SelectItem>
              <SelectItem value='shield'>Shield</SelectItem>
              <SelectItem value='alert'>Alert</SelectItem>
              <SelectItem value='check'>Check</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Icon Position */}
        {icon !== 'none' && (
          <div className='space-y-2'>
            <Label>Icon Position</Label>
            <RadioGroup
              value={iconPosition}
              onValueChange={(v) => setIconPosition(v as 'left' | 'right')}
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='left' id='icon-left' />
                <Label htmlFor='icon-left'>Left</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='right' id='icon-right' />
                <Label htmlFor='icon-right'>Right</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Options */}
        <div className='space-y-4 lg:col-span-3'>
          <Label>Options</Label>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='removable'
                checked={removable}
                onCheckedChange={setRemovable}
              />
              <Label htmlFor='removable'>Removable</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='pulse' checked={pulse} onCheckedChange={setPulse} />
              <Label htmlFor='pulse'>Pulse Animation</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='shimmer'
                checked={shimmer}
                onCheckedChange={setShimmer}
              />
              <Label htmlFor='shimmer'>Shimmer Effect</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <Button onClick={resetToDefaults} variant='outline'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reset to Defaults
        </Button>
      </div>

      {/* Code Preview */}
      <CodePreview code={generateCode()} language='tsx' />
    </div>
  )
}
