import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,

      addToCart: (product, size, color, quantity = 1) => {
        const items = get().items;
        const existingIdx = items.findIndex(
          (i) => i.product === product._id && i.size === size && i.color === color
        );
        if (existingIdx > -1) {
          const updated = [...items];
          updated[existingIdx].quantity += quantity;
          set({ items: updated });
          toast.success('Cart updated');
        } else {
          set({
            items: [...items, {
              product: product._id,
              name: product.name,
              image: product.images?.[0]?.url,
              price: product.price,
              comparePrice: product.comparePrice,
              size,
              color,
              quantity,
              slug: product.slug,
            }],
          });
          toast.success('Added to cart!');
        }
      },

      removeFromCart: (productId, size, color) => {
        set({ items: get().items.filter((i) => !(i.product === productId && i.size === size && i.color === color)) });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity < 1) return get().removeFromCart(productId, size, color);
        set({
          items: get().items.map((i) =>
            i.product === productId && i.size === size && i.color === color ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], coupon: null, discount: 0 }),

      applyCoupon: (coupon, discount) => {
        set({ coupon, discount });
        toast.success(`Coupon applied! You save ₹${discount}`);
      },

      removeCoupon: () => set({ coupon: null, discount: 0 }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        const shipping = subtotal >= 999 ? 0 : 99;
        return subtotal - discount + shipping;
      },

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'veloq-cart' }
  )
);

export default useCartStore;
