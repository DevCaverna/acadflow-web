import type { StudentGrades } from '@/features/grades/schemas/grade.schema';

export function getClassAverage(students: Array<Pick<StudentGrades, 'average'>>): number | null {
  const averages = students.flatMap(({ average }) => (average === null ? [] : [average]));
  if (averages.length === 0) return null;
  return averages.reduce((total, average) => total + average, 0) / averages.length;
}
