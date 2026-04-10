import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  file: File;
  preview?: string;
}

interface Props {
  files: UploadedFile[];
  onAdd: (files: UploadedFile[]) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx";

export function FileUpload({ files, onAdd, onRemove, maxFiles = 5, maxSizeMb = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const remaining = maxFiles - files.length;
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < Math.min(fileList.length, remaining); i++) {
      const file = fileList[i];
      if (file.size > maxSizeMb * 1024 * 1024) continue;
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      newFiles.push({ file, preview });
    }

    if (newFiles.length > 0) onAdd(newFiles);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    return "📎";
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full border-2 border-dashed rounded-lg p-5 text-center transition-colors",
          files.length >= maxFiles
            ? "border-border bg-bg-sunken opacity-50 cursor-not-allowed"
            : "border-border hover:border-accent hover:bg-accent-soft/30 cursor-pointer"
        )}
        disabled={files.length >= maxFiles}
      >
        <div className="text-2xl mb-1">📎</div>
        <p className="text-sm text-text-secondary font-medium">
          {files.length >= maxFiles ? "Max antal filer uppnått" : "Klicka för att ladda upp dokument"}
        </p>
        <p className="text-[11px] text-text-tertiary mt-1">
          PDF, bilder eller Word-dokument · Max {maxSizeMb} MB per fil · Max {maxFiles} filer
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-bg-sunken rounded-md px-3 py-2">
              {f.preview ? (
                <img src={f.preview} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              ) : (
                <span className="text-lg shrink-0">{getIcon(f.file.type)}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{f.file.name}</p>
                <p className="text-[11px] text-text-tertiary">{formatSize(f.file.size)}</p>
              </div>
              <button
                onClick={() => {
                  if (f.preview) URL.revokeObjectURL(f.preview);
                  onRemove(i);
                }}
                className="w-6 h-6 rounded-full hover:bg-bg-base flex items-center justify-center transition-colors shrink-0"
                aria-label={`Ta bort ${f.file.name}`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-secondary" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
