"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-brand-cyan via-brand-magenta to-brand-green bg-clip-text text-transparent">
                  HVOX
                </div>
                <div className="flex space-x-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse delay-100 group-hover:scale-125 transition-transform"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-magenta animate-pulse delay-200 group-hover:scale-125 transition-transform"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse delay-300 group-hover:scale-125 transition-transform"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse delay-400 group-hover:scale-125 transition-transform"></div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'Services', href: '#services' },
                { label: 'Portfolio', href: '#portfolio' },
                { label: 'Contact', href: '#contact' }
              ].map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-cyan to-brand-magenta group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 text-foreground/70 hover:text-foreground hover:bg-brand-cyan/10 rounded-xl transition-all duration-300"
              >
                {theme === "dark" ? 
                  <Sun className="h-5 w-5" /> : 
                  <Moon className="h-5 w-5" />
                }
              </Button>

              {/* CTA Button - Desktop */}
              <Button className="hidden lg:inline-flex items-center space-x-2 bg-gradient-to-r from-brand-cyan to-brand-magenta hover:from-brand-magenta hover:to-brand-cyan text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-brand-cyan/25 transition-all duration-300 group">
                <span className="font-medium">Join Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="lg:hidden p-2 text-foreground hover:bg-brand-cyan/10 rounded-xl transition-all duration-300"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute inset-0 transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'
                  }`}>
                    <Menu className="h-6 w-6" />
                  </span>
                  <span className={`absolute inset-0 transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'
                  }`}>
                    <X className="h-6 w-6" />
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden bg-background/95 backdrop-blur-lg border-t border-border/50`}>
          <nav className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'Services', href: '#services' },
                { label: 'Portfolio', href: '#portfolio' },
                { label: 'Contact', href: '#contact' }
              ].map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium text-foreground/80 hover:text-brand-cyan transition-colors duration-300 py-2 border-b border-border/20 last:border-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile CTA Button */}
              <Button 
                className="mt-4 w-full bg-gradient-to-r from-brand-cyan to-brand-magenta hover:from-brand-magenta hover:to-brand-cyan text-white py-3 rounded-xl shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-medium">Join Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-16 lg:h-20"></div>
    </>
  )
}