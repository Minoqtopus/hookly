export interface LemonSqueezyWebhookDto {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      user_email: string;
      product_name: string;
      variant_name: string;
      customer_id: string;
      subscription_id?: string;
    };
  };
}