"use server";

import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";

export const listBucket = async (): Promise<string> => {
  const client = new S3Client({});
  const input = {
    MaxBuckets: 1,
    // ContinuationToken: "STRING_VALUE",
    // Prefix: "STRING_VALUE",
    // BucketRegion: "ap-northeast-1",
  };
  const command = new ListBucketsCommand(input);
  const response = await client.send(command);
  return response.ContinuationToken!;
};
