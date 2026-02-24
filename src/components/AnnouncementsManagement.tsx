import { useState } from "react";
import { Search, Filter, Plus, Edit, Trash2, Send, Eye, Bell } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const announcements = [
  {
    id: 1,
    title: "Platform Maintenance Notice",
    message: "Our platform will undergo scheduled maintenance on March 15th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.",
    priority: "High",
    targetAudience: "All Users",
    createdDate: "2025-03-01",
    scheduledDate: "2025-03-15",
    status: "Scheduled",
    pushNotification: true,
    views: 0
  },
  {
    id: 2,
    title: "New Perks Available This Week",
    message: "Check out the latest perks from our partner businesses! Limited time offers on dining, fitness, and entertainment.",
    priority: "Medium",
    targetAudience: "All Users",
    createdDate: "2025-02-25",
    scheduledDate: "2025-02-28",
    status: "Sent",
    pushNotification: true,
    views: 1847
  },
  {
    id: 3,
    title: "Welcome to CRCL!",
    message: "Thank you for joining CRCL. Discover exclusive perks and benefits from the best businesses in Saudi Arabia.",
    priority: "Low",
    targetAudience: "New Users",
    createdDate: "2025-02-20",
    scheduledDate: "2025-02-20",
    status: "Sent",
    pushNotification: false,
    views: 2156
  },
  {
    id: 4,
    title: "Spring Sale Alert",
    message: "Spring season special offers now live! Get up to 50% off on selected perks from our retail partners.",
    priority: "High",
    targetAudience: "All Users",
    createdDate: "2025-03-05",
    scheduledDate: null,
    status: "Draft",
    pushNotification: true,
    views: 0
  },
  {
    id: 5,
    title: "Community Guidelines Update",
    message: "We've updated our community guidelines. Please review the changes to ensure continued access to all features.",
    priority: "Medium",
    targetAudience: "All Users",
    createdDate: "2025-02-15",
    scheduledDate: "2025-02-18",
    status: "Sent",
    pushNotification: false,
    views: 1523
  },
];

export function AnnouncementsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    priority: "Medium",
    targetAudience: "All Users",
    scheduledDate: "",
    pushNotification: true
  });

  const handleAddAnnouncement = () => {
    // Mock implementation - in real app, would submit to backend
    console.log("Adding announcement:", newAnnouncement);
    setIsAddAnnouncementOpen(false);
    setNewAnnouncement({
      title: "",
      message: "",
      priority: "Medium",
      targetAudience: "All Users",
      scheduledDate: "",
      pushNotification: true
    });
  };

  return (
    <div className="space-y-8 ">
      <div className="flex items-center justify-between">
        <div>
          <h1>Announcements Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage platform announcements</p>
        </div>
        <Dialog open={isAddAnnouncementOpen} onOpenChange={setIsAddAnnouncementOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Send announcements to your users
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Platform Update"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your announcement message..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  className="bg-muted border-border min-h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newAnnouncement.priority} onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, priority: value })}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={newAnnouncement.targetAudience} onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, targetAudience: value })}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="All Users">All Users</SelectItem>
                      <SelectItem value="New Users">New Users</SelectItem>
                      <SelectItem value="Active Users">Active Users</SelectItem>
                      <SelectItem value="Businesses">Businesses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Schedule Date (Optional)</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newAnnouncement.scheduledDate}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduledDate: e.target.value })}
                  className="bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send immediately
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="pushNotification" className="cursor-pointer">Send Push Notification</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Notify users via push notification
                  </p>
                </div>
                <Switch
                  id="pushNotification"
                  checked={newAnnouncement.pushNotification}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, pushNotification: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddAnnouncementOpen(false)} className="border-border">
                Save as Draft
              </Button>
              <Button onClick={handleAddAnnouncement} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="w-4 h-4 mr-2" />
                {newAnnouncement.scheduledDate ? "Schedule" : "Send Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <h2 className="mt-2">{announcements.filter(a => a.status === "Sent").length}</h2>
            </div>
            <Bell className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <h2 className="mt-2 text-primary">
                {announcements.filter(a => a.status === "Scheduled").length}
              </h2>
            </div>
            <Send className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <h2 className="mt-2">{announcements.filter(a => a.status === "Draft").length}</h2>
            </div>
            <Edit className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <h2 className="mt-2">
                {announcements.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
              </h2>
            </div>
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
          <Button variant="outline" className="border-border">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <div className="w-full">
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody >
                {announcements
                  .filter(announcement =>
                    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((announcement) => (
                    <TableRow key={announcement.id} className="border-border">
                      <TableCell >
                        <div >
                          <p>{announcement.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {announcement.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={announcement.priority === "High" ? "default" : "secondary"}
                          className={announcement.priority === "High" ? "bg-primary text-primary-foreground" : ""}
                        >
                          {announcement.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{announcement.targetAudience}</TableCell>
                      <TableCell className="text-muted-foreground">{announcement.createdDate}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {announcement.scheduledDate || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {announcement.views > 0 && <Eye className="w-4 h-4 text-muted-foreground" />}
                          <span>{announcement.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={announcement.status === "Sent" ? "default" : "secondary"}
                          className={announcement.status === "Sent" ? "bg-primary text-primary-foreground" : ""}
                        >
                          {announcement.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="border-border">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {announcements.length} of {announcements.length} announcements
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
