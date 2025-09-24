import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react'

interface ContactRequirementSettingsProps {
  value: 'none' | 'optional' | 'required'
  onChange: (value: 'none' | 'optional' | 'required') => void
  className?: string
}

export function ContactRequirementSettings({
  value,
  onChange,
  className
}: ContactRequirementSettingsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label className='text-sm font-semibold'>Contact Information</Label>
        <p className='text-xs text-muted-foreground mt-1'>
          Control whether quiz takers must provide contact details
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className='space-y-2'>
        <div className='flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors'>
          <RadioGroupItem value='none' id='contact-none' className='mt-0.5' />
          <div className='flex-1'>
            <Label
              htmlFor='contact-none'
              className='flex items-center gap-2 font-medium cursor-pointer'
            >
              <ShieldOff className='w-4 h-4 text-muted-foreground' />
              Anonymous Only
            </Label>
            <p className='text-xs text-muted-foreground mt-1'>
              No contact information collected. All responses are fully anonymous.
            </p>
          </div>
        </div>

        <div className='flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors'>
          <RadioGroupItem value='optional' id='contact-optional' className='mt-0.5' />
          <div className='flex-1'>
            <Label
              htmlFor='contact-optional'
              className='flex items-center gap-2 font-medium cursor-pointer'
            >
              <Shield className='w-4 h-4 text-muted-foreground' />
              Optional Contact
            </Label>
            <p className='text-xs text-muted-foreground mt-1'>
              Quiz takers can choose to provide email and name, or skip and remain anonymous.
            </p>
          </div>
        </div>

        <div className='flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors'>
          <RadioGroupItem value='required' id='contact-required' className='mt-0.5' />
          <div className='flex-1'>
            <Label
              htmlFor='contact-required'
              className='flex items-center gap-2 font-medium cursor-pointer'
            >
              <ShieldCheck className='w-4 h-4 text-muted-foreground' />
              Required Contact
            </Label>
            <p className='text-xs text-muted-foreground mt-1'>
              Quiz takers must provide email address before starting the quiz.
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}