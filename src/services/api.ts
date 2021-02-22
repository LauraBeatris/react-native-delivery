import axios from 'axios';

import { Food } from '../pages/FoodDetails';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

export const fetchFoods = async (
  searchValue?: string,
  selectedCategory?: number,
) => {
  const selectedCategoryQueryParam = selectedCategory
    ? `&category_like=${selectedCategory}`
    : '';

  const { data } = await api.get(
    `/foods?name_like=${searchValue}${selectedCategoryQueryParam}`,
  );

  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get('/categories');

  return data;
};

export const fetchFavorites = async () => {
  const { data } = await api.get('/favorites');

  return data;
};

export const fetchOrders = async () => {
  const { data } = await api.get('/orders');

  return data;
};

export const fetchFood = async (id: number) => {
  const { data } = await api.get(`/foods/${id}`);

  return data;
};

export const getFavorite = async (id: number) => {
  return api.post(`/favorites/${id}`);
};

export const postFavorite = async (food: Food) => {
  return api.post('/favorites', food);
};

export const deleteFavorite = async (id: number) => {
  return api.delete(`/favorites/${id}`);
};

export const postOrder = async (order: Order) => {
  return api.post('/orders', order);
};

export default api;
