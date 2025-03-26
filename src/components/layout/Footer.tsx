
import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-muted mt-24 pt-16 pb-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-semibold tracking-tight">
              BazaarGrove
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium marketplace for unique products from around the world
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Shop</h3>
            <ul className="mt-4 space-y-3">
              {['All Products', 'New Arrivals', 'Best Sellers', 'Deals'].map(item => (
                <li key={item}>
                  <Link 
                    to="#" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="mt-4 space-y-3">
              {['About Us', 'Careers', 'Press', 'Partners'].map(item => (
                <li key={item}>
                  <Link 
                    to="#" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">Support</h3>
            <ul className="mt-4 space-y-3">
              {['Help Center', 'Returns & Exchanges', 'Contact Us', 'FAQ'].map(item => (
                <li key={item}>
                  <Link 
                    to="#" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-muted flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BazaarGrove. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link 
              to="#" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="#" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="#" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
