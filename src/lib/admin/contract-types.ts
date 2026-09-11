export type ReservationContractRow = {
  id: string;
  reservation_id: string;
  status: string;
  template_version: string;
  storage_path: string | null;
  file_name: string | null;
  generated_at: string | null;
  created_at: string;
  signed_url: string | null;
};
