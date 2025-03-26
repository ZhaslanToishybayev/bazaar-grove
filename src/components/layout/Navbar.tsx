
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react';
import Container from '../ui/Container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
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
    setIsSearchActive(false);
  }, [location]);

  const links = [
    { name: 'Главная', href: '/' },
    { name: 'Товары', href: '/products' },
    { name: 'Категории', href: '/categories' },
    { name: 'О нас', href: '/about' },
    { name: 'Контакты', href: '/contacts' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        {
          'bg-white/90 backdrop-blur-md shadow-nav': isScrolled || isSearchActive,
          'bg-transparent': !isScrolled && !isSearchActive
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
            JANA
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

          {/* Search Bar (visible when active) */}
          {isSearchActive && (
            <div className="absolute inset-x-0 top-0 bg-white/90 backdrop-blur-md shadow-nav h-16 md:h-20 flex items-center justify-center px-4 animate-fade-in">
              <Container>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    className="flex h-10 w-full rounded-l-full border border-input border-r-0 bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    autoFocus
                  />
                  <Button className="h-10 rounded-l-none rounded-r-full">
                    <Search size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2" 
                    onClick={() => setIsSearchActive(false)}
                  >
                    <X size={18} />
                  </Button>
                </div>
              </Container>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              aria-label="Search"
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsSearchActive(true)}
            >
              <Search size={20} />
            </button>
            
            <Link 
              to="/wishlist"
              aria-label="Wishlist"
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart size={20} />
            </Link>
            
            <Link 
              to="/account"
              aria-label="Account"
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <User size={20} />
            </Link>
            
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
              className="md:hidden h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors ml-1"
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
            <div className="pt-4 space-y-4">
              <Link to="/account" className="flex items-center py-2 text-lg font-medium">
                <User size={20} className="mr-2" /> Мой аккаунт
              </Link>
              <Link to="/wishlist" className="flex items-center py-2 text-lg font-medium">
                <Heart size={20} className="mr-2" /> Мои желания
              </Link>
              <Link to="/cart" className="flex items-center py-2 text-lg font-medium">
                <ShoppingCart size={20} className="mr-2" /> Моя корзина
              </Link>
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
};

export default Navbar;
