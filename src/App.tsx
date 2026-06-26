import { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PeopleList from './components/PeopleList';
import Territories from './components/Territories';
import Jornada from './components/Jornada';
import FamilyManager from './components/FamilyManager';
import VisitasList from './components/VisitasList';
import Pendencies from './components/Pendencies';
import PersonDetailDrawer from './components/PersonDetailDrawer';

import { Person, Family, Visit, Sector, AccessRole } from './types';
import { 
  loadPeople, savePeople, 
  loadFamilies, saveFamilies, 
  loadVisits, saveVisits, 
  loadSectors 
} from './data';

export default function App() {
  // Database states loaded on startup
  const [people, setPeople] = useState<Person[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  // Navigation and UI control states
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<AccessRole>('ADMIN');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setPeople(loadPeople());
    setFamilies(loadFamilies());
    setVisits(loadVisits());
    setSectors(loadSectors());
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (people.length > 0) savePeople(people);
  }, [people]);

  useEffect(() => {
    if (families.length > 0) saveFamilies(families);
  }, [families]);

  useEffect(() => {
    if (visits.length > 0) saveVisits(visits);
  }, [visits]);

  // Sync selected person details if updated in lists or journeys
  const handleUpdatePerson = (updated: Person) => {
    setPeople(prev => prev.map(p => p.codigoCadastro === updated.codigoCadastro ? updated : p));
    if (selectedPerson && selectedPerson.codigoCadastro === updated.codigoCadastro) {
      setSelectedPerson(updated);
    }
  };

  // Live count of pending items for the sidebar badge
  const pendingCount = useMemo(() => {
    const activePeople = userRole === 'AM' ? people.filter(p => p.setor === 'CENTRO-NORTE') : people;
    let count = 0;

    activePeople.forEach(p => {
      // 1. Post-outorga incomplete
      if (p.subtipoCadastro === 'MEMBRO' && p.jornada.cursoPosOutorga.aulas.filter(Boolean).length < 5) {
        count++;
      }
      // 2. Missing phone number
      else if (!p.celularPrincipal && !p.telefoneContato) {
        count++;
      }
      // 3. No sector or AF
      else if (!p.setor || !p.af || p.af === 'NENHUM' || p.idFamilia === '') {
        count++;
      }
      // 4. Frequenters with no visits in last 30 days
      else if (p.subtipoCadastro === 'FREQUENTADOR') {
        const pVisits = visits.filter(v => v.recebedor === p.nome);
        const hasRecent = pVisits.some(v => new Date(v.data) >= new Date('2026-05-25'));
        if (!hasRecent) count++;
      }
    });

    return count;
  }, [people, visits, userRole]);

  return (
    <div className="flex bg-slate-100 min-h-screen font-sans antialiased text-slate-800" id="app-root">
      
      {/* Side Navigation panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userRole={userRole} 
        setUserRole={setUserRole}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-screen" id="main-content">
        
        {currentTab === 'dashboard' && (
          <Dashboard 
            people={people} 
            families={families} 
            visits={visits} 
            sectors={sectors}
            userRole={userRole}
          />
        )}

        {currentTab === 'people' && (
          <PeopleList 
            people={people} 
            setPeople={setPeople} 
            families={families} 
            sectors={sectors}
            userRole={userRole}
            onSelectPerson={setSelectedPerson}
          />
        )}

        {currentTab === 'territory' && (
          <Territories 
            people={people} 
            families={families} 
            sectors={sectors}
            userRole={userRole}
            onSelectPerson={setSelectedPerson}
          />
        )}

        {currentTab === 'journey' && (
          <Jornada 
            people={people} 
            setPeople={setPeople} 
            userRole={userRole}
            selectedPersonFromMain={selectedPerson}
            setSelectedPersonFromMain={setSelectedPerson}
          />
        )}

        {currentTab === 'families' && (
          <FamilyManager 
            families={families} 
            setFamilies={setFamilies} 
            people={people} 
            visits={visits}
            setVisits={setVisits}
            userRole={userRole}
          />
        )}

        {currentTab === 'visits' && (
          <VisitasList 
            visits={visits} 
            setVisits={setVisits} 
            families={families} 
            userRole={userRole}
          />
        )}

        {currentTab === 'pendencies' && (
          <Pendencies 
            people={people} 
            setPeople={setPeople} 
            families={families} 
            visits={visits} 
            userRole={userRole}
            onSelectPerson={setSelectedPerson}
            setCurrentTab={setCurrentTab}
          />
        )}

      </main>

      {/* Slide-over detail drawer for clicked members */}
      <PersonDetailDrawer 
        person={selectedPerson} 
        onClose={() => setSelectedPerson(null)} 
        families={families} 
        sectors={sectors}
        onUpdatePerson={handleUpdatePerson}
      />

    </div>
  );
}
