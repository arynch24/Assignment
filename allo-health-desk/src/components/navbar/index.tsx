'use client';

import Link from 'next/link';
import { Hospital } from 'lucide-react'
import DateFilter from './DateFilter';
import ProfileDropdown from './ProfileDropdown';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Queue', href: '/dashboard/queue' },
        { name: 'Appointments', href: '/dashboard/appointments' },
        { name: 'Doctors', href: '/dashboard/doctors' },
    ];

    return (
        <header className="border-b bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-purple-600 rounded-lg p-2">
                            <Hospital className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-800">Allo Health Desk</span>
                    </Link>

                </div>

                <nav className="flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`font-medium transition-colors ${pathname === item.href
                                    ? 'text-purple-600  border-b-2 border-purple-600'
                                    : 'text-gray-700 hover:text-purple-600'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                    <DateFilter />
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <ProfileDropdown />
                </div>
            </div>
        </header>
    );
}