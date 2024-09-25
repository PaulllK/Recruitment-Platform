import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './index.css';

import { JobsList, JobEditPage } from './job-components';
import { JobsProvider } from './job-components/JobsProvider';
import {AuthProvider, Login, PrivateRoute} from "./auth";
import JobDetailsPage from "./job-components/JobDetailsPage";
import {ApplicationsProvider} from "./job-components/applications/ApplicationsProvider";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <AuthProvider>
          <Route path="/login" component={Login} exact={true}/>
          <ApplicationsProvider>
            <JobsProvider>
              <PrivateRoute path="/jobs" component={JobsList} exact={true}/>
              <PrivateRoute path="/job/:id" component={JobDetailsPage} exact={true}/>
              <PrivateRoute path="/job/add" component={JobEditPage} exact={true}/>
              <PrivateRoute path="/job/edit/:id" component={JobEditPage} exact={true}/>
            </JobsProvider>
          </ApplicationsProvider>
          <Route exact path="/" render={() => <Redirect to="/jobs"/>}/>
        </AuthProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
