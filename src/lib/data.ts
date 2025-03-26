import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string | null;
  category?: string;
  featured?: boolean;
  rating: number;
  reviews_count: number;
  created_at?: string; // Add this field to the interface
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

// Функция для получения всех категорий
export const getCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return ["All", "Electronics", "Accessories", "Home", "Fitness", "Stationery"];
    }
    
    return ["All", ...data.map(category => category.name)];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ["All", "Electronics", "Accessories", "Home", "Fitness", "Stationery"];
  }
};

// Функция для получения информации о категориях с изображениями
export const getCategoriesWithImages = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories with images:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching categories with images:', error);
    return [];
  }
};

// Функция для получения всех продуктов
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data.map(item => ({
      ...item,
      category: item.categories?.name || ""
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Функция для получения избранных продуктов
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
    
    return data.map(item => ({
      ...item,
      category: item.categories?.name || ""
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Функция для получения продукта по ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching product by id:', error);
      return null;
    }
    
    return {
      ...data,
      category: data.categories?.name || ""
    };
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
};

// Функция для получения продуктов по категории
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    if (category === "All") {
      return getProducts();
    }
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('categories.name', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
    
    return data.map(item => ({
      ...item,
      category: item.categories?.name || ""
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// Временные данные для использования, если загрузка из базы данных не удалась
export const categories = ["All", "Electronics", "Accessories", "Home", "Fitness", "Stationery"];

export const products: Product[] = [
  {
    id: "1",
    name: "Minimalist Watch",
    description: "Elegant minimalist watch with a clean design and premium materials. Perfect for any occasion.",
    price: 149.99,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
    category_id: "1",
    category: "Accessories",
    featured: true,
    rating: 4.8,
    reviews_count: 124
  },
  {
    id: "2",
    name: "Wireless Earbuds",
    description: "High-quality wireless earbuds with noise cancellation and crystal clear sound. Long battery life.",
    price: 129.99,
    image_url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZWFyYnVkc3xlbnwwfHwwfHx8MA%3D%3D",
    category_id: "2",
    category: "Electronics",
    featured: true,
    rating: 4.6,
    reviews_count: 89
  },
  {
    id: "3",
    name: "Leather Wallet",
    description: "Handcrafted leather wallet with multiple card slots and compartments. Durable and stylish.",
    price: 79.99,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbGV0fGVufDB8fDB8fHww",
    category_id: "3",
    category: "Accessories",
    rating: 4.5,
    reviews_count: 67
  },
  {
    id: "4",
    name: "Modern Desk Lamp",
    description: "Adjustable desk lamp with multiple brightness levels and color temperatures. Energy-efficient LED.",
    price: 59.99,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzayUyMGxhbXB8ZW58MHx8MHx8fDA%3D",
    category_id: "4",
    category: "Home",
    rating: 4.3,
    reviews_count: 42
  },
  {
    id: "5",
    name: "Ceramic Coffee Mug",
    description: "Handmade ceramic coffee mug with a minimalist design. Microwave and dishwasher safe.",
    price: 24.99,
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29mZmVlJTIwbXVnfGVufDB8fDB8fHww",
    category_id: "5",
    category: "Home",
    featured: true,
    rating: 4.7,
    reviews_count: 56
  },
  {
    id: "6",
    name: "Premium Notebook",
    description: "High-quality notebook with thick paper and a durable cover. Perfect for journaling or sketching.",
    price: 19.99,
    image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bm90ZWJvb2t8ZW58MHx8MHx8fDA%3D",
    category_id: "6",
    category: "Stationery",
    rating: 4.4,
    reviews_count: 38
  },
  {
    id: "7",
    name: "Smart Water Bottle",
    description: "Insulated water bottle with temperature tracking and hydration reminders. Keeps drinks hot or cold.",
    price: 39.99,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2F0ZXIlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D",
    category_id: "7",
    category: "Fitness",
    rating: 4.2,
    reviews_count: 29
  },
  {
    id: "8",
    name: "Portable Bluetooth Speaker",
    description: "Compact Bluetooth speaker with incredible sound quality and long battery life. Water-resistant.",
    price: 89.99,
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D",
    category_id: "8",
    category: "Electronics",
    featured: true,
    rating: 4.5,
    reviews_count: 78
  }
];
