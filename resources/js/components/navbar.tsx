//navbar.tsx

import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

const Navbar = () => {
    const { auth } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav
            className={`bg-white shadow-sm px-6 py-4 w-full z-50 transition-all duration-300
            ${isSticky ? 'fixed top-0 left-0 animate-slideDown' : ''}`}
        >
            <div className="flex items-center justify-between mx-auto max-w-7xl">
                {/* Logo Section */}
                <div className="flex items-center space-x-3">
                    <img
                        src="/images/cempaka-logo.jpg"
                        alt="Cempaka Cafe Logo"
                        className="object-cover rounded-full w-15 h-15"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 cursor-pointer hover:text-orange-500">
                            Cempaka Cafe
                        </h1>
                        <p className="text-sm text-gray-500">Delicious & Fresh</p>
                    </div>
                </div>

                {/* Burger button for mobile */}
                <button
                    className="text-gray-600 md:hidden focus:outline-none"
                    onClick={toggleMobileMenu}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Desktop menu */}
                <div className="items-center hidden space-x-8 md:flex">
                    <a
                        href="/menuPage"
                        className="font-medium text-orange-500"
                    >
                        Our Menu
                    </a>

                    <a
                        href="/"
                        className="font-medium text-gray-600 hover:text-orange-500"
                    >
                        Home
                    </a>

                    <ScrollLink
                        to="review"
                        smooth={true}
                        duration={500}
                        offset={-70}
                        className="font-medium text-gray-600 cursor-pointer hover:text-orange-500"
                    >
                        Review
                    </ScrollLink>

                    <ScrollLink
                        to="contact"
                        smooth={true}
                        duration={500}
                        offset={-70}
                        className="font-medium text-gray-600 cursor-pointer hover:text-orange-500"
                    >
                        Contact
                    </ScrollLink>

                    {auth?.user ? (
                        <div className="relative group">
                            <button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#DDA853] hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
                                <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <div className="absolute right-0 z-50 invisible w-64 mt-2 transition-all duration-200 bg-white rounded-md shadow-lg opacity-0 dark:bg-gray-800 group-hover:opacity-100 group-hover:visible">
                                <div className="py-1">
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-[#DDA853] flex items-center justify-center">
                                                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {auth.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {auth.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('dashboard')}
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6H8z" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </div>
                                    </Link>

                                    <hr className="border-gray-200 dark:border-gray-600" />

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Logout</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="inline-block rounded-sm border border-transparent border-2 px-5 py-1.5 text-lg leading-normal font-bold text-black hover:border-orange-500 dark:text-orange-500 dark:hover:text-orange-600 dark:hover:border-orange-600"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-lg leading-normal bg-orange-500 hover:bg-orange-600 font-bold text-white hover:border-orange-500"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="mt-4 space-y-2 md:hidden">
                    <a
                        href="/menuPage"
                        className="block px-2 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Our Menu
                    </a>
                    <a
                        href="/"
                        className="block px-2 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Home
                    </a>
                    <ScrollLink
                        to="review"
                        smooth={true}
                        duration={500}
                        offset={-70}
                        className="block px-2 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                        Review
                    </ScrollLink>
                    <ScrollLink
                        to="contact"
                        smooth={true}
                        duration={500}
                        offset={-70}
                        className="block px-2 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                        Contact
                    </ScrollLink>

                    {auth?.user ? (
                        <div className="pt-2 space-y-2 border-t border-gray-200">
                            <div className="px-2 py-2 rounded bg-gray-50">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-[#DDA853] flex items-center justify-center">
                                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{auth.user.name}</span>
                                </div>
                            </div>

                            <Link
                                href={route('dashboard')}
                                className="block px-2 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="block w-full px-2 py-2 text-left text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                href={route('login')}
                                className="block px-2 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="block px-2 py-2 font-bold text-white bg-orange-500 rounded-sm hover:bg-orange-600"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
