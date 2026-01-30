import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

const linkClass =
  "flex h-full items-center gap-2 text-powderBlue hover:text-porcelain focus-visible:ring-2 focus-visible:ring-powderBlue focus-visible:ring-offset-2 focus-visible:ring-offset-inkBlack rounded";

export default function Footer() {
  return (
    <footer className="p-4 bg-inkBlack/80 text-center text-porcelain/80 text-sm border-t border-porcelain/15 flex gap-6 justify-center items-center backdrop-blur-sm">
      <div className="flex h-full text-porcelain/70">© {new Date().getFullYear()} Aurelia Azarmi</div>
      <a href="mailto:aurelia.azarmi@gmail.com" className={linkClass}>
        <EnvelopeIcon className="w-5 h-5" />
        aurelia.azarmi@gmail.com
      </a>
      <a href="tel:+19259152274" className={linkClass}>
        <PhoneIcon className="w-5 h-5" />
        +1 (925) 915-2274
      </a>
      <a href="https://linkedin.com/in/aurelia-azarmi" target="_blank" rel="noreferrer" className={linkClass}>
        <img className="h-5" src="/LI-In-Bug.png" alt="LinkedIn" />
        LinkedIn
      </a>
      <a href="https://github.com/justaurelia" target="_blank" rel="noreferrer" className={linkClass}>
        <img className="h-5" src="/github-mark.png" alt="GitHub" />
        Github
      </a>
    </footer>
  );
}
