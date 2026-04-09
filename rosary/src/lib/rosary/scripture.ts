// Scripture readings per mystery — CMS-ready structured data
// Each mystery can have one or more scripture readings with bilingual passage refs and summaries.

import type { MysterySet } from './types';

export interface MysteryScripture {
  id: string;
  passage: { en: string; es: string };
  summary: { en: string; es: string };
  usccbUrl?: string; // optional override; otherwise computed from passage
}

// Key format: "{mysterySet}_{mysteryNumber}" e.g. "joyful_1"
export type ScriptureKey = `${MysterySet}_${1 | 2 | 3 | 4 | 5}`;

export const MYSTERY_SCRIPTURE: Record<ScriptureKey, MysteryScripture[]> = {
  // ── JOYFUL ──
  joyful_1: [
    {
      id: 'joyful_1_a',
      passage: { en: 'Luke 1:26–27', es: 'Lucas 1:26–27' },
      summary: {
        en: 'The angel Gabriel was sent by God to a town in Galilee called Nazareth, to a virgin betrothed to a man named Joseph.',
        es: 'El ángel Gabriel fue enviado por Dios a una ciudad de Galilea llamada Nazaret, a una virgen desposada con un hombre llamado José.',
      },
    },
  ],
  joyful_2: [
    {
      id: 'joyful_2_a',
      passage: { en: 'Luke 1:39–42', es: 'Lucas 1:39–42' },
      summary: {
        en: 'Mary set out in haste to visit Elizabeth, who was filled with the Holy Spirit and proclaimed Mary blessed among women.',
        es: 'María partió con prontitud a visitar a Isabel, quien fue llena del Espíritu Santo y proclamó a María bendita entre las mujeres.',
      },
    },
  ],
  joyful_3: [
    {
      id: 'joyful_3_a',
      passage: { en: 'Luke 2:1–7', es: 'Lucas 2:1–7' },
      summary: {
        en: 'Joseph and Mary traveled to Bethlehem for the census. While there, the time came for Mary to give birth, and she laid her firstborn son in a manger.',
        es: 'José y María viajaron a Belén para el censo. Estando allí, se cumplió el tiempo del parto, y acostó a su hijo primogénito en un pesebre.',
      },
    },
  ],
  joyful_4: [
    {
      id: 'joyful_4_a',
      passage: { en: 'Luke 2:21–24', es: 'Lucas 2:21–24' },
      summary: {
        en: 'When the days of purification were completed, Joseph and Mary brought Jesus to Jerusalem to present him to the Lord according to the Law.',
        es: 'Cuando se cumplieron los días de la purificación, José y María llevaron a Jesús a Jerusalén para presentarlo al Señor según la Ley.',
      },
    },
  ],
  joyful_5: [
    {
      id: 'joyful_5_a',
      passage: { en: 'Luke 2:41–47', es: 'Lucas 2:41–47' },
      summary: {
        en: 'After three days of searching, Mary and Joseph found the boy Jesus in the Temple, sitting among the teachers, listening and asking questions.',
        es: 'Después de tres días de búsqueda, María y José encontraron al niño Jesús en el Templo, sentado entre los maestros, escuchando y haciendo preguntas.',
      },
    },
  ],

  // ── SORROWFUL ──
  sorrowful_1: [
    {
      id: 'sorrowful_1_a',
      passage: { en: 'Matthew 26:36–39', es: 'Mateo 26:36–39' },
      summary: {
        en: 'Jesus went with his disciples to Gethsemane and, falling prostrate in prayer, said: "My Father, if it is possible, let this cup pass from me."',
        es: 'Jesús fue con sus discípulos a Getsemaní y, postrándose en oración, dijo: "Padre mío, si es posible, que pase de mí este cáliz."',
      },
    },
  ],
  sorrowful_2: [
    {
      id: 'sorrowful_2_a',
      passage: { en: 'Matthew 27:26', es: 'Mateo 27:26' },
      summary: {
        en: 'Pilate released Barabbas to the crowd, and after having Jesus scourged, he handed him over to be crucified.',
        es: 'Pilato liberó a Barrabás para la multitud, y después de hacer azotar a Jesús, lo entregó para que fuera crucificado.',
      },
    },
  ],
  sorrowful_3: [
    {
      id: 'sorrowful_3_a',
      passage: { en: 'Matthew 27:27–29', es: 'Mateo 27:27–29' },
      summary: {
        en: 'The soldiers wove a crown out of thorns and placed it on his head, knelt before him, and mocked him, saying: "Hail, King of the Jews!"',
        es: 'Los soldados tejieron una corona de espinas y se la pusieron en la cabeza, se arrodillaron ante él y se burlaron diciendo: "¡Salve, Rey de los judíos!"',
      },
    },
  ],
  sorrowful_4: [
    {
      id: 'sorrowful_4_a',
      passage: { en: 'Mark 15:21–22', es: 'Marcos 15:21–22' },
      summary: {
        en: 'They pressed Simon of Cyrene into service to carry the cross, and brought Jesus to the place called Golgotha.',
        es: 'Obligaron a Simón de Cirene a cargar la cruz, y llevaron a Jesús al lugar llamado Gólgota.',
      },
    },
  ],
  sorrowful_5: [
    {
      id: 'sorrowful_5_a',
      passage: { en: 'Luke 23:33–46', es: 'Lucas 23:33–46' },
      summary: {
        en: 'When they came to the place called the Skull, they crucified him. Jesus cried out: "Father, into your hands I commend my spirit."',
        es: 'Cuando llegaron al lugar llamado la Calavera, lo crucificaron. Jesús exclamó: "Padre, en tus manos encomiendo mi espíritu."',
      },
    },
  ],

  // ── GLORIOUS ──
  glorious_1: [
    {
      id: 'glorious_1_a',
      passage: { en: 'Luke 24:1–5', es: 'Lucas 24:1–5' },
      summary: {
        en: 'At daybreak on the first day of the week, the women came to the tomb and found the stone rolled away. Two men in dazzling garments asked: "Why do you seek the living among the dead?"',
        es: 'Al amanecer del primer día de la semana, las mujeres llegaron al sepulcro y encontraron la piedra removida. Dos hombres con vestiduras resplandecientes preguntaron: "¿Por qué buscan entre los muertos al que vive?"',
      },
    },
  ],
  glorious_2: [
    {
      id: 'glorious_2_a',
      passage: { en: 'Mark 16:19', es: 'Marcos 16:19' },
      summary: {
        en: 'The Lord Jesus, after he spoke to them, was taken up into heaven and took his seat at the right hand of God.',
        es: 'El Señor Jesús, después de hablarles, fue llevado al cielo y se sentó a la derecha de Dios.',
      },
    },
  ],
  glorious_3: [
    {
      id: 'glorious_3_a',
      passage: { en: 'Acts 2:1–4', es: 'Hechos 2:1–4' },
      summary: {
        en: 'When the day of Pentecost came, they were all together. Suddenly a noise like a strong driving wind filled the house, and they were all filled with the Holy Spirit.',
        es: 'Al llegar el día de Pentecostés, estaban todos reunidos. De repente un ruido como de un viento recio llenó la casa, y todos fueron llenos del Espíritu Santo.',
      },
    },
  ],
  glorious_4: [
    {
      id: 'glorious_4_a',
      passage: { en: 'Luke 1:48–49', es: 'Lucas 1:48–49' },
      summary: {
        en: 'Mary proclaimed: "The Mighty One has done great things for me, and holy is his name. From now on all generations will call me blessed."',
        es: 'María proclamó: "El Poderoso ha hecho grandes cosas por mí, y santo es su nombre. Desde ahora todas las generaciones me llamarán bienaventurada."',
      },
    },
  ],
  glorious_5: [
    {
      id: 'glorious_5_a',
      passage: { en: 'Revelation 12:1', es: 'Apocalipsis 12:1' },
      summary: {
        en: 'A great sign appeared in the sky: a woman clothed with the sun, with the moon under her feet, and on her head a crown of twelve stars.',
        es: 'Una gran señal apareció en el cielo: una mujer vestida del sol, con la luna bajo sus pies, y sobre su cabeza una corona de doce estrellas.',
      },
    },
  ],

  // ── LUMINOUS ──
  luminous_1: [
    {
      id: 'luminous_1_a',
      passage: { en: 'Matthew 3:16–17', es: 'Mateo 3:16–17' },
      summary: {
        en: 'After Jesus was baptized, the heavens opened and the Spirit of God descended like a dove. A voice from heaven said: "This is my beloved Son."',
        es: 'Después de que Jesús fue bautizado, los cielos se abrieron y el Espíritu de Dios descendió como paloma. Una voz del cielo dijo: "Este es mi Hijo amado."',
      },
    },
  ],
  luminous_2: [
    {
      id: 'luminous_2_a',
      passage: { en: 'John 2:1–5', es: 'Juan 2:1–5' },
      summary: {
        en: 'At a wedding in Cana, when the wine ran short, Mary told the servants: "Do whatever he tells you." Jesus then performed his first sign.',
        es: 'En una boda en Caná, cuando se acabó el vino, María dijo a los sirvientes: "Hagan lo que él les diga." Jesús realizó entonces su primera señal.',
      },
    },
  ],
  luminous_3: [
    {
      id: 'luminous_3_a',
      passage: { en: 'Mark 1:15', es: 'Marcos 1:15' },
      summary: {
        en: 'Jesus proclaimed: "This is the time of fulfillment. The kingdom of God is at hand. Repent, and believe in the gospel."',
        es: 'Jesús proclamó: "Se ha cumplido el tiempo. El reino de Dios está cerca. Arrepiéntanse y crean en el evangelio."',
      },
    },
  ],
  luminous_4: [
    {
      id: 'luminous_4_a',
      passage: { en: 'Matthew 17:1–2', es: 'Mateo 17:1–2' },
      summary: {
        en: 'Jesus took Peter, James, and John up a high mountain. He was transfigured before them; his face shone like the sun and his clothes became white as light.',
        es: 'Jesús tomó a Pedro, Santiago y Juan a un monte alto. Se transfiguró ante ellos; su rostro brilló como el sol y sus vestidos se volvieron blancos como la luz.',
      },
    },
  ],
  luminous_5: [
    {
      id: 'luminous_5_a',
      passage: { en: 'Matthew 26:26', es: 'Mateo 26:26' },
      summary: {
        en: 'During the meal, Jesus took bread, blessed it, broke it, and gave it to his disciples, saying: "Take and eat; this is my body."',
        es: 'Durante la cena, Jesús tomó pan, lo bendijo, lo partió y lo dio a sus discípulos, diciendo: "Tomen y coman; esto es mi cuerpo."',
      },
    },
  ],
};

/** Get scripture readings for a specific mystery */
export function getScriptureForMystery(
  mysterySet: MysterySet,
  mysteryNumber: 1 | 2 | 3 | 4 | 5
): MysteryScripture[] {
  const key = `${mysterySet}_${mysteryNumber}` as ScriptureKey;
  return MYSTERY_SCRIPTURE[key] || [];
}
