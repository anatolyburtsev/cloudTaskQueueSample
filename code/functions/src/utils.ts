import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
import {logger} from "firebase-functions/v2";
import {App, initializeApp as initializeAppAdmin} from "firebase-admin/app";
import {firebaseConfigSecretVersionId} from "./constants";
import {GoogleAuth} from "google-auth-library";
import {getFunctions, TaskQueue} from "firebase-admin/functions";
import {Buffer} from "node:buffer";

export const parseMessage = <T>(event: any): T => {
  const message = event.data.message;
  const messageBody = Buffer.from(message.data, "base64").toString();
  logger.debug("Message received: ", messageBody);
  const jsonBody = JSON.parse(messageBody);
  return jsonBody as T;
};

/**
 * Get the URL of a given v2 cloud function.
 *
 * @param {string} name the function's name
 * @param {string} location the function's location
 * @return {Promise<string>} The URL of the function
 */
export async function getFunctionUrl(name: string, location = "us-central1") {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const projectId = await auth.getProjectId();
  const url = "https://cloudfunctions.googleapis.com/v2beta/" +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res = await client.request({url});
  // @ts-ignore
  const uri = res.data?.serviceConfig?.uri;
  logger.info(`URI: ${uri}`);
  if (!uri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return uri;
}

export const initTaskQueue = async (queueName: string): Promise<TaskQueue<Record<string, any>>> => {
  const secretClient = new SecretManagerServiceClient();
  const [firebaseConfigVersion] = await secretClient.accessSecretVersion({name: firebaseConfigSecretVersionId});
  const firebaseConfig = JSON.parse(firebaseConfigVersion?.payload?.data?.toString() || "");
  const app: App = initializeAppAdmin(firebaseConfig, "producerTask");
  return getFunctions(app).taskQueue(queueName);
};
