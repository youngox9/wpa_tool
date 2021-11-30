import React, { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Popper from './components/Popper';

const URL = '127.0.0.1';
const SOCKET_PORT = '8887';


const Container = styled.div`
  width: 250px;
  background-color: #343a40;
  border-radius: 4px;
  padding: 12px;
  color: white;
  box-shadow: 1px 2px 10px rgba(170, 170, 170, 0.25);
  font-size: 8px;
  line-height: 1;
  h2 {
    font-size: 1.2rem;
    margin: 0;
    margin-bottom: 1rem;
    color: #666;
  }

  hr {
    margin: 12px 0;
  }
`;


const Row = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const Col = styled.div`
  /* flex: 0 100%; */
  flex: ${({ size = '100' }) => `0 ${size}%`};
  max-width: ${({ size = '100' }) => `${size}%`};
  padding: 6px 12px;
  p {
    color: white;
    text-align: left;
    margin: 0;
    word-break: break-all;
  }
  button {
    background-color: rgb(255 255 255);
    width: 100%;
    height: 100%;
    outline: none;
    background-color: rgb(228 128 32);
    border: none;
    height: 32px;
    color: rgb(255 255 255);
    font-weight: bold;
    font-size: 16px;
    &:disabled {
      opacity: 0.6;
    }
  }
`;


const WHITE_LIST = ['localhost', 'trial.mycloudhospitality.com'];

const Popup = () => {
  const [data, setData] = useState({});
  const [uid, setUid] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  const popperEl = useRef(null);


  if (!WHITE_LIST.includes(window.location.hostname)) {
    return null;
  }
  const {
    sendMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket(`ws://${URL}:${SOCKET_PORT}`, {
    shouldReconnect: () => {
      return readyState === ReadyState.CLOSED;
    },
    reconnectInterval: 1000,
    reconnectAttempts: 999
  });


  useEffect(() => {
    if (lastJsonMessage) {
      console.log('[EXTENSTION] GET NEW MSG >>>>>', lastJsonMessage);
      setData(lastJsonMessage.data);
    }
  }, [JSON.stringify(lastJsonMessage)]);


  useEffect(() => {
    document.body.addEventListener('click', (e) => {
      const el = e.target;
      if (el.nodeName === 'INPUT' || el.nodeName === 'BUTTON') {
        const $el = $(el);
        const id = $el.attr('id');
        if (id && popperEl?.current) {
          popperEl.current.setShowPopover(true);
        }
        if (id) {
          setUid(id);
          onCapture(id);
          console.log('onCapture >>>>>', id);
        }
      }
    });
  }, []);


  useEffect(() => {
    if (uid) {
      const val = data?.[uid] || '';
      setFieldValue(val);
    }
  }, [JSON.stringify(data), uid]);


  async function onCapture(keyName) {
    const tmp = {
      type: 'capture',
      data: { key: keyName }
    };
    sendMessage(JSON.stringify(tmp));
  }

  async function onSend() {
    if (fieldValue) {
      const $el = $(`#${uid}`);
      $el.val(fieldValue);
    }
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <Popper
      ref={popperEl}
      onChange={(val) => {
        if (val) {
          sendMessage(JSON.stringify({}));
        }
      }}
      component={({ setOpen }) => (
        <Container>
          connect status: {connectionStatus}
          <hr />
          <Row >
            <Col size={40}>
              <p>ID</p>
            </Col>
            <Col size={60}>
              <p>{uid}</p>
            </Col>
          </Row>
          <Row>
            <Col size={40}>
              <p>Value</p>
            </Col>
            <Col size={60}>
              <p>{fieldValue || 'Waiting...'}</p>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <button
                onClick={() => { onSend(); setOpen(false); }}
                disabled={!fieldValue}
              >
                Fill Value
              </button>
            </Col>
          </Row>
        </Container>
      )}
    />
  );
};

export default Popup;
