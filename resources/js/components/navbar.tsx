import { useState } from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
        <nav className="bg-white shadow-md px-6 py-4">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Cafe Cempaka</h1>

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
                <div className="hidden md:flex items-center space-x-4">
                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-600 hover:text-gray-900 flex items-center"
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

                    <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
                    <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="#order" className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Reserve Now</a>
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
