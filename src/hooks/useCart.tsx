import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });


  const addProduct = async (productId: number) => {
    try {

      const productAlreadyOnTheCar = cart.find(product => product.id === productId)

      if (productAlreadyOnTheCar) {
        updateProductAmount({
          productId,
          amount: productAlreadyOnTheCar.amount + 1,
        })

      } else {
        const { data: product } = await api.get<Product>(`products/${productId}`)

        if (product) {

          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, {
            ...product,
            amount: 1
          }]))

          setCart([...cart, { ...product, amount: 1 }])
          toast.success('Produto adicionado com sucesso!')
        }
      }
      
    } catch (error) {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removeProduct = cart.filter(product => product.id !== productId)
      const cartIndex = cart.findIndex((cart) => cart.id === productId);

      if (cartIndex < 0) throw new Error()

      setCart(removeProduct)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(removeProduct))

      toast.warn('Produto excluido com sucesso!')


    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (amount < 1) {
        return
      }

      if(amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if(amount <= stock.amount) {
        cart.map(product => {
          if(product.id === productId) {
            product.amount = amount

            setCart([...cart])
          }
        })
        return localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]))
      }
      

    } catch {
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
