import usersService from '../services/users'
import { SET_USER, CLEAR_USER } from '../actions/auth'

import { message } from 'antd'
import subscribeUser from './../subscription';
import { getAuthHeader } from '../services/config'

// manpulates the data coming from backend
const adapterFunc = (user) => {
  return { ...user.user, token: user.token }
}

let user = window.localStorage.getItem('eduhub-user')
const intialState = user
  ? { user: adapterFunc(JSON.parse(user)), isAuth: true }
  : { user: null, isAuth: false }

const authReducer = (state = intialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { user: adapterFunc(action.user), isAuth: true }
    case CLEAR_USER:
      return { user: null, isAuth: false }
    default:
      return state
  }
}

export const register = (credentials) => {
  return async () => {
    try {
      const response = await usersService.register(credentials)
      if (!response) {
        throw new Error('invalid error with response')
      }
    } catch (error) {
      message.error('invalid credentials')
      console.log(error)
    }
  }
}

/* actions for authentication bellow */

export const login = (credentials) => {
  return async (dispatch) => {
    try {
      const response = await usersService.login(credentials)
      dispatch({ type: SET_USER, user: response })
      window.localStorage.setItem('eduhub-user', JSON.stringify(response))
      subscribeUser(`http://localhost:4000/notification/subscribe`,getAuthHeader().headers.Authorization);
      console.log("subscribed")
    } catch (error) {
      console.log(error)
      // the backend should send the error message to show
      // message.error(error.response.data.message)
      message.error('invalid credentials')
    }
  }
}

export const logout = () => {
  return async (dispatch) => {
    try {
      // await usersService.logout()
      dispatch({ type: CLEAR_USER })
      window.localStorage.removeItem('eduhub-user')
    } catch (error) {
      console.log(error)
    }
  }
}

export default authReducer
