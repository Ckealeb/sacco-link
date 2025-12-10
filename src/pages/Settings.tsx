import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Users, Percent, Bell, Shield, Database } from "lucide-react";

export default function Settings() {
  const [saccoName, setSaccoName] = useState("Community SACCO");
  const [currency, setCurrency] = useState("UGX");

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Configure your SACCO system preferences"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="w-4 h-4 hidden sm:block" />
            General
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Database className="w-4 h-4 hidden sm:block" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="loans" className="gap-2">
            <Percent className="w-4 h-4 hidden sm:block" />
            Loans
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4 hidden sm:block" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4 hidden sm:block" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4 hidden sm:block" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="card-elevated p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="saccoName">SACCO Name</Label>
                  <Input
                    id="saccoName"
                    value={saccoName}
                    onChange={(e) => setSaccoName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGX">UGX - Uganda Shilling</SelectItem>
                      <SelectItem value="KES">KES - Kenya Shilling</SelectItem>
                      <SelectItem value="TZS">TZS - Tanzania Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNo">Registration Number</Label>
                  <Input id="regNo" placeholder="Enter registration number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input id="address" placeholder="Enter address" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Financial Year</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fyStart">Financial Year Start</Label>
                  <Select defaultValue="january">
                    <SelectTrigger id="fyStart">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button>Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Types</h3>
            <div className="space-y-4">
              {["Shares", "Savings", "Fixed Deposit", "MM Cycle", "Development Fund"].map((type) => (
                <div key={type} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{type}</p>
                    <p className="text-sm text-muted-foreground">Standard member account type</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
            <Button variant="outline">Add Account Type</Button>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Loan Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Default Interest Rate (%)</Label>
                <Input type="number" defaultValue="12" />
              </div>
              <div className="space-y-2">
                <Label>Maximum Loan Multiplier</Label>
                <Input type="number" defaultValue="3" />
                <p className="text-xs text-muted-foreground">Times member's share balance</p>
              </div>
              <div className="space-y-2">
                <Label>Interest Calculation Method</Label>
                <Select defaultValue="reducing">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="reducing">Reducing Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grace Period (Days)</Label>
                <Input type="number" defaultValue="7" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button>Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">User Management</h3>
            <p className="text-muted-foreground mb-6">Manage user accounts and role assignments.</p>
            <div className="space-y-4">
              {[
                { name: "John Doe", email: "john@sacco.com", role: "Admin" },
                { name: "Jane Smith", email: "jane@sacco.com", role: "Treasurer" },
                { name: "Bob Wilson", email: "bob@sacco.com", role: "Clerk" },
              ].map((user) => (
                <div key={user.email} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{user.role}</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4">Add User</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h3>
            <div className="space-y-4">
              {[
                { label: "Loan payment reminders", desc: "Notify members before payment due dates" },
                { label: "MM cycle alerts", desc: "Notify about upcoming contributions and payouts" },
                { label: "Low balance warnings", desc: "Alert when cash balance falls below threshold" },
                { label: "New member notifications", desc: "Notify admins of new member registrations" },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Period Locking</p>
                  <p className="text-sm text-muted-foreground">Prevent edits to closed periods</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
