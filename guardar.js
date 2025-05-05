const embed = {
    embeds: [{
      title: `📦 Novo Pedido - ${estabelecimento.toUpperCase()}`,
      color: 0x00AEFF,
      fields: [
        { name: "👤 Nome", value: nome, inline: true },
        { name: "🕊️ Pombo", value: `Enviado por ${nome}`, inline: true },
        ...itensSelecionados.map(item => ({
          name: `🧾 ${item.nome}`,
          value: `Quantidade: ${item.quantidade}\nValor estimado: $${item.minTotal} - $${item.maxTotal}`,
          inline: false
        })),
        { name: "📝 Observações", value: obs || "Nenhuma", inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };


  'https://discord.com/api/webhooks/1368673501493596161/_hkpeBJ1UVe_0Fd-9Md21Txp9VS7BDiH-qu3wrmAaPn1kain3WXrsHNdkMhBEkd1P4AY'