import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── helpers ──────────────────────────────────────────────────────────
function ok(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 500) {
  return ok({ error: msg }, status);
}

// ── CRUD executor ────────────────────────────────────────────────────
async function executeAction(sb: any, action: string, data: any) {
  try {
    switch (action) {
      // ─── EMPLOYEES ──────────────────────────────────────
      case "add_employee": {
        const { data: r, error } = await sb.from("employees").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "employees", op: "insert", record: r };
      }
      case "update_employee": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("employees").update(rest).eq("id", id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "employees", op: "update", record: r };
      }
      case "delete_employee": {
        const { error } = await sb.from("employees").delete().eq("id", data.id);
        return error ? { ok: false, error: error.message } : { ok: true, table: "employees", op: "delete", id: data.id };
      }
      case "list_employees": {
        const q = sb.from("employees").select("id,first_name,last_name,email,role,department,status,salary,phone,level,city,join_date,employee_id").order("first_name");
        if (data?.department) q.eq("department", data.department);
        if (data?.status) q.eq("status", data.status);
        if (data?.limit) q.limit(data.limit);
        const { data: r, error } = await q;
        return error ? { ok: false, error: error.message } : { ok: true, table: "employees", op: "list", records: r };
      }
      case "search_employees": {
        const { data: r, error } = await sb.from("employees").select("id,first_name,last_name,email,role,department,status,salary").or(`first_name.ilike.%${data.query}%,last_name.ilike.%${data.query}%,email.ilike.%${data.query}%`);
        return error ? { ok: false, error: error.message } : { ok: true, table: "employees", op: "search", records: r };
      }

      // ─── LEAVE REQUESTS ─────────────────────────────────
      case "create_leave_request": {
        const { data: r, error } = await sb.from("leave_requests").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "leave_requests", op: "insert", record: r };
      }
      case "approve_leave": {
        const { data: r, error } = await sb.from("leave_requests").update({ status: "approved" }).eq("id", data.id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "leave_requests", op: "update", record: r };
      }
      case "reject_leave": {
        const { data: r, error } = await sb.from("leave_requests").update({ status: "rejected" }).eq("id", data.id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "leave_requests", op: "update", record: r };
      }
      case "list_leave_requests": {
        const q = sb.from("leave_requests").select("*").order("created_at", { ascending: false });
        if (data?.status) q.eq("status", data.status);
        if (data?.employee_id) q.eq("employee_id", data.employee_id);
        const { data: r, error } = await q;
        return error ? { ok: false, error: error.message } : { ok: true, table: "leave_requests", op: "list", records: r };
      }

      // ─── PROJECTS ───────────────────────────────────────
      case "create_project": {
        const payload = { name: data.name, description: data.description || null, status: data.status || "Planning", deadline: data.deadline || null, progress: 0, team: data.team || [], tasks_total: 0, tasks_completed: 0 };
        const { data: r, error } = await sb.from("projects").insert(payload).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "projects", op: "insert", record: r };
      }
      case "update_project": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("projects").update(rest).eq("id", id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "projects", op: "update", record: r };
      }
      case "delete_project": {
        const { error } = await sb.from("projects").delete().eq("id", data.id);
        return error ? { ok: false, error: error.message } : { ok: true, table: "projects", op: "delete", id: data.id };
      }
      case "list_projects": {
        const { data: r, error } = await sb.from("projects").select("*").order("created_at", { ascending: false });
        return error ? { ok: false, error: error.message } : { ok: true, table: "projects", op: "list", records: r };
      }

      // ─── PROJECT TASKS ──────────────────────────────────
      case "create_task": {
        const { data: r, error } = await sb.from("project_tasks").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "project_tasks", op: "insert", record: r };
      }
      case "update_task": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("project_tasks").update(rest).eq("id", id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "project_tasks", op: "update", record: r };
      }

      // ─── ANNOUNCEMENTS ──────────────────────────────────
      case "create_announcement": {
        const payload = { title: data.title, content: data.content, author: data.author || "Flux AI", author_initials: data.author_initials || "AI", category: data.category || "Company", pinned: data.pinned || false };
        const { data: r, error } = await sb.from("announcements").insert(payload).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "announcements", op: "insert", record: r };
      }
      case "delete_announcement": {
        const { error } = await sb.from("announcements").delete().eq("id", data.id);
        return error ? { ok: false, error: error.message } : { ok: true, table: "announcements", op: "delete", id: data.id };
      }

      // ─── ATTENDANCE ─────────────────────────────────────
      case "record_attendance": {
        const { data: r, error } = await sb.from("attendance_records").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "attendance_records", op: "insert", record: r };
      }

      // ─── RECRUITMENT ────────────────────────────────────
      case "create_job": {
        const { data: r, error } = await sb.from("jobs").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "jobs", op: "insert", record: r };
      }
      case "update_job": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("jobs").update(rest).eq("id", id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "jobs", op: "update", record: r };
      }
      case "add_candidate": {
        const payload: any = { ...data };
        if (!payload.job_id) delete payload.job_id;
        const { data: r, error } = await sb.from("candidates").insert(payload).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "candidates", op: "insert", record: r };
      }
      case "update_candidate": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("candidates").update(rest).eq("id", id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "candidates", op: "update", record: r };
      }
      case "schedule_interview": {
        const { data: r, error } = await sb.from("interviews").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "interviews", op: "insert", record: r };
      }

      // ─── GOALS ──────────────────────────────────────────
      case "create_goal": {
        const { data: r, error } = await sb.from("goals").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "goals", op: "insert", record: r };
      }
      case "update_goal": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("goals").update(rest).eq("id", id).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "goals", op: "update", record: r };
      }

      // ─── ONBOARDING ────────────────────────────────────
      case "create_onboarding_task": {
        const { data: r, error } = await sb.from("onboarding_tasks").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "onboarding_tasks", op: "insert", record: r };
      }

      // ─── NOTIFICATIONS ─────────────────────────────────
      case "create_notification": {
        const { data: r, error } = await sb.from("notifications").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "notifications", op: "insert", record: r };
      }

      // ─── DEPARTMENTS ───────────────────────────────────
      case "create_department": {
        const { data: r, error } = await sb.from("departments").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "departments", op: "insert", record: r };
      }

      // ─── COMPANY SETTINGS ──────────────────────────────
      case "update_settings": {
        const { data: rows } = await sb.from("company_settings").select("id").limit(1);
        if (rows?.[0]) {
          const { data: r, error } = await sb.from("company_settings").update(data).eq("id", rows[0].id).select().single();
          return error ? { ok: false, error: error.message } : { ok: true, table: "company_settings", op: "update", record: r };
        }
        const { data: r, error } = await sb.from("company_settings").insert(data).select().single();
        return error ? { ok: false, error: error.message } : { ok: true, table: "company_settings", op: "insert", record: r };
      }

      default:
        return { ok: false, error: `Unknown action: ${action}` };
    }
  } catch (e: any) {
    return { ok: false, error: e.message || "Action execution failed" };
  }
}

// ── build context ────────────────────────────────────────────────────
async function buildContext(sb: any) {
  const [emps, leaves, projs, anns, jobs, cands, goals, depts, settings] = await Promise.all([
    sb.from("employees").select("id,first_name,last_name,email,role,department,status,salary,phone,level,city,join_date,employee_id").order("first_name").limit(100),
    sb.from("leave_requests").select("id,employee_id,leave_type,start_date,end_date,status,reason").order("created_at", { ascending: false }).limit(30),
    sb.from("projects").select("id,name,status,progress,deadline,team,tasks_total,tasks_completed").order("created_at", { ascending: false }).limit(30),
    sb.from("announcements").select("id,title,category,author,pinned,created_at").order("created_at", { ascending: false }).limit(20),
    sb.from("jobs").select("id,title,department,status,location,employment_type").order("created_at", { ascending: false }).limit(20),
    sb.from("candidates").select("id,name,email,stage,status,rating,job_id").order("created_at", { ascending: false }).limit(30),
    sb.from("goals").select("id,title,progress,status,employee_id,quarter").limit(20),
    sb.from("departments").select("id,name"),
    sb.from("company_settings").select("*").limit(1),
  ]);

  const employees = emps.data || [];
  const pendingLeaves = (leaves.data || []).filter((l: any) => l.status === "pending");
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  return `
=== LIVE DATABASE STATE ===

EMPLOYEES (${employees.length} total, ${activeEmployees.length} active):
${employees.map((e: any) => `• [${e.id.slice(0,8)}] ${e.first_name} ${e.last_name} | ${e.role || "N/A"} | ${e.department || "N/A"} | ${e.status || "active"} | $${e.salary || 0} | ${e.email || "N/A"} | EID: ${e.employee_id || "N/A"}`).join("\n")}

LEAVE REQUESTS (${pendingLeaves.length} pending):
${(leaves.data || []).slice(0, 10).map((l: any) => `• [${l.id.slice(0,8)}] Employee ${l.employee_id?.slice(0,8)} | ${l.leave_type} | ${l.start_date} to ${l.end_date} | Status: ${l.status} | Reason: ${l.reason || "N/A"}`).join("\n") || "None"}

PROJECTS (${(projs.data || []).length}):
${(projs.data || []).map((p: any) => `• [${p.id.slice(0,8)}] ${p.name} | ${p.status} | Progress: ${p.progress}% | Deadline: ${p.deadline || "TBD"} | Tasks: ${p.tasks_completed}/${p.tasks_total}`).join("\n") || "None"}

ANNOUNCEMENTS (${(anns.data || []).length}):
${(anns.data || []).slice(0, 5).map((a: any) => `• [${a.id.slice(0,8)}] ${a.title} | ${a.category} | By: ${a.author} | Pinned: ${a.pinned}`).join("\n") || "None"}

JOBS (${(jobs.data || []).length}):
${(jobs.data || []).map((j: any) => `• [${j.id.slice(0,8)}] ${j.title} | ${j.department || "N/A"} | ${j.status} | ${j.location || "Remote"}`).join("\n") || "None"}

CANDIDATES (${(cands.data || []).length}):
${(cands.data || []).slice(0, 10).map((c: any) => `• [${c.id.slice(0,8)}] ${c.name} | Stage: ${c.stage} | Rating: ${c.rating || "N/A"}`).join("\n") || "None"}

DEPARTMENTS: ${(depts.data || []).map((d: any) => d.name).join(", ") || "None"}

GOALS: ${(goals.data || []).length} total
${(goals.data || []).slice(0, 5).map((g: any) => `• [${g.id.slice(0,8)}] ${g.title} | ${g.status} | Progress: ${g.progress}%`).join("\n") || "None"}

SETTINGS: ${JSON.stringify((settings.data || [])[0] || {})}
`;
}

// ── system prompt ────────────────────────────────────────────────────
function buildSystemPrompt(ctx: string) {
  return `You are Flux AI, the intelligent AI co-pilot for Flux HR Platform. You have FULL database access.

${ctx}

=== HOW TO EXECUTE ACTIONS ===
To perform a database operation, include EXACTLY this on its own line:
%%ACTION:{"action":"ACTION_NAME","data":{...}}%%

Available actions:
- add_employee: data={first_name,last_name,email,department,role,salary,status,level,phone,city}
- update_employee: data={id(FULL UUID),field:value,...}
- delete_employee: data={id}
- list_employees: data={department?,status?,limit?}
- search_employees: data={query}
- approve_leave / reject_leave: data={id}
- create_leave_request: data={employee_id,leave_type,start_date,end_date,status:"pending",reason}
- create_project: data={name,description?,status:"Planning",deadline?}
- update_project: data={id,status?,progress?}
- delete_project: data={id}
- create_announcement: data={title,content,category,author?}
- create_job: data={title,department,location,employment_type,description,status}
- add_candidate: data={name,email?,phone?,stage,status}
- update_candidate: data={id,stage?,rating?}
- schedule_interview: data={candidate_id,interviewer,interview_type,scheduled_at}
- create_goal: data={title,employee_id?,quarter,status,progress}
- update_goal: data={id,progress?,status?}
- create_department: data={name}
- create_notification: data={title,message,type}
- record_attendance: data={employee_id,check_in,status,location}
- create_onboarding_task: data={employee_id,title,description,status,category}
- update_settings: data={company_name?,timezone?,...}

=== RULES (MANDATORY) ===
1. Use FULL UUIDs from database context (IDs shown as [xxxxxxxx] are truncated — find full ID by name).
2. Your response to the user must be PURE natural language. NEVER show JSON, code blocks with JSON, or technical data to the user.
3. The %%ACTION%% line is INVISIBLE to the user — it gets stripped out. So always write a human-friendly message too.
4. Use ✅ to confirm success, ❌ for failures.
5. For DELETE: ask confirmation first.
6. Format lists as clean markdown tables with | header | syntax.
7. Be concise. Use bullet points. No walls of text.
8. Fill in reasonable defaults for missing fields.
9. NEVER repeat back the action JSON. The user should only see natural language.
10. Keep responses short and clear — like a professional assistant, not a verbose AI.`;
}

// ── clean AI output ──────────────────────────────────────────────────
function cleanAIResponse(text: string): { clean: string; actions: Array<{ action: string; data: any }> } {
  const actions: Array<{ action: string; data: any }> = [];

  // Extract %%ACTION:{...}%% patterns
  const actionRegex = /%%ACTION:([\s\S]*?)%%/g;
  let m;
  while ((m = actionRegex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch {}
  }

  // Also catch <action>...</action> variants the model might use
  const xmlRegex = /<action>([\s\S]*?)<\/action>/gi;
  while ((m = xmlRegex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch {}
  }

  // Also catch [action]...[/action]
  const bracketRegex = /\[action\]([\s\S]*?)\[\/action\]/gi;
  while ((m = bracketRegex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch {}
  }

  // Remove all action patterns from visible text
  let clean = text
    .replace(/%%ACTION:[\s\S]*?%%/g, "")
    .replace(/<\/?action>/gi, "")
    .replace(/\[\/?action\]/gi, "")
    // Remove any stray JSON blocks that look like action payloads
    .replace(/```json\s*\{[\s\S]*?"action"\s*:[\s\S]*?\}\s*```/g, "")
    .replace(/`\{[\s\S]*?"action"\s*:[\s\S]*?\}`/g, "")
    // Remove raw JSON objects on their own line that look like actions
    .replace(/^\s*\{"action"\s*:[\s\S]*?\}\s*$/gm, "")
    // Clean up excessive newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { clean, actions };
}

// ── main handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const ctx = await buildContext(sb);
    const systemPrompt = buildSystemPrompt(ctx);

    const aiResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: false,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return err("Rate limit exceeded. Please wait a moment.", 429);
      console.error("Groq error:", aiResp.status, await aiResp.text());
      return err("AI service temporarily unavailable", 500);
    }

    const aiData = await aiResp.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "I couldn't generate a response.";

    // Parse actions and clean response
    const { clean, actions } = cleanAIResponse(rawContent);

    // Execute all parsed actions
    const actionResults: any[] = [];
    for (const act of actions) {
      const result = await executeAction(sb, act.action, act.data);
      actionResults.push({ action: act.action, ...result });
    }

    // Build final content
    let finalContent = clean;
    if (actionResults.length > 0 && !finalContent) {
      finalContent = actionResults.map(r =>
        r.ok ? `✅ **${r.action.replace(/_/g, " ")}** completed successfully.`
             : `❌ **${r.action.replace(/_/g, " ")}** failed: ${r.error}`
      ).join("\n\n");
    }
    if (!finalContent) finalContent = "Done! Let me know if you need anything else.";

    // SSE stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = finalContent.split(" ");
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : "");
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`));
        }
        if (actionResults.length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: "" } }], action_results: actionResults })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e: any) {
    console.error("chat error:", e);
    return err(e.message || "Unknown error");
  }
});
