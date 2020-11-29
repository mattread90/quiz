import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react'

function authReducer(state, action) {
  switch (action.type) {
    case 'SIGN_IN': {
      return {
        ...state,
        user: action.payload,
        signedIn: true,
      }
    }
    case 'SIGN_OUT': {
      return {
        ...state,
        user: null,
        signedIn: false,
      }
    }
    default: {
      throw new Error(`Unsupported action type: ${action.type}`)
    }
  }
}

const intialState = { signedIn: false, user: null }

const AuthContext = createContext([])

export function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, intialState)
  const value = useMemo(() => [state, dispatch], [state])
  return <AuthContext.Provider value={value} {...props} />
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(`useAuth must be used within a AuthProvider`)
  }
  const [state, dispatch] = context

  return {
    state,
    actions: {
      signIn: useCallback(
        (user) =>
          dispatch({
            type: 'SIGN_IN',
            payload: user,
          }),
        [dispatch]
      ),
      signOut: useCallback(() => dispatch({ type: 'SIGN_OUT' }), [dispatch]),
    },
  }
}
