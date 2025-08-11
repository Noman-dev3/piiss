
'use client';
import { useQuill } from 'react-quilljs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect } from 'react';

// Explicitly import and register the list format.
const List = Quill.import('formats/list');
Quill.register(List, true);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const { quill, quillRef } = useQuill({
    modules,
    formats,
    theme: 'snow'
  });

  // Load initial content
  useEffect(() => {
    if (quill && value && quill.root.innerHTML !== value) {
        quill.clipboard.dangerouslyPasteHTML(value);
    }
  }, [quill, value]);
  
  // Listen for changes
  useEffect(() => {
    if (quill) {
      const handleChange = () => {
        const html = quill.root.innerHTML;
        // Avoid calling onChange if the content is just the default empty state
        if (html !== '<p><br></p>') {
          onChange(html);
        } else {
          onChange('');
        }
      };
      
      quill.on('text-change', handleChange);
      
      return () => {
        quill.off('text-change', handleChange);
      };
    }
  }, [quill, onChange]);

  return (
    <div className="bg-background">
      <div ref={quillRef} style={{ minHeight: '200px' }} />
    </div>
  );
}
