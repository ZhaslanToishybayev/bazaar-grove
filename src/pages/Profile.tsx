import { type FC, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, ShoppingBag, Heart, Settings, LogOut, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  user_id: string;
}

const Profile: FC = () => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Type assertion since we know the shape matches our Order interface
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-1/3">
                <Card>
                  <CardHeader className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <CardTitle>{user.email}</CardTitle>
                    <CardDescription>Аккаунт создан</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        className="justify-start" 
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="w-full md:w-2/3">
                <Card>
                  <CardHeader>
                    <CardTitle>Мой профиль</CardTitle>
                    <CardDescription>
                      Управляйте своим аккаунтом и просматривайте историю покупок
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="profile">
                      <TabsList className="mb-4">
                        <TabsTrigger value="profile">
                          <User className="mr-2 h-4 w-4" />
                          Профиль
                        </TabsTrigger>
                        <TabsTrigger value="orders">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Заказы
                        </TabsTrigger>
                        <TabsTrigger value="wishlist">
                          <Heart className="mr-2 h-4 w-4" />
                          Избранное
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Настройки
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="profile" className="space-y-4">
                        <div className="grid gap-4">
                          <div>
                            <h3 className="text-lg font-medium">Информация о пользователе</h3>
                            <p className="text-sm text-muted-foreground">
                              Email: {user.email}
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="orders">
                        {loadingOrders ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : orders.length > 0 ? (
                          <div className="space-y-4">
                            {orders.map((order) => (
                              <Card key={order.id}>
                                <CardContent className="p-4">
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">Заказ №{order.id}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {formatDate(order.created_at)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">{formatPrice(order.total_amount)}</p>
                                        <p className="text-sm text-green-600">
                                          {order.payment_status === 'paid' ? 'Оплачен' : 'В обработке'}
                                        </p>
                                      </div>
                                    </div>
                                    {order.shipping_address && (
                                      <div className="text-sm text-muted-foreground">
                                        <p>Адрес доставки:</p>
                                        <p>{order.shipping_address}</p>
                                        <p>{order.shipping_city}, {order.shipping_postal_code}</p>
                                        <p>{order.shipping_country}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                            <h3 className="mt-4 text-lg font-medium">Нет заказов</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              У вас пока нет заказов
                            </p>
                            <Button className="mt-4" asChild>
                              <a href="/products">Начать покупки</a>
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="wishlist">
                        <div className="text-center py-8">
                          <Heart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                          <h3 className="mt-4 text-lg font-medium">Избранное пусто</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            У вас пока нет товаров в избранном
                          </p>
                          <Button className="mt-4" asChild>
                            <a href="/products">Просмотреть товары</a>
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="settings">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Настройки аккаунта</h3>
                          <p className="text-sm text-muted-foreground">
                            Настройки аккаунта пока недоступны
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
