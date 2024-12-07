import { Credentials } from "aws-sdk/clients/sts";

/**
 * get session token.
 *
 * @returns assistant message.
 */
export const getToken = async (): Promise<Credentials> => {
  const credentailResponse: Response = await fetch("/api/token", {
    method: "GET",
  });
  const credential: Credentials = await credentailResponse.json();

  return credential;
};
