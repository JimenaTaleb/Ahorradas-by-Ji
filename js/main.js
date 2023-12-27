// Funciones auxiliares:

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
  
//Función para limpiar el contenedor
  const cleanContainer = (selector) => $(selector).innerHTML = ""

//Funcion generador de id´s
const randomIdGenerator = () => self.crypto.randomUUID()  

//Funcion traer la info de los arrays (operaciones, categorias) desde local storage
const getData = (key) => JSON.parse(localStorage.getItem(key))

//Funcion setear la info de los arrays (operaciones, categorias) desde local storage
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data))

//Variable para guardar las categorías por defecto
const defaultCategories = [
  {
    id: randomIdGenerator(),
    categoryName: "Comidas"
  },
  {
    id: randomIdGenerator(),
    categoryName: "Servicios"
  },
  {
    id: randomIdGenerator(),
    categoryName: "Salidas"
  },
  {
    id: randomIdGenerator(),
    categoryName: "Educación"
  },
  {
    id: randomIdGenerator(),
    categoryName: "Transporte"
  },
  {
    id: randomIdGenerator(),
    categoryName: "Trabajo"
  }
]

//Variable para guardar la info de las operaciones
const allOperations = getData("operations") || []

//Variable para guardar las categorias por defecto en localStorage
const allCategories = getData("categories") || defaultCategories


// Funciones principales:

//Renderizar las operaciones en la tabla 
const renderOperations = (operations) => {
  if (operations.length){
    hideElement(["#section--operations-no-results"])
    for (const operation of operations) {
      const categorySelected = getData("categories").find(category => category.id === operation.category)

      const amountClass = operation.type === "ganancia" ? 'text-green-500' : 'text-red-500';
      const amountSign = operation.type === "ganancia" ? '+$' : '-$';

      $("#operations--table-body").innerHTML += `
      <tr class="flex flex-wrap justify-between lg:flex-nowrap lg:items-center">
         <td class="w-1/2 text-base mt-4">${operation.description}</td>
         <td class="w-1/2 text-xs mt-4 text-right lg:text-center"><span class="my-1 rounded bg-green-100 mt-4">${categorySelected.categoryName}</span></td>
         <td class="hidden lg:flex lg:w-1/2 lg:text-center justify-center">${new Date(operation.date).toLocaleDateString('es-ES')}</td>
         <td class="w-1/2 text-base mt-4 lg:text-center font-bold ${amountClass}">${amountSign}${operation.amount}</td>
         <td class="w-1/2 text-right lg:text-center">
             <button onclick="showFormEdit('${operation.id}')"><i class="fa-regular fa-pen-to-square text-xs mt-4 bg-green-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-green-600"></i></button>
             <button onclick="showModalDeleteOperation('${operation.id}', '${operation.description}')"><i class="fa-solid fa-trash text-xs mt-4 bg-red-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-red-600"></i></button>
         </td>
      </tr>
      `
    }
    } else {
      showElement(["#section--operations-no-results"])
      hideElement(["#section--operations--results"])
    }
  }
    
//Renderizar las categorias en la tabla
const renderCategoriesTable = (categories) =>{
  for (const category of categories){
    $("#categories--table-body").innerHTML += `
    <tr class="flex flex-wrap justify-between lg:flex-nowrap lg:items-center">
         <td class="w-1/2 text-base mt-4">${category.categoryName}</td>
         <td class="w-1/2 text-right lg:text-right">
             <button onclick="showFormCategoryEdit('${category.id}')"><i class="fa-regular fa-pen-to-square text-xs mt-4 bg-green-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-green-600"></i></button>
             <button onclick="showModalDeleteCategory('${category.id}', '${category.categoryName}')"><i class="fa-solid fa-trash text-xs mt-4 bg-red-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-red-600"></i></button>
         </td>
      </tr>
    `
  }
}

//Renderizar las categorias en el form
const renderCategoriesFormOptions = (categories) =>{
  for (const category of categories){
    // Renderiza las categorías en el form de agregar o editar
    $("#category--form-select").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `
    //Renderiza las categorías en el filtro de operaciones
    $("#category--filter-select").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `
  }
}


//Guardar la info (inputs) de las operaciones
const saveOperationInfo = (operationId) =>{
    return {
      id: operationId ? operationId : randomIdGenerator(),
      description: $("#input--description").value,
      category: $("#category--form-select").value,
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

 //Mostrar ventana modal
const showModalDeleteOperation = (operationId, operationDescription) =>{
    showElement(["#modal--delete"])
    hideElement(["#title--delete-category"])
    $("#btn--delete").setAttribute("data-id", operationId)
    $(".delete--id-operation").innerText = `${operationDescription}`
    $("#btn--delete").addEventListener("click", () =>{
        const operationId = $("#btn--delete").getAttribute("data-id")
        deleteOperation(operationId)
   
    })
  }  

  //Eliminar operaciones
  const deleteOperation = (operationId) =>{
    const currentData = getData("operations").filter(operation => operation.id != operationId)
    setData("operations", currentData)
    window.location.reload()
  }

  //Agregar operaciones
  const addOperation = () =>{
    const currentData = getData("operations")
    currentData.push(saveOperationInfo())
    setData("operations", currentData)
  }

  //Editar operacion
  const editOperation = () =>{
    const operationId = $("#btn--edit-operation-form").getAttribute("data-id")
    const currentData = getData("operations").map(operation =>{
      if (operation.id === operationId){
        return saveOperationInfo(operationId)
      }
      return operation
    })
    setData("operations", currentData)
  }

//Guardar la info (input) de las categorias
 const saveCategoryInfo = (categoryId) => {
  return {
    id: categoryId ? categoryId : randomIdGenerator(),
    categoryName: $("#input--category").value,
  };
};

  //Agregar categorias
  const addCategory = () => {
    const currentData = getData("categories");
    currentData.push(saveCategoryInfo())
    setData("categories", currentData)
  };

  //Mostrar el formulario para editar categorias
  const showFormCategoryEdit = (categoryId) => {
    showElement(["#form--categories", "#title--operation-edit", "#btn--edit-category-form"]);
    hideElement(["#add--category-title", "#categories--table", "#btn--add-category"]);
    $("#btn--edit-category-form").setAttribute("data-id", categoryId);
    const categorySelected = getData("categories").find(category => category.id === categoryId);
    $("#input--category").value = categorySelected.categoryName;
  };

    //Editar categorías
    const editCategory = () => {
      const categoryId = $("#btn--edit-category-form").getAttribute("data-id");
      const currentData = getData("categories").map(category => {
        if (category.id === categoryId) {
          return {
            id: categoryId,
            categoryName: $("#input--category").value
          };
        }
        return category;
      });
      setData("categories", currentData);
    };

     //Mostrar ventana modal para eliminar categorias
const showModalDeleteCategory = (categoryId, categoryName) =>{
  showElement(["#modal--delete", "#title--delete-category"])
  hideElement(["#title--delete-operation"])
  $("#btn--delete").setAttribute("data-id", categoryId)
  $(".delete--id-category").innerText = `${categoryName}`
  $("#btn--delete").addEventListener("click", () =>{
      const categoryId = $("#btn--delete").getAttribute("data-id")
      deleteCategory(categoryId)
 
  })
} 

//Eliminar categorías
const deleteCategory = (categoryId) => {
  const currentData = getData("operations").filter(operation => operation.category !== categoryId);
  setData("operations", currentData);
  window.location.reload();
};

//Actualizar balance
const updateBalance = () => {
  const allOperations = getData("operations") || [];
  let totalEarnings = 0;
  let totalExpenses = 0;

  for (const operation of allOperations) {
      if (operation.type === "ganancia") {
          totalEarnings += operation.amount;
      } else if (operation.type === "gasto") {
          totalExpenses += operation.amount;
      }
  }

  $("#balance--earning").innerText = `+$${totalEarnings}`
  $("#balance--expense").innerText = `-$${totalExpenses}`

  const totalBalance = totalEarnings - totalExpenses;
  $("#balance--total").innerText = totalBalance >= 0 ? `+$${totalBalance}` : `-$${totalBalance}`;
};


//Reportes
//Categoría con mayor ganancia
const higherEarningsCategory = (operations) =>  {
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
const earningsByCategory = {};


for (const operation of allOperations) {
  if (operation.type === "ganancia") {
    if (earningsByCategory[operation.category]) {
      earningsByCategory[operation.category] += operation.amount;
    } else {
      earningsByCategory[operation.category] = operation.amount;
    }
  }
}


let highestEarningCategory = null;
let highestEarningAmount = 0;

for (const categoryID in earningsByCategory) {
  const categoryName = allCategories.find(category => category.id === categoryID)?.categoryName;

  if (earningsByCategory[categoryID] > highestEarningAmount) {
    highestEarningAmount = earningsByCategory[categoryID];
    highestEarningCategory = categoryName;
  }
}

$("#higher--earnings-category").innerText = highestEarningCategory
$("#higher--earnings-amount").innerText = highestEarningAmount

};

//Funcion inicializar la app
const initializeApp = () =>{
    setData("operations", allOperations)
    setData("categories", allCategories)
    renderOperations(allOperations)
    renderCategoriesTable(allCategories)
    renderCategoriesFormOptions(allCategories)
    updateBalance(allOperations);
    higherEarningsCategory(allOperations)

  // EVENTOS
  //Abrir menu responsive
  $("#btn--open-nav").addEventListener("click", ()=>{
    showElement(["#nav--bar", "#btn--close-nav"])
    hideElement(["#btn--open-nav"])
  })
  
  //Cerrar menu responsive
  $("#btn--close-nav").addEventListener("click", ()=>{
    hideElement(["#nav--bar", "#btn--close-nav"])
    showElement(["#btn--open-nav"])
  })

  //Ocultar filtros
  $("#btn--hide-filters").addEventListener("click", (e) =>{
    e.preventDefault()
    hideElement(["#all--filters", "#btn--hide-filters"])
    showElement(["#btn--show-filters"])
  })

  //Mostrar filtros
  $("#btn--show-filters").addEventListener("click", (e) =>{
    e.preventDefault()
    showElement(["#all--filters", "#btn--hide-filters"])
    hideElement(["#btn--show-filters"])
  })

  //Mostrar seccion categorias
  $("#btn--go--categories").addEventListener("click", () =>{
    hideElement(["#section--balance", "#section--filters", "#section--operations--results", "#section--operations-no-results", "#section--reports"])
    showElement(["#section--categories"])
  })

  //Cerrar ventana modal
  $("#btn--close-modal").addEventListener("click", () =>{
    hideElement(["#modal--delete"])
  })

  //Cerrar ventana modal bis
  $("#btn--close-modal-bis").addEventListener("click", () =>{
    hideElement(["#modal--delete"])
  })

  //Abrir formulario nueva operacion
  $("#btn--add-operation").addEventListener("click", () =>{
    showElement(["#form--operation"])
    hideElement(["#section--balance", "#section--filters", "#section--operations--results", "#section--operations-no-results", "#btn--edit-operation-form"])
  })

   //Abrir formulario nueva operacion bis
   $("#btn--add-operation-clon").addEventListener("click", () =>{
    showElement(["#form--operation"])
    hideElement(["#section--balance", "#section--filters", "#section--operations--results", "#section--operations-no-results", "#btn--edit-operation-form"])
  })
  
  //Agregar nueva operación
  $("#btn--submit-operation-form").addEventListener("click", (e) =>{
    e.preventDefault()
    addOperation()
    $("#form").reset()
  })
  
  //Editar las operaciones
  $("#btn--edit-operation-form").addEventListener("click", (e) =>{
    e.preventDefault()
    editOperation()
    window.location.reload()
  })

  //Agregar categorías
  $("#btn--add-category").addEventListener("click", () => {
    addCategory();
    window.location.reload();
  });

  //Editar categorías
  $("#btn--edit-category-form").addEventListener("click", (e) =>{
    e.preventDefault()
    editCategory()
    window.location.reload()
  })

  //Abrir ventana reportes
  $("#btn--go--reports").addEventListener("click", () =>{
    hideElement(["#section--main-balance", "#section--balance", "#section--filters", "#form--operation", "#section--categories", "#section--operations--results"])
    showElement(["#section--reports"])
  })
  }  

  window.addEventListener("load", initializeApp)  