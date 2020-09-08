import React from 'react';
import './Experiment.css';
import { LoadingScreen, InfoScreen, ContinueButton, Button } from './ui.js';
import { FirstExperimentBlock } from './FirstExperimentBlock.js';
import { FirstExperimentTrialUI } from './ExperimentUI.js';
import { first_experiment_intro, 
         first_experiment_training_info, 
         first_experiment_training_end } from './texts.js';
import { shuffleArray, randomElement } from './randomize.js';
import { AudioController } from './audio_controller.js';
import { pause_audio_paths, trial_audio_paths } from './audio_mapping.js';
import ls from 'local-storage';

const IntroScreen = ({play, next, done_playing, disable_buttons}) => {
  const second_part = done_playing ? (
    <div className="row">
      <div className="col-8 offset-2">
        <br/>
        {first_experiment_intro[1]}
        <div className="text-center">
          <ContinueButton next={next} disabled={disable_buttons} />
        </div>
      </div>
    </div>
  ) : null;

  return (
      <div className="container">
        <div className="row">
          <div className="col-8 offset-2 breathing-top">
            {first_experiment_intro[0]}
            <div className="text-center">
              <Button label="נסה" onClick={play} disabled={disable_buttons} />
            </div>          
          </div>
        </div>
        {second_part}
      </div>
  );
};

export class FirstExperiment extends React.Component {
  ls_prefix = "first_experiment_"

  steps = {
    INTRO: 1,
    TRAINING_INFO: 2,
    TRAINING: 3,
    EXPERIMENT_INFO: 4,
    EXPERIMENT_BLOCK: 5,
  }

  state = {
    step: 1,
    is_loading: true,
    is_playing: false,
    disable_intro_buttons: false,
  }
  
  constructor({data, next}) {
    super();
    this.next = next;
    this.data = data;

    this.question_order = ls.get(this.ls_prefix + "question_order");
    if (!this.question_order) {
      this.question_order = shuffleArray([0,1,2,3]);
      ls.set(this.ls_prefix + "question_order", this.question_order);
    }

    const all_audio = trial_audio_paths(this.data.cur_instrument);
    console.log("all_audio");
    console.log(all_audio);
    this.audio_srcs = all_audio.concat(pause_audio_paths);
    this.intro_audio = randomElement(all_audio);
    this.training_audio = randomElement(all_audio);

    console.log(`intro: ${this.intro_audio}`);
    console.log(`training: ${this.training_audio}`);

    const cont_step = ls.get(this.ls_prefix + "step");
    if (cont_step) {
      this.state.step = cont_step;
    }

  }

  componentDidMount() {
    const onDoneLoading = () => {
      console.log("Done loading audio files.");
      this.setState({is_loading: false});
      if (this.state.step === this.steps.TRAINING) {
        this.playTraining();
      }
    };

    const onAudioEnded = () => {
      this.setState({is_playing: false});

      if (this.state.step === this.steps.INTRO)
        this.setState({disable_intro_buttons: false,
                       done_playing_intro: true});
      else
        this.setState({is_playing: false});
    };

    this.audio_controller = new AudioController(this.audio_srcs, onDoneLoading, onAudioEnded);
  }

  nextStep = () => {
    const { step } = this.state;
    if (step === this.steps.EXPERIMENT_BLOCK) {
      console.log("Finished first experiment. Data:");
      console.log(this.data);
      this.next();
    }
    else {
      const new_step = step + 1;
    
      ls.set(this.ls_prefix + "step", new_step);
      this.setState({step: new_step});

      if (new_step === this.steps.TRAINING) {
        this.playTraining();
      }
    }
  }

  playIntro = () => {
    this.setState({disable_intro_buttons: true,
                   is_playing: true});
    this.audio_controller.play(this.intro_audio);
  }

  playTraining = () => {
    this.audio_controller.play(this.training_audio);
    this.setState({is_playing: true});
  }
  

  render() {
    const {step, is_loading} = this.state;

    if (is_loading) {
      return <LoadingScreen />;
    }

    switch(step) {
    case this.steps.INTRO:
      return (
        <IntroScreen next={this.nextStep} 
                     key={step} 
                     play={this.playIntro} 
                     done_playing={this.state.done_playing_intro} 
                     disable_buttons={this.state.disable_intro_buttons} />
      );
    case this.steps.TRAINING_INFO:
      return <InfoScreen info={first_experiment_training_info} next={this.nextStep} key={step} />;
    case this.steps.TRAINING:
      return (
        <FirstExperimentTrialUI next={this.nextStep} 
                                replay={this.playTraining} 
                                trial_data={null} 
                                question_order={this.question_order} 
                                key={step} 
                                disable_buttons={this.state.is_playing} />
      );
    case this.steps.EXPERIMENT_INFO:
      return <InfoScreen info={first_experiment_training_end} next={this.nextStep} key={step} />;
    case this.steps.EXPERIMENT_BLOCK:
      return (
        <FirstExperimentBlock next={this.nextStep} 
                              data={this.data} 
                              key={step} 
                              question_order={this.question_order} 
                              audio_controller={this.audio_controller} />
      );
    default:
      return null;
    }
  };
}
