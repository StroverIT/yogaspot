'use client';

import { Line, LineChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type BookingsLineChartProps = {
  data: Array<{
    date: string;
    bookings: number;
    signups: number;
    total: number;
  }>;
};

const chartConfig: ChartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'hsl(var(--primary))',
  },
  signups: {
    label: 'Signups',
    color: 'hsl(var(--accent))',
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--secondary))',
  },
};

function formatDay(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { weekday: 'short' });
}

export function BookingsLineChart({ data }: BookingsLineChartProps) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Bookings, Signups & Total (Last 7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDay} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="signups" stroke="var(--color-signups)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={3} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
