import type { ChangeEvent } from "react";

type DocumentDropzoneProps = {
  hint?: string;
  interactive?: boolean;
  onFilesSelected?: (files: File[]) => void;
  browseLabel?: string;
  className?: string;
};

export function DocumentDropzone({
  hint,
  interactive = false,
  onFilesSelected,
  browseLabel = "Browse computer",
  className,
}: DocumentDropzoneProps) {
  const baseClasses = "flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-[#B8C5CC] bg-[#F3F8FC] p-8 text-center";
  const containerClass = interactive
    ? `${baseClasses} cursor-pointer transition hover:border-[#4C7CF0]`
    : baseClasses;
  const combinedClassName = className ? `${containerClass} ${className}` : containerClass;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!onFilesSelected) return;
    const files = event.target.files ? Array.from(event.target.files) : [];
    onFilesSelected(files);
    event.target.value = "";
  };

  return interactive ? (
    <label className={combinedClassName}>
      <DropzoneContent hint={hint} browseLabel={browseLabel} />
      <input type="file" className="hidden" multiple onChange={handleChange} />
    </label>
  ) : (
    <div className={combinedClassName}>
      <DropzoneContent hint={hint} browseLabel={browseLabel} />
    </div>
  );
}

type DropzoneContentProps = {
  hint?: string;
  browseLabel: string;
};

function DropzoneContent({ hint, browseLabel }: DropzoneContentProps) {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#1890FF]">
        <path d="M16 4.66602L9.33337 11.3327H13.3334V19.9993H18.6667V11.3327H22.6667L16 4.66602Z" fill="currentColor" />
        <path d="M26.6667 23.3327H5.33337C4.2288 23.3327 3.33337 24.2281 3.33337 25.3327C3.33337 26.4372 4.2288 27.3327 5.33337 27.3327H26.6667C27.7713 27.3327 28.6667 26.4372 28.6667 25.3327C28.6667 24.2281 27.7713 23.3327 26.6667 23.3327Z" fill="currentColor" />
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#5D5D5C]">
        <span>Drag and drop files to upload or</span>
        <span className="rounded-[8px] bg-[#E3F1FF] px-3 py-1 font-medium text-[#0D2352]">{browseLabel}</span>
      </div>
      {hint ? <span className="text-xs text-[#6B6B6A]">{hint}</span> : null}
    </>
  );
}
