import React from 'react';
import { questions_text } from './texts.js';
import { Button, ContinueButton, ComboBox } from './ui.js';
import { second_experiment_question, 
         second_experiment_hear_again } from './texts.js';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './confirm-alert.css';

const numbered_options = [...Array(9).keys()].map(i => i+1);
const taste_options = ["מתוק", "חמוץ", "מר", "מלוח"];

class XYselection extends React.Component {
  constructor({width, height, disabled, onUpdate}) {
    super();
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.ctx = this.canvasRef.current.getContext('2d');
    this.draw_axes();
  }
  
  draw_axes = () => {
    const {width, height} = this.props;
    const ctx = this.ctx;

    ctx.fillStyle = 'black';
    ctx.lineWidth = '4';
    ctx.strokeRect(2, 2, width-4, height-4);
    const c_x = width / 2;
    const c_y = height / 2;

    ctx.beginPath();
    ctx.moveTo(c_x, 0);
    ctx.lineTo(c_x, height);
    ctx.moveTo(0, c_y);
    ctx.lineTo(width, c_y);
    ctx.closePath();
    ctx.stroke();
  }
  
  canvas_click = (e) => {
    const {onUpdate, disabled, width, height} = this.props;
    if (disabled)
      return;

    const rect = this.canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const x = (px - width/2) / (width/2);
    const y = -(py - height/2) / (height/2);
    
    this.ctx.clearRect(0, 0, width, height);
    this.draw_axes();

    this.ctx.beginPath();
    this.ctx.arc(px, py, 8, 0, 2*Math.PI);
    this.ctx.fillStyle = "#007bff";
    this.ctx.fill();

    const confirm_update = () => {
      this.prev_px = px;
      this.prev_py = py;

      if (onUpdate)
        onUpdate(x, y);      
    };

    const cancel_update = () => {
      this.ctx.clearRect(0, 0, width, height);
      this.draw_axes();

      if (this.prev_px) {
        this.ctx.beginPath();
        this.ctx.arc(this.prev_px, this.prev_py, 8, 0, 2*Math.PI);
        this.ctx.fillStyle = "#007bff";
        this.ctx.fill();
      }
    };
    
    confirmAlert({
      message: "האם את/ה בטוח/ה?",
      buttons: [
        { label: "כן", onClick: confirm_update },
        { label: "לא", onClick: cancel_update }
      ],
      onClickOutside: cancel_update,
      closeOnEscape: false
    });
  }

  render() {
    const {width, height} = this.props;

    return (
      <React.Fragment>
        <div className="text-center xy-selection">
          <p className="yaxis-label">מלא אנרגיה</p>
          <span className="xaxis-label">רגשות חיוביים</span>
          <canvas className="xycanvas" ref={this.canvasRef} width={width} height={height} onClick={this.canvas_click}/>
          <span className="xaxis-label">רגשות שליליים</span>
          <p className="yaxis-label">חסר אנרגיה</p>
        </div>

      </React.Fragment>
    );
  }
};

export const FirstExperimentTrialUI = ({next, replay, trial_data, question_order, disable_buttons}) => {
  const [error, setError] = React.useState(null);
  const [emotion_value, setEmotion] = React.useState(null);
  const [energy_value, setEnergy] = React.useState(null);

  const ordered_questions = question_order.map(i => (
    <div className="trial-question" key={i}>
      <label htmlFor={"ordered"+i}>{questions_text.ordered_questions[i]}</label>
      <ComboBox id={"ordered"+i} options={numbered_options} disabled={disable_buttons} />
    </div>
  ));

  const xy_click = (x, y) => {
    setEmotion(x);
    setEnergy(y);
  };

  const handle_next = () => {
    const first_answer = document.getElementById("first_question").value;
    if (first_answer === "") {
      setError("אנא ענו על כל השאלות.");
      return;
    }

    const ordered_answers = Array(ordered_questions.length);

    for (let i=0; i<ordered_questions.length; i++) {
      const answer = document.getElementById("ordered"+i).value;
      if (answer === "") {
        setError("אנא ענו על כל השאלות.");
        return;
      }
      ordered_answers[i] = answer;
    }

    if (emotion_value===null || energy_value===null) {
      setError("אנא ענו על כל השאלות.");
      return;
    }

    const taste_answer = document.getElementById("taste_question").value;
    if (taste_answer === "") {
      console.log("taste");
      setError("אנא ענו על כל השאלות.");
      return;
    }

    if (trial_data !== null) {
      Object.assign(trial_data, {
        time: new Date().toString(),
        question_1: first_answer,
        question_2: ordered_answers[0],
        question_3: ordered_answers[1],
        question_4: ordered_answers[2],
        question_5: ordered_answers[3],
        emotion: emotion_value,
        energy: energy_value,
        taste: taste_answer,
      });
    }

    next();
  };

  const error_div = error ? (
      <div className="error">
        {error}
      </div>
    ) : null;

  return (
    <div className="container">
      <div className="row tiny-breathing-top">
        <div className="col-12">
          <div className="trial-question">
            <label htmlFor="first_question">{questions_text.first_question}</label>
            <ComboBox id="first_question" options={numbered_options} disabled={disable_buttons}/>          
          </div>

          {ordered_questions}

          <div className="trial-question row">
            <div className="col-6 xy-label">
              {questions_text.xy_question}
            </div>
            <div className="col-6">
              <XYselection id="energy_emotion_question" width={220} height={220} onUpdate={xy_click} disabled={disable_buttons}/>
            </div>
          </div>

          <div className="trial-question">
            <label htmlFor="taste_question">{questions_text.taste_question}</label>
            <ComboBox id="taste_question" options={taste_options} disabled={disable_buttons}/>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-2 offset-md-3 text-center">
          <Button label="השמע שוב" onClick={replay} disabled={disable_buttons}/>
        </div>
        <div className="col-md-2 offset-md-2 text-center">
          <ContinueButton next={handle_next} disabled={disable_buttons}/>
        </div>
      </div>
      <div className="row">
        <div className="col-12 text-center">
          {error_div}
        </div>
      </div>
    </div>
  );
};

export const SecondExperimentTrialUI = ({next, replay, trial_data, disable_buttons}) => {
  const [error, setError] = React.useState(null);

  const handle_next = () => {
    const answer = document.getElementById("question").value;
    if (answer === "") {
      setError("אנא ענו על השאלה.");
      return;
    }

    Object.assign(trial_data, {
      time: new Date().toString(),
      musical_question: answer,
    });

    next();
  };

  const error_div = error ? (
    <div className="error">
      {error}
    </div>
  ) : null;

  return (
    <div className="container">
      <div className="row breathing-top">
        <div className="col-8 offset-2">
          {second_experiment_question}
          <br/>
          <div className="text-center second-experiment-question">
            <ComboBox id="question" options={numbered_options} disabled={disable_buttons}/>
          </div>
          <br/>
          {second_experiment_hear_again}
          <br/>
        </div>
      </div>
      <div className="row">
        <div className="col-md-2 offset-md-3 text-center">
          <Button label="השמע שוב" onClick={replay} disabled={disable_buttons}/>
        </div>
        <div className="col-md-2 offset-md-2 text-center">
          <ContinueButton next={handle_next} disabled={disable_buttons}/>
        </div>
      </div>
      <div className="row">
        <div className="col-12 text-center">
          {error_div}
        </div>
      </div>
    </div>
  );
};
