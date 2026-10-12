export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  isbn?: string;
  language?: string;
  rank: number;
  jades_pick?: boolean;
  depth?: string;
  why_this_book?: string;
  key_concepts?: string[];
  synthesis?: string;
  reading_plan?: string;
  cosecha_pdf?: string;
};

export type Topic = {
  id: string;
  title: string;
  tagline: string;
  color?: string;
  icon?: string;
  why: string;
  books: Book[];
};

export const TOPICS: Topic[] = [
  {
    "id": "fisica",
    "title": "Física",
    "tagline": "Las leyes que rigen el universo, desde la manzana de Newton hasta el entrelazamiento cuántico.",
    "color": "#c9a84c",
    "icon": "λ",
    "why": "Si querés entender cómo funciona la realidad a nivel fundamental — desde por qué caen las cosas hasta qué es el tiempo — empezá por acá. La física es la columna vertebral del pensamiento moderno; sin ella, todo lo demás (computación, biología, ingeniería) es magia sin base.",
    "books": [
      {
        "id": "feynman-six",
        "title": "Six Easy Pieces",
        "author": "Richard P. Feynman",
        "year": 1963,
        "isbn": "978-0465025275",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "cosecha_pdf": "/assets/feynman_six_easy_pieces.pdf",
        "depth": "introductorio",
        "why_this_book": "Feynman explicando física con claridad brutal. Seis capítulos tomados de las Lectures que destilan lo esencial: átomos, conservación de energía, gravitación, mecánica cuántica, la relación entre física y otras ciencias. Si solo podés leer un libro de física, es este.",
        "key_concepts": [
          "átomos",
          "conservación de energía",
          "gravitación",
          "mecánica cuántica",
          "la física como forma de pensar"
        ],
        "synthesis": "Feynman parte de un lugar simple: la física no es colección de fórmulas, es un método para pensar sobre la realidad. Los átomos no son 'una cosa más que aprender' — son el hecho fundamental que explica por qué la materia tiene las propiedades que tiene. La conservación de energía no es una ley que memorizar: es la intuición de que 'algo' siempre se preserva, lo cual cambia cómo pensás sobre cualquier sistema. La gravedad newtoniana se extiende naturalmente a la relatividad general cuando entendés que masa y energía curvan el espacio-tiempo. La mecánica cuántica no es raro — es raro solo si insistís en pensar con intuiciones clásicas. Feynman te enseña a soltar la intuición cuando la realidad lo exige, y a recuperarla cuando no.",
        "reading_plan": "1 capítulo por día, 2 semanas. Releer el de mecánica cuántica 3 veces."
      },
      {
        "id": "greene-elegant",
        "title": "The Elegant Universe",
        "author": "Brian Greene",
        "year": 1999,
        "isbn": "978-0393338102",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "cosecha_pdf": "/assets/greene_elegant_universe.pdf",
        "depth": "introductorio-intermedio",
        "why_this_book": "La mejor introducción a la teoría de cuerdas y la unificación de las cuatro fuerzas fundamentales. Greene escribe como un novelista — accesible, narrativo, sin perder rigor. Si Feynman es el ABC, Greene es el siguiente paso hacia la frontera.",
        "key_concepts": [
          "relatividad general",
          "mecánica cuántica",
          "teoría de cuerdas",
          "supersimetría",
          "dimensiones extra"
        ],
        "synthesis": "Greene cuenta la historia intelectual de la física del siglo XX: dos revoluciones (relatividad y cuántica) que se contradicen mutuamente, y el intento (teoría de cuerdas) de reconciliarlas postulando que las partículas son vibraciones de filamentos unidimensionales en un espacio de 11 dimensiones. No es solo un libro de física: es un libro sobre cómo los físicos buscan la unificación, y por qué esa búsqueda importa para entender qué es la realidad. La tensión central — incompatibilidad entre relatividad general y mecánica cuántica a escalas de Planck — es el problema abierto más profundo de la física fundamental.",
        "reading_plan": "1 capítulo cada 2-3 días, 4-5 semanas. Releer la parte III (cuerdas) con calma."
      },
      {
        "id": "rovelli-seven",
        "title": "Seven Brief Lessons on Physics",
        "author": "Carlo Rovelli",
        "year": 2014,
        "isbn": "978-0399184413",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "cosecha_pdf": "/assets/rovelli_seven_brief_lessons.pdf",
        "depth": "introductorio",
        "why_this_book": "Setenta páginas que resumen la física del siglo XX con la prosa más elegante que vas a leer. Rovelli es poeta. Si querés un libro que te haga enamorar de la física sin jerga, este es el que regalarías.",
        "key_concepts": [
          "relatividad",
          "mecánica cuántica",
          "gravedad cuántica de bucles",
          "tiempo",
          "cosmología"
        ],
        "synthesis": "Rovelli reduce la física a sus intuiciones más profundas: la relatividad nos enseñó que el tiempo no es absoluto; la cuántica nos enseñó que la realidad es granular; la gravedad cuántica de bucles intenta unificarlas. Su prosa es tan buena que el libro se lee en una sentada, pero las ideas te quedan para siempre. Particularmente bella es su lección sobre el tiempo: 'el tiempo no es una variable fundamental, emerge de las interacciones entre sistemas'. Si Feynman es rigor, Rovelli es belleza.",
        "reading_plan": "Una tarde. Releer cada 6 meses."
      }
    ]
  },
  {
    "id": "matematicas",
    "title": "Matemáticas",
    "tagline": "El lenguaje en que está escrito el universo. De los números primos a la geometría no-euclidiana.",
    "color": "#4ecdc4",
    "icon": "π",
    "why": "Sin matemáticas, la física es filosofía, la computación es brujería y la economía es opinión. Las matemáticas no son un tema más: son el lenguaje que te permite pensar con precisión sobre estructura, patrón y relación. Aprenderlas bien es el ROI más alto que existe en educación.",
    "books": [
      {
        "id": "hofstadter-geb",
        "title": "Gödel, Escher, Bach",
        "author": "Douglas Hofstadter",
        "year": 1979,
        "isbn": "978-0465026562",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "cosecha_pdf": "/assets/hofstadter_geb.pdf",
        "depth": "intermedio",
        "why_this_book": "Un libro que usa tres sistemas formales (la música de Bach, los grabados de Escher, los teoremas de Gödel) para iluminar una sola idea: cómo la autorreferencia y los bucles extraños producen emergencia. Es libro de matemáticas, filosofía de la mente, música y arte al mismo tiempo. Único.",
        "key_concepts": [
          "teorema de incompletitud de Gödel",
          "autorreferencia",
          "bucles extraños",
          "sistemas formales",
          "inteligencia artificial"
        ],
        "synthesis": "Hofstadter parte de un isomorfismo: las fugas de Bach, los grabados de Escher que se contienen a sí mismos, y los teoremas de Gödel que muestran que todo sistema formal suficientemente potente contiene verdades que no puede probar, son manifestaciones de la misma estructura: el bucle autorreferencial. La mente humana también es un sistema de este tipo — y Hofstadter sugiere que la consciencia emerge de la habilidad de los sistemas para referirse a sí mismos. Es el libro favorito de programadores, físicos y filósofos por igual, y por buena razón. Si solo leés un libro de matemáticas en tu vida, que sea este.",
        "reading_plan": "2-3 meses, lentamente. Saltar los diálogos entre capítulos si traban. Releer la parte II (autorreferencia) tres veces."
      },
      {
        "id": "polya-how",
        "title": "How to Solve It",
        "author": "George Pólya",
        "year": 1945,
        "isbn": "978-0691164076",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "cosecha_pdf": "/assets/polya_how_to_solve_it.pdf",
        "depth": "introductorio",
        "why_this_book": "Pólya fue un matemático húngaro que se preguntó: ¿cómo piensan los buenos resolutores de problemas? Este libro es la respuesta. Es un manual de heurística matemática, pero también de heurística de pensamiento en general. Aplicable a programar, negociar, diseñar.",
        "key_concepts": [
          "heurística",
          "analogía",
          "inducción",
          "abstracción",
          "problema resuelto vs. problema entendido"
        ],
        "synthesis": "Pólya destila el método: entender el problema, diseñar un plan, ejecutar el plan, mirar hacia atrás. Parece obvio hasta que te das cuenta de que casi nadie hace el cuarto paso. La parte más útil del libro son los 'inventarios' de heurísticas (analogía, generalización, inducción, especialización, descomposición) — son herramientas reutilizables para cualquier problema no estructurado. Es el libro que debería leer todo ingeniero antes de aprender a programar.",
        "reading_plan": "1 semana. Tener un cuaderno al lado."
      },
      {
        "id": "spivak-calculus",
        "title": "Calculus",
        "author": "Michael Spivak",
        "year": 1967,
        "isbn": "978-0914098911",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "intermedio-avanzado",
        "why_this_book": "Si querés entender el cálculo de verdad — no solo aplicarlo — Spivak es la respuesta. Calculus 'a lo Spivak' es riguroso, elegante y escrito con una claridad que hace que la matemática se sienta como literatura.",
        "key_concepts": [
          "límites",
          "derivadas",
          "integrales",
          "rigor",
          "demostración"
        ],
        "synthesis": "Spivak trata el cálculo como una forma de pensar, no como un conjunto de técnicas. Cada teorema se demuestra, cada idea se motiva, cada ejemplo se conecta con la estructura profunda. No es un libro para pasar un examen — es un libro para entender de verdad. Si la matemática te parece seca, Spivak te va a curar.",
        "reading_plan": "6-12 meses. Hacer todos los ejercicios."
      }
    ]
  },
  {
    "id": "biologia",
    "title": "Biología",
    "tagline": "Cómo funciona la vida, desde las moléculas hasta los ecosistemas.",
    "color": "#22c55e",
    "icon": "✶",
    "why": "Vivimos en un sistema biológico y somos sistemas biológicos. Sin entender biología, no podés entender tu propio cuerpo, la medicina, la agricultura, el cambio climático o la inteligencia artificial (que en el fondo es biología computacional). Es la segunda ciencia fundamental después de la física.",
    "books": [
      {
        "id": "dawkins-selfish",
        "title": "The Selfish Gene",
        "author": "Richard Dawkins",
        "year": 1976,
        "isbn": "978-0198788607",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "depth": "introductorio",
        "why_this_book": "Cambió la biología evolutiva. Dawkins introduce la idea del gen como unidad de selección, y con ella la noción de que los organismos somos 'máquinas de supervivencia' construidas por los genes para replicarse. Es la idea más contraintuitiva y poderosa de la biología del siglo XX.",
        "key_concepts": [
          "gen egoísta",
          "replicador",
          "vehículo",
          "altruismo",
          "estrategia evolutivamente estable"
        ],
        "synthesis": "Dawkins argumenta que la selección natural no opera sobre los organismos, ni sobre las especies, sino sobre los genes. Los organismos somos 'vehículos' temporales construidos por los genes para asegurar su propia replicación. Esta inversión del punto de vista (de organismo-centrado a gen-centrado) explica fenómenos que antes eran misteriosos: el altruismo entre parientes, el conflicto entre padres e hijos, la evolución de la cooperación, el sexo como estrategia contra parásitos. Es un libro que cambia cómo pensás sobre la vida — y,顺便, sobre la inteligencia artificial (que en el fondo es algoritmos replicándose).",
        "reading_plan": "2-3 semanas. Releer los capítulos sobre estrategia evolutivamente estable con cuidado."
      },
      {
        "id": "mukherjee-gene",
        "title": "The Gene: An Intimate History",
        "author": "Siddhartha Mukherjee",
        "year": 2016,
        "isbn": "978-1476733500",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "depth": "introductorio-intermedio",
        "why_this_book": "La historia del gen, desde Mendel hasta CRISPR. Mukherjee es un oncólogo que escribe como novelista — este libro es el equivalente a 'Sapiens' pero para la biología molecular.",
        "key_concepts": [
          "genética mendeliana",
          "ADN",
          "expresión génica",
          "CRISPR",
          "eugenesia"
        ],
        "synthesis": "Mukherjee entrelaza la historia intelectual (Mendel, Watson y Crick, el Proyecto Genoma Humano) con la historia familiar (su tío Moni, afectado por esquizofrenia) y las implicaciones éticas (eugenesia, edición genética). Es un libro que humaniza la biología molecular sin perder rigor. Particularmente potente es su tratamiento del Proyecto Genoma Humano: 3 mil millones de dólares, 13 años, y al final reveló que la complejidad estaba en la regulación, no en los genes mismos.",
        "reading_plan": "3-4 semanas. Tomar notas en paralelo a la lectura."
      },
      {
        "id": "schrodinger-life",
        "title": "What Is Life?",
        "author": "Erwin Schrödinger",
        "year": 1944,
        "isbn": "978-1107604667",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "Un físico ganador del Nobel, aplicando las herramientas de la física a la biología, en 80 páginas. Schrödinger introdujo la idea de que la información genética está codificada en un 'cristal aperiódico' — la respuesta correcta, 9 años antes de que Watson y Crick descubrieran la estructura del ADN.",
        "key_concepts": [
          "cristal aperiódico",
          "entropía negativa",
          "información",
          "orden a partir del desorden"
        ],
        "synthesis": "Schrödinger se pregunta: ¿cómo puede un sistema vivo escapar de la segunda ley de la termodinámica? La respuesta: alimentándose de entropía negativa (consumiendo orden del ambiente). Pero la pregunta más profunda del libro es: ¿dónde está codificada la información que permite a un organismo reproducirse? Su respuesta — un cristal aperiódico con estructura estable pero contenido informacional — inspiró directamente a Crick y Watson. Es el libro que demuestra cómo una buena pregunta, bien hecha, puede cambiar una disciplina.",
        "reading_plan": "Una tarde. Marcar las páginas con intuiciones brillantes."
      }
    ]
  },
  {
    "id": "economia",
    "title": "Economía",
    "tagline": "Cómo se asignan los recursos escasos, por qué los incentivos importan, y por qué la gente hace lo que hace.",
    "color": "#eab308",
    "icon": "§",
    "why": "La economía es el estudio de los incentivos — y los incentivos son el motor de casi todo comportamiento humano. Sin entender economía, no podés entender por qué funcionan o fallan los mercados, por qué los países crecen o se estancan, ni por qué la gente toma las decisiones que toma.",
    "books": [
      {
        "id": "smith-wealth",
        "title": "The Wealth of Nations",
        "author": "Adam Smith",
        "year": 1776,
        "isbn": "978-0553585971",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "depth": "intermedio",
        "why_this_book": "El libro que inventó la economía moderna. Smith introduce la 'mano invisible', la división del trabajo, y la idea de que los mercados auto-organizan el bienestar social. Es lectura obligatoria no por su precisión actual (es del siglo XVIII), sino porque toda la conversación económica moderna es respuesta a este libro.",
        "key_concepts": [
          "mano invisible",
          "división del trabajo",
          "mercado auto-organizado",
          "valor",
          "interés propio bien entendido"
        ],
        "synthesis": "Smith no era el laissez-faire simplista que sus epígonos presentan. Su argumento central: los mercados funcionan bien cuando hay competencia y transparencia; fallan cuando hay monopolio o información asimétrica. Su famosa frase 'no es de la benevolencia del carnicero, el cervecero o el panadero que esperamos nuestra cena, sino de su interés propio' viene seguida de una advertencia: el interés propio bien entendido, no el interés propio ciego. Smith era un moralista que entendía cómo los incentivos dan forma a la conducta, y esa doble atención (incentivo + moral) es lo que hace el libro relevante hoy.",
        "reading_plan": "2-3 meses. Saltar los capítulos sobre impuestos coloniales. Concentrarse en el Libro I."
      },
      {
        "id": "mankiw-principles",
        "title": "Principles of Economics",
        "author": "Gregory Mankiw",
        "year": 2017,
        "isbn": "978-0357722862",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "El manual de economía más usado en universidades top. Mankiw es claro, riguroso, y cubre micro + macro con equilibrio. Si querés un solo libro para entender la economía moderna mainstream, este es el manual.",
        "key_concepts": [
          "oferta y demanda",
          "elasticidad",
          "competencia perfecta e imperfecta",
          "PIB",
          "política monetaria"
        ],
        "synthesis": "Mankiw estructura la economía en 10 principios (gente enfrenta trade-offs, el costo de algo es lo que sacrificás, las personas racionales piensan en el margen, los mercados organizan la actividad económica, etc.) y luego construye sobre ellos. Es el libro de texto perfecto para alguien que viene de cero. La crítica: refleja la ortodoxia de Chicago-Boston, por lo que no vas a encontrar heterodoxia aquí.",
        "reading_plan": "3-6 meses. Hacer los ejercicios."
      },
      {
        "id": "kahneman-thinking",
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "year": 2011,
        "isbn": "978-0374533557",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "Un psicólogo (no economista) que ganó el Nobel de economía. Kahneman documenta cómo la mente humana toma decisiones sistemáticamente irracionales. Es lectura obligatoria para cualquiera que tome decisiones — desde traders hasta CEOs.",
        "key_concepts": [
          "Sistema 1 y Sistema 2",
          "heurísticas y sesgos",
          "aversión a la pérdida",
          "efecto ancla",
          "teoría de perspectivas"
        ],
        "synthesis": "Kahneman divide la mente en dos sistemas: Sistema 1 (rápido, intuitivo, emocional) y Sistema 2 (lento, deliberado, lógico). La mayor parte de las decisiones las toma el Sistema 1, y eso explica por qué somos irracionales de maneras predecibles. Los capítulos sobre aversión a la pérdida (perder $100 duele más de lo que ganar $100 alegra) y efecto ancla (la primera cifra que ves distorsiona tu juicio) son lectura obligatoria para cualquier persona que negocia o invierte. Es uno de los pocos libros de psicología que cambia cómo tomás decisiones el lunes a la mañana.",
        "reading_plan": "1-2 meses. Aplicar cada sesgo a una decisión real que hayas tomado."
      }
    ]
  },
  {
    "id": "filosofia",
    "title": "Filosofía",
    "tagline": "Las preguntas fundamentales sobre la existencia, el conocimiento, la moral y el sentido.",
    "color": "#a78bfa",
    "icon": "Ω",
    "why": "La filosofía no es lujo — es mantenimiento del sistema operativo mental. Te enseña a pensar con rigor sobre lo que importa. Sin filosofía, tus ideas sobre la realidad, la moral, la política y la vida son prejuicios no examinados. La cosecha de Marco Aurelio que ya hicimos es parte de este canon.",
    "books": [
      {
        "id": "aurelius-meditations",
        "title": "Meditaciones",
        "cosecha_pdf": "/assets/marco_aurelio_cansancio.pdf",
        "author": "Marco Aurelio",
        "year": 180,
        "isbn": "978-0812968255",
        "language": "GR (EN/ES tr.)",
        "rank": 1,
        "jades_pick": true,
        "depth": "introductorio",
        "why_this_book": "Un emperador romano escribiendo en primera persona sobre cómo vivir bien. 12 libros, 170-180 d.C. — el primer 'journaling' que sobrevive de la historia. Ya hicimos la cosechá de Cansancio (32 pp.); el canon es el libro entero.",
        "key_concepts": [
          "estoicismo",
          "foco en lo que controlás",
          "presente",
          "virtud",
          "aceptación"
        ],
        "synthesis": "Marco Aurelio no escribió para publicar — escribió para sí mismo. Eso lo hace extrañamente moderno: es un registro íntimo de alguien intentando, libro por libro, ser mejor. La idea central: la única cosa que controlás es tu propio juicio, y todo sufrimiento viene de confundir lo que controlás con lo que no. Releer cada año revela capas nuevas — a los 25 ves disciplina, a los 30 ves aceptación, a los 40 ves compasión. Cosechá completa: `~/Desktop/proyectos/libros/marco_aurelio_cansancio/`.",
        "reading_plan": "1 libro por mes durante 1 año, o 1 meditación por día durante 12 meses. La traducción Hays (Modern Library 2003) es la más legible; García Gual (Alianza 2001) es la mejor en español."
      },
      {
        "id": "aurelius-meditations-book-ii",
        "title": "Meditaciones · Libro II",
        "cosecha_pdf": "/assets/marco_aurelio_libro_ii.pdf",
        "author": "Marco Aurelio",
        "year": 170,
        "isbn": "978-0812968255",
        "language": "GR (ES tr.)",
        "rank": 2,
        "jades_pick": true,
        "depth": "intermedio",
        "why_this_book": "Segunda entrega de Marco Aurelio en la librería: lectura libro por libro, no por tema. El Libro II son 17 pasajes escritos en presente — donde Marco Aurelio deja los principios generales del Libro I y empieza a escribir cada mañana, para sí mismo, sobre cómo vivir hoy. La cosecha está organizada en 5 bloques: preparación matutina, mente teñida por sus juicios, muerte como despertar, unidad del cosmos y aceptación amorosa. Cosechá completa: `~/Desktop/proyectos/libros/marco_aurelio_libro_ii/`.",
        "key_concepts": [
          "daímōn (espíritu interior)",
          "hēgemonikón (facultad rectora)",
          "prohaíresis (elección moral)",
          "katà phýsin (según la naturaleza)",
          "heimarménē (destino)",
          "preparación matutina",
          "muerte como despertar",
          "aceptación amorosa"
        ],
        "synthesis": "El Libro II es la bitácora íntima de alguien que ya entendió los principios (Libro I) y ahora los aplica al día. Arranca con la frase más citada de todo Marco Aurelio ('Comienza la mañana diciéndote…') y sigue con 17 variaciones sobre un solo tema: lo que controlás y lo que no, mirado en presente. Los 12 términos griegos en juego — daímōn, hēgemonikón, prohaíresis, katà phýsin, heimarménē, apátheia, hýlē, chrónos, thánatos, logikòn zôion, prós — son el vocabulario que el estoicismo romano absorbe del griego clásico y vuelve herramienta diaria. Releerlo toma 60–90 minutos; la primera vez ves ritual, la segunda vez ves epistemología, la tercera vez ves compasión.",
        "reading_plan": "60–90 min en una sesión, o 2 mañanas reflexivas (8–12 pasajes por mañana). Para estudio del griego, leer con Hays (inglés, Modern Library 2003) al lado y la versión libre de JADES para sentir el flujo. Si preferís no salir del español, García Gual (Alianza 2001) es la opción."
      },
      {
        "id": "seneca-letters",
        "title": "Letters from a Stoic",
        "author": "Séneca",
        "year": 65,
        "isbn": "978-0140442106",
        "language": "LAT (EN/ES tr.)",
        "rank": 3,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "El otro gran estoico romano, pero con tono muy diferente a Marco Aurelio. Séneca escribe cartas a un amigo (Lucilio) con consejos prácticos sobre riqueza, vejez, muerte, amistad. Más cálido, más conversacional, más aplicable.",
        "key_concepts": [
          "uso del tiempo",
          "amistad",
          "muerte",
          "riqueza",
          "tranquilidad"
        ],
        "synthesis": "Séneca es el estoico para gente activa: rico, poderoso, consejero de Nerón, terminó suicidado por orden del emperador. Su tensión interna — ¿cómo vivir virtuosamente cuando vivís en el poder? — sigue siendo relevante. Las cartas sobre el uso del tiempo son lectura obligatoria: 'no es que tengamos poco tiempo, sino que perdemos mucho'. Su tratamiento de la muerte es más concreto y menos místico que el de Marco Aurelio.",
        "reading_plan": "1 carta por día, 6 meses. La Penguin Classics edición de Robin Campbell es la mejor en inglés."
      },
      {
        "id": "plato-republic",
        "title": "The Republic",
        "author": "Platón",
        "year": -380,
        "isbn": "978-0140455113",
        "language": "GR (EN/ES tr.)",
        "rank": 4,
        "jades_pick": false,
        "depth": "intermedio",
        "why_this_book": "El libro que fundó la filosofía política occidental. La alegoría de la caverna, la teoría de las formas, la pregunta sobre qué es la justicia — todo está acá. Difícil pero vale cada página.",
        "key_concepts": [
          "alegoría de la caverna",
          "teoría de las formas",
          "justicia",
          "alma tripartita",
          "filósofo-rey"
        ],
        "synthesis": "Platón se pregunta: ¿qué es la justicia? Y termina construyendo una utopía política (la kallipolis) donde gobiernan los filósofos porque son los únicos que ven las formas verdaderas. La alegoría de la caverna — prisioneros viendo sombras en una pared, uno se libera y ve el sol — es la metáfora fundacional de la filosofía occidental. El libro es diálogo, no tratado: Sócrates pregunta, los interlocutores responden mal, Sócrates los corrige. Hay que leerlo despacio, con un comentario al lado (la edición de Allan Bloom en Basic Books es la mejor).",
        "reading_plan": "3-6 meses. 1-2 capítulos por semana. Releer la alegoría de la caverna (Libro VII) tres veces."
      }
    ]
  },
  {
    "id": "computacion",
    "title": "Computación",
    "tagline": "De las máquinas de Turing a la inteligencia artificial. Cómo pensar sobre lo que puede ser computado.",
    "color": "#3b82f6",
    "icon": "{ }",
    "why": "Vivimos rodeados de software. La computación no es 'aprender a programar' — es entender la lógica de los sistemas que median casi toda interacción humana. Y con la AI en el centro, entender computación es entender la fuerza más transformadora de nuestra era.",
    "books": [
      {
        "id": "petzold-code",
        "title": "Code: The Hidden Language of Computer Hardware and Software",
        "author": "Charles Petzold",
        "year": 1999,
        "isbn": "978-0735611313",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "depth": "introductorio",
        "why_this_book": "Petzold construye una computadora desde cero usando relés, interruptores y luces — empezando por el código Morse, pasando por el álgebra de Boole, hasta llegar a una CPU funcional. Si querés entender qué es un byte, un transistor, un programa, leé este libro.",
        "key_concepts": [
          "código Morse",
          "álgebra de Boole",
          "relés",
          "lógica digital",
          "CPU",
          "assembler"
        ],
        "synthesis": "El tour de Petzold es único: empieza con cosas que entendés intuitivamente (interruptores, luces, código Morse) y construye capa por capa hasta llegar a una computadora completa. Cada capítulo agrega una capa de abstracción, y cada abstracción se construye sobre la anterior de manera demostrable. Es el libro que te hace entender de verdad qué pasa cuando escribís `print('hola mundo')` y aparece hola mundo en pantalla. Particularmente brillante es el capítulo sobre ASCII: cómo un código que mapea números a letras permitió la comunicación universal entre máquinas.",
        "reading_plan": "3-4 semanas. Hacer los ejercicios del final de cada capítulo."
      },
      {
        "id": "sicp",
        "title": "Structure and Interpretation of Computer Programs",
        "author": "Harold Abelson & Gerald Jay Sussman",
        "year": 1985,
        "isbn": "978-0262510875",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "depth": "intermedio-avanzado",
        "why_this_book": "El libro del MIT 6.001. La introducción más profunda a la ciencia de la computación que existe. Usa Scheme (un dialecto de Lisp) para enseñar a pensar en abstracciones, recursión, y composición.",
        "key_concepts": [
          "abstracción procedural",
          "recursión",
          "orden superior",
          "interpretación",
          "máquinas de Turing"
        ],
        "synthesis": "SICP no es un libro para 'aprender a programar' — es un libro para aprender a pensar en computación. Los primeros capítulos te enseñan a construir procedimientos que manipulan procedimientos, lo cual es la base de la programación moderna. Los capítulos sobre interpretación (construir un evaluador Lisp en Lisp) son lectura obligatoria para cualquiera que quiera entender cómo funciona un lenguaje de programación. Si Feynman aplicó rigor físico a la realidad, Abelson y Sussman aplican rigor matemático a la computación.",
        "reading_plan": "6-12 meses. Hacer todos los ejercicios. Usar el video del MIT 6.001 como complemento."
      },
      {
        "id": "knuth-art",
        "title": "The Art of Computer Programming, Vol. 1",
        "author": "Donald Knuth",
        "year": 1968,
        "isbn": "978-0201896831",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "avanzado",
        "why_this_book": "La biblia de los algoritmos. Knuth lleva 60+ años escribiéndola. Si te interesa cómo funcionan los algoritmos a nivel fundamental (no solo cómo llamarlos de una librería), este es el manual.",
        "key_concepts": [
          "análisis de algoritmos",
          "estructuras de datos",
          "combinatoria",
          "complejidad",
          "notación Big-O"
        ],
        "synthesis": "Knuth es riguroso al extremo — usa ensamblador MIX (inventado por él) para mostrar exactamente qué hace cada operación. Es un libro de referencia, no de lectura lineal: lo abrís cuando necesitás entender un algoritmo en profundidad. Particularmente brillantes son las secciones sobre análisis de tiempo de ejecución — te enseñan a predecir cuánto va a tardar un algoritmo antes de correrlo.",
        "reading_plan": "1 capítulo por mes durante 1 año. Tener una calculadora y un cuaderno a mano."
      }
    ]
  },
  {
    "id": "historia",
    "title": "Historia",
    "tagline": "Cómo llegamos hasta acá, qué patrones se repiten, qué podemos aprender.",
    "color": "#f97316",
    "icon": "⏳",
    "why": "La historia es la memoria de la humanidad. Sin ella, no podés entender por qué los países son como son, por qué las instituciones funcionan como funcionan, ni por qué los patrones se repiten. Es la única ciencia con la muestra completa del experimento humano.",
    "books": [
      {
        "id": "harari-sapiens",
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "year": 2011,
        "isbn": "978-0062316097",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "depth": "introductorio",
        "why_this_book": "Harari cuenta la historia de la humanidad en 400 páginas con la frescura de un blog post y la profundidad de un ensayo. Introduce la idea de que los sapiens sobrevivimos porque podemos creer en ficciones colectivas (dinero, naciones, derechos humanos). Es lectura obligatoria para entender el presente.",
        "key_concepts": [
          "revolución cognitiva",
          "revolución agrícola",
          "revolución científica",
          "ficciones compartidas",
          "capitalismo"
        ],
        "synthesis": "Harari divide la historia en tres revoluciones: la cognitiva (hace 70K años, cuando sapiens desarrolló lenguaje simbólico), la agrícola (hace 10K años, cuando nos asentamos y domesticamos plantas) y la científica (hace 500 años, cuando admitimos nuestra ignorancia). Su tesis central: las ficciones compartidas — dinero, naciones, empresas, derechos humanos — son la fuerza más poderosa de la historia, porque los sapiens podemos coordinar millones de personas en torno a una mentira convenida. La pregunta del libro: ¿estamos mejor que antes? La respuesta honesta: depende de qué métrica uses.",
        "reading_plan": "2-3 semanas. Subrayar todas las afirmaciones que te sorprendan."
      },
      {
        "id": "bryson-short",
        "title": "A Short History of Nearly Everything",
        "author": "Bill Bryson",
        "year": 2003,
        "isbn": "978-0767908184",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "La historia de la ciencia, contada con humor. Bryson no es científico — es un periodista curioso que se pregunta: ¿cómo sabemos lo que sabemos? El resultado es una explicación accesible de la física, la química, la biología, la geología y la astronomía a través de las vidas de los científicos que las descubrieron.",
        "key_concepts": [
          "historia de la ciencia",
          "curiosidad metodológica",
          "geología",
          "astronomía",
          "evolución"
        ],
        "synthesis": "Bryson es la mejor introducción a la historia de la ciencia para gente no científica. Su truco es enfocarse en las personas — las rivalidades, los errores, los momentos eureka — más que en las teorías. Capítulo favorito: el de la edad de la Tierra. Resulta que llevó 300 años de disputas y un método definitivo (la datación radiométrica) establecer que el planeta tiene 4.5 mil millones de años. Bryson te hace sentir lo revolucionario de ese descubrimiento.",
        "reading_plan": "3-4 semanas. Saltar al capítulo sobre el universo si la geología te aburre (no debería)."
      },
      {
        "id": "durant-lessons",
        "title": "The Lessons of History",
        "author": "Will & Ariel Durant",
        "year": 1968,
        "isbn": "978-1439149959",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "Una síntesis de 100 páginas escrita por los autores de los 11 volúmenes de 'The Story of Civilization'. Es la mejor versión corta de 'qué aprendimos de 5000 años de historia humana'.",
        "key_concepts": [
          "ciclo",
          "geografía",
          "biología",
          "moral",
          "economía",
          "religión",
          "guerra"
        ],
        "synthesis": "Los Durant identifican 12 lecciones que se repiten en toda la historia: la geografía es más fuerte que la política; la biología constraina la cultura; la moral es relativa a la época; la economía es el motor de la política; la guerra es el estado natural de las relaciones entre estados hasta que una fuerza los une; la religión es un sistema de cohesión social. Es un libro para leer en una sentada y volver a leer cada 5 años. Cada relectura revela una capa nueva.",
        "reading_plan": "Un fin de semana. Releer cada 5 años."
      }
    ]
  },
  {
    "id": "psicologia",
    "title": "Psicología",
    "tagline": "Cómo funciona la mente humana — los sesgos, los patrones, las motivaciones.",
    "color": "#ec4899",
    "icon": "ψ",
    "why": "La psicología es la única ciencia que estudia el sistema que toma tus decisiones. Sin ella, vas por la vida sin entender por qué tomás las decisiones que tomás, ni por qué la gente a tu alrededor hace lo que hace. Es el ROI más alto de las ciencias blandas.",
    "books": [
      {
        "id": "kahneman-thinking-2",
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "year": 2011,
        "isbn": "978-0374533557",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "depth": "introductorio",
        "why_this_book": "También está en economía. Lo pongo dos veces porque aplica a ambas. La mente humana es irracional de maneras sistemáticas y predecibles, y Kahneman las documenta con décadas de investigación.",
        "key_concepts": [
          "Sistema 1 y Sistema 2",
          "heurísticas",
          "sesgos",
          "efecto ancla",
          "teoría de perspectivas",
          "enmarcado"
        ],
        "synthesis": "Kahneman y Tversky (su colaborador fallecido) documentaron docenas de sesgos cognitivos: el efecto ancla, el sesgo de confirmación, la aversión a la pérdida, el efecto de dotación, el sesgo de retrospección. Lo más potente del libro: te muestra que estos sesgos no son errores — son la forma default en que la mente procesa información. La única defensa es aprender a detectarlos cuando operan.",
        "reading_plan": "2 meses. Aplicar cada sesgo a una decisión de tu vida pasada."
      },
      {
        "id": "frankl-meaning",
        "title": "Man's Search for Meaning",
        "author": "Viktor Frankl",
        "year": 1946,
        "isbn": "978-0807014295",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "Un psiquiatra sobreviviente de Auschwitz escribe sobre cómo encontró sentido en el sufrimiento. Es el libro más vendido de la historia de la psicología. Si solo leés un libro de psicología, que sea este.",
        "key_concepts": [
          "logoterapia",
          "sentido",
          "sufrimiento",
          "libertad interior",
          "responsabilidad"
        ],
        "synthesis": "Frankl divide el libro en dos partes: la primera es su experiencia en los campos de concentración; la segunda es la teoría psicológica que desarrolló a partir de ella (logoterapia). Su tesis: la motivación última del ser humano no es el placer (Freud) ni el poder (Adler) sino el sentido. Incluso en las peores condiciones, el ser humano puede encontrar significado — y ese significado es lo que sostiene la voluntad de vivir. Es un libro corto, devastador, transformador.",
        "reading_plan": "Un fin de semana. Releer cada vez que pases por una crisis."
      },
      {
        "id": "cialdini-influence",
        "title": "Influence: The Psychology of Persuasion",
        "author": "Robert Cialdini",
        "year": 1984,
        "isbn": "978-0061241895",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "Cialdini destila 6 principios de persuasión que explotan los atajos de la mente humana. Es lectura obligatoria para no ser manipulado en el mundo moderno (y para persuadir éticamente cuando lo necesites).",
        "key_concepts": [
          "reciprocidad",
          "compromiso",
          "prueba social",
          "autoridad",
          "escasez",
          "simpatía"
        ],
        "synthesis": "Los 6 principios: reciprocidad (si te doy algo, me debés algo), compromiso y consistencia (una vez que dijiste sí, querés seguir diciendo sí), prueba social (la gente hace lo que ve hacer a otros), autoridad (confiamos en expertos), escasez (valoramos lo que es escaso), simpatía (preferimos a los que nos caen bien). Cialdini documenta cada principio con experimentos y ejemplos del mundo real. El libro es esencialmente un manual de defensa contra la manipulación comercial y política.",
        "reading_plan": "2-3 semanas. Detectar cada principio en la próxima decisión comercial que tomes."
      }
    ]
  },
  {
    "id": "sistemas",
    "title": "Pensamiento Sistémico",
    "tagline": "Cómo pensar en bucles, feedback y emergencia — el software mental para problemas complejos.",
    "color": "#94a3b8",
    "icon": "↻",
    "why": "Los problemas reales (cambio climático, mercados financieros, organizaciones, tu propia vida) son sistemas — no tienen causa única, sino bucles de feedback y efectos emergentes. Sin pensamiento sistémico, vas a optimizar variables equivocadas. Es el metalenguaje que necesitás para pensar sobre complejidad.",
    "books": [
      {
        "id": "meadows-thinking",
        "title": "Thinking in Systems",
        "author": "Donella Meadows",
        "year": 2008,
        "isbn": "978-1603580557",
        "language": "EN",
        "rank": 1,
        "jades_pick": true,
        "depth": "introductorio",
        "why_this_book": "Meadows fue una de las mejores pensadoras sistémicas del siglo XX. Este libro, publicado póstumamente, es la introducción más clara al pensamiento sistémico que existe. 200 páginas que cambian cómo pensás sobre cualquier problema complejo.",
        "key_concepts": [
          "stocks y flows",
          "bucles de feedback",
          "emergencia",
          "leverage points",
          "resiliencia"
        ],
        "synthesis": "Meadows introduce el vocabulario: stocks (acumulaciones) y flows (tasas de cambio); bucles de feedback reforzadores (que crecen exponencialmente) y balanceadores (que buscan equilibrio); delays (los retrasos que matan las políticas); leverage points (los 12 lugares donde intervenir en un sistema, ordenados por efectividad). Su insight más potente: la mayoría de las intervenciones fallan porque atacan los leverage points equivocados — usualmente parámetros (números) en vez de reglas o visión del sistema.",
        "reading_plan": "2 semanas. Releer el capítulo sobre leverage points cada vez que enfrentes un problema complejo."
      },
      {
        "id": "taleb-antifragile",
        "title": "Antifragile: Things That Gain from Disorder",
        "author": "Nassim Nicholas Taleb",
        "year": 2012,
        "isbn": "978-0812979688",
        "language": "EN",
        "rank": 2,
        "jades_pick": false,
        "depth": "intermedio",
        "why_this_book": "Taleb introduce la categoría 'antifrágil' — cosas que se benefician del desorden. Es un libro sobre cómo diseñar sistemas (carteras, carreras, vidas) que no solo resistan la volatilidad, sino que la necesiten para mejorar.",
        "key_concepts": [
          "antifragilidad",
          "opcionalidad",
          "skin in the game",
          "via negativa",
          "convexidad"
        ],
        "synthesis": "Taleb divide el mundo en frágil (se rompe con el desorden), robusto (resiste) y antifrágil (mejora). Su tesis: la mayoría de los sistemas que construimos son frágiles porque eliminamos la volatilidad (banca, dietas, organizaciones) y eso los hace catastróficos cuando llega la crisis. La solución: diseñar con opcionalidad, tener skin in the game, evitar la optimización. Es lectura obligatoria para cualquiera que tome decisiones en ambientes inciertos.",
        "reading_plan": "1-2 meses. Saltar los capítulos filosóficos si traban; quedarse con los ejemplos concretos."
      },
      {
        "id": "norman-design",
        "title": "The Design of Everyday Things",
        "author": "Don Norman",
        "year": 1988,
        "isbn": "978-0465050659",
        "language": "EN",
        "rank": 3,
        "jades_pick": false,
        "depth": "introductorio",
        "why_this_book": "Norman escribió el libro que fundó el diseño centrado en el usuario. La idea central: cuando algo es confuso, el problema no es el usuario — es el diseño. Cambia cómo pensás sobre cualquier interfaz, desde una puerta hasta un software.",
        "key_concepts": [
          "affordance",
          "signifier",
          "mapping",
          "feedback",
          "constraints"
        ],
        "synthesis": "Norman introduce 7 principios de diseño: discoverability (¿se puede ver qué hace?), feedback (¿sabés qué pasó?), affordance (¿invita al uso correcto?), signifier (¿indica la acción?), mapping (¿la relación control-resultado es obvia?), constraint (¿limita los usos incorrectos?). Cuando algo es confuso, no es culpa tuya — es culpa del diseñador. Es lectura obligatoria para cualquiera que construya productos, software o experiencias.",
        "reading_plan": "2 semanas. Aplicar a 5 objetos de tu casa."
      }
    ]
  }
];

export const SHELVES = [
  { num: "I", label: "Codex I", ids: ["economia", "filosofia"] },
  { num: "II", label: "Codex II", ids: ["computacion", "historia"] },
  { num: "III", label: "Codex III", ids: ["psicologia", "sistemas"] },
  { num: "IV", label: "Codex IV", ids: ["fisica", "matematicas", "biologia"] },
];
