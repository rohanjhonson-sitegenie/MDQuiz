import { IconCheck, IconWorld } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/use-locale'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <IconWorld className='size-[1.2rem]' />
          <span className='sr-only'>Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setLocale('en')}>
          {t('language.english')}
          <IconCheck
            size={14}
            className={cn('ml-auto', locale !== 'en' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('zh-CN')}>
          {t('language.chinese')}
          <IconCheck
            size={14}
            className={cn('ml-auto', locale !== 'zh-CN' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
