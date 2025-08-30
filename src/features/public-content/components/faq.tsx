import { MessageCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

interface FAQItem {
  question: string
  answer: string
  category: string
}

interface FAQProps {
  badge?: string
  heading?: string
  description?: string
  contactText?: string
  contactLink?: string
  faqs?: FAQItem[]
  categoryLabels?: {
    general?: string
    technical?: string
    pricing?: string
    support?: string
  }
}

export function FAQ({
  badge,
  heading,
  description,
  contactText,
  contactLink,
  faqs,
  categoryLabels,
}: FAQProps = {}) {
  const faqsData = faqs || []

  const categories = {
    general: { label: categoryLabels?.general || '', icon: HelpCircle },
    technical: { label: categoryLabels?.technical || '', icon: MessageCircle },
    pricing: { label: categoryLabels?.pricing || '', icon: HelpCircle },
    support: { label: categoryLabels?.support || '', icon: MessageCircle },
  }

  return (
    <section id='faq' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-[58rem] text-center'>
        <Badge variant='outline' className='mb-4'>
          <HelpCircle className='mr-2 h-3.5 w-3.5' />
          {badge}
        </Badge>
        <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl'>
          {heading}
        </h2>
        <p className='text-muted-foreground mt-6 text-lg sm:text-xl'>
          {description}
        </p>
      </div>

      <div className='mx-auto mt-16 max-w-3xl'>
        <Accordion
          type='single'
          collapsible
          className='w-full space-y-4'
          defaultValue='item-0'
        >
          {faqsData.map((faq, index) => {
            const category = categories[faq.category as keyof typeof categories]
            return (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={cn(
                  'bg-background/50 rounded-lg border px-6 backdrop-blur transition-all',
                  'data-[state=open]:border-primary/50 data-[state=open]:shadow-lg',
                  'animate-in fade-in-50 slide-in-from-bottom-5'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <AccordionTrigger className='py-4 text-left hover:no-underline'>
                  <div className='flex items-start gap-4'>
                    <div className='mt-0.5'>
                      <category.icon className='text-primary h-5 w-5' />
                    </div>
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {category.label}
                        </Badge>
                      </div>
                      <h3 className='text-base font-medium'>{faq.question}</h3>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-0 pb-4'>
                  <div className='text-muted-foreground pl-9'>{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        <div className='mt-12 text-center'>
          <p className='text-muted-foreground'>
            {contactText}{' '}
            <a
              href='#'
              className='text-primary font-medium underline underline-offset-4 hover:no-underline'
            >
              {contactLink}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
