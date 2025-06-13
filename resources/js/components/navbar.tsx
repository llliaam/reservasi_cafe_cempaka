//navbar.tsx

import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { type SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react'; // Tambahkan router import

const Navbar = () => {
    const { auth } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Tambahkan loading state

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const openLogoutModal = () => setShowLogoutModal(true);
    const closeLogoutModal = () => setShowLogoutModal(false);

    // Perbaiki fungsi handleLogout
    const handleLogout = () => {
        setIsLoggingOut(true);
        closeLogoutModal();
        closeSidebar();

        // Gunakan Inertia router untuk logout POST request
        router.post(route('logout'), {}, {
            onFinish: () => {
                setIsLoggingOut(false);
            },
            onError: () => {
                setIsLoggingOut(false);
                // Handle error jika diperlukan
                console.error('Logout failed');
            }
        });
    };

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

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSidebarOpen) {
                const sidebar = document.getElementById('profile-sidebar');
                const profileButton = document.getElementById('profile-button');

                if (sidebar && profileButton &&
                    !sidebar.contains(event.target as Node) &&
                    !profileButton.contains(event.target as Node)) {
                    setIsSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    const menuItems = [
        { name: 'Home', href: '/', scroll: false },
        { name: 'Menu', href: '/menuPage', scroll: false },
        { name: 'Review', href: 'review', scroll: true },
        { name: 'Contact', href: 'contact', scroll: true },
    ];

    return (
        <>
            <nav
                className={`backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-lg border-b border-white/20 px-6 py-4 w-full z-50 transition-all duration-500 ease-out
                ${isSticky ? 'fixed top-0 left-0 animate-slideDown shadow-2xl' : ''}`}
            >
                <div className="flex items-center justify-between mx-auto max-w-7xl">
                    {/* Logo Section with Glow Effect */}
                    <div className="flex items-center space-x-4 group">
                        <div className="relative">
                            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-75 bg-gradient-to-r from-orange-400 to-yellow-400 blur group-hover:opacity-100"></div>
                            <img
                                src="/images/cempaka-logo.jpg"
                                alt="Cempaka Cafe Logo"
                                className="relative object-cover w-12 h-12 transition-all duration-300 rounded-full ring-2 ring-orange-400/50 group-hover:ring-orange-400"
                            />
                        </div>
                        <div className="transition-all duration-300 group-hover:transform group-hover:scale-105">
                            <h1 className="text-2xl font-bold text-transparent cursor-pointer bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text">
                                Cempaka Cafe
                            </h1>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delicious & Fresh</p>
                        </div>
                    </div>

                    {/* Animated Burger Button */}
                    <button
                        className="relative p-2 text-gray-600 dark:text-gray-300 md:hidden focus:outline-none group"
                        onClick={toggleMobileMenu}
                    >
                        <div className="absolute inset-0 transition-transform duration-200 scale-0 bg-orange-100 rounded-lg dark:bg-orange-900/20 group-hover:scale-100"></div>
                        <div className="relative flex flex-col items-center justify-center w-6 h-6">
                            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                        </div>
                    </button>

                    {/* Desktop Menu with Hover Effects */}
                    <div className="items-center hidden space-x-2 md:flex">
                        {menuItems.map((item, index) => (
                            item.scroll ? (
                                <ScrollLink
                                    key={item.name}
                                    to={item.href}
                                    smooth={true}
                                    duration={500}
                                    offset={-70}
                                    className="relative px-4 py-2 font-medium text-gray-700 transition-colors duration-300 cursor-pointer dark:text-gray-300 group hover:text-orange-500"
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    <div className="absolute inset-0 transition-transform duration-300 ease-out scale-0 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 group-hover:scale-100"></div>
                                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></div>
                                </ScrollLink>
                            ) : (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="relative px-4 py-2 font-medium text-gray-700 transition-colors duration-300 dark:text-gray-300 group hover:text-orange-500"
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    <div className="absolute inset-0 transition-transform duration-300 ease-out scale-0 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 group-hover:scale-100"></div>
                                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></div>
                                </a>
                            )
                        ))}

                        {auth?.user ? (
                            <div className="relative ml-4">
                                <button
                                    id="profile-button"
                                    onClick={toggleSidebar}
                                    className="relative inline-flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 group hover:shadow-xl"
                                >
                                    <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-gradient-to-r from-orange-400 to-yellow-400 blur group-hover:opacity-75"></div>
                                    <svg className="relative w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="flex items-center ml-4 space-x-3">
                                <Link
                                    href={route('login')}
                                    className="relative inline-block px-6 py-2 font-semibold text-gray-700 transition-all duration-300 dark:text-gray-300 hover:text-orange-500 group"
                                >
                                    <span className="relative z-10">Log in</span>
                                    <div className="absolute inset-0 transition-colors duration-300 border-2 border-transparent rounded-lg group-hover:border-orange-500/50"></div>
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="relative inline-block px-6 py-2 overflow-hidden font-semibold text-white transition-all duration-300 rounded-lg group"
                                >
                                    <div className="absolute inset-0 transition-transform duration-300 bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:scale-105"></div>
                                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-orange-600 to-yellow-600 group-hover:opacity-100"></div>
                                    <span className="relative z-10">Register</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Mobile Menu */}
                <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pb-4 mt-4 space-y-1">
                        {menuItems.map((item, index) => (
                            <div
                                key={item.name}
                                className={`transform transition-all duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {item.scroll ? (
                                    <ScrollLink
                                        to={item.href}
                                        smooth={true}
                                        duration={500}
                                        offset={-70}
                                        className="flex items-center px-4 py-3 text-gray-700 transition-all duration-300 rounded-lg cursor-pointer dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/20 dark:hover:to-yellow-900/20 group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="font-medium transition-colors duration-300 group-hover:text-orange-500">{item.name}</span>
                                    </ScrollLink>
                                ) : (
                                    <a
                                        href={item.href}
                                        className="flex items-center px-4 py-3 text-gray-700 transition-all duration-300 rounded-lg dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/20 dark:hover:to-yellow-900/20 group"
                                    >
                                        <span className="font-medium transition-colors duration-300 group-hover:text-orange-500">{item.name}</span>
                                    </a>
                                )}
                            </div>
                        ))}

                        {auth?.user ? (
                            <div className={`pt-4 border-t border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                                style={{ transitionDelay: `${menuItems.length * 100}ms` }}>
                                <button
                                    onClick={toggleSidebar}
                                    className="flex items-center w-full px-4 py-3 text-left transition-all duration-300 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 hover:from-orange-100 hover:to-yellow-100 dark:hover:from-orange-900/40 dark:hover:to-yellow-900/40 group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-900 transition-colors duration-300 dark:text-gray-100 group-hover:text-orange-600">{auth.user.name}</span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className={`space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                                style={{ transitionDelay: `${menuItems.length * 100}ms` }}>
                                <Link
                                    href={route('login')}
                                    className="block px-4 py-3 font-medium text-gray-700 transition-all duration-300 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="block px-4 py-3 font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 hover:shadow-xl"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 transition-all duration-300 bg-black/70 backdrop-blur-sm"
                        onClick={closeLogoutModal}
                    />

                    {/* Modal */}
                    <div className="relative z-10 w-full max-w-md mx-4 overflow-hidden transition-all duration-500 transform scale-100 bg-white shadow-2xl rounded-2xl dark:bg-gray-900 animate-bounce-in">
                        {/* Header dengan gradient */}
                        <div className="relative p-6 overflow-hidden bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-red-400/20 to-yellow-400/20 backdrop-blur-sm"></div>
                            <div className="relative flex items-center space-x-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.692-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white drop-shadow-lg">Konfirmasi Logout</h3>
                                    <p className="text-sm text-white/90">Apakah Anda yakin ingin keluar?</p>
                                </div>
                            </div>
                            <div className="absolute w-20 h-20 rounded-full -bottom-1 -right-1 bg-white/10 blur-xl"></div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex items-center mb-6 space-x-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full dark:bg-orange-900/30">
                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{auth?.user?.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{auth?.user?.email}</p>
                                </div>
                            </div>

                            <p className="mb-6 text-gray-600 dark:text-gray-300">
                                Anda akan keluar dari akun Cempaka Cafe. Pastikan semua pekerjaan telah tersimpan sebelum melanjutkan.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={closeLogoutModal}
                                    disabled={isLoggingOut}
                                    className="flex-1 px-4 py-3 font-semibold text-gray-700 transition-all duration-300 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex-1 px-4 py-3 font-semibold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isLoggingOut ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>Logging out...</span>
                                        </div>
                                    ) : (
                                        'Ya, Logout'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 transition-all duration-300 bg-black/60 backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            {/* Enhanced Profile Sidebar */}
            {auth?.user && (
                <div
                    id="profile-sidebar"
                    className={`fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 transform transition-all duration-500 ease-out border-l border-white/20 ${
                        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Enhanced Sidebar Header */}
                    <div className="relative p-6 overflow-hidden bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 backdrop-blur-sm"></div>
                        <div className="relative flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white drop-shadow-lg">Profile</h2>
                            <button
                                onClick={closeSidebar}
                                className="relative z-10 p-2 text-white transition-all duration-200 rounded-full cursor-pointer hover:bg-white/20 hover:rotate-90 group"
                                type="button"
                                aria-label="Close sidebar"
                            >
                                <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="absolute w-20 h-20 rounded-full -bottom-1 -right-1 bg-white/10 blur-xl"></div>
                        <div className="absolute w-16 h-16 rounded-full -top-1 -left-1 bg-yellow-300/20 blur-lg"></div>
                    </div>

                    {/* Enhanced Profile Info */}
                    <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full opacity-75 bg-gradient-to-r from-orange-400 to-yellow-400 blur animate-pulse"></div>
                                <div className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{auth.user.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{auth.user.email}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 mt-2 text-xs font-medium text-orange-700 bg-orange-100 rounded-full dark:text-orange-300 dark:bg-orange-900/50">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5 animate-pulse"></div>
                                    Active Member
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Menu Items */}
                    <div className="flex-1 p-4 space-y-2">
                        {[
                            { name: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z', color: 'blue', route: route('dashboard') },
                            { name: 'Order History', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'purple' },
                            { name: 'My Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'amber', route: route('reviews.index') },
                            { name: 'Favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'pink' },
                            { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'gray' }
                        ].map((item, index) => (
                            item.route ? (
                                <Link
                                    key={item.name}
                                    href={item.route}
                                    onClick={closeSidebar}
                                    className="flex items-center w-full px-4 py-3 text-left text-gray-700 transition-all duration-300 dark:text-gray-300 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group hover:scale-105 hover:shadow-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2.5 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl group-hover:bg-${item.color}-200 dark:group-hover:bg-${item.color}-800/50 transition-all duration-300 group-hover:scale-110`}>
                                            <svg className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <span className="font-medium transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">{item.name}</span>
                                    </div>
                                </Link>
                            ) : (
                                <button
                                    key={item.name}
                                    className="flex items-center w-full px-4 py-3 text-left text-gray-700 transition-all duration-300 dark:text-gray-300 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group hover:scale-105 hover:shadow-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2.5 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl group-hover:bg-${item.color}-200 dark:group-hover:bg-${item.color}-800/50 transition-all duration-300 group-hover:scale-110`}>
                                            <svg className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <span className="font-medium transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">{item.name}</span>
                                    </div>
                                </button>
                            )
                        ))}
                    </div>

                    {/* Enhanced Logout Button */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <button
                            onClick={openLogoutModal}
                            className="flex items-center w-full px-4 py-3 text-left text-red-600 transition-all duration-300 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group hover:scale-105"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all duration-300 group-hover:scale-110">
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <span className="font-medium">Logout</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Animation Styles */}
            <style jsx>{`
                @keyframes bounce-in {
                    0% {
                        transform: scale(0.3);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s ease-out;
                }
            `}</style>
        </>
    );
};

export default Navbar;
