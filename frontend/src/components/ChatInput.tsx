import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string, files: File[]) => void;
  isFetchingHistory: boolean;
  chatTitle: string;
}

export default function ChatInput({
  onSendMessage,
  isFetchingHistory,
  chatTitle,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews for images, cleanup memory to avoid leaks
  useEffect(() => {
    const objectUrls = files.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    );
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && files.length === 0) || isFetchingHistory) return;

    onSendMessage(text.trim(), files);
    setText("");
    setFiles([]); // Clear after sending
  };

  return (
    <div className="shrink-0 flex flex-col bg-[#030712] border-t border-white/5">
      {/* File Preview Strip */}
      {files.length > 0 && (
        <div className="flex gap-3 p-4 pb-0 overflow-x-auto custom-scrollbar">
          {files.map((file, i) => (
            <div
              key={i}
              className="relative shrink-0 w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden group"
            >
              {previews[i] ? (
                <img
                  src={previews[i]}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText size={24} className="text-gray-400" />
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-gray-900/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 flex gap-3 items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isFetchingHistory}
          className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isFetchingHistory}
          placeholder={
            isFetchingHistory ? "Loading..." : `Message ${chatTitle}...`
          }
          className="flex-1 rounded-xl bg-gray-900 border border-gray-800 px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={(!text.trim() && files.length === 0) || isFetchingHistory}
          className="group rounded-xl bg-blue-600 px-5 py-3.5 flex items-center justify-center shadow-lg shadow-blue-500/10 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </form>
    </div>
  );
}
