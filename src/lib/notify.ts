import { toast } from "sonner";

export function notifyTaskStart(title: string, description?: string) {
  const id = toast.loading(title, { description });
  return id;
}

export function notifyTaskSuccess(id: string | number, title: string, description?: string) {
  toast.success(title, { id, description });
}

export function notifyTaskError(id: string | number, title: string, description?: string) {
  toast.error(title, { id, description });
}
