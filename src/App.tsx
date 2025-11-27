import { useState } from 'react';
import Sidebar from './components/Sidebar';
import HallDashboard from './components/HallDashboard';
import CreateHallForm from './components/CreateHallForm';
import HallLayout from './components/HallLayout';
import Reports from './components/Reports';
import PrintLayout from './components/PrintLayout';
import DepartmentManagement from './components/DepartmentManagement';
import { Hall } from './lib/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);

  const handleEditHall = (hall: Hall) => {
    setSelectedHall(hall);
    setCurrentView('layout');
  };

  const handleHallCreated = (hall: Hall) => {
    setSelectedHall(hall);
    setCurrentView('layout');
  };

  const handleBackToDashboard = () => {
    setSelectedHall(null);
    setCurrentView('dashboard');
  };

  return (
    <>
      <div className="flex h-screen screen-only">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-auto bg-gray-50">
          {currentView === 'dashboard' && <HallDashboard onEditHall={handleEditHall} />}
          {currentView === 'create' && <CreateHallForm onHallCreated={handleHallCreated} />}
          {currentView === 'students' && <DepartmentManagement />}
          {currentView === 'reports' && <Reports />}
          {currentView === 'layout' && selectedHall && (
            <HallLayout hall={selectedHall} onBack={handleBackToDashboard} />
          )}
        </main>
      </div>
      {selectedHall && <PrintLayout hall={selectedHall} />}
    </>
  );
}

export default App;
