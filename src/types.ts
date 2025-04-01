import { Database } from '@/integrations/supabase/types';

export type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  image_url?: string | null;
}

export interface OrderStatus {
  value: string;
  label: string;
  color: string;
  progress: number;
}

export interface PaymentStatus {
  value: string;
  label: string;
  color: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  tracking_number: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
} 