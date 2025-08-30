import { useState, useCallback } from 'react'
import { useWatch } from 'react-hook-form'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Eye, Settings, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BlogImageUploader } from './components/BlogImageUploader'
import { BlogMetadataForm } from './components/BlogMetadataForm'
import { BlogPreview } from './components/BlogPreview'
import { ContentEditor } from './components/ContentEditor'
import { useAutoSave } from './hooks/useAutoSave'
import { useBlogEditor } from './hooks/useBlogEditor'

export default function BlogEditorPage() {
  const {
    form,
    onSubmit,
    isLoading,
    isEditMode,
    isSaving,
    onDelete,
    isDeleting,
  } = useBlogEditor()
  const [activeTab, setActiveTab] = useState('editor')

  // Get postId from URL params for auto-save (only in edit mode)
  let postId: string | undefined
  try {
    const params = useParams({ from: '/admin/_authenticated/blogs/$id/edit' })
    postId = params.id
  } catch {
    postId = undefined
  }

  // Auto-save hook with 30 second delay
  const { isSaving: isAutoSaving } = useAutoSave({
    watch: form.watch,
    isDirty: form.formState.isDirty,
    postId,
    enabled: isEditMode,
    delay: 30000, // 30 seconds
  })

  // Image upload handler
  const { handleImageUpload } = BlogImageUploader({
    postId,
    onUploadComplete: () => {
      // Image uploaded successfully
    },
  })

  // Watch form fields using useWatch hook to prevent re-renders
  const content = useWatch({
    control: form.control,
    name: 'content',
  })

  const title = useWatch({
    control: form.control,
    name: 'title',
  })

  const author = useWatch({
    control: form.control,
    name: 'author',
  })

  const draft = useWatch({
    control: form.control,
    name: 'draft',
    defaultValue: true,
  })

  const tags = useWatch({
    control: form.control,
    name: 'tags',
  })

  const slug = useWatch({
    control: form.control,
    name: 'slug',
  })

  const excerpt = useWatch({
    control: form.control,
    name: 'excerpt',
  })

  const featuredImage = useWatch({
    control: form.control,
    name: 'featuredImage',
  })

  const publishedAt = useWatch({
    control: form.control,
    name: 'publishedAt',
  })

  // Content change handler - memoized to prevent re-creation
  const handleContentChange = useCallback(
    (value: string, context?: { isFormatting?: boolean }) => {
      form.setValue('content', value, {
        shouldValidate: true,
        shouldDirty: !context?.isFormatting, // Don't mark dirty for formatting actions
        shouldTouch: true,
      })
    },
    [form]
  )

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ml-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='space-y-4'>
            <Skeleton className='h-12 w-[200px]' />
            <Skeleton className='h-[600px] w-full' />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Link to='/admin/blogs'>
                  <Button variant='ghost' size='icon'>
                    <ArrowLeft className='h-4 w-4' />
                  </Button>
                </Link>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>
                    {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </h1>
                  <p className='text-muted-foreground'>
                    {isEditMode
                      ? 'Update your blog post content and settings'
                      : 'Write and publish your blog content'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {isAutoSaving && (
                  <span className='text-muted-foreground text-sm'>
                    Saving...
                  </span>
                )}
                <Button type='submit' disabled={isSaving}>
                  <Save className='mr-2 h-4 w-4' />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-[400px] grid-cols-3'>
                <TabsTrigger value='editor' className='flex items-center gap-2'>
                  <Edit className='h-4 w-4' />
                  Editor
                </TabsTrigger>
                <TabsTrigger
                  value='settings'
                  className='flex items-center gap-2'
                >
                  <Settings className='h-4 w-4' />
                  Settings
                </TabsTrigger>
                <TabsTrigger
                  value='preview'
                  className='flex items-center gap-2'
                >
                  <Eye className='h-4 w-4' />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value='editor' forceMount>
                <div
                  className={
                    activeTab !== 'editor' ? 'hidden' : 'mt-6 space-y-4'
                  }
                >
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Enter blog post title'
                            className='text-lg font-medium'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ContentEditor
                    value={content}
                    onChange={handleContentChange}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </TabsContent>

              <TabsContent value='settings' forceMount>
                <div className={activeTab !== 'settings' ? 'hidden' : 'mt-6'}>
                  <BlogMetadataForm
                    control={form.control}
                    setValue={form.setValue}
                    postId={postId}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                    title={title}
                  />
                </div>
              </TabsContent>

              <TabsContent value='preview' forceMount>
                <div className={activeTab !== 'preview' ? 'hidden' : 'mt-6'}>
                  <BlogPreview
                    title={title}
                    author={author}
                    content={content}
                    draft={draft ?? true}
                    tags={tags}
                    slug={slug}
                    excerpt={excerpt}
                    featuredImage={featuredImage as string | undefined}
                    publishedAt={publishedAt}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </Main>
    </>
  )
}
