
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: string;
  image: string;
  index: number;
  className?: string;
}

const CategoryCard = ({ category, image, index, className }: CategoryCardProps) => {
  return (
    <Link
      to={`/products?category=${category}`}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white shadow-subtle hover:shadow-product transition-all duration-300 group animate-zoom-in opacity-0",
        className
      )}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
      <img 
        src={image} 
        alt={category}
        className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
        <h3 className="text-lg font-medium">{category}</h3>
        <p className="text-sm text-white/80 mt-1 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          View collection
        </p>
      </div>
    </Link>
  );
};

export default CategoryCard;
