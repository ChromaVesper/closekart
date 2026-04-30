import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const stored = localStorage.getItem('closekart_cart');
        return stored ? JSON.parse(stored) : [];
    });
    const [shopId, setShopId] = useState(() => {
        return localStorage.getItem('closekart_cart_shopId') || null;
    });

    useEffect(() => {
        localStorage.setItem('closekart_cart', JSON.stringify(cartItems));
        if (shopId) {
            localStorage.setItem('closekart_cart_shopId', shopId);
        } else {
            localStorage.removeItem('closekart_cart_shopId');
        }
    }, [cartItems, shopId]);

    const addToCart = (product, productShopId) => {
        if (shopId && shopId !== productShopId) {
            const confirmChange = window.confirm("Adding this item will clear your current cart from another shop. Continue?");
            if (!confirmChange) return;
            setCartItems([]); // clear cart
            setShopId(productShopId);
        } else if (!shopId) {
            setShopId(productShopId);
        }

        setCartItems(prev => {
            const existing = prev.find(item => item.productId === product._id);
            if (existing) {
                return prev.map(item => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { 
                productId: product._id, 
                name: product.name, 
                price: product.price, 
                image: product.image, 
                quantity: 1 
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => {
            const updated = prev.filter(item => item.productId !== productId);
            if (updated.length === 0) setShopId(null);
            return updated;
        });
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(prev => {
            const updated = prev.map(item => {
                if (item.productId === productId) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            });
            // If item changed to 0 quantity, filter it out
            const filtered = updated.filter(item => item.quantity > 0);
            if (filtered.length === 0) setShopId(null);
            return filtered;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setShopId(null);
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, shopId, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
