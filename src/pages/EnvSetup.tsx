import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkEnvironmentVariables, getEnvironmentSetupUrl, getStripeKeysUrl, getStripeWebhooksUrl } from '@/lib/check-env-variables';
import { CircleCheck, CircleX, ExternalLink, FileCode, AlertTriangle, Copy, CheckCircle } from 'lucide-react';

const EnvSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [checkResults, setCheckResults] = useState<{
    success: boolean;
    results: Record<string, { exists: boolean; hint?: string }>;
    timestamp: string;
  } | null>(null);
  
  const checkEnv = async () => {
    setIsLoading(true);
    try {
      const results = await checkEnvironmentVariables();
      setCheckResults(results);
    } catch (error) {
      console.error('Ошибка при проверке переменных окружения:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkEnv();
  }, []);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Настройка переменных окружения</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Локальные переменные окружения</CardTitle>
            <CardDescription>
              Проверка наличия переменных окружения в локальном проекте (.env файлы)
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {checkResults && Object.entries(checkResults.results)
                  .filter(([key]) => !key.startsWith('REMOTE_'))
                  .map(([key, { exists, hint }]) => (
                    <div key={key} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {exists ? (
                            <CircleCheck className="text-green-500 h-5 w-5" />
                          ) : (
                            <CircleX className="text-red-500 h-5 w-5" />
                          )}
                          <span className="font-mono text-sm">{key}</span>
                        </div>
                        <Badge variant={exists ? "success" : "destructive"}>
                          {exists ? "Найден" : "Отсутствует"}
                        </Badge>
                      </div>
                      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
                    </div>
                  ))}
                  
                <Alert variant={
                  checkResults && Object.entries(checkResults.results)
                    .filter(([key]) => !key.startsWith('REMOTE_'))
                    .every(([_, { exists }]) => exists)
                    ? "success" : "destructive"
                }>
                  <AlertTitle>
                    {checkResults && Object.entries(checkResults.results)
                      .filter(([key]) => !key.startsWith('REMOTE_'))
                      .every(([_, { exists }]) => exists)
                      ? "Все локальные переменные настроены" 
                      : "Необходимо настроить локальные переменные"
                    }
                  </AlertTitle>
                  <AlertDescription>
                    {checkResults && Object.entries(checkResults.results)
                      .filter(([key]) => !key.startsWith('REMOTE_'))
                      .every(([_, { exists }]) => exists)
                      ? "Ваш локальный проект имеет все необходимые переменные окружения"
                      : "Создайте файл .env.local в корне проекта и добавьте необходимые переменные"
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="flex flex-col w-full gap-4">
              <Button 
                variant="outline" 
                onClick={() => 
                  copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`)
                }
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Скопировать шаблон .env.local
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Удаленные переменные окружения</CardTitle>
            <CardDescription>
              Проверка наличия переменных окружения в Supabase Functions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {checkResults && Object.entries(checkResults.results)
                  .filter(([key]) => key.startsWith('REMOTE_'))
                  .map(([key, { exists, hint }]) => (
                    <div key={key} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {exists ? (
                            <CircleCheck className="text-green-500 h-5 w-5" />
                          ) : (
                            <CircleX className="text-red-500 h-5 w-5" />
                          )}
                          <span className="font-mono text-sm">{key.replace('REMOTE_', '')}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {exists ? "Настроен" : "Отсутствует"}
                        </span>
                      </div>
                      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
                    </div>
                  ))}
                
                {(!checkResults || !Object.entries(checkResults.results).some(([key]) => key.startsWith('REMOTE_'))) && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Не удалось проверить удаленные переменные окружения</AlertTitle>
                    <AlertDescription>
                      Необходимо опубликовать функцию check-environment в Supabase Functions
                    </AlertDescription>
                  </Alert>
                )}
                
                {checkResults && Object.entries(checkResults.results).some(([key]) => key.startsWith('REMOTE_')) && (
                  <Alert variant={
                    Object.entries(checkResults.results)
                      .filter(([key]) => key.startsWith('REMOTE_'))
                      .every(([_, { exists }]) => exists)
                      ? "success" : "destructive"
                  }>
                    <AlertTitle>
                      {Object.entries(checkResults.results)
                        .filter(([key]) => key.startsWith('REMOTE_'))
                        .every(([_, { exists }]) => exists)
                        ? "Все удаленные переменные настроены"
                        : "Необходимо настроить удаленные переменные"
                      }
                    </AlertTitle>
                    <AlertDescription>
                      {Object.entries(checkResults.results)
                        .filter(([key]) => key.startsWith('REMOTE_'))
                        .every(([_, { exists }]) => exists)
                        ? "Ваши Supabase Functions имеют все необходимые переменные окружения"
                        : "Перейдите в настройки Supabase Functions и добавьте необходимые переменные окружения"
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="flex flex-col w-full gap-4">
              <Button onClick={() => openInNewTab(getEnvironmentSetupUrl())} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Настроить переменные в Supabase
              </Button>
              <Button variant="outline" onClick={() => openInNewTab(getStripeKeysUrl())} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Получить ключи Stripe
              </Button>
              <Button variant="outline" onClick={() => openInNewTab(getStripeWebhooksUrl())} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Настроить вебхуки Stripe
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Необходимые переменные окружения</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Переменная</th>
                  <th className="border p-2 text-left">Где настроить</th>
                  <th className="border p-2 text-left">Описание</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</td>
                  <td className="border p-2">.env.local</td>
                  <td className="border p-2">URL вашего проекта Supabase</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                  <td className="border p-2">.env.local</td>
                  <td className="border p-2">Анонимный ключ API Supabase</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono text-sm">STRIPE_SECRET_KEY</td>
                  <td className="border p-2">Supabase Functions</td>
                  <td className="border p-2">Секретный ключ API Stripe</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono text-sm">STRIPE_WEBHOOK_SECRET</td>
                  <td className="border p-2">Supabase Functions</td>
                  <td className="border p-2">Секретный ключ для проверки подписи вебхуков Stripe</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono text-sm">SUPABASE_URL</td>
                  <td className="border p-2">Supabase Functions</td>
                  <td className="border p-2">URL проекта Supabase (внутренний доступ)</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono text-sm">SUPABASE_SERVICE_ROLE_KEY</td>
                  <td className="border p-2">Supabase Functions</td>
                  <td className="border p-2">Сервисный ключ Supabase для полного доступа к БД</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
          <CardFooter>
            <Button onClick={checkEnv} disabled={isLoading}>
              {isLoading ? 'Проверка...' : 'Проверить снова'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Отдельный компонент для стилизованного бейджа
const Badge = ({ variant, children }: { variant: 'success' | 'destructive'; children: React.ReactNode }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      variant === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {children}
    </span>
  );
};

export default EnvSetup; 