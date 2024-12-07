import {
  STSClient,
  GetSessionTokenCommand,
  GetSessionTokenCommandOutput,
} from "@aws-sdk/client-sts";
import { NextRequest, NextResponse } from "next/server";

/**
 * .
 * @param req Token Get Request.
 * @returns Credential.
 */
export async function GET(req: NextRequest) {
  // TODO: req validate

  // init Client.
  const client = new STSClient({});

  // send getSessionToken command.
  const response: GetSessionTokenCommandOutput = await client.send(
    new GetSessionTokenCommand({
      DurationSeconds: 3600,
    })
  );

  if (!response.Credentials || response.$metadata.httpStatusCode !== 200) {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(response.Credentials), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
