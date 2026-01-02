// app/lib/models/Class.ts
export interface ClassData {
  _id?: string;
  name: string;
  code: string;
  type: 'public' | 'private';
  description?: string;
  subject?: string;
  schedule?: string;
  teacherId: string;
  students: string[];
  inviteLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to generate invite link
export function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/join/${code}`;
}

// Helper function to format class data for response
export function formatClassResponse(classData: any): ClassData {
  return {
    _id: classData._id?.toString(),
    name: classData.name,
    code: classData.code,
    type: classData.type,
    description: classData.description || '',
    subject: classData.subject || '',
    schedule: classData.schedule || '',
    teacherId: classData.teacherId?.toString() || classData.teacherId,
    students: classData.students || [],
    inviteLink: classData.inviteLink || generateInviteLink(classData.code),
    createdAt: classData.createdAt || new Date(),
    updatedAt: classData.updatedAt || new Date(),
  };
}

// Helper function to format class for list view
export function formatClassForList(classData: any) {
  const formatted = formatClassResponse(classData);
  return {
    ...formatted,
    students: classData.students ? classData.students.length : 0
  };
}