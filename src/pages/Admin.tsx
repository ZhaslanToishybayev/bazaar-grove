import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OrderWithItems, getUserOrders, getOrderStatusInfo } from '@/lib/orders';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Package, AlertTriangle, Truck, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

const Admin = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Проверка прав администратора
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // Проверяем, существует ли таблица admins
        const { data: adminTableExists, error: adminTableError } = await supabase
          .from('admins')
          .select('count')
          .limit(1);

        if (adminTableError && adminTableError.message.includes('does not exist')) {
          toast.error('Таблица администраторов не существует');
          setIsAdmin(false);
          return;
        }

        // Проверяем, является ли пользователь администратором
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (adminError && !adminError.message.includes('No rows found')) {
          console.error('Ошибка при проверке статуса администратора:', adminError);
          toast.error('Ошибка при проверке прав доступа');
          setIsAdmin(false);
          return;
        }

        setIsAdmin(!!adminData);
        
        if (!adminData) {
          toast.error('У вас нет прав администратора');
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса администратора:', error);
        toast.error('Ошибка при проверке прав доступа');
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Загрузка заказов
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAdmin) return;
      
      try {
        setLoadingOrders(true);
        const ordersData = await getUserOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        toast.error('Не удалось загрузить заказы');
      } finally {
        setLoadingOrders(false);
      }
    };

    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  // Загрузка сообщений из контактной формы
  useEffect(() => {
    const fetchMessages = async () => {
      if (!isAdmin) return;
      
      try {
        setLoadingMessages(true);
        
        // Проверяем, существует ли таблица messages
        const { error: messagesTableError } = await supabase
          .from('messages')
          .select('count')
          .limit(1);

        if (messagesTableError && messagesTableError.message.includes('does not exist')) {
          toast.error('Таблица сообщений не существует');
          setMessages([]);
          setLoadingMessages(false);
          return;
        }
        
        // Получаем все сообщения
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error);
        toast.error('Не удалось загрузить сообщения');
      } finally {
        setLoadingMessages(false);
      }
    };

    if (isAdmin) {
      fetchMessages();
    }
  }, [isAdmin]);

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Обновляем список заказов
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order
        )
      );

      toast.success('Статус заказа обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      toast.error('Не удалось обновить статус заказа');
    }
  };

  // Обновление статуса сообщения
  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      // Обновляем список сообщений
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId ? { ...message, status: newStatus, updated_at: new Date().toISOString() } : message
        )
      );

      toast.success('Статус сообщения обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении статуса сообщения:', error);
      toast.error('Не удалось обновить статус сообщения');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Необходима авторизация</h1>
              <p className="text-muted-foreground mb-8">
                Для доступа к панели администратора необходимо войти в систему.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Войти / Зарегистрироваться
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="max-w-md mx-auto text-center py-16">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
              <p className="text-muted-foreground mb-8">
                У вас нет прав для доступа к панели администратора.
              </p>
              <Button onClick={() => navigate('/')}>
                Вернуться на главную
              </Button>
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
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>
            
            <Tabs defaultValue="orders">
              <TabsList className="mb-8">
                <TabsTrigger value="orders">Заказы</TabsTrigger>
                <TabsTrigger value="messages">Сообщения</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>
              
              {/* Вкладка с заказами */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление заказами</CardTitle>
                    <CardDescription>
                      Просмотр и обновление статусов заказов
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? (
                      <div className="flex justify-center items-center py-16">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16 bg-muted/20 rounded-lg">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Нет заказов</h3>
                        <p className="text-muted-foreground mb-6">
                          В базе данных пока нет заказов
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ScrollArea className="h-[600px] pr-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3">ID</th>
                                <th className="text-left py-3">Дата</th>
                                <th className="text-left py-3">Сумма</th>
                                <th className="text-left py-3">Статус</th>
                                <th className="text-left py-3">Действия</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map(order => {
                                const statusInfo = getOrderStatusInfo(order.status);
                                const orderDate = order.created_at ? new Date(order.created_at) : new Date();
                                
                                return (
                                  <tr key={order.id} className="border-b hover:bg-muted/50">
                                    <td className="py-3">
                                      <span className="font-medium">{order.id.substring(0, 8)}</span>
                                    </td>
                                    <td className="py-3">
                                      {format(orderDate, 'd MMM yyyy', { locale: ru })}
                                    </td>
                                    <td className="py-3">
                                      ${order.total_amount.toFixed(2)}
                                    </td>
                                    <td className="py-3">
                                      <Badge 
                                        className="font-normal"
                                        style={{ backgroundColor: statusInfo.color, color: 'white' }}
                                      >
                                        {statusInfo.label}
                                      </Badge>
                                    </td>
                                    <td className="py-3">
                                      <div className="flex items-center gap-2">
                                        <Select 
                                          defaultValue={order.status}
                                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                                        >
                                          <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Изменить статус" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">В обработке</SelectItem>
                                            <SelectItem value="processing">Готовится к отправке</SelectItem>
                                            <SelectItem value="shipped">Отправлен</SelectItem>
                                            <SelectItem value="delivered">Доставлен</SelectItem>
                                            <SelectItem value="cancelled">Отменен</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => navigate(`/profile?order=${order.id}`)}
                                        >
                                          Детали
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Вкладка с сообщениями */}
              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Сообщения</CardTitle>
                    <CardDescription>
                      Просмотр и управление сообщениями из контактной формы
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingMessages ? (
                      <div className="flex justify-center items-center py-16">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16 bg-muted/20 rounded-lg">
                        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Нет сообщений</h3>
                        <p className="text-muted-foreground mb-6">
                          В базе данных пока нет сообщений
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ScrollArea className="h-[600px]">
                          {messages.map(message => {
                            const messageDate = message.created_at ? new Date(message.created_at) : new Date();
                            const isNew = message.status === 'new';
                            
                            return (
                              <Card 
                                key={message.id} 
                                className={`mb-4 ${isNew ? 'border-primary' : ''}`}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between">
                                    <div>
                                      <CardTitle className="text-base">{message.name}</CardTitle>
                                      <CardDescription>
                                        {format(messageDate, 'd MMMM yyyy HH:mm', { locale: ru })}
                                        <span className="ml-2">•</span>
                                        <a href={`mailto:${message.email}`} className="ml-2 text-primary">
                                          {message.email}
                                        </a>
                                      </CardDescription>
                                    </div>
                                    <Badge 
                                      className={`${isNew ? 'bg-primary' : 'bg-green-500'} text-white`}
                                    >
                                      {isNew ? 'Новое' : 'Обработано'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2">Тема:</h4>
                                    <p>{message.subject}</p>
                                  </div>
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2">Сообщение:</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {message.message}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                    {isNew ? (
                                      <Button 
                                        onClick={() => updateMessageStatus(message.id, 'processed')}
                                        size="sm"
                                      >
                                        Отметить как обработанное
                                      </Button>
                                    ) : (
                                      <Button 
                                        variant="outline"
                                        onClick={() => updateMessageStatus(message.id, 'new')}
                                        size="sm"
                                      >
                                        Отметить как новое
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Вкладка с настройками */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки</CardTitle>
                    <CardDescription>
                      Управление настройками панели администратора
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Проверка подключения к базе данных</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button onClick={() => navigate('/test-supabase')}>
                              Проверить подключение к Supabase
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Администраторы</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="admin-id">ID администратора</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input 
                                    id="admin-id" 
                                    placeholder="Введите ID пользователя" 
                                    disabled 
                                  />
                                  <Button variant="outline" disabled>Добавить администратора</Button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Эта функция пока недоступна. Добавление администраторов возможно только через SQL.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Admin; 