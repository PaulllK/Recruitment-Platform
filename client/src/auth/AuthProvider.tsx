import React, { useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import {getAllWorkers, login as loginApi} from './authApi';
import {WorkerProps} from './WorkerProps';
import {EMPLOYER} from "../core/constants";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
export type LogoutFn = () => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: LogoutFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
  userType?: string;
  workers?: WorkerProps[]
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token, userType, workers } = state;

  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LogoutFn>(logoutCallback, []);

  useEffect(authenticationEffect, [pendingAuthentication]);

  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token, userType, workers };
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('login');
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
  }

  function logoutCallback() {
    log('logout');

    setState({
      ...state,
      isAuthenticated: false
    });
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log('authenticate...');
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        if (canceled) {
          return;
        }
        log('authenticate succeeded');

        const userDetails = jwtDecode(token);
        const workers = userDetails.userType === EMPLOYER ? await getAllWorkers() : undefined;

        console.log(workers);

        setState({
          ...state,
          token,
          userType: userDetails.userType,
          workers,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        });
      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        setState({
          ...state,
          authenticationError: error as Error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }
};
