export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  email: string;
  level: string;
  manager: string;
  city: string;
  salary: number;
  bonus: number;
  performanceScore: number;
  vacationDays: number;
  tasksInProgress: number;
  externalWork: number;
  internalWork: number;
  learningProgress: number;
  avgWorkTime: number;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  joinDate?: string;
  employeeId?: string;
  status?: "active" | "on-leave" | "inactive";
}

export const departments = [
  { name: "Managers", count: 3, expanded: false },
  { name: "Designers", count: 5, expanded: true },
  { name: "Testers", count: 2, expanded: true },
  { name: "Developers", count: 12, expanded: false },
];

export const employees: Employee[] = [
  {
    id: "1", firstName: "Henry", lastName: "Carter", role: "UX/UI Designer", department: "Designers",
    avatar: "", phone: "(718) 302-1546", email: "carter@gmail.com", level: "Senior",
    manager: "Ava Collins", city: "New York", salary: 4500, bonus: 750,
    performanceScore: 72, vacationDays: 18, tasksInProgress: 6,
    externalWork: 58, internalWork: 82, learningProgress: 52, avgWorkTime: 7.2,
    dateOfBirth: "1992-03-15", nationality: "American", address: "742 Evergreen Terrace, NY",
    emergencyContact: "Laura Carter", emergencyPhone: "(718) 555-0199", joinDate: "2021-06-01", employeeId: "EMP-001", status: "active",
  },
  {
    id: "2", firstName: "Ava", lastName: "Collins", role: "Mobile Designer", department: "Designers",
    avatar: "", phone: "(212) 555-0147", email: "ava.c@gmail.com", level: "Lead",
    manager: "Sarah Kim", city: "San Francisco", salary: 5200, bonus: 900,
    performanceScore: 85, vacationDays: 14, tasksInProgress: 4,
    externalWork: 45, internalWork: 90, learningProgress: 68, avgWorkTime: 7.8,
    dateOfBirth: "1990-07-22", nationality: "American", address: "123 Mission St, SF",
    emergencyContact: "Mark Collins", emergencyPhone: "(212) 555-0188", joinDate: "2020-01-15", employeeId: "EMP-002", status: "active",
  },
  {
    id: "3", firstName: "Ethan", lastName: "Brooks", role: "UX/UI Designer", department: "Designers",
    avatar: "", phone: "(415) 555-0198", email: "ethan.b@gmail.com", level: "Mid",
    manager: "Ava Collins", city: "Austin", salary: 3800, bonus: 500,
    performanceScore: 68, vacationDays: 20, tasksInProgress: 8,
    externalWork: 62, internalWork: 75, learningProgress: 45, avgWorkTime: 7.0,
    dateOfBirth: "1995-11-08", nationality: "American", address: "456 Congress Ave, Austin",
    emergencyContact: "Lisa Brooks", emergencyPhone: "(415) 555-0177", joinDate: "2022-03-10", employeeId: "EMP-003", status: "active",
  },
  {
    id: "4", firstName: "Emma", lastName: "Harper", role: "Graphic Designer", department: "Designers",
    avatar: "", phone: "(323) 555-0156", email: "emma.h@gmail.com", level: "Junior",
    manager: "Ava Collins", city: "Los Angeles", salary: 3200, bonus: 400,
    performanceScore: 74, vacationDays: 22, tasksInProgress: 3,
    externalWork: 70, internalWork: 65, learningProgress: 78, avgWorkTime: 6.5,
    dateOfBirth: "1997-05-30", nationality: "Canadian", address: "789 Sunset Blvd, LA",
    emergencyContact: "John Harper", emergencyPhone: "(323) 555-0166", joinDate: "2023-01-20", employeeId: "EMP-004", status: "on-leave",
  },
  {
    id: "5", firstName: "Lucas", lastName: "Parker", role: "UX/UI Designer", department: "Designers",
    avatar: "", phone: "(646) 555-0123", email: "lucas.p@gmail.com", level: "Senior",
    manager: "Ava Collins", city: "Chicago", salary: 4800, bonus: 650,
    performanceScore: 79, vacationDays: 16, tasksInProgress: 5,
    externalWork: 55, internalWork: 88, learningProgress: 60, avgWorkTime: 7.5,
    dateOfBirth: "1991-09-12", nationality: "American", address: "321 Michigan Ave, Chicago",
    emergencyContact: "Nancy Parker", emergencyPhone: "(646) 555-0133", joinDate: "2021-09-05", employeeId: "EMP-005", status: "active",
  },
  {
    id: "6", firstName: "Esther", lastName: "Howard", role: "UX/UI Designer", department: "Designers",
    avatar: "", phone: "(917) 555-0134", email: "esther.h@gmail.com", level: "Mid",
    manager: "Ava Collins", city: "Seattle", salary: 4100, bonus: 550,
    performanceScore: 71, vacationDays: 19, tasksInProgress: 7,
    externalWork: 48, internalWork: 80, learningProgress: 55, avgWorkTime: 7.1,
    dateOfBirth: "1993-12-25", nationality: "American", address: "654 Pine St, Seattle",
    emergencyContact: "David Howard", emergencyPhone: "(917) 555-0144", joinDate: "2022-07-01", employeeId: "EMP-006", status: "active",
  },
  {
    id: "7", firstName: "Oliver", lastName: "Reed", role: "Manual Tester", department: "Testers",
    avatar: "", phone: "(312) 555-0167", email: "oliver.r@gmail.com", level: "Senior",
    manager: "Sarah Kim", city: "Boston", salary: 3900, bonus: 500,
    performanceScore: 76, vacationDays: 15, tasksInProgress: 9,
    externalWork: 40, internalWork: 85, learningProgress: 42, avgWorkTime: 7.4,
    dateOfBirth: "1994-01-18", nationality: "British", address: "987 Beacon St, Boston",
    emergencyContact: "Sophie Reed", emergencyPhone: "(312) 555-0177", joinDate: "2020-11-15", employeeId: "EMP-007", status: "active",
  },
  {
    id: "8", firstName: "James", lastName: "Sullivan", role: "API Tester", department: "Testers",
    avatar: "", phone: "(202) 555-0189", email: "james.s@gmail.com", level: "Mid",
    manager: "Sarah Kim", city: "Denver", salary: 3600, bonus: 450,
    performanceScore: 69, vacationDays: 21, tasksInProgress: 4,
    externalWork: 52, internalWork: 78, learningProgress: 65, avgWorkTime: 6.8,
    dateOfBirth: "1996-04-05", nationality: "Irish", address: "147 Broadway, Denver",
    emergencyContact: "Kate Sullivan", emergencyPhone: "(202) 555-0199", joinDate: "2023-05-01", employeeId: "EMP-008", status: "inactive",
  },
];

export const navItems = [
  "Dashboard", "Employees", "Attendance", "Requests", "Performance",
  "Payroll", "Projects", "Reports", "Announcements", "Recruitment",
  "Onboarding", "Documents", "Settings"
] as const;
export type NavItem = typeof navItems[number];
