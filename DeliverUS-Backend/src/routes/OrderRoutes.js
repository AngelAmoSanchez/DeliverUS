import * as OrderValidation from '../controllers/validation/OrderValidation.js'
import OrderController from '../controllers/OrderController.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as OrderMiddleware from '../middlewares/OrderMiddleware.js'
import { Order } from '../models/models.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'

const loadFileRoutes = function (app) {
  // TODO: Include routes for:
  // 1. Retrieving orders from current logged-in customer
  app.route('/orders')
    .get(
      isLoggedIn, // we check it's logged-in
      hasRole('customer'), // we check it has role customer
      OrderController.indexCustomer // function that queries orders from current logged-in customer and send them back
    )
  // 2. Creating a new order (only customers can create new orders)
  app.route('/orders')
    .post(
      isLoggedIn, // we check it's logged-in
      hasRole('customer'), // we check it has role customer
      OrderMiddleware.checkRestaurantExists, // we check if the restaurant of the order exists
      OrderValidation.create, // we validate data to create the order
      handleValidation, // we send errors
      OrderController.create // we create if everything goes well
    )
  app.route('/orders/:orderId/confirm')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderIsPending,
      OrderController.confirm
    )

  app.route('/orders/:orderId/send')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeSent,
      OrderController.send
    )
  app.route('/orders/:orderId/deliver')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeDelivered,
      OrderController.deliver)

  // TODO: Include routes for:
  // 3. Editing order (only customers can edit their own orders)
  app.route('/orders/:orderId')
    .put(
      isLoggedIn, // we check it's logged-in
      hasRole('customer'), // we check it has role customer
      checkEntityExists(Order, 'orderId'), // we check that order with that ID exists
      OrderMiddleware.checkOrderCustomer, // we check if the order belongs to current loggedIn customer
      OrderMiddleware.checkOrderIsPending, // we check the order is still pending
      OrderValidation.update, // we validate data to update the order
      handleValidation, // we send back errors
      OrderController.update) // we update the order if everything goes well
  // 4. Remove order (only customers can remove their own orders)
  app.route('/orders/:orderId')
    .delete(
      isLoggedIn, // we check if it's logged-in
      hasRole('customer'), // we check it has role customer
      checkEntityExists(Order, 'orderId'), // we check that order with that ID exists
      OrderMiddleware.checkOrderCustomer, // we check if the order belongs to current loggedIn customer
      OrderMiddleware.checkOrderIsPending, // we check the order is still pending
      handleValidation, // we send back errors
      OrderController.destroy)

  app.route('/orders/:orderId')
    .get(
      isLoggedIn,
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderVisible,
      OrderController.show)
}

export default loadFileRoutes
