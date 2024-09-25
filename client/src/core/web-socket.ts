import {baseUrl, getLogger} from "./index";
import {JobProps} from "../job-components/JobProps";

interface MessageData {
    type: string;
    payload: JobProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, path: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}${path}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}