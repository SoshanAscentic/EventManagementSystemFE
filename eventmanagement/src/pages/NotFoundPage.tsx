import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/atoms'

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl rotate-12 opacity-40 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl -rotate-6 opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative text-center animate-fade-in">
        {/* 404 Icon */}
        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-pink-200 rounded-full flex items-center justify-center mb-8 shadow-lg animate-fade-in" style={{animationDelay: '0.1s'}}>
          <Icon name="AlertCircle" className="h-16 w-16 text-red-500" />
        </div>

        {/* 404 Text */}
        <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg mb-8">
            <p className="text-gray-600 leading-relaxed">
              Oops! The page you're looking for seems to have wandered off. It might have been moved, deleted, or perhaps it never existed.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.4s'}}>
          <Button 
            asChild 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
          >
            <Link to="/">
              <Icon name="Home" className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 px-8"
          >
            <Link to="/events">
              <Icon name="Calendar" className="mr-2 h-4 w-4" />
              Browse Events
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 inline-block border border-white/30">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  )
}