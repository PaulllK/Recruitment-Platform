import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonButton,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonToggle,
  IonLoading,
  IonPage, IonRow,
  IonTitle,
  IonToolbar, IonIcon
} from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';
import {NetworkStatus} from "../network";
import CustomButton from "../generic/buttons/CustomButton";
import {eyeOffOutline, eyeOutline} from "ionicons/icons";
import {PASSWORD, TEXT} from "../core/constants";

const log = getLogger('Login');

interface LoginState {
  username?: string;
  password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const { username, password } = state;
  const [passwordInputType, setPasswordInputType] = useState<string>(PASSWORD);

  const handlePasswordChange = useCallback((e: any) => setState({
    ...state,
    password: e.detail.value || ''
  }), [state]);

  const handleUsernameChange = useCallback((e: any) => setState({
    ...state,
    username: e.detail.value || ''
  }), [state]);

  const handleLogin = useCallback(() => {
    log('handleLogin...');
    login?.(username, password);
  }, [username, password]);

  log('render');
  useEffect(() => {
    if (isAuthenticated) {
      log('redirecting to home');
      history.push('/');
    }
  }, [isAuthenticated]);

  return (
    <IonPage>
      <IonHeader>
        <NetworkStatus></NetworkStatus>
      </IonHeader>
      <IonContent fullscreen="true">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl">
            Log in to an account
          </h1>
          <div className="w-4/5 flex flex-col items-center bg-gray-700 p-6 m-4 rounded shadow-lg shadow-gray-800">
            <IonInput
                placeholder="Username"
                value={username}
                onIonChange={handleUsernameChange}
                className="border-b-2"
            />
            <IonInput
                placeholder="Password"
                type={passwordInputType}
                value={password}
                onIonChange={handlePasswordChange}
                className="border-b-2"
            >
              {
                passwordInputType === PASSWORD ?
                <IonIcon onClick={() => setPasswordInputType(TEXT)} icon={eyeOutline} slot="end"></IonIcon>
                :
                <IonIcon onClick={() => setPasswordInputType(PASSWORD)} icon={eyeOffOutline} slot="end"></IonIcon>
              }
            </IonInput>
            <IonLoading isOpen={isAuthenticating}/>
            {authenticationError && (
                <div>{authenticationError.message || 'Failed to authenticate'}</div>
            )}
            <CustomButton className="mt-4" onClick={handleLogin}>
              Log in
            </CustomButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
