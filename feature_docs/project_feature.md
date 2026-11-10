# Service Platform — Feature Catalog

Gridline shows every registered microservice as a building in a 3D city: height from traffic, colour from
health, shape from domain. Phase 1 (NI-01) is the `frontend/` app alone, on 22 mock services.

## Feature Index

| Feature | App | Doc | Summary |
|---|---|---|---|
| city | frontend | [feature_city.md](frontend/feature_city.md) | 3D and Isometric city, layout, top bar, legend |
| catalog | frontend | [feature_catalog.md](frontend/feature_catalog.md) | Sidebar: search, favorites, recent, groups, collapsed rail |
| inspect | frontend | [feature_inspect.md](frontend/feature_inspect.md) | Info panel and read-only API Docs (Scalar) |
| use-service | frontend | [feature_use-service.md](frontend/feature_use-service.md) | Full-area modal hosting a service's own UI in an iframe |
| auth | frontend | [feature_auth.md](frontend/feature_auth.md) | Phase 1 Login button (no account) |

## city

Lays the services out on district plates (`layout()`), then draws them in one of two views: WebGL
(`CityView3D`) or CSS 3D (`CityViewIso`). Selecting a building flies the camera (3D) or centres the stage
(Isometric). The top bar holds the breadcrumb, Overview and the 3D | Isometric toggle.

Related Docs: [feature_city.md](frontend/feature_city.md) · [architecture](feature_architecture.md#frontend-structure)

## catalog

Lists services by domain with search (name + domain), Favorites and Recent (last 3, persisted in
`gridline.state`), health dots and a footer of counts. Collapses to a 64 px rail of initials.

Related Docs: [feature_catalog.md](frontend/feature_catalog.md)

## inspect

The floating panel for the selected service: health chip, notices (degraded amber, down red, deploying
rollout bar), six specs, endpoint, capabilities, Use service and favorite. A service with an OpenAPI document
gets an API Docs tab rendered by Scalar, read-only.

Related Docs: [feature_inspect.md](frontend/feature_inspect.md)

## use-service

"Use service" opens a modal over the whole city area showing the service's `ui.url` in an iframe. Phase 1
URLs point at `public/mock/ui/placeholder.html`.

Related Docs: [feature_use-service.md](frontend/feature_use-service.md)

## auth

A Login button that sets the in-memory session; a reload signs out (Decisions #4, #12 of NI-01).

Related Docs: [feature_auth.md](frontend/feature_auth.md)

## Workflow

Login → city overview (auto-rotating) → select a building / pin / sidebar row → Info panel → API Docs tab or
Use service → Back to building / × / Esc / Overview / breadcrumb "City".
