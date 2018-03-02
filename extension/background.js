class Storage {
  constructor() {
    this.storage = chrome.storage;

    this.schema = {
      throttlingEnabled: 'throttlingEnabled',
      applyToAllTabs: 'applyToAllTabs'
    }
  }

  set(key, value) {
    const data = {};
    data[key] = value;
    return new Promise((resolve, reject) => {
      this.storage.sync.set(data, () => {
        if (chrome.runtime.error) {
          reject('Value was not set');
        }

        resolve();
      });
    })
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.storage.sync.get(key, value => {
        if (chrome.runtime.error) {
          reject('Value can\'t be get');
        }
        resolve(value);
      });
    });
  }

  onChanged(cb) {
    this.storage.onChanged.addListener(cb);
  }
}

class Debugger {
  constructor() {
    this.debugger = chrome.debugger;
  }

  sendCommand(target, method, commandParams = null) {
    return new Promise((resolve, reject) => {
      this.debugger.sendCommand(target, method, commandParams, () => {
        if (chrome.runtime.error) {
          reject(chrome.runtime.lastError);
        }

        resolve();
      });
    });
  }

  attach(target, requiredVersion) {
    return new Promise((resolve,reject) => {
      this.debugger.attach(target, requiredVersion, () => {
        if (chrome.runtime.error) {
          reject(chrome.runtime.lastError);
        }

        resolve();
      });
    });
  }
}


class Tabs {
  constructor() {
    this.tabs = chrome.tabs;
  }

  getOpenedTabs() {
    return new Promise(resolve => {
      this.tabs.query({}, resolve);
    });
  }

  getCurrentTab() {
    const queryInfo = {
      active: true,
      currentWindow: true
    };

    return new Promise(resolve => {
      chrome.tabs.query(queryInfo, (tabs) => {
        resolve(tabs[0]);
      });
    });
  }

  onCreated(cb) {
    this.tabs.onCreated.addListener(cb);
  }
}

const storage = window.storage = new Storage();
const chromeDebugger = window.chromeDebugger = new Debugger();
const chromeTabs = window.chromeTabs = new Tabs();

chrome.debugger.onDetach.addListener(() => {
  storage.set(storage.schema.throttlingEnabled, false);
});
