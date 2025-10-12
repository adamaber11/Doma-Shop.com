'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Users, CreditCard, Activity, DollarSign } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  sales: {
    label: 'المبيعات (عدد الطلبات)',
    color: 'hsl(var(--primary))',
  },
  revenue: {
    label: 'الإيرادات (درهم)',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

interface MonthlyData {
  month: string;
  sales: number;
  revenue: number;
}

export default function DashboardPage() {
  const firestore = useFirestore();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!firestore) return;

      setIsLoading(true);
      
      const processOrders = (allOrders: Order[]) => {
          // Filter out cancelled orders on the client side
          const activeOrders = allOrders.filter(order => order.status !== 'Cancelled');
          
          // Calculate stats
          const revenue = activeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          const sales = activeOrders.length;
          const customers = new Set(activeOrders.map(order => order.userId)).size;

          setTotalRevenue(revenue);
          setTotalSales(sales);
          setTotalCustomers(customers);

          // Process data for chart
          const monthlySummary: { [key: string]: { sales: number; revenue: number } } = {};
          const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

          activeOrders.forEach(order => {
            if (order.orderDate) {
              const date = order.orderDate.toDate();
              const month = date.getMonth(); // 0-11
              const year = date.getFullYear();
              const key = `${year}-${month}`;

              if (!monthlySummary[key]) {
                monthlySummary[key] = { sales: 0, revenue: 0 };
              }
              monthlySummary[key].sales += 1;
              monthlySummary[key].revenue += order.totalAmount || 0;
            }
          });
          
          const chartData = Object.keys(monthlySummary).map(key => {
            const [year, monthIndex] = key.split('-');
            return {
              month: `${monthNames[parseInt(monthIndex)]} ${year}`,
              sales: monthlySummary[key].sales,
              revenue: monthlySummary[key].revenue,
            };
          }).slice(-6); // Get last 6 months of data

          setMonthlyData(chartData);
      };

      try {
        // Fetch all orders and order them. Filtering happens on the client.
        const ordersQuery = query(
          collectionGroup(firestore, 'orders'),
          orderBy('orderDate', 'desc')
        );
        const querySnapshot = await getDocs(ordersQuery);
        const allOrders: Order[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        processOrders(allOrders);

      } catch (error) {
        console.error("Error fetching ordered dashboard data, trying fallback:", error);
        try {
            // Fallback query without ordering if the index doesn't exist yet.
            const fallbackQuery = query(collectionGroup(firestore, 'orders'));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const fallbackOrders: Order[] = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            processOrders(fallbackOrders);
        } catch (fallbackError) {
            console.error("Error fetching dashboard data with fallback:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [firestore]);
  

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-headline font-bold">نظرة عامة</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                <div className="text-2xl font-bold">
                    {totalRevenue.toLocaleString('ar-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 2 })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                إجمالي الإيرادات من الطلبات المكتملة.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                <div className="text-2xl font-bold">+{totalSales}</div>
              )}
              <p className="text-xs text-muted-foreground">
                العدد الإجمالي للطلبات المكتملة.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                    <div className="text-2xl font-bold">+{totalCustomers}</div>
                )}
                <p className="text-xs text-muted-foreground">
                    العملاء الذين قاموا بالشراء.
                </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                    <div className="text-2xl font-bold">
                        {(totalSales > 0 ? totalRevenue / totalSales : 0).toLocaleString('ar-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 2 })}
                    </div>
                )}
                <p className="text-xs text-muted-foreground">
                    متوسط قيمة كل طلبية.
                </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>نظرة عامة على المبيعات</CardTitle>
            <CardDescription>
              عرض المبيعات والإيرادات خلال الأشهر الماضية.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                </div>
            ) : monthlyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="w-full h-[300px]">
                <BarChart
                    accessibilityLayer
                    data={monthlyData}
                    margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--color-sales)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-revenue)" />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} yAxisId="left" />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} yAxisId="right" />
                </BarChart>
                </ChartContainer>
            ) : (
                <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                    لا توجد بيانات كافية لعرض الرسم البياني.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
