import Vue from 'vue'
import Vuex from 'vuex'
import cart from './modules/cart'
import products from './modules/products'
import createLogger from '../plugins/logger'
import shop from '../api/shop'
import * as types from './mutation-types'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const actions = {
  addToCart: ({ commit }, product) => {
    if (product.inventory > 0) {
      commit(types.ADD_TO_CART, {
        id: product.id
      })
    }
  },

  checkout: ({ commit, state }, products) => {
    const savedCartItems = [...state.cart.added]
    commit(types.CHECKOUT_REQUEST)
    shop.buyProducts(
      products,
      () => commit(types.CHECKOUT_SUCCESS),
      () => commit(types.CHECKOUT_FAILURE, { savedCartItems })
    )
  },

  getAllProducts: ({ commit }) => {
    shop.getProducts(products => {
      commit(types.RECEIVE_PRODUCTS, { products })
    })
  }
}

const getters = {
  checkoutStatus: state => state.cart.checkoutStatus,

  allProducts: state => state.products.all,

  cartProducts: state => {
    return state.cart.added.map(({ id, quantity }) => {
      const product = state.products.all.find(p => p.id === id)
      return {
        title: product.title,
        price: product.price,
        quantity
      }
    })
  }
}

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    cart,
    products
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
