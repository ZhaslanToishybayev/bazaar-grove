import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Truck, ArrowLeft, Info, MinusCircle, PlusCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ui/ProductCard';
import { getProductById, getProductsByCategory, Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItemToCart } = useCart();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        
        if (productData && productData.category) {
          const related = await getProductsByCategory(productData.category);
          setRelatedProducts(related.filter(p => p.id !== id).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  if (loading) {
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
              <div className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-200 mb-4"></div>
                <div className="flex gap-3">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="aspect-square rounded-lg bg-gray-200 w-24"></div>
                  ))}
                </div>
              </div>
              
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/5"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
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
  
  if (!product) {
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

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Необходимо войти в систему, чтобы добавить товар в корзину');
      return;
    }
    
    addItemToCart(product.id, quantity);
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
                        variant="outline"
                        className="rounded-full"
                      >
                        <Heart size={18} className="mr-2" /> Сохранить
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
          
          {relatedProducts.length > 0 && (
            <section className="mt-24 mb-16">
              <h2 className="text-2xl font-bold mb-8">Похожие товары</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="animate-fade-in opacity-0"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
