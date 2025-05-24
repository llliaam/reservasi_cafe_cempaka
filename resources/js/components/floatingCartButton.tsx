import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  cartCount: number;
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cartCount,
  onClick
}) => {
  if (cartCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-40 animate-bounce"
    >
      <div className="relative">
        <ShoppingCart size={24} />
        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
          {cartCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;
