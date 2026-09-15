import Link from "next/link";

const navItems = [
  { label: "Research", href: "/research" },
  { label: "People", href: "/people" },
  { label: "Alumni", href: "/alumni" },
  { label: "Previous work", href: "/previous-work" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Data-Driven Modeling Group home">
        <span className="wordmark-mark">DM</span>
        <span className="wordmark-copy">
          <strong>Data-Driven Modeling Group</strong>
          <small>Jared P. Whitehead</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
    </header>
  );
}
