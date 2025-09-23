"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 lg:col-span-2 space-y-4"
          >
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/hynox_logo.jpg"
                alt="HYNOX Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-2xl font-bold text-foreground">Campus</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Transforming conversations into actions with intelligent transcription, natural language understanding, and CRM integration.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="https://www.hynox.in/#products" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="https://www.hynox.in/about" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="https://www.hynox.in/contact" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://www.hynox.in/privacy-policy" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="https://www.hynox.in/terms-and-conditions" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground"
        >
          <p className="text-center sm:text-left mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} Hynox. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              href="https://www.linkedin.com/company/hynox-in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </Link>
            <Link
              href="https://www.instagram.com/hynox.in?igsh=aWdjZzd3OGo1NjY4&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Instagram
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
