import { Moon, Github, Twitter, Instagram } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: ["Features", "Dream AI", "Pricing", "Dashboard", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Sleep guide", "Dream dictionary", "Help center", "API", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Cookies"],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 pt-16 pb-8">
      <div className="section-pad">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-gradient">
                <Moon className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-xl font-bold">
                Sleep<span className="text-gradient">Scribe</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Your AI-powered sleep journal & dream analyst. Record your nights,
              decode your dreams, wake up smarter.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-aurora-pink/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-semibold text-white">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-white/55 transition hover:text-aurora-violet"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Sleep-Scribe. Built with 💜 for better
            sleep.
          </p>
          <p className="text-sm text-white/40">
            Made for the Conesta Forge internship.
          </p>
        </div>
      </div>
    </footer>
  );
}
