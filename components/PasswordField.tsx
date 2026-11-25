"use client";

import { useId, useState } from "react";

export function PasswordField({
  label = "Password",
  name = "password",
  isNew = false,
}: {
  label?: string;
  name?: string;
  isNew?: boolean;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password-input">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={isNew ? "new-password" : "current-password"}
          minLength={isNew ? 8 : undefined}
          required
        />
        <button type="button" className="auth-password-toggle" aria-controls={id} onClick={() => setVisible(!visible)}>
          {visible ? "Hide" : "Show"}<span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </div>
    </div>
  );
}
