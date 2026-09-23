import React, { useState, useEffect } from 'react';
import { ElimuProvider, useElimu } from './context/ElimuContext';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { SchoolDashboard } from './components/dashboard/SchoolDashboard';
import { FinancialPortal } from './components/finance/FinancialPortal';
import { GradeManagement } from './components/academics/GradeManagement';
import { AssessmentsTracking } from './components/academics/AssessmentsTracking';
import { ReportsGeneration } from './components/academics/ReportsGeneration';
import { OfficialRwandanReportModal } from './components/academics/OfficialRwandanReportModal';
import { generateClassReportCards } from './utils/reportCardGenerator';
import { StudentReportCard } from './types';
import { TimetableManagement } from './components/academics/TimetableManagement';
import { ClassAndTermManager } from './components/academics/ClassAndTermManager';
import { ELearningModule } from './components/elearning/ELearningModule';
import { LessonPlanGenerator } from './components/academics/LessonPlanGenerator';
import { StudentDirectory } from './components/students/StudentDirectory';
import { DisciplineManagement } from './components/discipline/DisciplineManagement';
import { LibraryPortal } from './components/library/LibraryPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { SMSDispatcher } from './components/communication/SMSDispatcher';
import { SystemSettings } from './components/settings/SystemSettings';
import { StaffManagement } from './components/staff/StaffManagement';
import { MasterUserAccountsManager } from './components/admin/MasterUserAccountsManager';
import { CoordinatorGovernanceHub } from './components/admin/CoordinatorGovernanceHub';
import { RegistrarPortal } from './components/admin/RegistrarPortal';
import { AuditAndSurveyReportsHub } from './components/admin/AuditAndSurveyReportsHub';
import { FieldTrainingAcademy } from './components/training/FieldTrainingAcademy';
import { DemoSystemHub } from './components/demo/DemoSystemHub';
import { SchoolProfileManager } from './components/schools/SchoolProfileManager';
import { TermsOfService } from './components/legal/TermsOfService';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { AboutElimu360 } from './components/about/AboutElimu360';
import { ContactUs } from './components/legal/ContactUs';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainRouter: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated, currentUser, students, classes, subjects, grades, activeSchool } = useElimu();

  const [verifiedReport, setVerifiedReport] = useState<StudentReportCard | null>(null);
  const [isAutoDownload, setIsAutoDownload] = useState<boolean>(false);

  // Scanned QR Verification & Auto-Download Listener
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'demo') {
      setCurrentView('DEMO_SYSTEM');
    }

    const targetStudentId = urlParams.get('verify_report');
    const targetRegNo = urlParams.get('registration');
    const shouldAutoDownload = urlParams.get('autodownload') === 'true';

    if ((targetStudentId || targetRegNo) && students.length > 0 && classes.length > 0) {
      const matchedStudent = students.find(s => 
        (targetStudentId && s.id === targetStudentId) || 
        (targetRegNo && s.registration_number?.toLowerCase() === targetRegNo.toLowerCase())
      );

      if (matchedStudent) {
        const matchedClass = classes.find(c => c.id === matchedStudent.class_id) || classes[0];
        if (matchedClass) {
          const reports = generateClassReportCards({
            selectedClass: matchedClass,
            students: [matchedStudent],
            subjects,
            grades,
            term: activeSchool?.active_term || 'Term 1',
            academicYear: activeSchool?.active_academic_year || '2026',
            reportType: 'PROGRESSIVE',
            school: activeSchool
          });

          if (reports.length > 0) {
            setVerifiedReport(reports[0]);
            setIsAutoDownload(shouldAutoDownload);
          }
        }
      }
    }
  }, [students, classes, subjects, grades, activeSchool]);

  if (verifiedReport) {
    return (
      <OfficialRwandanReportModal
        report={verifiedReport}
        school={activeSchool}
        autoDownloadOnMount={isAutoDownload}
        onClose={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setVerifiedReport(null);
        }}
      />
    );
  }

  // Public Legal & Informational Pages
  if (currentView === 'TERMS_OF_SERVICE') {
    return <TermsOfService onBack={() => setCurrentView(isAuthenticated ? 'DASHBOARD' : 'LANDING')} />;
  }

  if (currentView === 'PRIVACY_POLICY') {
    return <PrivacyPolicy onBack={() => setCurrentView(isAuthenticated ? 'DASHBOARD' : 'LANDING')} />;
  }

  if (currentView === 'ABOUT_SYSTEM') {
    return <AboutElimu360 onBack={() => setCurrentView(isAuthenticated ? 'DASHBOARD' : 'LANDING')} />;
  }

  if (currentView === 'CONTACT_US') {
    return <ContactUs onBack={() => setCurrentView(isAuthenticated ? 'DASHBOARD' : 'LANDING')} />;
  }

  // If user is authenticated and hits LOGIN, redirect to dashboard layout
  if (isAuthenticated && currentView === 'LOGIN') {
    return (
      <AppLayout>
        <SchoolDashboard />
      </AppLayout>
    );
  }

  if (currentView === 'LANDING') {
    return <LandingPage />;
  }

  if (currentView === 'LOGIN' || !isAuthenticated) {
    return <LoginPage />;
  }

  const renderModuleView = () => {
    // Strict Institutional Privacy Safeguard: Super Admin, Coordinator, and Registrar cannot view private school internal records
    if (['SUPER_ADMIN', 'COORDINATOR', 'REGISTER'].includes(currentUser.role)) {
      const privateAcademicViews = [
        'ACADEMICS_REPORTS', 
        'ACADEMICS_GRADES', 
        'ACADEMICS_ASSESSMENTS', 
        'ACADEMICS_CLASSES', 
        'FINANCIAL_PORTAL', 
        'STUDENTS_DISCIPLINE', 
        'STUDENTS_PERMISSIONS',
        'STUDENTS_DIRECTORY',
        'LIBRARY_PORTAL'
      ];
      if (privateAcademicViews.includes(currentView)) {
        return (
          <div className="max-w-2xl mx-auto my-12 bg-slate-900 rounded-2xl p-8 border border-amber-500/30 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <span className="text-2xl font-bold">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-white">Institutional Privacy Policy Enforced</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Under national educational data sovereignty regulations, <strong>{currentUser.role}</strong> accounts are strictly restricted from viewing private school marks, student disciplinary records, or financial ledgers of tenant institutions.
            </p>
            <p className="text-xs text-slate-400">
              Individual institution data is sovereign to the respective school administrators. For demonstrations and pitch presentations, use the isolated <strong>Live Pitch & Demo System</strong>.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCurrentView(currentUser.role === 'COORDINATOR' ? 'COORDINATOR_HUB' : currentUser.role === 'REGISTER' ? 'REGISTRAR_PORTAL' : 'DASHBOARD')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition"
              >
                Return to {currentUser.role === 'COORDINATOR' ? 'Governance Hub' : currentUser.role === 'REGISTER' ? 'Registrar Portal' : 'Console'}
              </button>
              <button
                onClick={() => setCurrentView('DEMO_SYSTEM')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                Open Pitch & Demo Sandbox
              </button>
            </div>
          </div>
        );
      }
    }

    // Strict Institutional Role Safeguard: Director of Discipline (DOD) is restricted to discipline, conduct, gate permissions & SMS alerts
    if (currentUser.role === 'DOD') {
      const restrictedForDOD = [
        'ACADEMICS_TIMETABLE', 
        'ACADEMICS_REPORTS', 
        'ACADEMICS_GRADES', 
        'ACADEMICS_CLASSES', 
        'ACADEMICS_ASSESSMENTS', 
        'FINANCIAL_PORTAL', 
        'LIBRARY_PORTAL', 
        'STAFF_MANAGEMENT', 
        'MASTER_USERS', 
        'SCHOOLS_MANAGEMENT', 
        'SETTINGS_CONFIG'
      ];
      if (restrictedForDOD.includes(currentView)) {
        return (
          <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-8 border border-rose-200 shadow-lg text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold">🛡️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Institutional Responsibility Scope Enforced</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              As <strong>Director of Discipline (DOD)</strong>, access to academic timetables, report card generation, class/curriculum creation, and financial ledgers is restricted. Your authority is focused on student conduct evaluation, disciplinary logs, gate exit permissions, and guardian communication.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('STUDENTS_DISCIPLINE')}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
              >
                Go to Discipline & Conduct Hub
              </button>
            </div>
          </div>
        );
      }
    }

    switch (currentView) {
      case 'COORDINATOR_HUB':
        return <CoordinatorGovernanceHub />;
      case 'REGISTRAR_PORTAL':
        return <RegistrarPortal />;
      case 'DASHBOARD':
        if (currentUser.role === 'COORDINATOR') return <CoordinatorGovernanceHub />;
        if (currentUser.role === 'REGISTER') return <RegistrarPortal />;
        if (currentUser.role === 'BURSAR') return <FinancialPortal />;
        return <SchoolDashboard />;
      case 'FINANCIAL_PORTAL':
        return <FinancialPortal />;
      case 'ACADEMICS_CLASSES':
        return <ClassAndTermManager />;
      case 'ACADEMICS_ASSESSMENTS':
        return <AssessmentsTracking />;
      case 'ACADEMICS_REPORTS':
        return <ReportsGeneration />;
      case 'ACADEMICS_GRADES':
        return <GradeManagement />;
      case 'ACADEMICS_TIMETABLE':
        return <TimetableManagement />;
      case 'ACADEMICS_ELEARNING':
      case 'STUDENT_PORTAL':
        return <ELearningModule />;
      case 'LESSON_PLANNER':
        return <LessonPlanGenerator />;
      case 'STUDENTS_DIRECTORY':
        return <StudentDirectory />;
      case 'STUDENTS_DISCIPLINE':
      case 'STUDENTS_PERMISSIONS':
        return <DisciplineManagement />;
      case 'LIBRARY_PORTAL':
        return <LibraryPortal />;
      case 'PARENT_PORTAL':
        return <ParentPortal />;
      case 'STAFF_MANAGEMENT':
        return <StaffManagement />;
      case 'MASTER_USERS':
        return <MasterUserAccountsManager />;
      case 'SCHOOLS_MANAGEMENT':
        return <SchoolProfileManager />;
      case 'SMS_DISPATCHER':
        return <SMSDispatcher />;
      case 'SETTINGS_CONFIG':
        return <SystemSettings />;
      case 'AUDIT_LOGS':
        return <AuditAndSurveyReportsHub />;
      case 'TRAINING_ACADEMY':
        return <FieldTrainingAcademy />;
      case 'DEMO_SYSTEM':
        return <DemoSystemHub />;
      default:
        if (currentUser.role === 'BURSAR') {
          return <FinancialPortal />;
        }
        return <SchoolDashboard />;
    }
  };

  return (
    <AppLayout>
      {renderModuleView()}
    </AppLayout>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ElimuProvider>
        <MainRouter />
      </ElimuProvider>
    </ErrorBoundary>
  );
}

export default App;
