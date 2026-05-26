import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('cartItems');
    return localData ? JSON.parse(localData) : [];
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    const localAddr = localStorage.getItem('shippingAddress');
    return localAddr ? JSON.parse(localAddr) : { address: '', city: '', postalCode: '', country: 'Philippines' };
  });

  const [coordinates, setCoordinates] = useState(() => {
    const localCoords = localStorage.getItem('coordinates');
    return localCoords ? JSON.parse(localCoords) : { lat: 14.5995, lng: 120.9842 }; // Manila default
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  useEffect(() => {
    localStorage.setItem('coordinates', JSON.stringify(coordinates));
  }, [coordinates]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product._id);

      if (existItem) {
        // Limit to available stock
        const newQty = Math.min(existItem.qty + qty, product.stock);
        return prevItems.map((x) =>
          x.product === product._id ? { ...x, qty: newQty } : x
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.images[0],
            price: product.price,
            stock: product.stock,
            qty: Math.min(qty, product.stock),
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== id));
  };

  const updateQty = (id, qty) => {
    setCartItems((prevItems) =>
      prevItems.map((x) => (x.product === id ? { ...x, qty: Number(qty) } : x))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0);
  };

  const saveShippingAddress = (addressData) => {
    setShippingAddress(addressData);
  };

  const saveCoordinates = (coords) => {
    setCoordinates(coords);
  };

  const value = {
    cartItems,
    shippingAddress,
    coordinates,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    getCartSubtotal,
    getCartCount,
    saveShippingAddress,
    saveCoordinates,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
