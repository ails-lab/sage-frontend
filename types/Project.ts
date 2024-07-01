export interface Project {
  id: string;
  name: string;
  public: boolean;
  identifier: string;
  createdAt?: string;
  updatedAt?: string;
  uuid?: string;
  joinedUsers?: {}[];
}
