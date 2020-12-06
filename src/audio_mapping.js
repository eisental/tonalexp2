export const Instrument = {
  PIANO: 0,
  STRINGS: 1,
};

export const str_to_instrument = (sinst) => {
  if (sinst.toLowerCase() === "piano")
    return Instrument.PIANO;
  else if (sinst.toLowerCase() === "strings")
    return Instrument.STRINGS;
  else return null;
};

export const other_instrument = (instrument) => {
  if (instrument === Instrument.PIANO)
    return Instrument.STRINGS;
  else if (instrument === Instrument.STRINGS)
    return Instrument.PIANO;
  else return null;
};

export const music_key_to_idx = {
  "C": 0,
  "Db": 1,
  "D": 2,
  "Eb": 3,
  "E": 4,
  "F": 5,
  "Gb": 6,
  "G": 7,
  "Ab": 8,
  "A": 9,
  "Bb": 10,
  "B": 11,
};

const audio_ext = ".mp3";

const base_audio_dir = "/tonalexp2/audio/";
const pause_dir = "pause/";
const instrument_dir = {
  [Instrument.PIANO]: "piano/",
  [Instrument.STRINGS]: "strings/",
};

const trial_audio = {
  [Instrument.PIANO]: [
    "Cm",
    "Dbm",
    "Dm",
    "Ebm",
    "Em",
    "Fm",
    "Gbm",
    "Gm",
    "Abm",
    "Am",
    "Bbm",
    "Bm",
  ],

  [Instrument.STRINGS]: [
    "Cm_str",
    "Dbm_str",
    "Dm_str",
    "Ebm_str",
    "Em_str",
    "Fm_str",
    "Gbm_str",
    "Gm_str",
    "Abm_str",
    "Am_str",
    "Bbm_str",
    "Bm_str",
  ],
};

export const pause_audio_paths = [...Array(11).keys()].map(i => base_audio_dir + pause_dir + (i+1) + audio_ext);

export const trial_audio_paths = (instrument) => {
  return trial_audio[instrument].map(n => base_audio_dir + instrument_dir[instrument] + n + audio_ext);
};

export const part_two_noise_path = base_audio_dir + pause_dir + "noise10sec" + audio_ext
