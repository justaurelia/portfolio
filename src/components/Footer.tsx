import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="p-4 text-center text-gray-500 text-sm border-t border-border flex gap-6 justify-center items-center">
      <div className="flex h-full">© {new Date().getFullYear()} Aurelia Azarmi</div>
      <a href="mailto:aurelia.azarmi@gmail.com" className="flex h-full items-center gap-2 hover:text-primary">
        <EnvelopeIcon className="w-5 h-5" />
        Email Me
      </a>
      <a href="https://linkedin.com/in/aurelia-azarmi" target="_blank" className="flex h-full items-center gap-2 hover:text-primary">
        <img className="h-5" src="/LI-In-Bug.png"/>
        LinkedIn
      </a>
    </footer>
  );
}
