//menuSection.tsx
import React, { useState } from 'react';
import MenuDetailModal from '@/components/modalDetailModal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const menuItems = [
    { id: 1, name: 'Iced Matcha Latte', image: '/images/menu1.jpg', description: 'Refreshing green tea with milk.', productInfo: 'Contains dairy. Served cold.' },
    { id: 2, name: 'Cempaka Signature Coffee', image: '/images/menu2.jpg', description: 'House-blend coffee with chocolate hint.', productInfo: 'Contains caffeine. Served hot.' },
    { id: 3, name: 'Avocado Toast', image: '/images/menu3.jpg', description: 'Toasted sourdough with fresh avocado.', productInfo: 'Vegetarian friendly.' },
    { id: 4, name: 'Avocado Toast', image: '/images/menu1.jpg', description: 'Toasted sourdough with fresh avocado.', productInfo: 'Vegetarian friendly.' },
    { id: 5, name: 'Avocado Toast', image: '/images/menu2.jpg', description: 'Toasted sourdough with fresh avocado.', productInfo: 'Vegetarian friendly.' },
];

const MenuSection = () => {
    const [open, setOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);

    const handleOpenModal = (item:any) => {
        setSelectedMenu(item);
        setOpen(true);
    };



    return (
        <section id="menu" className="px-4 py-12 bg-white md:py-16 md:px-6">
            <div className="container mx-auto max-w-7xl">
                <h3 className="mb-6 text-2xl font-semibold text-center text-black md:text-3xl md:mb-10">
                    Trending & Recommended
                </h3>

                <div className="relative px-4 md:px-10">
                    <Carousel className="w-full">
                        <CarouselContent className="flex items-stretch h-full -ml-2 md:-ml-4">
                            {menuItems.map(item => (
                                <CarouselItem
                                    key={item.id}
                                    className="h-full pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4"
                                >
                                    <Card className="h-[450px] w-full flex flex-col bg-white border border-gray-100 text-black shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden">

                                        <div>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-[90%] h-40 rounded-md mx-auto object-cover"
                                            />
                                        </div>

                                        <CardContent className="flex-grow p-4">
                                            <h4 className="text-lg font-bold line-clamp-1">{item.name}</h4>
                                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                        </CardContent>

                                        <CardFooter className="px-4 pt-0 pb-4 mt-auto">
                                            <button
                                                className="flex items-center justify-center w-full py-2 font-medium text-white transition-colors duration-300 bg-orange-500 rounded-lg hover:bg-orange-600"
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                Order Now
                                            </button>
                                        </CardFooter>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious className="hidden bg-white border border-gray-200 shadow-md md:flex -left-4 md:-left-5" />
                        <CarouselNext className="hidden bg-white border border-gray-200 shadow-md md:flex -right-4 md:-right-5" />
                    </Carousel>
                </div>
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
