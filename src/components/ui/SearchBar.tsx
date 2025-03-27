
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './input';
import { Button } from './button';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { cn } from '@/lib/utils';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setQuery(suggestion);
    setIsFocused(false);
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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`pr-10 ${variant === 'minimal' ? 'border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted/50' : ''}`}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full"
          >
            <Search size={18} />
          </Button>
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
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
