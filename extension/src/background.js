chrome.sockets.tcp.create({}, function (createInfo) {
  chrome.sockets.tcp.connect(createInfo.socketId,
    "127.0.0.1", 4005, function (socketInfo) {

    });
});