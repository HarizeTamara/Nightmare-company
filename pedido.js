import { receitasFazenda } from "./receitasFazenda.js";
import { receitasFerraria } from "./receitasFerraria.js";
import { receitasSaloon } from "./receitasSaloon.js";
import { webhookURL } from '@harizetamara/webhook-config';

document.addEventListener("DOMContentLoaded", () => {
  const selectLocal = document.getElementById("estabelecimento");
  const tabelaCorpo = document.querySelector("#tabelaPedidos tbody");
  const totalGeralEl = document.createElement("div");
  const btnEnviar = document.getElementById("enviar");
  const inputNome = document.getElementById("nome");
  const inputPombo = document.getElementById("pombo");
  const inputObservacao = document.getElementById("obs");

  let receitasAtuais = {};

  // Adiciona o total geral abaixo da tabela
  totalGeralEl.id = "total-geral";
  totalGeralEl.style.marginTop = "1rem";
  document.querySelector("#itens-container").appendChild(totalGeralEl);

  // Atualiza a tabela ao selecionar o estabelecimento
  selectLocal.addEventListener("change", () => {
    const local = selectLocal.value;
    tabelaCorpo.innerHTML = ""; // Limpa a tabela

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

  // Calcula o total mínimo e máximo
  function calcularTotal() {
    let totalMin = 0,
      totalMax = 0;

    tabelaCorpo.querySelectorAll("tr").forEach((row) => {
      const input = row.querySelector(".quantidade");
      const qtd = Number(input.value) || 0;
      const min = Number(input.dataset.min);
      const max = Number(input.dataset.max);

      totalMin += qtd * min;
      totalMax += qtd * max;
    });

    totalGeralEl.textContent = `Total mínimo: R$ ${totalMin.toFixed(
      2
    )} — Total máximo: R$ ${totalMax.toFixed(2)}`;
  }

  // Envia o pedido para o Discord
  function enviarPedidoDiscord(nome, pombo, observacao, pedidos) {
    const embed = {
      title: "📦 Novo Pedido",
      description: `🧾 Pedido de ${nome} (🕊️ Pombo: ${pombo})`,
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
                `${item.nomeItem} - Quantidade: ${item.quantidade} - R$ ${item.totalMin.toFixed(
                  2
                )} - R$ ${item.totalMax.toFixed(2)}`
            )
            .join("\n"),
          inline: false,
        },
        {
          name: "Total Mínimo",
          value: `R$ ${pedidos
            .reduce((acc, item) => acc + item.totalMin, 0)
            .toFixed(2)}`,
          inline: true,
        },
        {
          name: "Total Máximo",
          value: `R$ ${pedidos
            .reduce((acc, item) => acc + item.totalMax, 0)
            .toFixed(2)}`,
          inline: true,
        },
      ],
      color: 3066993,
    };

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

  // Evento de clique para enviar o pedido
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
        pedidos.push({
          nomeItem,
          quantidade: qtd,
          totalMin: qtd * min,
          totalMax: qtd * max,
        });
      }
    });

    if (pedidos.length === 0) {
      return alert("Adicione pelo menos um item ao pedido.");
    }

    enviarPedidoDiscord(nome, pombo, observacao, pedidos);
  });
});