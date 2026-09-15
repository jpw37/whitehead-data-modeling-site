import { sitePath } from "@/lib/site";

const navItems = [
  { label: "Research", href: "/research/" },
  { label: "People", href: "/people/" },
  { label: "Alumni", href: "/alumni/" },
  { label: "Previous work", href: "/previous-work/" },
  { label: "About", href: "/about/" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href={sitePath("/")} aria-label="Data-Driven Modeling Group home">
        <span className="wordmark-mark">DM</span>
        <span className="wordmark-copy">
          <strong>Data-Driven Modeling Group</strong>
          <small>Jared P. Whitehead</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => <a href={sitePath(item.href)} key={item.href}>{item.label}</a>)}
      </nav>
    </header>
  );
}
