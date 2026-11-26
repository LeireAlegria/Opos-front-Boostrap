export type PracticeMode = 'easy' | 'difficult' | 'full'

function isPracticeMode(mode: string | null): mode is PracticeMode {
  return mode === 'easy' || mode === 'difficult' || mode === 'full'
}

interface MockQuestion {
  id: string
  statement: string
  options: { id: string; text: string }[]
}

export interface MockPracticeExam {
  attemptId: string
  oppositionSlug: string
  oppositionName: string
  mode: PracticeMode
  mockNumber: number
  title: string
  difficulty: string
  questionCount: number
  durationMinutes: number
  currentQuestionNumber: number
  question: MockQuestion
}

const demoQuestions: Record<string, MockQuestion[]> = {
  administrativo: [
    {
      id: 'administrativo-constitucion-001',
      statement: 'Según la Constitución Española, ¿en quién reside la soberanía nacional?',
      options: [
        { id: 'a', text: 'En las Cortes Generales, que la ejercen en representación del pueblo.' },
        { id: 'b', text: 'En el pueblo español, del que emanan los poderes del Estado.' },
        { id: 'c', text: 'En el Gobierno, como órgano superior de la Administración.' },
        { id: 'd', text: 'En la Corona, como símbolo de la unidad del Estado.' },
      ],
    },
  ],
  'auxiliar-administrativo': [
    {
      id: 'auxiliar-organizacion-001',
      statement: '¿Cuál es el objetivo principal de la organización administrativa?',
      options: [
        { id: 'a', text: 'Garantizar el funcionamiento eficiente de los servicios.' },
        { id: 'b', text: 'Eliminar todos los controles internos.' },
        { id: 'c', text: 'Limitar la atención al público.' },
        { id: 'd', text: 'Centralizar únicamente la información personal.' },
      ],
    },
    {
      id: 'auxiliar-documentos-002',
      statement: '¿Qué documento acredita formalmente una actuación o decisión administrativa?',
      options: [
        { id: 'a', text: 'La resolución administrativa.' },
        { id: 'b', text: 'La agenda personal.' },
        { id: 'c', text: 'La nota informal.' },
        { id: 'd', text: 'El inventario de mobiliario.' },
      ],
    },
    {
      id: 'auxiliar-archivo-003',
      statement: '¿Qué sistema ayuda a registrar, archivar y localizar documentos?',
      options: [
        { id: 'a', text: 'El expediente administrativo.' },
        { id: 'b', text: 'El buzón de sugerencias.' },
        { id: 'c', text: 'El calendario laboral.' },
        { id: 'd', text: 'La hoja de instrucciones internas.' },
      ],
    },
    {
      id: 'auxiliar-confidencialidad-004',
      statement: '¿Qué significa tratar la información de una institución con confidencialidad?',
      options: [
        { id: 'a', text: 'Compartirla únicamente con personas autorizadas.' },
        { id: 'b', text: 'Publicarla en las redes sociales.' },
        { id: 'c', text: 'Enviarla a cualquier persona interesada.' },
        { id: 'd', text: 'Eliminarla sin consultar.' },
      ],
    },
    {
      id: 'auxiliar-atencion-005',
      statement: '¿Qué actitud es esencial para atender correctamente al público?',
      options: [
        { id: 'a', text: 'Mantener una comunicación respetuosa, clara y amable.' },
        { id: 'b', text: 'Ignorar las dudas del usuario.' },
        { id: 'c', text: 'Responder siempre con expresiones informales.' },
        { id: 'd', text: 'Derivar sin explicar a ninguna persona.' },
      ],
    },
  ],
  celador: [
    {
      id: 'celador-funcion-001',
      statement: '¿Cuál es una función principal de un celador en una institución pública?',
      options: [
        { id: 'a', text: 'Diagnosticar enfermedades.' },
        { id: 'b', text: 'Vigilar las instalaciones y contribuir a la seguridad.' },
        { id: 'c', text: 'Prescribir medicación.' },
        { id: 'd', text: 'Realizar operaciones quirúrgicas.' },
      ],
    },
    {
      id: 'celador-incendio-002',
      statement: 'Ante un incendio, ¿qué debe hacer inicialmente un celador?',
      options: [
        { id: 'a', text: 'Activar la alarma y seguir el plan de evacuación.' },
        { id: 'b', text: 'Esperar sin avisar a nadie.' },
        { id: 'c', text: 'Apagar el fuego sin equipo protector.' },
        { id: 'd', text: 'Cerrar todas las salidas.' },
      ],
    },
    {
      id: 'celador-acceso-003',
      statement: '¿Cómo debe actuar ante una persona desconocida que quiere acceder a una zona restringida?',
      options: [
        { id: 'a', text: 'Solicitar identificación y seguir el protocolo de acceso.' },
        { id: 'b', text: 'Permitir el acceso sin comprobar su identidad.' },
        { id: 'c', text: 'Abandonar su puesto.' },
        { id: 'd', text: 'Entregarle las llaves de la zona.' },
      ],
    },
    {
      id: 'celador-puerta-004',
      statement: 'Ante una puerta abierta fuera del horario permitido, ¿qué debe hacer el celador?',
      options: [
        { id: 'a', text: 'Comprobar la situación, asegurar el acceso y comunicarlo.' },
        { id: 'b', text: 'Ignorar la incidencia.' },
        { id: 'c', text: 'Dejarla abierta para que pueda entrar cualquier persona.' },
        { id: 'd', text: 'Bloquearla sin informar al responsable.' },
      ],
    },
    {
      id: 'celador-movilizacion-005',
      statement: 'Antes de ayudar a movilizar a un paciente, ¿qué debe hacer el celador?',
      options: [
        { id: 'a', text: 'Iniciar el movimiento sin consultar.' },
        { id: 'b', text: 'Valorar la situación y seguir las indicaciones del personal sanitario.' },
        { id: 'c', text: 'Retirar todos los dispositivos del paciente.' },
        { id: 'd', text: 'Pedir al paciente que se incorpore sin ayuda.' },
      ],
    },
  ],
}

const demoOppositions: Record<string, {
  name: string
  easy: { questionCount: number; durationMinutes: number }
  difficult: { questionCount: number; durationMinutes: number }
  fullMock: { count: number; questionCount: number; durationMinutes: number }
}> = {
  'auxiliar-administrativo': {
    name: 'Auxiliar Administrativo',
    easy: { questionCount: 20, durationMinutes: 20 },
    difficult: { questionCount: 20, durationMinutes: 20 },
    fullMock: { count: 5, questionCount: 100, durationMinutes: 90 },
  },
  administrativo: {
    name: 'Administrativo',
    easy: { questionCount: 20, durationMinutes: 20 },
    difficult: { questionCount: 20, durationMinutes: 20 },
    fullMock: { count: 5, questionCount: 100, durationMinutes: 90 },
  },
  celador: {
    name: 'Celador',
    easy: { questionCount: 20, durationMinutes: 20 },
    difficult: { questionCount: 20, durationMinutes: 20 },
    fullMock: { count: 5, questionCount: 100, durationMinutes: 90 },
  },
}

export function getMockPracticeExam(
  oppositionSlug: string,
  mode: string | null,
  mockNumber: number,
): MockPracticeExam | undefined {
  const opposition = demoOppositions[oppositionSlug]
  const questions = demoQuestions[oppositionSlug]

  if (!opposition || !questions?.length || !isPracticeMode(mode)) {
    return undefined
  }

  if (
    mode === 'full' &&
    (!Number.isInteger(mockNumber) || mockNumber < 1 || mockNumber > opposition.fullMock.count)
  ) {
    return undefined
  }

  const practiceConfig = mode === 'full'
    ? opposition.fullMock
    : opposition[mode]
  const difficulty = mode === 'easy'
    ? 'Fácil'
    : mode === 'difficult'
      ? 'Difícil'
      : 'Examen completo'
  const title = mode === 'full'
    ? `Simulacro ${mockNumber}`
    : `Práctica ${difficulty.toLowerCase()}`
  const questionIndex = mode === 'full'
    ? (mockNumber - 1) % questions.length
    : 0

  return {
    attemptId: `demo-${oppositionSlug}-${mode}-${mockNumber}`,
    oppositionSlug,
    oppositionName: opposition.name,
    mode,
    mockNumber,
    title,
    difficulty,
    questionCount: practiceConfig.questionCount,
    durationMinutes: practiceConfig.durationMinutes,
    currentQuestionNumber: 1,
    question: questions[questionIndex],
  }
}
