
export interface EventModalProps {
  title: string;
  isOpen: boolean;
  initialData: EventFormData;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
}

export interface EventFormData {
  name: string;
  description: string;
  location: string;
  date: string;
}
