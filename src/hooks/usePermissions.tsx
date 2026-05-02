import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "admin" | "hr_manager" | "employee";

interface Permissions {
  role: AppRole;
  canCreateEmployee: boolean;
  canEditEmployee: boolean;
  canDeleteEmployee: boolean;
  canManageRoles: boolean;
  canManageSettings: boolean;
  canExport: boolean;
  canApproveLeave: boolean;
  canManagePayroll: boolean;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canCreateGoal: boolean;
  canCreateAnnouncement: boolean;
  isReadOnly: boolean;
}

const GUEST_PERMISSIONS: Permissions = {
  role: "employee",
  canCreateEmployee: false, canEditEmployee: false, canDeleteEmployee: false,
  canManageRoles: false, canManageSettings: false, canExport: true,
  canApproveLeave: false, canManagePayroll: false, canCreateProject: false,
  canDeleteProject: false, canCreateGoal: false, canCreateAnnouncement: false,
  isReadOnly: true,
};

const ROLE_PERMISSIONS: Record<AppRole, Omit<Permissions, "role">> = {
  admin: {
    canCreateEmployee: true, canEditEmployee: true, canDeleteEmployee: true,
    canManageRoles: true, canManageSettings: true, canExport: true,
    canApproveLeave: true, canManagePayroll: true, canCreateProject: true,
    canDeleteProject: true, canCreateGoal: true, canCreateAnnouncement: true,
    isReadOnly: false,
  },
  hr_manager: {
    canCreateEmployee: true, canEditEmployee: true, canDeleteEmployee: false,
    canManageRoles: false, canManageSettings: false, canExport: true,
    canApproveLeave: true, canManagePayroll: true, canCreateProject: true,
    canDeleteProject: false, canCreateGoal: true, canCreateAnnouncement: true,
    isReadOnly: false,
  },
  employee: {
    canCreateEmployee: false, canEditEmployee: false, canDeleteEmployee: false,
    canManageRoles: false, canManageSettings: false, canExport: true,
    canApproveLeave: false, canManagePayroll: false, canCreateProject: false,
    canDeleteProject: false, canCreateGoal: true, canCreateAnnouncement: false,
    isReadOnly: false,
  },
};

export function usePermissions(): Permissions & { loading: boolean } {
  const { user, isGuest } = useAuth();
  const [role, setRole] = useState<AppRole>("employee");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest || !user) {
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (data) setRole(data.role as AppRole);
      setLoading(false);
    };
    fetchRole();
  }, [user, isGuest]);

  if (isGuest) return { ...GUEST_PERMISSIONS, loading: false };

  const perms = ROLE_PERMISSIONS[role];
  return { role, ...perms, loading };
}
