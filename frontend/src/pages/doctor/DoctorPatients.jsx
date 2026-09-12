import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardTopbar from '../../components/layout/DashboardTopbar';
import Table from '../../components/common/Table';
import Avatar from '../../components/common/Avatar';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { doctorService } from '../../api/doctorService';
import { getErrorMessage } from '../../api/axios';
import { formatDate } from '../../utils/formatters';

const DoctorPatients = () => {
  const { openMobileSidebar } = useOutletContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getMyPatients({ search: debouncedSearch, page, limit: 10 });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [debouncedSearch]);

  const columns = [
    {
      key: 'name',
      header: 'Patient',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.user.name} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{row.user.name}</p>
            <p className="text-xs text-slate-400">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (row) => row.user.phone },
    { key: 'gender', header: 'Gender', render: (row) => <span className="capitalize">{row.gender?.replace(/_/g, ' ')}</span> },
    { key: 'bloodGroup', header: 'Blood Group', render: (row) => row.bloodGroup },
    { key: 'appointmentCount', header: 'Total Visits', render: (row) => row.appointmentCount },
    { key: 'since', header: 'Patient Since', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <>
      <DashboardTopbar title="My Patients" subtitle="Everyone who has booked an appointment with you." onOpenMobile={openMobileSidebar} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mb-5 max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients by name..." />
        </div>

        <Table
          columns={columns}
          data={result.data}
          loading={loading}
          error={error}
          onRetry={load}
          rowKey="_id"
          emptyTitle="No patients yet"
          emptyDescription="Patients who book with you will show up here."
        />

        {!loading && !error && result.data.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Pagination page={page} pages={result.pages} total={result.total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </main>
    </>
  );
};

export default DoctorPatients;
