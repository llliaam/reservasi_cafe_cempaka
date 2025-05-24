import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { router } from '@inertiajs/react';

type MenuDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  menu: {
    name: string;
    description: string;
    imageUrl: string;
    rating: number;
    productInfo: string;
  };
};

const MenuDetailModal: React.FC<MenuDetailModalProps> = ({ isOpen, onClose, menu }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-5 w-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.285 3.945a1 1 0 00.95.69h4.146c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.285 3.945c.3.921-.755 1.688-1.54 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.539-1.118l1.285-3.945a1 1 0 00-.364-1.118L2.08 9.372c-.783-.57-.38-1.81.588-1.81h4.146a1 1 0 00.95-.69l1.285-3.945z" />
      </svg>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-4 sm:p-6 rounded-2xl shadow-lg">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
          <X size={20} />
        </button>
        <div className="space-y-4">
          <img src={menu.imageUrl} alt={menu.name} className="w-full h-60 object-cover rounded-xl" />
          <div>
            <h2 className="text-xl font-bold">{menu.name}</h2>
            <div className="flex items-center mt-1">{renderStars(menu.rating)}</div>
          </div>
          <p className="text-amber-50">{menu.description}</p>
          <div className="text-sm text-amber-50">{menu.productInfo}</div>
        </div>
        <Button onClick={() => router.visit('/menuPage')}>Order</Button>
      </DialogContent>
    </Dialog>
  );
};

export default MenuDetailModal;
