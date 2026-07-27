export type AdminProgramDirectoryRecord = {
  id: string;
  displayName: string;
  programType: string;
  status: string;
  createdAt: string | null;
};

export type AdminProgramDirectoryLoad = {
  programs: AdminProgramDirectoryRecord[];
  error?: 'unauthenticated' | 'forbidden' | 'unavailable';
};
