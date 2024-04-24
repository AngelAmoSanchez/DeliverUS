import { get, post } from './helpers/ApiRequestsHelper'

function getOrders () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

export { getOrders, getOrderDetail, create }
