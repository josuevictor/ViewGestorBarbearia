import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const PaymentScreen: React.FC = () => {
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const requestData = {
      email: "victorarroxellas224@gmail.com",
      transaction_amount: 1.00
    };

    fetch('https://backendbarbearia-2.onrender.com/api/pagamento/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
      .then(response => response.json())
      .then(data => setQrCode(data.qr_code_base64))
      .catch(error => console.error('Erro ao buscar o código QR:', error));
  }, []);

  return (
    <div>
      <h1>Pagamento da Mensalidade</h1>
      <p>Aqui você pode realizar o pagamento da mensalidade do sistema.</p>
      <p>Caso o pagamento nao seja identificado, o acesso será bloqueado após 3 dias.</p>
      {/* Exibir o QR code */}
      {qrCode && <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" style={{ width: '200px', height: '200px' }} />}
    </div>
  );
};

export default PaymentScreen;