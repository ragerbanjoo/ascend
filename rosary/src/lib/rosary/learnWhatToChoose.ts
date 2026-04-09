// CMS-ready bilingual content for "What should I choose to pray?" Learn section
// Section key: learn.whatToChoose

export interface WhatToChooseSource {
  label: string;
  url: string;
}

export interface WhatToChooseCard {
  id: string;
  title: { en: string; es: string };
  whatItIs: { en: string; es: string };
  whenToInclude: { en: string[]; es: string[] };
  whenToSkip: { en: string[]; es: string[] };
  quickTip: { en: string; es: string };
  sources: WhatToChooseSource[];
}

export interface WhatToChooseSection {
  heading: { en: string; es: string };
  intro: { en: string; es: string };
  cards: WhatToChooseCard[];
  backLabel: { en: string; es: string };
}

export const WHAT_TO_CHOOSE_DATA: WhatToChooseSection = {
  heading: {
    en: 'What should I choose to pray?',
    es: '¿Qué debería elegir para rezar?',
  },
  intro: {
    en: 'If you\'re short on time, pray the core Rosary—God receives it fully. Optional prayers can help you go deeper, especially when you\'re praying slowly, praying in a group, or carrying a specific intention. Scroll down to learn about each optional prayer and decide what\'s right for you before you begin.',
    es: 'Si tienes poco tiempo, reza el Rosario básico—Dios lo recibe completo. Las oraciones opcionales pueden ayudarte a profundizar, especialmente si rezas despacio, en grupo, o con una intención especial. Desplázate hacia abajo para conocer cada oración opcional y decidir qué incluir antes de comenzar.',
  },
  cards: [
    {
      id: 'core',
      title: {
        en: 'Core Rosary (the essentials)',
        es: 'Rosario Básico (lo esencial)',
      },
      whatItIs: {
        en: 'The standard Rosary: Sign of the Cross, Apostles\' Creed, Our Fathers, Hail Marys (10 per decade), Glory Be, Hail Holy Queen, and the closing prayers. This is the complete Rosary as described by the USCCB.',
        es: 'El Rosario estándar: Señal de la Cruz, Credo, Padrenuestros, Avemarías (10 por decena), Gloria, Salve Regina y las oraciones finales. Este es el Rosario completo como lo describe la USCCB.',
      },
      whenToInclude: {
        en: [
          'Always — this is the foundation of every Rosary.',
          'Best for a quick rosary or daily consistency.',
        ],
        es: [
          'Siempre — esto es el fundamento de cada Rosario.',
          'Ideal para rezarlo rápido o mantener constancia diaria.',
        ],
      },
      whenToSkip: {
        en: ['You never skip the core — it is the Rosary itself.'],
        es: ['Nunca se omite lo básico — esto es el Rosario en sí.'],
      },
      quickTip: {
        en: 'A full core Rosary takes about 15–20 minutes. Perfect for your commute, before bed, or during a break.',
        es: 'Un Rosario básico completo toma unos 15–20 minutos. Perfecto para el camino, antes de dormir, o en un descanso.',
      },
      sources: [
        {
          label: 'USCCB: How to Pray the Rosary',
          url: 'https://www.usccb.org/how-to-pray-the-rosary',
        },
      ],
    },
    {
      id: 'fatima',
      title: {
        en: 'Fatima Prayer (optional)',
        es: 'Oración de Fátima (opcional)',
      },
      whatItIs: {
        en: 'A short prayer added after each Glory Be: "O my Jesus, forgive us our sins…" It was reportedly given by Our Lady of Fatima in 1917. The USCCB notes that some people add this prayer after each decade.',
        es: 'Una breve oración que se añade después de cada Gloria: "Oh Jesús mío, perdona nuestros pecados…" Fue dada por Nuestra Señora de Fátima en 1917. La USCCB señala que algunas personas añaden esta oración después de cada decena.',
      },
      whenToInclude: {
        en: [
          'When you want to pray for mercy and for souls.',
          'During group prayer — it\'s a common addition.',
          'When carrying a specific intention for conversion.',
        ],
        es: [
          'Cuando quieres pedir misericordia y por las almas.',
          'Durante la oración en grupo — es una adición común.',
          'Cuando llevas una intención especial de conversión.',
        ],
      },
      whenToSkip: {
        en: [
          'When you want a quicker rosary — it\'s fully optional.',
          'It adds about 1–2 minutes total.',
        ],
        es: [
          'Cuando quieres un rosario más rápido — es completamente opcional.',
          'Añade aproximadamente 1–2 minutos en total.',
        ],
      },
      quickTip: {
        en: 'Some people add this after each decade; it\'s optional. Use it when you want to pray for mercy and for souls.',
        es: 'Algunos la rezan después de cada decena; es opcional. Úsala cuando quieres pedir misericordia y por las almas.',
      },
      sources: [
        {
          label: 'USCCB: How to Pray the Rosary',
          url: 'https://www.usccb.org/how-to-pray-the-rosary',
        },
      ],
    },
    {
      id: 'litany',
      title: {
        en: 'Litany of Loreto (optional)',
        es: 'Letanías Lauretanas (opcional)',
      },
      whatItIs: {
        en: 'A beautiful series of invocations honoring Mary under many titles (e.g., "Mirror of Justice," "Seat of Wisdom"). Each invocation is followed by "Pray for us." It is traditionally prayed after the Rosary concluding prayers.',
        es: 'Una hermosa serie de invocaciones que honran a María bajo muchos títulos (ej., "Espejo de Justicia," "Trono de Sabiduría"). Cada invocación va seguida de "Ruega por nosotros." Se reza tradicionalmente después de las oraciones finales del Rosario.',
      },
      whenToInclude: {
        en: [
          'When you want to linger in praise and intercession.',
          'During Marian feast days or group devotions.',
          'When praying for a special intention through Mary\'s intercession.',
        ],
        es: [
          'Cuando quieres quedarte más tiempo en alabanza e intercesión.',
          'Durante fiestas marianas o devociones en grupo.',
          'Cuando rezas por una intención especial a través de la intercesión de María.',
        ],
      },
      whenToSkip: {
        en: [
          'When you want a quicker rosary.',
          'It adds about 3–5 minutes.',
        ],
        es: [
          'Cuando quieres un rosario más rápido.',
          'Añade aproximadamente 3–5 minutos.',
        ],
      },
      quickTip: {
        en: 'A beautiful Marian litany. Great when you want to linger in praise and intercession—but you can skip it for a quicker rosary.',
        es: 'Una letanía mariana hermosa. Buena cuando quieres quedarte más tiempo en alabanza e intercesión—pero puedes omitirla si quieres un rosario más rápido.',
      },
      sources: [
        {
          label: 'Vatican: Litany of Loreto (EN)',
          url: 'https://www.vatican.va/special/rosary/documents/litanie-lauretane_en.html',
        },
        {
          label: 'Vatican: Letanías Lauretanas (ES)',
          url: 'https://www.vatican.va/special/rosary/documents/litanie-lauretane_sp.html',
        },
      ],
    },
    {
      id: 'scripture',
      title: {
        en: 'Scripture Reading (optional)',
        es: 'Lectura Bíblica (opcional)',
      },
      whatItIs: {
        en: 'A short Scripture passage shown before each mystery to anchor your meditation in God\'s Word. The USCCB encourages using Scripture with the Rosary to deepen reflection on each mystery.',
        es: 'Un breve pasaje bíblico que se muestra antes de cada misterio para anclar tu meditación en la Palabra de Dios. La USCCB anima a usar las Escrituras con el Rosario para profundizar la reflexión sobre cada misterio.',
      },
      whenToInclude: {
        en: [
          'When you want a slower, more reflective rosary.',
          'When praying alone and desiring deeper meditation.',
          'When studying the mysteries for the first time.',
        ],
        es: [
          'Cuando quieres un rosario más pausado y reflexivo.',
          'Cuando rezas solo y deseas una meditación más profunda.',
          'Cuando estudias los misterios por primera vez.',
        ],
      },
      whenToSkip: {
        en: [
          'When you\'re short on time.',
          'During group prayer where pace matters.',
        ],
        es: [
          'Cuando tienes poco tiempo.',
          'Durante la oración en grupo donde el ritmo importa.',
        ],
      },
      quickTip: {
        en: 'Helps meditation by anchoring the mystery in God\'s Word. Use it when you want a slower, more reflective rosary.',
        es: 'Ayuda a meditar al anclar el misterio en la Palabra. Úsala cuando quieres un rosario más pausado y reflexivo.',
      },
      sources: [
        {
          label: 'USCCB: Scriptural Rosary',
          url: 'https://www.usccb.org/prayer-and-worship/prayers-and-devotions/rosaries/scriptural-rosary-for-justice-and-peace',
        },
        {
          label: 'USCCB: How to Pray the Rosary',
          url: 'https://www.usccb.org/how-to-pray-the-rosary',
        },
      ],
    },
  ],
  backLabel: {
    en: 'Back to Pray',
    es: 'Volver a Rezar',
  },
};
