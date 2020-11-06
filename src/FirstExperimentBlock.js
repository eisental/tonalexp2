import React from 'react';
import { FirstExperimentTrialUI } from './ExperimentUI.js';
import ls from 'local-storage';
import { InfoScreen } from './ui.js';
import { trial_audio_paths, pause_audio_paths } from './audio_mapping.js';
import { shuffleArray } from './randomize.js';
import { AudioController } from './audio_controller.js';
import { first_experiment_pause } from './texts.js';

export class FirstExperimentBlock extends React.Component {
  trial_num = 12

  ls_prefix = "first_experiment_block_"

  state = {
    trial_idx: 0,
    on_pause: false,
    is_playing: true,
  }

  constructor({next, data, question_order, audio_controller}) {
    super();
    this.next = next;
    this.data = data;
    this.question_order = question_order;
    this.audio_controller = audio_controller;

    const cont_trial_seq = ls.get(this.ls_prefix + "trial_sequence");

    if (cont_trial_seq) {
      console.log("Continuing first experiment block...");

      this.trial_sequence = cont_trial_seq;
      this.pause_sequence = ls.get(this.ls_prefix + "pause_sequence");
      this.state.trial_idx = ls.get(this.ls_prefix + "trial_idx");
    }
    else {
      const all_audio = trial_audio_paths(this.data.cur_instrument);
      const first_audio = all_audio[this.data.first_key];
      const second_audio = all_audio[this.data.first_key === 5 ? 11 : 5];
        
      const rest_audio = shuffleArray(all_audio).filter(a => a !== first_audio && a !== second_audio);
      this.trial_sequence = [first_audio, second_audio].concat(rest_audio);
      this.pause_sequence = shuffleArray(pause_audio_paths);

      ls.set(this.ls_prefix + "trial_sequence", this.trial_sequence);
      ls.set(this.ls_prefix + "pause_sequence", this.pause_sequence);
      ls.set(this.ls_prefix + "trial_idx", this.state.trial_idx);

      for (let i = 0; i < this.trial_num; i++) {
        const td = {
          experiment_number: 1,
          trial_number: i+1,
          instrument: this.data.cur_instrument,
          audio: this.trial_sequence[i],
        };

        this.data.trials.push(td);
      }

      ls.set("data", this.data);
    }
    
    this.audio_controller.onAudioEnded = () => {
      this.setState({is_playing: false});
    };

    console.log("trial_sequence:");
    console.log(this.trial_sequence);
    console.log("pause sequence:");
    console.log(this.pause_sequence);
  }

  componentDidMount() {
    this.start_time = new Date().getTime();
    this.play_count = 0
    this.playTrial(this.state.trial_idx);
  }

  nextTrial = () => {
    const { trial_idx } = this.state;

    this.setState({on_pause: false});
    this.start_time = new Date().getTime();
    this.play_count = 0
    this.playTrial(trial_idx);
  }

  playTrial = (trial_idx) => {
    this.play_count += 1
    this.audio_controller.play(this.trial_sequence[trial_idx]);
    this.setState({is_playing: true});
  }

  startPause = () => {
    const { trial_idx } = this.state;
    const trial_data = this.data.trials[trial_idx];

    trial_data.RT = new Date().getTime() - this.start_time;
    trial_data.play_count = this.play_count

    ls.set("data", this.data);

    if (trial_idx < this.trial_num - 1) {
      this.setState({on_pause: true,
                     trial_idx: trial_idx + 1,});
      ls.set(this.ls_prefix + "trial_idx", trial_idx + 1);

      const pause_path = this.pause_sequence[trial_idx];
      
      const onDoneLoading = () => {
        pause_audio.play(pause_path);
      };
      
      const onAudioEnded = () => {
        this.setState({enable_pause_continue: true});
      };
      
      const pause_audio = new AudioController([pause_path], onDoneLoading, onAudioEnded);
      this.setState({enable_pause_continue: false});
      
    }
    else {
      this.next();
    }

  }

  render() {
    const { trial_idx, on_pause, enable_pause_continue } = this.state;
    const trial_data = this.data.trials[trial_idx];

    if (on_pause) {
      return (
        <InfoScreen info={first_experiment_pause} 
                    next={this.nextTrial} 
                    key={trial_idx} 
                    continue_disabled={!enable_pause_continue} />
      );
    }
    else {
      return (
        <FirstExperimentTrialUI next={this.startPause} 
                                replay={() => this.playTrial(trial_idx)} 
                                trial_data={trial_data} 
                                question_order={this.question_order} 
                                disable_buttons={this.state.is_playing} 
                                key={trial_idx} />      
      );
    }
  }
}
