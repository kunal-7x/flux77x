import { useEffect, useState } from "react";
import { chatEvents } from "@/lib/chatEvents";

const AI_FOCUS_VISIBLE_MS = 5000;

type AiActionPayload = {
  table?: string;
  op?: string;
  id?: string;
  record?: Record<string, any>;
  records?: Record<string, any>[];
};

type AiFocusState = {
  table?: string;
  op?: string;
  id?: string;
  search?: string;
  focusKey?: string;
};

const getPrimaryRecord = (payload: AiActionPayload) => (
  payload.record || (payload.records?.length === 1 ? payload.records[0] : undefined)
);

const getRecordId = (payload: AiActionPayload) => {
  const record = getPrimaryRecord(payload);
  return payload.id || record?.id || "";
};

const getInitialFocus = (tables: string[]): AiFocusState => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const table = params.get("aiTable") || "";
  if (!table || !tables.includes(table)) return {};
  return {
    table,
    op: params.get("aiOp") || undefined,
    id: params.get("aiFocus") || undefined,
    search: params.get("aiSearch") || undefined,
    focusKey: params.get("aiAt") || undefined,
  };
};

export function useAiActionFocus(
  tables: string | string[],
  onAction?: (payload: AiActionPayload) => void,
) {
  const tableKey = Array.isArray(tables) ? tables.join("|") : tables;
  const tableList = tableKey.split("|").filter(Boolean);
  const [focus, setFocus] = useState<AiFocusState>(() => getInitialFocus(tableList));
  const [activeFocusId, setActiveFocusId] = useState(() => getInitialFocus(tableList).id || "");

  useEffect(() => {
    setActiveFocusId(focus.id || "");
    if (!focus.id) return;

    const timeout = window.setTimeout(() => setActiveFocusId(""), AI_FOCUS_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [focus.id, focus.focusKey]);

  useEffect(() => {
    const unsubscribe = chatEvents.on("action", (payload: AiActionPayload) => {
      if (!payload?.table || !tableList.includes(payload.table)) return;
      setFocus({
        table: payload.table,
        op: payload.op,
        id: getRecordId(payload),
        focusKey: String(Date.now()),
      });
      onAction?.(payload);
    });

    return unsubscribe;
  }, [onAction, tableKey]);

  return {
    ...focus,
    activeFocusId,
    isFocused: (id?: string) => Boolean(id && activeFocusId === id),
    focusClass: (id?: string) => (id && activeFocusId === id ? "ai-focus-ring" : ""),
  };
}
