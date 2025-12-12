import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useWeeklyTrends } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  collections: { label: "Weekly Collections", color: "hsl(var(--info))" },
  loans: { label: "Outstanding Loans", color: "hsl(var(--warning))" },
  cashInBank: { label: "Cash in Bank", color: "hsl(var(--success))" },
};

function formatValue(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

export function TrendCharts() {
  const { data: weeklyData, isLoading } = useWeeklyTrends();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const data = weeklyData || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Weekly Collections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Collections Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 10 }} width={45} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => `UGX ${formatValue(value as number)}`} />}
              />
              <Line
                type="monotone"
                dataKey="collections"
                stroke="hsl(var(--info))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--info))", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Outstanding Loans */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Outstanding Loans Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 10 }} width={45} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => `UGX ${formatValue(value as number)}`} />}
              />
              <Line
                type="monotone"
                dataKey="loans"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--warning))", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cash in Bank */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cash in Bank Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 10 }} width={45} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => `UGX ${formatValue(value as number)}`} />}
              />
              <Line
                type="monotone"
                dataKey="cashInBank"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
