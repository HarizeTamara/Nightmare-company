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
        <td>R$ 0.00</td>
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

  function enviarPedidoDiscord(nome, pombo, observacao, pedidos) {
    const estabelecimento = selectLocal.options[selectLocal.selectedIndex].text;

    const embed = {
      title: `📦 Novo Pedido - ${estabelecimento}`,
      description: `🧾 Pedido de ${nome} | 🕊️ Pombo: ${pombo}`,
      fields: [
        {
          name: "📝 Observação",
          value: observacao || "Sem observações",
          inline: false,
        },
        {
          name: "Itens",
          value: pedidos
            .map(
              (item) =>
                `${item.nomeItem} - Qtd: ${item.quantidade} - Total: R$ ${item.total.toFixed(2)}`
            )
            .join("\n"),
          inline: false,
        },
        {
          name: "Total Geral",
          value: `R$ ${pedidos
            .reduce((acc, item) => acc + item.total, 0)
            .toFixed(2)}`,
          inline: false,
        },
      ],
      color: 3066993,
    };

    const webhookURL = "https://discord.com/api/webhooks/1371591431549878322/1a65WMk6VBwbbZNEV-3yP_wGrIu7WRi2B7xdHR90fp_2HjOqPKWRRC-7w1lG8vhvdXfQ";

    fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed] }),
    }).then((response) => {
      if (response.ok) {
        alert("Pedido enviado com sucesso!");
      } else {
        alert("Erro ao enviar o pedido.");
      }
    });
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
        let totalUnitario = qtd < 500 ? max : min;

        pedidos.push({
          nomeItem,
          quantidade: qtd,
          total: qtd * totalUnitario,
        });
      }
    });

    if (pedidos.length === 0) {
      return alert("Adicione pelo menos um item ao pedido.");
    }

    enviarPedidoDiscord(nome, pombo, observacao, pedidos);
  });
});
