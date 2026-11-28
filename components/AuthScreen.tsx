import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-identity">
          <BrandMark className="auth-mark" />
          <p className="auth-product">MOT Signing Tracker</p>
          <p className="auth-company">Selangor Properties Sdn. Bhd.</p>
        </div>
        {children}
      </section>
    </main>
  );
}
