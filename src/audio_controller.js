export class AudioController {
  constructor(srcs, onDoneLoading, onAudioEnded) {
    this.players = [];
    this.ids2players = {};
    this.players2ids = {};

    for (const id of srcs) {
      const playerIdx = this.players.length;

      if (id in this.ids2players) {
        continue;
      }

      this.ids2players[id] = playerIdx;
      this.players2ids[playerIdx] = id;

      const p = new Audio(id);
      p.addEventListener('canplaythrough', (e => this.audioLoaded(p)), false);
      p.addEventListener('ended', (e => {
        if (this.onAudioEnded) this.onAudioEnded(id);
      }), false);

      this.players.push(p);
    }

    console.log("Loading " + this.players.length + " audio files");
    this.loadCount = 0;
    this.onDoneLoading = onDoneLoading;
    this.onAudioEnded = onAudioEnded;
  }

  audioLoaded(player) {
    this.loadCount+=1;
    if (this.loadCount === this.players.length) {
      if (this.onDoneLoading) this.onDoneLoading();
    }
  }

  play(audio_id) {
    const playerIdx = this.ids2players[audio_id];
    this.players[playerIdx].play()
      .catch(err => {
        console.log("Error while playing audio file: " + err);
      });
  }

  stop(audio_id) {
    const playerIdx = this.ids2players[audio_id];
    this.players[playerIdx].pause();
    this.players[playerIdx].currentTime = 0;
  }
}
