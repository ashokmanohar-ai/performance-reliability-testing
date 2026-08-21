import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

export const loginDuration = new Trend('login_duration', true);
export const checkoutDuration = new Trend('checkout_duration', true);
export const orderCreationDuration = new Trend('order_creation_duration', true);
export const recoveryTime = new Trend('recovery_time_ms', true);
export const checkoutSuccessRate = new Rate('checkout_success_rate');
export const paymentFailureRate = new Rate('payment_failure_rate');
export const businessTransactions = new Counter('business_transactions');
export const duplicateTransactions = new Counter('duplicate_transactions');
export const activeJourney = new Gauge('active_business_journey');
