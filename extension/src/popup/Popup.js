import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';
import './style.scss';

const URL = '127.0.0.1';
const SOCKET_PORT = '8887';
const PORT = '8888';


const Container = styled.div`
  width: 800px;
  display: block;
  margin: 0 auto;
  padding: 12px;
  /* background-color: black; */
  h2 {
    font-size: 1.2rem;
    margin: 0;
    margin-bottom: 1rem;
    color: #666;
  }
  p {
    word-break: break-all;
  }
`;

let timer;
const Popup = () => {

  const [data, setData] = useState({});
  const [id, setId] = useState();

  const {
    lastJsonMessage,
    sendMessage,
    lastMessage,
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
      const { data } = lastJsonMessage;
      console.log(data);
      setData(data);
    }
  }, [JSON.stringify(lastJsonMessage)]);

  // useEffect(() => {
  //   if (data) {
  //     onSubmit()
  //   }
  // }, [JSON.stringify(data)]);

  async function onSubmit(d = data) {
    const tmp = {
      type: 'save',
      data: d
    };
    sendMessage(JSON.stringify(tmp));
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  function onChange(k, e) {
    const temp = { ...data, [k]: e.target.value };
    setData(temp);
    clearTimeout(timer)
    timer = setTimeout(() => {
      onSubmit(temp);
    }, 300);
  }

  function onClear() {
    const tmp = {
      type: 'clear',
    };
    sendMessage(JSON.stringify(tmp));
  }


  return (
    <Container>
      <h2>WPA 行為模擬器</h2>
      <h5>Socket Status: {connectionStatus}</h5>
      <Grid container spacing={2}>
        {
          Object.keys(data).map((k) => {
            const val = data[k];
            return (
              <>
                <Grid item xs={2}>
                  <p>{k}</p>
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    label="Value"
                    variant="outlined"
                    size="small"
                    style={{ width: '100%' }}
                    value={val}
                    onChange={(e) => onChange(k, e)}
                  />
                </Grid>
              </>
            )
          })
        }
      </Grid>

      <hr />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button variant="contained" style={{ width: '100%' }} onClick={onSubmit}>Submit</Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" style={{ width: '100%' }} onClick={onClear}>Clear</Button>
        </Grid>
      </Grid>

    </Container >
  );
};

export default Popup;
