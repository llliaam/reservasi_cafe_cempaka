import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

const Navbar = () => {
    const { auth } = usePage<SharedData>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Menambahkan effect untuk mendeteksi scroll
    useEffect(() => {
        const handleScroll = () => {
            // Mengatur navbar menjadi sticky saat pengguna scroll lebih dari 10px
            if (window.scrollY > 10) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        // Menambahkan event listener untuk scroll
        window.addEventListener('scroll', handleScroll);

        // Membersihkan event listener saat component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const menuItems = [
        { name: "Breakfast", href: "#hot-coffee" },
        { name: "Coffee", href: "#coffee" },
        { name: "Desserts", href: "#desserts" },
        { name: "Lunch", href: "#blunch" },
        { name: "Dinner", href: "#dinner" },
        { name: "Drink", href: "#drink" },
        { name: "See All Menu", href: "#allmenu" },
    ];

    return (
        <nav 
            className={`bg-white shadow-md px-6 py-4 w-full z-50 transition-all duration-300
            ${isSticky ? 'fixed top-0 left-0 animate-slideDown' : ''}`}
        >
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800 hover:text-green-500">Cemapaka Cafe & Resto</h1>

                {/* Burger button for mobile */}
                <button
                    className="md:hidden text-gray-600 focus:outline-none"
                    onClick={toggleMobileMenu}
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center space-x-4 gap-1.5">
                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-600 hover:text-green-500 flex items-center"
                        >
                            Menu
                            <svg
                                className={`ml-1 h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                {menuItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <ScrollLink
                        to="contact"
                        smooth={true}
                        duration={500}
                        offset={-70}
                        className="text-gray-600 hover:text-green-400 cursor-pointer"
                    >   Contact
                    </ScrollLink>
                    <ScrollLink
                        to="dashboard"
                        smooth={true}
                        duration={500}
                        offset={-70}
                        className="text-gray-600 hover:text-green-400 cursor-pointer"
                    >   Dashboard
                    </ScrollLink>
                    {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-lg leading-normal bg-[#DDA853] hover:bg-yellow-600 font-bold text-black hover:border-[#DDA853] dark:text-white dark:hover:border-[#DDA853]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent border-2 px-5 py-1.5 text-lg leading-normal font-bold text-black hover:border-[#DDA853] dark:text-[#DDA853] dark:hover:text-yellow-600 dark:hover:border-yellow-600"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-lg leading-normal bg-[#DDA853] hover:bg-yellow-600 font-bold text-black hover:border-[#DDA853] dark:text-white dark:hover:border-[#DDA853]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="mt-4 md:hidden space-y-2">
                    {menuItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="block px-2 py-2 text-gray-700 hover:bg-gray-100"
                        >
                            {item.name}
                        </a>
                    ))}
                    <a href="#contact" className="block px-2 py-2 text-gray-700 hover:bg-gray-100">Contact</a>
                    <a href="/dashboard" className="block px-2 py-2 text-gray-700 hover:bg-gray-100">Dashboard</a>
                    <a href="#order" className="block px-2 py-2 text-white bg-green-600 hover:bg-green-700 rounded text-center">Reserve Now</a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;