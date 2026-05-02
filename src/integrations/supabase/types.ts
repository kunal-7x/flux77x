export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author: string
          author_initials: string | null
          category: string | null
          comments: number | null
          content: string
          created_at: string
          id: string
          likes: number | null
          pinned: boolean | null
          published_at: string | null
          title: string
          views: number | null
        }
        Insert: {
          author: string
          author_initials?: string | null
          category?: string | null
          comments?: number | null
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          pinned?: boolean | null
          published_at?: string | null
          title: string
          views?: number | null
        }
        Update: {
          author?: string
          author_initials?: string | null
          category?: string | null
          comments?: number | null
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          pinned?: boolean | null
          published_at?: string | null
          title?: string
          views?: number | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          hours_worked: number | null
          id: string
          location: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          email: string | null
          id: string
          job_id: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          resume_url: string | null
          stage: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          job_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          job_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          auto_punch_out: boolean | null
          company_name: string | null
          fiscal_year: string | null
          gps_tracking: boolean | null
          id: string
          industry: string | null
          overtime_approval: boolean | null
          remote_checkin: boolean | null
          timezone: string | null
          updated_at: string
          work_hours_end: string | null
          work_hours_start: string | null
        }
        Insert: {
          auto_punch_out?: boolean | null
          company_name?: string | null
          fiscal_year?: string | null
          gps_tracking?: boolean | null
          id?: string
          industry?: string | null
          overtime_approval?: boolean | null
          remote_checkin?: boolean | null
          timezone?: string | null
          updated_at?: string
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Update: {
          auto_punch_out?: boolean | null
          company_name?: string | null
          fiscal_year?: string | null
          gps_tracking?: boolean | null
          id?: string
          industry?: string | null
          overtime_approval?: boolean | null
          remote_checkin?: boolean | null
          timezone?: string | null
          updated_at?: string
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_assets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder: string | null
          id: string
          name: string
          tags: string[] | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder?: string | null
          id?: string
          name: string
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          avatar: string | null
          avg_work_time: number | null
          bank_account_encrypted: string | null
          bonus: number | null
          certifications: string[] | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          employee_id: string | null
          external_work: number | null
          first_name: string
          id: string
          internal_work: number | null
          join_date: string | null
          last_name: string
          learning_progress: number | null
          level: string | null
          manager: string | null
          nationality: string | null
          performance_score: number | null
          phone: string | null
          role: string | null
          salary: number | null
          skills: string[] | null
          status: string | null
          tasks_in_progress: number | null
          updated_at: string
          user_id: string | null
          vacation_days: number | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          avg_work_time?: number | null
          bank_account_encrypted?: string | null
          bonus?: number | null
          certifications?: string[] | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          employee_id?: string | null
          external_work?: number | null
          first_name: string
          id?: string
          internal_work?: number | null
          join_date?: string | null
          last_name: string
          learning_progress?: number | null
          level?: string | null
          manager?: string | null
          nationality?: string | null
          performance_score?: number | null
          phone?: string | null
          role?: string | null
          salary?: number | null
          skills?: string[] | null
          status?: string | null
          tasks_in_progress?: number | null
          updated_at?: string
          user_id?: string | null
          vacation_days?: number | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          avg_work_time?: number | null
          bank_account_encrypted?: string | null
          bonus?: number | null
          certifications?: string[] | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          employee_id?: string | null
          external_work?: number | null
          first_name?: string
          id?: string
          internal_work?: number | null
          join_date?: string | null
          last_name?: string
          learning_progress?: number | null
          level?: string | null
          manager?: string | null
          nationality?: string | null
          performance_score?: number | null
          phone?: string | null
          role?: string | null
          salary?: number | null
          skills?: string[] | null
          status?: string | null
          tasks_in_progress?: number | null
          updated_at?: string
          user_id?: string | null
          vacation_days?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          key_results: string[] | null
          progress: number | null
          quarter: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          key_results?: string[] | null
          progress?: number | null
          quarter?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          key_results?: string[] | null
          progress?: number | null
          quarter?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string
          decision: string | null
          feedback: string | null
          id: string
          interview_type: string | null
          interviewer: string | null
          rating: number | null
          scheduled_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          decision?: string | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer?: string | null
          rating?: number | null
          scheduled_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          decision?: string | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer?: string | null
          rating?: number | null
          scheduled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          department: string | null
          description: string | null
          employment_type: string | null
          id: string
          location: string | null
          posted_at: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          posted_at?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          posted_at?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          document_url: string | null
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          document_url?: string | null
          employee_id: string
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          document_url?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          created_at: string
          department: string | null
          id: string
          name: string
          tasks: Json
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          name: string
          tasks?: Json
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          name?: string
          tasks?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assignee: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          priority: string | null
          project_id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          progress: number | null
          status: string | null
          tasks_completed: number | null
          tasks_total: number | null
          team: string[] | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          progress?: number | null
          status?: string | null
          tasks_completed?: number | null
          tasks_total?: number | null
          team?: string[] | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          progress?: number | null
          status?: string | null
          tasks_completed?: number | null
          tasks_total?: number | null
          team?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr_manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hr_manager", "employee"],
    },
  },
} as const
