export type YogaTypeCategoryId =
  | 'spiritualPaths'
  | 'traditionalPhysical'
  | 'relaxingTherapeutic'
  | 'modernSpecialized'
  | 'soundMindTechniques';

export type YogaTypeCatalogEntry = {
  name: string;
  description: string;
  category: YogaTypeCategoryId;
};

export const YOGA_TYPE_CATEGORY_ORDER: { id: YogaTypeCategoryId; label: string }[] = [
  {
    id: 'spiritualPaths',
    label: 'Четирите класически пътя на йога (Духовни направления)',
  },
  {
    id: 'traditionalPhysical',
    label: 'Традиционни физически и енергийни системи',
  },
  {
    id: 'relaxingTherapeutic',
    label: 'Релаксиращи и терапевтични практики',
  },
  {
    id: 'modernSpecialized',
    label: 'Съвременни и специализирани стилове',
  },
  {
    id: 'soundMindTechniques',
    label: 'Звук, ум и специфични техники',
  },
];

export const YOGA_TYPES: YogaTypeCatalogEntry[] = [
  {
    name: 'Карма йога',
    description: 'Йога на действието и безкористната служба в полза на другите.',
    category: 'spiritualPaths',
  },
  {
    name: 'Бхакти йога',
    description: 'Йога на предаността и любовта към божественото.',
    category: 'spiritualPaths',
  },
  {
    name: 'Джнана йога',
    description: 'Йога на знанието и мъдростта, постигнати чрез себепознание и самонаблюдение.',
    category: 'spiritualPaths',
  },
  {
    name: 'Раджа йога',
    description: '„Кралската йога“, фокусирана основно върху медитацията и контрола на ума.',
    category: 'spiritualPaths',
  },
  {
    name: 'Хата йога',
    description:
      'Класическа форма на йога, фокусирана върху физически пози (асани) и дишане (пранаяма).',
    category: 'traditionalPhysical',
  },
  {
    name: 'Ащанга йога',
    description: 'Интензивна и структурирана практика, следваща специфична последователност от пози.',
    category: 'traditionalPhysical',
  },
  {
    name: 'Виняса йога',
    description: 'Динамичен стил, при който движенията са плавно свързани и синхронизирани с дишането.',
    category: 'traditionalPhysical',
  },
  {
    name: 'Кундалини йога',
    description:
      'Фокусира се върху освобождаването на енергията в основата на гръбначния стълб чрез песнопения, дишане и пози.',
    category: 'traditionalPhysical',
  },
  {
    name: 'Айенгар йога',
    description:
      'Набляга на прецизното подреждане на тялото, често използвайки помощни средства като блокчета и колани.',
    category: 'traditionalPhysical',
  },
  {
    name: 'Крия йога',
    description:
      'Древна духовна система за ускорено развитие чрез специфични дихателни техники, контрол на жизнената енергия и дълбока медитация.',
    category: 'traditionalPhysical',
  },
  {
    name: 'Шивананда йога',
    description:
      'Класическа система, базирана на пет принципа: правилни упражнения, правилно дишане, правилна релаксация, правилна диета и позитивно мислене с медитация.',
    category: 'traditionalPhysical',
  },
  {
    name: 'Тантра йога',
    description:
      'Фокусира се върху разширяването на съзнанието и събуждането на енергиите в тялото чрез мантри, янтри, ритуали и работа с чакрите (често погрешно свързвана единствено със сексуалността).',
    category: 'traditionalPhysical',
  },
  {
    name: 'Ин йога',
    description: 'Бавна и релаксираща практика, насочена към дълбоките съединителни тъкани и фасциите.',
    category: 'relaxingTherapeutic',
  },
  {
    name: 'Нидра йога',
    description: 'Известна като „йогийски сън“, това е практика за дълбока релаксация и медитация.',
    category: 'relaxingTherapeutic',
  },
  {
    name: 'Ресторативна (Възстановителна) йога',
    description:
      'Практика за дълбоко отпускане на нервната система, при която позите се задържат дълго време с помощта на много подпори (одеяла, блокчета, възглавници).',
    category: 'relaxingTherapeutic',
  },
  {
    name: 'Винийога',
    description:
      'Терапевтичен и силно индивидуализиран подход, при който практиката се адаптира според специфичните нужди, възраст и здравословно състояние на всеки човек.',
    category: 'relaxingTherapeutic',
  },
  {
    name: 'Бикрам йога',
    description: 'Практикува се в гореща стая и се състои от специфична серия от 26 пози.',
    category: 'modernSpecialized',
  },
  {
    name: 'Гореща йога (Хот йога)',
    description:
      'Практикува се в затоплена стая (подобно на Бикрам), но не е ограничена до строга последователност и често включва динамични виняса движения.',
    category: 'modernSpecialized',
  },
  {
    name: 'Силова йога (Пауър йога)',
    description:
      'Интензивен фитнес-базиран подход към виняса йога, който се фокусира върху изграждането на сила, издръжливост и мускулен тонус.',
    category: 'modernSpecialized',
  },
  {
    name: 'Акро йога',
    description:
      'Динамична практика, която съчетава йога, акробатика и елементи от тайландския масаж, изпълнявана най-често по двойки.',
    category: 'modernSpecialized',
  },
  {
    name: 'Въздушна йога',
    description:
      'Използва хамак, окачен на тавана, за изпълнение на пози, които подпомагат разтягането и декомпресията.',
    category: 'modernSpecialized',
  },
  {
    name: 'Дживамукти йога',
    description:
      'Метод, който съчетава енергична физическа практика с духовни учения и етичен начин на живот.',
    category: 'modernSpecialized',
  },
  {
    name: 'Анусара йога',
    description:
      'Съвременна форма на хата йога, която набляга на универсалните принципи за физическо подравняване и философията за „отваряне на сърцето“.',
    category: 'modernSpecialized',
  },
  {
    name: 'Пренатална йога',
    description: 'Специално адаптирана практика за бременни жени.',
    category: 'modernSpecialized',
  },
  {
    name: 'Детска йога (Йога за деца)',
    description:
      'Игрива и забавна форма на йога, помагаща за подобряване на координацията, гъвкавостта и концентрацията при децата.',
    category: 'modernSpecialized',
  },
  {
    name: 'Мантра йога',
    description:
      'Практика на повтаряне на свещени звуци или фрази (мантри) с цел успокояване на ума и постигане на духовно извисяване.',
    category: 'soundMindTechniques',
  },
  {
    name: 'Нада йога',
    description:
      '„Йога на звука“ – древна практика, която използва фокусирано слушане на външни и вътрешни звукови честоти за постигане на дълбоко медитативно състояние.',
    category: 'soundMindTechniques',
  },
  {
    name: 'Йога на смеха (Хася йога)',
    description:
      'Уникална концепция, съчетаваща продължителен доброволен смях с йогийско дишане, за да се намали стресът и да се подобри настроението.',
    category: 'soundMindTechniques',
  },
  {
    name: 'Йога за лице',
    description:
      'Серия от специфични упражнения и масажни техники за мускулите на лицето и шията, целящи тонизиране, стягане и релаксация.',
    category: 'soundMindTechniques',
  },
];

export const YOGA_CATALOG_NAME_SET = new Set(YOGA_TYPES.map(t => t.name));
