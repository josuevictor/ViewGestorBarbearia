import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Check, X, Home, DollarSign, BarChart2 } from 'lucide-react';
import { Route, Routes, Link } from 'react-router-dom';
import PaymentScreen from './Pagamento';
import Dashboard from './Dashboard'; // Importar o componente Dashboard

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPix } from '@fortawesome/free-brands-svg-icons';

type ConfirmationModal = {
  isOpen: boolean;
  appointmentId: number | null;
  action: 'confirmar' | 'cancelar' | null;
};

type Appointment = {
  id: number;
  cliente: string;
  horario: string;
  servico: string;
  barbeiro: string;
  status: string;
};

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    appointmentId: null,
    action: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('https://backendbarbearia-2.onrender.com/api/agendamento')
      .then(response => response.json())
      .then(data => setAppointments(data.object.original))
      .catch(error => console.error('Erro ao buscar agendamentos:', error));
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const openConfirmationModal = (id: number, action: 'confirmar' | 'cancelar') => {
    setConfirmationModal({
      isOpen: true,
      appointmentId: id,
      action,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      appointmentId: null,
      action: null,
    });
  };

  const updateStatus = () => {
    if (!confirmationModal.appointmentId || !confirmationModal.action) return;

    const newStatus = confirmationModal.action === 'confirmar' ? 'AGENDADO' : 'CANCELADO';
    const appointment = appointments.find(appointment => appointment.id === confirmationModal.appointmentId);

    if (appointment) {
      fetch('https://backendbarbearia-2.onrender.com/api/cancelarAgendamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: appointment.id,
          data_hora: appointment.horario,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setAppointments(appointments.map(appointment =>
              appointment.id === confirmationModal.appointmentId
                ? { ...appointment, status: newStatus }
                : appointment
            ));
          } else {
            console.error('Erro ao atualizar status do agendamento:', data.msg);
          }
        })
        .catch(error => console.error('Erro ao atualizar status do agendamento:', error));
    }

    closeConfirmationModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter(appointment =>
    appointment.cliente.toLowerCase().includes(filter.toLowerCase()) ||
    appointment.servico.toLowerCase().includes(filter.toLowerCase()) ||
    appointment.barbeiro.toLowerCase().includes(filter.toLowerCase()) ||
    appointment.status.toLowerCase().includes(filter.toLowerCase())
  );

  // Paginar agendamentos
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Scissors className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Sistema de gestão</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <Calendar className="inline-block h-4 w-4 mr-1" />
                {today}
              </div>
              <nav>
                <ul className="flex space-x-4">
                  <li>
                    <Link to="/app" className="text-blue-600 hover:text-blue-800"><Home className="h-6 w-6" /></Link>
                  </li>
                  <li>
                    <Link to="/app/pagamento" className="text-blue-600 hover:text-blue-800"><FontAwesomeIcon icon={faPix} className="h-6 w-6" /></Link>
                  </li>
                  <li>
                    <Link to="/app/dashboard" className="text-blue-600 hover:text-blue-800"><BarChart2 className="h-6 w-6" /></Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="pagamento" element={<PaymentScreen />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/" element={
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Agenda</h2>
                <input
                  type="text"
                  placeholder="Filtrar agendamentos"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data_Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barbeiro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAppointments.map((appointment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.cliente}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{appointment.horario}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.servico}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.barbeiro}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openConfirmationModal(appointment.id, 'confirmar')}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openConfirmationModal(appointment.id, 'cancelar')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Anterior
                </button>
                <span>Página {currentPage}</span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={indexOfLastAppointment >= filteredAppointments.length}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Próximo
                </button>
              </div>
            </div>
          } />
        </Routes>
      </main>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar ação
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Você tem certeza que deseja {confirmationModal.action} este agendamento?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmationModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={updateStatus}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  confirmationModal.action === 'confirmar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;