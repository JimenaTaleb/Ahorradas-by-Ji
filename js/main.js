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

//Mostrar el formulario para editar operaciones
const showFormEdit = (operationId) =>{
    showElement(["#form--operation", "#btn--edit-operation-form", "#title--operation-edit"])
    hideElement(["#section--balance", "#section--filters", "#section--operations--results", "#section--operations-no-results", "#btn--submit-operation-form", "#title--operation-new"])
    $("#btn--edit-operation-form").setAttribute("data-id", operationId)
    const operationSelected = getData("operations").find(operation => operation.id === operationId)
    $("#input--description").value = operationSelected.description
    $("#input--category").value = operationSelected.category
    $("#input--date").valueAsDate = new Date(operationSelected.date)
    $("#input--amount").valueAsNumber = operationSelected.amount
    $("#input--type").value = operationSelected.type
  }  

//Funcion inicializar la app
const initializeApp = () =>{
    setData("operations", allOperations)
    renderOperations(allOperations)
  // EVENTOS
  //Agregar operacion
  $("#btn--add-operation").addEventListener("click", () =>{
    showElement(["#form--operation"])
    hideElement(["#section--balance", "#section--filters", "#section--operations--results", "#section--operations-no-results", "#btn--edit-operation-form"])
  })
  
  //Eviar la info del formulario Nueva operación
  $("#btn--submit-operation-form").addEventListener("click", (e) =>{
    e.preventDefault()
    const currentData = getData("operations")
    currentData.push(saveOperationInfo())
    setData("operations", currentData)
  })
  
  //Editar las operaciones
  $("#btn--edit-operation-form").addEventListener("click", (e) =>{
    e.preventDefault()
    const operationId = $("#btn--edit-operation-form").getAttribute("data-id")
    const currentData = getData("operations").map(operation =>{
      if (operation.id === operationId){
        return saveOperationInfo()
      }
      return operation
    })
    setData("operations", currentData)
    window.location.reload()
  })
  }  

  window.addEventListener("load", initializeApp)  