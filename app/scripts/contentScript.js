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
      window.dblpExtension.authorCollaborations = new AuthorCollaborations()
      window.dblpExtension.authorCollaborations.init(xmlDoc)
      window.dblpExtension.authorCount = new AuthorCount()
      window.dblpExtension.authorCount.init(xmlDoc)
      window.dblpExtension.authorPositionChart = new AuthorPositionChart()
      window.dblpExtension.authorPositionChart.init(xmlDoc)
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

/* Main function to handle the flow
async function loadChart (xmlDoc) {
  // Replace with the path to your XML file
  try {
    const result = xmlDoc
    const publications = result.querySelectorAll('dblpperson > r')
    const specificAuthor = result.querySelector('dblpperson > person > author').textContent
    const yearCounts = countPublicationsByAuthorPosition(publications || [], specificAuthor)
    await createChart(yearCounts)
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

function countPublicationsByAuthorPosition (publications, specificAuthor) {
  const authorPositionCounts = {
    firstAuthor: {},
    secondAuthor: {},
    moreThanThirdAuthor: {}
  }

  Array.from(publications).forEach(publication => {
    let authors = Array.from(publication.children[0].children).filter(element => element.tagName === 'author')
    // Ensure that authors is always an array
    if (!Array.isArray(authors)) {
      authors = [authors] // Wrap the object in an array
    }
    let year = Array.from(publication.children[0].children).find(element => element.tagName === 'year')
    if (year) {
      year = year.innerHTML
      // Find the position of the specific author
      const authorPosition = authors.findIndex(author => author.lastChild.data === specificAuthor || author.innerHTML === specificAuthor) + 1 // Adjust for 0-based index
      // Categorize by author position
      if (authorPosition === 1) {
        authorPositionCounts.firstAuthor[year] = (authorPositionCounts.firstAuthor[year] || 0) + 1
      } else if (authorPosition === 2) {
        authorPositionCounts.secondAuthor[year] = (authorPositionCounts.secondAuthor[year] || 0) + 1
      } else if (authorPosition > 2) {
        authorPositionCounts.moreThanThirdAuthor[year] = (authorPositionCounts.moreThanThirdAuthor[year] || 0) + 1
      }
    }
  })

  return authorPositionCounts
}

// Function to create and save the chart
async function createChart (authorPositionCounts) {
  const sortedYears = Object.keys({
    ...authorPositionCounts.firstAuthor,
    ...authorPositionCounts.secondAuthor,
    ...authorPositionCounts.moreThanThirdAuthor
  }).sort((a, b) => a - b)
  const datasets = [
    {
      label: 'First Author',
      data: sortedYears.map(year => authorPositionCounts.firstAuthor[year] || 0),
      backgroundColor: 'rgba(255, 99, 132)',
      stack: 'stacked' // This indicates that the bar should be stacked
    },
    {
      label: 'Second Author',
      data: sortedYears.map(year => authorPositionCounts.secondAuthor[year] || 0),
      backgroundColor: 'rgba(54, 162, 235)',
      stack: 'stacked' // This indicates that the bar should be stacked
    },
    {
      label: 'More Than Third Author',
      data: sortedYears.map(year => authorPositionCounts.moreThanThirdAuthor[year] || 0),
      backgroundColor: 'rgba(255, 206, 86)',
      stack: 'stacked' // This indicates that the bar should be stacked
    }
  ]

  configuration = {
    type: 'bar',
    data: {
      labels: sortedYears,
      datasets: datasets
    },
    options: {
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          align: 'start'
        }
      }
    }
  }

  // Create normal canvas element
  const normalCanvas = document.createElement('canvas')
  normalCanvas.id = 'myChart'
  normalCanvas.width = 800
  normalCanvas.height = 600

  // Create large canvas element
  const largeCanvas = document.createElement('canvas')
  largeCanvas.id = 'myLargeChart'
  largeCanvas.width = 1100 // Example large size, adjust as needed
  largeCanvas.height = 700 // Example large size, adjust as needed

  // Ensure this event handler is added in the createChart function after creating the chart instance
  normalCanvas.addEventListener('click', function () {
    toggleChartModal(normalCanvas, largeCanvas, authorPositionCounts, true) // Pass the chart instance to the toggle function
  })

  // Append normal canvas to the page
  let div = document.getElementById('authorpage-refine')
  div.insertBefore(normalCanvas, div.firstChild)

  // Get the context of the normal canvas and create the chart
  const normalCtx = normalCanvas.getContext('2d')
  myChart = new Chart(normalCtx, configuration)
}

function toggleChartModal (normalCanvas, largeCanvas, authorPositionCounts, enlarge) {
  let backdrop = document.querySelector('.modal-backdrop')
  if (!backdrop) {
    backdrop = document.createElement('div')
    backdrop.classList.add('modal-backdrop')
    backdrop.style.display = 'none' // Initially hidden
    document.body.appendChild(backdrop)
  }

  if (enlarge) {
    // Apply modal-specific styles
    largeCanvas.classList.add('modal-canvas', 'modal-view')

    // Always remove the old chart and create a new one for consistency
    if (myLargeChart) {
      myLargeChart.destroy() // Destroy the old chart instance
    }
    // Get the context of the large canvas
    const largeCtx = largeCanvas.getContext('2d')
    // Clone the chart configuration and adjust as needed for the larger size
    let largeConfiguration = JSON.parse(JSON.stringify(configuration))
    largeConfiguration.options.maintainAspectRatio = false
    // Adjust other configuration options as needed
    largeConfiguration.options.scales.x.ticks.autoSkip = false
    largeConfiguration.options.scales.x.ticks.maxRotation = 90

    myLargeChart = new Chart(largeCtx, largeConfiguration) // Create a new chart instance

    backdrop.appendChild(largeCanvas)
    backdrop.style.display = 'flex'
    normalCanvas.style.display = 'none' // Hide the normal canvas

    backdrop.onclick = function () {
      toggleChartModal(normalCanvas, largeCanvas, authorPositionCounts, false)
    }
  } else {
    // Remove modal-specific styles
    largeCanvas.classList.remove('modal-canvas', 'modal-view')

    // Move the normal canvas back into the main page and hide the modal
    backdrop.removeChild(largeCanvas)
    backdrop.style.display = 'none'
    normalCanvas.style.display = 'block' // Show the normal canvas

    // If needed, update the normal chart instance
    myChart.update()
  }
} */

window.onload = loadPage
