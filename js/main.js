// Funciones auxiliares:

//Selector
const $ = (selector) => document.querySelector(selector);

//Mostrar elementos
const showElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.remove("hidden");
  }
};

//Ocultar elementos
const hideElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.add("hidden");
  }
};

//Fecha del día en curso
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const firstDay = "01";
  return `${year}-${month}-${firstDay}`;
};

//Setear fecha en curso
const setFilterDate = () => {
  const currentDate = getCurrentDate();
  $("#date--select").value = currentDate;
  $("#input--date").value = currentDate;
};

//Limpiar contenedor
const cleanContainer = (selector) => ($(selector).innerHTML = "");

//Generador de id´s
const randomIdGenerator = () => self.crypto.randomUUID();

//Traer info de localStorage
const getData = (key) => JSON.parse(localStorage.getItem(key));

//Setear la info de local storage
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

//Categorías por defecto
const defaultCategories = [
  {
    id: randomIdGenerator(),
    categoryName: "Comidas",
  },
  {
    id: randomIdGenerator(),
    categoryName: "Servicios",
  },
  {
    id: randomIdGenerator(),
    categoryName: "Salidas",
  },
  {
    id: randomIdGenerator(),
    categoryName: "Educación",
  },
  {
    id: randomIdGenerator(),
    categoryName: "Transporte",
  },
  {
    id: randomIdGenerator(),
    categoryName: "Trabajo",
  },
];

//Operaciones
const allOperations = getData("operations") || [];

//Categorías
const allCategories = getData("categories") || defaultCategories;

// Funciones principales

//Operaciones
//Renderizar las operaciones en la tabla
const renderOperations = (operations) => {
  $("#operations--table-body").innerHTML = "";
  if (operations.length) {
    hideElement(["#section--operations-no-results"]);
    showElement(["#section--operations--results"]);
    for (const operation of operations) {
      const categorySelected = getData("categories").find(
        (category) => category.id === operation.category
      );

      const amountClass =
        operation.type === "ganancia" ? "text-green-500" : "text-red-500";
      const amountSign = operation.type === "ganancia" ? "+$" : "-$";

      $("#operations--table-body").innerHTML += `
      <tr class="flex flex-wrap justify-between lg:flex-nowrap lg:items-center">
         <td class="w-1/2 text-base mt-4">${operation.description}</td>
         <td class="w-1/2 text-xs mt-4 text-right lg:text-center"><span class="my-1 rounded bg-green-100 mt-4">${
           categorySelected.categoryName
         }</span></td>
         <td class="hidden lg:flex lg:w-1/2 lg:text-center justify-center">${new Date(
           operation.date
         ).toLocaleDateString("es-ES")}</td>
         <td class="w-1/2 text-base mt-4 lg:text-center font-bold ${amountClass}">${amountSign}${
        operation.amount
      }</td>
         <td class="w-1/2 text-right lg:text-center">
             <button onclick="showFormEdit('${
               operation.id
             }')"><i class="fa-regular fa-pen-to-square text-xs mt-4 bg-green-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-green-600"></i></button>
             <button onclick="showModalDeleteOperation('${operation.id}', '${
        operation.description
      }')">
             <i class="fa-solid fa-trash text-xs mt-4 bg-red-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-red-600"></i>
             </button>
         </td>
      </tr>
      `;
    }
  } else {
    showElement(["#section--operations-no-results"]);
    hideElement(["#section--operations--results"]);
  }

  updateBalance()
};

//Validar operaciones
const validateOperation = () => {
  const description = $("#input--description").value.trim();
  const amount = $("#input--amount").value.trim();

  const amountRegex = /^-?\d+([.,]\d{1,2})?$/;

  if (description === "") {
    showElement(["#ivalid--description"]);
  } else {
    hideElement(["#ivalid--description"]);
  }

  if (amount === "" || !amountRegex.test(amount) || parseFloat(amount) === 0) {
    showElement(["#invalid--amount"]);
  } else {
    hideElement(["#invalid--amount"]);
  }

  const passesValidations =
    description !== "" && amountRegex.test(amount) && parseFloat(amount) !== 0;

  return passesValidations;
};

//Filtros
const filterOperations = (operations) => {
  const typeFilter = $("#filter--type-select").value;
  const categoryFilter = $("#category--filter-select").value;
  const fromDateFilter = $("#date--select").value;
  const orderFilter = $("#order--select").value;

  let filteredOperations = operations;

  if (typeFilter !== "Todos") {
    filteredOperations = filteredOperations.filter((operation) => {
      return operation.type.toLowerCase() === typeFilter.toLowerCase();
    });
  }

  if (categoryFilter !== "Todas") {
    filteredOperations = filteredOperations.filter((operation) => {
      const category = allCategories.find(
        (cat) => cat.id === operation.category
      );
      return category && category.id === categoryFilter;
    });
  }

  if (fromDateFilter) {
    filteredOperations = filteredOperations.filter(
      (operation) => new Date(operation.date) >= new Date(fromDateFilter)
    );
  }

  switch (orderFilter) {
    case "MAS_RECIENTES":
      filteredOperations.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "MENOS_RECIENTES":
      filteredOperations.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "MAYOR_MONTO":
      filteredOperations.sort((a, b) => b.amount - a.amount);
      break;
    case "MENOR_MONTO":
      filteredOperations.sort((a, b) => a.amount - b.amount);
      break;
    case "A/Z":
      filteredOperations.sort((a, b) =>
        a.description.localeCompare(b.description)
      );
      break;
    case "Z/A":
      filteredOperations.sort((a, b) =>
        b.description.localeCompare(a.description)
      );
      break;
    default:
      break;
  }

  if (filteredOperations.length) {
    renderOperations(filteredOperations);
    updateBalance(filteredOperations);
  } else {
    showElement(["#section--operations-no-results"]);
    hideElement(["#section--operations--results"]);
    updateBalance(filteredOperations);
  }
};

//Actualizar balance
const updateBalance = (operations) => {
  const allOperations = operations || getData("operations") || [];
  let totalEarnings = 0;
  let totalExpenses = 0;

  for (const operation of allOperations) {
    if (operation.type === "ganancia") {
      totalEarnings += operation.amount;
    } else if (operation.type === "gasto") {
      totalExpenses += operation.amount;
    }
  }

  const totalBalance = totalEarnings - totalExpenses;

  let balanceColorClass = "text-black";

  if (totalBalance > 0) {
    balanceColorClass = "text-green-500";
  } else if (totalBalance < 0) {
    balanceColorClass = "text-red-500";
  }

  $("#balance--total").classList.remove(
    "text-black",
    "text-green-500",
    "text-red-500"
  );
  $("#balance--total").classList.add(balanceColorClass);

  $("#balance--earning").innerText = `+$${totalEarnings.toFixed(2)}`;
  $("#balance--expense").innerText = `-$${totalExpenses.toFixed(2)}`;
  $("#balance--total").innerText =
    totalBalance >= 0
      ? `+$${totalBalance.toFixed(2)}`
      : `-$${Math.abs(totalBalance).toFixed(2)}`;

  if (allOperations.length === 0) {
    $("#balance--earning").innerText = `+$0.00`;
    $("#balance--expense").innerText = `-$0.00`;
    $("#balance--total").innerText = `$0.00`;
  }
};

//Guardar la info de las operaciones
const saveOperationInfo = (operationId) => {
  return {
    id: operationId ? operationId : randomIdGenerator(),
    description: $("#input--description").value,
    category: $("#category--form-select").value,
    date: $("#input--date").valueAsDate,
    amount: $("#input--amount").valueAsNumber,
    type: $("#input--type").value,
  };
};

//Agregar operaciones
const addOperation = () => {
  const currentData = getData("operations");
  currentData.push(saveOperationInfo());
  setData("operations", currentData);
};

//Mostrar el formulario para editar operaciones
const showFormEdit = (operationId) => {
  showElement([
    "#form--operation",
    "#btn--edit-operation-form",
    "#title--operation-edit",
  ]);
  hideElement([
    "#section--balance",
    "#section--filters",
    "#section--operations--results",
    "#section--operations-no-results",
    "#btn--submit-operation-form",
    "#title--operation-new",
  ]);
  $("#btn--edit-operation-form").setAttribute("data-id", operationId);
  const operationSelected = getData("operations").find(
    (operation) => operation.id === operationId
  );
  $("#input--description").value = operationSelected.description;
  $("#input--category").value = operationSelected.category;
  $("#input--date").valueAsDate = new Date(operationSelected.date);
  $("#input--amount").valueAsNumber = operationSelected.amount;
  $("#input--type").value = operationSelected.type;
};

//Editar operacion
const editOperation = () => {
  const operationId = $("#btn--edit-operation-form").getAttribute("data-id");
  const currentData = getData("operations").map((operation) => {
    if (operation.id === operationId) {
      return saveOperationInfo(operationId);
    }
    return operation;
  });
  setData("operations", currentData);
};


//Mostrar ventana modal eliminar operacion
const showModalDeleteOperation = (operationId, operationDescription) => {
  showElement(["#modal--delete", "#btn--delete-operation"]);
  hideElement(["#title--delete-category", "#btn--delete-category"]);
  $("#btn--delete-operation").setAttribute("data-id", operationId);
  $(".delete--id-operation").innerText = `${operationDescription}`;
  $("#btn--delete-operation").addEventListener("click", () => {
    const operationId = $("#btn--delete-operation").getAttribute("data-id");
    deleteOperation(operationId);
  });
};

//Eliminar operaciones
const deleteOperation = (operationId) => {
  const currentData = getData("operations").filter(
    (operation) => operation.id != operationId
  );
  setData("operations", currentData);
  window.location.reload();
};

//Categorias
//Guardar info de las categorias
const saveCategoryInfo = (categoryId) => {
  return {
    id: categoryId ? categoryId : randomIdGenerator(),
    categoryName: $("#input--category").value,
  };
};

//Agregar categorias
const addCategory = () => {
  const currentData = getData("categories");
  currentData.push(saveCategoryInfo());
  setData("categories", currentData);
  renderCategoriesTable(currentData)
  renderCategoriesFormOptions(currentData);
};

//Renderizar las categorias en el form
const renderCategoriesFormOptions = (categories) => {
  for (const category of categories) {
    $("#category--form-select").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `;
    $("#category--filter-select").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `;
  }
};

//Renderizar las categorias en la tabla
const renderCategoriesTable = (categories) => {
  cleanContainer(["#categories--table-body"])
  const allCategories = getData("categories") || defaultCategories;
  for (const category of allCategories) {
    $("#categories--table-body").innerHTML += `
    <tr class="flex flex-wrap justify-between lg:flex-nowrap lg:items-center">
         <td class="w-1/2 text-base mt-4">${category.categoryName}</td>
         <td class="w-1/2 text-right lg:text-right">
             <button onclick="showFormCategoryEdit('${category.id}')"><i class="fa-regular fa-pen-to-square text-xs mt-4 bg-green-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-green-600"></i></button>
             <button onclick="showModalDeleteCategory('${category.id}', '${category.categoryName}')"><i class="fa-solid fa-trash text-xs mt-4 bg-red-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-red-600"></i></button>
         </td>
      </tr>
    `;
  }
};

//Mostrar formulario para editar categorias
const showFormCategoryEdit = (categoryId) => {
  showElement([
    "#form--categories",
    "#title--operation-edit",
    "#btn--edit-category-form",
  ]);
  hideElement([
    "#add--category-title",
    "#categories--table",
    "#btn--add-category",
  ]);
  $("#btn--edit-category-form").setAttribute("data-id", categoryId);
  const categorySelected = getData("categories").find(
    (category) => category.id === categoryId
  );
  $("#input--category").value = categorySelected.categoryName;
};

//Editar categorías
const editCategory = () => {
  const categoryId = $("#btn--edit-category-form").getAttribute("data-id");
  const currentData = getData("categories").map((category) => {
    if (category.id === categoryId) {
      return {
        id: categoryId,
        categoryName: $("#input--category").value,
      };
    }
    return category;
  });
  setData("categories", currentData);
  renderCategoriesTable(currentData)
};

//Eliminar categorías
const deleteCategory = (categoryId) => {
  const allCategories = getData("categories") || defaultCategories;

  const currentCategories = allCategories.filter(
    (category) => category.id !== categoryId
  );

  setData("categories", currentCategories);

  const currentData = getData("operations").filter(
    (operation) => operation.category !== categoryId
  );
  setData("operations", currentData);
  renderCategoriesTable(currentCategories)
};

//Mostrar ventana modal para eliminar categorias
const showModalDeleteCategory = (categoryId, categoryName) => {
  showElement(["#modal--delete", "#title--delete-category", "#btn--delete-category"]);
  hideElement(["#title--delete-operation", "#btn--delete-operation"]);
  $("#btn--delete-category").setAttribute("data-id", categoryId);
  $(".delete--id-category").innerText = `${categoryName}`;
  $("#btn--delete-category").addEventListener("click", () => {
    const categoryId = $("#btn--delete-category").getAttribute("data-id");
    deleteCategory(categoryId);
  });
};

//Reportes
//Categoría con mayor ganancia
const higherEarningsCategory = (operations) => {
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

  let highestEarningCategory = "";
  let highestEarningAmount = 0;

  for (const categoryID in earningsByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryID
    )?.categoryName;

    if (earningsByCategory[categoryID] > highestEarningAmount) {
      highestEarningAmount = earningsByCategory[categoryID];
      highestEarningCategory = categoryName;
    }
  }

  return {highestEarningCategory, highestEarningAmount}

};

//Renderizar categoría con mayor ganancia
const renderHigherEarningsCategory = (getHigherEarningsCategory) =>{
  const {highestEarningCategory, highestEarningAmount} = getHigherEarningsCategory()

  $("#higher--earnings-category").innerText = highestEarningCategory || "N/A";
  $("#higher--earnings-amount").innerText = `+$${highestEarningAmount.toFixed(2)}`;
}

//Categoría con mayor gasto
const higherExpenseCategory = (operations) => {
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

  let highestExpenseCategory = "";
  let highestExpenseAmount = 0;

  for (const categoryID in expensesByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryID
    )?.categoryName;

    if (expensesByCategory[categoryID] > highestExpenseAmount) {
      highestExpenseAmount = expensesByCategory[categoryID];
      highestExpenseCategory = categoryName;
    }
  }

  return {highestExpenseCategory, highestExpenseAmount}

};

//Renderizar categoría con mayor gasto
const renderHigherExpenseCategory = (getHigherExpenseCategory) =>{
  const {highestExpenseCategory, highestExpenseAmount} = getHigherExpenseCategory()

  $("#higher--expenses-category").innerText = highestExpenseCategory;
  $("#higher--expenses-amount").innerText = `-$${highestExpenseAmount.toFixed(2)}`;
}

//Categoría con mayor balance
const highestBalanceCategory = () => {
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
  const balancesByCategory = {};

  for (const operation of allOperations) {
    const { category, amount, type } = operation;

    if (type === "ganancia" || type === "gasto") {
      if (balancesByCategory[category]) {
        balancesByCategory[category] += type === "ganancia" ? amount : -amount;
      } else {
        balancesByCategory[category] = type === "ganancia" ? amount : -amount;
      }
    }
  }

  let highestBalanceCategory = "";
  let highestBalanceAmount = 0;

  for (const categoryID in balancesByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryID
    )?.categoryName;

    if (balancesByCategory[categoryID] > highestBalanceAmount) {
      highestBalanceAmount = balancesByCategory[categoryID];
      highestBalanceCategory = categoryName;
    }
  }

  return {highestBalanceCategory, highestBalanceAmount}

};

//Renderizar categoría con mayor balance
const renderHighestBalanceCategory = (getHighestBalanceCategory) =>{
  const {highestBalanceCategory, highestBalanceAmount} = getHighestBalanceCategory()

  $("#higher--balance-category").innerText = highestBalanceCategory || "N/A";
  $("#higher--balance-amount").innerText = `$${highestBalanceAmount.toFixed(2)}`;
}

//Mes con mayor ganancia
const higherEarningsMonth = () => {
  const allOperations = getData("operations") || [];
  const earningsByMonth = {};

  for (const operation of allOperations) {
    if (operation.type === "ganancia") {
      const operationDate = new Date(operation.date);
      const monthYear = `${
        operationDate.getMonth() + 1
      }-${operationDate.getFullYear()}`;

      if (earningsByMonth[monthYear]) {
        earningsByMonth[monthYear] += operation.amount;
      } else {
        earningsByMonth[monthYear] = operation.amount;
      }
    }
  }

  let highestEarningMonth = "";
  let highestEarningAmount = 0;

  for (const monthYear in earningsByMonth) {
    const earningsAmount = earningsByMonth[monthYear];

    if (earningsAmount > highestEarningAmount) {
      highestEarningAmount = earningsAmount;
      highestEarningMonth = monthYear;
    }
  }

  return {highestEarningMonth, highestEarningAmount}

};

//Renderizar mes con mayor ganancia
const renderHigherEarningsMonth = (getHigherEarningsMonth) =>{
  const {highestEarningMonth, highestEarningAmount} = getHigherEarningsMonth()

  $("#higher--earnings-month").innerText = highestEarningMonth || "N/A";
  $("#higher--earnings-month-amount").innerText = `+$${highestEarningAmount.toFixed(2)}`;
}

//Mes con mayor gasto
const higherExpenseMonth = () => {
  const allOperations = getData("operations") || [];
  const expensesByMonth = {};

  for (const operation of allOperations) {
    if (operation.type === "gasto") {
      const operationDate = new Date(operation.date);
      const monthYear = `${
        operationDate.getMonth() + 1
      }-${operationDate.getFullYear()}`;

      if (expensesByMonth[monthYear]) {
        expensesByMonth[monthYear] += operation.amount;
      } else {
        expensesByMonth[monthYear] = operation.amount;
      }
    }
  }

  let highestExpenseMonth = "";
  let highestExpenseAmount = 0;

  for (const monthYear in expensesByMonth) {
    const expensesAmount = expensesByMonth[monthYear];

    if (expensesAmount > highestExpenseAmount) {
      highestExpenseAmount = expensesAmount;
      highestExpenseMonth = monthYear;
    }
  }

  return {highestExpenseAmount, highestExpenseMonth}
};

//Renderizar mes con mayor gasto
const renderHigherExpenseMonth = (getHigherExpenseMonth) =>{
  const {highestExpenseAmount, highestExpenseMonth} = getHigherExpenseMonth()

  $("#higher--expenses-month").innerText = highestExpenseMonth || "N/A";
  $("#higher--expenses-month-amount").innerText = `-$${highestExpenseAmount.toFixed(2)}`;
}

//Totales por categorías
const totalsByCategory = () => {
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

  const renderedData = [];

  for (const categoryID in totalsByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryID
    )?.categoryName;
    const { ganancia, gasto } = totalsByCategory[categoryID];
    const balance = ganancia - gasto;

    renderedData.push({
      categoryName: categoryName || "N/A",
      ganancia,
      gasto,
      balance,
    });
  }

  return renderedData;
};


const renderByCategories = (getTotalsByCategory) => {
  const calculateTotalsByCategory = getTotalsByCategory();

  cleanContainer("#table--totals-categories");

  for (const data of calculateTotalsByCategory) {
    const { categoryName, ganancia, gasto, balance } = data;

    $("#table--totals-categories").innerHTML += `
      <tr class="flex justify-items-end">
        <td class="w-1/4 mr-1 text-left">${categoryName}</td>
        <td class="w-1/4 mr-1 text-green-500 text-center">+$${ganancia}</td>
        <td class="w-1/4 mr-1 text-red-500 text-center">-$${gasto}</td>
        <td class="w-1/4 mr-1 text-center">${
          balance >= 0 ? `+$${balance}` : `-$${balance}`
        }</td>
      </tr>
    `;
  }
};

//Totales por mes
const totalsByMonth = () => {
  const allOperations = getData("operations") || [];
  const totalsByMonth = {};

  for (const operation of allOperations) {
    const { amount, type, date } = operation;

    if (type === "ganancia" || type === "gasto") {
      const operationDate = new Date(date);
      const monthYear = `${
        operationDate.getMonth() + 1
      }-${operationDate.getFullYear()}`;

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

  const totals = [];

  for (const monthYear in totalsByMonth) {
    const { ganancia, gasto } = totalsByMonth[monthYear];
    const balance = ganancia - gasto;

    totals.push({
      monthYear,
      ganancia,
      gasto,
      balance,
    });
  }

  return totals;
};

const renderByMonth = (getTotalsByMonth) => {
  const totalsByMonth = getTotalsByMonth();

  cleanContainer("#table--totals-month");

  for (const data of totalsByMonth) {
    const { monthYear, ganancia, gasto, balance } = data;

    $("#table--totals-month").innerHTML += `
      <tr class="flex justify-items-end">
        <td class="w-1/4 mr-1 text-left">${monthYear}</td>
        <td class="w-1/4 mr-1 text-green-500 text-center">+$${ganancia}</td>
        <td class="w-1/4 mr-1 text-red-500 text-center">-$${gasto}</td>
        <td class="w-1/4 mr-1 text-center">${
          balance >= 0 ? `+$${balance}` : `-$${balance}`
        }</td>
      </tr>
    `;
  }
};


const showReports = (operations) => {
  const allOperations = operations || getData("operations") || [];

  const earnings = allOperations.filter(
    (operation) => operation.type === "ganancia"
  );
  const expenses = allOperations.filter(
    (operation) => operation.type === "gasto"
  );

  if (earnings.length >= 1 && expenses.length >= 1) {
    showElement(["#reports--results"]);
    hideElement(["#reports--no-results"]);
  } else {
    showElement(["#reports--no-results"]);
    hideElement(["#reports--results"]);
  }
};

//Funcion inicializar la app
const initializeApp = () => {
  setData("operations", allOperations);
  setData("categories", allCategories);
  setFilterDate();
  filterOperations(allOperations);
  renderCategoriesTable(allCategories);
  renderCategoriesFormOptions(allCategories);
  updateBalance(allOperations);
  showReports(allOperations);
  renderHigherEarningsCategory(higherEarningsCategory)
  renderHigherExpenseCategory(higherExpenseCategory)
  renderHighestBalanceCategory(highestBalanceCategory)
  renderHigherEarningsMonth(higherEarningsMonth)
  renderHigherExpenseMonth(higherExpenseMonth)
  renderByCategories(totalsByCategory);
  renderByMonth(totalsByMonth)


  // EVENTOS
  //Abrir menu responsive
  $("#btn--open-nav").addEventListener("click", () => {
    showElement(["#nav--bar", "#btn--close-nav"]);
    hideElement(["#btn--open-nav"]);
  });

  //Cerrar menu responsive
  $("#btn--close-nav").addEventListener("click", () => {
    hideElement(["#nav--bar", "#btn--close-nav"]);
    showElement(["#btn--open-nav"]);
  });

  //Ocultar filtros
  $("#btn--hide-filters").addEventListener("click", (e) => {
    e.preventDefault();
    hideElement(["#all--filters", "#btn--hide-filters"]);
    showElement(["#btn--show-filters"]);
  });

  //Mostrar filtros
  $("#btn--show-filters").addEventListener("click", (e) => {
    e.preventDefault();
    showElement(["#all--filters", "#btn--hide-filters"]);
    hideElement(["#btn--show-filters"]);
  });

  //Filtros
  $("#section--filters").addEventListener("change", () => {
    const operationsToFilter = getData("operations");
    filterOperations(operationsToFilter);
  });

  //Mostrar seccion categorias
  $("#btn--go--categories").addEventListener("click", () => {
    hideElement([
      "#section--balance",
      "#section--filters",
      "#section--operations--results",
      "#section--operations-no-results",
      "#section--reports",
      "#form--operation"
    ]);
    showElement(["#section--categories"]);
  });

  //Cerrar ventana modal
  $("#btn--close-modal").addEventListener("click", () => {
    hideElement(["#modal--delete"]);
  });

  //Cerrar ventana modal bis
  $("#btn--close-modal-bis").addEventListener("click", () => {
    hideElement(["#modal--delete"]);
  });

  //Abrir formulario nueva operacion
  $("#btn--add-operation").addEventListener("click", () => {
    showElement(["#form--operation"]);
    hideElement([
      "#section--balance",
      "#section--filters",
      "#section--operations--results",
      "#section--operations-no-results",
      "#btn--edit-operation-form",
    ]);
  });

  //Abrir formulario nueva operacion bis
  $("#btn--add-operation-clon").addEventListener("click", () => {
    showElement(["#form--operation"]);
    hideElement([
      "#section--balance",
      "#section--filters",
      "#section--operations--results",
      "#section--operations-no-results",
      "#btn--edit-operation-form",
    ]);
  });

  //Agregar nueva operación
  $("#btn--submit-operation-form").addEventListener("click", (e) => {
    e.preventDefault();
    if (validateOperation()) {
      addOperation();
      $("#form").reset();
    }
  });

  //Editar las operaciones
  $("#btn--edit-operation-form").addEventListener("click", (e) => {
    e.preventDefault();
    editOperation();
    window.location.reload();
  });

  //Agregar categorías
  $("#btn--add-category").addEventListener("click", () => {
    addCategory();
    $("#input--category").value = ""
  });

  //Editar categorias
  $("#btn--edit-category-form").addEventListener("click", (e) => {
    e.preventDefault();
    editCategory();
    window.location.reload();
  });


  //Eliminar categorías
  $("#btn--delete-category").addEventListener("click", () =>{
    hideElement(["#modal--delete"])
  })

  //Abrir ventana reportes
  $("#btn--go--reports").addEventListener("click", () => {
    hideElement([
      "#section--main-balance",
      "#section--balance",
      "#section--filters",
      "#form--operation",
      "#section--categories",
      "#section--operations--results",
      "#section--operations-no-results",
    ]);
    showElement(["#section--reports"]);
  });

  filterOperations(allOperations);
};

window.addEventListener("load", initializeApp);
