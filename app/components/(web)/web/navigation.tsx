"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Cpu, FolderOpen, BookOpen, Building, Mail } from "lucide-react";
import { Button } from "@/components/(shared)/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/(shared)/ui/sheet";
import Image from "next/image";
// Updated for Next.js public directory (Session 16)
const logoImage = "/assets/logos/strive_logo.webp";

const Navigation = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Resources", path: "/resources" },
    { name: "Our Company", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hero-gradient border-b border-white/20 shadow-lg" style={{ overflow: 'visible' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between h-16">
          {/* Left: Mobile Menu */}
          <div className="flex items-center">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] bg-gradient-to-br from-[#020a1c] to-[#0f172a] border-r border-primary/20">
                <div className="flex flex-col space-y-1 mt-8">
                  {/* Logo in mobile menu */}
                  <div className="mb-8 text-center">
                    <Link href="/" onClick={(e) => { handleLogoClick(e); setMobileMenuOpen(false); }}>
                      <Image
                        src={logoImage}
                        alt="Strive"
                        className="h-12 w-auto max-w-[240px] mx-auto"
                        priority
                      />
                    </Link>
                  </div>
                  {/* Home */}
                  <Link
                    href="/"
                    className={`flex items-center text-white hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/10 ${
                      isActive("/") ? "text-primary bg-white/10 font-medium" : ""
                    }`}
                    onClick={(e) => { handleNavClick(e, "/"); setMobileMenuOpen(false); }}
                    data-testid="mobile-nav-home"
                  >
                    <Home className="w-5 h-5 mr-3 text-[#ff7033]" />
                    Home
                  </Link>

                  {/* Solutions - Simple Link */}
                  <Link
                    href="/solutions"
                    className={`flex items-center text-white hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/10 font-medium ${
                      isActive("/solutions") ? "text-primary bg-white/10 font-medium" : ""
                    }`}
                    onClick={(e) => { handleNavClick(e, "/solutions"); setMobileMenuOpen(false); }}
                    data-testid="mobile-nav-solutions"
                  >
                    <Cpu className="w-5 h-5 mr-3 text-[#ff7033]" />
                    Solutions
                  </Link>

                  {/* Portfolio - Simple Link */}
                  <Link
                    href="/portfolio"
                    className={`flex items-center text-white hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/10 font-medium ${
                      isActive("/portfolio") ? "text-primary bg-white/10 font-medium" : ""
                    }`}
                    onClick={(e) => { handleNavClick(e, "/portfolio"); setMobileMenuOpen(false); }}
                    data-testid="mobile-nav-portfolio"
                  >
                    <FolderOpen className="w-5 h-5 mr-3 text-[#ff7033]" />
                    Portfolio
                  </Link>

                  {/* Resources - Simple Link */}
                  <Link
                    href="/resources"
                    className={`flex items-center text-white hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/10 font-medium ${
                      isActive("/resources") ? "text-primary bg-white/10 font-medium" : ""
                    }`}
                    onClick={(e) => { handleNavClick(e, "/resources"); setMobileMenuOpen(false); }}
                    data-testid="mobile-nav-resources"
                  >
                    <BookOpen className="w-5 h-5 mr-3 text-[#ff7033]" />
                    Resources
                  </Link>

                  <Link
                    href="/about"
                    className={`flex items-center text-white hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/10 ${
                      isActive("/about") ? "text-primary bg-white/10 font-medium" : ""
                    }`}
                    onClick={(e) => { handleNavClick(e, "/about"); setMobileMenuOpen(false); }}
                    data-testid="mobile-nav-about-us"
                  >
                    <Building className="w-5 h-5 mr-3 text-[#ff7033]" />
                    Our Company
                  </Link>
                  <Link
                    href="/contact"
                    className={`flex items-center text-white hover:text-primary transition-all duration-300 p-4 rounded-xl hover:bg-white/10 ${
                      isActive("/contact") ? "text-primary bg-white/10 font-medium" : ""
                    }`}
                    onClick={(e) => { handleNavClick(e, "/contact"); setMobileMenuOpen(false); }}
                    data-testid="mobile-nav-contact"
                  >
                    <Mail className="w-5 h-5 mr-3 text-[#ff7033]" />
                    Contact
                  </Link>
                  <div className="space-y-3 mt-8 pt-6 border-t border-white/20">
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full bg-white/10 text-white hover:bg-primary hover:text-white transition-all duration-300 rounded-xl"
                        data-testid="mobile-button-login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/request">
                      <Button
                        className="w-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 rounded-xl shadow-lg"
                        data-testid="mobile-button-get-started"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center absolute left-1/2 transform -translate-x-1/2" onClick={handleLogoClick}>
            <Image
              src={logoImage}
              alt="Strive"
              className="h-10 w-auto max-w-[200px]"
              priority
            />
          </Link>

          {/* Right: Login Button */}
          <div className="flex items-center">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary text-sm px-3"
                data-testid="mobile-button-login-nav"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center h-16" style={{ overflow: 'visible' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={handleLogoClick}>
            <Image
              src={logoImage}
              alt="Strive"
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" style={{ overflow: 'visible' }}>
            {/* Home */}
            <Link
              href="/"
              className={`nav-link text-foreground hover:text-primary transition-colors ${
                isActive("/") ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "/")}
              data-testid="nav-home"
            >
              Home
            </Link>

            {/* Solutions - Simple Link */}
            <Link
              href="/solutions"
              className={`nav-link text-foreground hover:text-primary transition-colors ${
                isActive("/solutions") ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "/solutions")}
              data-testid="nav-solutions"
            >
              Solutions
            </Link>

            {/* Portfolio - Simple Link */}
            <Link
              href="/portfolio"
              className={`nav-link text-foreground hover:text-primary transition-colors ${
                isActive("/portfolio") ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "/portfolio")}
              data-testid="nav-portfolio"
            >
              Portfolio
            </Link>

            {/* Resources - Simple Link */}
            <Link
              href="/resources"
              className={`nav-link text-foreground hover:text-primary transition-colors ${
                isActive("/resources") ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "/resources")}
              data-testid="nav-resources"
            >
              Resources
            </Link>

            {/* Other Navigation Items */}
            <Link
              href="/about"
              className={`nav-link text-foreground hover:text-primary transition-colors ${
                isActive("/about") ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "/about")}
              data-testid="nav-about"
            >
              Our Company
            </Link>
            <Link
              href="/contact"
              className={`nav-link text-foreground hover:text-primary transition-colors ${
                isActive("/contact") ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, "/contact")}
              data-testid="nav-contact"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary hover:bg-transparent"
                data-testid="button-login"
              >
                Login
              </Button>
            </Link>
            <Link href="/request">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;