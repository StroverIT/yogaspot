export interface AttendedClass {
  classId: string;
  attendedDate: string;
}

export const mockAttendedClasses: AttendedClass[] = [
  { classId: 'c1', attendedDate: '2026-02-14' },
  { classId: 'c3', attendedDate: '2026-02-12' },
  { classId: 'c4', attendedDate: '2026-02-10' },
  { classId: 'c5', attendedDate: '2026-02-08' },
  { classId: 'c2', attendedDate: '2026-02-05' },
];
