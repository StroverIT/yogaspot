'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type FunnelBarChartProps = {
  data: Array<{
    step: string;
    count: number;
  }>;
};

const chartConfig: ChartConfig = {
  count: {
    label: 'Users',
    color: 'hsl(var(--accent))',
  },
};

export function FunnelBarChart({ data }: FunnelBarChartProps) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Funnel Drop-off</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="step" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={10} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
