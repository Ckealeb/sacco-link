import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useLoanSummary } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function LoanSummary() {
  const { data: loanData, isLoading } = useLoanSummary();
  const navigate = useNavigate();

  const chartData = [
    { name: "Active", value: loanData?.activeLoans || 0, color: "hsl(173, 58%, 39%)" },
    { name: "Overdue", value: loanData?.overdueLoans || 0, color: "hsl(38, 92%, 50%)" },
  ].filter(d => d.value > 0);

  // If no data, show placeholder
  const hasData = chartData.length > 0 && chartData.some(d => d.value > 0);

  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Loan Portfolio</h3>
        <button 
          onClick={() => navigate("/loans")}
          className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
        >
          View all
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[240px] w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : hasData ? (
        <>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
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
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Outstanding</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(loanData?.totalOutstanding || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Disbursed This Month</span>
              <span className="font-semibold text-warning">
                {formatCurrency(loanData?.disbursedThisMonth || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Repayments This Month</span>
              <span className="font-semibold text-success">
                {formatCurrency(loanData?.repaymentsThisMonth || 0)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No loan data yet</p>
          <p className="text-sm mt-1">Loan transactions will appear here</p>
        </div>
      )}
    </div>
  );
}
