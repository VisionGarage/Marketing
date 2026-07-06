import type { Client, Vehicle, Procedure, CodingFile, Job } from "./types";

export interface WindowApi {
  clients: {
    list: () => Promise<Client[]>;
    upsert: (client: Partial<Client>) => Promise<number>;
    delete: (id: number) => Promise<void>;
  };
  vehicles: {
    list: () => Promise<Vehicle[]>;
    upsert: (vehicle: Partial<Vehicle>) => Promise<number>;
    delete: (id: number) => Promise<void>;
  };
  procedures: {
    list: () => Promise<Procedure[]>;
    upsert: (proc: Partial<Procedure>) => Promise<number>;
    delete: (id: number) => Promise<void>;
  };
  files: {
    listByVehicle: (vehicleId: number) => Promise<CodingFile[]>;
    attach: (vehicleId: number, procedureId: number | null, description: string) => Promise<CodingFile | null>;
    openFolder: (filePath: string) => Promise<void>;
    delete: (id: number) => Promise<void>;
  };
  jobs: {
    listByVehicle: (vehicleId: number) => Promise<Job[]>;
    listAll: () => Promise<Job[]>;
    upsert: (job: Partial<Job>) => Promise<number>;
    delete: (id: number) => Promise<void>;
  };
}

declare global {
  interface Window {
    api: WindowApi;
  }
}
