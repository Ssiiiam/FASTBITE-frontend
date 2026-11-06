import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import api from "../api/axios";
import { useAuth } from "./AuthContext";

export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_available?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<void>;
  increaseQuantity: (productId: number) => Promise<void>;
  decreaseQuantity: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const RESTAURANT_CART_KEY = "restaurantCart";
const RESTAURANT_TABLE_KEY = "restaurantTable";

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {

  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const isRestaurantMode = () => {
    return Boolean(
      sessionStorage.getItem(RESTAURANT_TABLE_KEY),
    );
  };

  /*
   * -----------------------------
   * ONLINE CART
   * -----------------------------
   */

  const fetchOnlineCart = useCallback(async (): Promise<CartItem[]> => {
    try {
      const response = await api.get("/cart");

      return response.data.map(
        (item: {
          id: number;
          product_id: number;
          quantity: number;
          name: string;
          price: number;
          image_url: string;
        }) => ({
          id: item.product_id,
          name: item.name,
          price: Number(item.price),
          image_url: item.image_url,
          quantity: item.quantity,
          cartItemId: item.id,
        }),
      );
    } catch (error) {
      console.error("Failed to load online cart:", error);
      return [];
    }
  }, []);

  /*
   * -----------------------------
   * RESTAURANT QR CART
   * -----------------------------
   */

  const loadRestaurantCart = useCallback((): CartItem[] => {
    try {
      const savedCart = sessionStorage.getItem(RESTAURANT_CART_KEY);

      if (!savedCart) {
        return [];
      }

      return JSON.parse(savedCart) as CartItem[];
    } catch (error) {
      console.error("Failed to load restaurant cart:", error);
      return [];
    }
  }, []);

  const saveRestaurantCart = useCallback((items: CartItem[]) => {
    sessionStorage.setItem(RESTAURANT_CART_KEY, JSON.stringify(items));

    setCartItems(items);
  }, []);

  /*
   * -----------------------------
   * LOAD CART
   * -----------------------------
   */

  useEffect(() => {
    const loadCart = async () => {
      if (isRestaurantMode()) {
        const restaurantItems = loadRestaurantCart();
        setCartItems(restaurantItems);
        return;
      }
      if(user) {
        const items = await fetchOnlineCart();
        setCartItems(items);
        return;
      }
      setCartItems([]);
    };

    void loadCart();
  }, [
      user, 
      fetchOnlineCart, 
      loadRestaurantCart
    ]);

  /*
   * -----------------------------
   * ADD TO CART
   * -----------------------------
   */

  const addToCart = async (product: Product): Promise<boolean> => {
    /*
     * Restaurant QR customer
     */
    if (isRestaurantMode()) {
      const currentCart = loadRestaurantCart();

      const existingItem = currentCart.find((item) => item.id === product.id);

      let updatedCart: CartItem[];

      if (existingItem) {
        updatedCart = currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      } else {
        updatedCart = [
          ...currentCart,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      saveRestaurantCart(updatedCart);

      return true;
    }
    if (!user) {
      return false;
    }

    /*
     * Online customer
     */
    try {
      await api.post("/cart/items", {
        productId: product.id,
        quantity: 1,
      });

      const items = await fetchOnlineCart();

      setCartItems(items);

      return true;
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      return false;
    }
  };

  /*
   * -----------------------------
   * REMOVE
   * -----------------------------
   */

  const removeFromCart = async (productId: number) => {
    /*
     * Restaurant QR
     */
    if (!user) {
      const currentCart = loadRestaurantCart();

      const updatedCart = currentCart.filter((item) => item.id !== productId);

      saveRestaurantCart(updatedCart);

      return;
    }

    /*
     * Online
     */
    const item = cartItems.find((cartItem) => cartItem.id === productId);

    if (!item?.cartItemId) {
      return;
    }

    try {
      await api.delete(`/cart/items/${item.cartItemId}`);

      const items = await fetchOnlineCart();

      setCartItems(items);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  /*
   * -----------------------------
   * INCREASE
   * -----------------------------
   */

  const increaseQuantity = async (productId: number) => {
    /*
     * Restaurant QR
     */
    if (isRestaurantMode()) {
      const currentCart = loadRestaurantCart();

      const updatedCart = currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );

      saveRestaurantCart(updatedCart);

      return;
    }

    /*
     * Online
     */

    const item = cartItems.find((cartItem) => cartItem.id === productId);

    if (!item?.cartItemId) {
      return;
    }

    try {
      await api.patch(
        `/cart/items/${item.cartItemId}
        `, {
        quantity: item.quantity + 1,
      },
    );

      const items = await fetchOnlineCart();

      setCartItems(items);
    } catch (error) {
      console.error("Failed to increase quantity:", error);
    }
  };

  /*
   * -----------------------------
   * DECREASE
   * -----------------------------
   */

  const decreaseQuantity = async (productId: number) => {
    /*
     * Restaurant QR
     */
    if (isRestaurantMode()) {
      const currentCart = loadRestaurantCart();

      const item = currentCart.find((cartItem) => cartItem.id === productId);

      if (!item) {
        return;
      }

      if (item.quantity === 1) {
        const updatedCart = currentCart.filter(
          (cartItem) => cartItem.id !== productId,
        );

        saveRestaurantCart(updatedCart);

        return;
      }

      const updatedCart = currentCart.map((cartItem) =>
        cartItem.id === productId
          ? {
              ...cartItem,
              quantity: cartItem.quantity - 1,
            }
          : cartItem,
      );

      saveRestaurantCart(updatedCart);

      return;
    }

    /*
     * Online
     */

    const item = cartItems.find((cartItem) => cartItem.id === productId);

    if (!item?.cartItemId) {
      return;
    }

    if (item.quantity === 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      await api.patch(
        `/cart/items/${item.cartItemId}
        `, {
        quantity: item.quantity - 1,
      },
    );

      const items = await fetchOnlineCart();

      setCartItems(items);
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
    }
  };

  /*
   * -----------------------------
   * CLEAR CART
   * -----------------------------
   */

  const clearCart = async () => {
    /*
     * Restaurant QR
     */
    if (isRestaurantMode()) {
      sessionStorage.removeItem(RESTAURANT_CART_KEY);
      setCartItems([]);
      return;
    }

    if(!user) {
      setCartItems([]);
      return;
    }

    /*
     * Online
     */
    try {
      for (const item of cartItems) {
        if (item.cartItemId) {
          await api.delete(`/cart/items/${item.cartItemId}`,

          );
        }
      }

      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error,

      );
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
