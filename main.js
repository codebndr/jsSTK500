chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('STK500.html', {
    bounds: {
      width: 400,
      height: 400
    }
  });
});
