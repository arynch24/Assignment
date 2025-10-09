'use client';

import Link from 'next/link';
import { Hospital, Menu, X } from 'lucide-react';
import DateFilter from './DateFilter';
import ProfileDropdown from './ProfileDropdown';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Queue', href: '/dashboard/queue' },
        { name: 'Appointments', href: '/dashboard/appointments' },
        { name: 'Doctors', href: '/dashboard/doctors' },
    ];

    return (
        <header className="border-b bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-purple-600 rounded-lg p-2">
                            <Hospital className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg sm:text-xl text-gray-800">
                            Allo Health Desk
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`font-medium transition-colors ${
                                    pathname === item.href
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-gray-700 hover:text-purple-600'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Section - Desktop */}
                    <div className="hidden lg:flex items-center gap-4">
                        <DateFilter />
                        <div className="h-6 w-px bg-gray-300 mx-2"></div>
                        <ProfileDropdown />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-4 pb-4 border-t pt-4">
                        <nav className="flex flex-col space-y-3 mb-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`font-medium transition-colors py-2 px-3 rounded-lg ${
                                        pathname === item.href
                                            ? 'text-purple-600 bg-purple-50'
                                            : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex flex-col gap-3 pt-3 border-t">
                            <ProfileDropdown />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}