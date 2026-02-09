import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LabelList } from 'recharts';
import { Home, TrendingUp, Key, Lock } from 'lucide-react';

const App = () => {
  const mesesFluxoTotal = 21;

  const senhaConfigurada = import.meta.env.VITE_PAGE_PASSWORD;

  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [mensagemSenha, setMensagemSenha] = useState('');
  const [acessoLiberado, setAcessoLiberado] = useState(() => sessionStorage.getItem('fluxo_auth_ok') === '1');

  const [useBaloes, setUseBaloes] = useState(false);
  const [mesChaves, setMesChaves] = useState(mesesFluxoTotal - 1);
  const [useTaxaAberturaConta, setUseTaxaAberturaConta] = useState(false);
  const [mesTaxaAberturaConta, setMesTaxaAberturaConta] = useState(0);
  const [useTaxaEngenharia, setUseTaxaEngenharia] = useState(false);
  const [mesTaxaEngenharia, setMesTaxaEngenharia] = useState(0);

  const parcelaEntradaPadrao = 2534.23;
  const parcelaEntradaComBaloes = 1678.9;
  const valorBaloesTotal = 15000;
  const parcelaMensalConstrutora = 1819.94;

  const parcelaCheiaPrice = 1834.78;
  const evolucaoInicialPct = 0.8;
  const evolucaoFinalPct = 1.0;
  const valorTaxaAberturaConta = 1000;
  const valorTaxaEngenharia = 2000;
  const prazoFinanciamentoMeses = 420;
  const parcelaFinanciamentoInicial = 1834.78;
  const taxaNominalPriceAa = 8.16;
  const financiamentoInicial = 244800;

  const mesesDisponiveis = useMemo(() => {
    const dataInicio = new Date(2026, 1, 1);

    return Array.from({ length: mesesFluxoTotal }, (_, i) => {
      const dataAtual = new Date(dataInicio);
      dataAtual.setMonth(dataInicio.getMonth() + i);

      return {
        value: i,
        label: dataAtual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      };
    });
  }, [mesesFluxoTotal]);

  const dadosFluxo = useMemo(() => {
    const dados = [];
    const dataInicio = new Date(2026, 1, 1);

    // Calcula total de balões pagos até o mês de chaves
    let baloesPagosAteChaves = 0;
    for (let i = 0; i < mesChaves; i++) {
      if ((i + 1) % 6 === 0) {
        baloesPagosAteChaves += valorBaloesTotal / 3;
      }
    }
    const saldoBaloes = useBaloes ? Math.max(0, valorBaloesTotal - baloesPagosAteChaves) : 0;

    for (let i = 0; i < mesesFluxoTotal; i++) {
      const dataAtual = new Date(dataInicio);
      dataAtual.setMonth(dataInicio.getMonth() + i);
      const mesNome = dataAtual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      let pConstrutora = parcelaMensalConstrutora;
      let custoBanco = 0;
      let statusObra = '';

      if (i < mesChaves) {
        const progressoObra = evolucaoInicialPct + ((evolucaoFinalPct - evolucaoInicialPct) * (i / mesChaves));
        custoBanco = parcelaCheiaPrice * progressoObra;
        statusObra = 'Em Obras';
      } else {
        custoBanco = parcelaCheiaPrice;
        statusObra = 'Entregue';
      }

      let balaoExtra = 0;
      const taxaAberturaConta = useTaxaAberturaConta && i === mesTaxaAberturaConta ? valorTaxaAberturaConta : 0;
      const taxaEngenharia = useTaxaEngenharia && i === mesTaxaEngenharia ? valorTaxaEngenharia : 0;
      
      // Balões: parcelas semestrais antes das chaves e quitação do saldo no mês das chaves
      if (useBaloes) {
        if (i < mesChaves && (i + 1) % 6 === 0) {
          balaoExtra = valorBaloesTotal / 3;
        }

        if (i === mesChaves && saldoBaloes > 0) {
          balaoExtra = saldoBaloes;
        }
      }

      dados.push({
        name: mesNome,
        'Parcela Construtora': Number(pConstrutora.toFixed(2)),
        'Taxa de Evolucao de Obra': Number(custoBanco.toFixed(2)),
        'Balão Extra': Number(balaoExtra.toFixed(2)),
        'Taxa Abertura de Contas': Number(taxaAberturaConta.toFixed(2)),
        'Taxa Engenharia': Number(taxaEngenharia.toFixed(2)),
        Status: statusObra,
        total: Number((pConstrutora + custoBanco + balaoExtra + taxaAberturaConta + taxaEngenharia).toFixed(2)),
      });
    }

    return dados;
  }, [useBaloes, mesChaves, mesTaxaAberturaConta, mesTaxaEngenharia, useTaxaAberturaConta, useTaxaEngenharia]);

  const CustomLabel = (props) => {
    const { x, y, value, index } = props;
    const ponto = dadosFluxo[index] || {};
    const isOnda =
      (ponto['Balão Extra'] || 0) > 0 ||
      (ponto['Taxa Abertura de Contas'] || 0) > 0 ||
      (ponto['Taxa Engenharia'] || 0) > 0;
    if (index % 2 !== 0 && !isOnda) return null;

    return (
      <text x={x} y={y - 12} fill="#475569" textAnchor="middle" fontSize={10} fontWeight="bold">
        {`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
      </text>
    );
  };

  const coresSeries = {
    'Parcela Construtora': '#2563eb',
    'Taxa de Evolucao de Obra': '#7c3aed',
    'Balão Extra': '#f59e0b',
    'Taxa Abertura de Contas': '#16a34a',
    'Taxa Engenharia': '#ea580c',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, boxShadow: '0 8px 30px rgba(2, 6, 23, 0.08)' }}>
        <p style={{ margin: 0, marginBottom: 8, color: '#0f172a', fontWeight: 700 }}>{label}</p>
        {payload.map((item) => (
          <p key={item.name} style={{ margin: 0, marginBottom: 4, color: coresSeries[item.name] || '#334155', fontWeight: 600 }}>
            {item.name}: {`R$ ${Number(item.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </p>
        ))}
      </div>
    );
  };

  const liberarAcesso = (event) => {
    event.preventDefault();

    if (!senhaConfigurada) {
      setMensagemSenha('Senha não configurada no ambiente. Defina VITE_PAGE_PASSWORD.');
      return;
    }

    if (senhaDigitada === senhaConfigurada) {
      setAcessoLiberado(true);
      setMensagemSenha('');
      sessionStorage.setItem('fluxo_auth_ok', '1');
      return;
    }

    setMensagemSenha('Senha incorreta. Tente novamente.');
  };

  if (!acessoLiberado) {
    return (
      <div style={{ minHeight: '100vh', background: '#e2e8f0', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}>
        <form onSubmit={liberarAcesso} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #cbd5e1', padding: 24, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={20} color="#1d4ed8" /> Acesso protegido
          </h1>
          <p style={{ marginTop: 8, marginBottom: 18, color: '#64748b', fontSize: 14 }}>
            Digite a senha para visualizar a projeção financeira.
          </p>
          <input
            type="password"
            value={senhaDigitada}
            onChange={(e) => setSenhaDigitada(e.target.value)}
            placeholder="Senha"
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 10, padding: '11px 12px', fontSize: 15, marginBottom: 12 }}
          />
          <button type="submit" style={{ width: '100%', border: 'none', borderRadius: 10, padding: '11px 12px', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Entrar
          </button>
          {mensagemSenha ? <p style={{ marginTop: 10, marginBottom: 0, color: '#dc2626', fontSize: 13, fontWeight: 600 }}>{mensagemSenha}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: 16, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e6eef8', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Home style={{ color: '#2563eb' }} /> Fluxo Financeiro Unidade 1007
              </h1>
              <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 13 }}>Projeção Dinâmica: Edmozer & Camila</p>
            </div>
            <div style={{ background: '#eef2ff', padding: '6px 14px', borderRadius: 9999, border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} style={{ color: '#2563eb' }} />
              <span style={{ color: '#1e40af', fontWeight: 600, fontSize: 13 }}>Tabela PRICE</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e6eef8', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Entrega das Chaves</label>
            <input
              type="range"
              min="4"
              max={mesesFluxoTotal - 1}
              value={mesChaves}
              onChange={(e) => setMesChaves(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <span style={{ color: '#64748b' }}>Mês: {dadosFluxo[mesChaves]?.name}</span>
              <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}><Key size={14} /> Chaves em {mesChaves} meses</span>
            </div>
          </div>

          <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e6eef8', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Formato Entrada</label>
              <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{useBaloes ? 'Com Balões' : 'Fixas'}</p>
            </div>
            <button onClick={() => setUseBaloes(!useBaloes)} style={{ width: 56, height: 28, borderRadius: 9999, position: 'relative', background: useBaloes ? '#2563eb' : '#cbd5e1', border: 'none', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: 4, width: 20, height: 20, background: '#fff', borderRadius: 9999, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'left 0.2s', left: useBaloes ? 28 : 6 }} />
            </button>
          </div>

          <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e6eef8', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Taxa de Abertura de Contas</label>
                <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>R$ 1.000,00 no mês selecionado</p>
              </div>
              <button onClick={() => setUseTaxaAberturaConta(!useTaxaAberturaConta)} style={{ width: 56, height: 28, borderRadius: 9999, position: 'relative', background: useTaxaAberturaConta ? '#16a34a' : '#cbd5e1', border: 'none', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: 4, width: 20, height: 20, background: '#fff', borderRadius: 9999, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'left 0.2s', left: useTaxaAberturaConta ? 28 : 6 }} />
              </button>
            </div>
            <select value={mesTaxaAberturaConta} onChange={(e) => setMesTaxaAberturaConta(parseInt(e.target.value, 10))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600 }}>
              {mesesDisponiveis.map((mes) => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>

          <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e6eef8', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Taxa de Engenharia</label>
                <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>R$ 2.000,00 no mês selecionado</p>
              </div>
              <button onClick={() => setUseTaxaEngenharia(!useTaxaEngenharia)} style={{ width: 56, height: 28, borderRadius: 9999, position: 'relative', background: useTaxaEngenharia ? '#ea580c' : '#cbd5e1', border: 'none', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: 4, width: 20, height: 20, background: '#fff', borderRadius: 9999, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'left 0.2s', left: useTaxaEngenharia ? 28 : 6 }} />
              </button>
            </div>
            <select value={mesTaxaEngenharia} onChange={(e) => setMesTaxaEngenharia(parseInt(e.target.value, 10))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600 }}>
              {mesesDisponiveis.map((mes) => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e6eef8', marginBottom: 24 }}>
          <div style={{ height: 450, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosFluxo} margin={{ top: 35, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBanco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBalao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTaxaAbertura" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTaxaEngenharia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Parcela Construtora" dataKey="Parcela Construtora" stroke="#2563eb" fill="url(#colorCons)" strokeWidth={3} stackId="1" />
                <Area type="monotone" name="Taxa de Evolucao de Obra" dataKey="Taxa de Evolucao de Obra" stroke="#7c3aed" fill="url(#colorBanco)" strokeWidth={3} stackId="1" />
                <Area type="monotone" name="Balão Extra" dataKey="Balão Extra" stroke="#f59e0b" fill="url(#colorBalao)" strokeWidth={2.4} stackId="1" />
                <Area type="monotone" name="Taxa Abertura de Contas" dataKey="Taxa Abertura de Contas" stroke="none" fill="url(#colorTaxaAbertura)" stackId="1" />
                <Area type="monotone" name="Taxa Engenharia" dataKey="Taxa Engenharia" stroke="none" fill="url(#colorTaxaEngenharia)" stackId="1">
                  <LabelList dataKey="total" content={<CustomLabel />} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e6eef8', marginBottom: 24 }}>
          <h2 style={{ margin: 0, marginBottom: 14, color: '#0f172a', fontSize: 20, fontWeight: 800 }}>
            Detalhes do Financiamento
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <p style={{ margin: 0, marginBottom: 6, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Prazo Inicial</p>
              <p style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 800 }}>{prazoFinanciamentoMeses} meses</p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <p style={{ margin: 0, marginBottom: 6, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Parcela Inicial</p>
              <p style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 800 }}>
                {`R$ ${parcelaFinanciamentoInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <p style={{ margin: 0, marginBottom: 6, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Taxa Nominal PRICE</p>
              <p style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 800 }}>{taxaNominalPriceAa.toLocaleString('pt-BR')}% aa</p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <p style={{ margin: 0, marginBottom: 6, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Financiamento Inicial</p>
              <p style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 800 }}>
                {`R$ ${financiamentoInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
