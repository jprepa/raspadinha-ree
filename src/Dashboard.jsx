import React, { useEffect, useState } from 'react';

import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import ScratchCard from 'react-scratchcard-v2';
import confetti from 'canvas-confetti';

import { Ticket, Gift, History, Share2, LogOut, Trophy, User, Clock, Frown } from 'lucide-react';


export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [raspadinha, setRaspadinha] = useState(null);
  const [feed, setFeed] = useState([]);
  const [meuHistorico, setMeuHistorico] = useState([]);
  const [revelado, setRevelado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/');

      // 1. Perfil
      let { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single();
      if (!perfil) perfil = { nome: user.email?.split('@')[0] || 'Usuário', area: 'Visitante' };
      setUserProfile(perfil);

      // 2. Raspadinha ATIVA (CORREÇÃO DE SEGURANÇA AQUI)
      const { data: raspData } = await supabase
        .from('historico_raspadinhas')
        .select('*, premios(*)')
        .eq('usuario_id', user.id)
        .eq('revelada', false)
        .not('premio_id', 'is', null) // Ignora raspadinhas sem prêmio
        .limit(1) // Pega apenas UMA, mesmo que tenham 10 acumuladas
        .maybeSingle();
      
      setRaspadinha(raspData);

      // 3. Feed Global
      const { data: feedData } = await supabase
        .from('historico_raspadinhas')
        .select('created_at, revelada, premios(nome), perfis(nome)')
        .eq('revelada', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (feedData) setFeed(feedData);

      // 4. Histórico Pessoal
      const { data: histData } = await supabase
        .from('historico_raspadinhas')
        .select('created_at, premios(nome)')
        .eq('usuario_id', user.id)
        .eq('revelada', true)
        .order('created_at', { ascending: false });

      if (histData) setMeuHistorico(histData);

    } catch (error) {
      console.error("Erro dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

const onComplete = async () => {
    if (!raspadinha) return;
    setRevelado(true);

    // --- O PORTEIRO DA RASPADINHA ---
    // Verifica se o prêmio é do tipo "falso" (feedback negativo)
    const isFake = raspadinha.premios?.eh_premio_falso === true;

    // Só solta confete se NÃO for fake
    if (!isFake) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
    }
    
    // Atualiza no banco que foi revelada (isso acontece sempre)
    await supabase
      .from('historico_raspadinhas')
      .update({ revelada: true })
      .eq('id', raspadinha.id);
      
    // Mensagem personalizada dependendo do tipo
    if (isFake) {
      // Mensagem mais séria, sem "Parabéns"
      alert(`${raspadinha.premios?.nome}.\n\nNão desanime, continue indicando empresas para ganhar sua raspadinha!\n\nSe tiver alguma dúvida entre em contato com o time de R&E.`);
    } else {
      // Mensagem de festa normal
      alert(`PARABÉNS! Você ganhou: ${raspadinha.premios?.nome || 'Um Prêmio!'}`);
    }

    window.location.reload(); 
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'agora mesmo';
    if (diff < 60) return `há ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `há ${hours}h`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) return <div style={styles.loading}>Carregando...</div>;

  // LÓGICA DO ÍCONE (Resolvemos antes de desenhar a tela)
  const isFakePrize = raspadinha?.premios?.eh_premio_falso === true;
  const IconeDinamico = isFakePrize ? Frown : Trophy;
  const corIcone = isFakePrize ? "#ef4444" : "#d97706";

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <Ticket color="#fff" size={24} style={{ marginRight: 10 }} />
          <h1 style={styles.logoText}>Raspadinhas Indicação <span style={{color: '#93c5fd'}}>R&E</span></h1>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
            <span style={styles.userName}>Olá, <b>{userProfile?.nome}</b></span>
            <span style={styles.userArea}>{userProfile?.area}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}><LogOut size={18} /></button>
        </div>
      </header>

      <main style={styles.mainGrid}>
        <section style={styles.leftColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><Gift size={20} style={{marginRight: 8, color: '#2563eb'}}/> Suas Raspadinhas</h2>
            <div style={styles.scratchArea}>
              {raspadinha && raspadinha.premios ? (
     <div style={styles.scratchWrapper}>
  {!revelado && <p style={styles.instruction}>✨ Arraste para revelar! ✨</p>}

  {isFakePrize ? (
    <ScratchCard
      key={`fake-${raspadinha.id}`}
      width={300}
      height={300}
      image="/raspadinha.png"
      finishPercent={70} 
      onComplete={onComplete}
      brushSize={20}
    >
      <div style={styles.prizeCard}>
        <Frown size={48} color="#ef4444" style={{marginBottom: 10}}/>
        <span style={styles.prizeText}>{raspadinha.premios?.nome}</span>
        <span style={styles.prizeCode}>#{raspadinha.id.slice(0,4)}</span>
      </div>
    </ScratchCard>
  ) : (
    <ScratchCard
      key={`real-${raspadinha.id}`}
      width={300}
      height={300}
      image="/raspadinha.png"
      finishPercent={70} 
      onComplete={onComplete}
      brushSize={20}
    >
      <div style={styles.prizeCard}>
        <Trophy size={48} color="#d97706" style={{marginBottom: 10}}/>
        <span style={styles.prizeText}>{raspadinha.premios?.nome}</span>
        <span style={styles.prizeCode}>#{raspadinha.id.slice(0,4)}</span>
      </div>
    </ScratchCard>
  )}
</div>
              ) : (
                <div style={styles.emptyState}>
                  <div style={{fontSize: '40px'}}>😢</div>
                  <h3 style={{color: '#374151', margin: '10px 0'}}>Sem raspadinhas</h3>
                  <p style={{color: '#6b7280', fontSize: '14px'}}>Indique empresas e ganhe raspadinhas com prêmios exclusivos!</p>
                  <button onClick={() => window.location.reload()} style={styles.secondaryButton}>Atualizar</button>
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🏆 Feed de Prêmios</h2>
            <ul style={styles.feedList}>
              {feed.length > 0 ? feed.map((item, index) => (
                <li key={index} style={styles.feedItem}>
                  <div style={styles.avatar}>{item.perfis?.nome?.charAt(0) || 'U'}</div>
                  <div style={{flex: 1}}>
                    <span style={{fontWeight: 'bold', color: '#374151'}}>{item.perfis?.nome}</span> ganhou <span style={{color: '#2563eb', fontWeight: 'bold'}}>{item.premios?.nome}</span>
                  </div>
                  <span style={styles.feedTime}>{formatTime(item.created_at)}</span>
                </li>
              )) : <li style={styles.emptyText}>Sem ganhadores recentes.</li>}
            </ul>
          </div>
        </section>

        <section style={styles.rightColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><History size={20} style={{marginRight: 8, color: '#2563eb'}}/> Histórico</h2>
            <ul style={styles.historyList}>
              {meuHistorico.length > 0 ? meuHistorico.map((item, index) => (
                <li key={index} style={styles.historyItem}>
                  <span style={{color: '#6b7280', fontSize: '12px'}}>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span style={{fontWeight: '600', color: '#1f2937', fontSize: '13px'}}>{item.premios?.nome}</span>
                </li>
              )) : <div style={styles.emptyHistory}><p>Seus prêmios aparecerão aqui.</p></div>}
            </ul>
          </div>

          <div style={{...styles.card, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe'}}>
            <h2 style={{...styles.cardTitle, color: '#1e40af', borderBottom: '1px solid #dbeafe'}}><Share2 size={20} style={{marginRight: 8}}/> Indique aqui</h2>
            <p style={{fontSize: '13px', color: '#1e3a8a', marginBottom: '15px'}}>Ao Indicar, certifique-se de preencher suas informações como na Plataforma</p>
<button 
    style={styles.primaryButton}
    onClick={() => window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=Bh2QGvDdOkyIwp1MVp72eR7GDeU21K9Ovs011XmhO4VUMzRBUUpPT1BMTjJWMEZTUjI1UktVVlBCQi4u', '_blank')}
  >
    Indicar Agora
  </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b7280', fontFamily: 'sans-serif' },
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: '"Inter", sans-serif' },
  header: { backgroundColor: '#1e40af', padding: '0 20px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logoContainer: { display: 'flex', alignItems: 'center' },
  logoText: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  userDetails: { textAlign: 'right', display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', lineHeight: '1.2' },
  userArea: { fontSize: '11px', opacity: 0.8 },
  logoutButton: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px', padding: '20px', maxWidth: '1100px', margin: '0 auto' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', margin: '0 0 15px 0' },
  scratchArea: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '320px', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', border: '2px dashed #e5e7eb',touchAction: 'none' },
  scratchWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  instruction: { fontSize: '14px', color: '#6b7280', marginBottom: '10px', fontWeight: '600' },
  prizeCard: { width: '300px', height: '300px', backgroundColor: '#fffbeb', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #fcd34d', borderRadius: '1px' },
  prizeText: { fontSize: '24px', fontWeight: 'bold', color: '#b45309', textAlign: 'center', margin: '15px 0' },
  prizeCode: { fontSize: '12px', color: '#92400e', fontFamily: 'monospace', background: '#fde68a', padding: '2px 6px', borderRadius: '4px' },
  emptyState: { textAlign: 'center', padding: '20px' },
  secondaryButton: { marginTop: '15px', padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151' },
  feedList: { listStyle: 'none', padding: 0, margin: 0 },
  feedItem: { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '12px', fontSize: '14px' },
  feedTime: { fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' },
  emptyText: { textAlign: 'center', color: '#9ca3af', padding: '15px', fontSize: '13px' },
  historyList: { listStyle: 'none', padding: 0, margin: 0 },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px' },
  emptyHistory: { textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '20px 0' },
  primaryButton: { width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `@media (min-width: 768px) { main { grid-template-columns: 2fr 1fr !important; } }`;
document.head.appendChild(styleSheet);
