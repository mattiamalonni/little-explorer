import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main" className="empty-state page-width">
      <Compass size={64} aria-hidden="true" />
      <h1 tabIndex={-1}>Questa strada non esiste</h1>
      <p>Torniamo insieme al punto di partenza.</p>
      <Link className="button button-primary" href="/">
        Torna alla home <ArrowRight size={18} />
      </Link>
    </main>
  );
}
