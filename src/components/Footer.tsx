import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

const linkClass =
  "flex items-center justify-center w-10 h-10 rounded-lg gap-2 text-powderBlue hover:text-porcelain hover:bg-porcelain/10 focus-visible:ring-2 focus-visible:ring-powderBlue focus-visible:ring-offset-2 focus-visible:ring-offset-inkBlack md:w-auto md:h-auto md:p-0 md:rounded md:hover:bg-transparent";

export default function Footer() {
  return (
    <footer className="p-4 bg-inkBlack/80 text-center text-porcelain/80 text-sm border-t border-porcelain/15 flex gap-4 md:gap-6 justify-center items-center flex-wrap backdrop-blur-sm">
      <div className="hidden md:block text-porcelain/70">© {new Date().getFullYear()} Aurelia Azarmi</div>
      <a href="mailto:aurelia.azarmi@gmail.com" className={linkClass} aria-label="Email aurelia.azarmi@gmail.com">
        <EnvelopeIcon className="w-5 h-5 shrink-0" />
        <span className="hidden md:inline">aurelia.azarmi@gmail.com</span>
      </a>
      <a href="tel:+19259152274" className={linkClass} aria-label="Call +1 (925) 915-2274">
        <PhoneIcon className="w-5 h-5 shrink-0" />
        <span className="hidden md:inline">+1 (925) 915-2274</span>
      </a>
      <a href="https://linkedin.com/in/aurelia-azarmi" target="_blank" rel="noreferrer" className={linkClass} aria-label="Open LinkedIn">
        <img className="h-5 shrink-0" src="/LI-In-Bug.png" alt="" />
        <span className="hidden md:inline">LinkedIn</span>
      </a>
      <a href="https://github.com/justaurelia" target="_blank" rel="noreferrer" className={linkClass} aria-label="Open GitHub">
        <img className="h-5 shrink-0" src="/github-mark.png" alt="" />
        <span className="hidden md:inline">Github</span>
      </a>
    </footer>
  );
}
