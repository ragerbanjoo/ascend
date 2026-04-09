import type { MysterySet, MysterySetData, Prayer, RosaryStep } from './types';

// ─── Day-of-week → mystery set ─────────────────────────────────────────
const DAY_MAP: Record<number, MysterySet> = {
  0: 'glorious',   // Sunday
  1: 'joyful',     // Monday
  2: 'sorrowful',  // Tuesday
  3: 'glorious',   // Wednesday
  4: 'luminous',   // Thursday
  5: 'sorrowful',  // Friday
  6: 'joyful',     // Saturday
};

export function getTodaysMystery(date: Date = new Date()): MysterySet {
  return DAY_MAP[date.getDay()];
}

export const SCHEDULE_NOTE = {
  en: 'Mon & Sat: Joyful · Tue & Fri: Sorrowful · Wed & Sun: Glorious · Thu: Luminous',
  es: 'Lun y Sáb: Gozosos · Mar y Vie: Dolorosos · Mié y Dom: Gloriosos · Jue: Luminosos',
};

// ─── Prayers ────────────────────────────────────────────────────────────
export const PRAYERS: Record<string, Prayer> = {
  sign_of_cross: {
    key: 'sign_of_cross',
    title: { en: 'Sign of the Cross', es: 'La Señal de la Cruz' },
    text: {
      en: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
      es: 'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
    },
    instruction: {
      en: 'Make the Sign of the Cross while saying this prayer.',
      es: 'Haz la Señal de la Cruz mientras dices esta oración.',
    },
  },
  apostles_creed: {
    key: 'apostles_creed',
    title: { en: 'Apostles\' Creed', es: 'El Credo de los Apóstoles' },
    text: {
      en: 'I believe in God, the Father Almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord; who was conceived by the Holy Spirit, born of the Virgin Mary; suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell; the third day He rose again from the dead. He ascended into heaven, and is seated at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Spirit, the Holy Catholic Church, the communion of Saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
      es: 'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
    },
    instruction: {
      en: 'Pray on the crucifix of the rosary.',
      es: 'Reza en el crucifijo del rosario.',
    },
  },
  our_father: {
    key: 'our_father',
    title: { en: 'Our Father', es: 'Padre Nuestro' },
    text: {
      en: 'Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
      es: 'Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu Reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
    },
  },
  hail_mary: {
    key: 'hail_mary',
    title: { en: 'Hail Mary', es: 'Ave María' },
    text: {
      en: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
      es: 'Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.',
    },
  },
  glory_be: {
    key: 'glory_be',
    title: { en: 'Glory Be', es: 'Gloria al Padre' },
    text: {
      en: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.',
      es: 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
    },
  },
  fatima_prayer: {
    key: 'fatima_prayer',
    title: { en: 'Fatima Prayer', es: 'Oración de Fátima' },
    text: {
      en: 'O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those most in need of Thy mercy. Amen.',
      es: 'Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia. Amén.',
    },
  },
  hail_holy_queen: {
    key: 'hail_holy_queen',
    title: { en: 'Hail, Holy Queen', es: 'Salve, Reina' },
    text: {
      en: 'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.',
      es: 'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra. Dios te salve. A ti llamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos, y después de este destierro muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María!',
    },
  },
  pray_for_us: {
    key: 'pray_for_us',
    title: { en: 'Pray for Us', es: 'Ruega por Nosotros' },
    text: {
      en: 'V: Pray for us, O Holy Mother of God.\nR: That we may be made worthy of the promises of Christ.',
      es: 'V: Ruega por nosotros, Santa Madre de Dios.\nR: Para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo.',
    },
  },
  concluding_prayer: {
    key: 'concluding_prayer',
    title: { en: 'Concluding Prayer', es: 'Oración Final' },
    text: {
      en: 'O God, whose Only Begotten Son, by His life, Death, and Resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that by meditating on these mysteries of the most holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.',
      es: 'Oh Dios, cuyo Hijo unigénito, con su vida, muerte y resurrección, nos ha comprado los premios de la vida eterna, concédenos, te suplicamos, que meditando estos misterios del Santísimo Rosario de la Bienaventurada Virgen María, imitemos lo que contienen y obtengamos lo que prometen, por el mismo Jesucristo nuestro Señor. Amén.',
    },
  },
};

// ─── Mysteries ──────────────────────────────────────────────────────────
export const MYSTERY_SETS: MysterySetData[] = [
  {
    key: 'joyful',
    label: { en: 'Joyful Mysteries', es: 'Misterios Gozosos' },
    mysteries: [
      {
        number: 1,
        title: { en: 'The Annunciation', es: 'La Anunciación' },
        scripture: { en: 'Luke 1:26-38', es: 'Lucas 1:26-38' },
        meditation: {
          en: 'The Angel Gabriel announces to Mary that she will conceive and bear the Son of God.',
          es: 'El Ángel Gabriel anuncia a María que concebirá y dará a luz al Hijo de Dios.',
        },
      },
      {
        number: 2,
        title: { en: 'The Visitation', es: 'La Visitación' },
        scripture: { en: 'Luke 1:39-56', es: 'Lucas 1:39-56' },
        meditation: {
          en: 'Mary visits her cousin Elizabeth, who is pregnant with John the Baptist.',
          es: 'María visita a su prima Isabel, quien está embarazada de Juan el Bautista.',
        },
      },
      {
        number: 3,
        title: { en: 'The Nativity', es: 'El Nacimiento de Jesús' },
        scripture: { en: 'Luke 2:1-20', es: 'Lucas 2:1-20' },
        meditation: {
          en: 'Jesus is born in Bethlehem in a humble stable.',
          es: 'Jesús nace en Belén en un humilde establo.',
        },
      },
      {
        number: 4,
        title: { en: 'The Presentation', es: 'La Presentación en el Templo' },
        scripture: { en: 'Luke 2:22-40', es: 'Lucas 2:22-40' },
        meditation: {
          en: 'Mary and Joseph present the infant Jesus in the Temple.',
          es: 'María y José presentan al niño Jesús en el Templo.',
        },
      },
      {
        number: 5,
        title: { en: 'Finding in the Temple', es: 'El Niño Jesús Perdido y Hallado en el Templo' },
        scripture: { en: 'Luke 2:41-52', es: 'Lucas 2:41-52' },
        meditation: {
          en: 'The child Jesus is found in the Temple, discussing with the teachers.',
          es: 'El niño Jesús es encontrado en el Templo, discutiendo con los maestros.',
        },
      },
    ],
  },
  {
    key: 'sorrowful',
    label: { en: 'Sorrowful Mysteries', es: 'Misterios Dolorosos' },
    mysteries: [
      {
        number: 1,
        title: { en: 'The Agony in the Garden', es: 'La Agonía en el Huerto' },
        scripture: { en: 'Matthew 26:36-46', es: 'Mateo 26:36-46' },
        meditation: {
          en: 'Jesus prays in the Garden of Gethsemane, sweating blood in anguish.',
          es: 'Jesús ora en el Huerto de Getsemaní, sudando sangre en agonía.',
        },
      },
      {
        number: 2,
        title: { en: 'The Scourging at the Pillar', es: 'La Flagelación' },
        scripture: { en: 'John 19:1', es: 'Juan 19:1' },
        meditation: {
          en: 'Jesus is bound to a pillar and scourged by Roman soldiers.',
          es: 'Jesús es atado a una columna y azotado por los soldados romanos.',
        },
      },
      {
        number: 3,
        title: { en: 'The Crowning with Thorns', es: 'La Coronación de Espinas' },
        scripture: { en: 'Matthew 27:27-31', es: 'Mateo 27:27-31' },
        meditation: {
          en: 'The soldiers place a crown of thorns on the head of Jesus.',
          es: 'Los soldados colocan una corona de espinas en la cabeza de Jesús.',
        },
      },
      {
        number: 4,
        title: { en: 'The Carrying of the Cross', es: 'Jesús con la Cruz a Cuestas' },
        scripture: { en: 'John 19:17', es: 'Juan 19:17' },
        meditation: {
          en: 'Jesus carries His Cross through the streets of Jerusalem to Calvary.',
          es: 'Jesús carga su Cruz por las calles de Jerusalén hacia el Calvario.',
        },
      },
      {
        number: 5,
        title: { en: 'The Crucifixion', es: 'La Crucifixión' },
        scripture: { en: 'Luke 23:33-46', es: 'Lucas 23:33-46' },
        meditation: {
          en: 'Jesus is nailed to the Cross and dies for our salvation.',
          es: 'Jesús es clavado en la Cruz y muere por nuestra salvación.',
        },
      },
    ],
  },
  {
    key: 'glorious',
    label: { en: 'Glorious Mysteries', es: 'Misterios Gloriosos' },
    mysteries: [
      {
        number: 1,
        title: { en: 'The Resurrection', es: 'La Resurrección' },
        scripture: { en: 'Mark 16:1-7', es: 'Marcos 16:1-7' },
        meditation: {
          en: 'Jesus rises from the dead on the third day.',
          es: 'Jesús resucita de entre los muertos al tercer día.',
        },
      },
      {
        number: 2,
        title: { en: 'The Ascension', es: 'La Ascensión' },
        scripture: { en: 'Acts 1:9-11', es: 'Hechos 1:9-11' },
        meditation: {
          en: 'Jesus ascends into heaven forty days after the Resurrection.',
          es: 'Jesús asciende al cielo cuarenta días después de la Resurrección.',
        },
      },
      {
        number: 3,
        title: { en: 'The Descent of the Holy Spirit', es: 'La Venida del Espíritu Santo' },
        scripture: { en: 'Acts 2:1-4', es: 'Hechos 2:1-4' },
        meditation: {
          en: 'The Holy Spirit descends upon the Apostles and the Blessed Mother.',
          es: 'El Espíritu Santo desciende sobre los Apóstoles y la Santísima Madre.',
        },
      },
      {
        number: 4,
        title: { en: 'The Assumption', es: 'La Asunción de María' },
        scripture: { en: 'Revelation 12:1', es: 'Apocalipsis 12:1' },
        meditation: {
          en: 'The Blessed Virgin Mary is assumed body and soul into heaven.',
          es: 'La Santísima Virgen María es asunta en cuerpo y alma al cielo.',
        },
      },
      {
        number: 5,
        title: { en: 'The Coronation', es: 'La Coronación de María' },
        scripture: { en: 'Revelation 12:1', es: 'Apocalipsis 12:1' },
        meditation: {
          en: 'The Blessed Virgin Mary is crowned Queen of Heaven and Earth.',
          es: 'La Santísima Virgen María es coronada Reina del Cielo y de la Tierra.',
        },
      },
    ],
  },
  {
    key: 'luminous',
    label: { en: 'Luminous Mysteries', es: 'Misterios Luminosos' },
    mysteries: [
      {
        number: 1,
        title: { en: 'The Baptism in the Jordan', es: 'El Bautismo de Jesús' },
        scripture: { en: 'Matthew 3:13-17', es: 'Mateo 3:13-17' },
        meditation: {
          en: 'Jesus is baptized in the River Jordan by John the Baptist.',
          es: 'Jesús es bautizado en el Río Jordán por Juan el Bautista.',
        },
      },
      {
        number: 2,
        title: { en: 'The Wedding at Cana', es: 'Las Bodas de Caná' },
        scripture: { en: 'John 2:1-12', es: 'Juan 2:1-12' },
        meditation: {
          en: 'Jesus performs His first miracle at the wedding feast at Cana.',
          es: 'Jesús realiza su primer milagro en la fiesta de bodas en Caná.',
        },
      },
      {
        number: 3,
        title: { en: 'Proclamation of the Kingdom', es: 'La Proclamación del Reino' },
        scripture: { en: 'Mark 1:14-15', es: 'Marcos 1:14-15' },
        meditation: {
          en: 'Jesus proclaims the Kingdom of God and calls all to conversion.',
          es: 'Jesús proclama el Reino de Dios y llama a todos a la conversión.',
        },
      },
      {
        number: 4,
        title: { en: 'The Transfiguration', es: 'La Transfiguración' },
        scripture: { en: 'Matthew 17:1-8', es: 'Mateo 17:1-8' },
        meditation: {
          en: 'Jesus is transfigured on Mount Tabor in the presence of Peter, James, and John.',
          es: 'Jesús se transfigura en el Monte Tabor en presencia de Pedro, Santiago y Juan.',
        },
      },
      {
        number: 5,
        title: { en: 'Institution of the Eucharist', es: 'La Institución de la Eucaristía' },
        scripture: { en: 'Luke 22:14-20', es: 'Lucas 22:14-20' },
        meditation: {
          en: 'Jesus institutes the Holy Eucharist at the Last Supper.',
          es: 'Jesús instituye la Santa Eucaristía en la Última Cena.',
        },
      },
    ],
  },
];

export function getMysterySet(key: MysterySet): MysterySetData {
  return MYSTERY_SETS.find((s) => s.key === key)!;
}

// ─── Step sequence builder ──────────────────────────────────────────────
export function buildStepSequence(includeFatima: boolean, includeLitany: boolean = false): RosaryStep[] {
  const steps: RosaryStep[] = [
    { type: 'sign_of_cross' },
    { type: 'apostles_creed' },
    { type: 'our_father' },
    { type: 'hail_mary_x3' },
    { type: 'glory_be' },
  ];

  for (let d = 0; d < 5; d++) {
    steps.push({ type: 'announce_mystery', decadeIndex: d });
    steps.push({ type: 'decade_our_father', decadeIndex: d });
    steps.push({ type: 'decade_hail_marys', decadeIndex: d });
    steps.push({ type: 'decade_glory_be', decadeIndex: d });
    if (includeFatima) {
      steps.push({ type: 'fatima_prayer', decadeIndex: d });
    }
  }

  steps.push({ type: 'hail_holy_queen' });
  if (includeLitany) {
    steps.push({ type: 'litany_of_loreto' });
  }
  steps.push({ type: 'concluding_prayer' });
  steps.push({ type: 'final_sign_of_cross' });

  return steps;
}

export const MYSTERY_SET_LABELS: Record<MysterySet, { en: string; es: string }> = {
  joyful: { en: 'Joyful Mysteries', es: 'Misterios Gozosos' },
  sorrowful: { en: 'Sorrowful Mysteries', es: 'Misterios Dolorosos' },
  glorious: { en: 'Glorious Mysteries', es: 'Misterios Gloriosos' },
  luminous: { en: 'Luminous Mysteries', es: 'Misterios Luminosos' },
};
