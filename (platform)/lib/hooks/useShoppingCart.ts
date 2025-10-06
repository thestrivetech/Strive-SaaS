'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCartWithItems,
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
} from '@/lib/modules/marketplace';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

export function useShoppingCart() {
  const queryClient = useQueryClient();

  const cart = useQuery({
    queryKey: ['shopping-cart'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return null;
      return getCartWithItems(user.id);
    },
  });

  const addItem = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
  });

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
  });

  const processCheckout = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      queryClient.invalidateQueries({ queryKey: ['purchased-tools'] });
    },
  });

  return {
    cart: cart.data,
    isLoading: cart.isLoading,
    addItem,
    removeItem,
    clear,
    checkout: processCheckout,
    totalItems: (cart.data?.tools?.length || 0) + (cart.data?.bundles?.length || 0),
    totalPrice: cart.data?.totalPrice || 0,
  };
}
