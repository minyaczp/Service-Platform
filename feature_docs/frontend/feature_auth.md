# Feature: auth

| | |
|---|---|
| **Feature** | auth |
| **App** | frontend |
| **Entry point** | `LoginPage({ onLogin })` |
| **Counterpart** | none — platform-managed accounts are a later item |
| **Catalog anchor** | [project_feature.md#auth](../project_feature.md#auth) |

## Functions

| File | Function | Responsibility |
|---|---|---|
| `features/auth/LoginPage.tsx` | `LoginPage(props)` | One Login button (NI-01 Decisions #4) |

## Dependencies

| Needs | Supplied by | Wired at |
|---|---|---|
| `onLogin` | store `login` (sets `session: 'signedIn'`, in memory only) | `main.tsx` `App` |

## Unit Tests

No suite — the feature has no pure function.

**Not covered:** `LoginPage` rendering (manual row).

**Counterpart:** none — this feature lives in one app.
