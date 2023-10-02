import axios from 'axios';
import refs from './refs';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '39758797-2603f3af911ae2369cae9d72d';
const BASE_URL = 'https://pixabay.com/api/';
const { searchForm, input, button, container, loadButton, target } = refs;
const perPage = 40;
const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};
// let search = null;
let page = 1;
let allImages = [];
let totalHits = 0;
let loadedImages = 0;
let currentPage = 1;
let search = null;

loadButton.classList.add('is-hidden');
// loadButton.addEventListener('click', onLoadMore);
searchForm.addEventListener('submit', handlerSubmit);

const observer = new IntersectionObserver(callback, options);
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
          Notiflix.Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
        }
      }
      if (loadedImages >= 1) {
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      }
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

      if (loadedImages >= totalHits) {
        // loadButton.classList.add('is-hidden');
        observer.unobserve(target);
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        // lightbox.refresh();
      }
      smoothScroll();
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
      const markup = `
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
      container.insertAdjacentHTML('beforeend', markup);
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
// const lightbox = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });
