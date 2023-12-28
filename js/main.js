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

//Obtener la fecha actual
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }; 

  //Setear la fecha actual 
  const setFilterDate = () => {
    const currentDate = getCurrentDate();
    $("#date--select").value = currentDate;
    $("#input--date").value = currentDate;
  }; 
  
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

  //Filtros
  const filterOperations = () => {
    // Valores seleccionados de los filtros:
    const selectedType = $("#type--select").value;
    const selectedCategory = $("#category--filter-select").value;
    const rawSelectedDate = $("#date--select").value;
    const selectedDate = rawSelectedDate ? new Date(rawSelectedDate).toISOString().split('T')[0] : null;
    const selectedOrder = $("#order--select").value;
  
    // Primer filtro: tipo
    const filterByType = getData("operations").filter((operation) => {
      if (selectedType === "todos") {
        return operation;
      }
      return selectedType === operation.type;
    });
  
    // Al filtro de tipo, lo filtro de nuevo por categoría:
    const filterByCategory = filterByType.filter((operation) => {
      if (selectedCategory === "todas") {
        return operation;
      } else {
        return selectedCategory === getData("categories").find(currentCategory => currentCategory.id === operation.category);
      }
    });
  
    // Al filtro de tipo y categoría, vuelvo a filtrar por fecha
    const filterByDate = filterByCategory.filter((operation) => {
      if (!selectedDate) {
        return true; // No hay fecha seleccionada, no se aplica este filtro
      }
      return new Date(operation.date) >= new Date(selectedDate);
    });
  
    // Último filtro: orden
    const filterBySort = filterByDate.sort((a, b) => {
      if (selectedOrder === "mas-reciente") {
        return new Date(b.date) - new Date(a.date);
      }
      if (selectedOrder === "menos-reciente") {
        return new Date(a.date) - new Date(b.date);
      }
      if (selectedOrder === "mayor-monto") {
        return b.amount - a.amount;
      }
      if (selectedOrder === "menor-monto") {
        return a.amount - b.amount;
      }
      if (selectedOrder === "a-z") {
        return a.description.localeCompare(b.description);
      }
      if (selectedOrder === "z-a") {
        return b.description.localeCompare(a.description);
      }
    });
  
    if (filterBySort.length) {
      hideElement(["#section--operations-no-results"]);
    } else {
      showElement(["#section--operations-no-results"]);
    }
  
    updateBalance(filterBySort);
    renderOperations(filterBySort);
  };
    
//Renderizar las categorias en la tabla
const renderCategoriesTable = (categories) =>{
  for (const category of categories){
    cleanContainer("#categories--table-body");
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
$("#higher--earnings-amount").innerText = `+$${highestEarningAmount}`

};

//Categoría con mayor gasto
const higherExpenseCategory = (operations) =>  {
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
const expensesByCategory = {};


for (const operation of allOperations) {
  if (operation.type === "gasto") {
    if (expensesByCategory[operation.category]) {
      expensesByCategory[operation.category] += operation.amount;
    } else {
      expensesByCategory[operation.category] = operation.amount;
    }
  }
}


let highestExpenseCategory = null;
let highestExpenseAmount = 0;

for (const categoryID in expensesByCategory) {
  const categoryName = allCategories.find(category => category.id === categoryID)?.categoryName;

  if (expensesByCategory[categoryID] > highestExpenseAmount) {
    highestExpenseAmount = expensesByCategory[categoryID];
    highestExpenseCategory = categoryName;
  }
}

$("#higher--expenses-category").innerText = highestExpenseCategory
$("#higher--expenses-amount").innerText = `-$${highestExpenseAmount}`

};

//Categoría con mayor balance
const highestBalanceCategory = () => {
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
  const balancesByCategory = {};

  for (const operation of allOperations) {
    const { category, amount, type } = operation;

    if (type === "ganancia" || type === "gasto") {
      if (balancesByCategory[category]) {
        balancesByCategory[category] += (type === "ganancia" ? amount : -amount);
      } else {
        balancesByCategory[category] = (type === "ganancia" ? amount : -amount);
      }
    }
  }

  let highestBalanceCategory = null;
  let highestBalanceAmount = 0;

  for (const categoryID in balancesByCategory) {
    const categoryName = allCategories.find(category => category.id === categoryID)?.categoryName;

    if (balancesByCategory[categoryID] > highestBalanceAmount) {
      highestBalanceAmount = balancesByCategory[categoryID];
      highestBalanceCategory = categoryName;
    }
  }


  $("#higher--balance-category").innerText = highestBalanceCategory || "N/A";
  $("#higher--balance-amount").innerText = `$${highestBalanceAmount.toFixed(2)}`;
};


//Mes con mayor ganancia
const higherEarningsMonth = () => {
  const allOperations = getData("operations") || [];
  const earningsByMonth = {};

  for (const operation of allOperations) {
    if (operation.type === "ganancia") {
      const operationDate = new Date(operation.date);
      const monthYear = `${operationDate.getMonth() + 1}-${operationDate.getFullYear()}`;

      if (earningsByMonth[monthYear]) {
        earningsByMonth[monthYear] += operation.amount;
      } else {
        earningsByMonth[monthYear] = operation.amount;
      }
    }
  }

  let highestEarningMonth = null;
  let highestEarningAmount = 0;

  for (const monthYear in earningsByMonth) {
    const earningsAmount = earningsByMonth[monthYear];

    if (earningsAmount > highestEarningAmount) {
      highestEarningAmount = earningsAmount;
      highestEarningMonth = monthYear;
    }
  }

  $("#higher--earnings-month").innerText = highestEarningMonth || "N/A";
  $("#higher--earnings-month-amount").innerText = `+$${highestEarningAmount.toFixed(2)}`;
};


//Mes con mayor gasto
const higherExpenseMonth = () => {
  const allOperations = getData("operations") || [];
  const expensesByMonth = {};

  for (const operation of allOperations) {
    if (operation.type === "gasto") {
      const operationDate = new Date(operation.date);
      const monthYear = `${operationDate.getMonth() + 1}-${operationDate.getFullYear()}`;

      if (expensesByMonth[monthYear]) {
        expensesByMonth[monthYear] += operation.amount;
      } else {
        expensesByMonth[monthYear] = operation.amount;
      }
    }
  }

  let highestExpenseMonth = null;
  let highestExpenseAmount = 0;

  for (const monthYear in expensesByMonth) {
    const expensesAmount = expensesByMonth[monthYear];

    if (expensesAmount > highestExpenseAmount) {
      highestExpenseAmount = expensesAmount;
      highestExpenseMonth = monthYear;
    }
  }

  $("#higher--expenses-month").innerText = highestExpenseMonth || "N/A";
  $("#higher--expenses-month-amount").innerText = `-$${highestExpenseAmount}`;
};

//Totales por categorías
const renderByCategories = () => {
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
  const totalsByCategory = {};

  for (const operation of allOperations) {
    const { category, amount, type } = operation;

    if (type === "ganancia" || type === "gasto") {
      if (totalsByCategory[category]) {
        totalsByCategory[category][type] += amount;
      } else {
        totalsByCategory[category] = {
          ganancia: type === "ganancia" ? amount : 0,
          gasto: type === "gasto" ? amount : 0,
        };
      }
    }
  }

  cleanContainer("#table--totals-categories")


  for (const categoryID in totalsByCategory) {
    const categoryName = allCategories.find(category => category.id === categoryID)?.categoryName;
    const { ganancia, gasto } = totalsByCategory[categoryID];
    const balance = ganancia - gasto;

    $("#table--totals-categories").innerHTML += `
      <tr class="flex justify-items-end">
        <td class="w-1/4 mr-1 text-left">${categoryName || "N/A"}</td>
        <td class="w-1/4 mr-1 text-green-500 text-center">+$${ganancia}</td>
        <td class="w-1/4 mr-1 text-red-500 text-center">-$${gasto}</td>
        <td class="w-1/4 mr-1 text-center">${balance >= 0 ? `+$${balance}` : `$${balance}`}</td>
      </tr>
    `;
  }
};

//Totales por mes
const renderByMonth = () => {
  const allOperations = getData("operations") || [];
  const totalsByMonth = {};

  for (const operation of allOperations) {
    const { amount, type, date } = operation;

    if (type === "ganancia" || type === "gasto") {
      const operationDate = new Date(date);
      const monthYear = `${operationDate.getMonth() + 1}-${operationDate.getFullYear()}`;

      if (totalsByMonth[monthYear]) {
        totalsByMonth[monthYear][type] += amount;
      } else {
        totalsByMonth[monthYear] = {
          ganancia: type === "ganancia" ? amount : 0,
          gasto: type === "gasto" ? amount : 0,
        };
      }
    }
  }

  cleanContainer("#table--totals-month");

  for (const monthYear in totalsByMonth) {
    const { ganancia, gasto } = totalsByMonth[monthYear];
    const balance = ganancia - gasto;

    $("#table--totals-month").innerHTML += `
      <tr class="flex justify-items-end">
        <td class="w-1/4 mr-1 text-left">${monthYear}</td>
        <td class="w-1/4 mr-1 text-green-500 text-center">+$${ganancia}</td>
        <td class="w-1/4 mr-1 text-red-500 text-center">-$${gasto}</td>
        <td class="w-1/4 mr-1 text-center">${balance >= 0 ? `+$${balance}` : `-$${balance}`}</td>
      </tr>
    `;
  }
};


//Funcion inicializar la app
const initializeApp = () =>{
    setData("operations", allOperations)
    setData("categories", allCategories)
    setFilterDate()
    filterOperations(allOperations)
    renderCategoriesTable(allCategories)
    renderCategoriesFormOptions(allCategories)
    updateBalance(allOperations);
    higherEarningsCategory(allOperations)
    higherExpenseCategory(allOperations)
    highestBalanceCategory(allOperations)
    higherEarningsMonth(allOperations)
    higherExpenseMonth(allOperations)
    renderByCategories(allOperations)
    renderByMonth(allOperations)


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

  $("#section--filters").addEventListener("change", () => filterOperations(allOperations));

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