import type { Instructor, Studio, YogaClass } from '@/data/mock-data';

export function deriveDashboardMetrics(
  myStudios: Studio[],
  myClasses: YogaClass[],
  myInstructors: Instructor[],
) {
  const totalEnrolled = myClasses.reduce((sum, c) => sum + c.enrolled, 0);
  const totalCapacity = myClasses.reduce((sum, c) => sum + c.maxCapacity, 0);
  const avgRating = myStudios.length
    ? (myStudios.reduce((s, st) => s + st.rating, 0) / myStudios.length).toFixed(1)
    : '0';
  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const revenue = myClasses.reduce((sum, c) => sum + c.enrolled * c.price, 0);

  return {
    myStudios,
    myClasses,
    myInstructors,
    totalEnrolled,
    totalCapacity,
    avgRating,
    occupancyRate,
    revenue,
  };
}
