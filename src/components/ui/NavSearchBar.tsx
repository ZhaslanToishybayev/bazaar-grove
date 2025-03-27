
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from './input';

interface NavSearchBarProps {
  className?: string;
}

const NavSearchBar = ({ className = '' }: NavSearchBarProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsExpanded(false);
    }
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    // Фокус на инпуте при открытии
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-[200px] h-9 sm:w-[300px] bg-background"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Закрыть поиск"
          >
            &times;
          </button>
        </form>
      ) : (
        <button
          onClick={toggleSearch}
          className="p-2 rounded-full hover:bg-muted flex items-center justify-center"
          aria-label="Открыть поиск"
        >
          <Search size={20} />
        </button>
      )}
    </div>
  );
};

export default NavSearchBar;
