import AuthorPositionChart from './charts/AuthorPositionChart.js'
import AuthorCount from './charts/AuthorCount.js'
import AuthorCollaborations from './charts/AuthorCollaborations.js'

const loadPage = function () {
  console.log('page loaded')
  let author = document.getElementById('headline')
  console.log('author: ' + author.dataset.name)
  if (!window.dblpExtension) {
    window.dblpExtension = {}
  }
  let url = window.location.href
  const updatedURL = url.replace(/\.html$/, '.xml')
  fetch(updatedURL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.text()
    })
    .then(xmlData => {
      // Handle the XML data here
      const parser = new DOMParser()
      let xmlDoc = parser.parseFromString(xmlData, 'application/xml')

      chrome.runtime.sendMessage({ scope: 'parameterManager', cmd: 'getCloseColleagueParameter' }, ({ parameter }) => {
        let closeColleagueParameter
        if (parameter && parameter !== '') {
          closeColleagueParameter = parameter
        } else {
          closeColleagueParameter = 3
        }
        chrome.runtime.sendMessage({ scope: 'parameterManager', cmd: 'getAcquaintanceParameter' }, ({ parameter }) => {
          let acquaintanceParameter
          if (parameter && parameter !== '') {
            acquaintanceParameter = parameter
          } else {
            acquaintanceParameter = 3
          }
          window.dblpExtension.authorCollaborations = new AuthorCollaborations()
          window.dblpExtension.authorCollaborations.init(xmlDoc, closeColleagueParameter, acquaintanceParameter)
          chrome.runtime.sendMessage({ scope: 'parameterManager', cmd: 'getNumberOfAuthorsParameter' }, ({ parameter }) => {
            let numberOfAuthorsParameter
            if (parameter && parameter !== '') {
              numberOfAuthorsParameter = parameter
            } else {
              numberOfAuthorsParameter = 3
            }
            window.dblpExtension.authorCount = new AuthorCount()
            window.dblpExtension.authorCount.init(xmlDoc, numberOfAuthorsParameter)
            window.dblpExtension.authorPositionChart = new AuthorPositionChart()
            window.dblpExtension.authorPositionChart.init(xmlDoc)
          })
        })
      })
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

window.onload = loadPage
