import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import ScratchCard from 'react-scratchcard-v2';
import JSConfetti from 'js-confetti';

// Componentes de Ícones (Lucide React - se não tiver instalado, ele usa texto simples)
// Se quiser instalar: npm install lucide-react
import { Ticket, Gift, History, Share2, LogOut, Trophy } from 'lucide-react';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [raspadinhaDisponivel, setRaspadinhaDisponivel] = useState(false);
  const [premio, setPremio] = useState(null);
  const navigate = useNavigate();
  const jsConfetti = new JSConfetti();

  // Dados Fictícios para o Feed (depois conectamos no banco real)
  const feedGanhadores = [
    { nome: 'Nicole S.', premio: 'Vale Café', tempo: 'há 5 min' },
    { nome: 'Guilherme L.', premio: 'Ingresso Cinema', tempo: 'há 20 min' },
    { nome: 'João P.', premio: 'Kit Prevision', tempo: 'há 1 hora' },
  ];

  // Dados Fictícios para o Histórico
  const historicoPremios = [
    { data: '10/02', premio: 'Vale Ifood R$ 30' },
    { data: '15/01', premio: 'Caneca Personalizada' },
  ];

  useEffect(() => {
    fetchProfile();
    checkRaspadinha();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/');

    // Busca o nome na tabela de perfis
    const { data: perfil } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    setUserProfile(perfil || { nome: user.email.split('@')[0] }); // Fallback se não achar perfil
    setLoading(false);
  };

  const checkRaspadinha = async () => {
    // Aqui virá a lógica real. Por enquanto, vou simular que TEM uma raspadinha disponível
    // Mude para false para testar o visual "sem raspadinha"
    setRaspadinhaDisponivel(true); 
    setPremio('Vale Café'); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const onComplete = () => {
    jsConfetti.addConfetti();
    alert(`Parabéns! Você ganhou: ${premio}`);
    setRaspadinhaDisponivel(false); // Some a raspadinha depois de usar
    // Aqui salvaríamos no banco que o usuário já usou
  };

  if (loading) return <div style={styles.loading}>Carregando painel...</div>;

  return (
    <div style={styles.container}>
      
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <Ticket color="#fff" size={28} style={{ marginRight: 10 }} />
          <h1 style={styles.logoText}>Raspadinhas <span style={{color: '#93c5fd'}}>R&E</span></h1>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.welcomeText}>Olá, <b>{userProfile?.nome}</b></span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL (Grid) --- */}
      <main style={styles.mainGrid}>
        
        {/* COLUNA ESQUERDA (Principal) */}
        <section style={styles.leftColumn}>
          
          {/* Card da Raspadinha */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><Gift size={20} style={{marginRight: 8, color: '#2563eb'}}/> Suas Raspadinhas</h2>
            
            <div style={styles.scratchArea}>
              {raspadinhaDisponivel ? (
                <div style={styles.scratchWrapper}>
                  <ScratchCard
                    width={320}
                    height={160}
                    image="https://i.postimg.cc/Hx3d0L8J/scratch-cover-silver.png" // Imagem de cobertura (cinza ou personalizada)
                    finishPercent={50}
                    onComplete={onComplete}
                  >
                    <div style={styles.prizeCard}>
                      <Trophy size={40} color="#ca8a04" style={{marginBottom: 10}}/>
                      <span style={styles.prizeText}>{premio}</span>
                    </div>
                  </ScratchCard>
                  <p style={styles.instruction}>Arraste o mouse ou dedo para raspar!</p>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <span style={{fontSize: '40px'}}>😢</span>
                  <p style={{color: '#6b7280', marginTop: '10px'}}>Nenhuma raspadinha disponível no momento.</p>
                  <button style={styles.secondaryButton}>Atualizar</button>
                </div>
              )}
            </div>
          </div>

          {/* Feed de Ganhadores */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🏆 Feed de Prêmios Recentes</h2>
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
            <ul style={styles.historyList}>
              {historicoPremios.map((item, index) => (
                <li key={index} style={styles.historyItem}>
                  <span style={{color: '#6b7280', fontSize: '13px'}}>{item.data}</span>
                  <span style={{fontWeight: '500', color: '#1f2937'}}>{item.premio}</span>
                </li>
              ))}
              {historicoPremios.length === 0 && <li style={styles.emptyText}>Você ainda não ganhou prêmios.</li>}
            </ul>
          </div>

          {/* Indique */}
          <div style={{...styles.card, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe'}}>
            <h2 style={{...styles.cardTitle, color: '#1e40af'}}><Share2 size={20} style={{marginRight: 8}}/> Indique</h2>
            <p style={{fontSize: '14px', color: '#1e3a8a', marginBottom: '15px'}}>
              Conhece alguém que merece um prêmio? Indique um colega para o time de R&E!
            </p>
            <button style={styles.primaryButton}>Indicar Colega</button>
          </div>

        </section>

      </main>
    </div>
  );
}

// --- ESTILOS (CSS-in-JS para não bugar) ---
const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b7280' },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6', // Cinza bem clarinho de fundo
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    backgroundColor: '#1e40af', // Azul do Login
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  logoContainer: { display: 'flex', alignItems: 'center' },
  logoText: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  welcomeText: { fontSize: '14px' },
  logoutButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsivo
    gap: '20px',
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  // No Desktop, força a divisão 2/3 e 1/3 se houver espaço
  '@media (min-width: 768px)': {
    mainGrid: {
      gridTemplateColumns: '2fr 1fr', 
    }
  },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 2 }, // Flex Grow maior
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }, // Flex Grow menor

  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
  },
  scratchArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
  },
  scratchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  prizeCard: {
    width: '320px',
    height: '160px',
    backgroundColor: '#fef3c7', // Amarelo clarinho (ouro)
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px dashed #ca8a04',
    borderRadius: '8px',
  },
  prizeText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#854d0e',
  },
  instruction: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '10px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '20px',
  },
  feedList: { listStyle: 'none', padding: 0, margin: 0 },
  feedItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    backgroundColor: '#bfdbfe',
    color: '#1e40af',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '10px',
    fontSize: '12px',
  },
  feedTime: { fontSize: '12px', color: '#9ca3af' },
  
  historyList: { listStyle: 'none', padding: 0, margin: 0 },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
  },
  emptyText: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', margin: '10px 0' },
  
  primaryButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    color: '#374151',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: '500',
  }
};