import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const weeklyData = [
  { week: "W1", collections: 3200000, loans: 118000000, cashInBank: 42500000 },
  { week: "W2", collections: 2800000, loans: 120000000, cashInBank: 43200000 },
  { week: "W3", collections: 3500000, loans: 122000000, cashInBank: 44100000 },
  { week: "W4", collections: 4100000, loans: 125000000, cashInBank: 45200000 },
  { week: "W5", collections: 3800000, loans: 123000000, cashInBank: 46800000 },
  { week: "W6", collections: 3600000, loans: 125000000, cashInBank: 45200000 },
];

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
            <LineChart data={weeklyData}>
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
            <LineChart data={weeklyData}>
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
            <LineChart data={weeklyData}>
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
