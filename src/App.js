import React from 'react';
import './Experiment.css';
import ls from 'local-storage';
import { LoadingScreen, ErrorScreen } from './ui.js';
import { SessionEvent, does_user_sheet_exists, read_subject_data, writeSessionEvent, readSessionData } from './sessions.js';
import { LoginScreen, FormScreen } from './login.js';
import gs from './spreadsheet_io.js';
import { FirstExperiment } from './FirstExperiment.js';
import { SecondExperiment } from './SecondExperiment.js';
import { other_instrument, str_to_instrument, music_key_to_idx } from './audio_mapping.js';

const FinishScreen = ({data, done_saving}) => {
  return (
    <div className="container">
      <div className="col-md-8 offset-md-2 finish-screen text-center">
        <h1>תודה רבה על השתתפותכם בניסוי</h1>
        <br/>
        <h1>אנא התקשרו לנסיין</h1>
        <p>{done_saving ? "הנתונים נשמרו בהצלחה!" : "אנא המתינו לשמירת הנתונים..."}</p>
      </div>
    </div>
  );
};

class App extends React.Component {
  ls_prefix = "experiment_"

  conn = { // read/write connection details for google spreadsheet.    
    spreadsheet_id: '1C_EqpYYpm_7m6kg7hKM3Hb_KA2klVQoxNdi76ixSff0',
    api_key: 'AIzaSyDHFHbGy_GhEt1Q4FW61YYEX2jk3hZcSoQ',
    write_url: 'https://script.google.com/macros/s/AKfycbzQm7gO2U92R5BIUggG2AMMbxaiGX5ek6Pql374Dbj2hvtzFeaY/exec'
  }

  steps = {
    LOGIN: 1,
    FORM: 2,
    EXPERIMENT1: 3,
    EXPERIMENT2: 4,
    FINISH: 5,
  }

  state = {
    step: 1,
    error: null,
    loading: false,
  }

  data = {
    trials: [],
  }

  nextStep = () => {
    const { step } = this.state;

    this.setStep(step + 1);
  }

  stepWillChange = (step, new_step) => {
    if (step === this.steps.LOGIN) {
      this.handleLogin();
      this.openFullscreen();
    }
    else if (step === this.steps.FORM) {
      ls.set("data", this.data);
    }
    else if (new_step === this.steps.EXPERIMENT2) {
      // Show second experiment only on second session
      if (this.data.session_number === 1)
        return this.steps.EXPERIMENT2 + 1;
    }

    return null;
  }

  setStep = (new_step) => {
    const { step } = this.state;
    if (new_step !== step) {
      const altered_step = this.stepWillChange(step, new_step);
      if (altered_step) {
        new_step = altered_step;
      }

      if (new_step > 2) {
        ls.set(this.ls_prefix + "step", new_step);
      }

      this.setState({step: new_step});
      this.stepChanged(new_step);
    }
  }

  stepChanged = (step) => {
    if (step === this.steps.FINISH) {
      this.data.end_time = new Date().toString();
      this.data.trials.forEach(t => {
        t.id = this.data.id;
        t.session_number = this.data.session_number;
        t.start_time = this.data.start_time;
        t.end_time = this.data.end_time;
        if (this.data.session_number === 1) {
          t.age = this.data.age;
          t.gender = this.data.gender;
          t.musical_performance_years = this.data.musical_performance_years;
          t.musical_theory_years = this.data.musical_theory_years;
          t.absolute_hearing = this.data.absolute_hearing;
          t.is_musician = this.data.is_musician;
          t.native_language = this.data.native_language;
          t.musical_activity = this.data.musical_activity;
          t.headphones = this.data.headphones;
          t.computer = this.data.computer;
          t.additional_devices = this.data.additional_devices;
          t.location_details = this.data.location_details;
        }
      });

      console.log("Saving data...");
      console.log(this.data.trials);
      
      const that = this;
      gs.write(this.conn, this.data.id, this.data.trials)
        .then(res => { 
          that.setState({done_saving: true});
          ls.clear(); 
          writeSessionEvent(this.conn, this.data, SessionEvent.SESSION_END);
        })
        .catch(this.dataSaveError);
    }
  }

  openFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  check_for_subject_sheet = () => {
    return does_user_sheet_exists(this.conn, this.data.id)
      .then(sheet_exists => {
        if (sheet_exists) {
          return true;
        }
        else {
          this.setState({error: "גיליון עבור נבדק " + this.data.id + " לא קיים במערכת.",
                         loading: false});
          return false;
        }
      })
      .catch(err => {
        this.setState({error: "לא ניתן להתחבר. בדקו את חיבור האינטרנט ונסו שוב. " + err});
      });
  }

  handleLogin() {
    this.setState({loading: true});

    // first look for the subject id's sheet.
    this.check_for_subject_sheet()
      .then(found_sheet => {
        if (found_sheet) {
          // then read the subject entry in the Subjects sheet.
          read_subject_data(this.conn, this.data.id)
            .then(subject_data => {
              if (subject_data === null) {
                this.setState({error: "לא קיימים פרטים עבור נבדק " + this.data.id + " במערכת.", 
                               loading: false});
                return;
              }

              this.data.first_instrument = str_to_instrument(subject_data.first_instrument);
              this.data.first_key = music_key_to_idx[subject_data.first_key];
              
              if (this.data.first_instrument === null || 
                  this.data.first_key === undefined) {
                this.setState({error: "התרחשה שגיאה בעת קריאת נתונים עבור נבדק " + this.data.id + ".",
                               loading: false});
                return;
              }

              // finally read the session sheet and look for the last entry for this subject
              readSessionData(this.conn)
                .then(sessions => {
                  const previous_sessions = sessions.filter(e => e.id === this.data.id);
                  if (previous_sessions.length === 0) {
                    // First session. Not continued!
                    this.startNewSession(1);
                  } 
                  else {
                    // Not first session or continued session.
                    const last_session = previous_sessions[previous_sessions.length-1];
                    const last_session_number = parseInt(last_session.number);
                    if (last_session.event !== SessionEvent.SESSION_END) {
                      // Continue session
                      this.continueSession(last_session_number);
                    }
                    else {
                      // Last session ended. 
                      if (last_session_number === 2) {
                        this.setState({error: "נבדק " + this.data.id + " סיים את הניסוי.",
                                       loading: false});
                      }
                      else {
                        // Second session
                        this.startNewSession(2);
                      }
                    }
                  }
                });              
            });
        }
      });
  }

  startNewSession(number) {
    this.data.session_number = number;
    writeSessionEvent(this.conn, this.data, SessionEvent.SESSION_START);
    this.setState({loading: false});

    this.data.cur_instrument = (number === 1 ? 
                                this.data.first_instrument :
                                other_instrument(this.data.first_instrument));

    console.log("Starting new session. Clearing local storage");
    ls.clear();
    ls.set("data", this.data);

    if (number === 2) {
      this.setStep(this.steps.FORM + 1);
    }
  }

  continueSession(number) {
    // try to recover from local storage
    const cont_data = ls.get("data");

    if (cont_data && cont_data.id === this.data.id) {
      console.log("Loading from local storage...");
      
      this.data = cont_data;
      
      writeSessionEvent(this.conn, this.data, SessionEvent.SESSION_CONTINUED);
      this.setState({loading: false});
      
      const cont_step = ls.get(this.ls_prefix + "step");

      if (cont_step) {
        this.setStep(cont_step);      
      }
    }
    else {
      this.startNewSession(number);
    }
  }

  dataSaveError(response) {
    alert("Error while saving data: " + response);
  }

  componentDidMount() {
    this.data.start_time = new Date().toString();
  }

  render() {
    const { step, loading, error } = this.state;

    if (error) {
      return <ErrorScreen error={this.state.error} />;
    } 
    else if (loading) {
      return <LoadingScreen />;
    } 
    else {
      switch(step) {
      case this.steps.LOGIN: 
        return <LoginScreen next={this.nextStep} data={this.data} key={step} />;
      case this.steps.FORM:
        return <FormScreen next={this.nextStep} data={this.data} key={step} />;
      case this.steps.EXPERIMENT1:
        return <FirstExperiment data={this.data} next={this.nextStep} key={step}/>;
      case this.steps.EXPERIMENT2:
        return <SecondExperiment data={this.data} next={this.nextStep} key={step}/>;
      case this.steps.FINISH:
        return <FinishScreen done_saving={this.state.done_saving} key={step} />;
      default:
        return null;
      }
    }
  }
}

export default App;
