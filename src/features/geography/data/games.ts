export type GeographyGameId = "paesaggi" | "orientamento" | "punti-cardinali" | "bandiere";

export type Direction = "nord" | "est" | "sud" | "ovest";

export type Entry = {
  id: string;
  /** La domanda mostrata e letta ad alta voce. */
  prompt: string;
  /** La risposta giusta, come appare sul pulsante. */
  answer: string;
  /**
   * Tre alternative sbagliate. Se mancano, il round le pesca tra le risposte
   * delle altre voci dello stesso gioco (paesaggi e bandiere).
   */
  options?: readonly string[];
  image?: string;
  /** Mostra la rosa dei venti con questo punto colorato e nascosto. */
  compass?: Direction;
  /** Un indizio breve sotto la domanda. */
  hint?: string;
  /** La spiegazione mostrata e letta dopo la risposta. */
  note: string;
};

export type Game = {
  id: GeographyGameId;
  title: string;
  focus: string;
  description: string;
  label: string;
  intro: string;
  sticker: string;
  entries: Entry[];
};

const LANDSCAPE = "Che paesaggio è?";
const FLAG = "Di quale paese è questa bandiera?";
const BALL = "Dove si trova la palla?";
const CARDINALS = ["Nord", "Est", "Sud", "Ovest"] as const;

function others(answer: string, pool: readonly string[]): string[] {
  return pool.filter((value) => value !== answer);
}

/** `of` è il nome con la preposizione giusta: "dell'Italia", "del Canada", "dei Paesi Bassi". */
function flag(id: string, country: string, of: string, capital: string, hint: string): Entry {
  return {
    id,
    prompt: FLAG,
    answer: country,
    image: id,
    hint,
    note: `È la bandiera ${of}: la capitale è ${capital}.`,
  };
}

export const games: Game[] = [
  {
    id: "paesaggi",
    title: "I paesaggi",
    focus: "MARE / MONTAGNA / CITTÀ",
    description: "Mare, montagna, deserto, vulcano: guarda l'immagine e riconosci il paesaggio.",
    label: "Che paesaggio è?",
    intro: "Guarda bene l'immagine: è acqua, terra, roccia o città?",
    sticker: "mare e montagna",
    entries: [
      {
        id: "mare",
        prompt: LANDSCAPE,
        answer: "il mare",
        image: "sea",
        hint: "Ha le onde e l'acqua è salata.",
        note: "Il MARE è una grande distesa di acqua salata.",
      },
      {
        id: "montagna",
        prompt: LANDSCAPE,
        answer: "la montagna",
        image: "mountain",
        hint: "È molto alta e in cima c'è la neve.",
        note: "La MONTAGNA è un rilievo molto alto: spesso in cima c'è la neve.",
      },
      {
        id: "spiaggia",
        prompt: LANDSCAPE,
        answer: "la spiaggia",
        image: "beach",
        hint: "C'è la sabbia e si fa il bagno.",
        note: "La SPIAGGIA è la riva del mare, fatta di sabbia o sassi.",
      },
      {
        id: "isola",
        prompt: LANDSCAPE,
        answer: "l'isola",
        image: "island",
        hint: "È circondata dall'acqua.",
        note: "L'ISOLA è una terra circondata dall'acqua da tutte le parti.",
      },
      {
        id: "lago",
        prompt: LANDSCAPE,
        answer: "il lago",
        image: "lake",
        hint: "È acqua dolce circondata dalla terra.",
        note: "Il LAGO è acqua dolce ferma, circondata dalla terra.",
      },
      {
        id: "fiume",
        prompt: LANDSCAPE,
        answer: "il fiume",
        image: "river",
        hint: "È acqua dolce che scorre fino al mare.",
        note: "Il FIUME è acqua dolce che scorre dalla montagna fino al mare.",
      },
      {
        id: "cascata",
        prompt: LANDSCAPE,
        answer: "la cascata",
        image: "waterfall",
        hint: "L'acqua cade dall'alto.",
        note: "La CASCATA è un salto del fiume: l'acqua cade dall'alto.",
      },
      {
        id: "bosco",
        prompt: LANDSCAPE,
        answer: "il bosco",
        image: "forest",
        hint: "Ci sono tantissimi alberi.",
        note: "Il BOSCO è un luogo pieno di alberi, dove vivono tanti animali.",
      },
      {
        id: "deserto",
        prompt: LANDSCAPE,
        answer: "il deserto",
        image: "desert",
        hint: "Fa caldo e piove pochissimo.",
        note: "Il DESERTO è una terra secca, con poca acqua e tanta sabbia o roccia.",
      },
      {
        id: "vulcano",
        prompt: LANDSCAPE,
        answer: "il vulcano",
        image: "volcano",
        hint: "Dalla cima può uscire la lava.",
        note: "Il VULCANO è una montagna da cui può uscire la lava. In Italia c'è l'Etna.",
      },
      {
        id: "grotta",
        prompt: LANDSCAPE,
        answer: "la grotta",
        image: "cave",
        hint: "È un buco buio nella roccia.",
        note: "La GROTTA è una cavità nella roccia, spesso buia e fresca.",
      },
      {
        id: "campagna",
        prompt: LANDSCAPE,
        answer: "la campagna",
        image: "countryside",
        hint: "Ci sono prati, campi e fattorie.",
        note: "La CAMPAGNA è fatta di prati e campi coltivati, lontano dalla città.",
      },
      {
        id: "citta",
        prompt: LANDSCAPE,
        answer: "la città",
        image: "city",
        hint: "Ci sono palazzi alti, strade e negozi.",
        note: "La CITTÀ ha tante case, palazzi, strade e negozi: ci vivono molte persone.",
      },
    ],
  },
  {
    id: "orientamento",
    title: "Sopra, sotto, accanto",
    focus: "DENTRO / SOPRA / DESTRA",
    description: "Dentro, sotto, davanti, dietro, a destra: dove si trova la palla?",
    label: "Dove si trova?",
    intro: "Guarda la palla e la scatola, poi scegli la parola giusta.",
    sticker: "dentro o fuori?",
    entries: [
      {
        id: "dentro",
        prompt: BALL,
        answer: "dentro la scatola",
        options: ["sulla scatola", "sotto la scatola", "dietro la scatola"],
        image: "ball-in-box",
        note: "DENTRO: la palla è nella scatola.",
      },
      {
        id: "sulla",
        prompt: BALL,
        answer: "sulla scatola",
        options: ["dentro la scatola", "sotto la scatola", "accanto alla scatola"],
        image: "ball-on-box",
        note: "SULLA scatola: la palla è appoggiata sopra e la tocca.",
      },
      {
        id: "sopra",
        prompt: BALL,
        answer: "sopra la scatola",
        options: ["sotto la scatola", "dentro la scatola", "davanti alla scatola"],
        image: "ball-above-box",
        note: "SOPRA: la palla sta più in alto della scatola, senza toccarla.",
      },
      {
        id: "sotto",
        prompt: BALL,
        answer: "sotto la scatola",
        options: ["sopra la scatola", "dentro la scatola", "accanto alla scatola"],
        image: "ball-under-box",
        note: "SOTTO: la palla sta più in basso della scatola.",
      },
      {
        id: "accanto",
        prompt: BALL,
        answer: "accanto alla scatola",
        options: ["dentro la scatola", "sopra la scatola", "tra le scatole"],
        image: "ball-next-to-box",
        note: "ACCANTO: la palla è vicina, di fianco alla scatola.",
      },
      {
        id: "davanti",
        prompt: BALL,
        answer: "davanti alla scatola",
        options: ["dietro la scatola", "dentro la scatola", "sopra la scatola"],
        image: "ball-in-front-of-box",
        note: "DAVANTI: la palla è tra te e la scatola, la vedi tutta.",
      },
      {
        id: "dietro",
        prompt: BALL,
        answer: "dietro la scatola",
        options: ["davanti alla scatola", "sotto la scatola", "accanto alla scatola"],
        image: "ball-behind-box",
        note: "DIETRO: la scatola copre un pezzo della palla.",
      },
      {
        id: "tra",
        prompt: BALL,
        answer: "tra le scatole",
        options: ["dentro la scatola", "sopra la scatola", "dietro la scatola"],
        image: "ball-between-boxes",
        note: "TRA (o FRA): la palla è in mezzo alle due scatole.",
      },
      {
        id: "destra",
        prompt: "Da che parte indica il dito?",
        answer: "a destra",
        options: ["a sinistra", "in alto", "in basso"],
        image: "point-right",
        hint: "Pensa alla mano con cui scrivi: per molti è la destra.",
        note: "DESTRA: il dito indica dalla parte della mano destra.",
      },
      {
        id: "sinistra",
        prompt: "Da che parte indica il dito?",
        answer: "a sinistra",
        options: ["a destra", "in alto", "in basso"],
        image: "point-left",
        hint: "È il contrario di destra.",
        note: "SINISTRA: il dito indica dalla parte del cuore.",
      },
    ],
  },
  {
    id: "punti-cardinali",
    title: "I punti cardinali",
    focus: "NORD / EST / SUD / OVEST",
    description: "La rosa dei venti, il sole che sorge e tramonta, la bussola: impara a orientarti.",
    label: "Orientiamoci",
    intro: "Nord in alto, Sud in basso, Est a destra, Ovest a sinistra.",
    sticker: "nord, sud, est, ovest",
    entries: [
      {
        id: "rosa-nord",
        prompt: "Quale punto cardinale è colorato?",
        answer: "Nord",
        options: others("Nord", CARDINALS),
        compass: "nord",
        note: "Il NORD è in alto sulla rosa dei venti e sulle carte geografiche.",
      },
      {
        id: "rosa-sud",
        prompt: "Quale punto cardinale è colorato?",
        answer: "Sud",
        options: others("Sud", CARDINALS),
        compass: "sud",
        note: "Il SUD è in basso, dalla parte opposta al Nord.",
      },
      {
        id: "rosa-est",
        prompt: "Quale punto cardinale è colorato?",
        answer: "Est",
        options: others("Est", CARDINALS),
        compass: "est",
        note: "L'EST è a destra, guardando il Nord.",
      },
      {
        id: "rosa-ovest",
        prompt: "Quale punto cardinale è colorato?",
        answer: "Ovest",
        options: others("Ovest", CARDINALS),
        compass: "ovest",
        note: "L'OVEST è a sinistra, guardando il Nord.",
      },
      {
        id: "sole-sorge",
        prompt: "Da quale parte sorge il sole?",
        answer: "Est",
        options: others("Est", CARDINALS),
        image: "sunrise",
        hint: "È la mattina presto.",
        note: "Il sole SORGE a EST, la mattina.",
      },
      {
        id: "sole-tramonta",
        prompt: "Da quale parte tramonta il sole?",
        answer: "Ovest",
        options: others("Ovest", CARDINALS),
        image: "sunset",
        hint: "È la sera.",
        note: "Il sole TRAMONTA a OVEST, la sera.",
      },
      {
        id: "carta-alto",
        prompt: "Sulle carte geografiche, che cosa c'è in alto?",
        answer: "Nord",
        options: others("Nord", CARDINALS),
        image: "map",
        note: "Sulle carte geografiche il NORD è sempre in alto.",
      },
      {
        id: "carta-basso",
        prompt: "Sulle carte geografiche, che cosa c'è in basso?",
        answer: "Sud",
        options: others("Sud", CARDINALS),
        image: "map",
        note: "Sulle carte geografiche il SUD è in basso.",
      },
      {
        id: "contrario-nord",
        prompt: "Qual è il contrario del Nord?",
        answer: "Sud",
        options: others("Sud", CARDINALS),
        compass: "sud",
        note: "NORD e SUD sono opposti: uno in alto, l'altro in basso.",
      },
      {
        id: "contrario-est",
        prompt: "Qual è il contrario dell'Est?",
        answer: "Ovest",
        options: others("Ovest", CARDINALS),
        compass: "ovest",
        note: "EST e OVEST sono opposti: uno a destra, l'altro a sinistra.",
      },
      {
        id: "bussola",
        prompt: "Come si chiama lo strumento che indica il Nord?",
        answer: "la bussola",
        options: ["l'orologio", "il termometro", "il righello"],
        image: "compass",
        hint: "Ha un ago che punta sempre al Nord.",
        note: "La BUSSOLA ha un ago magnetico che punta sempre verso il Nord.",
      },
      {
        id: "settentrione",
        prompt: "Il Nord si chiama anche...",
        answer: "Settentrione",
        options: ["Mezzogiorno", "Levante", "Ponente"],
        compass: "nord",
        note: "Il NORD si chiama anche SETTENTRIONE.",
      },
      {
        id: "mezzogiorno",
        prompt: "Il Sud si chiama anche...",
        answer: "Mezzogiorno",
        options: ["Settentrione", "Levante", "Ponente"],
        compass: "sud",
        hint: "A mezzogiorno il sole è da questa parte.",
        note: "Il SUD si chiama anche MEZZOGIORNO: a mezzogiorno il sole è a Sud.",
      },
      {
        id: "levante",
        prompt: "L'Est si chiama anche...",
        answer: "Levante",
        options: ["Ponente", "Settentrione", "Mezzogiorno"],
        compass: "est",
        hint: "Da qui il sole si alza, cioè si leva.",
        note: "L'EST si chiama anche LEVANTE oppure ORIENTE: da lì il sole si leva.",
      },
      {
        id: "ponente",
        prompt: "L'Ovest si chiama anche...",
        answer: "Ponente",
        options: ["Levante", "Settentrione", "Mezzogiorno"],
        compass: "ovest",
        hint: "Da qui il sole va giù, cioè si pone.",
        note: "L'OVEST si chiama anche PONENTE oppure OCCIDENTE: lì il sole tramonta.",
      },
    ],
  },
  {
    id: "bandiere",
    title: "Bandiere del mondo",
    focus: "PAESI / BANDIERE",
    description: "Italia, Francia, Giappone, Brasile: riconosci la bandiera e scopri la capitale.",
    label: "Di chi è la bandiera?",
    intro: "Guarda i colori e i disegni della bandiera, poi scegli il paese.",
    sticker: "verde, bianco e rosso",
    entries: [
      flag("italy", "Italia", "dell'Italia", "Roma", "È il nostro paese: verde, bianco e rosso."),
      flag("france", "Francia", "della Francia", "Parigi", "Lì c'è la Torre Eiffel."),
      flag("spain", "Spagna", "della Spagna", "Madrid", "Lì si balla il flamenco."),
      flag("germany", "Germania", "della Germania", "Berlino", "È nera, rossa e gialla."),
      flag("united-kingdom", "Regno Unito", "del Regno Unito", "Londra", "Lì c'è il Big Ben."),
      flag("united-states", "Stati Uniti", "degli Stati Uniti", "Washington", "Ha tante stelle e strisce."),
      flag("japan", "Giappone", "del Giappone", "Tokyo", "C'è un grande sole rosso."),
      flag("brazil", "Brasile", "del Brasile", "Brasilia", "Lì c'è la foresta amazzonica."),
      flag("switzerland", "Svizzera", "della Svizzera", "Berna", "È vicina all'Italia, con le Alpi."),
      flag("greece", "Grecia", "della Grecia", "Atene", "Ha strisce bianche e blu, come il mare."),
      flag("canada", "Canada", "del Canada", "Ottawa", "C'è una foglia d'acero."),
      flag("china", "Cina", "della Cina", "Pechino", "Lì c'è la Grande Muraglia."),
      flag("mexico", "Messico", "del Messico", "Città del Messico", "Lì si mangiano i tacos."),
      flag("portugal", "Portogallo", "del Portogallo", "Lisbona", "È vicino alla Spagna, sull'oceano."),
      flag("argentina", "Argentina", "dell'Argentina", "Buenos Aires", "È celeste e bianca, con un sole."),
      flag("austria", "Austria", "dell'Austria", "Vienna", "È rossa e bianca, a nord dell'Italia."),
      flag("india", "India", "dell'India", "Nuova Delhi", "C'è una ruota blu al centro."),
      flag("australia", "Australia", "dell'Australia", "Canberra", "Lì vivono i canguri."),
      flag("ireland", "Irlanda", "dell'Irlanda", "Dublino", "È verde, bianca e arancione."),
      flag("netherlands", "Paesi Bassi", "dei Paesi Bassi", "Amsterdam", "È la terra dei tulipani e dei mulini."),
      flag("sweden", "Svezia", "della Svezia", "Stoccolma", "È blu con una croce gialla."),
      flag("egypt", "Egitto", "dell'Egitto", "Il Cairo", "Lì ci sono le piramidi."),
    ],
  },
];

export const gameIds = games.map((game) => game.id);

export function getGame(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

export type Question = { entry: Entry; options: string[] };
export type Answer = { entry: Entry; selected: string; correct: boolean };

export type Round = {
  id: string;
  gameId: GeographyGameId;
  /** Le voci disponibili per questa partita, usate per rigiocare. */
  selection: string[];
  roundLength: number;
  questions: Question[];
  answers: Answer[];
};

export type RoundOptions = {
  /** Le voci scelte nella schermata pre-gioco. Se assente, si usano tutte. */
  entries?: readonly string[];
  length?: number;
};

export function shuffle<Value>(values: readonly Value[], random = Math.random): Value[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

/** Le tre alternative sbagliate: quelle della voce, oppure risposte di altre voci del gioco. */
export function distractors(game: Game, entry: Entry, random = Math.random): string[] {
  if (entry.options && entry.options.length >= 3) return entry.options.slice(0, 3);
  const pool = [...new Set(game.entries.map((other) => other.answer))].filter((answer) => answer !== entry.answer);
  return shuffle(pool, random).slice(0, 3);
}

export function createRound(gameId: GeographyGameId, options: RoundOptions = {}, previous?: Round, random = Math.random): Round {
  const game = getGame(gameId);
  if (!game) throw new Error("Unknown game");
  const chosen = options.entries ? new Set(options.entries) : null;
  const available = chosen ? game.entries.filter((entry) => chosen.has(entry.id)) : game.entries;
  const pool = available.length > 0 ? available : game.entries;
  const length = Math.min(Math.max(Math.floor(options.length ?? 6), 1), pool.length);
  const entries = shuffle(pool, random).slice(0, length);
  if (entries.length > 1 && previous?.questions[0]?.entry.id === entries[0].id) {
    [entries[0], entries[1]] = [entries[1], entries[0]];
  }
  return {
    id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    selection: pool.map((entry) => entry.id),
    roundLength: length,
    questions: entries.map((entry) => ({
      entry,
      options: shuffle([entry.answer, ...distractors(game, entry, random)], random),
    })),
    answers: [],
  };
}

export function scoreRound(answers: readonly Answer[]): number {
  return answers.filter((answer) => answer.correct).length;
}

export const DIRECTION_LETTERS: Record<Direction, string> = { nord: "N", est: "E", sud: "S", ovest: "O" };
