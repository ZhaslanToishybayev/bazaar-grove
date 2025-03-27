
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './input';
import { Button } from './button';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { cn } from '@/lib/utils';
import { highlightText } from '@/lib/highlightText';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'minimal';
}

const SearchBar = ({ 
  className = '',
  placeholder = 'Поиск товаров...',
  variant = 'default'
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { suggestions, loading } = useSearchSuggestions(query);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setQuery(suggestion);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Обработка клика вне компонента поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showSuggestions = isFocused && suggestions.length > 0 && query.length >= 2;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center w-full"
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`${query ? 'pr-16' : 'pr-10'} ${variant === 'minimal' ? 'border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted/50' : ''}`}
          />
          <div className="absolute right-0 top-0 h-full flex items-center">
            {query && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-full mr-1 opacity-70 hover:opacity-100"
                onClick={clearSearch}
                aria-label="Очистить поиск"
              >
                <X size={16} />
              </Button>
            )}
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="h-full"
              aria-label="Поиск"
            >
              <Search size={18} />
            </Button>
          </div>
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-60 overflow-auto">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {highlightText(suggestion, query)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
