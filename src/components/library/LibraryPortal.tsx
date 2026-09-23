import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { LibraryBook, LibraryBorrowRecord } from '../../types';

export const LibraryPortal: React.FC = () => {
  const { 
    activeSchool, 
    books, 
    borrowRecords, 
    students, 
    borrowBook, 
    returnBook 
  } = useElimu();

  const [activeTab, setActiveTab] = useState<'CATALOG' | 'LOANS'>('CATALOG');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBookForLoan, setSelectedBookForLoan] = useState<LibraryBook | null>(null);
  const [borrowStudentId, setBorrowStudentId] = useState(students[0]?.id || '');

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLoans = borrowRecords.filter(r => r.status === 'BORROWED' || r.status === 'OVERDUE');

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForLoan) return;
    const st = students.find(s => s.id === borrowStudentId);
    if (!st) return;

    const res = borrowBook(selectedBookForLoan.id, borrowStudentId);
    if (res.success) {
      setShowBorrowModal(false);
      setSelectedBookForLoan(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Library & Academic Resources · Section 04</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Library Catalog & Automatic Fine Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ISBN index, student borrowing circulation, and automated fine routing directly to the Bursar fee ledger.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'CATALOG'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Book Catalog ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOANS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'LOANS'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Circulation & Active Loans ({activeLoans.length})</span>
        </button>
      </div>

      {/* TAB 1: BOOK CATALOG */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map(book => (
              <div key={book.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span className="font-mono">{book.isbn}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{book.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{book.title}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">By {book.author}</div>
                  <div className="text-[11px] text-teal-400 mt-2">Location: {book.location_shelf}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${book.available_copies > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {book.available_copies} / {book.total_copies} Available
                  </span>

                  <button
                    disabled={book.available_copies === 0}
                    onClick={() => {
                      setSelectedBookForLoan(book);
                      setShowBorrowModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      book.available_copies > 0
                        ? 'bg-teal-600 hover:bg-teal-500 text-white cursor-pointer'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Issue Loan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE LOANS & FINES */}
      {activeTab === 'LOANS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Book Title</th>
                <th className="py-3.5 px-4">Borrowing Student</th>
                <th className="py-3.5 px-4">Borrowed Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status & Fine</th>
                <th className="py-3.5 px-4 text-right">Circulation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {borrowRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {record.book_title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {record.student_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{record.borrow_date}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{record.due_date}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        record.status === 'RETURNED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : record.status === 'OVERDUE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {record.status}
                      </span>
                      {record.fine_amount_rwf > 0 && (
                        <span className="text-[10px] font-mono text-rose-400 font-bold">
                          Fine: RWF {record.fine_amount_rwf.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {record.status !== 'RETURNED' && (
                      <button
                        onClick={() => returnBook(record.id)}
                        className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Check-In Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Issue Book Loan */}
      {showBorrowModal && selectedBookForLoan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Issue Book to Student</h3>
              <button onClick={() => setShowBorrowModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Book Selected:</div>
                <div className="font-bold text-white text-sm">{selectedBookForLoan.title}</div>
                <div className="text-xs text-slate-400">{selectedBookForLoan.author} · ISBN: {selectedBookForLoan.isbn}</div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Student:</label>
                <select
                  value={borrowStudentId}
                  onChange={(e) => setBorrowStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.class_name})</option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-slate-400">
                Standard borrowing loan period: <strong>14 Days</strong>. Overdue late fee: RWF 500/day.
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
