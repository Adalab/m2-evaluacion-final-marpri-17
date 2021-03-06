"use strict";
// Elementos DOM
const input = document.querySelector(".js-input");
const btnSearch = document.querySelector(".js-search");
const seriesList = document.querySelector(".js-list");
const favoritesList = document.querySelector(".js-favorite-list");
const favoritesSection = document.querySelector(".series__section");

let searchResult = [];
let favorites = [];

const getInputValue = () => input.value;

const clearListResult = seriesList => (seriesList.innerHTML = "");

const pickedItem = (ev, arr) => {
  ev.preventDefault();
  let selectedShow = ev.currentTarget;
  const foundFavoriteIndex = parseInt(
    selectedShow.getAttribute("data-ada-pos")
  );
  const item = arr[foundFavoriteIndex];
  return item;
};

const isFavorite = (item, arr) => {
  const itemId = item.id;
  for (let i = 0; i < arr.length; i++) {
    let id = arr[i].id;
    if (itemId === id) {
      return true;
    }
  }
  return false;
};

const arrConstructor = data => {
  clearListResult(seriesList);
  searchResult = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].show.image) {
      searchResult.push({
        name: data[i].show.name,
        image: data[i].show.image.original,
        id: data[i].show.id
      });
    } else {
      const insertShowName = data[i].show.name.replace(" ", "+");
      searchResult.push({
        name: data[i].show.name,
        image: "https://via.placeholder.com/300?text=" + insertShowName,
        id: data[i].show.id
      });
    }
  }
  return searchResult;
};

const showData = data => {
  for (let i = 0; i < data.length; i++) {
    const newItem = document.createElement("li");
    let newImage = document.createElement("img");
    let newShow = document.createElement("h2");
    newItem.appendChild(newImage);
    newItem.appendChild(newShow);
    seriesList.appendChild(newItem);
    let newShowName = document.createTextNode(`${data[i].name}`);
    newShow.appendChild(newShowName);
    newImage.style = `background-image: url(${data[i].image}`;
    newItem.dataset.adaPos = [i];
    newItem.classList.add("series__item", "js-item");
    newImage.classList.add("series__image");
    newShow.classList.add("series__show");
  }
};
const toggleView = item => {
  item.classList.remove("series__item");
  item.classList.add("favorite__item");
  let itemchildren = item.children;
  let textNode = itemchildren[1];
  textNode.classList.remove("series__show");
  textNode.classList.add("favorite__txt");
};

const pickedFavorite = arr => {
  let areFavorites = [];
  let json = localStorage.getItem("favorite");
  if (json !== null) {
    let favorites = JSON.parse(json);
    for (let i = 0; i < favorites.length; i++) {
      let favoritesId = favorites[i].id;
      for (let j = 0; j < arr.length; j++) {
        let itemId = arr[j].id;
        if (itemId === favoritesId) {
          areFavorites.push(j);
        }
      }
    }
  }
  return areFavorites;
};
const paintView = arr => {
  let seriesOfList = seriesList.children;
  for (let i = 0; i < seriesOfList.length; i++) {
    let posIndex = parseInt(seriesOfList[i].getAttribute("data-ada-pos"));
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] === posIndex) {
        toggleView(seriesOfList[posIndex]);
      }
    }
  }
};

const addListeners = (list, handler) => {
  const seriesItem = document.querySelectorAll(list);
  for (let item of seriesItem) {
    item.addEventListener("click", handler);
  }
};

const showDataFavorites = favoritesData => {
  for (let i = 0; i < favoritesData.length; i++) {
    const newItem = document.createElement("li");
    let newImage = document.createElement("img");
    let newShow = document.createElement("h2");
    newItem.appendChild(newImage);
    newItem.appendChild(newShow);
    favoritesList.appendChild(newItem);
    let newShowName = document.createTextNode(`${favoritesData[i].name}`);
    newShow.appendChild(newShowName);
    newItem.dataset.adaPos = [i];
    newImage.style = `background-image: url(${favoritesData[i].image}`;
    newItem.classList.add("series__item--favorite", "js-item-favorite");
    newImage.classList.add("series__image--favorite");
    newShow.classList.add("series__show--favorite");
  }
};

const addFavorites = element => favorites.unshift(element);

const deleteItem = item => {
  for (let i = 0; i < favorites.length; i++)
    if (item.id === favorites[i].id) {
      favorites.splice(i, 1);
      return favorites;
    }
};
const checkView = index => {
  seriesList[index];
};

const saveLocalStorage = () => {
  localStorage.setItem("favorite", JSON.stringify(favorites));
};

// Handlers
const getDatafromServer = ev => {
  ev.preventDefault();
  const url = "http://api.tvmaze.com/search/shows?q=";
  fetch(url + getInputValue())
    .then(Response => Response.json())
    .then(data => {
      data = arrConstructor(data);
      showData(data);
      paintView(pickedFavorite(data));
      addListeners(".js-item", handlerFavorites);
    });
};

const handlerFavorites = event => {
  let element = event.currentTarget;
  toggleView(element);
  const seriesItem = pickedItem(event, searchResult);
  if (isFavorite(seriesItem, favorites) === false) {
    addFavorites(seriesItem);
  }
  saveLocalStorage(favorites);
  clearListResult(favoritesList);
  showDataFavorites(favorites);
  addListeners(".js-item-favorite", deleteFavorite);
};

const deleteFavorite = ev => {
const deletedItem = pickedItem(ev,JSON.parse(localStorage.getItem("favorite")));
  deleteItem(deletedItem);
  saveLocalStorage();
  clearListResult(favoritesList);
  showDataFavorites(favorites);
  addListeners(".js-item-favorite", deleteFavorite);
  debugger;
  clearListResult(seriesList);
  showData(searchResult);
  paintView(pickedFavorite(searchResult));
  addListeners(".js-item", handlerFavorites);
};

function starApp() {
  const savedFavorite = localStorage.getItem("favorite");
  if (savedFavorite !== null) {
    favorites = JSON.parse(savedFavorite);
    showDataFavorites(favorites);
  }
  addListeners(".js-item-favorite", deleteFavorite);
}
starApp();
btnSearch.addEventListener("click", getDatafromServer);