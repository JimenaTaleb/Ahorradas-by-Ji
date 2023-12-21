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

// Funciones principales

//Renderizar las operaciones en la tabla 
const renderOperations = (operations) => {
    for (const operation of operations) {
      $("#operations--table-body").innerHTML += `
      <tr class="flex flex-wrap justify-between lg:flex-nowrap lg:items-center">
         <td class="w-1/2 text-base mt-4">${operation.description}</td>
         <td class="w-1/2 text-xs mt-4 text-right lg:text-center"><span class="my-1 rounded bg-green-100 mt-4">${operation.category}</span></td>
         <td class="hidden lg:flex lg:w-1/2 lg:text-center">${operation.date}</td>
         <td class="w-1/2 text-2xl mt-4 lg:text-right">${operation.amount}</td>
         <td class="w-1/2 text-right lg:text-right">
             <button onclick="showFormEdit('${operation.id}')"><i class="fa-regular fa-pen-to-square text-xs mt-4 bg-green-500 text-white py-1 px-2 rounded-md ml-2"></i></button>
             <button><i class="fa-solid fa-trash text-xs mt-4 bg-red-500 text-white py-1 px-2 rounded-md ml-2"></i></button>
         </td>
      </tr>
      `;
    }
  };

//Guardar la info (inputs) de las operaciones
const saveOperationInfo = () =>{
    return {
      id: randomIdGenerator(),
      description: $("#input--description").value,
      category: $("#input--category").value,
      date: $("#input--date").valueAsDate,
      amount: $("#input--amount").valueAsNumber,
      type: $("#input--type").value
    }
  }  