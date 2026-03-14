import { DashboardData, Order, TimeSeriesPoint, CategoricalPoint, KPI } from '../types';
import { rawDataString } from './rawData';

// Parse TSV
const lines = rawDataString.trim().split('\n').slice(1); // skip header
export const allOrders: Order[] = lines.map(line => {
  const [orderNumber, product, priceStr, date, paymentMethod] = line.split('\t');
  return {
    orderNumber,
    product,
    price: parseFloat(priceStr.replace('$', '')),
    date,
    paymentMethod
  };
});

export function computeDashboardData(orders: Order[], startDate?: string, endDate?: string): DashboardData {
  let filteredOrders = orders;
  
  if (startDate) {
    filteredOrders = filteredOrders.filter(o => o.date >= startDate);
  }
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => o.date <= endDate);
  }

  // Calculate KPIs
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.price, 0);
  const totalItems = filteredOrders.length;
  const uniqueOrders = new Set(filteredOrders.map(o => o.orderNumber)).size;
  const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;

  const kpis: KPI[] = [
    { 
      title: 'Total Revenue', 
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue), 
    },
    { 
      title: 'Items Sold', 
      value: totalItems.toLocaleString(), 
    },
    { 
      title: 'Total Orders', 
      value: uniqueOrders.toLocaleString(), 
    },
    { 
      title: 'Avg Order Value', 
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgOrderValue), 
    }
  ];

  // Time Series (Daily Revenue)
  const dailyData = filteredOrders.reduce((acc, order) => {
    if (!acc[order.date]) acc[order.date] = { revenue: 0, orders: 0 };
    acc[order.date].revenue += order.price;
    acc[order.date].orders += 1;
    return acc;
  }, {} as Record<string, { revenue: number, orders: number }>);

  const revenueOverTime: TimeSeriesPoint[] = Object.entries(dailyData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Revenue by Product
  const productData = filteredOrders.reduce((acc, order) => {
    if (!acc[order.product]) acc[order.product] = 0;
    acc[order.product] += order.price;
    return acc;
  }, {} as Record<string, number>);

  const revenueByProduct: CategoricalPoint[] = Object.entries(productData)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  // Payment Methods
  const paymentData = filteredOrders.reduce((acc, order) => {
    if (!acc[order.paymentMethod]) acc[order.paymentMethod] = 0;
    acc[order.paymentMethod] += 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentMethods: CategoricalPoint[] = Object.entries(paymentData)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  return {
    kpis,
    revenueOverTime,
    revenueByProduct,
    paymentMethods,
    recentOrders: [...filteredOrders].sort((a, b) => b.date.localeCompare(a.date)) // newest first
  };
}

export const dashboardData = computeDashboardData(allOrders);
