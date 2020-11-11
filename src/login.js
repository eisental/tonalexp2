import React from 'react';
import { ContinueButton, ComboBox, openFullscreen } from './ui.js';
import { login_text } from './texts.js';

const zero2hundred_options = [...Array(101).keys()].map(i => i);
const one2hundred_options = [...Array(100).keys()].map(i => i+1);

export const LoginScreen = ({next, data}) => {
  const handleContinue = () => {
    openFullscreen();
    data.id = document.getElementById('id_input').value;
    next();
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-8 offset-2 breathing-top text-center">
          {login_text}
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          <br/>
          <label>מספר נבדק: <input type="text" id="id_input"/><br/></label>
          <p hidden>"</p>
          <br/>
          <br/>
          <ContinueButton next={handleContinue}/>
        </div>
      </div>
    </div>
  );
};

export const FormScreen = ({next, data}) => {
  const [error, setError] = React.useState(null);

  const saveData = () => {
    const age = document.getElementById('age').value;
    if (age === "") {
      setError("אנא ענו על כל השאלות.");
      return;
    }

    const genderMaleChecked = document.getElementById('male').checked;
    const genderFemaleChecked = document.getElementById('female').checked;
    if (!genderMaleChecked && !genderFemaleChecked) {
      setError("אנא בחרו מין.");
      return;
    }
    const gender = genderMaleChecked ? 2 : 1;

    const musical_performance_years = document.getElementById('musical_performance_years').value;
    const musical_theory_years = document.getElementById('musical_theory_years').value;
    if (musical_performance_years === "" || musical_theory_years === "") {
      setError("אנא ענו על כל השאלות.");
      return;
    }

    const absoluteYesChecked = document.getElementById('absolute_yes').checked;
    const absoluteNoChecked = document.getElementById('absolute_no').checked;
    if (!absoluteYesChecked && !absoluteNoChecked) {
      setError("אנא ענו על כל השאלות.");
      return;
    }
    const absolute_hearing = absoluteYesChecked ? "yes": "no";

    const musicianYesChecked = document.getElementById('musician_yes').checked;
    const musicianNoChecked = document.getElementById('musician_no').checked;
    if (!musicianYesChecked && !musicianNoChecked) {
      setError("אנא ענו על כל השאלות.");
      return;
    }
    const is_musician = musicianYesChecked ? "yes": "no";
    
    const native_language = document.getElementById('native_language').value;
    const musical_activity = document.getElementById('musical_activity').value;

    const headphones = document.getElementById('headphones').value;
    const computer = document.getElementById('computer').value;
    const additional_devices = document.getElementById('additional_devices').value;
    const location_details = document.getElementById('location_details').value;

    if (native_language.trim() === "" ||
        musical_activity.trim() === "" ||
        headphones.trim() === "" ||
        computer.trim() === "" ||
        location_details.trim() === "") {
      setError("אנא ענו על כל השאלות.");
      return;
    }

    data.age = age;
    data.gender = gender;
    data.musical_performance_years = musical_performance_years;
    data.musical_theory_years = musical_theory_years;
    data.absolute_hearing = absolute_hearing;
    data.is_musician = is_musician;
    data.native_language = native_language;
    data.musical_activity = musical_activity;
    data.headphones = headphones;
    data.computer = computer;
    data.additional_devices = additional_devices;
    data.location_details = location_details;

    next();
  };

  const error_div = error ? (
      <div className="error">
        {error}
      </div>
    ) : null;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8 offset-md-2 breathing-top">
          <p>מלאו בבקשה את השאלון שעל גבי המסך. אנא פנו לנסיין אם שאלה כלשהי אינה ברורה.</p>
          <p>לאחר שסיימתם, הרכיבו אוזניות ולחצו "המשך".</p>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <br/>
          <label>גיל:</label><ComboBox id="age" options={one2hundred_options}/>
          <br/>
          <label>מין:</label>
          <input type="radio" id="female" name="gender" value="female"/><label>נקבה</label>
          <input type="radio" id="male" name="gender" value="male"/><label>זכר</label>
          <br/>
          <label>שנות לימוד ביצוע מוזיקאלי (אם לא למדת - בחר 0):</label>
          <ComboBox id="musical_performance_years" options={zero2hundred_options}/>
          <br/>
          <label>שנות לימוד תיאוריה מוזיקאלית (אם לא למדת - בחר 0):</label>
          <ComboBox id="musical_theory_years" options={zero2hundred_options}/>
          <br/>
          <label>שמיעה אבסולוטית:</label>
          <input type="radio" id="absolute_yes" name="absolute_hearing" value="yes"/><label>כן</label>
          <input type="radio" id="absolute_no" name="absolute_hearing" value="no"/><label>לא</label>
          <br/>
          <label>מוזיקאי:</label>
          <input type="radio" id="musician_yes" name="is_musician" value="yes"/><label>כן</label>
          <input type="radio" id="musician_no" name="is_musician" value="no"/><label>לא</label>
          <br/>
          <label>שפת אם:</label><input type="text" id="native_language"/>
          <br/>
          <label>כלי נגינה או פעילות מוזיקאלית:</label>
          <input type="text" id="musical_activity"/>
          <br/><br/>
          <p>ציינו באיזה ציוד השתמשתם (דייקו ככל האפשר):</p>
          <label>אזניות (חברה ודגם):</label><input type="text" id="headphones" size="50"/><br/>
          <label>מחשב ומסך:</label><input type="text" id="computer" size="50"/><br/>
          <label>מיכשור וציוד נוסף, אם רלבנטי:</label><input type="text" id="additional_devices" size="40"/><br/>
          <label>פרטים על מיקום הניסוי:</label><input type="text" id="location_details" size="50"/><br/>
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          <br/>
          <p>המטלות מנוסחות בלשון זכר, אך מכוונות לכל המגדרים.</p>
          <ContinueButton label="המשך" next={saveData}/>
          {error_div}
        </div>
      </div>
    </div>
  );
};

