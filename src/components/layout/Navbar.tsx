
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import Container from '../ui/Container';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        {
          'bg-white/80 backdrop-blur-md shadow-nav': isScrolled,
          'bg-transparent': !isScrolled
        }
      )}
    >
      <Container>
        <div className="h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/"
            className="text-xl md:text-2xl font-semibold tracking-tight hover-lift"
          >
            BazaarGrove
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  {
                    'text-primary': location.pathname === link.href,
                    'text-muted-foreground': location.pathname !== link.href
                  }
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button 
              aria-label="Search"
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>
            <Link 
              to="/cart"
              aria-label="Cart"
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
            
            <button 
              aria-label="Toggle menu"
              className="md:hidden h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </Container>
      
      {/* Mobile menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-white z-40 transform transition-transform duration-300 pt-16",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Container className="py-8">
          <nav className="flex flex-col space-y-6">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-lg font-medium py-2 border-b border-muted transition-colors',
                  {
                    'text-primary border-primary': location.pathname === link.href,
                    'text-muted-foreground': location.pathname !== link.href
                  }
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
};

export default Navbar;
