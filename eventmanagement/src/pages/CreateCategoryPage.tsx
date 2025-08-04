import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/atoms'
import { CreateCategoryForm } from '@/features/categories/components/CreateCategoryForm'

export const CreateCategoryPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
      </div>

      <div className="relative">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8 animate-fade-in">
            <Link
              to="/admin"
              className="hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
            <Icon name="ChevronRight" className="w-4 h-4" />
            <Link
              to="/admin/categories"
              className="hover:text-blue-600 transition-colors"
            >
              Categories
            </Link>
            <Icon name="ChevronRight" className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Create Category</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create New 
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Category
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Categories help organize events and make them easier for users to discover.
            </p>
          </div>

          {/* Quick Access Actions */}
          <div className="text-center mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/categories" className="text-gray-600 hover:text-blue-600">
                  <Icon name="ArrowLeft" className="w-4 h-4 mr-1" />
                  Back to Categories
                </Link>
              </Button>
              <div className="w-px h-4 bg-gray-300"></div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/events" className="text-gray-600 hover:text-blue-600">
                  <Icon name="Calendar" className="w-4 h-4 mr-1" />
                  Manage Events
                </Link>
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <CreateCategoryForm />
          </div>
        </div>
      </div>
    </div>
  )
}