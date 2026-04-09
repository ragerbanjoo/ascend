// Full Litany of Loreto — Vatican official text (EN + ES)
// Source EN: https://www.vatican.va/special/rosary/documents/litanie-lauretane_en.html
// Source ES: https://www.vatican.va/special/rosary/documents/litanie-lauretane_sp.html

export type LitanyLineType = 'heading' | 'leader' | 'response' | 'pair';

export interface LitanyLine {
  type: LitanyLineType;
  leaderText: { en: string; es: string };
  responseText: { en: string; es: string };
}

export const LITANY_OF_LORETO: LitanyLine[] = [
  // ── Title ──
  {
    type: 'heading',
    leaderText: { en: 'The Litany of Loreto', es: 'Letanías de la Virgen' },
    responseText: { en: '', es: '' },
  },

  // ── Opening Invocations ──
  {
    type: 'pair',
    leaderText: { en: 'Lord, have mercy.', es: 'Señor, ten piedad.' },
    responseText: { en: 'Lord, have mercy.', es: 'Señor, ten piedad.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Christ, have mercy.', es: 'Cristo, ten piedad.' },
    responseText: { en: 'Christ, have mercy.', es: 'Cristo, ten piedad.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Lord, have mercy.', es: 'Señor, ten piedad.' },
    responseText: { en: 'Lord, have mercy.', es: 'Señor, ten piedad.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Christ, hear us.', es: 'Cristo, óyenos.' },
    responseText: { en: 'Christ, graciously hear us.', es: 'Cristo, escúchanos.' },
  },

  // ── Holy Trinity ──
  {
    type: 'heading',
    leaderText: { en: '', es: '' },
    responseText: { en: 'have mercy on us.', es: 'ten piedad de nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'God, the Father of heaven,', es: 'Dios, Padre celestial,' },
    responseText: { en: 'have mercy on us.', es: 'ten piedad de nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'God the Son, Redeemer of the world,', es: 'Dios, Hijo, Redentor del mundo,' },
    responseText: { en: 'have mercy on us.', es: 'ten piedad de nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'God the Holy Spirit,', es: 'Dios, Espíritu Santo,' },
    responseText: { en: 'have mercy on us.', es: 'ten piedad de nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Holy Trinity, one God,', es: 'Santísima Trinidad, un solo Dios,' },
    responseText: { en: 'have mercy on us.', es: 'ten piedad de nosotros.' },
  },

  // ── Marian Titles — "pray for us" section ──
  {
    type: 'heading',
    leaderText: { en: '', es: '' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Holy Mary,', es: 'Santa María,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Holy Mother of God,', es: 'Santa Madre de Dios,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Holy Virgin of virgins,', es: 'Santa Virgen de las Vírgenes,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of Christ,', es: 'Madre de Cristo,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of the Church,', es: 'Madre de la Iglesia,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of Mercy,', es: 'Madre de la misericordia,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of divine grace,', es: 'Madre de la divina gracia,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of Hope,', es: 'Madre de la esperanza,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother most pure,', es: 'Madre purísima,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother most chaste,', es: 'Madre castísima,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother inviolate,', es: 'Madre siempre virgen,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother undefiled,', es: 'Madre inmaculada,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother most amiable,', es: 'Madre amable,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother most admirable,', es: 'Madre admirable,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of good counsel,', es: 'Madre del buen consejo,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of our Creator,', es: 'Madre del Creador,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mother of our Saviour,', es: 'Madre del Salvador,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Virgin most prudent,', es: 'Virgen prudentísima,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Virgin most venerable,', es: 'Virgen digna de veneración,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Virgin most renowned,', es: 'Virgen digna de alabanza,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Virgin most powerful,', es: 'Virgen poderosa,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Virgin most merciful,', es: 'Virgen clemente,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Virgin most faithful,', es: 'Virgen fiel,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mirror of justice,', es: 'Espejo de justicia,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Seat of wisdom,', es: 'Trono de la sabiduría,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Cause of our joy,', es: 'Causa de nuestra alegría,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Spiritual vessel,', es: 'Vaso espiritual,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Vessel of honour,', es: 'Vaso digno de honor,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Singular vessel of devotion,', es: 'Vaso de insigne devoción,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Mystical rose,', es: 'Rosa mística,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Tower of David,', es: 'Torre de David,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Tower of ivory,', es: 'Torre de marfil,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'House of gold,', es: 'Casa de oro,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Ark of the covenant,', es: 'Arca de la Alianza,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Gate of heaven,', es: 'Puerta del cielo,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Morning star,', es: 'Estrella de la mañana,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Health of the sick,', es: 'Salud de los enfermos,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Refuge of sinners,', es: 'Refugio de los pecadores,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Solace of Migrants,', es: 'Consuelo de los migrantes,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Comfort of the afflicted,', es: 'Consoladora de los afligidos,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Help of Christians,', es: 'Auxilio de los cristianos,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Angels,', es: 'Reina de los Ángeles,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Patriarchs,', es: 'Reina de los Patriarcas,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Prophets,', es: 'Reina de los Profetas,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Apostles,', es: 'Reina de los Apóstoles,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Martyrs,', es: 'Reina de los Mártires,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Confessors,', es: 'Reina de los Confesores,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of Virgins,', es: 'Reina de las Vírgenes,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of all Saints,', es: 'Reina de todos los Santos,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen conceived without original sin,', es: 'Reina concebida sin pecado original,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen assumed into heaven,', es: 'Reina asunta a los Cielos,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of the most holy Rosary,', es: 'Reina del Santísimo Rosario,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of families,', es: 'Reina de la familia,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },
  {
    type: 'pair',
    leaderText: { en: 'Queen of peace,', es: 'Reina de la paz,' },
    responseText: { en: 'pray for us.', es: 'ruega por nosotros.' },
  },

  // ── Lamb of God ──
  {
    type: 'heading',
    leaderText: { en: '', es: '' },
    responseText: { en: '', es: '' },
  },
  {
    type: 'pair',
    leaderText: {
      en: 'Lamb of God, who takes away the sins of the world,',
      es: 'Cordero de Dios, que quitas el pecado del mundo,',
    },
    responseText: { en: 'spare us, O Lord.', es: 'perdónanos, Señor.' },
  },
  {
    type: 'pair',
    leaderText: {
      en: 'Lamb of God, who takes away the sins of the world,',
      es: 'Cordero de Dios, que quitas el pecado del mundo,',
    },
    responseText: { en: 'graciously hear us, O Lord.', es: 'escúchanos, Señor.' },
  },
  {
    type: 'pair',
    leaderText: {
      en: 'Lamb of God, who takes away the sins of the world,',
      es: 'Cordero de Dios, que quitas el pecado del mundo,',
    },
    responseText: { en: 'have mercy on us.', es: 'ten misericordia de nosotros.' },
  },

  // ── Concluding Versicle ──
  {
    type: 'pair',
    leaderText: {
      en: 'Pray for us, O holy Mother of God.',
      es: 'Ruega por nosotros, Santa Madre de Dios.',
    },
    responseText: {
      en: 'That we may be made worthy of the promises of Christ.',
      es: 'Para que seamos dignos de las promesas de Cristo.',
    },
  },

  // ── Concluding Prayer ──
  {
    type: 'heading',
    leaderText: { en: 'Let us pray.', es: 'ORACIÓN.' },
    responseText: { en: '', es: '' },
  },
  {
    type: 'leader',
    leaderText: {
      en: 'Grant, we beseech thee, O Lord God, that we, your servants, may enjoy perpetual health of mind and body; and by the glorious intercession of the Blessed Mary, ever Virgin, may be delivered from present sorrow, and obtain eternal joy. Through Christ our Lord. Amen.',
      es: 'Te rogamos nos concedas, Señor Dios nuestro, gozar de continua salud de alma y cuerpo, y por la gloriosa intercesión de la bienaventurada siempre Virgen María, vernos libres de las tristezas de la vida presente y disfrutar de las alegrías eternas. Por Cristo nuestro Señor. Amén.',
    },
    responseText: { en: '', es: '' },
  },
];
