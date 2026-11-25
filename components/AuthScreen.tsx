import type { ReactNode } from "react";

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-identity">
          <div className="brand-mark auth-mark" aria-hidden="true">14A</div>
          <p className="auth-product">MOT Signing Tracker</p>
          <p className="auth-company">Selangor Properties Sdn. Bhd.</p>
        </div>
        {children}
      </section>
    </main>
  );
}
