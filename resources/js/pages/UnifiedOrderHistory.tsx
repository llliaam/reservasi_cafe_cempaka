import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Link as ScrollLink } from 'react-scroll';
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Phone,
    Eye,
    Edit,
    X,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    Mail,
    CreditCard,
    Package,
    Star,
    Download,
    Coffee,
    History,
    Home,
    ArrowLeft
} from 'lucide-react';

// Navbar Component
const Navbar = ({ auth }: { auth?: any }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const openLogoutModal = () => setShowLogoutModal(true);
    const closeLogoutModal = () => setShowLogoutModal(false);

    const handleLogout = () => {
        setIsLoggingOut(true);
        closeLogoutModal();
        closeSidebar();

        router.post(route('logout'), {}, {
            onFinish: () => {
                setIsLoggingOut(false);
            },
            onError: () => {
                setIsLoggingOut(false);
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
                                    <div className="absolute bottom-0 cursor-pointer left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></div>
                                </a>
                            )
                        ))}

                        {auth?.user ? (
                            <div className="relative ml-4">
                                <button
                                    id="profile-button"
                                    onClick={toggleSidebar}
                                    className="relative inline-flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full shadow-lg cursor-pointer bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 group hover:shadow-xl"
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
                    <div
                        className="absolute inset-0 transition-all duration-300 bg-black/70 backdrop-blur-sm"
                        onClick={closeLogoutModal}
                    />
                    <div className="relative z-10 w-full max-w-md mx-4 overflow-hidden transition-all duration-500 transform scale-100 bg-white shadow-2xl rounded-2xl dark:bg-gray-900 animate-bounce-in">
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
                    <div className="relative p-6 overflow-hidden bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 backdrop-blur-sm"></div>
                        <div className="relative flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white drop-shadow-lg">Profile</h2>
                            <button
                                onClick={closeSidebar}
                                className="relative z-10 p-2 text-white transition-all duration-200 rounded-full hover:bg-white/20 hover:rotate-90 group"
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

                    <div className="flex-1 p-4 space-y-2">
                        {[
                            { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'blue', route: route('home') },
                            { name: 'History', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'purple', route: route('unified.history') },
                            { name: 'My Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'amber', route: route('reviews.index') },
                            { name: 'Favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'pink', route: route('menu-favorit') },
                            { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'gray', route: route('profile.edit') }
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

                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 ">
                        <button
                            onClick={openLogoutModal}
                            className="flex items-center w-full px-4 py-3 text-left text-red-600 transition-all duration-300 cursor-pointer dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group hover:scale-105"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5  bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all duration-300 group-hover:scale-110">
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

// Interfaces
interface MenuItem {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface OrderItem {
    id: number;
    menu_item_id: number;
    menu_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    special_instructions?: string;
}

interface Reservation {
    id: string;
    date: string;
    time: string;
    guests: number;
    table: string;
    name: string;
    phone: string;
    email: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    specialRequest?: string;
    createdAt: string;
    packageName?: string;
    packagePrice?: number;
    menuSubtotal?: number;
    totalPrice?: number;
    paymentMethod?: string;
    paymentMethodLabel?: string;
    menuItems?: MenuItem[];
    proofOfPaymentUrl?: string;
    additionalImageUrls?: string[];
    type: 'reservation';
}

interface Order {
    id: number;
    order_code: string;
    order_date: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    total_amount: number;
    items: OrderItem[];
    can_be_reviewed: boolean;
    has_review: boolean;
    review?: {
        id: number;
        rating: number;
        comment: string;
        reviewed_at: string;
        can_edit: boolean;
    };
    type: 'order';
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ReservationStats {
    totalReservations: number;
    confirmedCount: number;
    completedCount: number;
    cancelledCount: number;
    pendingCount: number;
    totalGuests: number;
    averageGuests: number;
}

interface OrderStats {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    dineInCount: number;
    takeawayCount: number;
    deliveryCount: number;
    reviewsGiven: number;
    canBeReviewed: number;
}

interface UnifiedHistoryProps {
    reservations: Reservation[];
    orders: PaginatedOrders;
    reservationStats: ReservationStats;
    orderStats: OrderStats;
    auth?: {
        user?: any;
    };
}

type CombinedItem = (Reservation | Order) & {
    unified_date: string;
    unified_time: string;
    unified_status: string;
    unified_type: 'reservation' | 'order';
    unified_code: string;
    unified_total: number;
};

// Helper functions
const getStatusColor = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
        case 'preparing':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
        case 'ready':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        default:
            return 'bg-stone-100 text-stone-800 dark:bg-stone-900/20 dark:text-stone-400';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'Dikonfirmasi';
        case 'completed':
            return 'Selesai';
        case 'cancelled':
            return 'Dibatalkan';
        case 'pending':
            return 'Menunggu';
        case 'preparing':
            return 'Sedang Disiapkan';
        case 'ready':
            return 'Siap Diambil';
        default:
            return status;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'confirmed':
            return <CheckCircle className="w-4 h-4" />;
        case 'completed':
            return <CheckCircle className="w-4 h-4" />;
        case 'cancelled':
            return <X className="w-4 h-4" />;
        case 'pending':
            return <AlertCircle className="w-4 h-4" />;
        case 'preparing':
            return <Clock className="w-4 h-4" />;
        case 'ready':
            return <CheckCircle className="w-4 h-4" />;
        default:
            return <AlertCircle className="w-4 h-4" />;
    }
};

const getOrderTypeText = (type: string) => {
    switch (type) {
        case 'dine_in':
            return 'Dine In';
        case 'takeaway':
            return 'Take Away';
        case 'delivery':
            return 'Delivery';
        default:
            return type;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function UnifiedOrderHistory({
    reservations = [],
    orders,
    reservationStats,
    orderStats,
    auth
}: UnifiedHistoryProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'reservations' | 'orders'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cancellingIds, setCancellingIds] = useState(new Set<string>());
    const [localReservations, setLocalReservations] = useState(reservations);

    // Combine and normalize data
    const combineData = (): CombinedItem[] => {
        const combined: CombinedItem[] = [];

        // Add reservations
        localReservations.forEach((reservation) => {
            combined.push({
                ...reservation,
                unified_date: reservation.date,
                unified_time: reservation.time,
                unified_status: reservation.status,
                unified_type: 'reservation',
                unified_code: reservation.id,
                unified_total: reservation.totalPrice || 0,
            });
        });

        // Add orders
        orders.data.forEach((order) => {
            combined.push({
                ...order,
                unified_date: order.order_date,
                unified_time: formatTime(order.order_date),
                unified_status: order.status,
                unified_type: 'order',
                unified_code: order.order_code,
                unified_total: order.total_amount,
            });
        });

        // Sort by date (newest first)
        return combined.sort((a, b) =>
            new Date(b.unified_date).getTime() - new Date(a.unified_date).getTime()
        );
    };

    // Handle cancel reservation
    const handleCancelReservation = async (reservationId: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
            return;
        }

        setCancellingIds(prev => new Set([...prev, reservationId]));

        try {
            router.delete(route('reservations.destroy', reservationId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setLocalReservations(prev =>
                        prev.map(reservation =>
                            reservation.id === reservationId
                                ? { ...reservation, status: 'cancelled' as const }
                                : reservation
                        )
                    );
                },
                onError: (errors) => {
                    console.error('Cancel error:', errors);
                },
                onFinish: () => {
                    setCancellingIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(reservationId);
                        return newSet;
                    });
                }
            });
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            setCancellingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(reservationId);
                return newSet;
            });
        }
    };

    // Filter data
    const filteredData = combineData().filter(item => {
        const matchesTab = activeTab === 'all' ||
                          (activeTab === 'reservations' && item.unified_type === 'reservation') ||
                          (activeTab === 'orders' && item.unified_type === 'order');

        const matchesSearch = item.unified_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.unified_type === 'reservation' &&
                             (item as Reservation).name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.unified_type === 'reservation' &&
                             (item as Reservation).phone.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || item.unified_status === statusFilter;

        return matchesTab && matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-orange-50/30 dark:bg-gray-900">
            <Head title="Riwayat Pesanan & Reservasi" />

            {/* Navbar Component */}
            <Navbar auth={auth} />

            {/* Main Content dengan padding top untuk navbar */}
            <div className="px-4 py-8 pt-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8">
                    {/* Hero Section */}
                    <div className="relative p-8 overflow-hidden border shadow-sm bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 rounded-2xl border-orange-200/50 dark:border-gray-700/50">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 shadow-md bg-white/90 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                                    <Coffee className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white">
                                        Riwayat Aktivitas
                                    </h1>
                                    <p className="text-stone-600 dark:text-gray-400">
                                        Kelola semua pesanan dan reservasi dalam satu tempat
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4">
                                <div className="p-4 border shadow-sm bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-orange-200/30">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {reservationStats.totalReservations + orderStats.totalOrders}
                                    </div>
                                    <div className="text-sm text-stone-600 dark:text-gray-400">Total Aktivitas</div>
                                </div>
                                <div className="p-4 border shadow-sm bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-orange-200/30">
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(orderStats.totalSpent)}
                                    </div>
                                    <div className="text-sm text-stone-600 dark:text-gray-400">Total Belanja</div>
                                </div>
                                <div className="p-4 border shadow-sm bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-orange-200/30">
                                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {reservationStats.totalGuests}
                                    </div>
                                    <div className="text-sm text-stone-600 dark:text-gray-400">Total Tamu</div>
                                </div>
                                <div className="p-4 border shadow-sm bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-orange-200/30">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {orderStats.reviewsGiven}
                                    </div>
                                    <div className="text-sm text-stone-600 dark:text-gray-400">Review Diberikan</div>
                                </div>
                            </div>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 blur-3xl"></div>
                        </div>
                    </div>

                    {/* Detailed Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Reservasi Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg hover:scale-[1.02] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform bg-orange-500 shadow-md rounded-xl group-hover:scale-110">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                        {reservationStats.totalReservations}
                                    </div>
                                    <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                                        {reservationStats.confirmedCount} aktif
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-orange-800 dark:text-orange-300">Total Reservasi</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-orange-600/70 dark:text-orange-400/70">
                                    <span>✓ {reservationStats.completedCount} selesai</span>
                                    <span>⏳ {reservationStats.pendingCount} pending</span>
                                </div>
                            </div>
                        </div>

                        {/* Orders Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg hover:scale-[1.02] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform shadow-md bg-amber-500 rounded-xl group-hover:scale-110">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                        {orderStats.totalOrders}
                                    </div>
                                    <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
                                        {orderStats.completedOrders} selesai
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-amber-800 dark:text-amber-300">Total Pesanan</h3>
                                <div className="flex items-center gap-2 mt-2 text-sm text-amber-600/70 dark:text-amber-400/70">
                                    <span>🍽️ {orderStats.dineInCount}</span>
                                    <span>📦 {orderStats.takeawayCount}</span>
                                    <span>🚗 {orderStats.deliveryCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Spending Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg hover:scale-[1.02] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform shadow-md bg-emerald-500 rounded-xl group-hover:scale-110">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                                        {formatCurrency(orderStats.totalSpent)}
                                    </div>
                                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                                        total belanja
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-emerald-800 dark:text-emerald-300">Total Pengeluaran</h3>
                                <div className="mt-2 text-sm text-emerald-600/70 dark:text-emerald-400/70">
                                    Rata-rata {formatCurrency(orderStats.avgOrderValue)}
                                </div>
                            </div>
                        </div>

                        {/* Guest Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950/20 dark:to-stone-900/20 rounded-xl border-stone-200/50 dark:border-stone-800/50 hover:shadow-lg hover:scale-[1.02] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform shadow-md bg-stone-600 rounded-xl group-hover:scale-110">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                                        {reservationStats.totalGuests}
                                    </div>
                                    <div className="text-xs text-stone-600/70 dark:text-stone-400/70">
                                        total tamu
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-stone-800 dark:text-stone-300">Total Tamu</h3>
                                <div className="mt-2 text-sm text-stone-600/70 dark:text-stone-400/70">
                                    Rata-rata {reservationStats.averageGuests} orang/reservasi
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white dark:bg-gray-800 border border-orange-200/50 dark:border-gray-700 rounded-2xl flex-1 flex flex-col min-h-[60vh] shadow-sm">
                        {/* Header */}
                        <div className="p-6 border-b border-orange-100 dark:border-gray-700">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                                        Timeline Aktivitas
                                    </h2>
                                    <p className="mt-1 text-sm text-stone-600 dark:text-gray-400">
                                        Menampilkan {filteredData.length} aktivitas terbaru
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Tabs */}
                            <div className="flex items-center gap-2 p-1 mt-6 bg-orange-50 dark:bg-gray-700 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === 'all'
                                            ? 'bg-white dark:bg-gray-600 text-orange-900 dark:text-white shadow-sm'
                                            : 'text-stone-600 hover:text-orange-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-orange-100/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <History className="w-4 h-4" />
                                        <span className="hidden sm:inline">Semua</span> ({filteredData.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reservations')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === 'reservations'
                                            ? 'bg-white dark:bg-gray-600 text-orange-900 dark:text-white shadow-sm'
                                            : 'text-stone-600 hover:text-orange-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-orange-100/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="hidden sm:inline">Reservasi</span> ({reservationStats.totalReservations})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === 'orders'
                                            ? 'bg-white dark:bg-gray-600 text-orange-900 dark:text-white shadow-sm'
                                            : 'text-stone-600 hover:text-orange-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-orange-100/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Package className="w-4 h-4" />
                                        <span className="hidden sm:inline">Pesanan</span> ({orderStats.totalOrders})
                                    </div>
                                </button>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex flex-col gap-3 mt-6 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute w-4 h-4 text-orange-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Cari berdasarkan kode, nama, atau nomor telepon..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full py-3 pl-10 pr-4 text-sm border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-orange-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-3 text-sm border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="confirmed">Dikonfirmasi</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                        <option value="pending">Menunggu</option>
                                        <option value="preparing">Sedang Disiapkan</option>
                                        <option value="ready">Siap Diambil</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Content List */}
                        <div className="flex-1 overflow-auto">
                            {filteredData.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-800">
                                        <Coffee className="w-10 h-10 text-orange-400" />
                                    </div>
                                    <p className="mb-2 text-xl font-medium text-stone-500 dark:text-gray-400">
                                        {searchTerm || statusFilter !== 'all' ? 'Tidak ada data yang sesuai' : 'Belum ada aktivitas'}
                                    </p>
                                    <p className="mb-6 text-stone-400 dark:text-gray-500">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Coba ubah filter pencarian Anda'
                                            : 'Mulai dengan membuat reservasi atau memesan menu'
                                        }
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <div className="flex items-center justify-center gap-4">
                                            <Link
                                                href={route('reservations.create')}
                                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all bg-orange-600 shadow-md rounded-xl hover:bg-orange-700 hover:scale-105"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Buat Reservasi
                                            </Link>
                                            <Link
                                                href={route('menu.index')}
                                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-orange-600 transition-all border border-orange-200 rounded-xl bg-orange-50 hover:bg-orange-100 hover:border-orange-300 hover:scale-105"
                                            >
                                                <Package className="w-4 h-4" />
                                                Pesan Menu
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-orange-100 dark:divide-gray-700">
                                    {filteredData.map((item) => (
                                        <div key={`${item.unified_type}-${item.unified_code}`} className="p-6 transition-all hover:bg-orange-50/50 dark:hover:bg-gray-700/50 group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* Header with enhanced styling */}
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-xl shadow-sm ${
                                                                item.unified_type === 'reservation'
                                                                    ? 'bg-orange-100 dark:bg-orange-900/20'
                                                                    : 'bg-amber-100 dark:bg-amber-900/20'
                                                            }`}>
                                                                {item.unified_type === 'reservation' ? (
                                                                    <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                                ) : (
                                                                    <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                                                                    {item.unified_code}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.unified_status)}`}>
                                                                        {getStatusIcon(item.unified_status)}
                                                                        {getStatusText(item.unified_status)}
                                                                    </span>
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                                        item.unified_type === 'reservation'
                                                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                                                    }`}>
                                                                        {item.unified_type === 'reservation' ? 'Reservasi' : 'Pesanan'}
                                                                    </span>
                                                                    {item.unified_type === 'order' && (
                                                                        <span className="px-3 py-1 text-xs font-medium rounded-full text-stone-600 bg-stone-100 dark:bg-gray-700 dark:text-gray-300">
                                                                            {getOrderTypeText((item as Order).order_type)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content based on type */}
                                                    {item.unified_type === 'reservation' ? (
                                                        // Enhanced Reservation Content
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                {/* Time & Guests */}
                                                                <div className="p-4 bg-orange-50 dark:bg-gray-800 rounded-xl">
                                                                    <h4 className="mb-3 text-sm font-medium text-orange-800 dark:text-gray-300">Waktu & Tamu</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                            <Calendar className="w-4 h-4 text-orange-500" />
                                                                            <span className="font-medium">{formatDate((item as Reservation).date)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                            <Clock className="w-4 h-4 text-orange-500" />
                                                                            <span>{(item as Reservation).time}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                            <Users className="w-4 h-4 text-orange-500" />
                                                                            <span>{(item as Reservation).guests} orang</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Contact & Location */}
                                                                <div className="p-4 bg-orange-50 dark:bg-gray-800 rounded-xl">
                                                                    <h4 className="mb-3 text-sm font-medium text-orange-800 dark:text-gray-300">Kontak & Lokasi</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                            <MapPin className="w-4 h-4 text-orange-500" />
                                                                            <span>{(item as Reservation).table}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                            <Phone className="w-4 h-4 text-orange-500" />
                                                                            <span>{(item as Reservation).phone}</span>
                                                                        </div>
                                                                        {(item as Reservation).email && (
                                                                            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                                <Mail className="w-4 h-4 text-orange-500" />
                                                                                <span className="truncate">{(item as Reservation).email}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Package & Payment */}
                                                                <div className="p-4 bg-orange-50 dark:bg-gray-800 rounded-xl">
                                                                    <h4 className="mb-3 text-sm font-medium text-orange-800 dark:text-gray-300">Paket & Pembayaran</h4>
                                                                    <div className="space-y-2">
                                                                        {(item as Reservation).packageName && (
                                                                            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                                <Package className="w-4 h-4 text-orange-500" />
                                                                                <span className="truncate">{(item as Reservation).packageName}</span>
                                                                            </div>
                                                                        )}
                                                                        {(item as Reservation).totalPrice && (
                                                                            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
                                                                                <CreditCard className="w-4 h-4 text-orange-500" />
                                                                                <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                                                    {formatCurrency((item as Reservation).totalPrice)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {(item as Reservation).paymentMethodLabel && (
                                                                            <div className="text-xs text-stone-500 dark:text-gray-400">
                                                                                via {(item as Reservation).paymentMethodLabel}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Special Request */}
                                                            {(item as Reservation).specialRequest && (
                                                                <div className="p-4 border border-orange-200 rounded-xl bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                                                                    <div className="text-sm text-orange-800 dark:text-orange-400">
                                                                        <span className="font-medium">Permintaan khusus:</span> {(item as Reservation).specialRequest}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Menu Items */}
                                                            {(item as Reservation).menuItems && (item as Reservation).menuItems!.length > 0 && (
                                                                <div className="p-4 border border-orange-200 rounded-xl bg-orange-50 dark:bg-gray-800 dark:border-gray-700">
                                                                    <div className="text-sm text-stone-700 dark:text-gray-300">
                                                                        <span className="block mb-2 font-medium">Menu tambahan:</span>
                                                                        <div className="grid gap-2">
                                                                            {(item as Reservation).menuItems!.map((menuItem, index) => (
                                                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg dark:bg-gray-700">
                                                                                    <span className="font-medium">{menuItem.name} x{menuItem.quantity}</span>
                                                                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                                                        {formatCurrency(menuItem.subtotal)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Enhanced Order Content
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-6 p-4 text-sm text-stone-600 dark:text-gray-400 bg-amber-50 dark:bg-gray-800 rounded-xl">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4 text-amber-500" />
                                                                    <span className="font-medium">{formatDate((item as Order).order_date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-amber-500" />
                                                                    <span>{formatTime((item as Order).order_date)}</span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="mb-3 text-sm font-medium text-amber-800 dark:text-gray-300">Menu yang dipesan:</h4>
                                                                <div className="grid gap-2">
                                                                    {(item as Order).items.map((orderItem, index) => (
                                                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-gray-800">
                                                                            <div className="flex-1">
                                                                                <span className="font-medium text-stone-900 dark:text-white">
                                                                                    {orderItem.quantity}x {orderItem.menu_name}
                                                                                </span>
                                                                                {orderItem.special_instructions && (
                                                                                    <div className="mt-1 text-xs italic text-stone-500">
                                                                                        Note: {orderItem.special_instructions}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                                                {formatCurrency(orderItem.subtotal)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Footer with total and actions */}
                                                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-orange-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-lg font-bold text-stone-900 dark:text-white">
                                                                Total: {formatCurrency(item.unified_total)}
                                                            </div>
                                                            {item.unified_type === 'order' && (item as Order).review && (
                                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                                                        {(item as Order).review!.rating}/5
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {item.unified_type === 'reservation' && (
                                                                <div className="text-sm text-stone-500 dark:text-gray-400">
                                                                    Dibuat {formatDate((item as Reservation).createdAt)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {item.unified_type === 'reservation' ? (
                                                                <>
                                                                    <Link
                                                                        href={route('reservations.show', (item as Reservation).id)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-orange-600 transition-all border border-orange-200 rounded-lg hover:text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-300"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Detail
                                                                    </Link>
                                                                    {(item as Reservation).status === 'pending' && (
                                                                        <Link
                                                                            href={route('reservations.edit', (item as Reservation).id)}
                                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 transition-all border border-blue-200 rounded-lg hover:text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                            Edit
                                                                        </Link>
                                                                    )}
                                                                    {((item as Reservation).status === 'pending' || (item as Reservation).status === 'confirmed') && (
                                                                        <button
                                                                            onClick={() => handleCancelReservation((item as Reservation).id)}
                                                                            disabled={cancellingIds.has((item as Reservation).id)}
                                                                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-all ${
                                                                                cancellingIds.has((item as Reservation).id)
                                                                                    ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                                                                    : 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300'
                                                                            }`}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                            {cancellingIds.has((item as Reservation).id) ? 'Membatalkan...' : 'Batalkan'}
                                                                        </button>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Link
                                                                        href={route('orders.show', (item as Order).id)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm transition-all border rounded-lg text-amber-600 border-amber-200 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Detail
                                                                    </Link>
                                                                    {(item as Order).can_be_reviewed && (
                                                                        <Link
                                                                            href={route('reviews.create', { order_id: (item as Order).id })}
                                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 transition-all border border-yellow-200 rounded-lg hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300"
                                                                        >
                                                                            <Star className="w-4 h-4" />
                                                                            Beri Rating
                                                                        </Link>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Pagination */}
                        {activeTab === 'orders' && orders.last_page > 1 && (
                            <div className="p-6 border-t border-orange-100 dark:border-gray-700 bg-orange-50/30 dark:bg-gray-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-stone-600 dark:text-gray-400">
                                        Menampilkan <span className="font-medium">{orders.from}</span> sampai <span className="font-medium">{orders.to}</span> dari <span className="font-medium">{orders.total}</span> pesanan
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {orders.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                                                    link.active
                                                        ? 'bg-orange-500 text-white shadow-sm'
                                                        : link.url
                                                        ? 'text-stone-600 hover:bg-orange-100 dark:text-gray-400 dark:hover:bg-gray-700 border border-orange-200 dark:border-gray-600'
                                                        : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
