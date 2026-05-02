import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { employees as mockEmployees, Employee } from "@/data/mockData";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("employees").select("*").order("first_name");
    if (!error && data && data.length > 0) {
      setEmployees(data.map((e: any) => ({
        id: e.id,
        firstName: e.first_name,
        lastName: e.last_name,
        role: e.role || "Employee",
        department: e.department || "General",
        avatar: e.avatar || "",
        phone: e.phone || "",
        email: e.email || "",
        level: e.level || "Mid",
        manager: e.manager || "",
        city: e.city || "",
        salary: Number(e.salary) || 0,
        bonus: Number(e.bonus) || 0,
        performanceScore: e.performance_score || 70,
        vacationDays: e.vacation_days || 20,
        tasksInProgress: e.tasks_in_progress || 0,
        externalWork: e.external_work || 50,
        internalWork: e.internal_work || 70,
        learningProgress: e.learning_progress || 50,
        avgWorkTime: Number(e.avg_work_time) || 7.5,
        dateOfBirth: e.date_of_birth,
        nationality: e.nationality,
        address: e.address,
        emergencyContact: e.emergency_contact,
        emergencyPhone: e.emergency_phone,
        joinDate: e.join_date,
        employeeId: e.employee_id,
        status: e.status as any,
        skills: e.skills || [],
        certifications: e.certifications || [],
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const importCSV = useCallback(async (csvData: any[]) => {
    const rows = csvData.map((row: any) => ({
      first_name: row.first_name || row.firstName || "",
      last_name: row.last_name || row.lastName || "",
      email: row.email || "",
      phone: row.phone || "",
      role: row.role || "Employee",
      department: row.department || "General",
      level: row.level || "Mid",
      manager: row.manager || "",
      city: row.city || "",
      salary: Number(row.salary) || 0,
      bonus: Number(row.bonus) || 0,
      performance_score: Number(row.performance_score || row.performanceScore) || 70,
      vacation_days: Number(row.vacation_days || row.vacationDays) || 20,
      date_of_birth: row.date_of_birth || row.dateOfBirth || null,
      nationality: row.nationality || null,
      address: row.address || null,
      emergency_contact: row.emergency_contact || row.emergencyContact || null,
      emergency_phone: row.emergency_phone || row.emergencyPhone || null,
      join_date: row.join_date || row.joinDate || null,
      employee_id: row.employee_id || row.employeeId || null,
      status: row.status || "active",
      skills: row.skills ? (typeof row.skills === "string" ? row.skills.split(",").map((s: string) => s.trim()) : row.skills) : [],
    }));
    
    const { error } = await supabase.from("employees").insert(rows);
    if (error) throw error;
    await fetchEmployees();
    return rows.length;
  }, [fetchEmployees]);

  return { employees, loading, fetchEmployees, importCSV, setEmployees };
}
