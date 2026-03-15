import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3-client.js";

export const uploadToS3 = async (buffer, key) => {

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
  });

  await s3.send(command);

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};