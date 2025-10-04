import MediaLibrary from "@/components/marketing/cms/MediaLibrary";

export default function Media() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground mt-1">
          Upload, organize, and manage all your marketing assets in one place
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
