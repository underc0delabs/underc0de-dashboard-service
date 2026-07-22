export default interface IEvent {
  id?: string;
  title?: string | null;
  eventType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  place?: string | null;
  modality?: string | null;
  description?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  visibleInApp?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
