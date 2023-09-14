import LLMManager from './background/LLM_Manager'
import Popup from './popup/Popup'
import _ from 'lodash'
import RecentActivity from './background/RecentActivity'

// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'
/*
chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.tabs.onUpdated.addListener((tabId) => {
  // chrome.action.show(tabId)
})

chrome.tabs.onCreated.addListener(() => {

}) */

class Background {
  constructor () {
    this.tabs = {}
    this.recentActivityTabs = {}
  }

  init () {
    // Initialize LLM manager
    this.llmManager = new LLMManager()
    this.llmManager.init()
    this.recentActivity = new RecentActivity()

    // Initialize page_action event handler
    chrome.action.onClicked.addListener((tab) => {
      // Check if current tab is a local file
      if (tab.url.startsWith('chrome://newtab') || (tab.url.startsWith('chrome-extension://') && tab.url.endsWith('pages/specific/review/recentActivity.html'))) {
        if (this.recentActivityTabs[tab.id]) {
          if (this.recentActivityTabs[tab.id].activated) {
            chrome.tabs.update(tab.id, {url: 'chrome://newtab'}, () => {
              this.recentActivityTabs[tab.id].deactivate()
            })
          } else {
            chrome.tabs.update(tab.id, {url: chrome.runtime.getURL('pages/specific/review/recentActivity.html')}, () => {
              this.recentActivityTabs[tab.id].activate()
            })
          }
        } else {
          chrome.tabs.update(tab.id, {url: chrome.runtime.getURL('pages/specific/review/recentActivity.html')}, () => {
            this.recentActivityTabs[tab.id] = new RecentActivity()
            this.recentActivityTabs[tab.id].activate()
          })
        }
      } else if (tab.url.startsWith('file://')) {
        // Check if permission to access file URL is enabled
        chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
          if (isAllowedAccess === false) {
            chrome.tabs.create({url: chrome.runtime.getURL('pages/filePermission.html')})
          } else {
            if (this.tabs[tab.id]) {
              if (this.tabs[tab.id].activated) {
                this.tabs[tab.id].deactivate()
              } else {
                this.tabs[tab.id].activate()
              }
            } else {
              this.tabs[tab.id] = new Popup()
              this.tabs[tab.id].activate()
            }
          }
        })
      } else {
        if (this.tabs[tab.id]) {
          if (this.tabs[tab.id].activated) {
            this.tabs[tab.id].deactivate()
          } else {
            this.tabs[tab.id].activate()
          }
        } else {
          this.tabs[tab.id] = new Popup()
          this.tabs[tab.id].activate()
        }
      }
    })
    // On tab is reloaded
    chrome.tabs.onUpdated.addListener((tabId) => {
      if (this.tabs[tabId]) {
        if (this.tabs[tabId].activated) {
          this.tabs[tabId].activate()
        }
      } else {
        this.tabs[tabId] = new Popup()
      }
    })

    // Initialize message manager
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.scope === 'extension') {
        if (request.cmd === 'whoiam') {
          sendResponse(sender)
        } else if (request.cmd === 'deactivatePopup') {
          if (!_.isEmpty(this.tabs) && !_.isEmpty(this.tabs[sender.tab.id])) {
            this.tabs[sender.tab.id].deactivate()
          }
          sendResponse(true)
        } else if (request.cmd === 'activatePopup') {
          if (!_.isEmpty(this.tabs) && !_.isEmpty(this.tabs[sender.tab.id])) {
            this.tabs[sender.tab.id].activate()
          }
          sendResponse(true)
        } else if (request.cmd === 'amIActivated') {
          if (this.tabs[sender.tab.id].activated) {
            sendResponse({activated: true})
          } else {
            sendResponse({activated: false})
          }
        }
      }
    })

    // Initialize sidebar when opening a file from the "Recent Activity" tab
    chrome.runtime.onMessage.addListener((request, sender) => {
      if (request.scope === 'RecentActivity' && request.cmd === 'initSidebar') {
        if (this.tabs[sender.tab.id]) {
          if (!this.tabs[sender.tab.id].activated) {
            this.tabs[sender.tab.id].activate()
          }
        } else {
          this.tabs[sender.tab.id] = new Popup()
          this.tabs[sender.tab.id].activate()
        }
      }
    })
  }
}

const background = new Background()
background.init()
