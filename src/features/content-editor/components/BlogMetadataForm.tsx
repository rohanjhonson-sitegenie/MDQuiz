import { useEffect, useState } from 'react'
import { Control, useWatch, UseFormSetValue } from 'react-hook-form'
import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import {
  ImageIcon,
  Trash2,
  ChevronDown,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useStorage } from '@/hooks/use-storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  ImagePickerDialog,
  ImagePickerProvider,
  ImageUploadZone,
  ImageUrlInput,
  ImageGallery,
  useImagePicker,
} from '@/components/ui/image-picker'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useSlugValidation } from '../hooks/useSlugValidation'
import { BlogPostFormData } from '../schemas/content-editor.schema'
import { DeleteBlogPostDialog } from './DeleteBlogPostDialog'
import { TagCombobox } from './tags'

interface BlogMetadataFormProps {
  control: Control<BlogPostFormData>
  setValue: UseFormSetValue<BlogPostFormData>
  postId?: string
  onDelete?: () => void
  isDeleting?: boolean
  title?: string
}

export function BlogMetadataForm({
  control,
  setValue,
  postId,
  onDelete,
  isDeleting,
  title,
}: BlogMetadataFormProps) {
  const titleValue = useWatch({ control, name: 'title' })
  const slugValue = useWatch({ control, name: 'slug' })
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [seoExpanded, setSeoExpanded] = useState(false)
  const storage = useStorage()

  // Validate slug uniqueness
  const {
    isChecking,
    isValid,
    error: slugError,
  } = useSlugValidation(slugValue || '', {
    currentPostId: postId,
    enabled: !!slugValue && slugValue !== '',
  })

  // Auto-generate slug when title changes and slug is empty
  useEffect(() => {
    if (titleValue && (!slugValue || slugValue === '')) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

      setValue('slug', generatedSlug)
    }
  }, [titleValue, slugValue, setValue])

  return (
    <>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.67fr]'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FormField
                control={control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          placeholder='leave-empty-to-auto-generate'
                          className={cn(
                            slugError && !isChecking && 'border-destructive',
                            isValid && !isChecking && slugValue && 'pr-10'
                          )}
                          onChange={(e) => {
                            // Format slug: lowercase, replace spaces with hyphens, remove special characters
                            const formatted = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except alphanumeric, spaces and hyphens
                              .replace(/\s+/g, '-') // Replace spaces with hyphens
                              .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                            field.onChange(formatted)
                          }}
                        />
                        <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                          {isChecking && (
                            <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
                          )}
                          {!isChecking && isValid && slugValue && (
                            <CheckCircle2 className='h-4 w-4 text-green-600' />
                          )}
                          {!isChecking && !isValid && slugValue && (
                            <XCircle className='text-destructive h-4 w-4' />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {slugError ? (
                        <span className='text-destructive'>{slugError}</span>
                      ) : (
                        'URL-friendly version of the title. Leave empty to auto-generate.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='excerpt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Brief description of the blog post'
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary that appears in blog listings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='author'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Author name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Publishing Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FormField
                control={control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagCombobox
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder='Select or create tags...'
                        maxTags={10}
                      />
                    </FormControl>
                    <FormDescription>
                      Select existing tags or create new ones. Maximum 10 tags.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='draft'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Draft Mode</FormLabel>
                      <FormDescription>
                        Save as draft. Draft posts won't be publicly visible.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Featured Image Card */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name='featuredImage'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='space-y-4'>
                        {field.value &&
                        typeof field.value === 'string' &&
                        field.value !== '' ? (
                          <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-lg border'>
                            <img
                              src={storage.getOptimizedImageUrl(field.value, {
                                type: 'card',
                                container: { width: 400, height: 225 },
                              })}
                              alt='Featured image'
                              className='h-full w-full object-cover'
                            />
                            <Button
                              type='button'
                              variant='destructive'
                              size='icon'
                              className='absolute top-2 right-2'
                              onClick={() => field.onChange(null)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className='border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors'
                            onClick={() => setShowImagePicker(true)}
                          >
                            <Upload className='text-muted-foreground h-8 w-8' />
                            <p className='text-muted-foreground mt-2 text-sm font-medium'>
                              Click to upload
                            </p>
                            <p className='text-muted-foreground text-xs'>
                              16:9 recommended
                            </p>
                          </div>
                        )}
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => setShowImagePicker(true)}
                          className='w-full'
                        >
                          <ImageIcon className='mr-2 h-4 w-4' />
                          {field.value ? 'Change Image' : 'Select Image'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className='mt-3'>
                      The featured image appears at the top of your blog post
                      and in listings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEO Settings Card */}
          <Card>
            <Collapsible open={seoExpanded} onOpenChange={setSeoExpanded}>
              <CardHeader>
                <CollapsibleTrigger className='flex w-full items-center justify-between py-2 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180'>
                  <CardTitle>SEO Settings</CardTitle>
                  <ChevronDown className='h-4 w-4 shrink-0 transition-transform duration-200' />
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className='space-y-6'>
                  <FormField
                    control={control}
                    name='seoTitle'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Custom title for search engines'
                            maxLength={60}
                          />
                        </FormControl>
                        <FormDescription
                          className={cn(
                            'text-xs',
                            field.value &&
                              field.value.length > 50 &&
                              'text-destructive'
                          )}
                        >
                          {field.value?.length || 0}/60 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='seoDescription'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='Meta description for search engines'
                            rows={2}
                            maxLength={160}
                          />
                        </FormControl>
                        <FormDescription
                          className={cn(
                            'text-xs',
                            field.value &&
                              field.value.length > 150 &&
                              'text-destructive'
                          )}
                        >
                          {field.value?.length || 0}/160 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='seoKeywords'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Keywords</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const keywords = e.target.value
                                .split(',')
                                .map((keyword) => keyword.trim())
                                .filter(Boolean)
                              field.onChange(keywords)
                            }}
                            placeholder='keyword1, keyword2, keyword3'
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of SEO keywords.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Danger Zone Card - Only show in edit mode */}
          {onDelete && postId && (
            <Card className='border-destructive/50'>
              <CardHeader>
                <CardTitle className='text-destructive'>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-muted-foreground text-sm'>
                    Once you delete a blog post, there is no going back. Please
                    be certain.
                  </p>
                  <DeleteBlogPostDialog
                    title={title || titleValue || ''}
                    slug={slugValue || ''}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ImagePickerProvider>
        <ImagePickerDialog
          open={showImagePicker}
          onOpenChange={setShowImagePicker}
          title='Select Featured Image'
        >
          <ImagePickerDialog.InputPanel>
            <div className='space-y-6'>
              <ImageUploadZone
                onUpload={async (files) => {
                  const file = files[0]
                  if (file) {
                    try {
                      const path = 'blog/images'
                      const result = await bunnyStorage.upload(file, path)
                      setValue('featuredImage', result.path)
                      toast.success('Featured image uploaded successfully')
                      setTimeout(() => setShowImagePicker(false), 100)
                    } catch (_error) {
                      toast.error('Failed to upload featured image')
                    }
                  }
                }}
                multiple={false}
              />

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background text-muted-foreground px-2'>
                    Or
                  </span>
                </div>
              </div>

              <ImageUrlInput
                onLoad={(image) => {
                  if (image.url) {
                    // For external URLs, keep the full URL
                    setValue('featuredImage', image.url)
                    setTimeout(() => setShowImagePicker(false), 100)
                  }
                }}
              />

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background text-muted-foreground px-2'>
                    Or browse existing
                  </span>
                </div>
              </div>

              <ImageGallery
                onSelect={(image) => {
                  setValue('featuredImage', image.storage_path)
                  // Small delay to ensure preview updates before dialog closes
                  setTimeout(() => setShowImagePicker(false), 100)
                }}
                bucket='blog/images'
                showRecent={4}
              />
            </div>
          </ImagePickerDialog.InputPanel>

          <ImagePickerDialog.PreviewPanel>
            <FeaturedImagePreview />
          </ImagePickerDialog.PreviewPanel>
        </ImagePickerDialog>
      </ImagePickerProvider>
    </>
  )
}

function FeaturedImagePreview() {
  const { selectedImage } = useImagePicker()
  const storage = useStorage()

  return (
    <div className='flex h-full flex-col'>
      <h3 className='mb-4 font-medium'>Preview</h3>
      {selectedImage ? (
        <div className='flex flex-1 items-center justify-center'>
          <img
            src={
              selectedImage.publicUrl ||
              selectedImage.url ||
              storage.getOptimizedImageUrl(selectedImage.storage_path, {
                type: 'card',
                container: { width: 400, height: 225 },
              })
            }
            alt={selectedImage.filename || 'Featured image preview'}
            className='max-h-full max-w-full rounded-lg object-contain'
          />
        </div>
      ) : (
        <div className='flex flex-1 items-center justify-center'>
          <p className='text-muted-foreground'>Select an image to preview</p>
        </div>
      )}
    </div>
  )
}
