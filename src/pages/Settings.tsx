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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Users, Percent, Bell, Shield, Database, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  name: string;
  email: string;
  role: string;
}

interface AccountType {
  name: string;
  description: string;
  enabled: boolean;
}

export default function Settings() {
  const [saccoName, setSaccoName] = useState("Community SACCO");
  const [currency, setCurrency] = useState("UGX");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [addAccountTypeOpen, setAddAccountTypeOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    { name: "John Doe", email: "john@sacco.com", role: "Admin" },
    { name: "Jane Smith", email: "jane@sacco.com", role: "Treasurer" },
    { name: "Bob Wilson", email: "bob@sacco.com", role: "Clerk" },
  ]);

  const [accountTypes, setAccountTypes] = useState<AccountType[]>([
    { name: "Shares", description: "Member share capital account", enabled: true },
    { name: "Savings", description: "Regular savings account", enabled: true },
    { name: "Fixed Deposit", description: "Term deposit account", enabled: true },
    { name: "MM Cycle", description: "Merry-go-round account", enabled: true },
    { name: "Development Fund", description: "Development contributions", enabled: true },
  ]);

  const handleSaveGeneral = () => {
    toast({
      title: "Settings Saved",
      description: "Organization details have been updated successfully.",
    });
  };

  const handleSaveLoans = () => {
    toast({
      title: "Loan Settings Saved",
      description: "Loan product configuration has been updated.",
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newUser = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };
    setUsers([...users, newUser]);
    toast({
      title: "User Added",
      description: `${newUser.name} has been added as ${newUser.role}.`,
    });
    setAddUserOpen(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const updatedUser = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };
    setUsers(users.map(u => u.email === selectedUser?.email ? updatedUser : u));
    toast({
      title: "User Updated",
      description: `${updatedUser.name}'s details have been updated.`,
    });
    setEditUserOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (email: string) => {
    setUsers(users.filter(u => u.email !== email));
    toast({
      title: "User Removed",
      description: "User has been removed from the system.",
    });
  };

  const handleAddAccountType = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newType = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      enabled: true,
    };
    setAccountTypes([...accountTypes, newType]);
    toast({
      title: "Account Type Added",
      description: `${newType.name} account type has been created.`,
    });
    setAddAccountTypeOpen(false);
  };

  const toggleAccountType = (name: string) => {
    setAccountTypes(accountTypes.map(t => 
      t.name === name ? { ...t, enabled: !t.enabled } : t
    ));
    const type = accountTypes.find(t => t.name === name);
    toast({
      title: type?.enabled ? "Account Type Disabled" : "Account Type Enabled",
      description: `${name} account type has been ${type?.enabled ? "disabled" : "enabled"}.`,
    });
  };

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
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Types</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage the types of accounts available to members. Disabled account types won't be available for new accounts.</p>
            <div className="space-y-4">
              {accountTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{type.name}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <Switch 
                    checked={type.enabled} 
                    onCheckedChange={() => toggleAccountType(type.name)}
                  />
                </div>
              ))}
            </div>
            <Dialog open={addAccountTypeOpen} onOpenChange={setAddAccountTypeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Account Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Account Type</DialogTitle>
                  <DialogDescription>Create a new account type for members.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAccountType}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountTypeName">Account Type Name</Label>
                      <Input id="accountTypeName" name="name" placeholder="e.g., Emergency Fund" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountTypeDesc">Description</Label>
                      <Input id="accountTypeDesc" name="description" placeholder="Brief description of this account type" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddAccountTypeOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Account Type</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Loan Products</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure default loan parameters. These settings apply to all new loan applications.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Default Interest Rate (%)</Label>
                <Input type="number" defaultValue="12" />
                <p className="text-xs text-muted-foreground">Annual interest rate for standard loans</p>
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
                    <SelectItem value="flat">Flat Rate - Interest on original principal</SelectItem>
                    <SelectItem value="reducing">Reducing Balance - Interest on outstanding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grace Period (Days)</Label>
                <Input type="number" defaultValue="7" />
                <p className="text-xs text-muted-foreground">Days after due date before arrears status</p>
              </div>
              <div className="space-y-2">
                <Label>Maximum Tenor (Months)</Label>
                <Input type="number" defaultValue="24" />
                <p className="text-xs text-muted-foreground">Maximum loan repayment period</p>
              </div>
              <div className="space-y-2">
                <Label>Minimum Share Requirement (%)</Label>
                <Input type="number" defaultValue="20" />
                <p className="text-xs text-muted-foreground">Minimum shares as % of loan amount</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveLoans}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">User Management</h3>
            <p className="text-muted-foreground mb-6">Manage user accounts and role assignments. Each role has specific permissions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-secondary/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Admin</p>
                <p className="text-xs text-muted-foreground">Full system access</p>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Treasurer</p>
                <p className="text-xs text-muted-foreground">Financial operations</p>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Clerk</p>
                <p className="text-xs text-muted-foreground">Data entry & members</p>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Auditor</p>
                <p className="text-xs text-muted-foreground">View-only access</p>
              </div>
            </div>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.email} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{user.role}</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedUser(user);
                      setEditUserOpen(true);
                    }}>Edit</Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.email)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account with role-based access.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Full Name</Label>
                      <Input id="userName" name="name" placeholder="Enter full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input id="userEmail" name="email" type="email" placeholder="Enter email address" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Select name="role" defaultValue="Clerk">
                        <SelectTrigger id="userRole">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin - Full system access</SelectItem>
                          <SelectItem value="Treasurer">Treasurer - Financial operations</SelectItem>
                          <SelectItem value="Clerk">Clerk - Data entry & members</SelectItem>
                          <SelectItem value="Auditor">Auditor - View-only access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                    <Button type="submit">Add User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>Update user details and role assignment.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditUser}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="editUserName">Full Name</Label>
                      <Input id="editUserName" name="name" defaultValue={selectedUser?.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editUserEmail">Email</Label>
                      <Input id="editUserEmail" name="email" type="email" defaultValue={selectedUser?.email} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editUserRole">Role</Label>
                      <Select name="role" defaultValue={selectedUser?.role}>
                        <SelectTrigger id="editUserRole">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin - Full system access</SelectItem>
                          <SelectItem value="Treasurer">Treasurer - Financial operations</SelectItem>
                          <SelectItem value="Clerk">Clerk - Data entry & members</SelectItem>
                          <SelectItem value="Auditor">Auditor - View-only access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure automated alerts and notifications for system events.</p>
            <div className="space-y-4">
              {[
                { label: "Loan payment reminders", desc: "Notify members 3 days before payment due dates via SMS/email" },
                { label: "MM cycle alerts", desc: "Notify about upcoming contributions and payout schedules" },
                { label: "Low balance warnings", desc: "Alert admins when cash balance falls below UGX 5,000,000" },
                { label: "New member notifications", desc: "Notify admins when new member registrations are submitted" },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Switch defaultChecked onChange={() => {
                    toast({ title: "Setting Updated", description: `${setting.label} setting has been changed.` });
                  }} />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => toast({ title: "Notifications Saved", description: "Notification preferences have been updated." })}>
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="card-elevated p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure security policies to protect your SACCO data.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin and treasurer accounts</p>
                </div>
                <Switch onChange={() => toast({ title: "2FA Setting Updated", description: "Two-factor authentication policy has been changed." })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Automatically logout after period of inactivity</p>
                </div>
                <Select defaultValue="30" onValueChange={(val) => toast({ title: "Timeout Updated", description: `Session timeout set to ${val} minutes.` })}>
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
                  <p className="text-sm text-muted-foreground">Prevent edits to transactions in closed accounting periods</p>
                </div>
                <Switch defaultChecked onChange={() => toast({ title: "Period Lock Updated", description: "Period locking policy has been changed." })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Password Policy</p>
                  <p className="text-sm text-muted-foreground">Require strong passwords (min 8 chars, uppercase, number)</p>
                </div>
                <Switch defaultChecked onChange={() => toast({ title: "Password Policy Updated", description: "Password requirements have been changed." })} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => toast({ title: "Security Settings Saved", description: "Security configuration has been updated." })}>
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}