import React, { useContext, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonAvatar,
  IonLabel,
  IonSpinner,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonText,
  CreateAnimation
} from '@ionic/react';
import { add, logOut } from 'ionicons/icons';
import Job from './Job';
import { getLogger } from '../core';
import { JobsContext } from './JobsProvider';
import {NetworkStatus} from "../network";
import {AuthContext} from "../auth";
import {useNetwork} from "../network/useNetwork";
import {LogoutButton} from "../generic/buttons/LogoutButton";
import {EMPLOYER} from "../core/constants";
import CustomButton from "../generic/buttons/CustomButton";

const log = getLogger('JobsList');

const JobsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { jobs, fetching, fetchingError, fetchMoreJobs } = useContext(JobsContext);
  const { logout, userType } = useContext(AuthContext);

  const { networkStatus } = useNetwork();

  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState(false);
  const [searchModel, setSearchModel] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  log('render');

  // const pulseKeyFrames = [
  //   { offset: 0, transform: 'scale(1)' },
  //   { offset: 0.3, transform: 'scale(1.1)' },
  //   { offset: 0.5, transform: 'scale(1)' },
  //   { offset: 0.7, transform: 'scale(1.2)' },
  //   { offset: 1, transform: 'scale(1)' }
  // ]

  useEffect(() => {
    if(!networkStatus.connected) {
      setDisableInfiniteScroll(true);
    } else {
      setDisableInfiniteScroll(false);
    }
  }, [networkStatus]);

  useEffect(() => {
    if(jobs)
      if(jobs.length < 15)
        setDisableInfiniteScroll(true);
  }, [jobs]);

  return (
    <IonPage>
      <IonHeader>
        <NetworkStatus></NetworkStatus>
        <IonToolbar>
          <IonTitle>Jobs Board!</IonTitle>
          <LogoutButton logoutCallback={logout} />
        </IonToolbar>
        <IonSearchbar
            value={searchModel}
            animated={true}
            placeholder="Search for a job"
            showClearButton="focus"
            className="w-full sm:w-1/2 sm:mx-auto md:w-1/3"
            color="light"
            debounce={500}
            onIonInput={e => setSearchModel(e.detail.value!)}
        >
        </IonSearchbar>
      </IonHeader>
      <IonContent>
        {/*<IonLoading isOpen={fetching} message="Fetching applications" />*/}
        {jobs &&
          <>
            <IonList className="bg-theme-black flex flex-col items-center py-2 px-4">
              {jobs
                  .filter(job => job.title.toLowerCase().indexOf(searchModel.toLowerCase()) >= 0)
                  .map(({ _id, title, description, employerName, salaryPerHour, photoBase64 }) =>
                    <Job
                        key={_id}
                        _id={_id}
                        title={title}
                        description={description}
                        employerName={employerName}
                        salaryPerHour={salaryPerHour}
                        photoBase64={photoBase64}
                        onClick={ id => history.push(`/job/${id}`) }
                    />
                  )
              }
            </IonList>
            <IonInfiniteScroll
              onIonInfinite={(ev) => {
                fetchMoreJobs && fetchMoreJobs().then((response) => {
                  console.log("response", response);
                  if(response < 15) { // last applications returned
                    setDisableInfiniteScroll(true);
                  }
                });
                ev.target.complete();
              }}
              disabled={disableInfiniteScroll}
            >
              <IonInfiniteScrollContent className="flex items-center">
                <IonSpinner></IonSpinner>
              </IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </>
        }
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch applications'}</div>
        )}

        {
          userType && userType === EMPLOYER ?
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <CustomButton icon={add} onClick={() => history.push('/job/add')}>
              <IonText>Post a job</IonText>
            </CustomButton>
          </IonFab> :
          <></>
        }
      </IonContent>
    </IonPage>
  );
};

export default JobsList;

