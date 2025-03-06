import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard: React.FC = () => {
  const [totalClientes, setTotalClientes] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [totalAgendamentosDia, setTotalAgendamentosDia] = useState(0);
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [totalAgendamentosSemana, setTotalAgendamentosSemana] = useState(0);
  const [totalAgendamentosMes, setTotalAgendamentosMes] = useState(0);
  const [showClientes, setShowClientes] = useState(false);
  const [showAgendamentosHoje, setShowAgendamentosHoje] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(5);

  useEffect(() => {
    // Substitua as URLs pelos endpoints reais da sua API
    fetch('https://backendbarbearia-2.onrender.com/api/clientes')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTotalClientes(data.object.original.length);
          setClientes(data.object.original);
          setFilteredClientes(data.object.original);
        } else {
          console.error('Erro ao buscar total de clientes:', data.msg);
        }
      })
      .catch(error => console.error('Erro ao buscar total de clientes:', error));

    fetch('https://backendbarbearia-2.onrender.com/api/agendamento')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const today = new Date().toLocaleDateString('pt-BR');
          const agendamentosHoje = data.object.original.filter((agendamento: any) =>
            agendamento.horario.startsWith(today)
          );
          setTotalAgendamentosDia(agendamentosHoje.length);
          setAgendamentosHoje(agendamentosHoje);
        } else {
          console.error('Erro ao buscar total de agendamentos do dia:', data.msg);
        }
      })
      .catch(error => console.error('Erro ao buscar total de agendamentos do dia:', error));

    fetch('https://api.exemplo.com/totalAgendamentosSemana')
      .then(response => response.json())
      .then(data => setTotalAgendamentosSemana(data.total))
      .catch(error => console.error('Erro ao buscar total de agendamentos da semana:', error));

    fetch('https://api.exemplo.com/totalAgendamentosMes')
      .then(response => response.json())
      .then(data => setTotalAgendamentosMes(data.total))
      .catch(error => console.error('Erro ao buscar total de agendamentos do mês:', error));
  }, []);

  const data = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [
      {
        label: 'Agendamentos por Semana',
        data: [12, 19, 3, 5], // Dados fictícios
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const toggleClientes = () => {
    setShowClientes(!showClientes);
    setShowAgendamentosHoje(false);
  };

  const toggleAgendamentosHoje = () => {
    setShowAgendamentosHoje(!showAgendamentosHoje);
    setShowClientes(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredClientes(
      clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(term) ||
        cliente.sobrenome.toLowerCase().includes(term) ||
        cliente.cpf.includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        cliente.telefone.includes(term)
      )
    );
    setCurrentPage(1); // Reset to first page on search
  };

  // Get current clients
  const indexOfLastClient = currentPage * clientesPerPage;
  const indexOfFirstClient = indexOfLastClient - clientesPerPage;
  const currentClients = filteredClientes.slice(indexOfFirstClient, indexOfLastClient);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Dashboard da Barbearia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div
              className="bg-blue-500 text-white p-6 rounded-lg shadow-lg flex flex-col items-center cursor-pointer"
              onClick={toggleClientes}
            >
              <h3 className="text-lg font-semibold">Total de Clientes</h3>
              <p className="text-4xl font-bold">{totalClientes}</p>
            </div>
            <div
              className="bg-green-500 text-white p-6 rounded-lg shadow-lg flex flex-col items-center cursor-pointer"
              onClick={toggleAgendamentosHoje}
            >
              <h3 className="text-lg font-semibold">Agendamentos Hoje</h3>
              <p className="text-4xl font-bold">{totalAgendamentosDia}</p>
            </div>
            <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold">Agendamentos na Semana</h3>
              <p className="text-4xl font-bold">{totalAgendamentosSemana}</p>
            </div>
            <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold">Agendamentos no Mês</h3>
              <p className="text-4xl font-bold">{totalAgendamentosMes}</p>
            </div>
          </div>
          {showClientes && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Lista de Clientes</h3>
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={handleSearch}
                className="mb-4 p-2 border border-gray-300 rounded-md w-full"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sobrenome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentClients.map(cliente => (
                      <tr key={cliente.cpf}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.sobrenome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.cpf}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.telefone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                clientsPerPage={clientesPerPage}
                totalClients={filteredClientes.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          )}
          {showAgendamentosHoje && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Agendamentos de Hoje</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agendamentosHoje.map((agendamento: any) => (
                      <tr key={agendamento.horario}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agendamento.cliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agendamento.horario}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agendamento.servico}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agendamento.barbeiro}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agendamento.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Agendamentos por Semana</h3>
            <Bar data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination: React.FC<{
  clientsPerPage: number;
  totalClients: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}> = ({ clientsPerPage, totalClients, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalClients / clientsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-4">
      <ul className="inline-flex -space-x-px">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-2 leading-tight ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'} border border-gray-300 hover:bg-gray-200`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Dashboard;