
'use client';
import ReactQuill from 'react-quilljs';
import 'react-quilljs/dist/quill.snow.css';

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
  return (
    <ReactQuill 
      theme="snow" 
      value={value} 
      onChange={onChange}
      modules={modules}
      formats={formats}
      className="bg-background"
    />
  );
}
