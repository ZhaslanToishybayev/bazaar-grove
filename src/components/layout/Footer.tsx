
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
              JANA
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Премиум маркетплейс для уникальных товаров со всего мира
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Магазин</h3>
            <ul className="mt-4 space-y-3">
              {['Все товары', 'Новинки', 'Бестселлеры', 'Акции'].map(item => (
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
            <h3 className="text-sm font-medium">Компания</h3>
            <ul className="mt-4 space-y-3">
              {['О нас', 'Карьера', 'Пресса', 'Партнеры'].map(item => (
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
            <h3 className="text-sm font-medium">Поддержка</h3>
            <ul className="mt-4 space-y-3">
              {['Центр помощи', 'Возврат и обмен', 'Связаться с нами', 'FAQ'].map(item => (
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
            © {new Date().getFullYear()} JANA. Все права защищены.
          </p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link 
              to="#" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link 
              to="#" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Условия использования
            </Link>
            <Link 
              to="#" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Политика cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
