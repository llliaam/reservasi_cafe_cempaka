import React, { useState } from 'react';
import MenuDetailModal from '@/components/modalDetailModal';

const menuItems = [
    { id: 1, name: 'Iced Matcha Latte', price: 28000, image: '/images/matcha.jpg', description: 'Refreshing green tea with milk.', rating: 4, productInfo: 'Contains dairy. Served cold.' },
    { id: 2, name: 'Cempaka Signature Coffee', price: 32000, image: '/images/coffee.jpg', description: 'House-blend coffee with chocolate hint.', rating: 5, productInfo: 'Contains caffeine. Served hot.' },
    { id: 3, name: 'Avocado Toast', price: 25000, image: '/images/toast.jpg', description: 'Toasted sourdough with fresh avocado.', rating: 4, productInfo: 'Vegetarian friendly.' },
];

const MenuSection = () => {
    const [open, setOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<any>(null);

    const handleOpenModal = (item: any) => {
        setSelectedMenu(item);
        setOpen(true);
    };

    return (
        <section id="menu" className="py-16 px-6 bg-white">
            <h3 className="text-2xl font-semibold mb-8 text-center text-black">Trending & Recommended</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {menuItems.map(item => (
                    <div key={item.id} className="bg-gray-100 rounded-lg shadow p-4 text-center text-black">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded" />
                        <h4 className="mt-4 text-lg font-bold">{item.name}</h4>
                        <p className="text-green-600 font-semibold mb-2">Rp {item.price.toLocaleString()}</p>
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            onClick={() => handleOpenModal(item)}
                        >
                            Order
                        </button>
                    </div>
                ))}
            </div>

            {selectedMenu && (
                <MenuDetailModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    menu={selectedMenu}
                />
            )}
        </section>
    );
};

export default MenuSection;
