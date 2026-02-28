import type { FC } from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/recap", label: "Recap" },
  { to: "/stats", label: "Stats" },
] as const;

export const HeaderNav: FC = () => (
  <nav className="flex gap-6" aria-label="Main">
    {navLinks.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          "text-sm font-medium transition-colors hover:text-zinc-300 " +
          (isActive
            ? "text-white underline decoration-2 underline-offset-2"
            : "text-zinc-400")
        }
        end={to === "/"}
      >
        {label}
      </NavLink>
    ))}
  </nav>
);
