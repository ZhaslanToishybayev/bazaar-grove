import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist/wishlistContext';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart/cartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const navigate = useNavigate();
  
  // Переадресуем на страницу авторизации, если пользователь не авторизован
  React.useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  const handleAddToCart = (productId: string) => {
    addItemToCart(productId);
  };
  
  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="rounded-lg border p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
  
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
          
          <div className="flex flex-col mb-16">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">Мои избранные товары</h1>
              {wishlist.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 size={16} className="mr-2" /> Очистить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Очистить список избранного?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Все товары будут удалены из списка избранного. Это действие невозможно отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => clearWishlist()}>
                        Очистить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {wishlist.length === 0 ? (
              <Card className="text-center py-12">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-secondary p-3">
                      <Heart size={32} className="text-muted-foreground" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Список избранного пуст</CardTitle>
                  <CardDescription>
                    Вы еще не добавили ни одного товара в избранное
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => navigate('/products')}>
                    Перейти к товарам
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {wishlist.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div 
                          className="sm:w-32 sm:h-32 h-40 overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/products/${item.product_id}`)}
                        >
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                {item.product.category || "Без категории"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Добавлено {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 
                              className="font-medium text-lg mb-2 cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/products/${item.product_id}`)}
                            >
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {item.product.description}
                            </p>
                            <div className="font-bold text-lg">
                              ${item.product.price.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveFromWishlist(item.product_id)}
                            >
                              <Trash2 size={16} className="mr-2" /> Удалить
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleAddToCart(item.product_id)}
                            >
                              <ShoppingCart size={16} className="mr-2" /> В корзину
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist; 