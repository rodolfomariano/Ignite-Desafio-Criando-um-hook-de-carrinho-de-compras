import React, { useState } from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount, stock } = useCart();

  const [productNumbers, setProductNumbers] = useState<Product>()

  // const cartFormatted = cart.map(product => ({
  //   // TODO
  // }))
  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        return sumTotal += product.price * product.amount
        
      }, 0) 
    )

  function handleProductIncrement(product: Product) {
    // cart.map(addPriduct => addPriduct.id === product.id && )

    const newAmount = product.amount + 1

    updateProductAmount({
      productId: product.id,
      amount: newAmount
    })
  }

  function handleProductDecrement(product: Product) {
    const newAmount = product.amount - 1

    updateProductAmount({
      productId: product.id,
      amount: newAmount
    })
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map(product => {
            let a = 0
            stock.find(findStock => {
              if(findStock.id === product.id ) {
                a = findStock.amount
              }
            })

            console.log(a)

            return (

              <tr data-testid="product" key={product.id}>
                <td>
                  <img src={product.image} alt="Tênis de Caminhada Leve Confortável" />
                </td>
                <td>
                  <strong>{product.title}</strong>
                  <span>{formatPrice(product.price)}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                    disabled={product.amount <= 1}
                    onClick={() => handleProductDecrement(product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={product.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      disabled={
                        a - product.amount <= 1
                      }
                      onClick={() => handleProductIncrement(product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formatPrice(product.price * product.amount)}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>

            )
          }
            
            

        )}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
