import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ScratchCard from 'react-scratchcard-v2';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [raspadinha, setRaspadinha] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [revelado, setRevelado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    // 1. Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/'); // Se não tiver logado, chuta pro login
      return;
    }
    
    setUsuario(user);
    console.log("SEU ID DE USUÁRIO (Copie para o Supabase):", user.id);

    // 2. Busca a primeira raspadinha NÃO revelada dele
    // O select busca na tabela historico e TBM os dados do premio
    const { data, error } = await supabase
      .from('historico_raspadinhas')
      .select('*, premios(*)') 
      .eq('usuario_id', user.id)
      .eq('revelada', false)
      .limit(1)
      .single();

    if (error) {
      console.log("Nenhuma raspadinha encontrada ou erro:", error.message);
    } else {
      setRaspadinha(data);
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!raspadinha) return;

    setRevelado(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // 3. Marca no banco que ele já raspar
    await supabase
      .from('historico_raspadinhas')
      .update({ revelada: true })
      .eq('id', raspadinha.id);
      
    alert(`PARABÉNS! Prêmo liberado: ${raspadinha.premios.nome}`);
  };

  // TELA DE CARREGAMENTO
  if (loading) return <div style={styles.center}>🔄 Buscando suas raspadinhas...</div>;

  // TELA SE NÃO TIVER NADA
  if (!raspadinha) return (
    <div style={styles.center}>
      <h1>😢 Nenhuma raspadinha disponível</h1>
      <p>Peça para o admin liberar uma para você!</p>
      <p style={{fontSize: '12px', color: '#666', marginTop: '20px'}}>Seu ID: {usuario?.id}</p>
      <button onClick={buscarDados} style={styles.btnRefresh}>Atualizar</button>
    </div>
  );

  // TELA DA RASPADINHA (SE TIVER)
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍀 Sorteio Prevision</h1>
      <p style={styles.subtitle}>Olá, {usuario.email}!</p>

      <div style={styles.cardWrapper}>
        {!revelado && <p style={styles.instruction}>Arraste para revelar</p>}
        
        <ScratchCard
          width={320}
          height={320}
          image="https://i.imgur.com/4eI9QkH.png" 
          finishPercent={50}
          onComplete={handleComplete}
        >
          {/* O PRÊMIO REAL VINDO DO BANCO */}
          <div style={styles.prizeContainer}>
            <div style={styles.prizeContent}>
              <span style={{ fontSize: '50px' }}>🎁</span>
              <h2 style={styles.prizeName}>{raspadinha.premios.nome}</h2>
              <p style={styles.prizeCode}>Sorte # {raspadinha.id.slice(0,4)}</p>
            </div>
          </div>
        </ScratchCard>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' },
  title: { color: '#1f2937', marginBottom: '5px' },
  subtitle: { color: '#6b7280', marginBottom: '30px' },
  cardWrapper: { position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' },
  instruction: { position: 'absolute', top: '-30px', width: '100%', textAlign: 'center', fontSize: '12px', color: '#9ca3af' },
  prizeContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '320px', height: '320px', backgroundColor: '#FFFBEB', border: '2px solid #F59E0B' },
  prizeContent: { textAlign: 'center' },
  prizeName: { color: '#D97706', fontSize: '24px', margin: '10px 0' },
  prizeCode: { color: '#92400E', fontWeight: 'bold' },
  btnRefresh: { marginTop: '15px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Dashboard;