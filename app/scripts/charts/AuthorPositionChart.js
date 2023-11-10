import Chart from 'chart.js/auto'

class AuthorPositionChart {
  constructor () {
    this.myChart = null
    this.myLargeChart = null
    this.configuration = null
  }

  async init (xmlDoc) {
    try {
      const result = xmlDoc
      const publications = result.querySelectorAll('dblpperson > r')
      const specificAuthor = result.querySelector('dblpperson > person > author').textContent
      const yearCounts = this.countPublicationsByAuthorPosition(publications || [], specificAuthor)
      await this.createChart(yearCounts)
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  countPublicationsByAuthorPosition (publications, specificAuthor) {
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
  async createChart (authorPositionCounts) {
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

    this.configuration = {
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
    normalCanvas.addEventListener('click', () => {
      this.toggleChartModal(normalCanvas, largeCanvas, authorPositionCounts, true) // Use an arrow function here
    })

    // Append normal canvas to the page
    let div = document.getElementById('authorpage-refine')
    let title = document.createElement('p')
    let text = document.createElement('b')
    text.innerHTML = 'Authorship position'
    title.appendChild(text)
    div.insertBefore(normalCanvas, div.firstChild)
    div.insertBefore(title, normalCanvas)

    // Get the context of the normal canvas and create the chart
    const normalCtx = normalCanvas.getContext('2d')
    this.myChart = new Chart(normalCtx, this.configuration)
  }

  toggleChartModal (normalCanvas, largeCanvas, authorPositionCounts, enlarge) {
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
      if (this.myLargeChart) {
        this.myLargeChart.destroy() // Destroy the old chart instance
      }
      // Get the context of the large canvas
      const largeCtx = largeCanvas.getContext('2d')
      // Clone the chart configuration and adjust as needed for the larger size
      let largeConfiguration = JSON.parse(JSON.stringify(this.configuration))
      largeConfiguration.options.maintainAspectRatio = false
      // Adjust other configuration options as needed
      largeConfiguration.options.scales.x.ticks.autoSkip = false
      largeConfiguration.options.scales.x.ticks.maxRotation = 90

      this.myLargeChart = new Chart(largeCtx, largeConfiguration) // Create a new chart instance

      backdrop.appendChild(largeCanvas)
      backdrop.style.display = 'flex'
      normalCanvas.style.display = 'none' // Hide the normal canvas

      backdrop.onclick = () => {
        this.toggleChartModal(normalCanvas, largeCanvas, authorPositionCounts, false)
      }
    } else {
      // Remove modal-specific styles
      largeCanvas.classList.remove('modal-canvas', 'modal-view')

      // Move the normal canvas back into the main page and hide the modal
      backdrop.removeChild(largeCanvas)
      backdrop.style.display = 'none'
      normalCanvas.style.display = 'block' // Show the normal canvas

      // If needed, update the normal chart instance
      this.myChart.update()
    }
  }
}

export default AuthorPositionChart
