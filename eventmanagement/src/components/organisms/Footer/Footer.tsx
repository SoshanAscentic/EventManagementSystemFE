import { Link } from 'react-router-dom'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { useAuth } from '@/shared/hooks/useAuth'
import { ConditionalRender } from '../../atoms/ConditionalRender/ConditionalRender'
import { PermissionGuard, UserPermissions } from '@/shared/components/PermissionGaurd'

export interface FooterLink {
  label: string
  href: string
  requiresAuth?: boolean
  permissions?: string[]
}

export interface SocialLink {
  platform: string
  href: string
  icon: string
}

export interface FooterProps {
  links?: FooterLink[]
  socialLinks?: SocialLink[]
  copyright?: string
  className?: string
}

const defaultSocialLinks: SocialLink[] = [
  { platform: 'Twitter', href: '#', icon: 'Twitter' },
  { platform: 'Facebook', href: '#', icon: 'Facebook' },
  { platform: 'LinkedIn', href: '#', icon: 'Linkedin' },
  { platform: 'Instagram', href: '#', icon: 'Instagram' },
]

// Support/Help links that are always visible
const supportLinks: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Help Center', href: '/help' },
]

export const Footer = ({ 
  socialLinks = defaultSocialLinks, 
  copyright,
  className 
}: FooterProps) => {
  const { isAuthenticated, hasPermission } = useAuth()
  const currentYear = new Date().getFullYear()
  const copyrightText = copyright || `© ${currentYear} EventHub. All rights reserved.`

  // Dynamic quick links based on user authentication and role
  const getQuickLinks = () => {
    const baseLinks = [
      { label: 'Browse Events', href: '/events' },
      { label: 'Categories', href: '/categories' },
    ]

    if (!isAuthenticated) {
      return [
        ...baseLinks,
        { label: 'Sign In', href: '/auth/login' },
        { label: 'Sign Up', href: '/auth/register' },
      ]
    }

    // Authenticated user links
    const authenticatedLinks = [
      ...baseLinks,
      { label: 'My Profile', href: '/profile' },
      { label: 'My Registrations', href: '/registrations' },
    ]

    return authenticatedLinks
  }

  // Admin specific links
  const getAdminLinks = () => [
    { label: 'Dashboard', href: '/admin', permissions: ['canAccessAdminPanel'] },
    { label: 'Manage Events', href: '/admin/events', permissions: ['canCreateEvents'] },
    { label: 'Manage Categories', href: '/admin/categories', permissions: ['canManageCategories'] },
    { label: 'User Management', href: '/admin/users', permissions: ['canManageUsers'] },
    { label: 'Analytics', href: '/admin/analytics', permissions: ['canViewAnalytics'] },
  ]

  const quickLinks = getQuickLinks()
  const adminLinks = getAdminLinks()

  return (
    <footer className={cn('relative overflow-hidden', className)}>
      {/* Background with gradient and subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        
        {/* Floating geometric elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg rotate-45 blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="group flex items-center space-x-3 w-fit">
              <div className="relative rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <Icon name="Calendar" className="h-7 w-7 text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                EventHub
              </span>
            </Link>
            
            <p className="text-gray-300 leading-relaxed max-w-xs">
              Discover and join amazing events in your area. Create memories that last a lifetime.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                  aria-label={social.platform}
                >
                  <Icon name={social.icon as any} className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white relative">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={link.href} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <Link 
                    to={link.href} 
                    className="group flex items-center text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2"
                  >
                    <Icon name="ArrowRight" className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                    <span className="group-hover:text-blue-400 transition-colors duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Links or Support */}
          <div className="space-y-6">
            <PermissionGuard permissions={['canAccessAdminPanel']}>
              <>
                <h3 className="text-lg font-semibold text-white relative">
                  Admin Panel
                  <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {adminLinks.map((link, index) => (
                    <li key={link.href} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <ConditionalRender condition={!link.permissions || link.permissions.some(permission => hasPermission(permission as keyof UserPermissions))}>
                        <Link 
                          to={link.href} 
                          className="group flex items-center text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2"
                        >
                          <Icon name="ArrowRight" className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                          <span className="group-hover:text-violet-400 transition-colors duration-300">{link.label}</span>
                        </Link>
                      </ConditionalRender>
                    </li>
                  ))}
                </ul>
              </>
            </PermissionGuard>
            
            {/* Support Links - shown when not admin or as fallback */}
            <ConditionalRender condition={!hasPermission('canAccessAdminPanel')}>
              <>
                <h3 className="text-lg font-semibold text-white relative">
                  Support
                  <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {supportLinks.map((link, index) => (
                    <li key={link.href} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <Link 
                        to={link.href} 
                        className="group flex items-center text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2"
                      >
                        <Icon name="ArrowRight" className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                        <span className="group-hover:text-emerald-400 transition-colors duration-300">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            </ConditionalRender>
          </div>

          {/* Newsletter/Contact */}
          <div className="space-y-6">
            <ConditionalRender condition={isAuthenticated}>
              <>
                <h3 className="text-lg font-semibold text-white relative">
                  Stay Connected
                  <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                </h3>
                <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Get notifications about events you might be interested in.
                    </p>
                    <Link 
                      to="/profile" 
                      className="group/btn relative block w-full text-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center">
                        <Icon name="Settings" className="mr-2 h-4 w-4" />
                        Manage Preferences
                      </span>
                    </Link>
                    <p className="text-xs text-gray-400 text-center">
                      Update your notification settings in your profile.
                    </p>
                  </div>
                </div>
              </>
            </ConditionalRender>
            
            <ConditionalRender condition={!isAuthenticated}>
              <>
                <h3 className="text-lg font-semibold text-white relative">
                  Join EventHub
                  <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </h3>
                <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Sign up to discover events and connect with your community.
                    </p>
                    <div className="space-y-3">
                      <Link 
                        to="/auth/register" 
                        className="group/btn relative block w-full text-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/25 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center justify-center">
                          <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                          Sign Up Free
                        </span>
                      </Link>
                      <p className="text-xs text-gray-400 text-center">
                        Already have an account? 
                        <Link to="/auth/login" className="text-green-400 hover:text-green-300 hover:underline transition-colors duration-300 ml-1">
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            </ConditionalRender>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">{copyrightText}</p>
            </div>
            
            {/* Back to top button */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-1"
              aria-label="Back to top"
            >
              <span className="text-sm font-medium">Back to top</span>
              <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                <Icon name="ArrowUp" className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Add required CSS animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </footer>
  )
}