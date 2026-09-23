import { jsPDF } from 'jspdf';
import { TrainingPillar, TrainingModule } from './trainingData';

// 1. Generate Individual Core Topic / Pillar PDF
export const generateIndividualPillarPdf = (pillar: TrainingPillar) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ELIMU360 FIELD ACADEMY', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text(`CORE TOPIC #${pillar.id}: ${pillar.title.toUpperCase()}`, 14, 27);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(pillar.subtitle, 14, 34);

    yPos = 52;

    // Executive Summary Box
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, pageWidth - 28, 22, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, yPos, pageWidth - 28, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('EXECUTIVE OVERVIEW & GOVERNANCE OBJECTIVE', 18, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(pillar.summary, pageWidth - 36);
    doc.text(splitSummary, 18, yPos + 12);

    yPos += 30;

    // Detailed Content Sections
    pillar.detailedContent.forEach((section) => {
      if (yPos > pageHeight - 45) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(section.heading, 14, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      section.points.forEach((point) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 20;
        }

        // Draw bullet point
        doc.setFillColor(30, 58, 138);
        doc.circle(16, yPos - 1.2, 1, 'F');

        const splitPt = doc.splitTextToSize(point, pageWidth - 36);
        doc.text(splitPt, 20, yPos);
        yPos += splitPt.length * 5 + 3;
      });

      yPos += 4;
    });

    // Page numbers & Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Elimu360 SIMS — Core Topic #${pillar.id} Official Manual | Page ${i} of ${pageCount}`, 14, pageHeight - 10);
      doc.text(`Confidential — Registrar & Coordinator Training File`, pageWidth - 80, pageHeight - 10);
    }

    const cleanTitle = pillar.title.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Elimu360_Core_Topic_${pillar.id}_${cleanTitle}.pdf`);
  } catch (err) {
    console.error('Pillar PDF Error:', err);
    alert('Failed to generate Core Topic PDF.');
  }
};

// 2. Generate Individual Training Module PDF
export const generateIndividualModulePdf = (mod: TrainingModule) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ELIMU360 FIELD ACADEMY', 14, 18);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // amber-500
    doc.text(`${mod.title.toUpperCase()} (DURATION: ${mod.duration})`, 14, 27);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Practical Field Training Module Execution Guide', 14, 34);

    yPos = 52;

    // Objective Box
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(14, yPos, pageWidth - 28, 22, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(14, yPos, pageWidth - 28, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text('MODULE LEARNING OBJECTIVE', 18, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitObj = doc.splitTextToSize(mod.objective, pageWidth - 36);
    doc.text(splitObj, 18, yPos + 12);

    yPos += 30;

    // Core Concepts Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('CORE CONCEPTS & KNOWLEDGE PILLARS', 14, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    mod.coreConcepts.forEach((concept, idx) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(241, 245, 249);
      doc.circle(18, yPos - 1.2, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 58, 138);
      doc.text(`${idx + 1}`, 16.8, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitConcept = doc.splitTextToSize(concept, pageWidth - 42);
      doc.text(splitConcept, 24, yPos);
      yPos += splitConcept.length * 5 + 4;
    });

    yPos += 4;

    // Field Scripts & Scenario Dialogues
    if (mod.fieldScripts && mod.fieldScripts.length > 0) {
      if (yPos > pageHeight - 45) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('FIELD PRESENTATION SCRIPTS & DIALOGUES', 14, yPos);
      yPos += 7;

      mod.fieldScripts.forEach((script, sIdx) => {
        if (yPos > pageHeight - 45) {
          doc.addPage();
          yPos = 20;
        }

        const splitSay = doc.splitTextToSize(`"What to Say: ${script.whatToSay}"`, pageWidth - 40);
        const boxHeight = Math.max(28, splitSay.length * 4.5 + 16);

        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, pageWidth - 28, boxHeight, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, yPos, pageWidth - 28, boxHeight, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 58, 138);
        doc.text(`Scenario #${sIdx + 1}: ${script.scenario}`, 18, yPos + 6);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(splitSay, 18, yPos + 12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text(`Key Takeaway: ${script.keyTakeaway}`, 18, yPos + boxHeight - 4);

        yPos += boxHeight + 6;
      });
    }

    // Practical Field Tip
    if (mod.practicalTip) {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(236, 253, 245); // emerald-50
      doc.rect(14, yPos, pageWidth - 28, 20, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.rect(14, yPos, pageWidth - 28, 20, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(4, 120, 87);
      doc.text('PRACTICAL FIELD EXECUTION TIP', 18, yPos + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitTip = doc.splitTextToSize(mod.practicalTip, pageWidth - 36);
      doc.text(splitTip, 18, yPos + 12);

      yPos += 26;
    }

    // Page numbers & Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Elimu360 SIMS — Module #${mod.id} Training Manual | Page ${i} of ${pageCount}`, 14, pageHeight - 10);
      doc.text(`Confidential — Registrar & Coordinator Training File`, pageWidth - 80, pageHeight - 10);
    }

    const cleanTitle = mod.title.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Elimu360_Training_Module_${mod.id}_${cleanTitle}.pdf`);
  } catch (err) {
    console.error('Module PDF Error:', err);
    alert('Failed to generate Module PDF.');
  }
};

// 3. Generate Complete Master Manual PDF
export const generateMasterManualPdf = (pillars: TrainingPillar[], modules: TrainingModule[]) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Cover Page Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ELIMU360 FIELD ACADEMY', 14, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Master Field Presentation Manual & Training Guide', 14, 28);
    doc.text(`Official Curriculum for School Registrars & Regional Coordinators`, 14, 35);

    yPos = 55;

    // Executive Summary
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('COMPREHENSIVE 12-PILLAR SYSTEM FRAMEWORK', 14, yPos);
    yPos += 8;

    pillars.forEach((pillar) => {
      if (yPos > pageHeight - 35) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos, pageWidth - 28, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, yPos, pageWidth - 28, 24, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text(pillar.title, 18, yPos + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(pillar.subtitle, 18, yPos + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const splitSummary = doc.splitTextToSize(pillar.summary, pageWidth - 36);
      doc.text(splitSummary, 18, yPos + 16);

      yPos += 28;
    });

    // Add Module Section
    doc.addPage();
    yPos = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('THE 7 PRACTICAL FIELD TRAINING MODULES', 14, yPos);
    yPos += 10;

    modules.forEach((mod) => {
      if (yPos > pageHeight - 45) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(`${mod.title} (${mod.duration})`, 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Objective: ${mod.objective}`, 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      mod.coreConcepts.forEach((concept) => {
        doc.text(`• ${concept}`, 18, yPos);
        yPos += 5;
      });

      if (mod.fieldScripts.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(71, 85, 105);
        doc.text(`Script (${mod.fieldScripts[0].scenario}):`, 18, yPos);
        yPos += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const splitScript = doc.splitTextToSize(mod.fieldScripts[0].whatToSay, pageWidth - 36);
        doc.text(splitScript, 22, yPos);
        yPos += splitScript.length * 4.5 + 4;
      }

      yPos += 4;
    });

    // Add Footer with Page Numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Elimu360 SIMS — Official Registrar & Coordinator Field Manual | Page ${i} of ${pageCount}`, 14, pageHeight - 10);
      doc.text(`Confidential — For Authorized Training Use Only`, pageWidth - 75, pageHeight - 10);
    }

    doc.save(`Elimu360_Master_Field_Training_Manual.pdf`);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Failed to generate Master Manual PDF.');
  }
};

// 4. Generate Official Certificate of Accreditation PDF
export const generateCertificatePdf = (candidateName: string, testScore: number, role: string) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background Frame
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer Double Border
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

    doc.setDrawColor(217, 119, 6); // amber-600
    doc.setLineWidth(0.8);
    doc.rect(13, 13, pageWidth - 26, pageHeight - 26, 'S');

    // Gold Corner Ornaments
    doc.setFillColor(217, 119, 6);
    doc.rect(13, 13, 12, 12, 'F');
    doc.rect(pageWidth - 25, 13, 12, 12, 'F');
    doc.rect(13, pageHeight - 25, 12, 12, 'F');
    doc.rect(pageWidth - 25, pageHeight - 25, 12, 12, 'F');

    // Header Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('CERTIFICATE OF FIELD ACCREDITATION', pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('REPUBLIC OF RWANDA · NATIONAL EDUCATIONAL SIMS DIRECTORATE', pageWidth / 2, 48, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(60, 53, pageWidth - 60, 53);

    // Body Text
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('This is to officially certify that', pageWidth / 2, 68, { align: 'center' });

    // Candidate Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text(candidateName.toUpperCase(), pageWidth / 2, 82, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('has successfully completed the comprehensive training program and practical competency examination in', pageWidth / 2, 95, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('ELIMU360 SIMS FIELD ONBOARDING, PRESENTATION & REGIONAL GOVERNANCE', pageWidth / 2, 105, { align: 'center' });

    // Score Badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(pageWidth / 2 - 45, 115, 90, 14, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(pageWidth / 2 - 45, 115, 90, 14, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`EXAMINATION SCORE: ${testScore}% (PASSED)`, pageWidth / 2, 124, { align: 'center' });

    // Role & Authorizations
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Authorized Role: ${role === 'COORDINATOR' ? 'Regional Coordinator' : 'Accredited School Registrar'}`, pageWidth / 2, 138, { align: 'center' });
    doc.text(`Entitlement: Authorized to register schools, conduct field surveys, and earn 10% recurring commission (3 Yrs).`, pageWidth / 2, 145, { align: 'center' });

    // Signatures & Seals
    const certDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const certCode = `CERT-E360-${Math.floor(100000 + Math.random() * 900000)}`;

    // Date Column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(certDate, 45, 175);
    doc.line(35, 177, 85, 177);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Date of Certification', 45, 182);

    // Verification Code Column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(certCode, pageWidth / 2 - 15, 175);
    doc.line(pageWidth / 2 - 25, 177, pageWidth / 2 + 25, 177);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Verification Code', pageWidth / 2 - 18, 182);

    // Director Signature Column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Super Administrator', pageWidth - 75, 175);
    doc.line(pageWidth - 85, 177, pageWidth - 35, 177);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('National Directorate Approval', pageWidth - 78, 182);

    doc.save(`Elimu360_Accreditation_Certificate_${candidateName.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('Certificate PDF Error:', err);
    alert('Failed to generate Certificate PDF.');
  }
};
