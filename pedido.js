import { receitasFazenda } from "./receitasFazenda.js";
import { receitasFerraria } from "./receitasFerraria.js";
import { receitasSaloon } from "./receitasSaloon.js";

document.addEventListener("DOMContentLoaded", () => {
  const selectLocal = document.getElementById("estabelecimento");
  const tabelaCorpo = document.querySelector("#tabelaPedidos tbody");
  const totalGeralEl = document.createElement("div");
  const btnEnviar = document.getElementById("enviar");
  const inputNome = document.getElementById("nome");
  const inputPombo = document.getElementById("pombo");
  const inputObservacao = document.getElementById("obs");

  let receitasAtuais = {};

  totalGeralEl.id = "total-geral";
  totalGeralEl.style.marginTop = "1rem";
  document.querySelector("#itens-container").appendChild(totalGeralEl);

  selectLocal.addEventListener("change", () => {
    const local = selectLocal.value;
    tabelaCorpo.innerHTML = "";

    if (local === "fazenda") receitasAtuais = receitasFazenda;
    if (local === "ferraria") receitasAtuais = receitasFerraria;
    if (local === "saloon") receitasAtuais = receitasSaloon;

    if (!local) {
      document.getElementById("itens-container").style.display = "none";
      return;
    }

    document.getElementById("itens-container").style.display = "block";

    Object.entries(receitasAtuais).forEach(([nome, { minPrice, maxPrice }]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${nome}</td>
        <td>
          <input 
            type="number" 
            class="quantidade" 
            value="0" 
            min="0"
            data-min="${minPrice}" 
            data-max="${maxPrice}" />
        </td>
        <td>R$ ${minPrice.toFixed(2)} – R$ ${maxPrice.toFixed(2)}</td>
      `;
      tabelaCorpo.appendChild(row);
    });

    tabelaCorpo.querySelectorAll(".quantidade").forEach((input) =>
      input.addEventListener("input", calcularTotal)
    );

    calcularTotal();
  });

  function calcularTotal() {
    let totalGeral = 0;

    tabelaCorpo.querySelectorAll("tr").forEach((row) => {
      const input = row.querySelector(".quantidade");
      const qtd = Number(input.value) || 0;
      const min = Number(input.dataset.min);
      const max = Number(input.dataset.max);

      let precoUnitario = qtd < 500 ? max : min;
      let totalItem = qtd * precoUnitario;

      const precoCell = row.querySelector("td:last-child");
      precoCell.textContent = `R$ ${totalItem.toFixed(2)}`;

      totalGeral += totalItem;
    });

    totalGeralEl.textContent = `Total: R$ ${totalGeral.toFixed(2)}`;
  }

  function enviarPedidoBackend(nome, pombo, observacao, pedidos) {
    const estabelecimento = selectLocal.options[selectLocal.selectedIndex].text;

    pedidos.forEach((item) => {
      const payload = {
        client_name: nome,
        product_name: item.nomeItem,
        quantity: item.quantidade,
        order_price: item.total,
        observation: observacao || ""
      };

      fetch('https://backend-webhooker.onrender.com/order/', {  // <-- Substitua com a URL real do seu backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (response.ok) {
          console.log(`Pedido de ${item.nomeItem} enviado com sucesso!`);
        } else {
          console.error(`Erro ao enviar o pedido de ${item.nomeItem}.`);
        }
      })
      .catch(err => {
        console.error('Erro na comunicação com o backend:', err);
      });
    });

    alert("Todos os itens foram enviados com sucesso!");
  }

  btnEnviar.addEventListener("click", () => {
    const nome = inputNome.value.trim();
    const pombo = inputPombo.value.trim();
    const observacao = inputObservacao.value.trim();

    if (!nome || !pombo) {
      return alert("Preencha Nome e Pombo antes de finalizar.");
    }

    const pedidos = [];
    tabelaCorpo.querySelectorAll("tr").forEach((row) => {
      const input = row.querySelector(".quantidade");
      const qtd = Number(input.value);
      if (qtd > 0) {
        const nomeItem = row.cells[0].textContent;
        const min = Number(input.dataset.min);
        const max = Number(input.dataset.max);
        let precoUnitario = qtd < 500 ? max : min;

        pedidos.push({
          nomeItem,
          quantidade: qtd,
          total: qtd * precoUnitario
        });
      }
    });

    if (pedidos.length === 0) {
      return alert("Adicione pelo menos um item ao pedido.");
    }

    enviarPedidoBackend(nome, pombo, observacao, pedidos);
  });
});
