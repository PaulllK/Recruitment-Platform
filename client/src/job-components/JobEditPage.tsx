import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
  IonIcon, IonText
} from '@ionic/react';
import { getLogger } from '../core';
import { JobsContext } from './JobsProvider';
import { RouteComponentProps } from 'react-router';
import { JobProps } from './JobProps';
import {NetworkStatus} from "../network";
import {add, camera} from 'ionicons/icons';
import {usePhotos} from "../camera/usePhotos";
import CustomMap from "../maps/CustomMap";
import {useMyLocation} from "../maps/useMyLocation";
import CustomButton from "../generic/buttons/CustomButton";
import {jwtDecode} from "jwt-decode";
import {AuthContext} from "../auth";
import {WORKER} from "../core/constants";

const log = getLogger('JobEditPage');

interface JobEditPageProps extends RouteComponentProps<{
  id?: string;
}> {}

const JobEditPage: React.FC<JobEditPageProps> = ({ history, match }) => {
  const { jobs, saving, savingError, saveJob } = useContext(JobsContext);
  const { token, userType } = useContext(AuthContext)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salaryPerHour, setSalaryPerHour] = useState(0);
  const [numberOfAvailablePositions, setNumberOfAvailablePositions] = useState(0);
  const [photoBase64, setPhotoBase64] = useState('');

  const [job, setJob] = useState<JobProps>();

  const { takePhoto } = usePhotos();

  const { latitude: lat, longitude: lng } = useMyLocation().position?.coords || {};
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);

  useEffect(() => {
    // if(userType === WORKER)
    //   history.goBack();
    log('useEffect');
    const routeId = match.params.id || '';
    const currentJob = jobs?.find(j => j._id === routeId);
    setJob(currentJob);
    if (currentJob) {
      setTitle(currentJob.title);
      setDescription(currentJob.description);
      setSalaryPerHour(currentJob.salaryPerHour);
      setNumberOfAvailablePositions(currentJob.numberOfAvailablePositions);
      setPhotoBase64(currentJob.photoBase64 || '');
      setLongitude(currentJob.longitude);
      setLatitude(currentJob.latitude);
    }
  }, [match.params.id, jobs]);

  const handleSave = useCallback(() => {
    const editedJob = job ?
        { ...job, title, description, salaryPerHour, numberOfAvailablePositions, employerName: jwtDecode(token).name, photoBase64, longitude, latitude }
        :
        { title, description, salaryPerHour, numberOfAvailablePositions, employerName: jwtDecode(token).name, photoBase64, longitude, latitude };
    saveJob && saveJob(editedJob).then(() => history.goBack());
  }, [job, saveJob, title, description, salaryPerHour, numberOfAvailablePositions, photoBase64, longitude, latitude, history]);
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <NetworkStatus></NetworkStatus>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="px-4">
          <IonItem>
            <IonInput value={title} placeholder="enter title" onIonInput={e => setTitle(e.detail.value || '')} />
          </IonItem>
          <IonItem>
            <IonInput value={description} placeholder="enter description" onIonInput={e => setDescription(e.detail.value || '')} />
          </IonItem>
          <IonItem>
            <IonInput value={salaryPerHour} placeholder="enter salary per hour in RON" type="number" onIonInput={e => setSalaryPerHour(Number(e.detail.value) || -1)} />
          </IonItem>
          <IonItem>
            <IonInput value={numberOfAvailablePositions} placeholder="enter number of available positions" type="number" onIonInput={e => setNumberOfAvailablePositions(Number(e.detail.value) || -1)} />
          </IonItem>
        </IonList>
        <CustomMap
            lat={latitude || lat || 0.0}
            lng={longitude || lng || 0.0}
            onMapClick = {({ latitude, longitude }) =>  { setLatitude(latitude); setLongitude(longitude); }}
        />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save job'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <CustomButton icon={camera} onClick={() => takePhoto().then(res => {setPhotoBase64(res || '')})}>
            <IonText>Add a photo</IonText>
          </CustomButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default JobEditPage;
