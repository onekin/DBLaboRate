import Chart from 'chart.js/auto'

class AuthorCollaborations {
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
      const categorizedCoAuthors = this.countCoAuthors(publications || [], specificAuthor)
      await this.createChart(categorizedCoAuthors)
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  countCoAuthors(publications, specificAuthor) {
    const publicationsByCoAuthors = {}
    const coAuthorsByYear = {}

    Array.from(publications).forEach(publication => {
      let authors = Array.from(publication.children[0].children)
        .filter(element => element.tagName === 'author')
        .map(author => author.textContent);
      let yearElement = Array.from(publication.children[0].children)
        .find(element => element.tagName === 'year');
      if (yearElement) {
        let year = parseInt(yearElement.innerHTML);
        authors = authors.filter(authorName => authorName !== specificAuthor);
        authors.forEach(authorName => {
          if (!publicationsByCoAuthors[authorName]) {
            publicationsByCoAuthors[authorName] = {};
          }
          if (!publicationsByCoAuthors[authorName][year]) {
            publicationsByCoAuthors[authorName][year] = [];
          }
          publicationsByCoAuthors[authorName][year].push(publication);

          if (!coAuthorsByYear[year]) {
            coAuthorsByYear[year] = new Set();
          }
          coAuthorsByYear[year].add(authorName);
        });
      }
    });

    // Define helper functions for categorization
    const isCloseColleague = (coAuthor, year) => {
      const years = Object.keys(publicationsByCoAuthors[coAuthor]).map(Number);
      return years.filter(y => y >= year - 3 && y <= year).length >= 3;
    }

    const isAcquaintance = (coAuthor, year) => {
      const years = Object.keys(publicationsByCoAuthors[coAuthor]).map(Number);
      let count = 0;
      for (let y = year - 4; y <= year; y++) {
        if (years.includes(y)) {
          count++;
          if (count >= 3) return true;
        }
      }
      return false;
    }

    const isCollaborator = (coAuthor, year) => {
      const years = Object.keys(publicationsByCoAuthors[coAuthor]).map(Number);
      return Math.min(...years) === parseInt(year);
    }

    // Categorize each co-author for each year
    const categorizedCoAuthors = {};
    Object.keys(coAuthorsByYear).forEach(year => {
      categorizedCoAuthors[year] = { closeColleague: 0, acquaintance: 0, collaborator: 0 };
      coAuthorsByYear[year].forEach(coAuthor => {
        if (isCloseColleague(coAuthor, year)) {
          categorizedCoAuthors[year].closeColleague++;
        } else if (isAcquaintance(coAuthor, year)) {
          categorizedCoAuthors[year].acquaintance++;
        } else if (isCollaborator(coAuthor, year)) {
          categorizedCoAuthors[year].collaborator++;
        }
      });
    });

    return categorizedCoAuthors;
  }

  // Function to create and save the chart
  async createChart (categorizedCoAuthors) {
    const sortedYears = Object.keys(categorizedCoAuthors).sort((a, b) => a - b)

    const datasets = [
      {
        label: 'Close Colleagues',
        data: sortedYears.map(year => categorizedCoAuthors[year].closeColleague),
        backgroundColor: 'rgba(255, 99, 132)',
        stack: 'stacked'
      },
      {
        label: 'Acquaintances',
        data: sortedYears.map(year => categorizedCoAuthors[year].acquaintance),
        backgroundColor: 'rgba(54, 162, 235)',
        stack: 'stacked'
      },
      {
        label: 'Collaborators',
        data: sortedYears.map(year => categorizedCoAuthors[year].collaborator),
        backgroundColor: 'rgba(75, 192, 192)',
        stack: 'stacked'
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
      this.toggleChartModal(normalCanvas, largeCanvas, categorizedCoAuthors, true) // Use an arrow function here
    })

    // Append normal canvas to the page
    let div = document.getElementById('authorpage-refine')
    let title = document.createElement('p')
    let text = document.createElement('b')
    text.innerHTML = 'CoAuthor categories'
    title.appendChild(text)
    div.insertBefore(normalCanvas, div.firstChild)
    div.insertBefore(title, normalCanvas)

    // Get the context of the normal canvas and create the chart
    const normalCtx = normalCanvas.getContext('2d')
    this.myChart = new Chart(normalCtx, this.configuration)
  }

  toggleChartModal (normalCanvas, largeCanvas, categorizedCoAuthors, enlarge) {
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
        this.toggleChartModal(normalCanvas, largeCanvas, categorizedCoAuthors, false)
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

export default AuthorCollaborations
