import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Image as ImageIcon, Video, FileText, MoreVertical } from "lucide-react";
import { useState } from "react";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: string;
  uploadedAt: string;
  tags: string[];
}

export default function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const mediaItems: MediaItem[] = [
    {
      id: "1",
      name: "luxury-condo.jpg",
      type: "image",
      url: "#",
      size: "2.4 MB",
      uploadedAt: "2025-01-10",
      tags: ["listing", "condo"],
    },
    {
      id: "2",
      name: "open-house-promo.mp4",
      type: "video",
      url: "#",
      size: "15.2 MB",
      uploadedAt: "2025-01-08",
      tags: ["promotional", "video"],
    },
    {
      id: "3",
      name: "agent-headshot.jpg",
      type: "image",
      url: "#",
      size: "1.8 MB",
      uploadedAt: "2025-01-05",
      tags: ["agent", "profile"],
    },
    {
      id: "4",
      name: "property-brochure.pdf",
      type: "document",
      url: "#",
      size: "850 KB",
      uploadedAt: "2025-01-03",
      tags: ["document", "brochure"],
    },
  ];

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getIcon = (type: MediaItem["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card data-testid="card-media-library">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Upload and manage your marketing assets</CardDescription>
          </div>
          <Button data-testid="button-upload-media">
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-media"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer hover-elevate ${selectedItems.has(item.id) ? "ring-2 ring-primary" : ""}`}
              onClick={() => toggleSelect(item.id)}
              data-testid={`card-media-${item.id}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {getIcon(item.type)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("More options", item.id);
                    }}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.size}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
