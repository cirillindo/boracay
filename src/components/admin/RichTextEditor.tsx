import React from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[200px] p-4 font-mono text-sm"
        placeholder="Paste your HTML content here..."
      />
    </div>
  );
};

export default RichTextEditor;