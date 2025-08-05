import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icon, Spinner } from '@/components/atoms'
import { useCreateCategoryMutation } from '@/features/categories/api/categoriesApi'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
})

type CreateCategoryFormData = z.infer<typeof createCategorySchema>

export const CreateCategoryForm = () => {
  const navigate = useNavigate()
  const [createCategory, { isLoading }] = useCreateCategoryMutation()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
  })

  const onSubmit = async (data: CreateCategoryFormData) => {
    try {
      setError('')
      
      const categoryData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isActive: true, // Default to active
      }

      const result = await createCategory(categoryData).unwrap()
      
      if (result.success) {
        navigate('/admin/categories', {
          state: { message: 'Category created successfully!' }
        })
      } else {
        setError(result.message || 'Failed to create category')
      }
    } catch (err: any) {
      console.error('Category creation error:', err)
      setError(err?.data?.message || 'An unexpected error occurred')
    }
  }

  const handleCancel = () => {
    reset()
    navigate('/admin/categories')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <Icon name="AlertCircle" className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Category Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter category name"
                className="mt-1"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description for this category"
                rows={4}
                className="mt-1"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Spinner size="small" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon name="Plus" className="w-4 h-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400"
              >
                <Icon name="X" className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}