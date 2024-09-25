export interface JobProps {
  _id?: string;
  photoBase64?: string;
  title: string;
  description: string;
  employerName: string;
  salaryPerHour: number;
  numberOfAvailablePositions: number;
  longitude: number;
  latitude: number;
}
