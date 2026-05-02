// filepath: scripts/setup-db-v2.js
// Create tables using Supabase Table Editor API

const SUPABASE_URL = "https://ddfmcmrcrqjtampriijc.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm1jbXJjcnFqdGFtcHJpaWpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NzA5NiwiZXhwIjoyMDkyOTUzMDk2fQ.Z7-Er0t2__4dcznwwjAOK55J97GBDP2IDy82rzARMFE";

const tables = [
  {
    name: "departments",
    columns: [
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "name", type: "text", is_nullable: false },
      { name: "created_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "employees",
    columns: [
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "first_name", type: "text", is_nullable: false },
      { name: "last_name", type: "text", is_nullable: false },
      { name: "email", type: "text" },
      { name: "phone", type: "text" },
      { name: "role", type: "text", default: "Employee" },
      { name: "department", type: "text", default: "General" },
      { name: "level", type: "text", default: "Mid" },
      { name: "manager", type: "text" },
      { name: "city", type: "text" },
      { name: "salary", type: "numeric", default: "0" },
      { name: "bonus", type: "numeric", default: "0" },
      { name: "performance_score", type: "integer", default: "70" },
      { name: "vacation_days", type: "integer", default: "20" },
      { name: "status", type: "text", default: "active" },
      { name: "avatar", type: "text", default: "" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "attendance_records",
    columns: [
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "employee_id", type: "uuid" },
      { name: "check_in", type: "timestamptz" },
      { name: "check_out", type: "timestamptz" },
      { name: "status", type: "text", default: "present" },
      { name: "location", type: "text" },
      { name: "date", type: "date", default: "now()" },
      { name: "hours_worked", type: "numeric" },
      { name: "notes", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "leave_requests",
    columns: [
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "employee_id", type: "uuid" },
      { name: "leave_type", type: "text", default: "vacation" },
      { name: "start_date", type: "date" },
      { name: "end_date", type: "date" },
      { name: "reason", type: "text" },
      { name: "status", type: "text", default: "pending" },
      { name: "approved_by", type: "uuid" },
      { name: "document_url", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "announcements",
    columns: [
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "title", type: "text" },
      { name: "content", type: "text" },
      { name: "author", type: "text" },
      { name: "author_initials", type: "text" },
      { name: "category", type: "text", default: "Company" },
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
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "name", type: "text" },
      { name: "description", type: "text" },
      { name: "status", type: "text", default: "Planning" },
      { name: "progress", type: "integer", default: "0" },
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
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "company_name", type: "text", default: "Flux HR" },
      { name: "industry", type: "text", default: "Technology" },
      { name: "timezone", type: "text", default: "UTC" },
      { name: "work_hours_start", type: "text", default: "09:00" },
      { name: "work_hours_end", type: "text", default: "18:00" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  },
  {
    name: "goals",
    columns: [
      { name: "id", type: "uuid", is_primary: true, default: "gen_random_uuid()" },
      { name: "employee_id", type: "uuid" },
      { name: "title", type: "text" },
      { name: "progress", type: "integer", default: "0" },
      { name: "status", type: "text", default: "On Track" },
      { name: "quarter", type: "text" },
      { name: "created_at", type: "timestamptz", default: "now()" },
      { name: "updated_at", type: "timestamptz", default: "now()" }
    ]
  }
];

async function createTables() {
  console.log("Creating tables via Supabase Management API...\n");
  
  for (const table of tables) {
    console.log(`Creating ${table.name}...`);
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table.name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify([{}]) // Just to test if table exists
      });
      
      if (res.status === 201 || res.status === 200) {
        console.log(`✓ ${table.name} - exists`);
      } else if (res.status === 404) {
        console.log(`✗ ${table.name} - needs to be created manually`);
      } else {
        const err = await res.text();
        console.log(`? ${table.name}: ${res.status} - ${err.substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`✗ ${table.name}: ${e.message}`);
    }
  }
  
  console.log("\n---");
  console.log("Since API can't create tables, here's the fastest way:");
  console.log("1. Go to Supabase Dashboard → Table Editor");
  console.log("2. Click 'New Table' for each table");
  console.log("3. Add columns as needed");
  console.log("\nOr use SQL Editor with ONE statement at a time.");
}

createTables();