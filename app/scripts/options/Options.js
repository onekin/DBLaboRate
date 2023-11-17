class Options {
  init () {
    document.querySelector('#numberOfAuthorsParameterButton').addEventListener('click', () => {
      let currentValue = document.querySelector('#numberOfAuthorsParameterInput').value
      let messageLabel = document.querySelector('#numberOfAuthorsParameterMessage')
      if (this.checkNumberOfAuthorsParameter(currentValue)) {
        this.setNumberOfAuthorsParameter(currentValue, messageLabel)
      } else {
        messageLabel.innerHTML = 'Invalid parameter'
      }
    })

    document.querySelector('#closeColleagueParameterButton').addEventListener('click', () => {
      let currentValue = document.querySelector('#closeColleagueParameterInput').value
      let messageLabel = document.querySelector('#closeColleagueParameterMessage')
      if (this.checkCloseColleagueParameter(currentValue)) {
        this.setCloseColleagueParameter(currentValue, messageLabel)
      } else {
        messageLabel.innerHTML = 'Invalid parameter'
      }
    })

    // Add event listener for AcquaintanceParameter
    document.querySelector('#acquaintanceParameterButton').addEventListener('click', () => {
      let currentValue = document.querySelector('#acquaintanceParameterInput').value
      let messageLabel = document.querySelector('#acquaintanceParameterMessage')
      if (this.checkAcquaintanceParameter(currentValue)) {
        this.setAcquaintanceParameter(currentValue, messageLabel)
      } else {
        messageLabel.innerHTML = 'Invalid parameter'
      }
    })

    chrome.runtime.sendMessage({ scope: 'parameterManager', cmd: 'getNumberOfAuthorsParameter' }, ({ parameter }) => {
      if (parameter && parameter !== '') {
        document.querySelector('#numberOfAuthorsParameterInput').value = parameter
      } else {
        document.querySelector('#numberOfAuthorsParameterInput').value = 3
        this.setNumberOfAuthorsParameter(3)
      }
    })

    chrome.runtime.sendMessage({ scope: 'parameterManager', cmd: 'getCloseColleagueParameter' }, ({ parameter }) => {
      if (parameter && parameter !== '') {
        document.querySelector('#closeColleagueParameterInput').value = parameter
      } else {
        document.querySelector('#closeColleagueParameterInput').value = 3
        this.setCloseColleagueParameter(3)
      }
    })

    chrome.runtime.sendMessage({ scope: 'parameterManager', cmd: 'getAcquaintanceParameter' }, ({ parameter }) => {
      if (parameter && parameter !== '') {
        document.querySelector('#acquaintanceParameterInput').value = parameter
      } else {
        document.querySelector('#acquaintanceParameterInput').value = 4
        this.setAcquaintanceParameter(4)
      }
    })
  }

  setNumberOfAuthorsParameter (numberOfAuthorsParameter, messageLabel) {
    chrome.runtime.sendMessage({
      scope: 'parameterManager',
      cmd: 'setNumberOfAuthorsParameter',
      data: {numberOfAuthorsParameter: numberOfAuthorsParameter}
    }, ({numberOfAuthorsParameter}) => {
      console.debug('setNumberOfAuthorsParameter ' + numberOfAuthorsParameter)
      if (messageLabel) {
        messageLabel.innerHTML = 'Value saved'
      }
    })
  }

  setCloseColleagueParameter (closeColleagueParameter, messageLabel) {
    chrome.runtime.sendMessage({
      scope: 'parameterManager',
      cmd: 'setCloseColleagueParameter',
      data: {closeColleagueParameter: closeColleagueParameter}
    }, ({closeColleagueParameter}) => {
      console.debug('setCloseColleagueParameter ' + closeColleagueParameter)
      if (messageLabel) {
        messageLabel.innerHTML = 'Value saved'
      }
    })
  }

  setAcquaintanceParameter (acquaintanceParameter, messageLabel) {
    chrome.runtime.sendMessage({
      scope: 'parameterManager',
      cmd: 'setAcquaintanceParameter',
      data: {acquaintanceParameter: acquaintanceParameter}
    }, ({acquaintanceParameter}) => {
      console.debug('setAcquaintanceParameter ' + acquaintanceParameter)
      if (messageLabel) {
        messageLabel.innerHTML = 'Value saved'
      }
    })
  }

  checkNumberOfAuthorsParameter (parameter) {
    if (parameter <= 10) {
      return true
    } else {
      return false
    }
  }

  checkCloseColleagueParameter (parameter) {
    if (parameter <= 10) {
      return true
    } else {
      return false
    }
  }

  checkAcquaintanceParameter (parameter) {
    if (parameter <= 10) {
      return true
    } else {
      return false
    }
  }
}

export default Options
