import { contextBridge, ipcRenderer } from "electron";

const api = {
  clients: {
    list: () => ipcRenderer.invoke("clients:list"),
    upsert: (client: any) => ipcRenderer.invoke("clients:upsert", client),
    delete: (id: number) => ipcRenderer.invoke("clients:delete", id)
  },
  vehicles: {
    list: () => ipcRenderer.invoke("vehicles:list"),
    upsert: (vehicle: any) => ipcRenderer.invoke("vehicles:upsert", vehicle),
    delete: (id: number) => ipcRenderer.invoke("vehicles:delete", id)
  },
  procedures: {
    list: () => ipcRenderer.invoke("procedures:list"),
    upsert: (proc: any) => ipcRenderer.invoke("procedures:upsert", proc),
    delete: (id: number) => ipcRenderer.invoke("procedures:delete", id)
  },
  files: {
    listByVehicle: (vehicleId: number) => ipcRenderer.invoke("files:listByVehicle", vehicleId),
    attach: (vehicleId: number, procedureId: number | null, description: string) =>
      ipcRenderer.invoke("files:attach", vehicleId, procedureId, description),
    openFolder: (filePath: string) => ipcRenderer.invoke("files:openFolder", filePath),
    delete: (id: number) => ipcRenderer.invoke("files:delete", id)
  },
  jobs: {
    listByVehicle: (vehicleId: number) => ipcRenderer.invoke("jobs:listByVehicle", vehicleId),
    listAll: () => ipcRenderer.invoke("jobs:listAll"),
    upsert: (job: any) => ipcRenderer.invoke("jobs:upsert", job),
    delete: (id: number) => ipcRenderer.invoke("jobs:delete", id)
  }
};

contextBridge.exposeInMainWorld("api", api);

export type Api = typeof api;
