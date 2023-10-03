import axios from 'axios';
import refs from './refs';
import Notiflix from 'notiflix';
import { markupImage } from './markup';
import { customfetch } from './custom_fetch';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
// const body = document.body;
const { searchForm, input, button, container, loadButton, target } = refs;
const perPage = 40;
let page = 1;
let allImages = [];
let totalHits = 0;
let loadedImages = 0;
let search = null;

loadButton.classList.add('is-hidden');
loadButton.addEventListener('click', onLoadMore);
searchForm.addEventListener('submit', handlerSubmit);

// console.log(window);
// window.addEventListener('scroll', async () => {
//   const scrollTop = body.scrollTop || document.documentElement.scrollTop;
//   const scrollHeight =
//     body.scrollHeight || document.documentElement.scrollHeight;
//   const clientHeight =
//     body.clientHeight || document.documentElement.clientHeight;
//   console.log(
//     'body.scrollTop, body.clientHeight, body.scrollHeight',
//     scrollTop,
//     clientHeight,
//     scrollHeight
//   );
//   if (scrollTop + clientHeight === scrollHeight) {
//     await onLoadMore();
//   }
// });

async function handlerSubmit(event) {
  event.preventDefault();
  search = input.value;
  page = 1;
  allImages.length = 0;
  container.innerHTML = '';
  if (!input.value.trim().length) {
    return Notiflix.Notify.failure('Please enter a word to search');
  }
  try {
    const responseData = await customfetch({ perPage, page, search });
    const images = responseData.hits;
    totalHits = responseData.totalHits;

    if (images.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      allImages.length = 0;
      loadedImages = images.length;
      markupImage(images);
      loadButton.classList.remove('is-hidden');

      if (loadedImages === totalHits) {
        loadButton.classList.add('is-hidden');

        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
    if (loadedImages >= 1) {
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function onLoadMore() {
  if (perPage > totalHits) {
    return;
  }
  search = input.value;
  page += 1;
  try {
    const responseData = await customfetch({ perPage, page, search });
    const images = responseData.hits;
    loadedImages += images.length;

    allImages.push(...images);
    markupImage(allImages);
    new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    if (loadedImages >= totalHits) {
      loadButton.classList.add('is-hidden');
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
    if (allImages && loadedImages >= 40) {
      smoothScroll();
    }
  } catch (error) {
    console.error(error);
  }
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
