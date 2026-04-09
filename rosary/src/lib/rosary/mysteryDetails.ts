import type { MysteryDetail, MysterySet } from './types';

// Vatican source URLs
const VATICAN_JOYFUL = 'https://www.vatican.va/special/rosary/documents/misteri_gaudiosi_en.html';
const VATICAN_SORROWFUL = 'https://www.vatican.va/special/rosary/documents/misteri_dolorosi_en.html';
const VATICAN_GLORIOUS = 'https://www.vatican.va/special/rosary/documents/misteri_gloriosi_en.html';
const VATICAN_LUMINOUS = 'https://www.vatican.va/special/rosary/documents/misteri_luminosi_en.html';
const ROSARIUM = 'https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html';
const USCCB_ROSARY = 'https://www.usccb.org/how-to-pray-the-rosary';

export const MYSTERY_DETAILS: MysteryDetail[] = [
  // ═══════════════════════════════════════════════════════════════
  // JOYFUL MYSTERIES
  // ═══════════════════════════════════════════════════════════════
  {
    setKey: 'joyful',
    order: 1,
    slug: 'annunciation',
    title: { en: 'The Annunciation', es: 'La Anunciación' },
    summary: {
      en: 'The angel Gabriel appears to Mary in Nazareth and announces that she has been chosen to be the Mother of God. Mary responds with faith: "Let it be done to me according to your word."',
      es: 'El ángel Gabriel se aparece a María en Nazaret y le anuncia que ha sido elegida para ser la Madre de Dios. María responde con fe: "Hágase en mí según tu palabra."',
    },
    whatItTeaches: {
      en: 'God invites each of us into His plan. Like Mary, we are called to say "yes" even when we don\'t fully understand. True faith means trusting God\'s timing and purpose.',
      es: 'Dios nos invita a cada uno a participar en su plan. Como María, estamos llamados a decir "sí" incluso cuando no entendemos del todo. La verdadera fe es confiar en el tiempo y propósito de Dios.',
    },
    fruit: { en: 'Humility', es: 'Humildad' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 1:26–27', es: 'Lucas 1:26–27' },
        summary: {
          en: 'God sent the angel Gabriel to Nazareth, to a virgin named Mary who was betrothed to Joseph.',
          es: 'Dios envió al ángel Gabriel a Nazaret, a una virgen llamada María que estaba desposada con José.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Joyful Mysteries', es: 'Rosario Vaticano — Misterios Gozosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The first joyful mystery invites us to contemplate Mary\'s humble acceptance of God\'s plan.',
          es: 'El primer misterio gozoso nos invita a contemplar la humilde aceptación de María del plan de Dios.',
        },
        url: VATICAN_JOYFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The Rosary is a compendium of the Gospel, centered on the mystery of the Incarnation.',
          es: 'El Rosario es un compendio del Evangelio, centrado en el misterio de la Encarnación.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'Where is God inviting me to say "yes" in my life right now?',
        'How can I practice humility when faced with something I don\'t understand?',
      ],
      es: [
        '¿Dónde me está invitando Dios a decir "sí" en mi vida ahora mismo?',
        '¿Cómo puedo practicar la humildad cuando enfrento algo que no entiendo?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'joyful',
    order: 2,
    slug: 'visitation',
    title: { en: 'The Visitation', es: 'La Visitación' },
    summary: {
      en: 'Mary travels in haste to visit her cousin Elizabeth, who is also with child. Elizabeth, filled with the Holy Spirit, proclaims Mary blessed among women.',
      es: 'María viaja con prontitud a visitar a su prima Isabel, quien también espera un hijo. Isabel, llena del Espíritu Santo, proclama a María bendita entre las mujeres.',
    },
    whatItTeaches: {
      en: 'True joy overflows into service. Mary\'s first response to receiving grace was to go and serve someone else. Christian life is about bringing Christ to others.',
      es: 'La verdadera alegría se desborda en servicio. La primera respuesta de María al recibir la gracia fue ir a servir a otra persona. La vida cristiana se trata de llevar a Cristo a los demás.',
    },
    fruit: { en: 'Charity', es: 'Caridad' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 1:39–42', es: 'Lucas 1:39–42' },
        summary: {
          en: 'Mary set out in haste to visit Elizabeth, who was filled with the Holy Spirit and proclaimed Mary blessed among women.',
          es: 'María partió con prontitud a visitar a Isabel, quien fue llena del Espíritu Santo y proclamó a María bendita entre las mujeres.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Joyful Mysteries', es: 'Rosario Vaticano — Misterios Gozosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Mary brings Christ to Elizabeth, becoming the first missionary of the Gospel.',
          es: 'María lleva a Cristo a Isabel, convirtiéndose en la primera misionera del Evangelio.',
        },
        url: VATICAN_JOYFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'USCCB — How to Pray the Rosary', es: 'USCCB — Cómo Rezar el Rosario' },
        author: { en: 'USCCB', es: 'USCCB' },
        excerpt: {
          en: 'The Visitation reminds us that bearing Christ means sharing Him with others.',
          es: 'La Visitación nos recuerda que llevar a Cristo significa compartirlo con los demás.',
        },
        url: USCCB_ROSARY,
        type: 'usccb',
      },
    ],
    reflectionPrompts: {
      en: [
        'Who in my life needs encouragement or help right now?',
        'How can I bring the joy of Christ to someone today?',
      ],
      es: [
        '¿Quién en mi vida necesita ánimo o ayuda ahora mismo?',
        '¿Cómo puedo llevar la alegría de Cristo a alguien hoy?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'joyful',
    order: 3,
    slug: 'nativity',
    title: { en: 'The Nativity', es: 'El Nacimiento de Jesús' },
    summary: {
      en: 'Jesus is born in Bethlehem in humble circumstances. Mary wraps him in swaddling clothes and lays him in a manger because there was no room at the inn.',
      es: 'Jesús nace en Belén en circunstancias humildes. María lo envuelve en pañales y lo acuesta en un pesebre porque no había lugar en la posada.',
    },
    whatItTeaches: {
      en: 'God enters the world not in power but in poverty and vulnerability. The Nativity teaches us that God\'s greatness is revealed through humility and simplicity.',
      es: 'Dios entra al mundo no con poder sino con pobreza y vulnerabilidad. El Nacimiento nos enseña que la grandeza de Dios se revela a través de la humildad y la sencillez.',
    },
    fruit: { en: 'Poverty of Spirit / Detachment', es: 'Pobreza de Espíritu / Desprendimiento' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 2:1–7', es: 'Lucas 2:1–7' },
        summary: {
          en: 'Joseph and Mary traveled to Bethlehem for the census. There, Mary gave birth and laid her son in a manger.',
          es: 'José y María viajaron a Belén para el censo. Allí, María dio a luz y acostó a su hijo en un pesebre.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Joyful Mysteries', es: 'Rosario Vaticano — Misterios Gozosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'In the poverty of the manger, we see the immense love of God who becomes small for us.',
          es: 'En la pobreza del pesebre, vemos el inmenso amor de Dios que se hace pequeño por nosotros.',
        },
        url: VATICAN_JOYFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The joyful mysteries lead us to the joy of the Incarnation radiating from Bethlehem.',
          es: 'Los misterios gozosos nos llevan a la alegría de la Encarnación que irradia desde Belén.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'Where am I clinging to comfort instead of trusting God\'s plan?',
        'How does Jesus\' humble birth challenge my own priorities?',
      ],
      es: [
        '¿Dónde me aferro a la comodidad en vez de confiar en el plan de Dios?',
        '¿Cómo desafía el humilde nacimiento de Jesús mis propias prioridades?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'joyful',
    order: 4,
    slug: 'presentation',
    title: { en: 'The Presentation in the Temple', es: 'La Presentación en el Templo' },
    summary: {
      en: 'Mary and Joseph bring the infant Jesus to the Temple to present him to the Lord. The prophet Simeon recognizes Jesus as the long-awaited Messiah and foretells Mary\'s suffering.',
      es: 'María y José llevan al niño Jesús al Templo para presentarlo al Señor. El profeta Simeón reconoce a Jesús como el Mesías esperado y profetiza el sufrimiento de María.',
    },
    whatItTeaches: {
      en: 'Faithfully following God\'s law and trusting His promises leads to encountering Christ. Simeon waited his whole life and was rewarded with seeing the Savior.',
      es: 'Seguir fielmente la ley de Dios y confiar en sus promesas lleva al encuentro con Cristo. Simeón esperó toda su vida y fue recompensado al ver al Salvador.',
    },
    fruit: { en: 'Obedience', es: 'Obediencia' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 2:21–24', es: 'Lucas 2:21–24' },
        summary: {
          en: 'When the days of purification were completed, Joseph and Mary brought Jesus to the Temple to present him to the Lord.',
          es: 'Cuando se cumplieron los días de la purificación, José y María llevaron a Jesús al Templo para presentarlo al Señor.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Joyful Mysteries', es: 'Rosario Vaticano — Misterios Gozosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The Presentation reveals Christ as a light for revelation to the nations.',
          es: 'La Presentación revela a Cristo como luz para iluminar a las naciones.',
        },
        url: VATICAN_JOYFUL,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'What am I waiting on God for? Can I trust His timing like Simeon did?',
        'How do I offer my daily life to God as Mary and Joseph offered Jesus?',
      ],
      es: [
        '¿Qué estoy esperando de Dios? ¿Puedo confiar en su tiempo como lo hizo Simeón?',
        '¿Cómo ofrezco mi vida diaria a Dios como María y José ofrecieron a Jesús?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'joyful',
    order: 5,
    slug: 'finding-in-the-temple',
    title: { en: 'The Finding in the Temple', es: 'El Niño Jesús Perdido y Hallado en el Templo' },
    summary: {
      en: 'After three anxious days of searching, Mary and Joseph find the twelve-year-old Jesus in the Temple, sitting among the teachers, listening and asking questions.',
      es: 'Después de tres días de angustiosa búsqueda, María y José encuentran al niño Jesús de doce años en el Templo, sentado entre los maestros, escuchando y haciendo preguntas.',
    },
    whatItTeaches: {
      en: 'Even in moments of confusion and anxiety, God is at work. Jesus reveals that His Father\'s house is where He belongs — reminding us to seek God first in all things.',
      es: 'Incluso en momentos de confusión y ansiedad, Dios está obrando. Jesús revela que la casa de su Padre es donde Él pertenece — recordándonos buscar a Dios primero en todo.',
    },
    fruit: { en: 'Joy in Finding Jesus', es: 'Alegría de Encontrar a Jesús' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 2:41–47', es: 'Lucas 2:41–47' },
        summary: {
          en: 'After three days of searching, Mary and Joseph found Jesus in the Temple among the teachers, listening and asking questions.',
          es: 'Después de tres días de búsqueda, María y José encontraron a Jesús en el Templo entre los maestros, escuchando y haciendo preguntas.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Joyful Mysteries', es: 'Rosario Vaticano — Misterios Gozosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The finding of Jesus in the Temple foreshadows His mission and total dedication to the Father.',
          es: 'El hallazgo de Jesús en el Templo prefigura su misión y total dedicación al Padre.',
        },
        url: VATICAN_JOYFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'USCCB — How to Pray the Rosary', es: 'USCCB — Cómo Rezar el Rosario' },
        author: { en: 'USCCB', es: 'USCCB' },
        excerpt: {
          en: 'This mystery invites us to seek Jesus with the same urgency Mary and Joseph showed.',
          es: 'Este misterio nos invita a buscar a Jesús con la misma urgencia que mostraron María y José.',
        },
        url: USCCB_ROSARY,
        type: 'usccb',
      },
    ],
    reflectionPrompts: {
      en: [
        'When was the last time I truly sought Jesus with urgency?',
        'What distracts me from making God my first priority?',
      ],
      es: [
        '¿Cuándo fue la última vez que busqué a Jesús con urgencia?',
        '¿Qué me distrae de hacer de Dios mi primera prioridad?',
      ],
    },
    status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════
  // SORROWFUL MYSTERIES
  // ═══════════════════════════════════════════════════════════════
  {
    setKey: 'sorrowful',
    order: 1,
    slug: 'agony-in-the-garden',
    title: { en: 'The Agony in the Garden', es: 'La Agonía en el Huerto' },
    summary: {
      en: 'Jesus prays in the Garden of Gethsemane, overwhelmed with sorrow, knowing the suffering that awaits Him. He surrenders to the Father\'s will: "Not my will, but yours be done."',
      es: 'Jesús ora en el Huerto de Getsemaní, abrumado por la tristeza, sabiendo el sufrimiento que le espera. Se rinde a la voluntad del Padre: "No se haga mi voluntad, sino la tuya."',
    },
    whatItTeaches: {
      en: 'Jesus shows us how to face fear and suffering: through honest prayer and surrender to God. Even the Son of God needed to pray in His darkest hour.',
      es: 'Jesús nos muestra cómo enfrentar el miedo y el sufrimiento: a través de la oración sincera y la entrega a Dios. Incluso el Hijo de Dios necesitó orar en su hora más oscura.',
    },
    fruit: { en: 'Sorrow for Sin / Conformity to God\'s Will', es: 'Dolor por el Pecado / Conformidad con la Voluntad de Dios' },
    scriptureReadings: [
      {
        passage: { en: 'Matthew 26:36–39', es: 'Mateo 26:36–39' },
        summary: {
          en: 'Jesus went with his disciples to Gethsemane and prayed: "My Father, if it is possible, let this cup pass from me; yet not as I will, but as you will."',
          es: 'Jesús fue con sus discípulos a Getsemaní y oró: "Padre mío, si es posible, que pase de mí este cáliz; pero no se haga como yo quiero, sino como quieres tú."',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Sorrowful Mysteries', es: 'Rosario Vaticano — Misterios Dolorosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'In Gethsemane, Jesus takes upon himself the full weight of human suffering and sin.',
          es: 'En Getsemaní, Jesús toma sobre sí todo el peso del sufrimiento y el pecado humano.',
        },
        url: VATICAN_SORROWFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The sorrowful mysteries help the faithful to relive the death of Jesus and reach the foot of the Cross.',
          es: 'Los misterios dolorosos ayudan a los fieles a revivir la muerte de Jesús y llegar al pie de la Cruz.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'What am I struggling to surrender to God right now?',
        'How can I bring my fears honestly to prayer instead of avoiding them?',
      ],
      es: [
        '¿Qué estoy luchando por entregar a Dios ahora mismo?',
        '¿Cómo puedo llevar mis miedos honestamente a la oración en vez de evitarlos?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'sorrowful',
    order: 2,
    slug: 'scourging-at-the-pillar',
    title: { en: 'The Scourging at the Pillar', es: 'La Flagelación' },
    summary: {
      en: 'Pilate orders Jesus to be scourged. Jesus endures brutal physical suffering in silence, taking upon himself the punishment we deserve.',
      es: 'Pilato ordena que Jesús sea azotado. Jesús soporta un brutal sufrimiento físico en silencio, tomando sobre sí el castigo que merecemos.',
    },
    whatItTeaches: {
      en: 'Jesus suffered bodily pain out of love for us. This mystery calls us to recognize the weight of sin and the depth of God\'s mercy.',
      es: 'Jesús sufrió dolor corporal por amor a nosotros. Este misterio nos llama a reconocer el peso del pecado y la profundidad de la misericordia de Dios.',
    },
    fruit: { en: 'Purity / Mortification', es: 'Pureza / Mortificación' },
    scriptureReadings: [
      {
        passage: { en: 'Matthew 27:26', es: 'Mateo 27:26' },
        summary: {
          en: 'Pilate released Barabbas, and after having Jesus scourged, he handed him over to be crucified.',
          es: 'Pilato liberó a Barrabás, y después de hacer azotar a Jesús, lo entregó para que fuera crucificado.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Sorrowful Mysteries', es: 'Rosario Vaticano — Misterios Dolorosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The scourging reveals the cost of sin and the boundless love of Christ who bears it for us.',
          es: 'La flagelación revela el costo del pecado y el amor sin límites de Cristo que lo carga por nosotros.',
        },
        url: VATICAN_SORROWFUL,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'What small sacrifice can I offer today in union with Christ\'s suffering?',
        'How does Jesus\' patience in suffering challenge me when I face hardship?',
      ],
      es: [
        '¿Qué pequeño sacrificio puedo ofrecer hoy en unión con el sufrimiento de Cristo?',
        '¿Cómo me desafía la paciencia de Jesús en el sufrimiento cuando enfrento dificultades?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'sorrowful',
    order: 3,
    slug: 'crowning-with-thorns',
    title: { en: 'The Crowning with Thorns', es: 'La Coronación de Espinas' },
    summary: {
      en: 'The soldiers weave a crown of thorns and press it onto Jesus\' head, mocking him as "King of the Jews." Jesus endures the humiliation in silence.',
      es: 'Los soldados tejen una corona de espinas y la presionan sobre la cabeza de Jesús, burlándose de él como "Rey de los judíos." Jesús soporta la humillación en silencio.',
    },
    whatItTeaches: {
      en: 'Jesus, the true King, accepts mockery and humiliation. This mystery teaches us that real strength is found in humility, not in worldly power.',
      es: 'Jesús, el verdadero Rey, acepta la burla y la humillación. Este misterio nos enseña que la verdadera fuerza se encuentra en la humildad, no en el poder mundano.',
    },
    fruit: { en: 'Moral Courage', es: 'Valor Moral' },
    scriptureReadings: [
      {
        passage: { en: 'Matthew 27:27–29', es: 'Mateo 27:27–29' },
        summary: {
          en: 'The soldiers wove a crown of thorns and placed it on his head, knelt before him, and mocked him: "Hail, King of the Jews!"',
          es: 'Los soldados tejieron una corona de espinas y se la pusieron en la cabeza, se arrodillaron ante él y se burlaron: "¡Salve, Rey de los judíos!"',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Sorrowful Mysteries', es: 'Rosario Vaticano — Misterios Dolorosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Christ\'s kingship is revealed precisely in His humiliation and total self-giving.',
          es: 'La realeza de Cristo se revela precisamente en su humillación y entrega total.',
        },
        url: VATICAN_SORROWFUL,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'Where do I need moral courage to stand up for what is right?',
        'How do I respond when I am mocked or misunderstood for my faith?',
      ],
      es: [
        '¿Dónde necesito valor moral para defender lo que es correcto?',
        '¿Cómo respondo cuando se burlan de mí o me malinterpretan por mi fe?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'sorrowful',
    order: 4,
    slug: 'carrying-of-the-cross',
    title: { en: 'The Carrying of the Cross', es: 'Jesús con la Cruz a Cuestas' },
    summary: {
      en: 'Jesus carries the heavy cross through the streets of Jerusalem toward Calvary. Simon of Cyrene is pressed into service to help carry the cross.',
      es: 'Jesús carga la pesada cruz por las calles de Jerusalén hacia el Calvario. Simón de Cirene es obligado a ayudar a cargar la cruz.',
    },
    whatItTeaches: {
      en: 'Every person has a cross to bear. Jesus invites us to carry ours with patience and love, and to help others carry theirs, like Simon of Cyrene.',
      es: 'Cada persona tiene una cruz que cargar. Jesús nos invita a cargar la nuestra con paciencia y amor, y a ayudar a otros a cargar las suyas, como Simón de Cirene.',
    },
    fruit: { en: 'Patience', es: 'Paciencia' },
    scriptureReadings: [
      {
        passage: { en: 'Mark 15:21–22', es: 'Marcos 15:21–22' },
        summary: {
          en: 'They pressed Simon of Cyrene into service to carry the cross, and brought Jesus to the place called Golgotha.',
          es: 'Obligaron a Simón de Cirene a cargar la cruz, y llevaron a Jesús al lugar llamado Gólgota.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Sorrowful Mysteries', es: 'Rosario Vaticano — Misterios Dolorosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'In the Way of the Cross, Jesus teaches us that suffering accepted with love becomes redemptive.',
          es: 'En el Camino de la Cruz, Jesús nos enseña que el sufrimiento aceptado con amor se vuelve redentor.',
        },
        url: VATICAN_SORROWFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'USCCB — How to Pray the Rosary', es: 'USCCB — Cómo Rezar el Rosario' },
        author: { en: 'USCCB', es: 'USCCB' },
        excerpt: {
          en: 'We are called to take up our cross daily and follow Christ.',
          es: 'Estamos llamados a tomar nuestra cruz cada día y seguir a Cristo.',
        },
        url: USCCB_ROSARY,
        type: 'usccb',
      },
    ],
    reflectionPrompts: {
      en: [
        'What cross am I carrying right now? Can I offer it to God?',
        'Who is the "Simon of Cyrene" in my life — and whose cross can I help carry?',
      ],
      es: [
        '¿Qué cruz estoy cargando ahora? ¿Puedo ofrecerla a Dios?',
        '¿Quién es el "Simón de Cirene" en mi vida — y la cruz de quién puedo ayudar a cargar?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'sorrowful',
    order: 5,
    slug: 'crucifixion',
    title: { en: 'The Crucifixion and Death', es: 'La Crucifixión y Muerte de Jesús' },
    summary: {
      en: 'Jesus is nailed to the cross and dies after three hours of agony. He forgives those who crucify him and commends his spirit to the Father.',
      es: 'Jesús es clavado en la cruz y muere después de tres horas de agonía. Perdona a quienes lo crucifican y encomienda su espíritu al Padre.',
    },
    whatItTeaches: {
      en: 'The cross is the ultimate sign of God\'s love. Jesus gave everything — His very life — so that we might be saved. There is no greater love.',
      es: 'La cruz es el signo máximo del amor de Dios. Jesús dio todo — su propia vida — para que pudiéramos ser salvados. No hay amor más grande.',
    },
    fruit: { en: 'Salvation / Self-denial', es: 'Salvación / Abnegación' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 23:33–46', es: 'Lucas 23:33–46' },
        summary: {
          en: 'At the place called the Skull, they crucified him. Jesus cried out: "Father, into your hands I commend my spirit," and breathed his last.',
          es: 'En el lugar llamado la Calavera, lo crucificaron. Jesús exclamó: "Padre, en tus manos encomiendo mi espíritu," y expiró.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Sorrowful Mysteries', es: 'Rosario Vaticano — Misterios Dolorosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'On the Cross, Jesus completes the sacrifice that reconciles humanity with God.',
          es: 'En la Cruz, Jesús completa el sacrificio que reconcilia a la humanidad con Dios.',
        },
        url: VATICAN_SORROWFUL,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The Rosary leads the faithful to gaze upon Christ crucified, the source of all grace.',
          es: 'El Rosario lleva a los fieles a contemplar a Cristo crucificado, fuente de toda gracia.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'What does Jesus\' sacrifice on the cross mean for me personally?',
        'Is there someone I need to forgive, following Jesus\' example on the cross?',
      ],
      es: [
        '¿Qué significa personalmente para mí el sacrificio de Jesús en la cruz?',
        '¿Hay alguien a quien necesito perdonar, siguiendo el ejemplo de Jesús en la cruz?',
      ],
    },
    status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════
  // GLORIOUS MYSTERIES
  // ═══════════════════════════════════════════════════════════════
  {
    setKey: 'glorious',
    order: 1,
    slug: 'resurrection',
    title: { en: 'The Resurrection', es: 'La Resurrección' },
    summary: {
      en: 'On the third day, Jesus rises from the dead. The women find the empty tomb and hear the angel\'s message: "He is not here; he has risen."',
      es: 'Al tercer día, Jesús resucita de entre los muertos. Las mujeres encuentran el sepulcro vacío y escuchan el mensaje del ángel: "No está aquí; ha resucitado."',
    },
    whatItTeaches: {
      en: 'Death does not have the final word. The Resurrection is the foundation of our faith — proof that God\'s promises are true and that eternal life is real.',
      es: 'La muerte no tiene la última palabra. La Resurrección es el fundamento de nuestra fe — prueba de que las promesas de Dios son verdaderas y de que la vida eterna es real.',
    },
    fruit: { en: 'Faith', es: 'Fe' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 24:1–5', es: 'Lucas 24:1–5' },
        summary: {
          en: 'At daybreak, the women came to the tomb and found the stone rolled away. Two men in dazzling garments asked: "Why do you seek the living among the dead?"',
          es: 'Al amanecer, las mujeres llegaron al sepulcro y encontraron la piedra removida. Dos hombres con vestiduras resplandecientes preguntaron: "¿Por qué buscan entre los muertos al que vive?"',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Glorious Mysteries', es: 'Rosario Vaticano — Misterios Gloriosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The Resurrection is the crowning truth of our faith in Christ.',
          es: 'La Resurrección es la verdad culminante de nuestra fe en Cristo.',
        },
        url: VATICAN_GLORIOUS,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The glorious mysteries lead the faithful to hope for eternal life promised by the Risen Christ.',
          es: 'Los misterios gloriosos llevan a los fieles a la esperanza de la vida eterna prometida por Cristo Resucitado.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'What area of my life feels "dead" and needs the hope of the Resurrection?',
        'How does believing in the Resurrection change the way I face daily challenges?',
      ],
      es: [
        '¿Qué área de mi vida se siente "muerta" y necesita la esperanza de la Resurrección?',
        '¿Cómo cambia la creencia en la Resurrección la forma en que enfrento los desafíos diarios?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'glorious',
    order: 2,
    slug: 'ascension',
    title: { en: 'The Ascension', es: 'La Ascensión' },
    summary: {
      en: 'Forty days after the Resurrection, Jesus ascends into heaven, taking his seat at the right hand of the Father. He promises to send the Holy Spirit.',
      es: 'Cuarenta días después de la Resurrección, Jesús asciende al cielo y se sienta a la derecha del Padre. Promete enviar al Espíritu Santo.',
    },
    whatItTeaches: {
      en: 'Jesus returned to the Father but did not abandon us. The Ascension reminds us that heaven is our true home and that Jesus continues to intercede for us.',
      es: 'Jesús regresó al Padre pero no nos abandonó. La Ascensión nos recuerda que el cielo es nuestro verdadero hogar y que Jesús sigue intercediendo por nosotros.',
    },
    fruit: { en: 'Hope / Desire for Heaven', es: 'Esperanza / Deseo del Cielo' },
    scriptureReadings: [
      {
        passage: { en: 'Mark 16:19', es: 'Marcos 16:19' },
        summary: {
          en: 'The Lord Jesus, after speaking to them, was taken up into heaven and took his seat at the right hand of God.',
          es: 'El Señor Jesús, después de hablarles, fue llevado al cielo y se sentó a la derecha de Dios.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Glorious Mysteries', es: 'Rosario Vaticano — Misterios Gloriosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Christ ascends to the Father to prepare a place for all who follow Him.',
          es: 'Cristo asciende al Padre para preparar un lugar para todos los que lo siguen.',
        },
        url: VATICAN_GLORIOUS,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'Am I living with my heart set on eternal things or only on what\'s temporary?',
        'How can I be Christ\'s presence in the world while He reigns in heaven?',
      ],
      es: [
        '¿Estoy viviendo con el corazón puesto en las cosas eternas o solo en lo temporal?',
        '¿Cómo puedo ser la presencia de Cristo en el mundo mientras Él reina en el cielo?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'glorious',
    order: 3,
    slug: 'descent-of-the-holy-spirit',
    title: { en: 'The Descent of the Holy Spirit', es: 'La Venida del Espíritu Santo' },
    summary: {
      en: 'On Pentecost, the Holy Spirit descends upon the apostles gathered with Mary. They are filled with courage and begin proclaiming the Gospel.',
      es: 'En Pentecostés, el Espíritu Santo desciende sobre los apóstoles reunidos con María. Son llenos de valor y comienzan a proclamar el Evangelio.',
    },
    whatItTeaches: {
      en: 'The Holy Spirit transforms fear into boldness. God gives us the same Spirit to be witnesses of Christ in our daily lives, our families, and our communities.',
      es: 'El Espíritu Santo transforma el miedo en valentía. Dios nos da el mismo Espíritu para ser testigos de Cristo en nuestra vida diaria, nuestras familias y nuestras comunidades.',
    },
    fruit: { en: 'Wisdom / Zeal', es: 'Sabiduría / Celo Apostólico' },
    scriptureReadings: [
      {
        passage: { en: 'Acts 2:1–4', es: 'Hechos 2:1–4' },
        summary: {
          en: 'When Pentecost came, they were all together. A noise like a strong wind filled the house, and they were all filled with the Holy Spirit.',
          es: 'Cuando llegó Pentecostés, estaban todos reunidos. Un ruido como de un viento recio llenó la casa, y todos fueron llenos del Espíritu Santo.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Glorious Mysteries', es: 'Rosario Vaticano — Misterios Gloriosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Pentecost marks the birth of the Church, empowered by the Spirit.',
          es: 'Pentecostés marca el nacimiento de la Iglesia, fortalecida por el Espíritu.',
        },
        url: VATICAN_GLORIOUS,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'USCCB — How to Pray the Rosary', es: 'USCCB — Cómo Rezar el Rosario' },
        author: { en: 'USCCB', es: 'USCCB' },
        excerpt: {
          en: 'The Holy Spirit gives each of us gifts to build up the Body of Christ.',
          es: 'El Espíritu Santo da a cada uno de nosotros dones para edificar el Cuerpo de Cristo.',
        },
        url: USCCB_ROSARY,
        type: 'usccb',
      },
    ],
    reflectionPrompts: {
      en: [
        'Where do I need the Holy Spirit\'s courage in my life?',
        'What gifts has the Spirit given me that I\'m not fully using?',
      ],
      es: [
        '¿Dónde necesito el valor del Espíritu Santo en mi vida?',
        '¿Qué dones me ha dado el Espíritu que no estoy usando plenamente?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'glorious',
    order: 4,
    slug: 'assumption',
    title: { en: 'The Assumption', es: 'La Asunción de María' },
    summary: {
      en: 'At the end of her earthly life, Mary is taken body and soul into heavenly glory. She who bore Christ in her womb is now united with Him in heaven.',
      es: 'Al final de su vida terrenal, María es llevada en cuerpo y alma a la gloria celestial. Ella que llevó a Cristo en su vientre ahora está unida con Él en el cielo.',
    },
    whatItTeaches: {
      en: 'Mary\'s Assumption shows us what God promises to all the faithful: that our bodies, too, are destined for glory. Our physical life matters to God.',
      es: 'La Asunción de María nos muestra lo que Dios promete a todos los fieles: que nuestros cuerpos también están destinados a la gloria. Nuestra vida física le importa a Dios.',
    },
    fruit: { en: 'Grace of a Happy Death / Devotion to Mary', es: 'Gracia de una Buena Muerte / Devoción a María' },
    scriptureReadings: [
      {
        passage: { en: 'Luke 1:48–49', es: 'Lucas 1:48–49' },
        summary: {
          en: 'Mary proclaimed: "The Mighty One has done great things for me. From now on all generations will call me blessed."',
          es: 'María proclamó: "El Poderoso ha hecho grandes cosas por mí. Desde ahora todas las generaciones me llamarán bienaventurada."',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Glorious Mysteries', es: 'Rosario Vaticano — Misterios Gloriosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Mary\'s Assumption is a sign of hope and comfort for the pilgrim Church on earth.',
          es: 'La Asunción de María es signo de esperanza y consuelo para la Iglesia peregrina en la tierra.',
        },
        url: VATICAN_GLORIOUS,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'Do I treat my body as a temple of the Holy Spirit?',
        'How does Mary\'s example inspire me to live faithfully until the end?',
      ],
      es: [
        '¿Trato mi cuerpo como templo del Espíritu Santo?',
        '¿Cómo me inspira el ejemplo de María a vivir fielmente hasta el final?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'glorious',
    order: 5,
    slug: 'coronation',
    title: { en: 'The Coronation of Mary', es: 'La Coronación de María' },
    summary: {
      en: 'Mary is crowned Queen of Heaven and Earth. She reigns with her Son and intercedes for all her children — the entire Church.',
      es: 'María es coronada Reina del Cielo y de la Tierra. Reina con su Hijo e intercede por todos sus hijos — toda la Iglesia.',
    },
    whatItTeaches: {
      en: 'God honors those who serve Him faithfully. Mary\'s coronation is the fulfillment of her "yes" at the Annunciation — a reminder that humble service leads to glory.',
      es: 'Dios honra a quienes le sirven fielmente. La coronación de María es el cumplimiento de su "sí" en la Anunciación — un recordatorio de que el servicio humilde lleva a la gloria.',
    },
    fruit: { en: 'Trust in Mary\'s Intercession', es: 'Confianza en la Intercesión de María' },
    scriptureReadings: [
      {
        passage: { en: 'Revelation 12:1', es: 'Apocalipsis 12:1' },
        summary: {
          en: 'A great sign appeared in the sky: a woman clothed with the sun, the moon under her feet, a crown of twelve stars on her head.',
          es: 'Una gran señal apareció en el cielo: una mujer vestida del sol, la luna bajo sus pies, una corona de doce estrellas sobre su cabeza.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Glorious Mysteries', es: 'Rosario Vaticano — Misterios Gloriosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Mary is crowned Queen because of her unique role in salvation history and her perfect fidelity.',
          es: 'María es coronada Reina por su papel único en la historia de la salvación y su fidelidad perfecta.',
        },
        url: VATICAN_GLORIOUS,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'In the Rosary, Mary continues to lead us to Christ and to the glory of the Father.',
          es: 'En el Rosario, María continúa guiándonos a Cristo y a la gloria del Padre.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'Do I ask for Mary\'s intercession in my daily struggles?',
        'How can I serve others with the same humility Mary showed?',
      ],
      es: [
        '¿Pido la intercesión de María en mis luchas diarias?',
        '¿Cómo puedo servir a los demás con la misma humildad que mostró María?',
      ],
    },
    status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════
  // LUMINOUS MYSTERIES
  // ═══════════════════════════════════════════════════════════════
  {
    setKey: 'luminous',
    order: 1,
    slug: 'baptism-in-the-jordan',
    title: { en: 'The Baptism in the Jordan', es: 'El Bautismo en el Jordán' },
    summary: {
      en: 'Jesus is baptized by John in the Jordan River. The heavens open, the Spirit descends like a dove, and the Father\'s voice declares: "This is my beloved Son."',
      es: 'Jesús es bautizado por Juan en el río Jordán. Los cielos se abren, el Espíritu desciende como paloma, y la voz del Padre declara: "Este es mi Hijo amado."',
    },
    whatItTeaches: {
      en: 'At our own baptism, we too were claimed as God\'s beloved children. This mystery invites us to live out our baptismal identity with confidence.',
      es: 'En nuestro propio bautismo, nosotros también fuimos reclamados como hijos amados de Dios. Este misterio nos invita a vivir nuestra identidad bautismal con confianza.',
    },
    fruit: { en: 'Openness to the Holy Spirit', es: 'Apertura al Espíritu Santo' },
    scriptureReadings: [
      {
        passage: { en: 'Matthew 3:16–17', es: 'Mateo 3:16–17' },
        summary: {
          en: 'After Jesus was baptized, the heavens opened and the Spirit descended like a dove. A voice said: "This is my beloved Son."',
          es: 'Después de que Jesús fue bautizado, los cielos se abrieron y el Espíritu descendió como paloma. Una voz dijo: "Este es mi Hijo amado."',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Luminous Mysteries', es: 'Rosario Vaticano — Misterios Luminosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The Baptism in the Jordan is the first mystery of light, revealing Christ as the beloved Son.',
          es: 'El Bautismo en el Jordán es el primer misterio de luz, que revela a Cristo como el Hijo amado.',
        },
        url: VATICAN_LUMINOUS,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The mysteries of light guide us through Christ\'s public ministry from Baptism to Eucharist.',
          es: 'Los misterios de luz nos guían a través del ministerio público de Cristo desde el Bautismo hasta la Eucaristía.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'Do I live as if I truly believe I am God\'s beloved child?',
        'How can I be more open to the Holy Spirit\'s guidance today?',
      ],
      es: [
        '¿Vivo como si realmente creyera que soy hijo amado de Dios?',
        '¿Cómo puedo estar más abierto a la guía del Espíritu Santo hoy?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'luminous',
    order: 2,
    slug: 'wedding-at-cana',
    title: { en: 'The Wedding at Cana', es: 'Las Bodas de Caná' },
    summary: {
      en: 'At a wedding feast, the wine runs out. Mary tells the servants, "Do whatever he tells you." Jesus performs his first sign, turning water into wine.',
      es: 'En una fiesta de bodas, el vino se acaba. María dice a los sirvientes: "Hagan lo que él les diga." Jesús realiza su primera señal, convirtiendo el agua en vino.',
    },
    whatItTeaches: {
      en: 'Mary\'s words — "Do whatever he tells you" — are her instruction to all of us. When we follow Jesus, He transforms the ordinary into the extraordinary.',
      es: 'Las palabras de María — "Hagan lo que él les diga" — son su instrucción para todos nosotros. Cuando seguimos a Jesús, Él transforma lo ordinario en extraordinario.',
    },
    fruit: { en: 'To Jesus Through Mary / Fidelity', es: 'A Jesús por María / Fidelidad' },
    scriptureReadings: [
      {
        passage: { en: 'John 2:1–5', es: 'Juan 2:1–5' },
        summary: {
          en: 'When the wine ran short, Mary told the servants: "Do whatever he tells you." Jesus then performed his first sign.',
          es: 'Cuando se acabó el vino, María dijo a los sirvientes: "Hagan lo que él les diga." Jesús realizó entonces su primera señal.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Luminous Mysteries', es: 'Rosario Vaticano — Misterios Luminosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'At Cana, Mary\'s faith opens the way for Christ\'s first manifestation of glory.',
          es: 'En Caná, la fe de María abre el camino para la primera manifestación de la gloria de Cristo.',
        },
        url: VATICAN_LUMINOUS,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'What does Mary\'s instruction — "Do whatever he tells you" — mean for my life today?',
        'Where is Jesus inviting me to trust Him with something ordinary?',
      ],
      es: [
        '¿Qué significa para mi vida hoy la instrucción de María: "Hagan lo que él les diga"?',
        '¿Dónde me invita Jesús a confiar en Él con algo ordinario?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'luminous',
    order: 3,
    slug: 'proclamation-of-the-kingdom',
    title: { en: 'The Proclamation of the Kingdom', es: 'La Proclamación del Reino' },
    summary: {
      en: 'Jesus proclaims that the Kingdom of God is at hand and calls everyone to repentance and faith in the Gospel. He teaches, heals, and forgives.',
      es: 'Jesús proclama que el Reino de Dios está cerca y llama a todos al arrepentimiento y la fe en el Evangelio. Enseña, sana y perdona.',
    },
    whatItTeaches: {
      en: 'The Kingdom of God begins here and now, in our hearts. Jesus calls each of us to conversion — to turn away from sin and toward a life of love and mercy.',
      es: 'El Reino de Dios comienza aquí y ahora, en nuestros corazones. Jesús nos llama a cada uno a la conversión — a alejarnos del pecado y hacia una vida de amor y misericordia.',
    },
    fruit: { en: 'Conversion / Repentance', es: 'Conversión / Arrepentimiento' },
    scriptureReadings: [
      {
        passage: { en: 'Mark 1:15', es: 'Marcos 1:15' },
        summary: {
          en: 'Jesus proclaimed: "The kingdom of God is at hand. Repent, and believe in the gospel."',
          es: 'Jesús proclamó: "El reino de Dios está cerca. Arrepiéntanse y crean en el evangelio."',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Luminous Mysteries', es: 'Rosario Vaticano — Misterios Luminosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'Christ\'s call to conversion is the heart of His public ministry.',
          es: 'El llamado de Cristo a la conversión es el corazón de su ministerio público.',
        },
        url: VATICAN_LUMINOUS,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'USCCB — How to Pray the Rosary', es: 'USCCB — Cómo Rezar el Rosario' },
        author: { en: 'USCCB', es: 'USCCB' },
        excerpt: {
          en: 'Jesus invites us to repentance and to embrace the mercy of God.',
          es: 'Jesús nos invita al arrepentimiento y a abrazar la misericordia de Dios.',
        },
        url: USCCB_ROSARY,
        type: 'usccb',
      },
    ],
    reflectionPrompts: {
      en: [
        'What is one area where I need to repent and turn back to God?',
        'How can I help build God\'s kingdom in my everyday interactions?',
      ],
      es: [
        '¿En qué área necesito arrepentirme y volver a Dios?',
        '¿Cómo puedo ayudar a construir el reino de Dios en mis interacciones diarias?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'luminous',
    order: 4,
    slug: 'transfiguration',
    title: { en: 'The Transfiguration', es: 'La Transfiguración' },
    summary: {
      en: 'Jesus takes Peter, James, and John up a high mountain. He is transfigured before them — his face shining like the sun, his clothes white as light.',
      es: 'Jesús lleva a Pedro, Santiago y Juan a un monte alto. Se transfigura ante ellos — su rostro brilla como el sol, sus vestidos blancos como la luz.',
    },
    whatItTeaches: {
      en: 'The Transfiguration gives us a glimpse of Christ\'s divine glory. It strengthens our faith for the difficult road ahead and reminds us of the glory that awaits.',
      es: 'La Transfiguración nos da un destello de la gloria divina de Cristo. Fortalece nuestra fe para el camino difícil que viene y nos recuerda la gloria que nos espera.',
    },
    fruit: { en: 'Desire for Holiness', es: 'Deseo de Santidad' },
    scriptureReadings: [
      {
        passage: { en: 'Matthew 17:1–2', es: 'Mateo 17:1–2' },
        summary: {
          en: 'Jesus was transfigured before them; his face shone like the sun and his clothes became white as light.',
          es: 'Jesús se transfiguró ante ellos; su rostro brilló como el sol y sus vestidos se volvieron blancos como la luz.',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Luminous Mysteries', es: 'Rosario Vaticano — Misterios Luminosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The glory of the Transfiguration prepares the disciples for the scandal of the Cross.',
          es: 'La gloria de la Transfiguración prepara a los discípulos para el escándalo de la Cruz.',
        },
        url: VATICAN_LUMINOUS,
        type: 'vatican',
      },
    ],
    reflectionPrompts: {
      en: [
        'When has God given me a "mountaintop moment" that strengthened my faith?',
        'Am I pursuing holiness or just settling for comfort?',
      ],
      es: [
        '¿Cuándo me ha dado Dios un "momento en la cima" que fortaleció mi fe?',
        '¿Estoy buscando la santidad o solo conformándome con la comodidad?',
      ],
    },
    status: 'published',
  },
  {
    setKey: 'luminous',
    order: 5,
    slug: 'institution-of-the-eucharist',
    title: { en: 'The Institution of the Eucharist', es: 'La Institución de la Eucaristía' },
    summary: {
      en: 'At the Last Supper, Jesus takes bread, blesses it, and says: "This is my body." He offers himself completely and commands his disciples to do the same in his memory.',
      es: 'En la Última Cena, Jesús toma pan, lo bendice y dice: "Esto es mi cuerpo." Se ofrece completamente y manda a sus discípulos hacer lo mismo en su memoria.',
    },
    whatItTeaches: {
      en: 'The Eucharist is Jesus\' greatest gift — His real presence with us. Every Mass is an invitation to receive Christ and become more like Him.',
      es: 'La Eucaristía es el regalo más grande de Jesús — su presencia real con nosotros. Cada Misa es una invitación a recibir a Cristo y ser más como Él.',
    },
    fruit: { en: 'Love of the Eucharist', es: 'Amor a la Eucaristía' },
    scriptureReadings: [
      {
        passage: { en: 'Matthew 26:26', es: 'Mateo 26:26' },
        summary: {
          en: 'Jesus took bread, blessed it, broke it, and gave it to his disciples: "Take and eat; this is my body."',
          es: 'Jesús tomó pan, lo bendijo, lo partió y lo dio a sus discípulos: "Tomen y coman; esto es mi cuerpo."',
        },
      },
    ],
    churchSources: [
      {
        sourceTitle: { en: 'Vatican Rosary — Luminous Mysteries', es: 'Rosario Vaticano — Misterios Luminosos' },
        author: { en: 'The Holy See', es: 'La Santa Sede' },
        excerpt: {
          en: 'The Eucharist is the heart of Christian life and the source of the Church\'s mission.',
          es: 'La Eucaristía es el corazón de la vida cristiana y la fuente de la misión de la Iglesia.',
        },
        url: VATICAN_LUMINOUS,
        type: 'vatican',
      },
      {
        sourceTitle: { en: 'Rosarium Virginis Mariae', es: 'Rosarium Virginis Mariae' },
        author: { en: 'St. John Paul II', es: 'San Juan Pablo II' },
        excerpt: {
          en: 'The Rosary and the Eucharist are inseparable — both lead us to contemplate the face of Christ.',
          es: 'El Rosario y la Eucaristía son inseparables — ambos nos llevan a contemplar el rostro de Cristo.',
        },
        url: ROSARIUM,
        type: 'papal_letter',
      },
    ],
    reflectionPrompts: {
      en: [
        'How can I prepare my heart better before receiving the Eucharist?',
        'What is Jesus inviting me to give of myself, the way He gave Himself at the Last Supper?',
      ],
      es: [
        '¿Cómo puedo preparar mejor mi corazón antes de recibir la Eucaristía?',
        '¿Qué me invita Jesús a dar de mí mismo, como Él se dio en la Última Cena?',
      ],
    },
    status: 'published',
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────

export function getMysteryDetail(setKey: MysterySet, slug: string): MysteryDetail | undefined {
  return MYSTERY_DETAILS.find((m) => m.setKey === setKey && m.slug === slug);
}

export function getMysteryDetailsBySet(setKey: MysterySet): MysteryDetail[] {
  return MYSTERY_DETAILS.filter((m) => m.setKey === setKey).sort((a, b) => a.order - b.order);
}

export function getAllMysteryDetails(): MysteryDetail[] {
  return MYSTERY_DETAILS;
}
