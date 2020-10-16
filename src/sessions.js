import gs from './spreadsheet_io.js';

const SheetNames = {
  SESSIONS: "Sessions",
  SUBJECTS: "Subjects",
}

export const SessionEvent = {
  SESSION_START: "SESSION_START",
  SESSION_CONTINUED: "SESSION_CONTINUED",
  SESSION_END: "SESSION_END",
};

// parse session json data from sheets api into an array of session objects.
export const parseSessions = (data) => {
  let sessions = [];
  data.values.forEach(session_event => {
    let session = {
      id: session_event[0],
      number: session_event[1],
      event: session_event[2],
      time: session_event[3],
    };
    sessions.push(session);
  });
  return sessions;
};

export const writeSessionEvent = (conn, session, event, on_error) => {
  let request_data = Object.assign({event: event,
                                    time: new Date().toString()},
                                    session);
  gs.write(conn, SheetNames.SESSIONS, request_data)
    .catch(on_error);

};

export const readSessionData = (conn) => {
  return gs.read(conn, SheetNames.SESSIONS, "A2:E10000")
    .then(response => response.json())
    .then(parseSessions);
  
};

export const does_user_sheet_exists = (conn, user_id) => {
  return gs.list_sheets(conn)
    .then(sheets => sheets.includes(user_id));
};

export const read_subject_data = (conn, subject_id) => {
  return gs.read(conn, SheetNames.SUBJECTS, "A2:C10000")
    .then(response => response.json())
    .then(data => {
      for (const row of data.values) {
        if (row.length !== 3)
          continue;

        if (row[0] === subject_id) {
          const subject_data = {
            id: row[0],
            first_instrument: row[1],
            first_key: row[2],
          }
          return subject_data;
        }
      }
      return null;
    });
}
