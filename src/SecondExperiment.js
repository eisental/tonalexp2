import React from 'react';
import './Experiment.css';
import { LoadingScreen, InfoScreen } from './ui.js';
import { second_experiment_intro, 
         second_experiment_pause } from './texts.js';
import { SecondExperimentTrialUI } from './ExperimentUI.js';
import { Instrument, trial_audio_paths, part_two_noise_path } from './audio_mapping.js';
import { shuffleArray } from './randomize.js';
import { AudioController } from './audio_controller.js';
import ls from 'local-storage';

export class SecondExperiment extends React.Component {
  num_trials = 24

  ls_prefix = "second_experiment_"

  state = {
    trial_idx: 22,
    show_info: true,
    on_pause: false,
    is_playing: true,
  }

  constructor({data, next, audio_controller}) {
    super();
    this.next = next;
    this.data = data;

    const cont_seq = ls.get(this.ls_prefix + "sequence");
    
    if (cont_seq) {
      console.log("Continuing second experiment...");

      this.sequence = cont_seq;
      this.state.trial_idx = ls.get(this.ls_prefix + "trial_idx");
      this.state.show_info = ls.get(this.ls_prefix + "show_info");
    }
    else {
      const piano_trials = trial_audio_paths(Instrument.PIANO).map(p => [p, Instrument.PIANO]);
      const strings_trials = trial_audio_paths(Instrument.STRINGS).map(p => [p, Instrument.STRINGS]);
      this.sequence = shuffleArray(piano_trials.concat(strings_trials));

      ls.set(this.ls_prefix + "sequence", this.sequence);
      ls.set(this.ls_prefix + "trial_idx", this.state.trial_idx);
      ls.set(this.ls_prefix + "show_info", this.state.show_info);
    }
    const onAudioEnded = () => {
      this.setState({is_playing: false});
    };

    const onDoneLoading = () => {
      this.setState({is_loading: false});
    };

    const audio_files = this.sequence.map(t => t[0]).concat([part_two_noise_path]);
    this.audio_controller = new AudioController(audio_files, onDoneLoading, onAudioEnded);
    console.log("Second experiment sequence:");
    console.log(this.sequence);
  }

  componentDidMount() {
    const added_trials = ls.get(this.ls_prefix + "added_trials");
    if (!added_trials) {
      console.log("Adding trials");
      this.first_trial_data = this.data.trials.length;
      for (let i = 0; i < this.num_trials; i++) {
        const td = {
          experiment_number: 2,
          trial_number: i+1,
          instrument: this.sequence[i][1],
          audio: this.sequence[i][0],
        };

        this.data.trials.push(td);
      }
      ls.set("data", this.data);
      ls.set(this.ls_prefix + "added_trials", true);
    }
    else {
      this.first_trial_data = this.data.trials.length - this.num_trials;
    }

    if (!this.state.show_info) {
      this.startTrials();
    }
  }

  nextTrial = () => {
    this.setState({on_pause: false});
    this.start_time = new Date().getTime();
    this.play_count = 0
    this.playTrial(this.state.trial_idx);
  }

  startTrials = () => {
    this.setState({show_info: false});
    this.start_time = new Date().getTime();
    this.play_count = 0
    this.playTrial(this.state.trial_idx);

    ls.set(this.ls_prefix + "show_info", false);
  }

  startPause = () => {
    const { trial_idx } = this.state;
    const trial_data = this.data.trials[trial_idx];

    trial_data.RT = new Date().getTime() - this.start_time;
    trial_data.play_count = this.play_count
    ls.set("data", this.data);

    if (trial_idx < this.num_trials - 1) {
      this.setState({on_pause: true,
                     trial_idx: trial_idx + 1,
                     is_playing: true});

      this.audio_controller.play(part_two_noise_path);
    }
    else {
      this.next();
    }
  }
  
  playTrial = (trial_idx) => {
    this.play_count += 1
    this.audio_controller.play(this.sequence[trial_idx][0]);
    this.setState({is_playing: true});
  }

  render() {
    const { trial_idx, show_info, is_loading, is_playing, on_pause } = this.state;
    if (is_loading) {
      return <LoadingScreen/>;
    }
    else if (show_info) {
      return (
        <InfoScreen info={second_experiment_intro} next={this.startTrials} />
      );
    }
    else if (on_pause) {
      return (
        <InfoScreen info={second_experiment_pause} 
                    next={this.nextTrial}
                    key={trial_idx}
                    continue_disabled={is_playing} />
      );
    }
    else {
      const trial_data = this.data.trials[this.first_trial_data + trial_idx];

      return (
        <SecondExperimentTrialUI next={this.startPause}
                                 replay={() => this.playTrial(trial_idx)}
                                 trial_data={trial_data}
                                 disable_buttons={is_playing} />
      );
    }
  }
}
