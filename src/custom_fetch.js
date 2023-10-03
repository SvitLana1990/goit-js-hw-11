import axios from 'axios';

const API_KEY = '39758797-2603f3af911ae2369cae9d72d';
const BASE_URL = 'https://pixabay.com/api/';

export async function customfetch({ perPage, page, search }) {
  const response = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: search,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: perPage,
      page: page,
    },
  });

  return response.data;
}
