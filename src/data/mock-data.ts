export interface Studio {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  description: string;
  website?: string;
  phone: string;
  email: string;
  amenities: {
    parking: boolean;
    shower: boolean;
    changingRoom: boolean;
    equipmentRental: boolean;
  };
  rating: number;
  reviewCount: number;
  businessId: string;
  /** ISO date — за сортиране „най-нови първи“ в админ преглед */
  createdAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  photo: string;
  bio: string;
  yogaStyle: string[];
  experienceLevel: string;
  studioId: string;
  rating: number;
}

export interface YogaClass {
  id: string;
  name: string;
  instructorId: string;
  studioId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  enrolled: number;
  price: number;
  yogaType: string;
  difficulty: 'начинаещ' | 'среден' | 'напреднал';
  cancellationPolicy: string;
  waitingList: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetId: string;
  targetType: 'studio' | 'instructor' | 'class';
  rating: number;
  text: string;
  date: string;
}

export interface RecentEnrollment {
  id: string;
  userName: string;
  className: string;
  studioName: string;
  enrolledAt: string;
}

export const WEEKDAYS = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'] as const;
export type Weekday = typeof WEEKDAYS[number];

export interface ScheduleEntry {
  id: string;
  studioId: string;
  className: string;
  instructorId: string;
  yogaType: string;
  difficulty: 'начинаещ' | 'среден' | 'напреднал';
  day: Weekday;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  price: number;
  isRecurring: boolean; // true = weekly recurring
}

export interface StudioSubscription {
  studioId: string;
  hasMonthlySubscription: boolean;
  monthlyPrice?: number;
  subscriptionNote?: string;
}

export const YOGA_TYPES = [
  'Хатха', 'Виняса', 'Ин', 'Аштанга', 'Бикрам', 'Кундалини',
  'Ресторативна', 'Пауър', 'Пренатална', 'Аеро йога'
];

export const DIFFICULTY_LEVELS = ['начинаещ', 'среден', 'напреднал'] as const;

export const mockStudios: Studio[] = [
  {
    id: 's1',
    name: 'Лотос Йога Студио',
    address: 'ул. Витоша 45, София',
    lat: 42.6977,
    lng: 23.3219,
    images: [],
    description: 'Уютно студио в сърцето на София, предлагащо разнообразие от йога практики за всички нива. Нашата мисия е да създадем пространство за хармония и баланс.',
    website: 'https://lotos-yoga.bg',
    phone: '+359 2 987 6543',
    email: 'info@lotos-yoga.bg',
    amenities: { parking: true, shower: true, changingRoom: true, equipmentRental: true },
    rating: 4.8,
    reviewCount: 124,
    businessId: 'b1',
    createdAt: '2023-04-12',
  },
  {
    id: 's2',
    name: 'Шанти Йога Център',
    address: 'бул. Цариградско шосе 120, София',
    lat: 42.6700,
    lng: 23.3500,
    images: [],
    description: 'Модерен център за йога и медитация с просторни зали и опитни инструктори. Специализираме се в Аштанга и Виняса йога.',
    phone: '+359 2 456 7890',
    email: 'hello@shanti-yoga.bg',
    amenities: { parking: true, shower: true, changingRoom: true, equipmentRental: false },
    rating: 4.6,
    reviewCount: 89,
    businessId: 'b2',
    createdAt: '2024-01-20',
  },
  {
    id: 's3',
    name: 'Прана Студио',
    address: 'ул. Граф Игнатиев 18, София',
    lat: 42.6930,
    lng: 23.3280,
    images: [],
    description: 'Бутиково студио, специализирано в Ин йога и медитация. Малки групи за персонално внимание.',
    phone: '+359 88 123 4567',
    email: 'prana@studio.bg',
    amenities: { parking: false, shower: false, changingRoom: true, equipmentRental: true },
    rating: 4.9,
    reviewCount: 67,
    businessId: 'b3',
    createdAt: '2024-09-05',
  },
  {
    id: 's4',
    name: 'Асана Фит',
    address: 'ул. Пиротска 52, София',
    lat: 42.6990,
    lng: 23.3100,
    images: [],
    description: 'Енергично студио за Пауър йога и Виняса флоу. Идеално за тези, които търсят физическо предизвикателство.',
    phone: '+359 89 876 5432',
    email: 'info@asana-fit.bg',
    amenities: { parking: false, shower: true, changingRoom: true, equipmentRental: true },
    rating: 4.5,
    reviewCount: 156,
    businessId: 'b1',
    createdAt: '2025-11-18',
  },
];

export const mockInstructors: Instructor[] = [
  {
    id: 'i1', name: 'Мария Иванова', photo: '', bio: '15 години опит в Хатха и Виняса йога. Сертифицирана RYT-500.',
    yogaStyle: ['Хатха', 'Виняса'], experienceLevel: 'Експерт', studioId: 's1', rating: 4.9,
  },
  {
    id: 'i2', name: 'Георги Петров', photo: '', bio: 'Специалист по Аштанга йога с 10 години опит. Обучавал се в Индия.',
    yogaStyle: ['Аштанга', 'Пауър'], experienceLevel: 'Напреднал', studioId: 's2', rating: 4.7,
  },
  {
    id: 'i3', name: 'Елена Димитрова', photo: '', bio: 'Учител по Ин йога и медитация. Фокусира се върху релаксация и възстановяване.',
    yogaStyle: ['Ин', 'Ресторативна'], experienceLevel: 'Експерт', studioId: 's3', rating: 4.8,
  },
  {
    id: 'i4', name: 'Николай Стоянов', photo: '', bio: 'Младият и динамичен инструктор специализиран в Пауър и Аеро йога.',
    yogaStyle: ['Пауър', 'Аеро йога'], experienceLevel: 'Среден', studioId: 's4', rating: 4.6,
  },
];

export const mockClasses: YogaClass[] = [
  {
    id: 'c1', name: 'Сутрешна Хатха', instructorId: 'i1', studioId: 's1',
    date: '2026-02-16', startTime: '07:00', endTime: '08:30',
    maxCapacity: 20, enrolled: 15, price: 25, yogaType: 'Хатха',
    difficulty: 'начинаещ', cancellationPolicy: 'До 2 часа преди клас', waitingList: [],
  },
  {
    id: 'c2', name: 'Виняса Флоу', instructorId: 'i1', studioId: 's1',
    date: '2026-02-16', startTime: '10:00', endTime: '11:30',
    maxCapacity: 18, enrolled: 18, price: 30, yogaType: 'Виняса',
    difficulty: 'среден', cancellationPolicy: 'До 4 часа преди клас', waitingList: ['u1'],
  },
  {
    id: 'c3', name: 'Аштанга Първична серия', instructorId: 'i2', studioId: 's2',
    date: '2026-02-17', startTime: '06:30', endTime: '08:00',
    maxCapacity: 15, enrolled: 12, price: 35, yogaType: 'Аштанга',
    difficulty: 'напреднал', cancellationPolicy: 'До 6 часа преди клас', waitingList: [],
  },
  {
    id: 'c4', name: 'Вечерна Ин Йога', instructorId: 'i3', studioId: 's3',
    date: '2026-02-16', startTime: '19:00', endTime: '20:30',
    maxCapacity: 12, enrolled: 8, price: 28, yogaType: 'Ин',
    difficulty: 'начинаещ', cancellationPolicy: 'До 2 часа преди клас', waitingList: [],
  },
  {
    id: 'c5', name: 'Пауър Йога', instructorId: 'i4', studioId: 's4',
    date: '2026-02-17', startTime: '18:00', endTime: '19:30',
    maxCapacity: 22, enrolled: 20, price: 30, yogaType: 'Пауър',
    difficulty: 'напреднал', cancellationPolicy: 'До 3 часа преди клас', waitingList: [],
  },
];

export const mockReviews: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'Анна К.', targetId: 's1', targetType: 'studio', rating: 5, text: 'Прекрасно студио с невероятна атмосфера!', date: '2026-02-10' },
  { id: 'r2', userId: 'u2', userName: 'Петър Д.', targetId: 's1', targetType: 'studio', rating: 4, text: 'Много добри инструктори, удобна локация.', date: '2026-02-08' },
  { id: 'r3', userId: 'u3', userName: 'Ива М.', targetId: 'i1', targetType: 'instructor', rating: 5, text: 'Мария е невероятен учител! Препоръчвам горещо.', date: '2026-02-05' },
  { id: 'r4', userId: 'u4', userName: 'Даниел С.', targetId: 's2', targetType: 'studio', rating: 5, text: 'Отлични занятия по Аштанга, чисти съблекални.', date: '2026-02-12' },
  { id: 'r5', userId: 'u5', userName: 'Елена В.', targetId: 's4', targetType: 'studio', rating: 4, text: 'Динамични класове, понякога е претъпкано.', date: '2026-02-11' },
];

export const mockRecentEnrollments: RecentEnrollment[] = [
  { id: 'en1', userName: 'Кристина П.', className: 'Виняса Флоу', studioName: 'Лотос Йога Студио', enrolledAt: '2026-02-14T09:15:00' },
  { id: 'en2', userName: 'Виктор Н.', className: 'Пауър Йога', studioName: 'Асана Фит', enrolledAt: '2026-02-13T16:40:00' },
  { id: 'en3', userName: 'Стефани Р.', className: 'Вечерна Ин Йога', studioName: 'Прана Студио', enrolledAt: '2026-02-13T11:05:00' },
  { id: 'en4', userName: 'Мартин Т.', className: 'Аштанга Първична серия', studioName: 'Шанти Йога Център', enrolledAt: '2026-02-12T07:20:00' },
  { id: 'en5', userName: 'Гергана Л.', className: 'Сутрешна Хатха', studioName: 'Лотос Йога Студио', enrolledAt: '2026-02-11T06:50:00' },
  { id: 'en6', userName: 'Алекс Й.', className: 'Аеро Йога', studioName: 'Асана Фит', enrolledAt: '2026-02-10T17:30:00' },
];

export const mockSchedule: ScheduleEntry[] = [
  // Studio s1 - Лотос Йога Студио
  { id: 'sch1', studioId: 's1', className: 'Сутрешна Хатха', instructorId: 'i1', yogaType: 'Хатха', difficulty: 'начинаещ', day: 'Понеделник', startTime: '07:00', endTime: '08:30', maxCapacity: 20, price: 25, isRecurring: true },
  { id: 'sch2', studioId: 's1', className: 'Виняса Флоу', instructorId: 'i1', yogaType: 'Виняса', difficulty: 'среден', day: 'Понеделник', startTime: '10:00', endTime: '11:30', maxCapacity: 18, price: 30, isRecurring: true },
  { id: 'sch3', studioId: 's1', className: 'Сутрешна Хатха', instructorId: 'i1', yogaType: 'Хатха', difficulty: 'начинаещ', day: 'Сряда', startTime: '07:00', endTime: '08:30', maxCapacity: 20, price: 25, isRecurring: true },
  { id: 'sch4', studioId: 's1', className: 'Виняса Флоу', instructorId: 'i1', yogaType: 'Виняса', difficulty: 'среден', day: 'Сряда', startTime: '18:00', endTime: '19:30', maxCapacity: 18, price: 30, isRecurring: true },
  { id: 'sch5', studioId: 's1', className: 'Ин Йога Релакс', instructorId: 'i1', yogaType: 'Ин', difficulty: 'начинаещ', day: 'Петък', startTime: '19:00', endTime: '20:30', maxCapacity: 15, price: 28, isRecurring: true },
  { id: 'sch6', studioId: 's1', className: 'Уикенд Виняса', instructorId: 'i1', yogaType: 'Виняса', difficulty: 'среден', day: 'Събота', startTime: '09:00', endTime: '10:30', maxCapacity: 20, price: 30, isRecurring: true },

  // Studio s2 - Шанти Йога Център
  { id: 'sch7', studioId: 's2', className: 'Аштанга Първична серия', instructorId: 'i2', yogaType: 'Аштанга', difficulty: 'напреднал', day: 'Вторник', startTime: '06:30', endTime: '08:00', maxCapacity: 15, price: 35, isRecurring: true },
  { id: 'sch8', studioId: 's2', className: 'Пауър Йога', instructorId: 'i2', yogaType: 'Пауър', difficulty: 'напреднал', day: 'Четвъртък', startTime: '06:30', endTime: '08:00', maxCapacity: 15, price: 35, isRecurring: true },
  { id: 'sch9', studioId: 's2', className: 'Аштанга за начинаещи', instructorId: 'i2', yogaType: 'Аштанга', difficulty: 'начинаещ', day: 'Събота', startTime: '10:00', endTime: '11:30', maxCapacity: 12, price: 30, isRecurring: true },

  // Studio s3 - Прана Студио
  { id: 'sch10', studioId: 's3', className: 'Вечерна Ин Йога', instructorId: 'i3', yogaType: 'Ин', difficulty: 'начинаещ', day: 'Понеделник', startTime: '19:00', endTime: '20:30', maxCapacity: 12, price: 28, isRecurring: true },
  { id: 'sch11', studioId: 's3', className: 'Ресторативна Йога', instructorId: 'i3', yogaType: 'Ресторативна', difficulty: 'начинаещ', day: 'Сряда', startTime: '19:00', endTime: '20:30', maxCapacity: 10, price: 28, isRecurring: true },
  { id: 'sch12', studioId: 's3', className: 'Медитация и Ин', instructorId: 'i3', yogaType: 'Ин', difficulty: 'среден', day: 'Петък', startTime: '18:00', endTime: '19:30', maxCapacity: 12, price: 30, isRecurring: true },

  // Studio s4 - Асана Фит
  { id: 'sch13', studioId: 's4', className: 'Пауър Йога', instructorId: 'i4', yogaType: 'Пауър', difficulty: 'напреднал', day: 'Вторник', startTime: '18:00', endTime: '19:30', maxCapacity: 22, price: 30, isRecurring: true },
  { id: 'sch14', studioId: 's4', className: 'Аеро Йога', instructorId: 'i4', yogaType: 'Аеро йога', difficulty: 'среден', day: 'Четвъртък', startTime: '18:00', endTime: '19:30', maxCapacity: 10, price: 40, isRecurring: true },
  { id: 'sch15', studioId: 's4', className: 'Пауър Уикенд', instructorId: 'i4', yogaType: 'Пауър', difficulty: 'напреднал', day: 'Неделя', startTime: '10:00', endTime: '11:30', maxCapacity: 22, price: 30, isRecurring: true },
];

export const mockSubscriptions: StudioSubscription[] = [
  { studioId: 's1', hasMonthlySubscription: true, monthlyPrice: 120, subscriptionNote: '8 посещения месечно, всеки клас' },
  { studioId: 's2', hasMonthlySubscription: true, monthlyPrice: 150, subscriptionNote: 'Неограничени посещения' },
  { studioId: 's3', hasMonthlySubscription: false },
  { studioId: 's4', hasMonthlySubscription: true, monthlyPrice: 140, subscriptionNote: '10 посещения, Пауър и Аеро йога' },
];
