'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { DashboardMonthlyRevenuePoint } from '@/lib/dashboard-monthly-revenue';
import { formatPriceDualFromBgn } from '@/lib/eur-bgn';

type DashboardMonthlyRevenueChartProps = {
  data: DashboardMonthlyRevenuePoint[];
};

const chartConfig: ChartConfig = {
  bookingsBgn: {
    label: 'Записвания',
    color: 'hsl(var(--primary))',
  },
  subscriptionsBgn: {
    label: 'Абонаменти',
    color: 'hsl(var(--secondary))',
  },
};

export function DashboardMonthlyRevenueChart({ data }: DashboardMonthlyRevenueChartProps) {
  const hasRevenue = data.some((row) => row.totalBgn > 0);

  if (!hasRevenue) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
        Все още няма приходи за последните 12 месеца.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${Math.round(value)}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const label = name === 'bookingsBgn' ? 'Записвания' : 'Абонаменти';
                return (
                  <span className="font-medium">
                    {label}: {formatPriceDualFromBgn(Number(value))}
                  </span>
                );
              }}
            />
          }
        />
        <Bar dataKey="bookingsBgn" stackId="revenue" fill="var(--color-bookingsBgn)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="subscriptionsBgn" stackId="revenue" fill="var(--color-subscriptionsBgn)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
