import s from './LoginPage.module.css';

/** Phase 1 sign-in: one button, no account (Decisions #4). */
export function LoginPage({ onLogin }: { readonly onLogin: () => void }) {
  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}><div className={s.logoInner} /></div>
        <div className={s.title}>Gridline</div>
        <div className={s.subtitle}>Service City</div>
        <button type="button" className={s.login} onClick={onLogin} autoFocus>Login</button>
      </div>
    </div>
  );
}
