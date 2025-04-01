import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Truck, 
  Info, 
  ShoppingCart, 
  Heart, 
  ArrowLeft,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProduct } from '@/lib/data';
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist/wishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // Используем React Query для получения данных о продукте
  const { data: product, isLoading, error } = useProduct(id);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-gray-200 rounded-xl"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Container>
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
              <p className="text-muted-foreground mb-8">Товар, который вы ищете, не существует.</p>
              <Button onClick={() => navigate('/products')}>
                Посмотреть все товары
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const isWishlisted = isInWishlist(id || '');
  
  const handleAddToCart = () => {
    if (!user) {
      toast.error('Необходимо войти в систему, чтобы добавить товар в корзину');
      return;
    }
    
    addItemToCart(product.id, quantity);
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error('Необходимо войти в систему, чтобы добавить товар в избранное');
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist(id || '');
    } else {
      addToWishlist(id || '');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <Container>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm mb-6 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Назад
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
              <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 mb-4">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex gap-3">
                {[1, 2, 3].map((index) => (
                  <div 
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden w-24 cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                  >
                    <img 
                      src={product.image_url} 
                      alt={`${product.name} - Вид ${index}`} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col h-full">
                <div>
                  <div className="flex items-center">
                    <span className="text-sm px-2.5 py-1 bg-secondary rounded-full text-muted-foreground">
                      {product.category}
                    </span>
                    <div className="flex items-center ml-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={cn(
                              "fill-current", 
                              i < Math.floor(product.rating) ? "text-amber-400" : "text-muted"
                            )} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({product.reviews_count} отзывов)
                      </span>
                    </div>
                  </div>
                  
                  <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{product.name}</h1>
                  <p className="mt-6 text-lg font-semibold">${product.price.toFixed(2)}</p>
                  
                  <div className="mt-6 prose prose-sm text-muted-foreground">
                    <p>{product.description}</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex flex-col space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Количество</label>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="p-1 text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
                          aria-label="Уменьшить количество"
                        >
                          <MinusCircle size={20} />
                        </button>
                        <span className="w-12 text-center">{quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(1)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Увеличить количество"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        className="flex-1 rounded-full"
                        size="default"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart size={18} className="mr-2" /> В корзину
                      </Button>
                      <Button 
                        variant={isWishlisted ? "secondary" : "outline"}
                        className="rounded-full"
                        onClick={handleAddToWishlist}
                      >
                        <Heart size={18} className={cn("mr-2", isWishlisted ? "fill-primary text-primary" : "")} /> 
                        {isWishlisted ? 'В избранном' : 'В избранное'}
                      </Button>
                    </div>
                    
                    <div className="mt-6 bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Truck className="text-muted-foreground flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <h4 className="font-medium">Бесплатная доставка</h4>
                          <p className="text-sm text-muted-foreground">Бесплатная стандартная доставка для заказов от $50</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 mt-4">
                        <Info className="text-muted-foreground flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <h4 className="font-medium">Возврат</h4>
                          <p className="text-sm text-muted-foreground">30-дневная политика возврата для неиспользованных товаров</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Можно добавить здесь дополнительные секции, такие как "Похожие товары" или "Отзывы" */}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
