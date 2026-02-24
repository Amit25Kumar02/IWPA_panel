import { useState } from "react";
import { Search, Plus, Copy, Check, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const inviteCodes = [
  {
    id: 1,
    code: "SAUDI2025",
    createdDate: "2025-01-10",
    expiryDate: "2025-12-31",
    usageCount: 47,
    maxUses: 100,
    status: "Active",
    createdBy: "Admin User"
  },
  {
    id: 2,
    code: "RIYADH100",
    createdDate: "2025-01-15",
    expiryDate: "2025-06-30",
    usageCount: 89,
    maxUses: 100,
    status: "Active",
    createdBy: "Admin User"
  },
  {
    id: 3,
    code: "WELCOME2025",
    createdDate: "2025-01-20",
    expiryDate: "2025-12-31",
    usageCount: 156,
    maxUses: 500,
    status: "Active",
    createdBy: "Admin User"
  },
  {
    id: 4,
    code: "JEDDAH50",
    createdDate: "2025-02-01",
    expiryDate: "2025-05-31",
    usageCount: 23,
    maxUses: 50,
    status: "Active",
    createdBy: "Admin User"
  },
  {
    id: 5,
    code: "BETA2024",
    createdDate: "2024-12-01",
    expiryDate: "2024-12-31",
    usageCount: 100,
    maxUses: 100,
    status: "Expired",
    createdBy: "Admin User"
  },
  {
    id: 6,
    code: "VIP2025",
    createdDate: "2025-02-15",
    expiryDate: "2025-12-31",
    usageCount: 12,
    maxUses: 25,
    status: "Active",
    createdBy: "Admin User"
  },
];

export function InviteCodes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState({
    code: "",
    maxUses: "100",
    expiryDate: ""
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code: result });
  };

  const handleGenerateCode = () => {
    // Mock implementation - in real app, would submit to backend
    console.log("Generating code:", newCode);
    setIsGenerateOpen(false);
    setNewCode({
      code: "",
      maxUses: "100",
      expiryDate: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div >
          <h1>Invite Codes Management</h1>
          <p className="text-muted-foreground mt-1">Generate and track invite code usage</p>
        </div>
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90  text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Generate Invite Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Generate New Invite Code</DialogTitle>
              <DialogDescription>
                Create a new invite code for user registration
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Invite Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="e.g., SAUDI2025"
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                    className="bg-muted border-border"
                  />
                  <Button
                    variant="outline"
                    onClick={generateRandomCode}
                    className="border-border"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use alphanumeric characters only (A-Z, 0-9)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  placeholder="100"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCode.expiryDate}
                  onChange={(e) => setNewCode({ ...newCode, expiryDate: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button onClick={handleGenerateCode} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Generate Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground">Total Codes</p>
          <h2 className="mt-2">{inviteCodes.length}</h2>
        </Card>
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground">Active Codes</p>
          <h2 className="mt-2 text-primary">
            {inviteCodes.filter(code => code.status === "Active").length}
          </h2>
        </Card>
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground">Total Uses</p>
          <h2 className="mt-2">
            {inviteCodes.reduce((sum, code) => sum + code.usageCount, 0)}
          </h2>
        </Card>
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground">Available Uses</p>
          <h2 className="mt-2">
            {inviteCodes
              .filter(code => code.status === "Active")
              .reduce((sum, code) => sum + (code.maxUses - code.usageCount), 0)}
          </h2>
        </Card>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invite codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full">
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Code</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Max Uses</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteCodes
                  .filter(code =>
                    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    code.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((code) => {
                    const usagePercentage = (code.usageCount / code.maxUses) * 100;

                    return (
                      <TableRow key={code.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-primary">
                              {code.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(code.code)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{code.createdDate}</TableCell>
                        <TableCell className="text-muted-foreground">{code.expiryDate}</TableCell>
                        <TableCell>
                          <div>
                            <p>{code.usageCount}</p>
                            <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${usagePercentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{code.maxUses}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{code.createdBy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={code.status === "Active" ? "default" : "secondary"}
                            className={code.status === "Active" ? "bg-primary text-primary-foreground" : ""}
                          >
                            {code.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {inviteCodes.length} of {inviteCodes.length} invite codes
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="border-border">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled className="border-border">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
