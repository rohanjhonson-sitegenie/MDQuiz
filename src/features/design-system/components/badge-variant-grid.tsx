import { Badge } from '@/components/ui/badge'

const variants = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'informative',
  'success',
  'warning',
  'error',
  'neutral',
  'brand',
] as const

const sizes = ['sm', 'md', 'lg'] as const
const emphases = ['heavy', 'medium', 'light'] as const

export function BadgeVariantGrid() {
  return (
    <div className='space-y-8'>
      {emphases.map((emphasis) => (
        <div key={emphasis} className='space-y-4'>
          <h3 className='text-lg font-semibold capitalize'>
            {emphasis} Emphasis
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr>
                  <th className='text-muted-foreground p-2 text-left text-sm font-medium'>
                    Variant
                  </th>
                  {sizes.map((size) => (
                    <th
                      key={size}
                      className='text-muted-foreground p-2 text-center text-sm font-medium capitalize'
                    >
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant} className='border-t'>
                    <td className='p-2 text-sm capitalize'>{variant}</td>
                    {sizes.map((size) => (
                      <td key={size} className='p-2 text-center'>
                        <Badge
                          variant={variant}
                          size={size}
                          emphasis={emphasis}
                        >
                          Badge
                        </Badge>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Dot Sizes */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Dot Sizes</h3>
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-4'>
            <span className='text-muted-foreground text-sm'>Dot:</span>
            <div className='flex gap-2'>
              {variants.map((variant) => (
                <div key={variant} className='relative h-6 w-6'>
                  <Badge variant={variant} size='dot' />
                </div>
              ))}
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-muted-foreground text-sm'>Microdot:</span>
            <div className='flex gap-2'>
              {variants.map((variant) => (
                <div key={variant} className='relative h-6 w-6'>
                  <Badge variant={variant} size='microdot' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
