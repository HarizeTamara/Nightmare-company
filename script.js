const localStorageKey = 'to-do-list-gn'

function validateIfExistsNewTask()
{
    let values     = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
    let inputValue = document.getElementById('input-new-task').value
    let exists     = values.find(x => x.name == inputValue)
    return !exists ? false : true
}

function newTask()
{
    let input = document.getElementById('input-new-task')
    input.style.border = ''

    // validation
    if(!input.value)
    {
        input.style.border = '1px solid red'
        alert('Digite algo para inserir em sua lista')
    }
    else if(validateIfExistsNewTask())
    {
        alert('Já existe uma task com essa descrição')
    }
    else
    {
        // increment to localStorage
        let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
        values.push({
            name: input.value
        })
        localStorage.setItem(localStorageKey,JSON.stringify(values))
        showValues()
    }
    input.value = ''
}

function showValues()
{
    let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
    let list = document.getElementById('to-do-list')
    list.innerHTML = ''
    for(let i = 0; i < values.length; i++)
    {
        list.innerHTML += `<li>${values[i]['name']}<button id='btn-ok' onclick='removeItem("${values[i]['name']}")'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg></button></li>`
    }
}

function removeItem(data)
{
    let values = JSON.parse(localStorage.getItem(localStorageKey) || "[]")
    let index = values.findIndex(x => x.name == data)
    values.splice(index,1)
    localStorage.setItem(localStorageKey,JSON.stringify(values))
    showValues()
}

showValues()

// Popula o seletor com as receitas da Fazenda
function populateRecipeSelect() {
    const select = document.getElementById("recipe-select");
    Object.keys(recipesFazenda).forEach(recipeName => {
        const option = document.createElement("option");
        option.value = recipeName;
        option.textContent = recipeName;
        select.appendChild(option);
    });
}

// Emojis para ingredientes
function getEmoji(ingredientName) {
    const map = {
        "Cenoura": "🥕", "Batata": "🥔", "Tomate": "🍅", "Alface": "🥬", "Repolho": "🥬",
        "Espinafre": "🌿", "Alecrim": "🌿", "Hortelã": "🌿", "Manjericão": "🌿",
        "Maçã": "🍎", "Banana": "🍌", "Uva": "🍇", "Milho": "🌽", "Trigo": "🌾",
        "Água": "💧", "Cana de Açúcar": "🎋", "Melado de Cana": "🍯", "Leite": "🥛"
    };
    return map[ingredientName] || "🧺";
}

// Cálculo da receita
function calculateRecipe() {
    const recipeName = document.getElementById("recipe-select").value;
    const quantity = parseInt(document.getElementById("recipe-quantity").value);
    const resultEl = document.getElementById("calculation-result");

    if (!recipeName || isNaN(quantity) || quantity <= 0) {
        resultEl.innerHTML = "Por favor, selecione uma receita e insira uma quantidade válida.";
        return;
    }

    const recipe = recipesFazenda[recipeName];
    const totalYield = recipe.yield * quantity;
    const minTotal = recipe.minPrice * totalYield;
    const maxTotal = recipe.maxPrice * totalYield;

    let ingredientsHTML = "<ul class='ingredients-list'>";
    recipe.ingredients.forEach(ingredient => {
        const emoji = getEmoji(ingredient.name);
        const totalQty = ingredient.quantity * quantity;
        ingredientsHTML += `<li class='ingredient-item'>${emoji} ${ingredient.name}: ${totalQty}</li>`;
    });
    ingredientsHTML += "</ul>";

    resultEl.innerHTML = `
        <strong>${recipeName}</strong><br>
        Quantidade total: ${totalYield}<br>
        Receita estimada: R$ ${minTotal.toFixed(2)} - R$ ${maxTotal.toFixed(2)}<br>
        <strong>Ingredientes:</strong><br>
        ${ingredientsHTML}
    `;
}

// Inicializa tudo
function init() {
    showValues();
    populateRecipeSelect();
    document.getElementById("calculate-btn").addEventListener("click", calculateRecipe);
}

init();
