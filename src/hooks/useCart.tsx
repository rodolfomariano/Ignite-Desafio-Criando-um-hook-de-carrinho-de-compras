import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
  stock: Stock[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [productList, setProductList] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    api.get('products').then(response => setProductList(response.data))
    api.get('stock').then(response => setStock(response.data))
  }, [])

  const addProduct = async (productId: number) => {

    try {
      const toCard = cart.find(addToCard => {
        if(addToCard.id === productId) { 
          return toast.warning('Produto já está no carrinho');
        }
      })
      stock.map(item => {

        if(item.id === productId && item.amount > 0 && !toCard) {
  
          stock.map(find => {
            if (find.id === item.id) { 
              find.amount = item.amount

              productList.map(product => {
                if(product.id === productId) {
                  setCart([...cart, {
                    ...product,
                    amount: 1
                  }])

                  localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, {
                    ...product,
                    amount: 1
                  }]))
                }
              })

            }
          })
          
          return toast.success('Produto adicionado com sucesso!')
        }
      })

    } catch {
      toast.error('Produto já está no carrinho');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const filterToRemove = cart.filter(product => product.id !== productId)

      setCart(filterToRemove)
      // localStorage.removeItem('@RocketShoes:cart')
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(filterToRemove))
      toast.warn('Produto excluido com sucesso!')
      
    } catch {
      toast.error('Não foi possível remover o item!');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      cart.map(product => {
        if(product.id === productId) {
          product.amount = amount 
          // console.log(product.amount)
        }
        setCart([...cart])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]))
      })
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount, stock }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
