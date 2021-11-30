import React from 'react';
import ReactDOM from 'react-dom';

import Popup from './popup/Popup';

chrome.tabs.query({ currentWindow: true, active: true }, () => {
  ReactDOM.render(
    <Popup />,
    document.getElementById('app')
  );
});


const views = chrome.extension.getViews({ type: "popup" });


if (views.length) {
  chrome.tabs.create({ url: window.location.href });
} else { }