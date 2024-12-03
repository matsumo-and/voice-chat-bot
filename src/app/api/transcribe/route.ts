import {
  StartStreamTranscriptionCommand,
  TranscribeStreamingClient,
} from "@aws-sdk/client-transcribe-streaming";
import { NextResponse } from "next/server";
import { Readable } from "stream";

/**
 * transcribe pcm encoded audio stream.
 * @param req Buffer Request.
 * @returns Transcription.
 */
export async function POST(req: Request) {
  // req validate
  if (req.body == null) {
    return NextResponse.json({ error: "BAD REQUEST" }, { status: 400 });
  }

  try {
    // Convert the request body to audioStream
    const reader = req.body.getReader();
    const audioStream = new Readable({
      read() {
        const pushStream = async () => {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null); // ストリーム終了
          } else {
            this.push(value); // バイナリデータ（Uint8Array）をpush
            pushStream(); // 再度データを読み取る
          }
        };
        pushStream(); // 最初の読み取りを開始
      },
    });

    // init Client.
    const client = new TranscribeStreamingClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // send command.
    const command = new StartStreamTranscriptionCommand({
      // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
      LanguageCode: "en-US",
      // The encoding used for the input audio. The only valid value is pcm.
      MediaEncoding: "pcm",
      // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
      // high-quality audio. The sample rate must match the sample rate in the audio file.
      MediaSampleRateHertz: 44100,
      AudioStream: audioStream,
    });

    const response = await client.send(command);

    let responseText = "";

    const resultStream = response.TranscriptResultStream!;
    for await (const transcriptEvent of resultStream) {
      responseText += JSON.stringify(transcriptEvent.TranscriptEvent) + "\n";
    }

    return new Response(responseText, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing buffer:", error);
    return NextResponse.json(
      { error: "Failed to process the buffer" },
      { status: 500 }
    );
  }
}
