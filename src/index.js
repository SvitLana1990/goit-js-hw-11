import axios from 'axios';
import refs from './refs';
import Notiflix from 'notiflix';
// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '39758797-2603f3af911ae2369cae9d72d';
const BASE_URL = 'https://pixabay.com/api/';
const { searchForm, input, button, container, loadButton, target } = refs;
let search = null;
let page = 1;
const perPage = 40;
const allImages = [];
let totalHits = 0;
let loadedImages = 0;
let currentPage = 1;

loadButton.classList.add('is-hidden');
// loadButton.addEventListener('click', onLoadMore);
searchForm.addEventListener('submit', handlerSubmit);

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(callback, options);
function callback(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      onLoadMore(currentPage);
    }
  });
}

function handlerSubmit(event) {
  event.preventDefault();
  search = input.value;
  page = 1;
  allImages.length = 0;
  container.innerHTML = '';

  axios
    .get(BASE_URL, {
      params: {
        key: API_KEY,
        q: search,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: perPage,
        page: page,
      },
    })
    .then(response => {
      const images = response.data.hits;
      totalHits = response.data.totalHits;

      if (images.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        allImages.length = 0;
        loadedImages = images.length;
        markupImage(images);
        if (loadedImages === totalHits) {
          // loadButton.classList.add('is-hidden');
          Notiflix.Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
        } else {
          // loadButton.classList.remove('is-hidden');
        }
      }
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
    })
    .catch(error => {
      console.error(error);
    });
}

function onLoadMore() {
  search = input.value;
  page += 1;

  axios
    .get(BASE_URL, {
      params: {
        key: API_KEY,
        q: search,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: perPage,
        page: page,
      },
    })
    .then(response => {
      const images = response.data.hits;
      loadedImages += images.length;

      allImages.push(...images);
      markupImage(allImages);
      // refresh();
      smoothScroll();
      if (loadedImages >= totalHits) {
        // loadButton.classList.add('is-hidden');
        observer.unobserve(target);
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function markupImage(images) {
  images.forEach(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      const html = `
      <div class="photo-card">
        <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width=320/></a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
      </div>
    `;

      container.insertAdjacentHTML('beforeend', html);
      observer.observe(target);
    }
  );
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// const lightbox = new SimpleLightbox('.photo-card a', {
//   sourceAttr: 'href',
//   showCounter: true,
//   animationSpeed: 250,
//   animationSlide: true,
//   docClose: true,
//   disableScroll: true,
// });
