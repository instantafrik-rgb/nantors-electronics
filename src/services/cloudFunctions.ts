import { getFirebaseApp, getFirebaseAppCheck } from "./firebase";

export async function callCloudFunction<TInput, TOutput>(name: string, input: TInput): Promise<TOutput> {
  const app = await getFirebaseApp();
  if (!app) throw new Error("Firebase n'est pas configuré. Cette opération ne peut pas être enregistrée.");
  await getFirebaseAppCheck();
  const { getFunctions, httpsCallable } = await import("firebase/functions");
  const callable = httpsCallable<TInput, TOutput>(getFunctions(app, "europe-west1"), name);
  return (await callable(input)).data;
}
