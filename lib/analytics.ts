import { supabase } from './supabase';

export interface AnalyticsEvent {
  event_type: string;
  page_path?: string;
  product_id?: string;
  metadata?: Record<string, any>;
}

class Analytics {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeUser();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  async track(event: AnalyticsEvent) {
    try {
      await supabase.from('analytics').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        event_type: event.event_type,
        page_path: event.page_path || window.location.pathname,
        product_id: event.product_id,
        metadata: event.metadata || {}
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  async trackPageView(path?: string, productId?: string) {
    await this.track({
      event_type: 'page_view',
      page_path: path,
      product_id: productId
    });
  }

  async trackProductView(productId: string) {
    await this.track({
      event_type: 'product_view',
      product_id: productId
    });
  }

  async trackAddToCart(productId: string, size?: string) {
    await this.track({
      event_type: 'add_to_cart',
      product_id: productId,
      metadata: { size }
    });
  }

  async trackPurchase(orderId: string, amount: number, currency: string) {
    await this.track({
      event_type: 'purchase',
      metadata: { order_id: orderId, amount, currency }
    });
  }
}

export const analytics = new Analytics();