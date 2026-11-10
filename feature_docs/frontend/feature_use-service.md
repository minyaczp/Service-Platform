# Feature: use-service

| | |
|---|---|
| **Feature** | use-service |
| **App** | frontend |
| **Entry point** | `ServiceModal({ service, url, onBack, onClose })` |
| **Counterpart** | the service's own frontend at `ui.url` (`gridline.io/ui: iframe`) |
| **Catalog anchor** | [project_feature.md#use-service](../project_feature.md#use-service) |

## Functions

| File | Function | Responsibility |
|---|---|---|
| `features/use-service/ServiceModal.tsx` | `ServiceModal(props)`, `UI_FAILED` | Modal frame per handoff §Service modal; iframe of `url`; on iframe `error` shows 「無法載入服務前端」 |

Limit: browsers do not report HTTP errors inside an iframe, so the failure message appears only on a
network-level error.

## Dependencies

| Needs | Supplied by | Wired at |
|---|---|---|
| `service`, `url` | store selection + `reg.ui.url` (only when `ui.kind === 'iframe'`) | `main.tsx` `Overlay` |
| `onBack`, `onClose` | store `closeModal`, `clearSelection` | `main.tsx` `Overlay` |

## Unit Tests

No suite — the feature has no pure function.

**Not covered:** `ServiceModal` — iframe loading needs a browser (manual row).

**Counterpart:** none tested — the placeholder page `public/mock/ui/placeholder.html` exists (checked in
`src/shared/source/source.test.ts`).
