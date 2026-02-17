import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import ScratchCard from 'react-scratchcard-v2';
import confetti from 'canvas-confetti';
import { Ticket, Gift, History, Share2, LogOut, Trophy, User } from 'lucide-react';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [raspadinha, setRaspadinha] = useState(null);
  const [revelado, setRevelado] = useState(false);
  const navigate = useNavigate();

  // Dados Fictícios para o Feed (Enquanto não conectamos o real)
  const feedGanhadores = [
    { nome: 'Nicole S.', premio: 'Vale Café', tempo: 'há 5 min' },
    { nome: 'Guilherme L.', premio: 'Ingresso', tempo: 'há 20 min' },
    { nome: 'João P.', premio: 'Kit Prevision', tempo: 'há 1h' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/');

    // 1. Busca Perfil (Nome/Área)
    let { data: perfil } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!perfil) perfil = { nome: user.email.split('@')[0], area: 'Visitante' };
    setUserProfile(perfil);

    // 2. Busca Raspadinha Disponível
    const { data: raspData } = await supabase
      .from('historico_raspadinhas')
      .select('*, premios(*)')
      .eq('usuario_id', user.id)
      .eq('revelada', false)
      .maybeSingle(); // Usa maybeSingle para não dar erro se não tiver

    if (raspData) setRaspadinha(raspData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const onComplete = async () => {
    if (!raspadinha) return;
    
    setRevelado(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    
    // Atualiza no banco
    await supabase
      .from('historico_raspadinhas')
      .update({ revelada: true })
      .eq('id', raspadinha.id);
      
    alert(`PARABÉNS! Você ganhou: ${raspadinha.premios.nome}`);
  };

  if (loading) return <div style={styles.loading}>Carregando painel...</div>;

  return (
    <div style={styles.container}>
      
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <Ticket color="#fff" size={24} style={{ marginRight: 10 }} />
          <h1 style={styles.logoText}>Raspadinhas <span style={{color: '#93c5fd'}}>R&E</span></h1>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
            <span style={styles.userName}>Olá, <b>{userProfile?.nome}</b></span>
            <span style={styles.userArea}>{userProfile?.area}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={16} /> <span style={styles.logoutText}>Sair</span>
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main style={styles.mainGrid}>
        
        {/* COLUNA ESQUERDA (Principal) */}
        <section style={styles.leftColumn}>
          
          {/* Card da Raspadinha */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <Gift size={20} style={{marginRight: 8, color: '#2563eb'}}/> 
              Suas Raspadinhas
            </h2>
            
            <div style={styles.scratchArea}>
              {raspadinha ? (
                <div style={styles.scratchWrapper}>
                  {!revelado && <p style={styles.instruction}>✨ Arraste para revelar seu prêmio! ✨</p>}
                  <ScratchCard
                    width={300}
                    height={300}
                    image="https://i.postimg.cc/Hx3d0L8J/scratch-cover-silver.png"
                    finishPercent={40}
                    onComplete={onComplete}
                  >
                    <div style={styles.prizeCard}>
                      <Trophy size={48} color="#d97706" style={{marginBottom: 10}}/>
                      <span style={styles.prizeText}>{raspadinha.premios.nome}</span>
                      <span style={styles.prizeCode}>#{raspadinha.id.slice(0,4)}</span>
                    </div>
                  </ScratchCard>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <div style={{fontSize: '40px', marginBottom: '10px'}}>😢</div>
                  <h3 style={{color: '#374151', margin: 0}}>Nenhuma raspadinha disponível</h3>
                  <p style={{color: '#6b7280', fontSize: '14px'}}>Peça para o seu gestor liberar uma para você!</p>
                  <button onClick={() => window.location.reload()} style={styles.secondaryButton}>Atualizar Página</button>
                </div>
              )}
            </div>
          </div>

          {/* Feed de Ganhadores */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🏆 Feed de Prêmios</h2>
            <ul style={styles.feedList}>
              {feedGanhadores.map((item, index) => (
                <li key={index} style={styles.feedItem}>
                  <div style={styles.avatar}>{item.nome.charAt(0)}</div>
                  <div style={{flex: 1}}>
                    <span style={{fontWeight: 'bold', color: '#374151'}}>{item.nome}</span> ganhou <span style={{color: '#2563eb', fontWeight: 'bold'}}>{item.premio}</span>
                  </div>
                  <span style={styles.feedTime}>{item.tempo}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>


        {/* COLUNA DIREITA (Lateral) */}
        <section style={styles.rightColumn}>
          
          {/* Histórico */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><History size={20} style={{marginRight: 8, color: '#2563eb'}}/> Histórico</h2>
            <div style={styles.emptyHistory}>
              <p>Você ainda não tem prêmios resgatados.</p>
            </div>
          </div>

          {/* Indique */}
          <div style={{...styles.card, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe'}}>
            <h2 style={{...styles.cardTitle, color: '#1e40af', borderBottom: '1px solid #dbeafe'}}>
              <Share2 size={20} style={{marginRight: 8}}/> Indique
            </h2>
            <p style={{fontSize: '13px', color: '#1e3a8a', marginBottom: '15px', lineHeight: '1.4'}}>
              Indique um colega para o time de R&E e concorra a prêmios especiais!
            </p>
            <button style={styles.primaryButton}>Indicar Agora</button>
          </div>

        </section>

      </main>
    </div>
  );
}

// --- ESTILOS RESPONSIVOS ---
const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b7280', fontFamily: 'sans-serif' },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logoContainer: { display: 'flex', alignItems: 'center' },
  logoText: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  userDetails: { textAlign: 'right', display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', lineHeight: '1' },
  userArea: { fontSize: '11px', opacity: 0.8 },
  logoutButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  logoutText: { marginLeft: '5px', display: 'none', '@media(min-width: 600px)': { display: 'inline' } }, // Esconde texto no mobile
  
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr', // Mobile first (1 coluna)
    gap: '20px',
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },

  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '10px',
    margin: '0 0 15px 0',
  },
  scratchArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '250px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    border: '2px dashed #e5e7eb',
  },
  scratchWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  instruction: { fontSize: '14px', color: '#6b7280', marginBottom: '10px', fontWeight: '500' },
  
  prizeCard: {
    width: '300px',
    height: '300px',
    backgroundColor: '#fffbeb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #fcd34d',
  },
  prizeText: { fontSize: '22px', fontWeight: 'bold', color: '#b45309', textAlign: 'center', margin: '10px 0' },
  prizeCode: { fontSize: '12px', color: '#92400e', fontFamily: 'monospace', background: '#fde68a', padding: '2px 6px', borderRadius: '4px' },

  emptyState: { textAlign: 'center' },
  secondaryButton: { marginTop: '15px', padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  
  feedList: { listStyle: 'none', padding: 0, margin: 0 },
  feedItem: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#bfdbfe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '10px', fontSize: '12px' },
  feedTime: { fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' },

  emptyHistory: { textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', padding: '20px 0' },
  
  primaryButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  }
};

// Hack para Media Queries no React inline (simples)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @media (min-width: 768px) {
    main { grid-template-columns: 2fr 1fr !important; }
  }
`;
document.head.appendChild(styleSheet);