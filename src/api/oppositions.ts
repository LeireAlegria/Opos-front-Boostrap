export interface OppositionCategory {
  slug: string
  name: string
}

export interface OppositionSummary {
  slug: string
  name: string
  category: OppositionCategory
  icon: string
  color: string
  questionCount: number
}

export interface OppositionListResponse {
  items: OppositionSummary[]
  page: number
  pageSize: number
  totalItems: number
}

export interface OppositionDetail extends OppositionSummary {
  description: string
  topics: {
    slug: string
    name: string
    questionCount: number
    concepts: string[]
  }[]
  practice: {
    easy: { questionCount: number; durationMinutes: number } | null
    difficult: { questionCount: number; durationMinutes: number } | null
    fullMocks: {
      id: string
      number: number
      questionCount: number
      durationMinutes: number
    }[]
  }
}

export interface TopicPracticeResponse {
  oppositionName: string
  topicName: string
  durationMinutes: number
  questionCount: number
  questions: {
    id: string
    statement: string
    options: { id: string; text: string }[]
  }[]
}

export type QuestionReportReason = 'incorrect' | 'unclear' | 'typo' | 'other'

const defaultApiBaseUrl = `http://${window.location.hostname || 'localhost'}:8000/api`
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl)
  .replace(/\/+$/, '')

export async function fetchOppositions(
  filters: { page: number; pageSize: number; search: string; category: string },
  signal: AbortSignal,
): Promise<OppositionListResponse> {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  })
  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.category) params.set('category', filters.category)

  const response = await fetch(`${apiBaseUrl}/oppositions?${params}`, { signal })
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (HTTP ${response.status}).`)
  }
  return response.json() as Promise<OppositionListResponse>
}

export async function fetchOppositionDetail(
  slug: string,
  signal: AbortSignal,
): Promise<OppositionDetail> {
  const response = await fetch(`${apiBaseUrl}/oppositions/${encodeURIComponent(slug)}`, { signal })
  if (!response.ok) {
    throw new Error(`No se pudo cargar la oposición (HTTP ${response.status}).`)
  }
  return response.json() as Promise<OppositionDetail>
}

export async function fetchTopicPracticeQuestions(
  oppositionSlug: string,
  topicSlug: string,
  signal: AbortSignal,
): Promise<TopicPracticeResponse> {
  const response = await fetch(
    `${apiBaseUrl}/oppositions/${encodeURIComponent(oppositionSlug)}/topics/${encodeURIComponent(topicSlug)}/questions`,
    { signal },
  )
  if (!response.ok) {
    throw new Error(`No se pudieron cargar las preguntas del tema (HTTP ${response.status}).`)
  }
  return response.json() as Promise<TopicPracticeResponse>
}

export async function submitQuestionReport(
  oppositionSlug: string,
  topicSlug: string,
  questionSlug: string,
  report: { reason: QuestionReportReason; details: string },
): Promise<void> {
  const csrfResponse = await fetch(`${apiBaseUrl}/csrf`, { credentials: 'include' })
  if (!csrfResponse.ok) {
    throw new Error(`No se pudo preparar el envío del reporte (HTTP ${csrfResponse.status}).`)
  }
  const { csrfToken } = await csrfResponse.json() as { csrfToken: string }

  const response = await fetch(
    `${apiBaseUrl}/oppositions/${encodeURIComponent(oppositionSlug)}/topics/${encodeURIComponent(topicSlug)}/questions/${encodeURIComponent(questionSlug)}/reports`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(report),
    },
  )
  if (!response.ok) {
    throw new Error(`No se pudo enviar el reporte (HTTP ${response.status}).`)
  }
}
