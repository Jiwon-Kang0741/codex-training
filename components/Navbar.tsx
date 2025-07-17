import Link from "next/link";

export default function Navbar() {
  const links = [
    { name: "Companies", href: "#" },
    { name: "Customers", href: "#" },
    { name: "Activities", href: "#" },
    { name: "Reports", href: "#" },
  ];

  return (
    <nav className="bg-white shadow-sm ring-1 ring-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="#" className="flex items-center gap-2">
            <img src="/logo.png" alt="Noteify CRM Logo" className="h-12 w-auto" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 