import { FileText, Download, Calendar, Users, Wallet, PiggyBank, BarChart3, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  category: "member" | "financial" | "loan" | "operational";
}

const reports: ReportCard[] = [
  {
    id: "member-statement",
    title: "Member Statement",
    description: "Individual member passbook with all transactions",
    icon: Users,
    iconColor: "bg-accent/10 text-accent",
    category: "member",
  },
  {
    id: "trial-balance",
    title: "Trial Balance",
    description: "GL level balances for selected period",
    icon: BarChart3,
    iconColor: "bg-success/10 text-success",
    category: "financial",
  },
  {
    id: "income-statement",
    title: "Income Statement",
    description: "Profit & Loss report for the period",
    icon: FileText,
    iconColor: "bg-info/10 text-info",
    category: "financial",
  },
  {
    id: "balance-sheet",
    title: "Balance Sheet",
    description: "Assets, liabilities, and equity position",
    icon: BookOpen,
    iconColor: "bg-primary/10 text-primary",
    category: "financial",
  },
  {
    id: "loan-portfolio",
    title: "Loan Portfolio",
    description: "Active loans, arrears, and aging analysis",
    icon: Wallet,
    iconColor: "bg-warning/10 text-warning",
    category: "loan",
  },
  {
    id: "savings-summary",
    title: "Savings & Shares Summary",
    description: "Total deposits by account type",
    icon: PiggyBank,
    iconColor: "bg-success/10 text-success",
    category: "member",
  },
  {
    id: "mm-report",
    title: "MM Cycle Report",
    description: "Merry-go-round contributions and payouts",
    icon: Users,
    iconColor: "bg-info/10 text-info",
    category: "operational",
  },
  {
    id: "cashbook",
    title: "Cashbook",
    description: "Daily cash receipts and payments",
    icon: BookOpen,
    iconColor: "bg-accent/10 text-accent",
    category: "financial",
  },
];

const categoryLabels = {
  member: "Member Reports",
  financial: "Financial Reports",
  loan: "Loan Reports",
  operational: "Operational Reports",
};

export default function Reports() {
  const groupedReports = reports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportCard[]>);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Generate and export SACCO reports"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">January 2024</span>
          </div>
        </div>
      </PageHeader>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-card rounded-lg border border-border">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground mb-2 block">Report Period</label>
          <Select defaultValue="monthly">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground mb-2 block">Output Format</label>
          <Select defaultValue="pdf">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Categories */}
      {Object.entries(groupedReports).map(([category, categoryReports]) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryReports.map((report) => (
              <div
                key={report.id}
                className="card-elevated p-5 hover:shadow-elevated transition-all duration-200 cursor-pointer group"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", report.iconColor)}>
                  <report.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <FileText className="w-4 h-4" />
                    Generate
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
