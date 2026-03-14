export interface KPI {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface TimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoricalPoint {
  category: string;
  value: number;
}

export interface Order {
  orderNumber: string;
  product: string;
  price: number;
  date: string;
  paymentMethod: string;
}

export interface DashboardData {
  kpis: KPI[];
  revenueOverTime: TimeSeriesPoint[];
  revenueByProduct: CategoricalPoint[];
  paymentMethods: CategoricalPoint[];
  recentOrders: Order[];
}
