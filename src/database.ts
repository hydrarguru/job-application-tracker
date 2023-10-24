import { openDB, deleteDB, DBSchema } from "idb";
const DATABASE_NAME: string = "Applications";

export interface JobDB extends DBSchema {
  appliedJobs: {
    key: number;
    value: {
      companyName: string;
      jobRole: string;
      jobArea: string;
      applicationLink: string;
      appliedDate: string;
    };
    indexes: {
      companyName: string;
      jobRole: string;
      jobArea: string;
      applicationLink: string;
      appliedDate: string;
    };
  };
}

export interface IAppliedJob {
  companyName: string;
  jobRole: string;
  jobArea: string;
  applicationLink: string;
  appliedDate: string;
}

export function createDatabase(databaseName?: string) {
  if (!databaseName) {
    databaseName = DATABASE_NAME;
  }
  else {
    return openDB<JobDB>(databaseName, 1, {
      upgrade(db) {
        const store = db.createObjectStore("appliedJobs", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("companyName", "companyName");
        store.createIndex("jobRole", "jobRole");
        store.createIndex("jobArea", "jobArea");
        store.createIndex("applicationLink", "applicationLink");
        store.createIndex("appliedDate", "appliedDate");
        console.log("DATABASE CREATED: ", DATABASE_NAME);
      },
    });
  }
  console.log("CONNECTED TO DATABASE: ", DATABASE_NAME);
}

export async function deleteDatabase() {
  return await deleteDB(DATABASE_NAME, {
    blocked() {
      console.log("DB DELETE BLOCKED");
    },
  });
}

export async function insertDbData(data: IAppliedJob) {
  const db = await openDB(DATABASE_NAME);
  const transaction = db.transaction("appliedJobs", "readwrite");
  await Promise.all([transaction.store.add(data)]);
  db.close();
}

export async function updateDbData(data: IAppliedJob, id: number) {
  const db = await openDB(DATABASE_NAME);
  const tx = db.transaction("appliedJobs", "readwrite");
  await Promise.all([tx.store.put(data, id)]);
  db.close();
}

export async function getDbData(id: number, asJson: boolean) {
  const db = await openDB(DATABASE_NAME);
  const transaction = db.transaction("appliedJobs", "readonly");
  const data = await transaction.store.get(id);
  transaction.oncomplete = () => {
    if (asJson) {
      return JSON.stringify(data);
    } else {
      return data;
    }
  };
  db.close();
}

export async function getAllDbData(asJson: boolean) {
  const db = await openDB(DATABASE_NAME);
  const transaction = db.transaction("appliedJobs", "readonly");
  const data = await transaction.store.getAll();
  db.close();
  if (asJson) {
    return JSON.stringify(data);
  } else {
    return data;
  }
}

export async function deleteDbData(id: number) {
  const db = await openDB(DATABASE_NAME);
  const transaction = db.transaction("appliedJobs", "readwrite");
  await Promise.all([transaction.store.delete(id)]);

  console.log("DELETED: ", id);
  db.close();
}
