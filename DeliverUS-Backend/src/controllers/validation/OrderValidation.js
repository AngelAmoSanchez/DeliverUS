import { check } from 'express-validator'
import { checkOrderIsPending, checkRestaurantExists } from '../../middlewares/OrderMiddleware'
import { Order, Product, Restaurant } from '../../models/models'

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant
const create = [
  check('restaurantId')
    .exists().withMessage('Field restauranteId should be present')
    .custom(checkRestaurantExists),
  check('products')
    .isArray({ min: 1 }).withMessage('There must be at least one product in the order')
    .custom(async (value, { req }) => {
      for (const product of value) {
        if (!product.productId || product.quantity <= 0) {
          throw new Error('Each product must have productId and quantity greater than 0')
        }
        const productData = await Product.findByPk(product.productId)
        if (!productData) {
          throw new Error('One or more products are not available')
        }
        const restaurant = await Restaurant.findByPk(req.body.restaurantId)
        if (productData.restaurantId !== restaurant.id) {
          throw new Error('All products must belong to the same restaurant')
        }
      }
    })
]
// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
  check('restaurantId')
    .not().exists().withMessage('Field restaurantId should not be present'),
  check('products')
    .isArray({ min: 1 }).withMessage('There must be at least one product in the order')
    .custom(async (value, req) => {
      const order = await Order.findByPk(req.params.orderId)
      for (const product of value) {
        if (!product.productId || product.quantity <= 0) {
          throw new Error('Each product must have productId and quantity greater than 0')
        }
        const productData = await Product.findByPk(product.productId)
        if (!productData) {
          throw new Error('One or more products are not available')
        }
        if (productData.restaurantId !== order.restaurantId) {
          throw new Error('All products must belong to the same restaurant of the originally order')
        }
      }
    }),
  check('status')
    .custom(checkOrderIsPending)

]

export { create, update }
