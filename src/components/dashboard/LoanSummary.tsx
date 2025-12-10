import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Active", value: 45, color: "hsl(173, 58%, 39%)" },
  { name: "Closed", value: 32, color: "hsl(152, 69%, 31%)" },
  { name: "Arrears", value: 8, color: "hsl(38, 92%, 50%)" },
  { name: "Defaulted", value: 3, color: "hsl(0, 72%, 51%)" },
];

export function LoanSummary() {
  return (
    <div className="card-elevated p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-6">Loan Portfolio</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Active Loans</span>
          <span className="font-semibold text-foreground">UGX 125,000,000</span>
        </div>
      </div>
    </div>
  );
}
