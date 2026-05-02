// Event bus for chatbot → page real-time sync
type EventCallback = (data: any) => void;

class ChatEventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const chatEvents = new ChatEventBus();

// Table name → React Query key mapping
export const TABLE_QUERY_KEYS: Record<string, string[]> = {
  employees: ["employees"],
  leave_requests: ["leave_requests", "requests"],
  projects: ["projects"],
  project_tasks: ["project_tasks"],
  announcements: ["announcements"],
  attendance_records: ["attendance"],
  jobs: ["jobs"],
  candidates: ["candidates"],
  interviews: ["interviews"],
  goals: ["goals"],
  departments: ["departments"],
  notifications: ["notifications"],
  onboarding_tasks: ["onboarding"],
  company_settings: ["settings"],
};
