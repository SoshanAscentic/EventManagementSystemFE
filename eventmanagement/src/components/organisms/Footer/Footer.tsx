import { Link } from 'react-router-dom'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface FooterLink {
  label: string
  href: string
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

const defaultLinks: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Help', href: '/help' },
]

const defaultSocialLinks: SocialLink[] = [
  { platform: 'Twitter', href: '#', icon: 'Twitter' },
  { platform: 'Facebook', href: '#', icon: 'Facebook' },
  { platform: 'LinkedIn', href: '#', icon: 'Linkedin' },
  { platform: 'Instagram', href: '#', icon: 'Instagram' },
]

export const Footer = ({ 
  links = defaultLinks, 
  socialLinks = defaultSocialLinks, 
  copyright,
  className 
}: FooterProps) => {
  const currentYear = new Date().getFullYear()
  const copyrightText = copyright || `© ${currentYear} EventHub. All rights reserved.`

  return (
    <footer className={cn('border-t bg-gray-50', className)}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="rounded-md bg-primary p-2">
                <Icon name="Calendar" className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventHub</span>
            </Link>
            <p className="text-sm text-gray-600 mb-4">
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
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label={social.platform}
                >
                  <Icon name={social.icon as any} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/events" 
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  to="/events/create" 
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get the latest events and updates delivered to your inbox.
            </p>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">{copyrightText}</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-600">Made with</span>
              <Icon name="Heart" className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600">for the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}