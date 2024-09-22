const API_KEY = ''; // Replace with your actual News API key
const WEATHER_API_KEY = ''; // Replace with your actual OpenWeatherMap API key
const API_URL = `https://newsapi.org/v2/top-headlines?country=us&pageSize=70&apiKey=${API_KEY}`;

let shownArticles = [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

function fetchNews(category = 'general') {
    const loadingElement = document.getElementById('loading');
    const newsContainer = document.getElementById('news-container');

    loadingElement.style.display = 'block';
    newsContainer.innerHTML = '';

    fetch(`${API_URL}&category=${category}`)
        .then(response => response.json())
        .then(data => {
            loadingElement.style.display = 'none';

            const newArticles = data.articles.filter(article =>
                !shownArticles.some(shownArticle => shownArticle.title === article.title)
            );

            if (newArticles.length === 0) {
                shownArticles = [];
                displayArticles(data.articles.slice(0, 12));
            } else {
                displayArticles(newArticles.slice(0, 12));
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            loadingElement.style.display = 'none';
            newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
        });
}

function displayArticles(articles) {
    const newsContainer = document.getElementById('news-container');

    articles.forEach((article, index) => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.style.animationDelay = `${index * 0.1}s`;
        newsItem.innerHTML = `
            <img src="${article.urlToImage || 'placeholder-image.jpg'}" alt="${article.title}">
            <div class="news-content">
                <h2>${article.title}</h2>
                <p>${article.description || 'No description available.'}</p>
                <a href="${article.url}" target="_blank">Read more</a>
            </div>
        `;
        newsContainer.appendChild(newsItem);
    });

    shownArticles = shownArticles.concat(articles);
}

function fetchTemperature() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;

            fetch(WEATHER_API_URL)
                .then(response => response.json())
                .then(data => {
                    const temperatureElement = document.getElementById('temperature');
                    const weatherIcon = document.getElementById('weather-icon');

                    temperatureElement.textContent = `${data.main.temp}°C in ${data.name}`;
                    updateWeatherIcon(data.weather[0].main);
                })
                .catch(error => {
                    console.error('Error fetching temperature:', error);
                });
        });
    } else {
        const temperatureElement = document.getElementById('temperature');
        temperatureElement.textContent = 'Geolocation is not supported by this browser.';
    }
}

function updateWeatherIcon(weatherCondition) {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.className = 'weather-icon'; // Reset classes
  
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            weatherIcon.classList.add('clear');
            break;
        case 'clouds':
            weatherIcon.classList.add('clouds');
            break;
        case 'rain':
            weatherIcon.classList.add('rain');
            break;
        case 'snow':
            weatherIcon.classList.add('snow');
            break;
        case 'thunderstorm':
            weatherIcon.classList.add('thunderstorm');
            break;
        case 'wind':
            weatherIcon.classList.add('wind');
            break;
        default:
            weatherIcon.classList.add('default');
    }
  }


document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchTemperature();

    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.category-button.active').classList.remove('active');
            button.classList.add('active');
            fetchNews(button.getAttribute('data-category'));
        });
    });
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        fetchNews();
        fetchTemperature();
    }
});

function applyDarkMode() {
    document.body.classList.add('dark-mode');
}

function removeDarkMode() {
    document.body.classList.remove('dark-mode');
}

function initDarkMode() {
    const toggleButton = document.getElementById('toggle-button');
    const toggleThumb = toggleButton.querySelector('.toggle-thumb');

    toggleButton.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            applyDarkMode();
            toggleThumb.style.transform = 'translateX(20px)'; // Move thumb to the right
        } else {
            removeDarkMode();
            toggleThumb.style.transform = 'translateX(0)'; // Move thumb to the left
        }
        localStorage.setItem('darkMode', isDarkMode);
    });

    if (isDarkMode) {
        applyDarkMode();
        toggleThumb.style.transform = 'translateX(20px)'; // Start with thumb on the right
    }
}

initDarkMode();


// Fetch new news updates every 1 minute
setInterval(fetchNews, 1 * 60 * 1000);
