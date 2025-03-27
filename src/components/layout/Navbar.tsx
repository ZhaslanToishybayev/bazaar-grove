
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import CartButton from '@/components/cart/CartButton';
import PromoBanner from './PromoBanner';

const navItems = [
  { name: 'Главная', path: '/' },
  { name: 'Товары', path: '/products' },
  { name: 'Категории', path: '/categories' },
  { name: 'О нас', path: '/about' },
  { name: 'Контакты', path: '/contacts' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white border-gray-200 shadow-sm" 
        : "bg-white/95 backdrop-blur-md border-transparent"
    )}>
      <PromoBanner />
      
      <div className={cn(
        "border-b",
        isScrolled ? "border-gray-200" : "border-transparent"
      )}>
        <Container>
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold flex items-center">
              StoreName
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-4px] after:left-0 after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                    isActive(item.path) ? "text-primary after:scale-x-100" : "text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/search')}
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <CartButton />
              
              {user ? (
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative"
                    aria-label="Профиль"
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 absolute bottom-1 right-1" />
                  </Button>
                  <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                        Профиль
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
                      >
                        Выйти
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Войти
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={toggleMenu}
                aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </Container>
      </div>
      
      {isMobile && (
        <div 
          className={cn(
            "fixed inset-0 bg-white z-40 transition-transform duration-300 pt-16",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <Container>
            <nav className="flex flex-col space-y-4 py-8">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "text-lg font-medium py-2 transition-colors hover:text-primary",
                    isActive(item.path) ? "text-primary" : "text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link 
                    to="/profile"
                    className="text-lg font-medium py-2 transition-colors hover:text-primary"
                  >
                    Профиль
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="text-lg font-medium py-2 text-left text-red-600 transition-colors"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth"
                  className="text-lg font-medium py-2 transition-colors hover:text-primary"
                >
                  Войти / Регистрация
                </Link>
              )}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Navbar;
