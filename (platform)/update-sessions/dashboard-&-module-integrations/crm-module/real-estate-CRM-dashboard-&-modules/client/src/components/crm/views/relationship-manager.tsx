import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Client, FollowUp, Note } from "@/lib/types/real-estate/crm";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Clock,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface RelationshipManagerProps {
  clients: Client[];
  onAddFollowUp?: (clientId: string, followUp: Omit<FollowUp, "id">) => void;
  onAddNote?: (clientId: string, note: Omit<Note, "id" | "createdAt">) => void;
  onToggleFollowUp?: (clientId: string, followUpId: string) => void;
}

export function RelationshipManager({
  clients,
  onAddFollowUp,
  onAddNote,
  onToggleFollowUp,
}: RelationshipManagerProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [newFollowUp, setNewFollowUp] = useState({
    type: "email" as FollowUp["type"],
    title: "",
    description: "",
    scheduledDate: "",
    recurring: undefined as FollowUp["recurring"],
  });

  const upcomingFollowUps = clients
    .flatMap((client) =>
      client.followUps
        .filter((f) => !f.completed)
        .map((f) => ({ ...f, client }))
    )
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
    .slice(0, 5);

  const handleAddNote = () => {
    if (!selectedClient || !noteContent.trim()) return;
    
    onAddNote?.(selectedClient.id, {
      content: noteContent,
      createdBy: "Current User",
    });
    
    setNoteContent("");
  };

  const handleAddFollowUp = () => {
    if (!selectedClient || !newFollowUp.title || !newFollowUp.scheduledDate) return;

    onAddFollowUp?.(selectedClient.id, {
      type: newFollowUp.type,
      title: newFollowUp.title,
      description: newFollowUp.description,
      scheduledDate: new Date(newFollowUp.scheduledDate),
      recurring: newFollowUp.recurring,
      completed: false,
    });

    setNewFollowUp({
      type: "email",
      title: "",
      description: "",
      scheduledDate: "",
      recurring: undefined,
    });
  };

  const followUpIcons = {
    email: Mail,
    call: Phone,
    card: MessageSquare,
    meeting: Calendar,
  };

  return (
    <div className="space-y-6" data-testid="section-relationship-manager">
      <div>
        <h2 className="text-2xl font-bold mb-2">Relationship Manager</h2>
        <p className="text-muted-foreground">
          Manage ongoing relationships with closed clients
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Clients ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {clients.map((client) => {
                const initials = client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover-elevate ${
                      selectedClient?.id === client.id ? "bg-muted" : ""
                    }`}
                    data-testid={`button-client-${client.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.value}
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Follow-up Schedule & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Follow-ups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Upcoming Follow-ups</CardTitle>
              {selectedClient && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-followup">
                      <Plus className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-add-followup">
                    <DialogHeader>
                      <DialogTitle>Schedule Follow-up</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newFollowUp.type}
                          onValueChange={(value: FollowUp["type"]) =>
                            setNewFollowUp({ ...newFollowUp, type: value })
                          }
                        >
                          <SelectTrigger data-testid="select-followup-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={newFollowUp.title}
                          onChange={(e) =>
                            setNewFollowUp({ ...newFollowUp, title: e.target.value })
                          }
                          placeholder="e.g., Quarterly check-in"
                          data-testid="input-followup-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newFollowUp.scheduledDate}
                          onChange={(e) =>
                            setNewFollowUp({
                              ...newFollowUp,
                              scheduledDate: e.target.value,
                            })
                          }
                          data-testid="input-followup-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Recurring (Optional)</Label>
                        <Select
                          value={newFollowUp.recurring || "none"}
                          onValueChange={(value) =>
                            setNewFollowUp({
                              ...newFollowUp,
                              recurring:
                                value === "none"
                                  ? undefined
                                  : (value as FollowUp["recurring"]),
                            })
                          }
                        >
                          <SelectTrigger data-testid="select-followup-recurring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">One-time</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="biannual">Bi-annual</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          value={newFollowUp.description}
                          onChange={(e) =>
                            setNewFollowUp({
                              ...newFollowUp,
                              description: e.target.value,
                            })
                          }
                          placeholder="Add any notes..."
                          data-testid="textarea-followup-description"
                        />
                      </div>
                      <Button
                        onClick={handleAddFollowUp}
                        className="w-full"
                        data-testid="button-save-followup"
                      >
                        Schedule Follow-up
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingFollowUps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming follow-ups scheduled
                </div>
              ) : (
                upcomingFollowUps.map((followUp) => {
                  const Icon = followUpIcons[followUp.type];
                  return (
                    <div
                      key={followUp.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover-elevate"
                      data-testid={`followup-${followUp.id}`}
                    >
                      <div className="mt-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm">{followUp.title}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() =>
                              onToggleFollowUp?.(followUp.client.id, followUp.id)
                            }
                            data-testid={`button-complete-followup-${followUp.id}`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {followUp.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {followUp.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(followUp.scheduledDate, "MMM d, yyyy")}
                          </div>
                          <div>{followUp.client.name}</div>
                          {followUp.recurring && (
                            <Badge variant="secondary" className="text-xs">
                              {followUp.recurring}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Notes Feed */}
          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle>Notes - {selectedClient.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add a note about this client..."
                    data-testid="textarea-add-note"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim()}
                    data-testid="button-save-note"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {selectedClient.notes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No notes yet
                    </div>
                  ) : (
                    selectedClient.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-lg bg-muted"
                        data-testid={`note-${note.id}`}
                      >
                        <p className="text-sm mb-2">{note.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {note.createdBy} •{" "}
                            {formatDistanceToNow(note.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
