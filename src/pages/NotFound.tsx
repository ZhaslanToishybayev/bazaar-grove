
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Ошибка: Пользователь попытался получить доступ к несуществующему маршруту:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-7xl font-bold text-primary mb-6">404</h1>
        <p className="text-2xl font-medium text-gray-800 mb-4">Упс! Страница не найдена</p>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Извините, но страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
