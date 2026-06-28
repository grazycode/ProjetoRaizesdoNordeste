const cardapioDados = [
    { id: 1, categoria: "Entrada", nome: "Bolinho de moqueca de camarão", preco: 25.00, icone: "🍤" },
    { id: 2, categoria: "Entrada", nome: "Pães artesanais", preco: 15.00, icone: "🍞" },
    { id: 3, categoria: "Entrada", nome: "Dadinho de macaxeira", preco: 18.00, icone: "🧀" },
    
    { id: 4, categoria: "Prato principal", nome: "Ravióli de Carne de Sol", preco: 45.00, icone: "🍝" },
    { id: 5, categoria: "Prato principal", nome: "Estrogonofe de Palmito", preco: 38.00, icone: "🍲" },
    { id: 6, categoria: "Prato principal", nome: "Moqueca à Moda Sergipana", preco: 65.00, icone: "🥘" },
    { id: 7, categoria: "Prato principal", nome: "Camarão à Moda Sergipana", preco: 60.00, icone: "🍤" },
    { id: 8, categoria: "Prato principal", nome: "Salmão Gramado ao Molho de Maracujá", preco: 55.00, icone: "🐟" },
    
    { id: 9, categoria: "Sobremesa", nome: "Banana real", preco: 12.00, icone: "🍌" },
    { id: 10, categoria: "Sobremesa", nome: "Pudim", preco: 10.00, icone: "🍮" },
    { id: 11, categoria: "Sobremesa", nome: "Brownie com Sorvete de Ninho", preco: 16.00, icone: "🍨" },
    { id: 12, categoria: "Sobremesa", nome: "Manjar de coco", preco: 12.00, icone: "🥥" },
    
    { id: 13, categoria: "Bebida", nome: "H2O", preco: 7.00, icone: "🥤" },
    { id: 14, categoria: "Bebida", nome: "Suco de cajá", preco: 8.00, icone: "🍹" },
    { id: 15, categoria: "Bebida", nome: "Sprite", preco: 6.00, icone: "🥫" },
    { id: 16, categoria: "Bebida", nome: "Café", preco: 4.00, icone: "☕" },
    { id: 17, categoria: "Bebida", nome: "Caipirinha", preco: 15.00, icone: "🍹" },
    { id: 18, categoria: "Bebida", nome: "Margarita (Drink)", preco: 18.00, icone: "🍸" },
    { id: 19, categoria: "Bebida", nome: "Suco de graviola", preco: 8.00, icone: "🍹" }
];

// ESTADO GLOBAL DA APLICAÇÃO
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
let carrinho = []; 
let totalPedidoGlobal = 0;
let descontoAtivo = 0; // Armazena o desconto em dinheiro ativo
let timeoutPagamento = null;

let usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [
    { nome: "Fulano de Tal", email: "teste@teste.com", senha: "123", pontos: 10 }
];

let listaPedidosRealizados = JSON.parse(localStorage.getItem('listaPedidosRealizados')) || [];

window.onload = function() {
    renderizarCardapio();
    atualizarInterfaceUsuario();
    atualizarAbaPedidos();
    configurarMascarasCartao();
};

// FUNÇÃO PARA NOTIFICAÇÃO INTERNA
function exibirNotificacao(mensagem) {
    let container = document.getElementById('notificacao-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificacao-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '3000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.background = '#2c2520';
    toast.style.color = '#ffffff';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.95rem';
    toast.style.borderLeft = '4px solid #d35400';
    toast.style.whiteSpace = 'pre-line';
    toast.style.minWidth = '280px';
    toast.style.animation = 'surgimento 0.3s ease-in-out';
    toast.innerText = message = mensagem;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}

function navegar(idSecao) {
    fecharModais();
    const secoes = document.querySelectorAll('.secao');
    secoes.forEach(sec => sec.classList.remove('ativa'));
    
    const secaoAlvo = document.getElementById(idSecao);
    if (secaoAlvo) {
        secaoAlvo.classList.add('ativa');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarCardapio() {
    const container = document.getElementById('conteudo-cardapio');
    if (!container) return;
    container.innerHTML = "";
    let categorias = ["Entrada", "Prato principal", "Sobremesa", "Bebida"];

    categorias.forEach(cat => {
        const divCat = document.createElement('div');
        divCat.innerHTML = `<h3 class="categoria-titulo">${cat}</h3>`;
        
        const containerProdutos = document.createElement('div');
        containerProdutos.className = "produtos-container";

        const itensFiltrados = cardapioDados.filter(p => p.categoria === cat);
        itensFiltrados.forEach(prod => {
            const divProd = document.createElement('div');
            divProd.className = "produto-item";
            divProd.innerHTML = `
                <div class="produto-info">
                    <div class="produto-icone">${prod.icone}</div>
                    <div><strong>${prod.nome}</strong><br><span style="color: var(--terracota); font-weight: 600;">R$ ${prod.preco.toFixed(2)}</span></div>
                </div>
                <button class="btn-add" onclick="adicionarAoCarrinho(${prod.id})">+ Adicionar</button>
            `;
            containerProdutos.appendChild(divProd);
        });
        divCat.appendChild(containerProdutos);
        container.appendChild(divCat);
    });
}

/* GERENCIAMENTO DO CARRINHO */
function adicionarAoCarrinho(idProduto) {
    if (!usuarioLogado) {
        exibirNotificacao("⚠️ Atenção: Antes de realizar o pedido ou adicionar itens, você precisa realizar o seu cadastro/login!");
        navegar('login');
        return;
    }
    const produto = cardapioDados.find(p => p.id === idProduto);
    if (!produto) return;

    const itemNoCarrinho = carrinho.find(item => item.id === idProduto);

    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade += 1;
    } else {
        carrinho.push({ 
            id: produto.id, 
            nome: produto.nome, 
            preco: produto.preco, 
            icone: produto.icone, 
            quantidade: 1 
        });
    }
    atualizarCarrinho();
}

function alterarQuantidade(idProduto, delta) {
    const item = carrinho.find(i => i.id === idProduto);
    if (!item) return;

    item.quantidade += delta;
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.id !== idProduto);
    }
    atualizarCarrinho();
}

function atualizarCarrinho() {
    let totalItensContador = 0;
    const containerItens = document.getElementById('itens-carrinho');
    if (!containerItens) return;
    containerItens.innerHTML = "";
    
    let subtotalGeral = 0;
    if(carrinho.length === 0) {
        containerItens.innerHTML = "<p style='color: #777; text-align: center;'>Seu carrinho está vazio.</p>";
        descontoAtivo = 0; 
    } else {
        carrinho.forEach((item) => {
            totalItensContador += item.quantidade;
            const subtotalItem = item.preco * item.quantidade;
            subtotalGeral += subtotalItem;
            
            const div = document.createElement('div');
            div.className = "carrinho-item";
            div.innerHTML = `
                <span>${item.icone} ${item.nome} (R$ ${item.preco.toFixed(2)})</span>
                <div class="carrinho-controles">
                    <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span class="qtd-num">${item.quantidade}</span>
                    <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    <span style="font-weight: 600; margin-left: 10px; min-width: 70px; text-align: right;">R$ ${subtotalItem.toFixed(2)}</span>
                </div>
            `;
            containerItens.appendChild(div);
        });
    }
    
    const contador = document.getElementById('contador-carrinho');
    if (contador) contador.innerText = totalItensContador;

    const txtDesconto = document.getElementById('resumo-desconto');
    if (descontoAtivo > 0 && carrinho.length > 0) {
        txtDesconto.innerText = `Desconto Fidelidade: -R$ ${descontoAtivo.toFixed(2)}`;
        txtDesconto.style.display = "block";
    } else {
        txtDesconto.style.display = "none";
    }

    totalPedidoGlobal = Math.max(0, subtotalGeral - descontoAtivo);
    
    const txtTotal = document.getElementById('total-carrinho');
    if (txtTotal) txtTotal.innerText = `Total: R$ ${totalPedidoGlobal.toFixed(2)}`;
}

function resgatarDesconto(custoPontos, valorDesconto) {
    if (!usuarioLogado) {
        exibirNotificacao("⚠️ Entre na sua conta para poder resgatar descontos fidelidade!");
        navegar('login');
        return;
    }
    
    if (carrinho.length === 0) {
        exibirNotificacao("⚠️ Adicione itens ao seu carrinho antes de aplicar um desconto!");
        navegar('cardapio');
        return;
    }

    if (descontoAtivo > 0) {
        exibirNotificacao("⚠️ Você já possui um desconto ativo para este pedido.");
        navegar('carrinho');
        return;
    }

    if (usuarioLogado.pontos === undefined || usuarioLogado.pontos === null) {
        usuarioLogado.pontos = 10;
    }

    if (usuarioLogado.pontos < custoPontos) {
        exibirNotificacao(`Saldo insuficiente! Você precisa de ${custoPontos} pontos. Seu saldo atual é ${usuarioLogado.pontos}.`);
        return;
    }

    usuarioLogado.pontos -= custoPontos;
    atualizarUsuarioNaLista(usuarioLogado);
    
    const pts = document.getElementById('fidelidade-pontos');
    if (pts) pts.innerText = usuarioLogado.pontos;

    descontoAtivo = valorDesconto;
    atualizarCarrinho();

    exibirNotificacao(`🎉 Desconto de R$ ${valorDesconto.toFixed(2)} aplicado com sucesso no seu carrinho!`);
    navegar('carrinho');
}

/* AUTENTICAÇÃO */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function efetuarLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!validarEmail(email)) {
        exibirNotificacao("Erro: Por favor, insira um formato de e-mail válido.");
        return;
    }

    const usuarioEncontrado = usuariosCadastrados.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);

    if (usuarioEncontrado) {
        if (usuarioEncontrado.pontos === undefined || usuarioEncontrado.pontos === null) usuarioEncontrado.pontos = 10;
        usuarioLogado = usuarioEncontrado;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        atualizarInterfaceUsuario();
        atualizarAbaPedidos();
        exibirNotificacao(`Bem-vindo de volta, ${usuarioLogado.nome}!`);
        navegar('cardapio');
    } else {
        exibirNotificacao("Usuário ou senha incorretos.");
    }
}

function efetuarCadastro() {
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const aceitouLGPD = document.getElementById('cad-lgpd').checked;

    if (nome.length < 3) {
        exibirNotificacao("O nome deve conter pelo menos 3 caracteres.");
        return;
    }
    if (!validarEmail(email)) {
        exibirNotificacao("Erro: Insira um formato de e-mail válido.");
        return;
    }
    if (senha.length < 6) {
        exibirNotificacao("A segurança da sua senha exige o mínimo de 6 caracteres.");
        return;
    }
    if (!aceitouLGPD) {
        exibirNotificacao("Erro: Você deve aceitar os termos da LGPD para criar uma conta.");
        return;
    }
    if (usuariosCadastrados.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        exibirNotificacao("Este e-mail já se encontra cadastrado no sistema.");
        return;
    }

    const novoUsuario = { nome: nome, email: email, senha: senha, pontos: 10 };
    usuariosCadastrados.push(novoUsuario);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
    
    usuarioLogado = novoUsuario;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    
    atualizarInterfaceUsuario();
    atualizarAbaPedidos();
    exibirNotificacao("Cadastro efetuado com sucesso! Você ganhou 10 pontos iniciais.");
    navegar('cardapio');
}

function atualizarUsuarioNaLista(usuarioAtualizado) {
    usuariosCadastrados = usuariosCadastrados.map(u => u.email.toLowerCase() === usuarioAtualizado.email.toLowerCase() ? usuarioAtualizado : u);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
}

function efetuarSair() {
    usuarioLogado = null;
    carrinho = [];
    descontoAtivo = 0;
    localStorage.removeItem('usuarioLogado');
    
    atualizarCarrinho();
    atualizarInterfaceUsuario();
    
    const containerPedidos = document.getElementById('historico-pedidos-container');
    if (containerPedidos) {
        containerPedidos.innerHTML = "<p style='color:#777; text-align:center;'>Você não realizou nenhum pedido ainda.</p>";
    }

    const campoPontos = document.getElementById('fidelidade-pontos');
    if (campoPontos) {
        campoPontos.innerText = "10";
    }

    exibirNotificacao("Você saiu da conta.");
    navegar('inicio');
}

function atualizarInterfaceUsuario() {
    const statusDiv = document.getElementById('status-usuario');
    const lnkLogin = document.getElementById('lnk-login');
    const campoPontos = document.getElementById('fidelidade-pontos');
    
    if (usuarioLogado) {
        if (usuarioLogado.pontos === undefined || usuarioLogado.pontos === null) usuarioLogado.pontos = 10;
        if (statusDiv) statusDiv.innerHTML = `Olá, <strong>${usuarioLogado.nome}</strong> | <button class="btn-sair" onclick="efetuarSair()">Sair</button>`;
        if (lnkLogin) lnkLogin.style.display = "none";
        if (campoPontos) campoPontos.innerText = usuarioLogado.pontos;
    } else {
        if (statusDiv) statusDiv.innerHTML = "Não conectado";
        if (lnkLogin) lnkLogin.style.display = "inline";
        if (campoPontos) campoPontos.innerText = "10";
    }
}

function finalizarPedido() {
    if (!usuarioLogado) {
        exibirNotificacao("Você precisa estar logado para finalizar o pedido.");
        navegar('login');
        return;
    }
    if (carrinho.length === 0) {
        exibirNotificacao("Seu carrinho está vazio!");
        return;
    }
    
    const pagValor = document.getElementById('pag-valor');
    if (pagValor) pagValor.innerText = `R$ ${totalPedidoGlobal.toFixed(2)}`;
    navegar('pagamento');
}

/* AMBIENTE DE PAGAMENTO */
function processarEscolhaPagamento() {
    const radioChecked = document.querySelector('input[name="formaPagamento"]:checked');
    if (!radioChecked) return;
    
    const formaSelecionada = radioChecked.value;
    
    if (formaSelecionada === "Cartão de Crédito") {
        document.getElementById('conteudo-cartao').style.display = 'block';
        document.getElementById('loader-cartao').style.display = 'none';
        document.getElementById('modal-cartao').style.display = 'flex';
    } else if (formaSelecionada === "Pix") {
        document.getElementById('modal-pix').style.display = 'flex';
        dispararTimerPagamento('Pix');
    }
}

function configurarMascara(id, filterReg, formatFn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function (e) {
        let v = e.target.value.replace(filterReg, '');
        if (formatFn) v = formatFn(v);
        e.target.value = v;
    });
}

function configurarMascarasCartao() {
    configurarMascara('cc-num', /\D/g, v => v.replace(/(\d{4})(?=\d)/g, '$1 '));
    configurarMascara('cc-val', /\D/g, v => v.length > 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v);
    configurarMascara('cc-cvv', /\D/g);
}

function validarEDispararCartao() {
    const num = document.getElementById('cc-num').value.replace(/\s/g, '');
    const val = document.getElementById('cc-val').value;
    const cvv = document.getElementById('cc-cvv').value;

    if (num.length < 16) {
        exibirNotificacao("Número de cartão inválido. Insira os 16 dígitos completos.");
        return;
    }
    if (!val.includes('/') || val.length < 5) {
        exibirNotificacao("Validade incorreta. Use o formato MM/AA.");
        return;
    }
    if (cvv.length < 3) {
        exibirNotificacao("Código de segurança (CVV) inválido.");
        return;
    }

    dispararTimerPagamento('Cartão de Crédito');
}

function fecharModais() {
    const m1 = document.getElementById('modal-cartao');
    const m2 = document.getElementById('modal-pix');
    if (m1) m1.style.display = 'none';
    if (m2) m2.style.display = 'none';
    if (timeoutPagamento) {
        clearTimeout(timeoutPagamento);
        timeoutPagamento = null;
    }
}

function dispararTimerPagamento(formaSelecionada) {
    if (formaSelecionada === 'Cartão de Crédito') {
        document.getElementById('conteudo-cartao').style.display = 'none';
        document.getElementById('loader-cartao').style.display = 'block';
    }
    
    timeoutPagamento = setTimeout(() => {
        executarConclusaoDoPedido(formaSelecionada);
    }, 5000);
}

function executarConclusaoDoPedido(formaSelecionada) {
    fecharModais();
    
    if (usuarioLogado.pontos === undefined || usuarioLogado.pontos === null) {
        usuarioLogado.pontos = 10;
    }
    
    let pontosGanhos = Math.floor(totalPedidoGlobal / 50) * 10;
    
    usuarioLogado.pontos += pontosGanhos;
    atualizarUsuarioNaLista(usuarioLogado);
    
    const pts = document.getElementById('fidelidade-pontos');
    if (pts) pts.innerText = usuarioLogado.pontos;
    
    exibirNotificacao(`Provedor Externo informa:\nPagamento via [${formaSelecionada}] APROVADO com sucesso!\n🎉 Você ganhou ${pontosGanhos} pontos nesta compra.`);
    
    const idPedido = Math.floor(1000 + Math.random() * 9000);
    const novoPedido = {
        id: idPedido,
        usuarioEmail: usuarioLogado.email,
        itens: [...carrinho],
        total: totalPedidoGlobal,
        descontoAplicado: descontoAtivo,
        status: "Recebido na Cozinha",
        metodo: formaSelecionada
    };
    
    listaPedidosRealizados.unshift(novoPedido);
    localStorage.setItem('listaPedidosRealizados', JSON.stringify(listaPedidosRealizados));
    
    atualizarAbaPedidos();
    carrinho = [];
    descontoAtivo = 0; 
    atualizarCarrinho();
    navegar('status-pedido');

    setTimeout(() => {
        novoPedido.status = "Em rota de entrega / Pronto para Retirada";
        localStorage.setItem('listaPedidosRealizados', JSON.stringify(listaPedidosRealizados));
        atualizarAbaPedidos();
    }, 8000);
}

function atualizarAbaPedidos() {
    const container = document.getElementById('historico-pedidos-container');
    if (!container) return;
    container.innerHTML = "";

    const pedidosDoUsuario = usuarioLogado 
        ? listaPedidosRealizados.filter(ped => ped.usuarioEmail.toLowerCase() === usuarioLogado.email.toLowerCase())
        : [];

    if (pedidosDoUsuario.length === 0) {
        container.innerHTML = "<p style='color:#777; text-align:center;'>Você não realizou nenhum pedido ainda.</p>";
        return;
    }

    pedidosDoUsuario.forEach(ped => {
        const itemDiv = document.createElement('div');
        itemDiv.style.background = "#fff";
        itemDiv.style.borderRadius = "var(--borda-raio)";
        itemDiv.style.padding = "20px";
        itemDiv.style.marginBottom = "15px";
        itemDiv.style.boxShadow = "0 4px 10px rgba(0,0,0,0.02)";
        
        let descItens = ped.itens.map(i => `${i.icone} ${i.nome} (x${i.quantidade})`).join(', ');
        let strDesconto = ped.descontoAplicado && ped.descontoAplicado > 0 ? `<p style="margin-bottom:5px; color: #27ae60;"><strong>Desconto Fidelidade:</strong> -R$ ${ped.descontoAplicado.toFixed(2)}</p>` : '';

        itemDiv.innerHTML = `
            <p style="margin-bottom:5px;"><strong>Pedido Código:</strong> <span style="color:var(--terracota)">#${ped.id}</span></p>
            <p style="margin-bottom:5px;"><strong>Itens:</strong> ${descItens}</p>
            <p style="margin-bottom:5px;"><strong>Pagamento:</strong> ${ped.metodo} (Aprovado)</p>
            ${strDesconto}
            <p style="margin-bottom:5px;"><strong>Total Pago:</strong> R$ ${ped.total.toFixed(2)}</p>
            <p><strong>Status:</strong> <span style="color: #2980b9; font-weight: bold;">${ped.status}</span></p>
        `;
        container.appendChild(itemDiv);
    });
}