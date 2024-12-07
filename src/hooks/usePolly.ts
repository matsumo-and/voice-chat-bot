"use client";

import { useState } from "react";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { getToken } from "@/lib/aws/getToken";
import { Credentials } from "@aws-sdk/client-sts";

const usePolly = () => {
  // synthesized audio.
  const [audioUrl, setAudioUrl] = useState<string>();

  /**
   * get Synthesized Voice from Polly.
   *
   * @param textResponse
   * @returns voiceURL, startSynthesize Function.
   */
  const getSynthesizedVoice = async (textResponse: string) => {
    const credential: Credentials = await getToken();

    // init Polly Client.
    const client = new PollyClient({
      region: "ap-northeast-1",
      credentials: {
        accessKeyId: credential.AccessKeyId!,
        secretAccessKey: credential.SecretAccessKey!,
        sessionToken: credential.SessionToken!,
      },
    });

    const command = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: textResponse,
      VoiceId: "Danielle",
      SampleRate: "22050",
      TextType: "text",
      LanguageCode: "en-US",
      Engine: "neural",
    });

    const response = await client.send(command);

    if (response.AudioStream) {
      const buffer = Buffer.from(
        await response.AudioStream.transformToByteArray()
      );
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url); // 音声URLを保存
    } else {
      throw new Error("unable to synthesize voice.");
    }
  };

  return {
    audioUrl,
    getSynthesizedVoice,
  };
};

export default usePolly;
