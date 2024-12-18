"use client";

import {
  StartStreamTranscriptionCommand,
  TranscribeStreamingClient,
} from "@aws-sdk/client-transcribe-streaming";
import MicrophoneStream from "microphone-stream";
import { useState } from "react";
import update from "immutability-helper";
import { getToken } from "@/lib/aws/getToken";
import { Credentials } from "@aws-sdk/client-sts";

// encode to pcm
const pcmEncodeChunk = (chunk: Buffer) => {
  const input = MicrophoneStream.toRaw(chunk);
  let offset = 0;
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
};

const useTranscribe = () => {
  const [micStream, setMicStream] = useState<MicrophoneStream | undefined>();
  const [recording, setRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<
    {
      isPartial: boolean;
      transcript: string;
    }[]
  >([]);

  const startStream = async (mic: MicrophoneStream) => {
    const credential: Credentials = await getToken();

    const client = new TranscribeStreamingClient({
      region: "ap-northeast-1",
      credentials: {
        accessKeyId: credential.AccessKeyId!,
        secretAccessKey: credential.SecretAccessKey!,
        sessionToken: credential.SessionToken!,
      },
    });

    // generate pcm encoded audio stream.
    const audioStream = async function* () {
      for await (const chunk of mic as unknown as Buffer[]) {
        yield {
          AudioEvent: {
            AudioChunk:
              pcmEncodeChunk(
                chunk
              ) /* pcm Encoding is optional depending on the source */,
          },
        };
      }
    };

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "en-US",
      MediaEncoding: "pcm",
      MediaSampleRateHertz: 44100,
      AudioStream: audioStream(),
    });
    const response = await client.send(command);

    if (response.TranscriptResultStream) {
      // This snippet should be put into an async function
      for await (const event of response.TranscriptResultStream) {
        if (
          event.TranscriptEvent?.Transcript?.Results &&
          event.TranscriptEvent.Transcript?.Results.length > 0
        ) {
          // Get multiple possible results, but this code only processes a single result
          const result = event.TranscriptEvent.Transcript?.Results[0];

          setTranscripts((prev) => {
            // transcript from array to string
            const transcript = (
              result.Alternatives?.map(
                (alternative) => alternative.Transcript ?? ""
              ) ?? []
            ).join("");

            const index = prev.length - 1;

            if (prev.length === 0 || !prev[prev.length - 1].isPartial) {
              // segment is complete
              const tmp = update(prev, {
                $push: [
                  {
                    isPartial: result.IsPartial ?? false,
                    transcript,
                  },
                ],
              });
              return tmp;
            } else {
              // segment is NOT complete(overrides the previous segment's transcript)
              const tmp = update(prev, {
                $splice: [
                  [
                    index,
                    1,
                    {
                      isPartial: result.IsPartial ?? false,
                      transcript,
                    },
                  ],
                ],
              });
              return tmp;
            }
          });
        }
      }
    }
  };

  const startTranscription = async () => {
    const mic = new MicrophoneStream();
    try {
      setMicStream(mic);
      mic.setStream(
        await window.navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })
      );

      setRecording(true);
      await startStream(mic);
    } catch (e) {
      console.log(e);
    } finally {
      mic.stop();
      setRecording(false);
      setMicStream(undefined);
    }
  };

  const stopTranscription = () => {
    if (micStream) {
      micStream.stop();
      setRecording(false);
      setMicStream(undefined);
      setTranscripts([]);
    }
  };

  return {
    startTranscription,
    stopTranscription,
    recording,
    transcripts,
  };
};

export default useTranscribe;
