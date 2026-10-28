import { Product } from '../types';
import { CabinetOrder } from '../components/OrderCabinetPage';

export interface ConsumableOption {
  value: string; // product id or 'none'
  content: string; // dropdown label
  title: string;
  price: number;
  tag: string;
  note: string;
  image: string;
}

export interface ConsumableStepSpec {
  stepTitle: string;
  categoryLabel: string;
  defaultProductId: string;
  options: ConsumableOption[];
}

export interface CategoryFlowSpec {
  categoryKey: string;
  categoryLabel: string;
  serviceTitle: string;
  productName: string;
  master: {
    name: string;
    initials: string;
    avatar: string;
    rating: number;
    completedOrders: number;
    phone: string;
    specialty: string;
    park: string;
  };
  sitePhotoPrompt: string;
  clientPhoto: string;
  clientPhotoCaption: string;
  photoAnalysisReply: string;
  steps: ConsumableStepSpec[];
  analoguesQuestion: string;
  analoguesReply: string;
  finalReportText: string;
  beforePhoto: string;
  beforeCaption: string;
  afterPhoto: string;
  afterCaption: string;
  orderDefaults: {
    goodsPrice: number;
    servicePrice: number;
    materialDescription: string;
  };
}

// Raw definition for 8 categories using real products from src/data/products.json
export const CATEGORY_FLOW_CONFIGS: Record<string, Omit<CategoryFlowSpec, 'steps'> & {
  rawSteps: {
    stepTitle: string;
    categoryLabel: string;
    defaultProductId: string;
    options: {
      productId: string | 'none';
      content: string;
      tag: string;
      note: string;
      customTitle?: string;
      customPrice?: number;
    }[];
  }[];
}> = {
  santekhnika: {
    categoryKey: 'santekhnika',
    categoryLabel: 'Сантехника',
    serviceTitle: 'Установка смесителя',
    productName: 'Смеситель для ванны Wisent (Хром) WP22153',
    master: {
      name: 'Алексей С.',
      initials: 'АС',
      avatar: '/master.jpeg',
      rating: 4.9,
      completedOrders: 248,
      phone: '+375 (29) 765-43-21',
      specialty: 'Сантехника',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Чтобы не ездить дважды: пришлите, пожалуйста, фото места под раковиной — посмотрю подводку и скажу, что докупить на месте в магазине.',
    clientPhoto: '/master/faucet_process.jpg',
    clientPhotoCaption: 'Подводка и запорные краны 1/2"',
    photoAnalysisReply: 'Спасибо, всё видно. Краны рабочие, а вот старые прокладки задубели, и у раковины нет герметика по краю — вода будет затекать.\n\nДавайте по шагам подберём три позиции: герметик, прокладки и шланг. Я рекомендую оптимальные варианты без переплат:',
    analoguesQuestion: 'А импортное брать имеет смысл? Например, Soudal вместо WUNDER?',
    analoguesReply: 'Для смесителя — нет. Soudal (Бельгия) хорош для сложных швов, но для санитарного шва у раковины WUNDER за 11,32 руб. справляется так же, а стоит вдвое дешевле.\n\nПрокладки берите нашу резину МастерПроф: она толще комплектных и не дубеет. По шлангу ILLU в нержавейке — оптимум, переплачивать за силикон 42 руб. не нужно.',
    finalReportText: 'Готово! Смеситель установил, поставил новые прокладки МастерПроф и прошёл шов герметиком WUNDER. Проверил напор и все соединения — сухо. Фото ниже, проверьте, пожалуйста:',
    beforePhoto: '/master/faucet_process.jpg',
    beforeCaption: 'Было · Подключение подводки',
    afterPhoto: '/master/faucet_done.jpg',
    afterCaption: 'Стало · Проверка напора',
    orderDefaults: {
      goodsPrice: 105.79,
      servicePrice: 25.0,
      materialDescription: 'Wisent WP22153 · Подводка и узел',
    },
    rawSteps: [
      {
        stepTitle: 'Герметик для монтажа',
        categoryLabel: 'Герметик',
        defaultProductId: 'p_1141322',
        options: [
          {
            productId: 'p_1141322',
            content: 'WUNDER санитарный силикон 280мл (11.32 руб.) ★ Рекомендация',
            tag: 'Оптимум · Рекомендация мастера',
            note: 'Санитарный силикон с защитой от плесени — держит отлично без переплат',
          },
          {
            productId: 'p_285063',
            content: 'Soudal Fix All гибридный 290мл (23.38 руб.) · Премиум Бельгия',
            tag: 'Импорт (Бельгия) · Премиум',
            note: 'Премиальный бельгийский гибридный полимер для любых оснований',
          },
          {
            productId: 'none',
            content: 'Не добавлять (есть свой герметик)',
            tag: 'Свой материал',
            note: 'Мастер использует ваш герметик (без добавления в заказ)',
            customTitle: 'Свой герметик',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Прокладки и уплотнители',
        categoryLabel: 'Прокладки',
        defaultProductId: 'p_1151730',
        options: [
          {
            productId: 'p_1151730',
            content: 'МастерПроф резина 10х10см (2 мм) (2.57 руб.) ★ Рекомендация',
            tag: 'Отечественная · Надёжно',
            note: 'Усиленная резина 2 мм взамен тонких комплектных прокладок из коробки',
          },
          {
            productId: 'p_1149420',
            content: 'МастерПроф декоративная чашка + кольцо (8.21 руб.)',
            tag: 'Комплект с отражателем',
            note: 'Хромированный отражатель с эластичным кольцом для монтажа',
          },
          {
            productId: 'none',
            content: 'Не добавлять (штатные прокладки из коробки)',
            tag: 'Из комплекта',
            note: 'Мастер использует штатные прокладки из комплекта смесителя',
            customTitle: 'Штатные прокладки',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Шланг для душа / подводка',
        categoryLabel: 'Шланг',
        defaultProductId: 'p_1522081',
        options: [
          {
            productId: 'p_1522081',
            content: 'Шланг ILLU 150см нерж. сталь (8.14 руб.) ★ Выгодно',
            tag: 'Выгодно · Нержавейка',
            note: 'Двойная оплётка из нержавеющей стали, латунные штуцеры 1/2"',
          },
          {
            productId: 'p_1151028',
            content: 'Шланг 1.5м серия Люкс усиленный (12.69 руб.)',
            tag: 'Усиленный 1.5м',
            note: 'Шланг с защитой от перекручивания (антитвист)',
          },
          {
            productId: 'none',
            content: 'Не добавлять (есть свой шланг)',
            tag: 'Свой материал',
            note: 'Шланг не требуется или уже есть свой',
            customTitle: 'Свой шланг',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  elektrika: {
    categoryKey: 'elektrika',
    categoryLabel: 'Электрика',
    serviceTitle: 'Монтаж люстры или светильника',
    productName: 'Светильник подвесной OMRA 1х60Вт Е27 белый',
    master: {
      name: 'Дмитрий В.',
      initials: 'ДВ',
      avatar: '/master.jpeg',
      rating: 4.95,
      completedOrders: 312,
      phone: '+375 (29) 641-22-33',
      specialty: 'Электрика',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Дмитрий из Парка ОМА, мастер по электрике. Пришлите, пожалуйста, фото вывода проводов на потолке — посмотрю число жил, тип перекрытия и крепление крюка.',
    clientPhoto: '/master/before_after/elektrika_before.jpg',
    clientPhotoCaption: 'Вывод проводов на потолке и выключатель',
    photoAnalysisReply: 'Фото получил! Вывод 3-жильный, есть заземление. Потребуется нарастить длину фазной жилы надёжным кабелем и поставить качественную светодиодную лампу с мягким светом.\n\nСобрал по шагам нужные позиции в гипермаркете ОМА — выберите варианты:',
    analoguesQuestion: 'Стоит ли переплачивать за импортный кабель NYM или наш ВВГ подойдёт?',
    analoguesReply: 'Наш отечественный кабель ВВГ-Пнг(А)-LS полностью соответствует ГОСТ: медная моножила, негорючая оболочка без дыма. Импортный NYM дороже почти вдвое, а по пожарной безопасности в квартире наш ничем не уступает. Лампы ASTRA тоже рекомендую — 3000K дают тёплый уютный свет без мерцания.',
    finalReportText: 'Люстра надёжно смонтирована на анкерный крюк, расключение выполнено через клеммы, фазировка проверена мультиметром. Всё светит ровно, коротких замыканий нет. Прикладываю фото:',
    beforePhoto: '/master/before_after/elektrika_before.jpg',
    beforeCaption: 'Было · Вывод проводки',
    afterPhoto: '/master/before_after/elektrika_after.jpg',
    afterCaption: 'Стало · Смонтированный светильник',
    orderDefaults: {
      goodsPrice: 18.95,
      servicePrice: 32.0,
      materialDescription: 'Светильник OMRA + клеммный узел',
    },
    rawSteps: [
      {
        stepTitle: 'Кабель монтажный ГОСТ',
        categoryLabel: 'Кабель',
        defaultProductId: 'p_1527497',
        options: [
          {
            productId: 'p_1527497',
            content: 'Кабель ВВГ-Пнг(А)-LS 3х1,5 медный (2.77 руб./м) ★ Рекомендация',
            tag: 'ГОСТ · Негорючий',
            note: 'Медная моножила, низкое дымовыделение (LS) — стандарт для освещения',
          },
          {
            productId: 'p_1531468',
            content: 'Шнур гибкий ШВВП 2х0,75 (1.27 руб./м)',
            tag: 'Гибкий медный',
            note: 'Для коротких соединений внутри чаши светильника',
          },
          {
            productId: 'none',
            content: 'Не добавлять (длины штатного провода хватает)',
            tag: 'Без доплаты',
            note: 'Штатного вывода достаточно для прямого подключения',
            customTitle: 'Штатный провод',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Крепёж и расходники монтажа',
        categoryLabel: 'Крепёж',
        defaultProductId: 'p_364545',
        options: [
          {
            productId: 'p_364545',
            content: 'Сверло по бетону YOURTOOLS 3х60мм (2.17 руб.) ★ В заказ',
            tag: 'Оснастка мастера',
            note: 'Точное сверление без сколов потолочного перекрытия',
          },
          {
            productId: 'p_273069',
            content: 'Сверло HSS-TiN YOURTOOLS набор 3 шт. (3.10 руб.)',
            tag: 'Универсальный набор',
            note: 'Для монтажа планки светильника к металлопрофилю',
          },
          {
            productId: 'none',
            content: 'Не добавлять (крепёж из комплекта)',
            tag: 'Из комплекта',
            note: 'Использовать штатную монтажную планку светильника',
            customTitle: 'Штатный крепёж',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Светодиодная лампа (Е27)',
        categoryLabel: 'Лампа',
        defaultProductId: 'p_975979',
        options: [
          {
            productId: 'p_975979',
            content: 'Лампа LED A60 14Вт E27 3000K тёплая ASTRA (2.49 руб.) ★ Оптимум',
            tag: 'Энергосбережение · Без мерцания',
            note: '14 Вт (эквивалент 110 Вт накаливания), приятный тёплый свет для дома',
          },
          {
            productId: 'p_1056130',
            content: 'Лампа LED Osram Value 7Вт E27 4000K (2.99 руб.) · Премиум',
            tag: 'Бренд Osram (Германия)',
            note: 'Естественный белый нейтральный свет 4000K с гарантией 3 года',
          },
          {
            productId: 'none',
            content: 'Не добавлять (лампы уже куплены)',
            tag: 'Свои лампы',
            note: 'Клиент предоставит свои светодиодные лампы',
            customTitle: 'Свои лампы',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  mebel: {
    categoryKey: 'mebel',
    categoryLabel: 'Сборка мебели',
    serviceTitle: 'Сборка и навеска кухонного гарнитура',
    productName: 'Модульный гарнитур ОМА (шкафы, петли с доводчиками)',
    master: {
      name: 'Игорь М.',
      initials: 'ИМ',
      avatar: '/master.jpeg',
      rating: 4.88,
      completedOrders: 195,
      phone: '+375 (29) 315-88-99',
      specialty: 'Сборка мебели',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Игорь, мастер по сборке мебели. Пришлите, пожалуйста, фото помещения и коробок — оценю угол, перепады стен и розетки под фартук.',
    clientPhoto: '/master/before_after/mebel_before.jpg',
    clientPhotoCaption: 'Помещение кухни и распакованные модули',
    photoAnalysisReply: 'Угол 90° в норме, но стена из гипсокартона на профиле — для навески верхних шкафов обязательно потребуется надёжная монтажная пена и усиленный крепёж, а стыки столешницы у раковины нужно загерметизировать.\n\nДавайте выберем расходники ОМА по шагам:',
    analoguesQuestion: 'Какой герметик брать для выпила под мойку в столешнице?',
    analoguesReply: 'Для торцов ДСП после выпила обязательно берите санитарный силикон WUNDER — он глубоко впитывается в спил и не даёт влаге вспучить столешницу. Пена WUNDER Foam для фиксации фартука и глушения пустот тоже отличная — плотная и не распирает модули.',
    finalReportText: 'Сборка кухни завершена! Все модули стянуты межсекционными стяжками, выставлены по лазерному уровню, выпил под мойку обработан герметиком, петли отрегулированы с плавным закрытием. Фотоотчёт:',
    beforePhoto: '/master/before_after/mebel_before.jpg',
    beforeCaption: 'Было · Распакованные модули',
    afterPhoto: '/master/before_after/mebel_after.jpg',
    afterCaption: 'Стало · Собранный гарнитур с регулировкой',
    orderDefaults: {
      goodsPrice: 380.0,
      servicePrice: 95.0,
      materialDescription: 'Кухонные модули + фурнитура',
    },
    rawSteps: [
      {
        stepTitle: 'Герметизация спилов и стыков ДСП',
        categoryLabel: 'Герметик',
        defaultProductId: 'p_1141322',
        options: [
          {
            productId: 'p_1141322',
            content: 'WUNDER санитарный силикон белый 280мл (11.32 руб.) ★ Защита спилов',
            tag: 'Анти-влага · Защита ДСП',
            note: 'Надёжно герметизирует выпил под мойку и варочную панель от разбухания',
          },
          {
            productId: 'p_285063',
            content: 'Soudal Fix All Flexi гибрид 290мл (23.38 руб.) · Усиленный',
            tag: 'Клей-герметик Премиум',
            note: 'Одновременно склеивает и герметизирует стыки плинтуса и столешницы',
          },
          {
            productId: 'none',
            content: 'Не добавлять (герметик есть дома)',
            tag: 'Свой материал',
            note: 'Использовать герметик заказчика',
            customTitle: 'Свой герметик',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Монтажная пена для пустот и упоров',
        categoryLabel: 'Пена',
        defaultProductId: 'p_303822',
        options: [
          {
            productId: 'p_303822',
            content: 'Пена WUNDER Foam всесезонная 750мл (12.49 руб.) ★ Рекомендация',
            tag: 'Низкое вторичное расширение',
            note: 'Равномерное заполнение без деформации коробов и панелей',
          },
          {
            productId: 'p_285958',
            content: 'Пена пистолетная SOUDAL Окна Двери 750мл (15.93 руб.)',
            tag: 'Профессиональная Бельгия',
            note: 'Высокая звукоизоляция и плотная мелкопористая структура',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Без пены',
            note: 'Монтаж модулей выполняется только на механический крепёж',
            customTitle: 'Без пены',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Сверление и точная разметка',
        categoryLabel: 'Оснастка',
        defaultProductId: 'p_1410048',
        options: [
          {
            productId: 'p_1410048',
            content: 'Рулетка Halk 10м ширина 25мм (10.18 руб.) ★ Для разметки',
            tag: 'Широкое полотно · Магнит',
            note: 'Не прогибается при разметке длинных секций и навесных шкафов',
          },
          {
            productId: 'p_1482673',
            content: 'Рулетка Werker 7,5м прорезиненная (13.99 руб.)',
            tag: 'Ударопрочный корпус',
            note: 'Плавный стопор и высокая чёткость миллиметровой шкалы',
          },
          {
            productId: 'none',
            content: 'Не добавлять',
            tag: 'Инструмент мастера',
            note: 'Мастер использует собственный измерительный инструмент',
            customTitle: 'Свой инструмент',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  otdelka: {
    categoryKey: 'otdelka',
    categoryLabel: 'Отделка',
    serviceTitle: 'Укладка ламината с подложкой',
    productName: 'Ламинат Tarkett / Expert Choice 33 класс (Дуб)',
    master: {
      name: 'Сергей К.',
      initials: 'СК',
      avatar: '/master.jpeg',
      rating: 4.92,
      completedOrders: 274,
      phone: '+375 (29) 555-12-80',
      specialty: 'Отделочные работы',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Сергей из Парка ОМА, мастер по укладке напольных покрытий. Пришлите, пожалуйста, фото стяжки — оценю ровность пола, пороги и радиаторные трубы.',
    clientPhoto: '/master/before_after/otdelka_before.jpg',
    clientPhotoCaption: 'Подготовленная стяжка пола в комнате',
    photoAnalysisReply: 'Стяжка хорошая, сухая. Чтобы замки ламината не скрипели и не расходились, обязательно нужна демпферная подложка толщиной 3 мм и обеспыливающая грунтовка глубокого проникновения.\n\nПо шагам подберём необходимые материалы в ОМА:',
    analoguesQuestion: 'Какую подложку лучше брать: листовую или рулонную?',
    analoguesReply: 'Для бетонного пола в квартире однозначно рекомендую листовую подложку GRACE 3 мм из экструдированного полистирола: она держит геометрию замков и не проминается под тяжёлой мебелью в отличие от дешёвого вспененного полиэтилена. Грунтовку берём WUNDER — она связывает пыль намертво.',
    finalReportText: 'Укладка ламината завершена! Основание обеспылено, уложена листовая подложка с проклейкой стыков, оставлены технологические зазоры у стен 10 мм. Пол ровный, замки защёлкнуты без зазоров. Фотоотчёт:',
    beforePhoto: '/master/before_after/otdelka_before.jpg',
    beforeCaption: 'Было · Бетонная стяжка',
    afterPhoto: '/master/before_after/otdelka_after.jpg',
    afterCaption: 'Стало · Уложенный ламинат 33 класс',
    orderDefaults: {
      goodsPrice: 240.0,
      servicePrice: 80.0,
      materialDescription: 'Ламинат 33 класс + подложка',
    },
    rawSteps: [
      {
        stepTitle: 'Подложка под ламинат',
        categoryLabel: 'Подложка',
        defaultProductId: 'p_1115682',
        options: [
          {
            productId: 'p_1115682',
            content: 'Подложка листовая 3мм GRACE (5 кв.м) (18.85 руб.) ★ Рекомендация',
            tag: 'Экструдированный XPS · Не проминается',
            note: 'Защищает замки ламината от излома, гасит ударный шум до 21 дБ',
          },
          {
            productId: 'p_284556',
            content: 'Подложка ИТЭП 50-2-О 5мм рулон (20.76 руб.)',
            tag: 'Теплоизоляция 5 мм',
            note: 'Для холодных первых этажей с повышенной термоизоляцией',
          },
          {
            productId: 'none',
            content: 'Не добавлять (подложка куплена)',
            tag: 'Своя подложка',
            note: 'Заказчик использует ранее купленную подложку',
            customTitle: 'Своя подложка',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Грунтовка глубокого проникновения',
        categoryLabel: 'Грунтовка',
        defaultProductId: 'p_303756',
        options: [
          {
            productId: 'p_303756',
            content: 'Грунтовка WUNDER 5кг обеспыливающая (15.38 руб.) ★ Оптимум',
            tag: 'Глубокое проникновение · Быстросохнущая',
            note: 'Связывает бетонную пыль стяжки, предотвращает хруст под полом',
          },
          {
            productId: 'p_501312',
            content: 'Грунтовка Ceresit CT17 SuperConcentrate 10л (57.33 руб.) · Премиум',
            tag: 'Профессиональный Ceresit',
            note: 'Усиленная формула для высокопористых и рыхлых оснований',
          },
          {
            productId: 'none',
            content: 'Не требуется (пол уже прогрунтован)',
            tag: 'Пол готов',
            note: 'Основание предварительно обработано грунтом',
            customTitle: 'Пол готов',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Разметка и подрезка',
        categoryLabel: 'Расходники',
        defaultProductId: 'p_1406671',
        options: [
          {
            productId: 'p_1406671',
            content: 'Рулетка стальная Werker геодезическая 30м (14.10 руб.)',
            tag: 'Для длинных коридоров',
            note: 'Контроль диагоналей помещения при диагональной или палубной укладке',
          },
          {
            productId: 'p_364545',
            content: 'Сверло по бетону YOURTOOLS 3х60мм (2.17 руб.)',
            tag: 'Для дюбелей плинтуса',
            note: 'Для чистого сверления отверстий под скрытый крепёж плинтуса',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Без оснастки',
            note: 'Инструмент мастера полностью укомплектован',
            customTitle: 'Без доплаты',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  dveri: {
    categoryKey: 'dveri',
    categoryLabel: 'Двери и окна',
    serviceTitle: 'Установка межкомнатной двери',
    productName: 'Дверное полотно экошпон глухое (Венге / Дуб)',
    master: {
      name: 'Михаил Л.',
      initials: 'МЛ',
      avatar: '/master.jpeg',
      rating: 4.89,
      completedOrders: 164,
      phone: '+375 (29) 701-44-55',
      specialty: 'Двери и окна',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Михаил, мастер по дверям из Парка ОМА. Пришлите, пожалуйста, фото дверного проёма — посмотрю толщину перегородки, четверти и зазоры.',
    clientPhoto: '/master/before_after/dveri_before.jpg',
    clientPhotoCaption: 'Дверной проём и коробка',
    photoAnalysisReply: 'Проём ровный, потребуется профессиональная монтажная пена с малым расширением, чтобы не повело коробку, и акриловый герметик для аккуратного примыкания наличников к обоям.\n\nПо шагам подберём расходные материалы ОМА:',
    analoguesQuestion: 'Какую пену брать, чтобы дверную коробку не сдавило?',
    analoguesReply: 'Обязательно пистолетную пену SOUDAL или WUNDER Foam — у них низкое вторичное расширение и плотная структура. Бытовую пену с трубочкой брать категорически нельзя — она распирает даже выставленные распорки.',
    finalReportText: 'Межкомнатная дверь установлена! Коробка закреплена по уровню, зазор под пену заполнен равномерно, наличники запилены под 45° без сколов, замок закрывается мягко. Фотоотчёт:',
    beforePhoto: '/master/before_after/dveri_before.jpg',
    beforeCaption: 'Было · Подготовленный проём',
    afterPhoto: '/master/before_after/dveri_after.jpg',
    afterCaption: 'Стало · Установленная дверь с наличниками',
    orderDefaults: {
      goodsPrice: 195.0,
      servicePrice: 65.0,
      materialDescription: 'Дверное полотно + коробка и доборы',
    },
    rawSteps: [
      {
        stepTitle: 'Пена монтажная дверная',
        categoryLabel: 'Пена',
        defaultProductId: 'p_303822',
        options: [
          {
            productId: 'p_303822',
            content: 'Пена WUNDER Foam всесезонная 750мл (12.49 руб.) ★ Оптимум',
            tag: 'Минимальное расширение · Без перекосов',
            note: 'Не давит на дверной короб, сохраняет выставленные зазоры',
          },
          {
            productId: 'p_285958',
            content: 'Пена пистолетная SOUDAL ОКНА ДВЕРИ 750мл (15.93 руб.) · Премиум',
            tag: 'Специальная дверная серия',
            note: 'Плотный изоляционный шов с максимальной звукоизоляцией',
          },
          {
            productId: 'none',
            content: 'Не добавлять (пена есть)',
            tag: 'Своя пена',
            note: 'Заказчик предоставляет свою пистолетную пену',
            customTitle: 'Своя пена',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Герметизация примыкания наличников',
        categoryLabel: 'Герметик',
        defaultProductId: 'p_1360891',
        options: [
          {
            productId: 'p_1360891',
            content: 'Герметик акриловый MasterTeks PM белый 290мл (8.14 руб.) ★ Рекомендация',
            tag: 'Под покраску · Без трещин',
            note: 'Для стыков наличников со стеной, легко колеруется и моется',
          },
          {
            productId: 'p_1141322',
            content: 'Герметик силиконовый WUNDER белый 280мл (11.32 руб.)',
            tag: 'Санитарный влагостойкий',
            note: 'Для влажных зон (двери в ванную и санузел)',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Без герметика',
            note: 'Стыки прилегают плотно без заделки герметиком',
            customTitle: 'Без герметика',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Оснастка и крепёж петель',
        categoryLabel: 'Крепёж',
        defaultProductId: 'p_273069',
        options: [
          {
            productId: 'p_273069',
            content: 'Сверло YOURTOOLS HSS-TiN 3,2х36мм (3.10 руб.) ★ Для саморезов петель',
            tag: 'Защита от расщепления шпона',
            note: 'Предварительное засверливание под петли предотвращает трещины в массиве',
          },
          {
            productId: 'p_1482673',
            content: 'Рулетка Werker 7,5м прорезиненная (13.99 руб.)',
            tag: 'Для точной высоты ручки',
            note: 'Контроль стандарта высоты врезки замка (100 см от пола)',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Инструмент мастера',
            note: 'Оснастка входит в рабочий комплект мастера',
            customTitle: 'Без доплаты',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  tekhnika: {
    categoryKey: 'tekhnika',
    categoryLabel: 'Бытовая техника',
    serviceTitle: 'Подключение стиральной машины',
    productName: 'Стиральная машина (подвод воды и слив)',
    master: {
      name: 'Павел Н.',
      initials: 'ПН',
      avatar: '/master.jpeg',
      rating: 4.94,
      completedOrders: 220,
      phone: '+375 (29) 440-11-22',
      specialty: 'Установка техники',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Павел из Парка ОМА по бытовой технике. Пришлите, пожалуйста, фото выводов канализации, розетки и крана подачи воды.',
    clientPhoto: '/master/before_after/tekhnika_before.jpg',
    clientPhotoCaption: 'Выводы коммуникаций под стиральную машину',
    photoAnalysisReply: 'Краны на месте, но штатный наливной шланг коротковат, а на резьбе крана подачи старая прокладка. Чтобы исключить протечки при гидроударе, заменим шланг на армированный и поставим резину МастерПроф.\n\nПо шагам подберём расходники ОМА:',
    analoguesQuestion: 'Чем опасен дешёвый пластиковый шланг из комплекта машины?',
    analoguesReply: 'Штатные тонкостенные шланги боятся гидроударов и перетираются о вибрацию машины. Армированный шланг ILLU с двойной оплёткой из нержавейки держит до 10 бар давления и не лопнет при ночной стирке.',
    finalReportText: 'Стиральная машина подключена! Транспортировочные болты сняты, ножки отрегулированы по уровню на виброопорах, тестовый цикл слива и отжима проведён — протечек нет. Фотоотчёт:',
    beforePhoto: '/master/before_after/tekhnika_before.jpg',
    beforeCaption: 'Было · Подводка коммуникаций',
    afterPhoto: '/master/before_after/tekhnika_after.jpg',
    afterCaption: 'Стало · Подключённая техника по уровню',
    orderDefaults: {
      goodsPrice: 750.0,
      servicePrice: 35.0,
      materialDescription: 'Стиральная машина + обвязка',
    },
    rawSteps: [
      {
        stepTitle: 'Шланг наливной армированный',
        categoryLabel: 'Шланг',
        defaultProductId: 'p_1522081',
        options: [
          {
            productId: 'p_1522081',
            content: 'Шланг ILLU 150см нерж сталь 1/2" (8.14 руб.) ★ Защита от гидроударов',
            tag: 'Нержавеющая оплётка · До 10 бар',
            note: 'Надёжная подача воды без риска разрыва шланга под давлением',
          },
          {
            productId: 'p_1151028',
            content: 'Шланг для воды 1.5м серия Люкс (12.69 руб.)',
            tag: 'Усиленный резиновый корд',
            note: 'Повышенная гибкость для тесных ниш за стиральной машиной',
          },
          {
            productId: 'none',
            content: 'Не добавлять (хватит комплектного шланга)',
            tag: 'Штатный шланг',
            note: 'Использовать шланг из коробки стиральной машины',
            customTitle: 'Штатный шланг',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Сантехнические прокладки и уплотнители',
        categoryLabel: 'Прокладки',
        defaultProductId: 'p_1151730',
        options: [
          {
            productId: 'p_1151730',
            content: 'Резина сантехническая МастерПроф 10х10см 2мм (2.57 руб.) ★ Рекомендация',
            tag: 'Отечественная резина · 2 мм',
            note: 'Плотное герметичное прилегание на штуцере заливного клапана',
          },
          {
            productId: 'p_1149420',
            content: 'Чашка декоративная МастерПроф (8.21 руб.)',
            tag: 'Для скрытия вывода труб',
            note: 'Хромированный отражатель для эстетичного примыкания к кафелю',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Из комплекта',
            note: 'Использовать уплотнители из комплекта подключения',
            customTitle: 'Из комплекта',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Электробезопасность подключения',
        categoryLabel: 'Кабель',
        defaultProductId: 'p_1527497',
        options: [
          {
            productId: 'p_1527497',
            content: 'Кабель ВВГ-Пнг(А)-LS 3х1,5 (2.77 руб./м) ★ Для заземления розетки',
            tag: 'ГОСТ · С заземлением',
            note: 'Обязательное условие безопасной работы стиральной машины во влажной зоне',
          },
          {
            productId: 'p_1531468',
            content: 'Шнур ШВВП 2х0,75 (1.27 руб./м)',
            tag: 'Медный соединительный',
            note: 'Для подключения индикаторов и датчиков защиты от протечек',
          },
          {
            productId: 'none',
            content: 'Не требуется (розетка с заземлением готова)',
            tag: 'Розетка готова',
            note: 'Влагозащищённая розетка с PE-проводником уже смонтирована',
            customTitle: 'Розетка готова',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  sanuzel: {
    categoryKey: 'sanuzel',
    categoryLabel: 'Санузел',
    serviceTitle: 'Установка унитаза под ключ',
    productName: 'Унитаз-компакт STAR с сиденьем дюропласт микролифт',
    master: {
      name: 'Олег Б.',
      initials: 'ОБ',
      avatar: '/master.jpeg',
      rating: 4.91,
      completedOrders: 280,
      phone: '+375 (29) 880-99-00',
      specialty: 'Санузел и плитка',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Олег из Парка ОМА. Пришлите фото фановой трубы и пола в санузле — посмотрю уклон, диаметр раструба (110 мм) и подводку бачка.',
    clientPhoto: '/master/before_after/sanuzel_before.jpg',
    clientPhotoCaption: 'Фановая труба 110мм и подводка воды',
    photoAnalysisReply: 'Фановый раструб в порядке. Потребуется санитарный антигрибковый герметик под подошву чаши, усиленный крепёж к полу и эластичная прокладка бачка.\n\nДавайте по шагам подберём расходники ОМА:',
    analoguesQuestion: 'Зачем сажать унитаз на силикон, если есть болты к полу?',
    analoguesReply: 'Силикон под подошвой — обязателен: он распределяет нагрузку на плитку, не даёт чаше шататься и полностью исключает попадание воды под унитаз при уборке. Используем санитарный WUNDER с фунгицидом — он не чернеет от влаги.',
    finalReportText: 'Унитаз-компакт смонтирован! Чаша закреплена по уровню на усиленный крепёж, подошва просиликонена санитарным герметиком, арматура бачка отрегулирована без перелива. Всё сухо, смыв проверен. Фотоотчёт:',
    beforePhoto: '/master/before_after/sanuzel_before.jpg',
    beforeCaption: 'Было · Вывод фановой трубы',
    afterPhoto: '/master/before_after/sanuzel_after.jpg',
    afterCaption: 'Стало · Смонтированный унитаз с силиконовым швом',
    orderDefaults: {
      goodsPrice: 210.0,
      servicePrice: 45.0,
      materialDescription: 'Унитаз-компакт STAR + арматура',
    },
    rawSteps: [
      {
        stepTitle: 'Герметизация подошвы унитаза',
        categoryLabel: 'Герметик',
        defaultProductId: 'p_1141322',
        options: [
          {
            productId: 'p_1141322',
            content: 'Герметик силиконовый WUNDER белый 280мл (11.32 руб.) ★ Санитарный',
            tag: 'Антигрибковый · Не чернеет',
            note: 'Устраняет люфт чаши на плитке и защищает от затёков воды под основание',
          },
          {
            productId: 'p_285063',
            content: 'Soudal Fix All Flexi гибрид 290мл (23.38 руб.) · Премиум',
            tag: 'Высокая адгезия к керамике',
            note: 'Для полов с подогревом и повышенной вибрацией основания',
          },
          {
            productId: 'none',
            content: 'Не добавлять (герметик есть)',
            tag: 'Свой герметик',
            note: 'Заказчик использует собственный санитарный силикон',
            customTitle: 'Свой герметик',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Крепление унитаза к полу',
        categoryLabel: 'Крепление',
        defaultProductId: 'p_1145361',
        options: [
          {
            productId: 'p_1145361',
            content: 'Крепление для унитаза к полу МастерПроф (5.65 руб.) ★ Усиленное',
            tag: 'Латунные винты · Декоративные колпачки',
            note: 'Винты с антикоррозийным покрытием и эластичными втулками против сколов керамики',
          },
          {
            productId: 'p_364545',
            content: 'Сверло по кафелю и бетону YOURTOOLS 3х60мм (2.17 руб.)',
            tag: 'Точное сверление плитки',
            note: 'Сверление без трещин и сколов керамогранита на полу',
          },
          {
            productId: 'none',
            content: 'Не добавлять (крепёж из комплекта унитаза)',
            tag: 'Из комплекта',
            note: 'Использовать штатный крепёж из коробки унитаза',
            customTitle: 'Штатный крепёж',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Шланг подвода воды к бачку',
        categoryLabel: 'Подводка',
        defaultProductId: 'p_1522081',
        options: [
          {
            productId: 'p_1522081',
            content: 'Шланг ILLU 150см нерж сталь (8.14 руб.) ★ Прочность',
            tag: 'Нержавейка · Латунные гайки',
            note: 'Надёжная гибкая подводка для заливного клапана бачка',
          },
          {
            productId: 'p_1151730',
            content: 'Резина сантехническая для прокладок 2мм (2.57 руб.)',
            tag: 'Усиленная прокладка',
            note: 'Запасные эластичные прокладки для штуцера бачка',
          },
          {
            productId: 'none',
            content: 'Не добавлять (подводка есть)',
            tag: 'Своя подводка',
            note: 'Подводка остаётся старая или уже приобретена',
            customTitle: 'Своя подводка',
            customPrice: 0,
          },
        ],
      },
    ],
  },

  prochee: {
    categoryKey: 'prochee',
    categoryLabel: 'Прочее',
    serviceTitle: 'Мастер на час (карнизы, полки, зеркала)',
    productName: 'Мелкосрочный монтаж и навеска элементов интерьера',
    master: {
      name: 'Виктор Е.',
      initials: 'ВЕ',
      avatar: '/master.jpeg',
      rating: 4.93,
      completedOrders: 340,
      phone: '+375 (29) 112-33-44',
      specialty: 'Мастер на час',
      park: 'Парк ОМА',
    },
    sitePhotoPrompt: 'Здравствуйте! Я Виктор из Парка ОМА, мастер универсал. Пришлите, пожалуйста, фото стены и предметов навески — оценю материал стены (бетон, кирпич, ГКЛ) и подберу правильный крепёж.',
    clientPhoto: '/master/before_after/prochee_before.jpg',
    clientPhotoCaption: 'Стена и подготовленные элементы навески',
    photoAnalysisReply: 'Стена монолитная. Чтобы полка или зеркало держались надёжно и ровно, возьмём проверенные свёрла по бетону, клей-пену для вспомогательной фиксации и точную рулетку.\n\nПо шагам подберём расходные материалы ОМА:',
    analoguesQuestion: 'Какой крепёж надёжнее для тяжёлых зеркал и полок?',
    analoguesReply: 'Для бетона лучший выбор — дюбели с глубоким расклиниванием и усиленные свёрла YOURTOOLS. Вспомогательно на стыки полок наносим клей-пену WUNDER — она убирает микролюфты и скрипы.',
    finalReportText: 'Все работы по навеске выполнены! Элементы выставлены строго по горизонту с помощью лазерного уровня, крепёж сидит в бетоне намертво, пыль от сверления убрана пылесосом. Фотоотчёт:',
    beforePhoto: '/master/before_after/prochee_before.jpg',
    beforeCaption: 'Было · Стены до монтажа',
    afterPhoto: '/master/before_after/prochee_after.jpg',
    afterCaption: 'Стало · Закреплённые элементы по уровню',
    orderDefaults: {
      goodsPrice: 45.0,
      servicePrice: 30.0,
      materialDescription: 'Навеска элементов интерьера',
    },
    rawSteps: [
      {
        stepTitle: 'Оснастка для точного сверления',
        categoryLabel: 'Свёрла',
        defaultProductId: 'p_364545',
        options: [
          {
            productId: 'p_364545',
            content: 'Сверло по бетону YOURTOOLS 3х60мм (2.17 руб.) ★ Рекомендация',
            tag: 'Твёрдосплавная напайка',
            note: 'Чистый вход без сколов штукатурки и раскалывания бетона',
          },
          {
            productId: 'p_273069',
            content: 'Сверло HSS-TiN YOURTOOLS набор 3 шт. (3.10 руб.)',
            tag: 'По металлу и пластику',
            note: 'Для подгонки кронштейнов и профилей навески',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Инструмент мастера',
            note: 'Мастер использует свою оснастку',
            customTitle: 'Инструмент мастера',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Клей и фиксация стыков',
        categoryLabel: 'Клей-пена',
        defaultProductId: 'p_497397',
        options: [
          {
            productId: 'p_497397',
            content: 'Клей-пена WUNDER всесезонная 750мл (19.80 руб.) ★ Высокая адгезия',
            tag: 'Мгновенная фиксация',
            note: 'Для надёжной посадки панелей, зеркал и планок без сверления насквозь',
          },
          {
            productId: 'p_285063',
            content: 'Клей-герметик гибридный Soudal Fix All 290мл (23.38 руб.)',
            tag: 'Прочный монтажный гибрид',
            note: 'Сверхсильное сцепление на любых гладких поверхностях',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Без клея',
            note: 'Монтаж только на механический крепёж',
            customTitle: 'Без клея',
            customPrice: 0,
          },
        ],
      },
      {
        stepTitle: 'Измерительный инструмент разметки',
        categoryLabel: 'Рулетка',
        defaultProductId: 'p_1410048',
        options: [
          {
            productId: 'p_1410048',
            content: 'Рулетка Halk 10м ширина 25мм (10.18 руб.) ★ Оптимум',
            tag: 'Широкое полотно · Чёткая шкала',
            note: 'Быстрая разметка уровня навески полок по всей стене',
          },
          {
            productId: 'p_1482673',
            content: 'Рулетка Werker 7,5м (13.99 руб.)',
            tag: 'Ударопрочный корпус',
            note: 'Плавный стопор полотна и прорезиненный захват',
          },
          {
            productId: 'none',
            content: 'Не требуется',
            tag: 'Инструмент мастера',
            note: 'Разметка выполняется инструментом мастера',
            customTitle: 'Инструмент мастера',
            customPrice: 0,
          },
        ],
      },
    ],
  },
};

// Helper: resolve category key from order attributes
export function detectCategoryKey(order: Partial<CabinetOrder>): string {
  if (order.serviceCategory && CATEGORY_FLOW_CONFIGS[order.serviceCategory]) {
    return order.serviceCategory;
  }
  const text = `${order.serviceTitle || ''} ${order.productName || ''} ${order.master?.specialty || ''}`.toLowerCase();
  if (text.includes('электр') || text.includes('люстр') || text.includes('светильн') || text.includes('розетк')) {
    return 'elektrika';
  }
  if (text.includes('мебел') || text.includes('кухн') || text.includes('шкаф') || text.includes('комод')) {
    return 'mebel';
  }
  if (text.includes('ламинат') || text.includes('отделк') || text.includes('покраск') || text.includes('стен')) {
    return 'otdelka';
  }
  if (text.includes('двер') || text.includes('окн')) {
    return 'dveri';
  }
  if (text.includes('стиральн') || text.includes('посудомоечн') || text.includes('техник')) {
    return 'tekhnika';
  }
  if (text.includes('унитаз') || text.includes('инсталляц') || text.includes('санузел') || text.includes('ванн')) {
    return 'sanuzel';
  }
  if (text.includes('мастер на час') || text.includes('навеск') || text.includes('карниз')) {
    return 'prochee';
  }
  return 'santekhnika';
}

// Resolver: returns fully-populated CategoryFlowSpec with real products from products.json
export function resolveCategoryFlow(
  order: Partial<CabinetOrder>,
  allProducts: Product[]
): CategoryFlowSpec {
  const catKey = detectCategoryKey(order);
  const raw = CATEGORY_FLOW_CONFIGS[catKey] || CATEGORY_FLOW_CONFIGS.santekhnika;

  const steps: ConsumableStepSpec[] = raw.rawSteps.map((s) => {
    const options: ConsumableOption[] = s.options.map((opt) => {
      if (opt.productId === 'none') {
        return {
          value: 'none',
          content: opt.content,
          title: opt.customTitle || 'Не выбрано',
          price: opt.customPrice || 0,
          tag: opt.tag,
          note: opt.note,
          image: '',
        };
      }
      const prod = allProducts.find((p) => p.id === opt.productId);
      return {
        value: opt.productId,
        content: opt.content,
        title: prod?.name || opt.customTitle || 'Товар ОМА',
        price: prod ? prod.price : (opt.customPrice || 0),
        tag: opt.tag,
        note: opt.note,
        image: prod ? prod.image : '',
      };
    });

    return {
      stepTitle: s.stepTitle,
      categoryLabel: s.categoryLabel,
      defaultProductId: s.defaultProductId,
      options,
    };
  });

  return {
    categoryKey: raw.categoryKey,
    categoryLabel: raw.categoryLabel,
    serviceTitle: order.serviceTitle || raw.serviceTitle,
    productName: order.productName || raw.productName,
    master: {
      ...raw.master,
      name: order.master?.name || raw.master.name,
      park: order.master?.park || raw.master.park,
    },
    sitePhotoPrompt: raw.sitePhotoPrompt,
    clientPhoto: '/master/your_photo.svg',
    clientPhotoCaption: raw.clientPhotoCaption,
    photoAnalysisReply: raw.photoAnalysisReply,
    steps,
    analoguesQuestion: raw.analoguesQuestion,
    analoguesReply: raw.analoguesReply,
    finalReportText: raw.finalReportText,
    beforePhoto: '/master/your_photo.svg',
    beforeCaption: raw.beforeCaption,
    afterPhoto: '/master/result_photo.svg',
    afterCaption: raw.afterCaption,
    orderDefaults: raw.orderDefaults,
  };
}

// Preset list of 8 demo orders for the order cabinet switcher
export const DEMO_PRESET_ORDERS: { key: string; label: string; order: CabinetOrder }[] = [
  {
    key: 'santekhnika',
    label: 'Сантехника',
    order: {
      id: 'ord_84219',
      orderNumber: '84219',
      status: 'on_the_way',
      serviceTitle: 'Установка смесителя',
      serviceCategory: 'santekhnika',
      serviceCategoryLabel: 'Сантехника',
      productName: 'Смеситель для ванны Wisent (Хром) WP22153',
      materialPhotos: [],
      materialDescription: 'Wisent WP22153 · Подводка и узел',
      address: 'Минск, ул. Притыцкого, 10, кв. 24',
      dateTime: '29 октября · 13:00–18:00',
      goodsPrice: 105.79,
      servicePrice: 25.0,
      deliveryPrice: 8.0,
      discountBonus: 10.0,
      totalPrice: 128.79,
      earnedBonuses: 8,
      master: {
        name: 'Алексей С.',
        initials: 'АС',
        avatar: '/master.jpeg',
        rating: 4.9,
        completedOrders: 248,
        phone: '+375 (29) 765-43-21',
        specialty: 'Сантехника',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'elektrika',
    label: 'Электрика',
    order: {
      id: 'ord_91402',
      orderNumber: '91402',
      status: 'on_the_way',
      serviceTitle: 'Монтаж люстры или светильника',
      serviceCategory: 'elektrika',
      serviceCategoryLabel: 'Электрика',
      productName: 'Светильник подвесной OMRA 1х60Вт Е27 белый',
      materialPhotos: [],
      materialDescription: 'Светильник OMRA + клеммный узел',
      address: 'Минск, пр. Дзержинского, 83, кв. 114',
      dateTime: '29 октября · 14:00–18:00',
      goodsPrice: 18.95,
      servicePrice: 32.0,
      deliveryPrice: 8.0,
      discountBonus: 5.0,
      totalPrice: 53.95,
      earnedBonuses: 6,
      master: {
        name: 'Дмитрий В.',
        initials: 'ДВ',
        avatar: '/master.jpeg',
        rating: 4.95,
        completedOrders: 312,
        phone: '+375 (29) 641-22-33',
        specialty: 'Электрика',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'mebel',
    label: 'Сборка мебели',
    order: {
      id: 'ord_77510',
      orderNumber: '77510',
      status: 'on_the_way',
      serviceTitle: 'Сборка и навеска кухонного гарнитура',
      serviceCategory: 'mebel',
      serviceCategoryLabel: 'Сборка мебели',
      productName: 'Модульный кухонный гарнитур ОМА (6 секций)',
      materialPhotos: [],
      materialDescription: 'Комплект модулей + фурнитура с доводчиками',
      address: 'Минск, ул. Каменногорская, 34, кв. 8',
      dateTime: '29 октября · 10:00–14:00',
      goodsPrice: 380.0,
      servicePrice: 95.0,
      deliveryPrice: 8.0,
      discountBonus: 20.0,
      totalPrice: 463.0,
      earnedBonuses: 35,
      master: {
        name: 'Игорь М.',
        initials: 'ИМ',
        avatar: '/master.jpeg',
        rating: 4.88,
        completedOrders: 195,
        phone: '+375 (29) 315-88-99',
        specialty: 'Сборка мебели',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'otdelka',
    label: 'Отделка',
    order: {
      id: 'ord_63201',
      orderNumber: '63201',
      status: 'on_the_way',
      serviceTitle: 'Укладка ламината с подложкой',
      serviceCategory: 'otdelka',
      serviceCategoryLabel: 'Отделка',
      productName: 'Ламинат Expert Choice 33 класс (18 кв.м)',
      materialPhotos: [],
      materialDescription: 'Ламинат Дуб Натуральный + плинтус',
      address: 'Минск, ул. Сурганова, 50, кв. 42',
      dateTime: '29 октября · 12:00–17:00',
      goodsPrice: 240.0,
      servicePrice: 80.0,
      deliveryPrice: 8.0,
      discountBonus: 15.0,
      totalPrice: 313.0,
      earnedBonuses: 24,
      master: {
        name: 'Сергей К.',
        initials: 'СК',
        avatar: '/master.jpeg',
        rating: 4.92,
        completedOrders: 274,
        phone: '+375 (29) 555-12-80',
        specialty: 'Отделочные работы',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'dveri',
    label: 'Двери и окна',
    order: {
      id: 'ord_52044',
      orderNumber: '52044',
      status: 'on_the_way',
      serviceTitle: 'Установка межкомнатной двери',
      serviceCategory: 'dveri',
      serviceCategoryLabel: 'Двери и окна',
      productName: 'Дверное полотно экошпон глухое (Венге)',
      materialPhotos: [],
      materialDescription: 'Дверное полотно + коробка и наличники',
      address: 'Минск, ул. Богдановича, 120, кв. 63',
      dateTime: '30 октября · 11:00–15:00',
      goodsPrice: 195.0,
      servicePrice: 65.0,
      deliveryPrice: 8.0,
      discountBonus: 10.0,
      totalPrice: 258.0,
      earnedBonuses: 18,
      master: {
        name: 'Михаил Л.',
        initials: 'МЛ',
        avatar: '/master.jpeg',
        rating: 4.89,
        completedOrders: 164,
        phone: '+375 (29) 701-44-55',
        specialty: 'Двери и окна',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'sanuzel',
    label: 'Санузел',
    order: {
      id: 'ord_48110',
      orderNumber: '48110',
      status: 'on_the_way',
      serviceTitle: 'Установка унитаза под ключ',
      serviceCategory: 'sanuzel',
      serviceCategoryLabel: 'Санузел',
      productName: 'Унитаз-компакт STAR с сиденьем дюропласт',
      materialPhotos: [],
      materialDescription: 'Унитаз-компакт STAR + арматура бачка',
      address: 'Минск, ул. Матусевича, 72, кв. 19',
      dateTime: '30 октября · 13:00–18:00',
      goodsPrice: 210.0,
      servicePrice: 45.0,
      deliveryPrice: 8.0,
      discountBonus: 12.0,
      totalPrice: 251.0,
      earnedBonuses: 20,
      master: {
        name: 'Олег Б.',
        initials: 'ОБ',
        avatar: '/master.jpeg',
        rating: 4.91,
        completedOrders: 280,
        phone: '+375 (29) 880-99-00',
        specialty: 'Санузел и плитка',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'tekhnika',
    label: 'Бытовая техника',
    order: {
      id: 'ord_35901',
      orderNumber: '35901',
      status: 'on_the_way',
      serviceTitle: 'Подключение стиральной машины',
      serviceCategory: 'tekhnika',
      serviceCategoryLabel: 'Бытовая техника',
      productName: 'Стиральная машина (подвод воды и слив)',
      materialPhotos: [],
      materialDescription: 'Стиральная машина + наливной шланг',
      address: 'Минск, пр. Победителей, 135, кв. 77',
      dateTime: '30 октября · 14:00–18:00',
      goodsPrice: 750.0,
      servicePrice: 35.0,
      deliveryPrice: 8.0,
      discountBonus: 30.0,
      totalPrice: 763.0,
      earnedBonuses: 45,
      master: {
        name: 'Павел Н.',
        initials: 'ПН',
        avatar: '/master.jpeg',
        rating: 4.94,
        completedOrders: 220,
        phone: '+375 (29) 440-11-22',
        specialty: 'Установка техники',
        park: 'Парк ОМА',
      },
    },
  },
  {
    key: 'prochee',
    label: 'Мастер на час',
    order: {
      id: 'ord_22099',
      orderNumber: '22099',
      status: 'on_the_way',
      serviceTitle: 'Мастер на час (карнизы, полки, зеркала)',
      serviceCategory: 'prochee',
      serviceCategoryLabel: 'Прочее',
      productName: 'Навеска элементов интерьера и полок',
      materialPhotos: [],
      materialDescription: 'Навеска 2 полок, карниза и зеркала',
      address: 'Минск, ул. Городецкая, 22, кв. 101',
      dateTime: '30 октября · 16:00–19:00',
      goodsPrice: 45.0,
      servicePrice: 30.0,
      deliveryPrice: 8.0,
      discountBonus: 5.0,
      totalPrice: 78.0,
      earnedBonuses: 6,
      master: {
        name: 'Виктор Е.',
        initials: 'ВЕ',
        avatar: '/master.jpeg',
        rating: 4.93,
        completedOrders: 340,
        phone: '+375 (29) 112-33-44',
        specialty: 'Мастер на час',
        park: 'Парк ОМА',
      },
    },
  },
];
