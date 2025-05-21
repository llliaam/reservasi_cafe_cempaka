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
        <section id="menu" className="py-12 md:py-16 px-4 md:px-6 bg-white">
            <div className="container mx-auto max-w-7xl">
                <h3 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-10 text-center text-black">
                    Trending & Recommended
                </h3>
                
                <div className="relative px-4 md:px-10">
                    <Carousel className="w-full">
                        <CarouselContent className="-ml-2 md:-ml-4 h-full flex items-stretch">
                            {menuItems.map(item => (
                                <CarouselItem 
                                    key={item.id} 
                                    className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 h-full"
                                >
                                    <Card className="h-[450px] w-full flex flex-col bg-white border border-gray-100 text-black shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden">

                                        <div>
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-[90%] h-40 rounded-md mx-auto object-cover"  
                                            />
                                        </div>
                                        
                                        <CardContent className="p-4 flex-grow">
                                            <h4 className="text-lg font-bold line-clamp-1">{item.name}</h4>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                                        </CardContent>
                                        
                                        <CardFooter className="pt-0 px-4 pb-4 mt-auto">
                                            <button
                                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium flex items-center justify-center"
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                Order Now
                                            </button>
                                        </CardFooter>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        
                        <CarouselPrevious className="hidden md:flex -left-4 md:-left-5 bg-white border border-gray-200 shadow-md" />
                        <CarouselNext className="hidden md:flex -right-4 md:-right-5 bg-white border border-gray-200 shadow-md" />
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