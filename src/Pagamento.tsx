import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PaymentScreen: React.FC = () => {
  const [qrCode, setQrCode] = useState('');
  const [pixCopiaCola, setPixCopiaCola] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const generatePayment = () => {
    setIsButtonDisabled(true); // Desativa o botão

    const requestData = {
      email: "victorarroxellas224@gmail.com",
      transaction_amount: 1.00,
      barbearia_id: 1,
    };

    fetch('https://backendbarbearia-2.onrender.com/api/pagamento/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        setQrCode(data.qr_code_base64);
        setPixCopiaCola(data.qr_code);
        setPaymentId(data.payment_id); // Armazena o ID do pagamento
        setTimeLeft(600); // Reinicia o temporizador
      })
      .catch((error) => {
        console.error('Erro ao buscar o código QR:', error);
        setIsButtonDisabled(false); // Reativa o botão em caso de erro
      });
  };

  // Função para verificar o status do pagamento
  useEffect(() => {
    if (!paymentId) return; // Só executa se o paymentId estiver definido

    const interval = setInterval(() => {
      fetch(`https://backendbarbearia-2.onrender.com/api/pagamento/status/${paymentId}`)
        .then((response) => response.json())
        .then((data) => {
          setPaymentStatus(data.status); // Atualiza o status do pagamento

          // Se o pagamento for aprovado, para de verificar e exibe o SweetAlert
          if (data.status === 'approved') {
            clearInterval(interval);
            MySwal.fire({
              title: 'Pagamento aprovado!',
              text: 'Obrigado pela sua assinatura.',
              icon: 'success',
              showConfirmButton: false,
              timer: 3000,
            });
          }
        })
        .catch((error) => console.error('Erro ao verificar status do pagamento:', error));
    }, 5000); // Verifica o status a cada 5 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [paymentId]);

  // Função para gerenciar o temporizador
  useEffect(() => {
    if (timeLeft <= 0) {
      MySwal.fire({
        title: 'Tempo esgotado!',
        text: 'O tempo para realizar o pagamento expirou. Por favor, gere um novo QR code.',
        icon: 'error',
        showConfirmButton: true,
      });
      setIsButtonDisabled(false); // Reativa o botão quando o tempo expira
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCopiaCola);
    alert('Código PIX copiado para a área de transferência!');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div>
      <h1>Pagamento da Mensalidade</h1>
      <p>Aqui você pode realizar o pagamento da mensalidade do sistema.</p>
      <p>Caso o pagamento não seja identificado, o acesso será bloqueado após 3 dias.</p>

      {/* Botão para gerar o QR code */}
      <button
        onClick={generatePayment}
        disabled={isButtonDisabled}
        style={{
          padding: '10px 20px',
          border: 'none',
          backgroundColor: isButtonDisabled ? '#ccc' : '#007bff',
          color: '#fff',
          borderRadius: '4px',
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
        }}
      >
        Gerar QR Code
      </button>

      {/* Exibir o QR code */}
      {qrCode && (
        <img
          src={`data:image/png;base64,${qrCode}`}
          alt="QR Code"
          style={{ width: '200px', height: '200px' }}
        />
      )}

      {/* Exibir o código PIX "copia e cola" */}
      {pixCopiaCola && (
        <div>
          <p>Código PIX "Copia e Cola":</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={pixCopiaCola}
              readOnly
              style={{
                width: '300px',
                marginRight: '10px',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                padding: '5px 10px',
                border: 'none',
                backgroundColor: '#007bff',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* Exibir o temporizador */}
      {qrCode && (
        <div style={{ marginTop: '20px' }}>
          <h2>Tempo restante para pagamento:</h2>
          <p>{formatTime(timeLeft)}</p>
        </div>
      )}

      {/* Exibir o status do pagamento */}
      {paymentStatus && (
        <div style={{ marginTop: '20px' }}>
          <h2>Status do Pagamento:</h2>
          {paymentStatus === 'approved' && (
            <p style={{ color: 'green' }}>Pagamento aprovado! Obrigado pela sua assinatura.</p>
          )}
          {paymentStatus === 'pending' && (
            <p style={{ color: 'orange' }}>Pagamento pendente. Aguardando confirmação...</p>
          )}
          {paymentStatus === 'rejected' && (
            <p style={{ color: 'red' }}>Pagamento rejeitado. Por favor, tente novamente.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentScreen;