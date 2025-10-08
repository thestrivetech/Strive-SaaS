import { EditorSkeleton } from '@/components/real-estate/content/shared/content-skeleton';

/**
 * Editor Page Loading State
 *
 * Displayed while editor is being initialized
 */
export default function EditorLoading() {
  return (
    <div className="container mx-auto p-6">
      <EditorSkeleton />
    </div>
  );
}
