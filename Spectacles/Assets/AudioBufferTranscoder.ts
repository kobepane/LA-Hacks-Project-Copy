@component
export class AudioBufferTranscoder extends BaseScriptComponent {
  @input private audioTrack: AudioTrackAsset;
  @input private sampleRate: number = 44100;

  /*onAwake() {
    var control = this.audioTrack.control;
    if (control.isOfType("Provider.MicrophoneAudioProvider")) {
      (control as MicrophoneAudioProvider).start();
    }
    control.sampleRate = this.sampleRate;
    print(control.maxFrameSize);
    var audioFrame = new Float32Array(control.maxFrameSize);

    this.createEvent("UpdateEvent").bind(function (eventData) {
      var audioFrameShape = (control as MicrophoneAudioProvider).getAudioFrame(
        audioFrame
      );
      if (audioFrameShape.x == 0) {
        return;
      }
      async function sendAudioData(eventData: Float32Array) {
        try {
          const response = await fetch("https://example.com/api/audio", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: eventData,
          });
        } catch (error) {
          print("Error sending audio data: " + error);
        }
      }
    });
  }*/
}
