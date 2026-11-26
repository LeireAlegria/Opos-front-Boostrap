# Backend API plan

This is the API contract for the backend implementation. The initial backend uses Django and a local PostgreSQL database; the opposition catalog endpoints are the first implemented scope. Authentication, exam attempts, and payments remain unimplemented until their open contract decisions below are resolved. Catalog records currently seeded from the frontend are demonstration data, not verified official content.

## Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register with first name, both surnames, and email, then send a verification/magic link. |
| `POST` | `/api/auth/magic-links` | Request a passwordless login link for an email address. |
| `POST` | `/api/auth/magic-links/verify` | Validate a one-time token and create an authenticated session. |
| `GET` | `/api/auth/me` | Return the current authenticated user's profile and status. |
| `POST` | `/api/auth/logout` | Revoke the current session and clear its cookie. |

### Authentication tasks

- Define request/response schemas and shared error formats for each endpoint.
- Require `firstName`, `firstSurname`, `secondSurname`, and `email` in registration requests; persist the three name fields separately and return them in the user's profile.
- Accept `personalizedRecommendations` as an optional boolean preference, default it to `true` when omitted to match the preselected form checkbox, and allow the user to opt out; store and honor the choice.
- Validate and trim all three name fields, allowing normal Spanish names with spaces, hyphens, and accents; reject blank or overlong values.
- Decide whether registration and login share a magic-link flow, and whether an unknown email can create an account.
- Implement expiring, single-use magic-link tokens; store only token hashes.
- Send emails through the selected provider and configure sender/domain and templates.
- Use secure, `HttpOnly`, `SameSite` session cookies over HTTPS; define CSRF protection if needed.
- Add rate limits and generic responses to prevent email/account enumeration.
- Add tests for missing/invalid name fields, both preference values and the default-on behavior, duplicate registration, invalid/expired/reused tokens, logout, and unauthenticated access.
- Connect the frontend form to the API and handle loading, success, and error states. The current form intentionally reports that it is not connected.
- Use the authenticated profile from `GET /api/auth/me` to switch the header from sign-in/register links to a profile menu with `Profile` and `Settings`. Those sections are placeholders for now; define their behavior and any additional endpoints in later work. The current header preview uses a clearly labeled demo session and is not authentication.

## Opposition catalog and practice

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/oppositions` | Return the opposition catalog; support `search` and `category` query parameters. |
| `GET` | `/api/oppositions/{slug}` | Return all opposition-specific content and practice configuration needed by the reusable detail page. |
| `GET` | `/api/oppositions/{slug}/questions` | Return paginated questions; support topic and difficulty filters and enforce access rules. |
| `POST` | `/api/oppositions/{slug}/attempts` | Create an attempt and return the corresponding exam payload from the server. |
| `POST` | `/api/attempts/{attemptId}/answers` | Provisional endpoint for submitting an answer during an active attempt; persistence contract is TBD. |
| `POST` | `/api/attempts/{attemptId}/submit` | Finalize and score an attempt on the server when the user ends the test. |
| `GET` | `/api/attempts/{attemptId}` | Return attempt status; return results and reviewable answers only to the authenticated owner. |

### Catalog and practice tasks

- Replace the current hard-coded opposition list and question totals with backend data.
- Keep the page layout shared across oppositions; return opposition-specific copy, metrics, topics, and practice presets from `GET /api/oppositions/{slug}` rather than implementing a separate page per opposition.
- Define the detail response fields: stable `slug`, `name`, `category`, icon/image asset, `description`, optional overview copy and benefit bullets, question count, topic list, and practice configuration.
- Each topic needs a stable slug, display name, question count, and optional concept list. Define whether counts include archived questions, whether topics can overlap, and whether the total is a unique-question count.
- Practice configuration must include the supported modes (for example easy, difficult, and full mock), question count, duration in minutes, and for each full mock a stable identifier/number and exam-format metadata. Do not have the client infer a mock test from a count alone.
- Return pagination metadata for the catalog and question endpoints (`items`, `page`, `pageSize`, `totalItems` or a documented cursor contract). Define allowed category and difficulty values and empty-result behavior.
- Define question, answer-option, explanation, attempt, and scoring schemas. Return no correct-answer marker before submission; score and expose explanations only under the agreed review policy.
- Have the server select the question set and enforce attempt ownership, time limits, retry policy, premium entitlements, and idempotent final submission. Define what happens to incomplete or expired attempts.
- Results are available only to authenticated users. Anonymous users may take a demo/practice attempt, but cannot retrieve or resume it after leaving, link it to an account later, or receive its results after signing in.
- Decide which operations support a live anonymous attempt versus require authentication. Do not treat an email/name form as authentication or as authorization to return results.
- Defer answer and attempt persistence details: storage, durability, retention, recovery, and save guarantees remain undecided until a separate persistence contract is agreed. The answer endpoint above is provisional and does not settle those details.
- Record content source/provenance, license/permission, applicable jurisdiction and exam call/year, last review date, and content version. Establish who can author/review updates and how outdated questions are retired.
- Treat the current `Administrativo` and `Celador` records in `src/data/oppositionDetails.ts` as frontend demonstration fixtures only. Their totals, topics, and mock-test formats are not verified official data; replace them with reviewed API content before launch.

#### Detail page response example (proposed)

The following is a contract sketch, not verified exam data. Field names should be finalized with the backend:

```json
{
  "slug": "administrativo",
  "name": "Administrativo",
  "category": { "slug": "administracion", "name": "Administración" },
  "icon": "🏛️",
  "description": "Preparación organizada por materias y práctica progresiva.",
  "questionCount": 1830,
  "topics": [
    {
      "slug": "constitucion",
      "name": "Constitución Española",
      "questionCount": 310,
      "concepts": []
    }
  ],
  "practice": {
    "easy": { "questionCount": 20, "durationMinutes": 20 },
    "difficult": { "questionCount": 20, "durationMinutes": 20 },
    "fullMocks": [
      { "id": "mock-1", "number": 1, "questionCount": 100, "durationMinutes": 90 }
    ]
  },
  "contentReviewedAt": null
}
```

#### Attempt contract decisions

- Clicking **Start** sends the selected opposition slug plus the selected mode (`easy`, `difficult`, or `full`) and, where applicable, a `topicSlug` or full-mock ID to `POST /api/oppositions/{slug}/attempts`. The backend must resolve the title, difficulty, question count, duration, and question set from its configuration; do not trust client-supplied scoring or entitlements.
- The response must contain the exam to render immediately: `attemptId`, opposition identity, test title, mode/difficulty label, `startedAt`, `expiresAt`, total question count, and the ordered questions with stable IDs, statement, and answer options. Return no correct-answer marker or explanation before submission. The response question count must agree with the returned question list.
- Keep the exam screen structure consistent for every opposition and test: countdown/deadline, end-test action, opposition/test title, difficulty, current question and total, progress indicator, question statement, and selectable answer options. Only the server-provided exam metadata and question/option content change.
- A proposed start response is:

```json
{
  "attemptId": "attempt_123",
  "status": "in_progress",
  "opposition": { "slug": "celador", "name": "Celador" },
  "test": {
    "title": "Simulacro 1",
    "mode": "full",
    "difficulty": "Examen completo",
    "questionCount": 100,
    "durationMinutes": 90,
    "startedAt": "2026-11-19T09:00:00Z",
    "expiresAt": "2026-11-19T10:30:00Z"
  },
  "questions": [
    {
      "id": "question_1",
      "number": 1,
      "statement": "Pregunta devuelta por el backend",
      "options": [
        { "id": "option_a", "text": "Opción A" },
        { "id": "option_b", "text": "Opción B" },
        { "id": "option_c", "text": "Opción C" },
        { "id": "option_d", "text": "Opción D" }
      ]
    }
  ]
}
```

- The example above abbreviates `questions`; the production response must return the complete question list and its `questionCount` must equal the list length. Do not support recovery or resumption of an anonymous attempt after the current session is lost.
- After the user selects an option, advance to the next question in the returned list and update the progress indicator. The local demo may repeat its sample question; production must use the corresponding next question from the backend response.
- Define the answer request/response, selected-option validation, skipped-answer representation, and whether answers are sent per question or at submission time. Their persistence behavior is deliberately deferred.
- Submission scores the attempt on the server, but returns its score breakdown and reviewable answers only to an authenticated owner. Anonymous submissions must not disclose results.
- When the user clicks **Finalizar test** or answers the final question, submit the attempt and show the result flow. Authenticate the user before returning any result; only return results when the authenticated account owns that attempt.
- Selecting an answer on the final question must also submit/finish the attempt and open the same result-access screen; the explicit **Finalizar test** action must behave the same way.
- The current result form is a frontend demonstration only: names, email, and a recommendations preference do not authenticate the user or unlock results. Connect it to the existing authentication flow or replace it with an appropriate sign-in state. Signing in after an anonymous attempt does not restore that attempt or its results.
- Handle invalid/expired attempts, ownership failures, rate limits, privacy/retention, and attempts already submitted. Do not expose a fabricated score or success response when the backend is unavailable.
- Treat `src/data/mockPracticeExams.ts` as a one-question display fixture only. Replace it with the attempt-start API response; it does not represent a complete or official exam.
- Add tests for invalid slugs/topics/modes, page boundaries, access denial, anonymous result denial, wrong-owner result denial, answer ownership, expired attempts, double submission, and scoring/penalty rules. Add answer persistence tests after that contract is defined.

## Premium access

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/plans` | Return available subscription plans and trial terms. |
| `GET` | `/api/subscriptions/me` | Return the current user's subscription and entitlement status. |
| `POST` | `/api/subscriptions/checkout` | Create a Stripe Checkout session for the selected plan and return its hosted URL. |
| `POST` | `/api/subscriptions/cancel` | Request cancellation of the current subscription. |
| `POST` | `/api/webhooks/payments` | Receive and verify payment-provider events; server-to-server only. |

### Premium tasks

- Configure Stripe and define trial, renewal, cancellation, and refund policies.
- The displayed offer is a 7-day free trial followed by €29.95 per month. Return the authoritative trial duration, recurring amount/currency/interval, and first-charge date policy from `GET /api/plans`; do not rely on frontend prices for billing.
- Require an authenticated user to create checkout. Accept a `planId` and validated success/cancel return URLs; create the session on the server using configured Stripe credentials and return `{ "checkoutUrl": "https://checkout.stripe.com/..." }`.
- Connect the premium page to `GET /api/plans` so the displayed terms and calculated trial end/first-charge dates come from the selected backend plan.
- Keep prices and entitlement decisions authoritative on the backend.
- Verify webhook signatures and process events idempotently.
- Show the authenticated-header **Go Premium** CTA before the profile menu. Connect premium CTAs and display subscription state, checkout errors, and cancellation results.
- Do not grant access based only on frontend state or an unverified redirect.

## Cross-cutting backend tasks

- Choose the backend framework, database, API versioning, hosting, and environment configuration.
- Configure CORS for the frontend origin and keep secrets exclusively on the server.
- Add request validation, structured logging without tokens or sensitive email contents, and API documentation.
- Decide data retention, account deletion, privacy notice, and legal requirements.
- Provide development/staging environments and a test account/email workflow.
