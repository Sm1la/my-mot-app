"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="error-screen"><div className="error-panel"><div className="empty-icon">!</div><h1>Something didn’t work</h1><p>Your changes may not have been saved. Check your connection, then try again.</p><button className="button button-primary" onClick={reset}>Try again</button></div></main>;
}
