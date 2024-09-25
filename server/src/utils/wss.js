import WebSocket from "ws";
import jwt from "jsonwebtoken";
import {jwtConfig, WORKER} from "./constants.js";

export const initWss = (wss) => {
  wss.on('connection', ws => {
    ws.on('message', message => {
      const { type, payload: { token } } = JSON.parse(message);
      if (type !== 'authorization') {
        ws.close();
        return;
      }
      try {
        ws.user = jwt.verify(token, jwtConfig.secret);
      } catch (err) {
        ws.close();
      }
    })
  });
};

export const jobsBroadcast = (wss, userId, data) => {
  if (!wss) {
    return;
  }
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && (userId === client.user._id || client.user.userType === WORKER )) {
      console.log(`broadcast sent to ${client.user.username}`);
      client.send(JSON.stringify(data));
    }
  });
};

export const applicationsBroadcast = (wss, employerId, data) => {
  if (!wss) {
    return;
  }
  wss.clients.forEach(client => {
    // broadcast for the employer who has the job for this application and for all the workers,
    // including the one that saved/deleted application
    if (
        client.readyState === WebSocket.OPEN
        && ( /*userId === client.user._id || */ client.user.userType === WORKER || employerId === client.user._id )
    ) {
      console.log(`broadcast sent to ${client.user.username}`);
      client.send(JSON.stringify(data));
    }
  });
};
