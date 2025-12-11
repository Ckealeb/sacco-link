import { useState } from "react";
import { FileText, Download, Calendar, Users, Wallet, PiggyBank, BarChart3, BookOpen, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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

const reportDescriptions: Record<string, string> = {
  "member-statement": "Shows all transactions for a specific member including shares, savings, loans, and MM contributions. Displays opening balance, transactions, and closing balance.",
  "trial-balance": "Lists all general ledger accounts with their debit and credit balances. Used to verify that debits equal credits in the accounting system.",
  "income-statement": "Shows SACCO income (interest income, fines, fees) vs expenses (operational costs) to determine profit or loss for the period.",
  "balance-sheet": "Displays SACCO's financial position: assets (cash, loan receivables), liabilities (member deposits), and equity (share capital, retained earnings).",
  "loan-portfolio": "Comprehensive loan report showing all active loans, outstanding balances, repayment status, and aging analysis (30/60/90 days overdue).",
  "savings-summary": "Aggregated view of all member deposits by account type (shares, savings, fixed deposits) with totals and breakdowns.",
  "mm-report": "Merry-go-round cycle details including participants, contribution schedules, payouts made, and outstanding contributions.",
  "cashbook": "Daily record of all cash receipts and payments, showing bank reconciliation between system and actual bank balance.",
};

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [format, setFormat] = useState("pdf");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const groupedReports = reports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportCard[]>);

  const handleGenerate = (report: ReportCard) => {
    setSelectedReport(report);
    setGenerateDialogOpen(true);
  };

  const handleDownload = (report: ReportCard) => {
    toast({
      title: "Download Started",
      description: `Downloading ${report.title} as ${format.toUpperCase()}...`,
    });
    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${report.title}.${format} has been downloaded.`,
      });
    }, 1500);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setGenerateDialogOpen(false);
      toast({
        title: "Report Generated",
        description: `${selectedReport?.title} has been generated successfully. You can now download it.`,
      });
    }, 2000);
  };

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
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily - Single day transactions</SelectItem>
              <SelectItem value="weekly">Weekly - 7-day summary</SelectItem>
              <SelectItem value="monthly">Monthly - Full month report</SelectItem>
              <SelectItem value="quarterly">Quarterly - 3-month period</SelectItem>
              <SelectItem value="yearly">Yearly - Annual report</SelectItem>
              <SelectItem value="custom">Custom Range - Select dates</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground mb-2 block">Output Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF - Printable document</SelectItem>
              <SelectItem value="excel">Excel (.xlsx) - Editable spreadsheet</SelectItem>
              <SelectItem value="csv">CSV - Raw data export</SelectItem>
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
                className="card-elevated p-5 hover:shadow-elevated transition-all duration-200 group"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", report.iconColor)}>
                  <report.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleGenerate(report)}
                  >
                    <FileText className="w-4 h-4" />
                    Generate
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDownload(report)}
                    title={`Download ${report.title} as ${format.toUpperCase()}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReport && (
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", selectedReport.iconColor)}>
                  <selectedReport.icon className="w-4 h-4" />
                </div>
              )}
              {selectedReport?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedReport && reportDescriptions[selectedReport.id]}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Period</Label>
              <Select value={period} onValueChange={setPeriod}>
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
            {period === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
            )}
            {selectedReport?.id === "member-statement" && (
              <div className="space-y-2">
                <Label>Select Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="M001">Sarah Namubiru (M001)</SelectItem>
                    <SelectItem value="M002">John Okello (M002)</SelectItem>
                    <SelectItem value="M003">Grace Auma (M003)</SelectItem>
                    <SelectItem value="M004">Peter Mugisha (M004)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}