//Variables
//Variable guardar la info de las operaciones
const allOperations = getData("operations") || []

// Funciones auxiliares

//Funcion selector
const $ = (selector) => document.querySelector(selector);

//Funcion mostrar elementos
const showElement = (selectors) => {
    for (const selector of selectors){
      $(selector).classList.remove("hidden")
    }
  }

//Funcion ocultar elementos
const hideElement = (selectors) => {
    for (const selector of selectors){
      $(selector).classList.add("hidden")
    }
  }  

//Funcion generador de id´s
const randomIdGenerator = () => self.crypto.randomUUID()  

//Funcion traer la info de los arrays (operaciones, categorias) desde local storage
const getData = (key) => JSON.parse(localStorage.getItem(key))

//Funcion setear la info de los arrays (operaciones, categorias) desde local storage
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data))