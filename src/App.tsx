import { useEffect, useState, type FormEvent } from 'react'
import {
  apiBaseUrl,
  submitQuestionReport,
  fetchTopicPracticeQuestions,
  fetchOppositionDetail,
  fetchOppositions,
  type OppositionCategory,
  type OppositionDetail,
  type OppositionListResponse,
  type QuestionReportReason,
  type TopicPracticeResponse,
} from './api/oppositions'
import { getMockPracticeExam, type PracticeMode } from './data/mockPracticeExams'
import './App.css'

const demoUserSessionKey = 'oposnavarra-demo-user'

const oppositionTips = [
  'Organiza un calendario de estudio realista.',
  'Empieza cada sesión repasando lo aprendido.',
  'Haz tests todos los días para medir tu progreso.',
  'Alterna teoría, práctica y descanso.',
  'Identifica tus temas débiles y refuerzalos.',
  'Estudia usando preguntas de exámenes anteriores.',
  'Descansa lo suficiente antes del examen.',
  'Simula las condiciones reales del test.',
  'Corrige tus errores y vuelve a intentarlo.',
  'Mantén una rutina constante hasta el último día.',
]

function CheckIcon() {
  return (
    <span className="check-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M6.8 12.7l3.2 3.2 7.2-8" />
      </svg>
    </span>
  )
}

function ProgressIcon() {
  return (
    <span className="progress-icon" aria-hidden="true">
      <span className="bar bar-one" />
      <span className="bar bar-two" />
      <span className="bar bar-three" />
    </span>
  )
}

function ExpertIcon() {
  return (
    <span className="expert-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M16 6.5l10 5.2-10 5.3-10-5.3 10-5.2z" fill="#7254ff" />
        <path d="M9 14.5v6.2c2.8 3.1 11.2 3.1 14 0v-6.2l-7 3.7-7-3.7z" fill="#3d2d84" />
      </svg>
    </span>
  )
}

function SiteHeader({ showRegister = true }: { showRegister?: boolean }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<{ firstName: string; email: string } | null>(null)
  const isDemoUser = window.sessionStorage.getItem(demoUserSessionKey) === 'true'

  useEffect(() => {
    fetch(`${apiBaseUrl}/auth/session`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { authenticated?: boolean; user?: { firstName: string; email: string } } | null) => {
        if (payload?.authenticated && payload.user) setSessionUser(payload.user)
      })
      .catch(() => undefined)
  }, [])

  const signedInUser = sessionUser || (isDemoUser
    ? { firstName: 'Usuario demo', email: '' }
    : null)

  return (
    <header className="nav">
      <a className="brand" href="/" aria-label="Oposiciones Navarra inicio">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-copy">
          <strong>OPOSICIONES</strong>
          <small>NAVARRA</small>
        </span>
      </a>
      <nav className="nav-actions" aria-label="Cuenta">
        {signedInUser ? (
          <>
            <a className="premium-nav-link" href="/premium-upgrade/">
              Go Premium
            </a>
            <div className="profile-dropdown">
              <button
                type="button"
                className="profile-trigger"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
              >
                <svg className="profile-avatar" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M4.5 21c.3-4.1 3.2-6.5 7.5-6.5s7.2 2.4 7.5 6.5z" />
                </svg>
                <span>{signedInUser.firstName || 'Usuario'}</span>
                <svg className="profile-chevron" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
              {profileMenuOpen && (
                <div className="profile-menu" role="menu">
                  <a href="/profile" role="menuitem">Profile</a>
                  <a href="/settings" role="menuitem">Settings</a>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/login">Acceder</a>
            {showRegister && <a className="register" href="/registro">Registrarse</a>}
          </>
        )}
      </nav>
    </header>
  )
}

function StudyPlanIcon() {
  return (
    <svg className="study-plan-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="30" cy="34" r="18" fill="none" stroke="#ff5f98" strokeWidth="5" />
      <circle cx="30" cy="34" r="9" fill="none" stroke="#ff5f98" strokeWidth="5" />
      <circle cx="30" cy="34" r="3" fill="#ff5f98" />
      <path d="M30 34L48 16" fill="none" stroke="#ff5f98" strokeWidth="5" strokeLinecap="round" />
      <path d="m46 18 11-11M48 7l9 9" fill="none" stroke="#39bfae" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function ProfilePage() {
  const [studyPace, setStudyPace] = useState(() => localStorage.getItem('oposnavarra-study-pace') || 'steady')
  const [hasExamDate, setHasExamDate] = useState(() => localStorage.getItem('oposnavarra-has-exam-date') === 'yes')
  const [examDate, setExamDate] = useState(() => localStorage.getItem('oposnavarra-exam-date') || '')

  const choosePace = (pace: string) => {
    setStudyPace(pace)
    localStorage.setItem('oposnavarra-study-pace', pace)
  }

  const chooseExamDate = (answer: 'yes' | 'no') => {
    setHasExamDate(answer === 'yes')
    localStorage.setItem('oposnavarra-has-exam-date', answer)
  }

  const chooseDate = (date: string) => {
    setExamDate(date)
    localStorage.setItem('oposnavarra-exam-date', date)
  }

  return (
    <div className="landing">
      <SiteHeader />
      <main className="study-plan-page">
        <section className="study-plan-card" aria-labelledby="study-plan-title">
          <StudyPlanIcon />
          <h1 id="study-plan-title">Configura tu plan de estudio</h1>
          <p className="study-plan-subtitle">
            Preparación para OposNavarra. Elige tu ritmo y ajustaremos el plan al resto.
          </p>

          <div className="study-pace-options" role="radiogroup" aria-label="Ritmo de estudio">
            <button
              type="button"
              role="radio"
              aria-checked={studyPace === 'light'}
              className={`study-pace-option${studyPace === 'light' ? ' selected' : ''}`}
              onClick={() => choosePace('light')}
            >
              <span className="pace-icon light" aria-hidden="true">🌙</span>
              <span className="pace-copy">
                <strong>Ligero</strong>
                <small>Unas veces por semana</small>
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={studyPace === 'steady'}
              className={`study-pace-option${studyPace === 'steady' ? ' selected' : ''}`}
              onClick={() => choosePace('steady')}
            >
              <span className="pace-icon steady" aria-hidden="true">💪</span>
              <span className="pace-copy">
                <strong>Constante</strong>
                <small>La mayoría de los días</small>
              </span>
              {studyPace === 'steady' && <span className="pace-recommended">Recomendado</span>}
              {studyPace === 'steady' && <span className="pace-check" aria-label="Seleccionado">✓</span>}
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={studyPace === 'intense'}
              className={`study-pace-option${studyPace === 'intense' ? ' selected' : ''}`}
              onClick={() => choosePace('intense')}
            >
              <span className="pace-icon intense" aria-hidden="true">🔥</span>
              <span className="pace-copy">
                <strong>Intenso</strong>
                <small>Todos los días</small>
              </span>
            </button>
          </div>

          <div className="exam-date-section">
            <p>¿Ya tienes fecha de examen?</p>
            <div className="exam-date-actions">
              <button
                type="button"
                className={`exam-date-button${hasExamDate ? ' selected' : ''}`}
                onClick={() => chooseExamDate('yes')}
              >
                Sí, tengo una fecha
              </button>
              <button
                type="button"
                className={`exam-date-button${!hasExamDate ? ' selected' : ''}`}
                onClick={() => chooseExamDate('no')}
              >
                Aún no
              </button>
            </div>
            {hasExamDate && (
              <label className="exam-date-picker">
                <span>Fecha del examen</span>
                <input
                  type="date"
                  value={examDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => chooseDate(event.target.value)}
                />
              </label>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function SettingsPage() {
  const [settingsEmail, setSettingsEmail] = useState('Usuario demo')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [firstName, setFirstName] = useState(() => localStorage.getItem('oposnavarra-profile-first-name') || 'Usuario')
  const [lastName, setLastName] = useState(() => localStorage.getItem('oposnavarra-profile-last-name') || 'demo')
  const [nameChanged, setNameChanged] = useState(() => localStorage.getItem('oposnavarra-profile-name-changed') === 'true')
  const [timezone, setTimezone] = useState(() => localStorage.getItem('oposnavarra-timezone') || 'Europe/Madrid')
  const [profileMessage, setProfileMessage] = useState('')
  const [timezoneMessage, setTimezoneMessage] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingTimezone, setIsSavingTimezone] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    fetch(`${apiBaseUrl}/auth/session`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: {
        authenticated?: boolean
        user?: { email: string; firstName: string; lastName: string; timezone: string; nameChanged: boolean }
      } | null) => {
        if (payload?.authenticated && payload.user) {
          setIsAuthenticated(true)
          setSettingsEmail(payload.user.email)
          setFirstName(payload.user.firstName)
          setLastName(payload.user.lastName)
          setTimezone(payload.user.timezone)
          setNameChanged(payload.user.nameChanged)
        }
      })
      .catch(() => undefined)
  }, [])

  const saveSettings = async (endpoint: string, data: Record<string, string>) => {
    const csrfResponse = await fetch(`${apiBaseUrl}/csrf`, { credentials: 'include' })
    if (!csrfResponse.ok) throw new Error('No se pudo preparar el guardado.')
    const { csrfToken } = await csrfResponse.json() as { csrfToken: string }
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      body: JSON.stringify(data),
    })
    const result = await response.json() as { error?: { message?: string } }
    if (!response.ok) throw new Error(result.error?.message || 'No se pudieron guardar los cambios.')
  }

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage('')
    setIsSavingProfile(true)
    try {
      if (isAuthenticated) {
        await saveSettings('/auth/settings/profile', { firstName, lastName })
      }
      localStorage.setItem('oposnavarra-profile-first-name', firstName)
      localStorage.setItem('oposnavarra-profile-last-name', lastName)
      localStorage.setItem('oposnavarra-profile-name-changed', 'true')
      setNameChanged(true)
      setProfileMessage('Perfil guardado correctamente.')
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'No se pudo guardar el perfil.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleTimezoneSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTimezoneMessage('')
    setIsSavingTimezone(true)
    try {
      if (isAuthenticated) {
        await saveSettings('/auth/settings/timezone', { timezone })
      }
      localStorage.setItem('oposnavarra-timezone', timezone)
      setTimezoneMessage('Zona horaria guardada correctamente.')
    } catch (error) {
      setTimezoneMessage(error instanceof Error ? error.message : 'No se pudo guardar la zona horaria.')
    } finally {
      setIsSavingTimezone(false)
    }
  }

  const handleLogout = async () => {
    setLogoutMessage('')
    setIsLoggingOut(true)
    try {
      if (isAuthenticated) {
        await saveSettings('/auth/logout', {})
      }
      window.sessionStorage.removeItem(demoUserSessionKey)
      window.location.assign('/login')
    } catch (error) {
      setLogoutMessage(error instanceof Error ? error.message : 'No se pudo cerrar la sesión.')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="landing">
      <SiteHeader />
      <main className="settings-page">
        <div className="settings-container">
          <h1>Ajustes</h1>
          <p className="settings-subtitle">Gestiona los datos de tu cuenta y tus preferencias de estudio.</p>

          <section className="settings-account-card" aria-labelledby="settings-account-title">
            <h2 id="settings-account-title">Cuenta</h2>

            <div className="settings-account-row">
              <span className="settings-row-label">Correo electrónico</span>
              <p>Se usa para iniciar sesión y recibir recordatorios de estudio.</p>
              <strong>{settingsEmail}</strong>
            </div>

            <div className="settings-account-row settings-plan-row">
              <span className="settings-row-label">Plan</span>
              <p>Práctica ilimitada y exámenes completos.</p>
              <div className="settings-plan-actions">
                <strong>Gratis</strong>
                <a href="/premium-upgrade/">Mejorar</a>
              </div>
            </div>

            <div className="settings-section-divider" />

            <section className="settings-preference-section" aria-labelledby="settings-profile-title">
              <h3 id="settings-profile-title">Perfil</h3>
              <form className="settings-form" onSubmit={handleProfileSave}>
                <label>
                  Nombre
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    disabled={nameChanged || isSavingProfile}
                    required
                    maxLength={150}
                  />
                </label>
                <label>
                  Apellidos
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    disabled={nameChanged || isSavingProfile}
                    required
                    maxLength={150}
                  />
                </label>
                <p className="settings-help">
                  Solo puedes cambiar tu nombre una vez. Revísalo antes de guardarlo. Después, escribe a{' '}
                  <a href="mailto:support@trustedinstitute.com">support@trustedinstitute.com</a> para cambiarlo.
                </p>
                {!nameChanged && (
                  <button className="settings-save-button" type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? 'Guardando…' : 'Guardar perfil'}
                  </button>
                )}
                {profileMessage && <p className="settings-feedback" role="status">{profileMessage}</p>}
              </form>
            </section>

            <div className="settings-section-divider" />

            <section className="settings-preference-section" aria-labelledby="settings-timezone-title">
              <h3 id="settings-timezone-title">Zona horaria</h3>
              <p>Se usa para mostrar tu progreso diario y tus rachas de práctica.</p>
              <form className="settings-form settings-timezone-form" onSubmit={handleTimezoneSave}>
                <label>
                  Tu zona horaria
                  <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                    <option value="Europe/Madrid">Madrid</option>
                    <option value="Atlantic/Canary">Islas Canarias</option>
                    <option value="Europe/London">Londres</option>
                    <option value="Europe/Paris">París</option>
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Bogota">Bogotá</option>
                    <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
                  </select>
                </label>
                <button className="settings-save-button" type="submit" disabled={isSavingTimezone}>
                  {isSavingTimezone ? 'Guardando…' : 'Guardar zona horaria'}
                </button>
                {timezoneMessage && <p className="settings-feedback" role="status">{timezoneMessage}</p>}
              </form>
            </section>

            <div className="settings-section-divider" />

            <section className="settings-preference-section settings-signout-section" aria-labelledby="settings-signout-title">
              <h3 id="settings-signout-title">Cerrar sesión</h3>
              <p>Finaliza tu sesión en este dispositivo. Podrás volver a entrar cuando quieras con tu correo electrónico.</p>
              <button
                className="settings-signout-button"
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span aria-hidden="true">↪</span>
                {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
              {logoutMessage && <p className="settings-feedback" role="alert">{logoutMessage}</p>}
            </section>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <a className="footer-brand" href="/" aria-label="Oposiciones Navarra inicio">
          <span className="footer-mark" aria-hidden="true" />
          <span className="footer-brand-copy">
            <strong>OposNavarra</strong>
            <small>Prepara con sentido.</small>
          </span>
        </a>

        <nav className="footer-links" aria-label="Enlaces del pie de página">
          <a href="/">Inicio</a>
          <a href="/#oposiciones">Oposiciones</a>
          <a href="/premium-upgrade/">Planes</a>
          <a href="/#contacto">Contacto</a>
          <a href="/#privacidad">Privacidad</a>
          <a href="/#aviso-legal">Aviso legal</a>
        </nav>
      </div>
    </footer>
  )
}

const premiumFeatures = [
  { icon: '🚀', title: 'Tests de práctica ilimitados', description: 'Practica a tu ritmo y refuerza cada tema.' },
  { icon: '📚', title: 'Explicaciones detalladas', description: 'Comprende cada respuesta y aprende de tus errores.' },
  { icon: '📊', title: 'Seguimiento de tu progreso', description: 'Consulta tus resultados y detecta qué repasar.' },
  { icon: '🎯', title: 'Recomendaciones personalizadas', description: 'Organiza el estudio según tus necesidades.' },
  { icon: '📱', title: 'Acceso desde tus dispositivos', description: 'Continúa preparando la oposición donde quieras.' },
  { icon: '🛡️', title: 'Garantía de devolución', description: 'Consulta las condiciones antes de contratar.' },
]

const premiumTrialEndDate = new Date()
premiumTrialEndDate.setDate(premiumTrialEndDate.getDate() + 7)
const formattedPremiumTrialEndDate = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(premiumTrialEndDate)

function isCheckoutSessionResponse(value: unknown): value is { checkoutUrl: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'checkoutUrl' in value &&
    typeof value.checkoutUrl === 'string'
  )
}

function ApiStatusPage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="landing">
      <SiteHeader />
      <main className="api-status-page">
        <p role={onRetry ? 'alert' : 'status'}>{message}</p>
        {onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}
        <a href="/">Volver al catálogo</a>
      </main>
      <SiteFooter />
    </div>
  )
}

function PremiumUpgradePage() {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const startTrial = async () => {
    setIsCheckoutLoading(true)
    setCheckoutError('')

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'premium-monthly',
          successUrl: new URL('/premium-upgrade/?checkout=success', window.location.origin).toString(),
          cancelUrl: new URL('/premium-upgrade/', window.location.origin).toString(),
        }),
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Inicia sesión para comenzar la prueba gratuita.'
            : 'No se pudo iniciar el pago. Inténtalo de nuevo más tarde.',
        )
      }

      const result: unknown = await response.json()
      if (!isCheckoutSessionResponse(result)) {
        throw new Error('El servicio de pago devolvió una respuesta no válida.')
      }

      const checkoutUrl = new URL(result.checkoutUrl)
      if (
        checkoutUrl.protocol !== 'https:' ||
        !['checkout.stripe.com', 'buy.stripe.com'].includes(checkoutUrl.hostname)
      ) {
        throw new Error('El servicio de pago devolvió una dirección de Stripe no válida.')
      }

      window.location.assign(checkoutUrl.toString())
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar el pago. Inténtalo de nuevo más tarde.',
      )
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  return (
    <div className="landing">
      <SiteHeader />
      <main className="premium-upgrade-page">
        <nav className="breadcrumbs" aria-label="Ruta de navegación">
          <a href="/">Inicio</a>
          <span aria-hidden="true">/</span>
          <span>Premium Upgrade</span>
        </nav>

        <div className="premium-upgrade-layout">
          <div className="premium-upgrade-content">
            <section className="upgrade-congrats">
              <strong><span aria-hidden="true">🎯</span> ¿Listo para llevar tu preparación más lejos?</strong>
              <p>Desbloquea herramientas y práctica para avanzar en tu próxima oposición.</p>
            </section>

            <section className="upgrade-overview" aria-labelledby="upgrade-title">
              <h1 id="upgrade-title">Acceso completo a todas las oposiciones</h1>
              <p>
                Practica con tests, consulta explicaciones detalladas y sigue tu progreso
                desde un solo lugar.
              </p>
              <div className="upgrade-badges">
                <span>⭐ Preparación completa</span>
                <span>📚 Todas las oposiciones</span>
                <span>📝 Tests de práctica</span>
                <span>🎯 Enfoque personalizado</span>
              </div>
            </section>

            <a className="upgrade-highlight" href="/registro">
              <strong><span aria-hidden="true">🎓</span> Prepárate a tu manera</strong>
              <p>Una sola suscripción para practicar en las oposiciones disponibles.</p>
            </a>

            <a className="upgrade-dark-callout" href="/registro">
              <strong>Acceso Premium — Oposiciones Navarra</strong>
              <span>Practica, repasa y sigue tu avance en un mismo lugar.</span>
            </a>

            <section className="upgrade-features-section" aria-labelledby="upgrade-features-title">
              <h2 id="upgrade-features-title">Completa tu camino a la oposición</h2>
              <div className="upgrade-features">
                {premiumFeatures.map((feature) => (
                  <article className="upgrade-feature" key={feature.title}>
                    <span aria-hidden="true">{feature.icon}</span>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="upgrade-plan-card" aria-label="Prueba gratuita">
            <div className="upgrade-illustration" aria-hidden="true">
              <svg viewBox="0 0 280 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="upgrade-chart-gradient" x1="0" x2="1" y1="1" y2="0">
                    <stop offset="0%" stopColor="#ff9a45" />
                    <stop offset="100%" stopColor="#baf15a" />
                  </linearGradient>
                  <linearGradient id="upgrade-area-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#baf15a" stopOpacity=".24" />
                    <stop offset="100%" stopColor="#baf15a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M42 43h196M42 72h196M42 101h196" stroke="#ffffff" strokeOpacity=".1" strokeDasharray="4 7" />
                <path d="M49 111C75 104 86 91 109 92s38-22 60-19 38-25 62-37v83H49z" fill="url(#upgrade-area-gradient)" />
                <path d="M49 111C75 104 86 91 109 92s38-22 60-19 38-25 62-37" fill="none" stroke="url(#upgrade-chart-gradient)" strokeWidth="5" strokeLinecap="round" />
                <path d="M216 36l15-3-3 15" fill="none" stroke="#baf15a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="109" cy="92" r="5" fill="#ff9a45" stroke="#282139" strokeWidth="3" />
                <circle cx="169" cy="73" r="5" fill="#baf15a" stroke="#282139" strokeWidth="3" />
                <circle cx="231" cy="36" r="5" fill="#ff9a45" stroke="#282139" strokeWidth="3" />
                <rect x="54" y="119" width="15" height="10" rx="4" fill="#8a6be8" />
                <rect x="82" y="114" width="15" height="15" rx="4" fill="#43d7bc" />
                <rect x="110" y="108" width="15" height="21" rx="4" fill="#ff9f43" />
                <rect x="138" y="101" width="15" height="28" rx="4" fill="#baf15a" />
                <rect x="166" y="94" width="15" height="35" rx="4" fill="#8a6be8" />
                <rect x="194" y="84" width="15" height="45" rx="4" fill="#43d7bc" />
                <circle cx="68" cy="29" r="3" fill="#ff9f43" />
                <path d="M201 54l3 5 5 3-5 3-3 5-3-5-5-3 5-3z" fill="#ffbd62" />
              </svg>
            </div>
            <div className="upgrade-plan-body">
              <strong className="upgrade-trial">7 días gratis</strong>
              <p className="upgrade-trial-copy">
                Prueba gratuita hasta el <strong>{formattedPremiumTrialEndDate}</strong>
                <br />
                Después, 29,95 € al mes desde el <strong>{formattedPremiumTrialEndDate}</strong>
              </p>
              <div className="upgrade-trial-reminder">
                🔒 Empieza tu prueba hoy — cancela cuando quieras
              </div>
              <button
                type="button"
                className="upgrade-trial-button"
                onClick={startTrial}
                disabled={isCheckoutLoading}
                aria-busy={isCheckoutLoading}
              >
                {isCheckoutLoading ? 'Conectando con Stripe…' : 'Empezar prueba'}
              </button>
              {checkoutError && (
                <p className="upgrade-checkout-error" role="alert">{checkoutError}</p>
              )}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function OppositionDetailPage({ opposition }: { opposition: OppositionDetail }) {
  const { practice } = opposition
  const topicPracticeEnabled = ['auxiliar-administrativo', 'celador'].includes(opposition.slug)
  const practiceUrl = (mode: PracticeMode, mockNumber = 1) =>
    `/oposiciones/${opposition.slug}/examen?mode=${mode}&mock=${mockNumber}`

  return (
    <div className="landing">
      <SiteHeader />
      <main className="opposition-detail-page">
        <nav className="breadcrumbs" aria-label="Ruta de navegación">
          <a href="/">Inicio</a>
          <span aria-hidden="true">/</span>
          <a href="/#oposiciones">Oposiciones</a>
          <span aria-hidden="true">/</span>
          <span>{opposition.name}</span>
        </nav>

        <section className="opposition-detail-hero" aria-labelledby="opposition-detail-title">
          <div className="opposition-detail-hero-content">
            <span className="opposition-detail-category">{opposition.category.name}</span>
            <h1 id="opposition-detail-title">Prepara tu oposición de {opposition.name}</h1>
            <p>{opposition.description}</p>
            <div className="opposition-detail-actions">
              <a className="detail-primary-button" href="/registro">Empezar práctica gratis <span aria-hidden="true">→</span></a>
              <a className="detail-secondary-button" href="#temas">Ver temas</a>
            </div>
          </div>
          <div className="opposition-detail-stats" aria-label="Datos de la oposición">
            <div><strong>{opposition.questionCount.toLocaleString('es-ES')}</strong><span>Preguntas</span></div>
            <div><strong>{opposition.topics.length}</strong><span>Temas</span></div>
          </div>
        </section>

        <section className="opposition-detail-section detail-overview" aria-labelledby="detail-overview-title">
          <div>
            <span className="detail-section-kicker">Tu preparación, paso a paso</span>
            <h2 id="detail-overview-title">Practica cada materia y mide tu progreso</h2>
            <p>
              Encuentra preguntas por tema, alterna niveles de dificultad y utiliza los
              simulacros para familiarizarte con el formato del examen.
            </p>
          </div>
          <ul>
            <li><span aria-hidden="true">✓</span> Preguntas agrupadas por materias</li>
            <li><span aria-hidden="true">✓</span> Práctica rápida o por dificultad</li>
            <li><span aria-hidden="true">✓</span> Simulacros con tiempo orientativo</li>
          </ul>
        </section>

        <section id="temas" className="opposition-detail-section" aria-labelledby="detail-topics-title">
          <div className="detail-section-heading">
            <div>
              <span className="detail-section-kicker">Contenido del temario</span>
              <h2 id="detail-topics-title">Practica por temas</h2>
            </div>
            <span>{opposition.topics.length} temas · {opposition.questionCount.toLocaleString('es-ES')} preguntas</span>
          </div>
          <div className="detail-topic-grid">
            {opposition.topics.map((topic) => {
              const cardContent = (
                <>
                  <span className="detail-topic-icon" style={{ backgroundColor: opposition.color }} aria-hidden="true">
                    {opposition.icon}
                  </span>
                  <div>
                    <h3>{topic.name}</h3>
                    <p>
                      {topicPracticeEnabled
                        ? '5 preguntas de ejemplo'
                        : `${topic.questionCount.toLocaleString('es-ES')} preguntas disponibles`}
                    </p>
                    {topicPracticeEnabled && (
                      <div className="detail-practice-meta">
                        <span>5 min</span>
                        <span>5 preguntas</span>
                      </div>
                    )}
                  </div>
                  <span className="detail-topic-arrow" aria-hidden="true">
                    {topicPracticeEnabled ? '→' : ''}
                  </span>
                </>
              )
              const cardProps = { className: 'detail-topic-card', key: topic.slug }

              return topicPracticeEnabled ? (
                <a
                  {...cardProps}
                  href={`/oposiciones/${opposition.slug}/examen?topic=${encodeURIComponent(topic.slug)}`}
                  aria-label={`Hacer test de ${topic.name}: 5 preguntas en 5 minutos`}
                >
                  {cardContent}
                </a>
              ) : (
                <article {...cardProps}>{cardContent}</article>
              )
            })}
          </div>
        </section>

        <section className="opposition-detail-section" aria-labelledby="detail-practice-title">
          <div className="detail-section-heading">
            <div>
              <span className="detail-section-kicker">Entrena a tu ritmo</span>
              <h2 id="detail-practice-title">Elige cómo practicar</h2>
            </div>
          </div>
          <div className="detail-practice-grid">
            {([
              { key: 'easy', title: 'Preguntas fáciles', description: 'Refuerza los conceptos básicos.', config: practice.easy, icon: '🌱' },
              { key: 'difficult', title: 'Preguntas difíciles', description: 'Ponte a prueba con preguntas avanzadas.', config: practice.difficult, icon: '🔥' },
            ] as const).map(({ key, title, description, config, icon }) => (
              config && <article className="detail-practice-card" key={key}>
                <span aria-hidden="true">{icon}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="detail-practice-meta">
                  <span>{config.durationMinutes} min</span>
                  <span>{config.questionCount} preguntas</span>
                </div>
                <a href={practiceUrl(key)}>Empezar <span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="opposition-detail-section detail-mocks" aria-labelledby="detail-mocks-title">
          <div className="detail-section-heading">
            <div>
              <span className="detail-section-kicker">Simula el día del examen</span>
              <h2 id="detail-mocks-title">Exámenes completos</h2>
            </div>
            <span>{practice.fullMocks.length} simulacros disponibles</span>
          </div>
          <div className="detail-mock-grid">
            {practice.fullMocks.map((mock) => (
              <article className="detail-mock-card" key={mock.id}>
                <div>
                  <span className="detail-mock-number">{String(mock.number).padStart(2, '0')}</span>
                  <div>
                    <h3>Simulacro {mock.number}</h3>
                    <p>Examen completo · sin repetir preguntas</p>
                  </div>
                </div>
                <span>{mock.durationMinutes} min · {mock.questionCount} preguntas</span>
                <a href={practiceUrl('full', mock.number)} aria-label={`Empezar simulacro ${mock.number}`}>Empezar <span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function TopicPracticePage({
  oppositionSlug,
  topicSlug,
}: {
  oppositionSlug: string
  topicSlug: string
}) {
  const [practice, setPractice] = useState<TopicPracticeResponse | null>(null)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60)
  const [isFinished, setIsFinished] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<QuestionReportReason>('unclear')
  const [reportDetails, setReportDetails] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [isReportError, setIsReportError] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setPractice(null)
    setError('')
    setCurrentQuestionNumber(1)
    setRemainingSeconds(5 * 60)
    setIsFinished(false)

    fetchTopicPracticeQuestions(oppositionSlug, topicSlug, controller.signal)
      .then((response) => {
        setPractice(response)
        setRemainingSeconds(response.durationMinutes * 60)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === 'AbortError') return
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las preguntas del tema.',
        )
      })

    return () => controller.abort()
  }, [oppositionSlug, topicSlug, retryCount])

  useEffect(() => {
    if (!practice || isFinished) return

    const timerId = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isFinished, practice])

  useEffect(() => {
    if (remainingSeconds === 0 && practice) setIsFinished(true)
  }, [practice, remainingSeconds])

  if (error) {
    return <ApiStatusPage message={error} onRetry={() => setRetryCount((count) => count + 1)} />
  }
  if (!practice) {
    return <ApiStatusPage message="Cargando preguntas del tema…" />
  }
  if (isFinished) {
    return <PracticeResultsGatePage oppositionName={practice.oppositionName} />
  }

  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0')
  const question = practice.questions[currentQuestionNumber - 1]
  const progress = (currentQuestionNumber / practice.questionCount) * 100

  return (
    <div className="landing">
      <SiteHeader />
      <main className="practice-exam-page">
        <div className="practice-exam-shell">
          <div
            className="practice-progress-track"
            role="progressbar"
            aria-label="Progreso del test"
            aria-valuemin={0}
            aria-valuemax={practice.questionCount}
            aria-valuenow={currentQuestionNumber}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="practice-exam-meta">
            <span className="practice-timer" aria-label={`Tiempo restante ${minutes}:${seconds}`}>
              {minutes}:{seconds}
            </span>
            <span className="practice-exam-name">{practice.oppositionName} · {practice.topicName}</span>
            <span className="practice-exam-difficulty">Práctica por tema</span>
            <span className="practice-question-counter" aria-live="polite">
              {currentQuestionNumber}/{practice.questionCount}
            </span>
          </div>

          {question ? (
            <section className="practice-question-card" aria-labelledby="practice-question-title">
              <h1 id="practice-question-title">{question.statement}</h1>
              <ol className="practice-answer-list">
                {question.options.map((option) => (
                  <li key={option.id}>
                    <span className="practice-option-letter">{option.id}.</span>
                    <button
                      type="button"
                      className="practice-answer"
                      onClick={() => {
                        setIsReportOpen(false)
                        setReportMessage('')
                        setReportDetails('')
                        setReportReason('unclear')
                        setReportSubmitted(false)
                        if (currentQuestionNumber >= practice.questionCount) {
                          setIsFinished(true)
                          return
                        }
                        setCurrentQuestionNumber((number) => number + 1)
                      }}
                    >
                      {option.text}
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <ApiStatusPage message="El backend devolvió un test incompleto." />
          )}
          {question && (
            <div className="question-report">
              <button
                type="button"
                className="question-report-toggle"
                aria-expanded={isReportOpen}
                disabled={reportSubmitted}
                onClick={() => {
                  setIsReportOpen((isOpen) => !isOpen)
                  setReportMessage('')
                  setIsReportError(false)
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 21V4m0 1h12l-2.5 4L17 13H5" />
                </svg>
                Reportar pregunta
              </button>
              {reportMessage && (
                <p
                  className={`question-report-message${isReportError ? ' is-error' : ''}`}
                  role={isReportError ? 'alert' : 'status'}
                >
                  {reportMessage}
                </p>
              )}
              {isReportOpen && (
                <form
                  className="question-report-form"
                  onSubmit={async (event) => {
                    event.preventDefault()
                    setIsSubmittingReport(true)
                    setReportMessage('')
                    setIsReportError(false)
                    try {
                      await submitQuestionReport(
                        oppositionSlug,
                        topicSlug,
                        question.id,
                        { reason: reportReason, details: reportDetails },
                      )
                      setIsReportOpen(false)
                      setReportDetails('')
                      setReportSubmitted(true)
                      setReportMessage('Reporte enviado. Gracias por ayudarnos a mejorar.')
                    } catch (requestError: unknown) {
                      setIsReportError(true)
                      setReportMessage(
                        requestError instanceof Error
                          ? requestError.message
                          : 'No se pudo enviar el reporte.',
                      )
                    } finally {
                      setIsSubmittingReport(false)
                    }
                  }}
                >
                  <label>
                    Motivo del reporte
                    <select
                      value={reportReason}
                      onChange={(event) => {
                        const value = event.target.value
                        if (
                          value === 'incorrect'
                          || value === 'unclear'
                          || value === 'typo'
                          || value === 'other'
                        ) {
                          setReportReason(value)
                        }
                      }}
                    >
                      <option value="incorrect">La respuesta parece incorrecta</option>
                      <option value="unclear">El enunciado no está claro</option>
                      <option value="typo">Hay un error de redacción</option>
                      <option value="other">Otro problema</option>
                    </select>
                  </label>
                  <label>
                    Comentario (opcional)
                    <textarea
                      value={reportDetails}
                      maxLength={1000}
                      rows={3}
                      onChange={(event) => setReportDetails(event.target.value)}
                    />
                  </label>
                  <div className="question-report-actions">
                    <button type="submit" disabled={isSubmittingReport}>
                      {isSubmittingReport ? 'Enviando…' : 'Enviar reporte'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReportOpen(false)
                        setReportMessage('')
                        setIsReportError(false)
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          <p className="practice-demo-notice">
            Elige una respuesta para continuar. La corrección y el guardado de resultados aún no están disponibles.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function PracticeExamPage({ exam }: { exam: NonNullable<ReturnType<typeof getMockPracticeExam>> }) {
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(exam.currentQuestionNumber)
  const [remainingSeconds, setRemainingSeconds] = useState(exam.durationMinutes * 60)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0')
  const progress = (currentQuestionNumber / exam.questionCount) * 100
  const resultsUrl =
    `/oposiciones/${exam.oppositionSlug}/examen/resultado?mode=${exam.mode}&mock=${exam.mockNumber}&attemptId=${exam.attemptId}`

  return (
    <div className="landing">
      <SiteHeader />
      <main className="practice-exam-page">
        <div className="practice-exam-shell">
          <div
            className="practice-progress-track"
            role="progressbar"
            aria-label="Progreso del examen"
            aria-valuemin={0}
            aria-valuemax={exam.questionCount}
            aria-valuenow={currentQuestionNumber}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="practice-exam-meta">
            <span className="practice-timer" aria-label={`Tiempo restante ${minutes}:${seconds}`}>
              {minutes}:{seconds}
            </span>
            <a
              href={resultsUrl}
              className="practice-end-link"
            >
              Finalizar test
            </a>
            <span className="practice-exam-name">{exam.oppositionName} · {exam.title}</span>
            <span className="practice-exam-difficulty">{exam.difficulty}</span>
            <span className="practice-question-counter" aria-live="polite">
              {currentQuestionNumber}/{exam.questionCount}
            </span>
          </div>

          <section className="practice-question-card" aria-labelledby="practice-question-title">
            <h1 id="practice-question-title">{exam.question.statement}</h1>
            <ol className="practice-answer-list">
              {exam.question.options.map((option) => (
                <li key={option.id}>
                  <span className="practice-option-letter">{option.id}.</span>
                  <button
                    type="button"
                    className="practice-answer"
                    onClick={() => {
                      if (currentQuestionNumber >= exam.questionCount) {
                        window.location.assign(resultsUrl)
                        return
                      }

                      setCurrentQuestionNumber((number) => number + 1)
                    }}
                  >
                    {option.text}
                  </button>
                </li>
              ))}
            </ol>
          </section>
          <p className="practice-demo-notice">
            En esta demostración, al elegir una respuesta se avanza de pregunta y se repite el ejemplo.
            El examen completo lo devolverá el backend.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function PracticeResultsGatePage({ oppositionName }: { oppositionName: string }) {
  const [formMessage, setFormMessage] = useState('')

  return (
    <div className="landing">
      <SiteHeader showRegister={false} />
      <main className="practice-results-page">
        <section className="practice-results-content" aria-labelledby="practice-results-title">
          <h1 id="practice-results-title">Espera, aún hay más.<br />Continúa para ver tu resultado</h1>
          <div className="practice-finished-status">
            <span className="practice-clock-icon" aria-hidden="true">◷</span>
            <span>El test de {oppositionName} ha finalizado</span>
          </div>

          <form
            className="practice-results-form"
            onSubmit={(event) => {
              event.preventDefault()
              setFormMessage('El acceso a resultados todavía no está conectado al backend.')
            }}
          >
            <div className="practice-results-name-fields">
              <label>
                <span className="sr-only">Nombre</span>
                <input name="firstName" type="text" autoComplete="given-name" placeholder="Nombre" required />
              </label>
              <label>
                <span className="sr-only">Apellidos</span>
                <input name="lastName" type="text" autoComplete="family-name" placeholder="Apellidos" required />
              </label>
            </div>
            <label>
              <span className="sr-only">Correo electrónico</span>
              <input name="email" type="email" autoComplete="email" placeholder="Correo electrónico" required />
            </label>
            <label className="practice-results-consent">
              <input name="personalizedRecommendations" type="checkbox" />
              <span>Envíame recomendaciones personalizadas sobre qué aprender según mis resultados.</span>
            </label>
            <button type="submit" className="practice-results-submit">
              Ver mis resultados <span aria-hidden="true">→</span>
            </button>
          </form>

          {formMessage && <p className="practice-results-message" role="status">{formMessage}</p>}

          <p className="practice-results-login">
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
          </p>
          <p className="practice-results-legal">
            Al continuar aceptas las <a href="/#aviso-legal">condiciones de uso</a> y la{' '}
            <a href="/#privacidad">política de privacidad</a>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [availableCategories, setAvailableCategories] = useState<OppositionCategory[]>([])
  const [page, setPage] = useState(1)
  const [catalog, setCatalog] = useState<OppositionListResponse | null>(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [opposition, setOpposition] = useState<OppositionDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [authMessage, setAuthMessage] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true)
  const authMode = window.location.pathname === '/login'
    ? 'login'
    : ['/registro', '/register'].includes(window.location.pathname)
      ? 'register'
      : null
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const oppositionSlug = currentPath.match(/^\/oposiciones\/([^/]+)$/)?.[1]
  const examRoute = currentPath.match(/^\/oposiciones\/([^/]+)\/examen$/)
  const resultsRoute = currentPath.match(/^\/oposiciones\/([^/]+)\/examen\/resultado$/)
  const examQuery = new URLSearchParams(window.location.search)
  const examMode = examQuery.get('mode')
  const mockNumber = Number(examQuery.get('mock') || 1)
  const topicSlug = examQuery.get('topic')
  const mockExam = examRoute
    ? getMockPracticeExam(examRoute[1], examMode, mockNumber)
    : undefined
  const resultsExam = resultsRoute
    ? getMockPracticeExam(resultsRoute[1], examMode, mockNumber)
    : undefined

  useEffect(() => {
    if (currentPath !== '/') return

    const controller = new AbortController()
    fetchOppositions({
      page,
      pageSize: 10,
      search: query,
      category,
    }, controller.signal)
      .then((response) => {
        setCatalog(response)
        setAvailableCategories((currentCategories) => {
          const categoriesBySlug = new Map(currentCategories.map((item) => [item.slug, item]))
          response.items.forEach((item) => categoriesBySlug.set(item.category.slug, item.category))
          return Array.from(categoriesBySlug.values())
        })
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setCatalogError(error instanceof Error ? error.message : 'Error desconocido al cargar el catálogo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCatalogLoading(false)
      })

    return () => controller.abort()
  }, [category, currentPath, page, query, retryCount])

  useEffect(() => {
    if (!oppositionSlug) return

    const controller = new AbortController()
    fetchOppositionDetail(oppositionSlug, controller.signal)
      .then(setOpposition)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setDetailError(error instanceof Error ? error.message : 'Error desconocido al cargar la oposición.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsDetailLoading(false)
      })

    return () => controller.abort()
  }, [oppositionSlug, retryCount])

  const retryCatalog = () => {
    setCatalogError('')
    setIsCatalogLoading(true)
    setRetryCount((count) => count + 1)
  }
  const retryDetail = () => {
    setDetailError('')
    setIsDetailLoading(true)
    setRetryCount((count) => count + 1)
  }

  if (currentPath === '/profile') {
    return <ProfilePage />
  }

  if (currentPath === '/settings') {
    return <SettingsPage />
  }

  if (currentPath === '/premium-upgrade') {
    return <PremiumUpgradePage />
  }

  if (examRoute && topicSlug) {
    return <TopicPracticePage oppositionSlug={examRoute[1]} topicSlug={topicSlug} />
  }

  if (mockExam) {
    return <PracticeExamPage exam={mockExam} />
  }

  if (resultsExam) {
    return <PracticeResultsGatePage oppositionName={resultsExam.oppositionName} />
  }

  if (oppositionSlug) {
    if (isDetailLoading || (!opposition && !detailError)) {
      return <ApiStatusPage message="Cargando oposición…" />
    }
    if (detailError) {
      return <ApiStatusPage message={detailError} onRetry={retryDetail} />
    }
    if (opposition) {
      return <OppositionDetailPage opposition={opposition} />
    }
  }

  if (authMode) {
    const isRegister = authMode === 'register'

    return (
      <div className="landing">
        <SiteHeader />
        <main className="auth-page">
          <section className="auth-card" aria-labelledby="auth-title">
            <h1 id="auth-title">
              {isRegister ? 'Crea tu cuenta gratuita para guardar tus resultados' : 'Inicia sesión con un enlace mágico'}
            </h1>
            <p>
              {isRegister
                ? 'Regístrate sin contraseña y empieza a preparar tu oposición.'
                : 'Te enviaremos un enlace a tu correo para acceder sin contraseña.'}
            </p>

            <form
              className={isRegister ? 'auth-form-register' : ''}
              onSubmit={async (event) => {
                event.preventDefault()
                setIsAuthLoading(true)
                setAuthMessage('')
                const form = event.currentTarget
                const formData = new FormData(form)
                try {
                  const csrfResponse = await fetch(`${apiBaseUrl}/csrf`, { credentials: 'include' })
                  if (!csrfResponse.ok) throw new Error('No se pudo preparar el envío.')
                  const { csrfToken } = await csrfResponse.json() as { csrfToken: string }
                  const payload = {
                    purpose: isRegister ? 'register' : 'login',
                    email: String(formData.get('email') || ''),
                    firstName: String(formData.get('firstName') || ''),
                    firstSurname: String(formData.get('firstSurname') || ''),
                    secondSurname: String(formData.get('secondSurname') || ''),
                    personalizedRecommendations: formData.get('personalizedRecommendations') === 'true',
                  }
                  const response = await fetch(`${apiBaseUrl}/auth/magic/request`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify(payload),
                  })
                  const result = await response.json() as { message?: string; error?: { message: string } }
                  if (!response.ok) throw new Error(result.error?.message || 'No se pudo enviar el enlace mágico.')
                  setAuthMessage(result.message || 'Revisa tu correo para continuar.')
                  form.reset()
                } catch (error) {
                  setAuthMessage(error instanceof Error ? error.message : 'No se pudo enviar el enlace mágico.')
                } finally {
                  setIsAuthLoading(false)
                }
              }}
            >
              {isRegister && (
                <>
                  <label className="auth-field">
                    <span>Nombre</span>
                    <input name="firstName" type="text" autoComplete="given-name" placeholder="Tu nombre" required />
                  </label>
                  <label className="auth-field">
                    <span>Primer apellido</span>
                    <input name="firstSurname" type="text" autoComplete="family-name" placeholder="Tu primer apellido" required />
                  </label>
                  <label className="auth-field">
                    <span>Segundo apellido</span>
                    <input name="secondSurname" type="text" autoComplete="off" placeholder="Tu segundo apellido" required />
                  </label>
                </>
              )}
              <label className="auth-field">
                <span>Correo electrónico</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  required
                />
              </label>
              {isRegister && (
                <label className="recommendations-consent">
                  <input
                    name="personalizedRecommendations"
                    type="checkbox"
                    value="true"
                    checked={personalizedRecommendations}
                    onChange={(event) => setPersonalizedRecommendations(event.target.checked)}
                  />
                  <span>
                    Envíame recomendaciones personalizadas sobre qué aprender según mis resultados.
                  </span>
                </label>
              )}
              <button className="auth-submit" type="submit" disabled={isAuthLoading}>
                {isAuthLoading ? 'Enviando…' : isRegister ? 'Crear cuenta' : 'Enviarme el enlace mágico'}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {authMessage && <p className="auth-message" role="status">{authMessage}</p>}

            <p className="auth-switch">
              {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
              {' '}
              <a href={isRegister ? '/login' : '/registro'}>
                {isRegister ? 'Inicia sesión' : 'Regístrate'}
              </a>
            </p>
            <a
              className="auth-demo-link"
              href="/"
              onClick={() => window.sessionStorage.setItem(demoUserSessionKey, 'true')}
            >
              Probar menú de perfil (demo)
            </a>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="landing">
      <SiteHeader />
      <main className="home-page">

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

        <div className="floating-card certified">
          <CheckIcon />
          <div>
            <strong>Administrativo</strong>
            <span>Primer intento 🎉</span>
          </div>
        </div>

        <div className="floating-card progress">
          <ProgressIcon />
          <div className="progress-copy">
            <strong>Tu Progreso</strong>
            <span>Puntaje: 82% ↑</span>
          </div>
        </div>

        <div className="floating-card tips">
          <ExpertIcon />
          <div>
            <strong>Expert Tips</strong>
            <span>Learn why</span>
          </div>
        </div>

        <div className="hero-content">
          <div className="trust-pill">
            <span aria-hidden="true">🎯</span>
            De un opositor a otro opositor
          </div>

          <h1 id="hero-title">
            Cada dia un poco mas cerca
            <span>Aprueba tu oposición</span>
          </h1>

          <p>
            Practica con preguntas de examen reales. Obtén retroalimentación al instante.
            <br />
            Únete a los miles de personas que aprobaron al primer intento.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#oposiciones">
              Prueba Gratis
              <span aria-hidden="true">→</span>
            </a>
            <a className="button button-secondary" href="/premium-upgrade/">Planes</a>
          </div>

          <div className="stats">
            <div>
              <strong>10K+</strong>
              <span>Preguntas</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Calificación</span>
            </div>
          </div>
        </div>
      </section>

      <section id="oposiciones" className="oppositions" aria-labelledby="oppositions-title">
        <div className="oppositions-container">
          <h2 id="oppositions-title">Elige tu oposición</h2>
          <p className="oppositions-subtitle">
            Prepara tu examen con preguntas actualizadas y 10.000+ preguntas disponibles
          </p>

          <label className="opposition-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5L21 21" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
                setIsCatalogLoading(true)
                setCatalogError('')
              }}
              placeholder="Busca tu oposición..."
            />
          </label>

          <div className="category-tabs" aria-label="Categorías de oposiciones">
            <button
              type="button"
              className={category === '' ? 'active' : ''}
              onClick={() => {
                if (category === '') return
                setCategory('')
                setPage(1)
                setIsCatalogLoading(true)
                setCatalogError('')
              }}
            >
              Todas
            </button>
            {availableCategories.map((item) => (
              <button
                type="button"
                className={category === item.slug ? 'active' : ''}
                onClick={() => {
                  if (category === item.slug) return
                  setCategory(item.slug)
                  setPage(1)
                  setIsCatalogLoading(true)
                  setCatalogError('')
                }}
                key={item.slug}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="opposition-grid">
            {catalog?.items.map((item) => (
              <a
                className="opposition-card"
                href={`/oposiciones/${item.slug}`}
                key={item.slug}
              >
                <span
                  className="opposition-logo"
                  style={{ background: item.color }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="opposition-info">
                  <strong>{item.name}</strong>
                  <small>{item.questionCount.toLocaleString('es-ES')} Preguntas</small>
                </span>
              </a>
            ))}
          </div>
          {isCatalogLoading && <p className="api-feedback" role="status">Cargando oposiciones…</p>}
          {catalogError && (
            <div className="api-feedback api-feedback-error" role="alert">
              <span>{catalogError}</span>
              <button type="button" onClick={retryCatalog}>Reintentar</button>
            </div>
          )}
          {!isCatalogLoading && !catalogError && catalog?.items.length === 0 && (
            <p className="api-feedback">No hay oposiciones que coincidan con la búsqueda.</p>
          )}
          {catalog && catalog.totalItems > catalog.pageSize && !catalogError && (
            <div className="catalog-pagination">
              <button
                type="button"
                disabled={page <= 1 || isCatalogLoading}
                onClick={() => {
                  setPage((currentPage) => currentPage - 1)
                  setIsCatalogLoading(true)
                }}
              >
                Anterior
              </button>
              <span>Página {catalog.page} · {catalog.totalItems} oposiciones</span>
              <button
                type="button"
                disabled={catalog.page * catalog.pageSize >= catalog.totalItems || isCatalogLoading}
                onClick={() => {
                  setPage((currentPage) => currentPage + 1)
                  setIsCatalogLoading(true)
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="tips-section" aria-labelledby="tips-title">
        <div className="tips-panel">
          <div className="tips-heading">
            <span className="tips-kicker">Guía de preparación</span>
            <h2 id="tips-title">10 consejos para aprobar tus próximas oposiciones</h2>
          </div>
          <ol className="tips-grid">
            {oppositionTips.map((tip, index) => (
              <li key={tip}>
                <span className="tip-number">{String(index + 1).padStart(2, '0')}</span>
                <p>{tip}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="premium" className="premium-section" aria-labelledby="premium-title">
        <div className="premium-card">
          <div className="premium-copy">
            <span className="premium-kicker">Plan Premium</span>
            <h2 id="premium-title">Desbloquea el acceso premium</h2>
            <p className="premium-subtitle">
              Todas las oposiciones y herramientas para preparar tu próximo examen
            </p>

            <ul className="premium-list">
              <li><span>✓</span>Acceso a todas las oposiciones con una sola suscripción</li>
              <li><span>✓</span>Preguntas premium actualizadas por especialistas</li>
              <li><span>✓</span>Tests ilimitados en todas las categorías</li>
              <li><span>✓</span>Explicaciones detalladas de cada respuesta</li>
              <li><span>✓</span>Garantía de devolución durante 30 días</li>
              <li><span>✓</span>Cancela cuando quieras, sin permanencia</li>
            </ul>

            <a className="premium-button" href="/premium-upgrade/">
              Empezar prueba de 7 días
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="premium-visual" aria-hidden="true">
            <div className="premium-orbit orbit-one" />
            <div className="premium-orbit orbit-two" />
            <div className="premium-badge">
              <span>PREMIUM</span>
              <strong>Todo incluido</strong>
            </div>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
