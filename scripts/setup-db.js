// filepath: scripts/setup-db.js
// Quick script to create tables in Supabase

const SUPABASE_URL = "https://ddfmcmrcrqjtampriijc.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm1jbXJjcnFqdGFtcHJpaWpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NzA5NiwiZXhwIjoyMDkyOTUzMDk2fQ.Z7-Er0t2__4dcznwwjAOK55J97GBDP2IDy82rzARMFE";

const tables = [
  {
    name: "departments",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "name", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "employees",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "first_name", type: "text" },
      { name: "last_name", type: "text" },
      { name: "email", type: "text" },
      { name: "phone", type: "text" },
      { name: "role", type: "text", default: "'Employee'" },
      { name: "department", type: "text", default: "'General'" },
      { name: "level", type: "text", default: "'Mid'" },
      { name: "manager", type: "text" },
      { name: "city", type: "text" },
      { name: "salary", type: "numeric", default: "0" },
      { name: "bonus", type: "numeric", default: "0" },
      { name: "performance_score", type: "integer", default: "70" },
      { name: "vacation_days", type: "integer", default: "20" },
      { name: "status", type: "text", default: "'active'" },
      { name: "avatar", type: "text", default: "''" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "attendance_records",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "employee_id", type: "uuid", references: "employees(id)" },
      { name: "check_in", type: "timestamptz" },
      { name: "check_out", type: "timestamptz" },
      { name: "status", type: "text", default: "'present'" },
      { name: "location", type: "text" },
      { name: "date", type: "date", default: "CURRENT_DATE" },
      { name: "hours_worked", type: "numeric" },
      { name: "notes", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "leave_requests",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "employee_id", type: "uuid", references: "employees(id)" },
      { name: "leave_type", type: "text", default: "'vacation'" },
      { name: "start_date", type: "date" },
      { name: "end_date", type: "date" },
      { name: "reason", type: "text" },
      { name: "status", type: "text", default: "'pending'" },
      { name: "approved_by", type: "uuid", references: "employees(id)" },
      { name: "document_url", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "announcements",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "title", type: "text" },
      { name: "content", type: "text" },
      { name: "author", type: "text" },
      { name: "author_initials", type: "text" },
      { name: "category", type: "text", default: "'Company'" },
      { name: "pinned", type: "boolean", default: "false" },
      { name: "likes", type: "integer", default: "0" },
      { name: "comments", type: "integer", default: "0" },
      { name: "views", type: "integer", default: "0" },
      { name: "published_at", type: "timestamptz", default: "now()" },
      { name: "created_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "projects",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "name", type: "text" },
      { name: "description", type: "text" },
      { name: "status", type: "text", default: "'Planning'" },
      { name: "progress", type: "integer", default: "0" },
      { name: "team", type: "text[]", default: "'{}'" },
      { name: "deadline", type: "text" },
      { name: "tasks_total", type: "integer", default: "0" },
      { name: "tasks_completed", type: "integer", default: "0" },
      { name: "budget", type: "numeric" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "company_settings",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "company_name", type: "text", default: "'Flux HR'" },
      { name: "industry", type: "text", default: "'Technology'" },
      { name: "timezone", type: "text", default: "'UTC'" },
      { name: "work_hours_start", type: "text", default: "'09:00'" },
      { name: "work_hours_end", type: "text", default: "'18:00'" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "goals",
    columns: [
      { name: "id", type: "uuid", is_primary: true },
      { name: "employee_id", type: "uuid", references: "employees(id)" },
      { name: "title", type: "text" },
      { name: "progress", type: "integer", default: "0" },
      { name: "status", type: "text", default: "'On Track'" },
      { name: "quarter", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  }
];

async function createTables() {
  console.log("Creating tables in Supabase...");
  
  for (const table of tables) {
    const columnsDef = table.columns.map(col => {
      let def = `"${col.name}" ${col.type}`;
      if (col.default) def += ` default ${col.default}`;
      if (col.references) def += ` references ${col.references}`;
      return def;
    }).join(", ");
    
    const sql = `create table if not exists ${table.name} (${columnsDef});`;
    
    console.log(`Creating ${table.name}...`);
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (res.ok) {
        console.log(`✓ ${table.name} created`);
      } else {
        const err = await res.text();
        console.log(`✗ ${table.name}: ${err}`);
      }
    } catch (e) {
      console.log(`✗ ${table.name}: ${e.message}`);
    }
  }
  
  console.log("\nDone! Check your Supabase dashboard.");
}

createTables();