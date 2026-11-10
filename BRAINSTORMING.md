# BRAINSTORMING

Staging area for designs not yet promoted to `PLAN.md`. Nothing here is approved or an instruction.

## 2026-11-05 — Gridline Service City — partially promoted, see NI-01, 2026-11-05

> **Status: ideas, not instructions.** Nothing in this section is approved and nothing in it is a
> `PLAN.md` item.

### Goal

一個監控多個 micro service 的平台，前端以 3D 霓虹城市呈現（design reference：
`3d miro service city/design_handoff_service_city/`）。每個服務一棟建築；新服務以「交付 spec + Helm
chart」註冊，平台端不需為單一服務開發程式碼。

### Sub-projects and order

```
[0] K8s cluster 建置（k3s 1.37，2–5 台）── 前置
        │
        ▼
[1] Registry：K8s API + annotations ──▶ [3] Live Stream (SSE) ──▶ [4] City 前端
[2] Metrics：Traefik + Prometheus ────┘                             ├─ API Docs（OpenAPI，唯讀）
                                                                    └─ Use service（iframe）
[5] 網頁部署：Helm / GitOps ── 延後，另開 brainstorming
後續：Gateway（Try it、權限）、帳號系統
```

第一階段（[4] 前端 + mock）的範圍、資料形狀、mock、錯誤處理、測試，以及原 D11–D18（視角、登入、mock、技術棧、佔位頁、layout、Unassigned）已移至 `PLAN.md` NI-01。以下只剩平台層的決策；D5、D6 的 annotation 合約留在此處，NI-01 只取其畫面行為。

### Decisions

| # | Decision | Settled by |
|---|---|---|
| D1 | 每個服務交 image + Helm chart；chart 的 annotations（`gridline.io/*`）是唯一的註冊來源。compose 只用 Kompose 做一次性遷移 | operator |
| D2 | 後台跑在 Kubernetes 上。規模：2–5 台主機、約 20+ 個服務、更新時可接受短暫中斷 | operator |
| D3 | K8s cluster 從零建置，是平台的前置子專案 [0] | operator |
| D4 | 發行版 k3s，鎖定 minor 1.37，安裝時取最新 patch。授權 Apache-2.0（已讀 LICENSE） | operator（條件：最新、無企業授權問題） |
| D5 | API Docs 與 Use service 拆開：`gridline.io/openapi` 決定 Docs 分頁；`gridline.io/ui` 只有 `iframe \| none` | operator |
| D6 | API Docs 第一階段只做唯讀；Try it 併入日後的 Gateway | operator |
| D7 | rps / p99 來自 Traefik metrics + Prometheus；traffic arcs 依 `gridline.io/depends` 畫靜態連線 | operator |
| D8 | 網頁部署延後，另開 brainstorming | operator |
| D9 | 前端 React，後端 Go | operator |
| D10 | 後端推送狀態用 SSE | operator |

### Open Decisions

- degraded / down 的 `reason` 在正式環境的來源（K8s condition / event 只提供技術訊息）。
- 是否需要呼叫主機層級的系統指令；若需要，設計方式（例如 DaemonSet + 受限權限）。
- 帳號系統：角色、MFA、帳號鎖定、第一個管理員的建立方式。
- 網頁部署：Helm SDK 或 GitOps（Argo CD / Flux）（D8）。
- Traefik 的 per-service 指標名稱與 k3s 內建版本是否預設開啟（未驗證，待 [0] 實測）。
- k3s 內建元件（Traefik、Flannel、containerd）的授權（未逐一查證）；k3s 1.37 官方支援期限。
- 公司內瀏覽器是否全部支援 WebGL（未驗證；NI-01 已有無 WebGL 時的退路）。

### 待了解（operator 的學習清單）

- **Traefik**：k3s 內建的 ingress controller，外部請求先到它再轉給服務，因此知道每個服務的請求數與耗時。
- **Prometheus**：時序資料庫，定期抓取各元件（如 Traefik）的數字；平台用 PromQL 算出 rps 與 p99。

### Sources

- [k3s LICENSE](https://github.com/k3s-io/k3s/blob/master/LICENSE)
- [RKE2 LICENSE](https://github.com/rancher/rke2/blob/master/LICENSE)
- [k3s v1.37.2 release 通知（二手）](https://github.com/x-real-ip/infrastructure/issues/170)
- [RKE2 v1.37.X release notes](https://docs.rke2.io/release-notes/v1.37.X)
