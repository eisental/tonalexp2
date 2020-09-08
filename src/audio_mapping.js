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

const base_audio_dir = "audio/";
const pause_dir = "pause/";
const instrument_dir = {
  [Instrument.PIANO]: "piano/",
  [Instrument.STRINGS]: "strings/",
};

const trial_audio = {
  [Instrument.PIANO]: [
    "CM-FF",
    "DbM-FF",
    "DM-FF",
    "EbM-FF",
    "EM-FF",
    "FM-FF",
    "GbM-FF",
    "GM-FF",
    "AbM-FF",
    "AM-FF",
    "BbM-FF",
    "BM-FF",
  ],

  [Instrument.STRINGS]: [
    "CM_str-FF",
    "DbM_str-FF",
    "DM_str-FF",
    "EbM_str-FF",
    "EM_str-FF",
    "FM_str-FF",
    "GbM_str-FF",
    "GM_str-FF",
    "AbM_str-FF",
    "AM_str-FF",
    "BbM_str-FF",
    "BM_str-FF",
  ],
};

export const pause_audio_paths = [...Array(11).keys()].map(i => base_audio_dir + pause_dir + (i+1) + audio_ext);

export const trial_audio_paths = (instrument) => {
  return trial_audio[instrument].map(n => base_audio_dir + instrument_dir[instrument] + n + audio_ext);
};

export const part_two_noise_path = base_audio_dir + pause_dir + "noise10sec" + audio_ext
