'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { EditorToolbar } from './editor-toolbar';
import { useEffect } from 'react';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  editable = true
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <div role="textbox" aria-label="Rich text editor" aria-multiline="true">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
        />
      </div>
    </div>
  );
}
