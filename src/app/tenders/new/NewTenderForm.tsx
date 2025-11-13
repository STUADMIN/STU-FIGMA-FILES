"use client";

import Link from "next/link";
import { DocumentDropzone } from "@/components/tenders/DocumentDropzone";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createTender } from "./actions";

const statusOptions = ["Draft", "In progress", "Submitted", "Successful", "Unsuccessful"];

type AssigneeOption = {
  id: string;
  name: string;
  isCurrentUser: boolean;
};

type TenderFormState = {
  tenderId: string;
  tenderName: string;
  privateClient: string;
  authorityClient: string;
  referenceNumber: string;
  tenderValue: string;
  tenderUrl: string;
  startDate: string;
  submissionDueDate: string;
  responseDate: string;
  status: string;
  assign: string;
  notes: string;
  background: string;
  description: string;
  attachments: File[];
};

type NewTenderFormProps = {
  authorities: string[];
  assignees: AssigneeOption[];
  currentUserId?: string;
};

const initialFormState: Omit<TenderFormState, "tenderId"> = {
  tenderName: "",
  privateClient: "",
  authorityClient: "",
  referenceNumber: "",
  tenderValue: "",
  tenderUrl: "",
  startDate: "",
  submissionDueDate: "",
  responseDate: "",
  status: statusOptions[0],
  assign: "",
  notes: "",
  background: "",
  description: "",
  attachments: [],
};

function generateTenderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  const random = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `TEN-${year}${month}${day}-${random}`;
}

export default function NewTenderForm({ authorities, assignees, currentUserId }: NewTenderFormProps) {
  const [form, setForm] = useState<TenderFormState>(() => ({ ...initialFormState, tenderId: generateTenderId() }));
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = <K extends keyof TenderFormState>(key: K, value: TenderFormState[K]) => {
    setServerError(null);
    setForm((previous) => {
      if (key === "privateClient") {
        return {
          ...previous,
          privateClient: value as string,
          authorityClient: value ? "" : previous.authorityClient,
        };
      }
      if (key === "authorityClient") {
        return {
          ...previous,
          authorityClient: value as string,
          privateClient: value ? "" : previous.privateClient,
        };
      }
      return { ...previous, [key]: value };
    });
  };

  const regenerateTenderId = () => {
    setForm((previous) => ({ ...previous, tenderId: generateTenderId() }));
  };

  useEffect(() => {
    setForm((previous) => {
      const hasCurrent = currentUserId && assignees.some((option) => option.id === currentUserId);
      const currentSelectionValid = !previous.assign || assignees.some((option) => option.id === previous.assign);

      if (previous.assign && !currentSelectionValid) {
        return { ...previous, assign: hasCurrent ? currentUserId ?? "" : "" };
      }

      if (!previous.assign && hasCurrent) {
        return { ...previous, assign: currentUserId ?? "" };
      }

      if (previous.assign && !previous.assign.trim()) {
        return { ...previous, assign: hasCurrent ? currentUserId ?? "" : "" };
      }

      return previous;
    });
  }, [assignees, currentUserId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (clientError) {
      setServerError(clientError);
      return;
    }

    const attachmentsPayload = form.attachments.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    const assigneeName = assignees.find((option) => option.id === form.assign)?.name ?? "";

    startTransition(async () => {
      const result = await createTender({
        tenderId: form.tenderId,
        tenderName: form.tenderName,
        privateClient: form.privateClient,
        authorityClient: form.authorityClient,
        referenceNumber: form.referenceNumber,
        tenderValue: form.tenderValue,
        tenderUrl: form.tenderUrl,
        startDate: form.startDate,
        submissionDueDate: form.submissionDueDate,
        responseDate: form.responseDate,
        status: form.status,
        assign: form.assign,
        assignName: assigneeName,
        notes: form.notes,
        background: form.background,
        description: form.description,
        attachments: attachmentsPayload,
      });

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      setServerError(null);
      router.push("/tenders");
      router.refresh();
    });
  };

  const clientError =
    form.privateClient && form.authorityClient ? "Enter either a private client or an authority, not both." : "";

  return (
    <div className="mx-auto w-full max-w-[960px] rounded-[32px] border border-[#EAECF0] bg-white p-10 shadow-[0_24px_48px_rgba(13,35,82,0.08)]">
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="text-[32px] font-semibold leading-[40px] text-[#0D2352]">Create new tender</h1>
        <p className="text-base text-[#5D5D5C]">Provide the details below to log a new tender into the system.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <section className="space-y-6">
          <div className="flex flex-col gap-2 text-sm font-semibold text-[#0D2352]">
            <span>Tender ID</span>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <input
                className="h-11 flex-1 rounded-[12px] border border-[#D0D0D0] bg-white px-4 text-sm text-[#0D2352] outline-none transition focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0]"
                value={form.tenderId}
                readOnly
              />
              <button
                type="button"
                onClick={regenerateTenderId}
                className="rounded-[12px] border border-[#4C7CF0] px-6 py-2 text-sm font-semibold text-[#4C7CF0] transition hover:bg-[#EFF3FF]"
              >
                Regenerate ID
              </button>
            </div>
            <span className="text-xs font-normal text-[#6B6B6A]">Automatically generated unique identifier</span>
          </div>

          <LabeledInput
            label="Tender name"
            required
            placeholder="Community Hub at Gamlingay"
            value={form.tenderName}
            onChange={(value) => updateField("tenderName", value)}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LabeledInput
              label="Private client"
              placeholder="Joe Bloggs Developments"
              value={form.privateClient}
              onChange={(value) => updateField("privateClient", value)}
              disabled={Boolean(form.authorityClient)}
              helperText={form.authorityClient ? "Authority already set" : undefined}
            />
            <AuthoritySelect
              authorities={authorities}
              value={form.authorityClient}
              onChange={(value) => updateField("authorityClient", value)}
              disabled={Boolean(form.privateClient)}
              helperText={form.privateClient ? "Private client already set" : undefined}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LabeledInput
              label="Reference"
              placeholder="Internal ref"
              value={form.referenceNumber}
              onChange={(value) => updateField("referenceNumber", value)}
            />
            <LabeledSelect
              label="Status"
              value={form.status}
              onChange={(value) => updateField("status", value)}
              options={statusOptions}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <LabeledInput
              label="Start date"
              type="date"
              placeholder="dd/mm/yyyy"
              value={form.startDate}
              onChange={(value) => updateField("startDate", value)}
            />
            <LabeledInput
              label="Submission due date"
              type="date"
              placeholder="dd/mm/yyyy"
              value={form.submissionDueDate}
              onChange={(value) => updateField("submissionDueDate", value)}
            />
            <LabeledInput
              label="Estimated value (£)"
              type="number"
              placeholder="125000"
              min="0"
              step="1000"
              value={form.tenderValue}
              onChange={(value) => updateField("tenderValue", value)}
              inputClassName="no-number-spin"
            />
          </div>

          <LabeledInput
            label="Tender URL"
            type="url"
            placeholder="https://example.com/tender"
            value={form.tenderUrl}
            onChange={(value) => updateField("tenderUrl", value)}
          />

          <div className="flex flex-col gap-3 rounded-[16px] border border-[#EAECF0] bg-white p-6 shadow-sm">
            <span className="text-sm font-semibold text-[#0D2352]">Assign</span>
            <select
              className="h-11 w-full rounded-[12px] border border-[#D0D0D0] bg-white px-4 text-sm text-[#0D2352] outline-none transition focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0]"
              value={form.assign}
              onChange={(event) => updateField("assign", event.target.value)}
              disabled={!assignees.length}
            >
              <option value="">Select a team member</option>
              {assignees.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.isCurrentUser ? " (You)" : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => currentUserId && updateField("assign", currentUserId)}
              className="w-fit rounded-full bg-transparent px-4 py-1 text-sm font-medium text-[#1890FF] transition hover:text-[#0D2352]"
              disabled={!currentUserId || !assignees.some((option) => option.id === currentUserId)}
            >
              Assign to me
            </button>
          </div>
        </section>

        {clientError ? <p className="text-sm font-medium text-[#C53030]">{clientError}</p> : null}
        {serverError ? <p className="text-sm font-medium text-[#C53030]">{serverError}</p> : null}

        <section className="space-y-6">
          <LabeledTextarea
            label="Notes"
            placeholder="Add any contextual information or next steps"
            value={form.notes}
            onChange={(value) => updateField("notes", value)}
          />
          <LabeledTextarea
            label="Background"
            placeholder="Add project context, goals, and other details relevant to this tender."
            value={form.background}
            onChange={(value) => updateField("background", value)}
          />
          <div className="flex flex-col gap-4 rounded-[16px] border border-[#EAECF0] bg-white p-6 shadow-sm">
            <span className="text-sm font-semibold text-[#0D2352]">Attachments</span>
            <FileUploadField
              hint="Upload supporting documents (PDF, DOCX, XLSX up to 20MB)"
              files={form.attachments}
              onFilesSelected={(files) => updateField("attachments", files)}
            />
          </div>
          <LabeledTextarea
            label="Description"
            placeholder="Provide a concise description of the opportunity."
            value={form.description}
            onChange={(value) => updateField("description", value)}
          />
        </section>

        <footer className="flex flex-col gap-3 pt-2 text-sm sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/tenders"
            className="rounded-[12px] border border-[#D0D0D0] px-6 py-2 font-semibold text-[#0D2352] transition hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-[12px] bg-[#4C7CF0] px-6 py-2 font-semibold text-white transition hover:bg-[#3B6BE0] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={Boolean(clientError) || isPending}
          >
            {isPending ? "Creating..." : "Create tender"}
          </button>
        </footer>
      </form>
    </div>
  );
}

type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  className?: string;
  disabled?: boolean;
  helperText?: string;
  readOnly?: boolean;
  inputClassName?: string;
};

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  min,
  step,
  className,
  disabled,
  helperText,
  readOnly,
  inputClassName,
}: LabeledInputProps) {
  const baseClasses = disabled
    ? "border-[#D0D0D0] bg-[#F7F7F7] text-[#9CA3AF]"
    : "border-[#D0D0D0] bg-white text-[#0D2352]";

  return (
    <label className={`flex flex-col gap-2 text-sm font-semibold text-[#0D2352] ${className ?? ""}`}>
      <span className="flex items-center gap-1">
        {label}
        {required ? <span className="text-[#4C7CF0]">*</span> : null}
      </span>
      <input
        className={`h-11 rounded-[12px] border px-4 text-sm outline-none transition focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0] disabled:cursor-not-allowed ${baseClasses} ${inputClassName ?? ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        min={min}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
      />
      {helperText ? <span className="text-xs font-normal text-[#6B6B6A]">{helperText}</span> : null}
    </label>
  );
}

type LabeledSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function LabeledSelect({ label, value, onChange, options }: LabeledSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[#0D2352]">
      {label}
      <select
        className="h-11 rounded-[12px] border border-[#D0D0D0] bg-white px-4 text-sm text-[#0D2352] outline-none transition focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type LabeledTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function LabeledTextarea({ label, value, onChange, placeholder }: LabeledTextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[#0D2352]">
      {label}
      <textarea
        className="min-h-[140px] rounded-[12px] border border-[#D0D0D0] bg-white px-4 py-3 text-sm text-[#0D2352] outline-none transition focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0]"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type AuthoritySelectProps = {
  authorities: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
};

function AuthoritySelect({ authorities, value, onChange, disabled, helperText }: AuthoritySelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredAuthorities = useMemo(() => {
    if (!authorities.length) return [] as string[];
    const normalizedQuery = query.trim().toLowerCase();
    const base = authorities.filter((name) => name);
    if (!normalizedQuery) {
      return [...base].sort((a, b) => a.localeCompare(b));
    }
    return [...base]
      .filter((name) => name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.toLowerCase().startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      });
  }, [authorities, query]);

  const handleSelect = (name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && filteredAuthorities.length > 0) {
      event.preventDefault();
      handleSelect(filteredAuthorities[0]);
    }
  };

  const inputClasses = disabled || !authorities.length
    ? "border-[#D0D0D0] bg-[#F7F7F7] text-[#9CA3AF]"
    : "border-[#D0D0D0] bg-white text-[#0D2352]";

  return (
    <div ref={containerRef} className="flex flex-col gap-2 text-sm font-semibold text-[#0D2352]">
      <span className="flex items-center gap-1">Authority</span>
      <div className="relative">
        <input
          value={query}
          onChange={(event) => {
            if (disabled || !authorities.length) return;
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
          }}
          onFocus={() => {
            if (!disabled && authorities.length) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={authorities.length ? "Select an authority" : "No authorities available"}
          className={`h-11 w-full rounded-[12px] border px-4 pr-12 text-sm outline-none transition focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0] disabled:cursor-not-allowed ${inputClasses}`}
          disabled={disabled || !authorities.length}
          autoComplete="off"
        />
        {value && !disabled ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#F0F2F5] px-2 py-1 text-xs font-medium text-[#0D2352]"
          >
            Clear
          </button>
        ) : null}
        {!disabled && open && authorities.length ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-[12px] border border-[#D0D0D0] bg-white shadow-xl">
            {filteredAuthorities.length ? (
              filteredAuthorities.map((name) => (
                <button
                  key={name}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(name);
                  }}
                  className="flex w-full items-start px-4 py-2 text-left text-sm text-[#0D2352] hover:bg-[#F3F6FF]"
                >
                  {name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#6B6B6A]">No matching authorities</div>
            )}
          </div>
        ) : null}
      </div>
      {helperText ? <span className="text-xs font-normal text-[#6B6B6A]">{helperText}</span> : null}
      {!disabled && !authorities.length ? (
        <span className="text-xs font-normal text-[#C53030]">No authorities configured in Supabase.</span>
      ) : null}
    </div>
  );
}

type FileUploadFieldProps = {
  hint?: string;
  files: File[];
  onFilesSelected: (files: File[]) => void;
};

function FileUploadField({ hint, files, onFilesSelected }: FileUploadFieldProps) {

  return (

    <div className="flex flex-col gap-4 rounded-[16px] border border-[#EAECF0] bg-white p-6 shadow-sm">

      <DocumentDropzone interactive hint={hint} onFilesSelected={onFilesSelected} />

      {files.length > 0 ? (

        <ul className="flex flex-col gap-2 rounded-[12px] border border-[#EAECF0] bg-white p-4 text-sm text-[#0D2352]">

          {files.map((file) => (

            <li key={file.name} className="flex items-center justify-between gap-3">

              <span className="truncate">{file.name}</span>

              <span className="text-xs text-[#6B6B6A]">{Math.ceil(file.size / 1024)} KB</span>

            </li>

          ))}

        </ul>

      ) : null}

    </div>

  );

}

