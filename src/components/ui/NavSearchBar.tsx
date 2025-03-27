
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { highlightText } from '@/lib/highlightText';

interface NavSearchBarProps {
  className?: string;
}

const NavSearchBar = ({ className = '' }: NavSearchBarProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { suggestions, loading } = useSearchSuggestions(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsExpanded(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setSearchQuery('');
    setIsExpanded(false);
    setShowSuggestions(false);
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    // Фокус на инпуте при открытии
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  // Обработка клика вне компонента поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Закрытие поиска при нажатии Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isExpanded]);

  const displaySuggestions = showSuggestions && suggestions.length > 0 && searchQuery.length >= 2;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {isExpanded ? (
        <div className="animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Поиск товаров..."
                className={`w-[200px] h-9 sm:w-[300px] bg-background ${searchQuery ? 'pr-16' : 'pr-10'}`}
              />
              <div className="absolute right-0 top-0 h-full flex items-center">
                {searchQuery && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-full mr-1 opacity-70 hover:opacity-100 p-1"
                    onClick={clearSearch}
                    aria-label="Очистить поиск"
                  >
                    <X size={14} />
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setShowSuggestions(false);
                  }}
                  className="h-full p-1 text-muted-foreground hover:text-foreground"
                  variant="ghost"
                  size="icon"
                  aria-label="Закрыть поиск"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          </form>

          {displaySuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border max-h-60 overflow-auto">
              <ul className="py-1">
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={index} 
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {highlightText(suggestion, searchQuery)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={toggleSearch}
          className="p-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Открыть поиск"
        >
          <Search size={20} />
        </button>
      )}
    </div>
  );
};

export default NavSearchBar;
