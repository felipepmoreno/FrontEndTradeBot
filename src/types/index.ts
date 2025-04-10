// Wallet Types
export interface WalletConnectRequest {
  api_key: string;
  api_secret: string;
  use_testnet: boolean;
}

export interface WalletConnectResponse {
  wallet_id: string;
  message: string;
}

export interface WalletBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface WalletBalanceResponse {
  balances: WalletBalance[];
  timestamp: string;
}

// Order Types
export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL"
}

export enum OrderType {
  MARKET = "MARKET",
  LIMIT = "LIMIT"
}

export enum OrderStatus {
  NEW = "NEW",
  PARTIALLY_FILLED = "PARTIALLY_FILLED",
  FILLED = "FILLED",
  CANCELED = "CANCELED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED"
}

export interface OrderRequest {
  symbol: string;
  quantity: number;
  price?: number;
  wallet_id: string;
}

export interface OrderResponse {
  order_id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  quantity: number;
  price?: number;
  executed_quantity: number;
  cumulative_quote_quantity: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderList {
  orders: OrderResponse[];
  count: number;
  timestamp: string;
}

// Bot Types
export enum BotStatus {
  STOPPED = "stopped",
  RUNNING = "running",
  ERROR = "error"
}

export enum BotStrategy {
  SIMPLE = "simple",
  GRID = "grid"
}

export interface BotConfig {
  symbol: string;
  interval_seconds: number;
  max_amount: number;
  wallet_id: string;
  strategy: BotStrategy;
  buy_threshold?: number;
  sell_threshold?: number;
}

export interface BotStatusResponse {
  status: BotStatus;
  symbol?: string;
  wallet_id?: string;
  start_time?: string;
  last_operation?: string;
  error_message?: string;
  config?: BotConfig;
  timestamp: string;
}

// Binance Types
export interface BinanceStatusResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface PriceResponse {
  symbol: string;
  price: number;
  timestamp: string;
}