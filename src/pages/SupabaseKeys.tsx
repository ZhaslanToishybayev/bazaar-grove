import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getSupabaseKeys, generateEnvLocalContent, testSupabaseConnection, SupabaseKeys } from '@/lib/supabase-keys';
import { Copy, ExternalLink, CheckCircle, XCircle, Settings, Database, Server, Key } from 'lucide-react';

const SupabaseKeysPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [keysData, setKeysData] = useState<{
    success: boolean;
    keys?: SupabaseKeys;
    error?: string;
    status: 'success' | 'error' | 'masked';
  } | null>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, any>;
  } | null>(null);
  
  const [copied, setCopied] = useState(false);
  
  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const result = await getSupabaseKeys();
      setKeysData(result);
    } catch (error) {
      console.error('Ошибка при получении ключей:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkConnection = async () => {
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus(result);
    } catch (error) {
      console.error('Ошибка при проверке подключения:', error);
    }
  };
  
  useEffect(() => {
    fetchKeys();
    checkConnection();
  }, []);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  
  const openSupabaseSettings = () => {
    const projectRef = keysData?.keys?.url?.match(/https:\/\/([^.]+)/)?.[1];
    const url = projectRef ? 
      `https://app.supabase.com/project/${projectRef}/settings/api` : 
      'https://app.supabase.com/';
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Key className="h-8 w-8" />
        Ключи Supabase и настройки
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ключи Supabase</CardTitle>
            <CardDescription>
              Получение и управление ключами API для Supabase
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {keysData?.success ? (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">URL проекта</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted p-2 rounded text-sm flex-1 overflow-auto">
                            {keysData.keys?.url || 'Не удалось получить URL'}
                          </code>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => copyToClipboard(keysData.keys?.url || '')}
                            title="Копировать URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Анонимный ключ</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted p-2 rounded text-sm flex-1 overflow-auto">
                            {keysData.keys?.anon_key || 'Не удалось получить ключ'}
                          </code>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => copyToClipboard(keysData.keys?.anon_key || '')}
                            title="Копировать ключ"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {keysData.keys?.service_key && (
                        <div>
                          <p className="text-sm font-medium mb-1">Сервисный ключ (маскированный)</p>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted p-2 rounded text-sm flex-1 overflow-auto">
                              {keysData.keys.service_key}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {keysData.status === 'masked' && (
                      <Alert>
                        <AlertTitle>Ключи замаскированы для безопасности</AlertTitle>
                        <AlertDescription>
                          По соображениям безопасности, показаны только части ключей. 
                          Полные ключи можно скопировать из панели управления Supabase.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Не удалось получить ключи</AlertTitle>
                    <AlertDescription>
                      {keysData?.error || 'Произошла ошибка при получении ключей Supabase'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex-col gap-4">
            <div className="flex flex-col w-full gap-4">
              <Button 
                onClick={() => copyToClipboard(generateEnvLocalContent(keysData?.keys))}
                className="flex items-center gap-2 w-full"
                disabled={copied}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Скопировано!' : 'Скопировать для .env.local'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={openSupabaseSettings}
                className="flex items-center gap-2 w-full"
              >
                <Settings className="h-4 w-4" />
                Открыть настройки API в Supabase
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Статус подключения</CardTitle>
            <CardDescription>
              Проверка текущего подключения к Supabase
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!connectionStatus ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {connectionStatus.success ? (
                    <div className="bg-green-100 text-green-800 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-800 p-2 rounded-full">
                      <XCircle className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{connectionStatus.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Последняя проверка: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {connectionStatus.details && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Клиент Supabase</span>
                        <span className={`text-sm ${connectionStatus.details.client ? 'text-green-600' : 'text-red-600'}`}>
                          {connectionStatus.details.client ? 'Настроен' : 'Не настроен'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Аутентификация</span>
                        <span className={`text-sm ${connectionStatus.details.auth ? 'text-green-600' : 'text-red-600'}`}>
                          {connectionStatus.details.auth ? 'Доступна' : 'Недоступна'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">База данных</span>
                        <span className={`text-sm ${connectionStatus.details.db ? 'text-green-600' : 'text-red-600'}`}>
                          {connectionStatus.details.db ? 'Доступна' : 'Недоступна'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Edge Functions</span>
                        <span className={`text-sm ${connectionStatus.details.functions ? 'text-green-600' : 'text-red-600'}`}>
                          {connectionStatus.details.functions ? 'Доступны' : 'Недоступны'}
                        </span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Таблицы в базе данных</p>
                      {connectionStatus.details.tables && connectionStatus.details.tables.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {connectionStatus.details.tables.map((table, index) => (
                            <div key={index} className="bg-muted p-1 px-2 rounded text-xs">
                              <Database className="h-3 w-3 inline mr-1" /> {table}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Таблицы не найдены или нет доступа</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Сессия</p>
                      <p className="text-sm">
                        {connectionStatus.details.session === 'Активна' ? (
                          <span className="text-green-600">Пользователь авторизован</span>
                        ) : (
                          <span className="text-amber-600">Пользователь не авторизован</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Edge Functions</p>
                      <p className="text-sm">
                        {connectionStatus.details.functionsAvailable > 0 ? (
                          <span className="text-green-600">Доступно {connectionStatus.details.functionsAvailable} функций</span>
                        ) : (
                          <span className="text-amber-600">Функции не найдены или не опубликованы</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={checkConnection} 
              className="flex items-center gap-2"
            >
              <Server className="h-4 w-4" />
              Проверить подключение
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Использование ключей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Настройка локальной разработки</h3>
                <p className="text-sm mb-2">
                  Создайте файл <code className="bg-muted px-1 rounded">.env.local</code> в корне проекта и добавьте следующие переменные:
                </p>
                <div className="bg-muted p-3 rounded">
                  <pre className="text-sm whitespace-pre-wrap">{generateEnvLocalContent(keysData?.keys)}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Настройка переменных окружения в Supabase Functions</h3>
                <p className="text-sm mb-2">
                  Edge Functions требуют дополнительных переменных окружения для работы с базой данных и внешними сервисами:
                </p>
                <div className="bg-muted p-3 rounded">
                  <pre className="text-sm whitespace-pre-wrap">{`SUPABASE_URL=${keysData?.keys?.url || 'https://your-project-id.supabase.co'}
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret`}</pre>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertTitle>Безопасность ключей</AlertTitle>
                <AlertDescription>
                  Никогда не публикуйте секретные ключи в публичных репозиториях.
                  Сервисный ключ (service role key) имеет полный доступ к базе данных в обход политик безопасности.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.open('https://supabase.com/docs/guides/api/api-keys', '_blank')} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Документация по ключам Supabase
              </Button>
              <Button variant="outline" onClick={fetchKeys} className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 256 256" fill="none">
                  <path d="M149.57 128c0 11.917-9.648 21.57-21.57 21.57-11.917 0-21.57-9.653-21.57-21.57 0-11.917 9.653-21.57 21.57-21.57 11.922 0 21.57 9.653 21.57 21.57Z" fill="url(#supabase-logo-mark_svg__a)"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M128 0C57.308 0 0 57.308 0 128s57.308 128 128 128 128-57.308 128-128S198.692 0 128 0ZM44.574 128c0-46.076 37.35-83.426 83.426-83.426 46.071 0 83.426 37.35 83.426 83.426 0 46.071-37.355 83.426-83.426 83.426-46.076 0-83.426-37.355-83.426-83.426Z" fill="url(#supabase-logo-mark_svg__b)"></path>
                  <defs>
                    <linearGradient id="supabase-logo-mark_svg__a" x1="128" y1="106.43" x2="128" y2="149.57" gradientUnits="userSpaceOnUse">
                      <stop stopColor="currentColor"></stop>
                      <stop offset="1" stopColor="currentColor"></stop>
                    </linearGradient>
                    <linearGradient id="supabase-logo-mark_svg__b" x1="128" y1="0" x2="128" y2="256" gradientUnits="userSpaceOnUse">
                      <stop stopColor="currentColor"></stop>
                      <stop offset="1" stopColor="currentColor"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                Обновить ключи
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseKeysPage; 