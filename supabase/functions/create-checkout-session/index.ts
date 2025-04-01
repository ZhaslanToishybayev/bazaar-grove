import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // УПРОЩЕННАЯ ЛОГИКА МАРШРУТИЗАЦИИ
  if (url.pathname.endsWith('/config') && req.method === 'GET') {
    return await handleConfigCheck(req);
  } else if (url.pathname.endsWith('/check-status') && req.method === 'POST') {
    return await handleCheckSessionStatus(req);
  } else if (url.pathname.endsWith('/webhook') && req.method === 'POST') {
    return await handleStripeWebhook(req);
  } else if (req.method === 'POST' && url.pathname.endsWith('/create-checkout-session')) {
    return await handleCreateCheckoutSession(req);
  } else {
    // Если маршрут не найден, возвращаем 404
    return new Response(
      JSON.stringify({ error: 'Endpoint not found (Simplified Router)', path: url.pathname }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  }

  // Функция проверки конфигурации Stripe
  async function handleConfigCheck(req) {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    const isConfigured = !!(stripeKey && webhookSecret);

    return new Response(
      JSON.stringify({ 
        configured: isConfigured,
        message: 'Stripe configuration check',
        hasStripeKey: !!stripeKey,
        hasWebhookSecret: !!webhookSecret
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  // Функция проверки статуса сессии Stripe
  async function handleCheckSessionStatus(req) {
    // console.log("[EdgeFunction /check-status] handleCheckSessionStatus invoked.");
    try {
      const { session_id } = await req.json();
      if (!session_id) {
        console.error("[EdgeFunction /check-status] Session ID is missing.");
        return new Response(
          JSON.stringify({ error: 'Session ID is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16',
      });
      
      const session = await stripe.checkout.sessions.retrieve(session_id);
      console.log(`[CheckStatus DEBUG] Retrieved Stripe Session ID: ${session.id}, Status: ${session.status}, Payment Status: ${session.payment_status}`); // <-- ЛОГ 1

      let order_id = null;
      let tracking_number = null;
      let shipping_tracking_number = null;

      // Используем SERVICE_ROLE_KEY для обхода RLS при чтении статуса
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // <-- ВАЖНО: Используем Service Role Key
        {
          auth: { 
            autoRefreshToken: false, 
            persistSession: false 
          }
        }
      );
      if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
        console.error("[CheckStatus DEBUG] SUPABASE_SERVICE_ROLE_KEY is missing!");
        return new Response('Internal server configuration error', { status: 500 });
      }
      
      // Ищем заказ по stripe_session_id
      console.log(`[CheckStatus DEBUG] Querying orders table for stripe_session_id: ${session_id}`); // <-- Обновлен лог
      const { data: orderData, error: dbError } = await supabaseClient
        .from('orders')
        .select('id, tracking_number, shipping_tracking_number')
        .eq('stripe_session_id', session_id) // <-- Ищем по stripe_session_id
        .single(); // <-- Ожидаем один результат

      if (dbError) {
        console.error("[CheckStatus DEBUG] DB query error:", dbError); // <-- Лог ошибки
        // Не прерываем выполнение, просто вернем null, как и раньше
      }

      if (orderData) {
        order_id = orderData.id;
        tracking_number = orderData.tracking_number;
        shipping_tracking_number = orderData.shipping_tracking_number;
        console.log(`[CheckStatus DEBUG] Found order by stripe_session_id. ID: ${order_id}, Tracking: ${tracking_number}, Shipping Tracking: ${shipping_tracking_number}`); // <-- Обновлен лог
      } else {
        console.log("[CheckStatus DEBUG] No order found in DB for this stripe_session_id."); // <-- Обновлен лог
      }
      
      // Этот блок больше не нужен, так как мы ищем напрямую по session_id
      /*
      if (session.status === 'complete' && session.metadata) {
        const userId = session.metadata.user_id || session.metadata.userId;
        console.log(`[CheckStatus DEBUG] User ID from retrieved session metadata: ${userId}`); // <-- ЛОГ 2

        if (userId) {
           // ... старый код поиска по user_id ...
        } else {
           console.log("[CheckStatus DEBUG] No userId found in retrieved session metadata."); // <-- ЛОГ 7
        }
      } else {
         console.log("[CheckStatus DEBUG] Session status not 'complete' or metadata missing. Skipping DB check."); // <-- ЛОГ 8
      }
      */

      console.log(`[CheckStatus DEBUG] Returning final order_id: ${order_id}, tracking_number: ${tracking_number}, shipping_tracking_number: ${shipping_tracking_number}`); // <-- Обновлен лог
      return new Response(
        JSON.stringify({ 
          status: session.status,
          payment_status: session.payment_status,
          order_id: order_id,
          tracking_number: tracking_number,
          shipping_tracking_number: shipping_tracking_number,
          stripe_session_id: session.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('[EdgeFunction /check-status] Error in handleCheckSessionStatus:', error); 
      return new Response(
        JSON.stringify({ error: 'Failed to check session status', message: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  }

  // Обработчик создания сессии оплаты Stripe
  async function handleCreateCheckoutSession(req) {
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      );

      const body = await req.json();
      const { line_items, customer_email, metadata } = body;
      
      if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
        console.error("[EdgeFunction] Invalid line_items:", line_items);
        throw new Error('Line items are required');
      }

      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeKey) {
        console.error("[EdgeFunction] Stripe secret key is missing.");
        return new Response(
          JSON.stringify({ error: 'Stripe is not configured', code: 'stripe_not_configured' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      const stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });

      const origin = req.headers.get('origin') || 'http://localhost:8081';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customer_email,
        line_items: line_items,
        mode: 'payment',
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        metadata: metadata || {},
      });

      return new Response(
        JSON.stringify({ id: session.id, url: session.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('[EdgeFunction] Error in handleCreateCheckoutSession:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment session', 
          message: error.message,
          code: error.code || 'unknown_error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  }

  // Обработчик webhook от Stripe
  async function handleStripeWebhook(req) {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    try {
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        console.error('[EdgeFunction /webhook] No Stripe signature found');
        return new Response('No signature', { status: 400 });
      }

      const body = await req.text();
      
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        console.error('[EdgeFunction /webhook] Stripe webhook secret not configured');
        return new Response('Webhook secret not configured', { status: 500 });
      }
      
      let event;
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      } catch (err) {
        console.error(`[EdgeFunction /webhook] Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Получаем user_id из метаданных
        const userId = session.metadata?.user_id;
        if (!userId) {
          console.error('[EdgeFunction /webhook] Missing user_id in session metadata');
          return new Response('Missing user_id in metadata', { status: 400 });
        }

        // Получаем данные о товарах из корзины
        const { data: cartItems, error: cartError } = await supabaseClient
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', userId);

        if (cartError || !cartItems || cartItems.length === 0) {
          console.error('[EdgeFunction /webhook] Error fetching cart items:', cartError);
          return new Response('Error fetching cart items', { status: 400 });
        }

        // Создаем уникальные номера для отслеживания
        const trackingNumber = `BG-${Math.floor(100000 + Math.random() * 900000)}`;
        const shippingTrackingNumber = `SHP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Создаем заказ
        const orderData = {
          user_id: userId,
          status: 'processing',
          payment_status: session.payment_status,
          total_amount: session.amount_total / 100,
          tracking_number: trackingNumber,
          shipping_tracking_number: shippingTrackingNumber,
          stripe_session_id: session.id,
          shipping_address: session.metadata?.shipping_address,
          shipping_city: session.metadata?.shipping_city,
          shipping_postal_code: session.metadata?.shipping_postal_code,
          shipping_country: session.metadata?.shipping_country,
          phone: session.metadata?.phone,
          email: session.customer_details?.email || session.customer_email
        };

        // Вставляем заказ в базу данных
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          console.error('[EdgeFunction /webhook] Error creating order:', orderError);
          return new Response('Error creating order', { status: 500 });
        }

        // Создаем элементы заказа из корзины
        const orderItems = cartItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          name: item.products.name,
          price: item.products.price,
          quantity: item.quantity
        }));

        // Вставляем элементы заказа
        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('[EdgeFunction /webhook] Error creating order items:', itemsError);
          // Удаляем заказ в случае ошибки
          await supabaseClient.from('orders').delete().eq('id', order.id);
          return new Response('Error creating order items', { status: 500 });
        }

        // Очищаем корзину пользователя
        const { error: clearCartError } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (clearCartError) {
          console.error('[EdgeFunction /webhook] Error clearing cart:', clearCartError);
          // Не возвращаем ошибку, так как заказ уже создан
        }

        return new Response(JSON.stringify({ success: true, order_id: order.id }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      }

      // Для других типов событий
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (error) {
      console.error('[EdgeFunction /webhook] Unhandled error:', error);
      return new Response(`Webhook Error: ${error.message}`, { status: 500 });
    }
  }
});
