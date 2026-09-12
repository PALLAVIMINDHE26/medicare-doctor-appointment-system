import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DoctorCard from '../../components/patient/DoctorCard';
import Pagination from '../../components/common/Pagination';
import ErrorState from '../../components/common/ErrorState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { doctorService } from '../../api/doctorService';
import { specializationService } from '../../api/specializationService';
import { getErrorMessage } from '../../api/axios';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'fee_low', label: 'Fee: Low to High' },
  { value: 'fee_high', label: 'Fee: High to Low' },
];

const DoctorSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    specializationService.getAll().then((res) => setSpecializations(res.data)).catch(() => {});
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.search({
        search: debouncedSearch,
        specialization: specialization || undefined,
        sortBy,
        page,
        limit: 9,
      });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, specialization, sortBy, page]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, specialization, sortBy]);

  useEffect(() => {
    const params = {};
    if (specialization) params.specialization = specialization;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialization]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Find a Doctor</h1>
          <p className="mt-1 text-slate-500">Search {result.total || ''} verified doctors across specializations.</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by doctor or specialty..." />
          <Select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="All specializations"
            options={specializations.map((s) => ({ value: s._id, label: s.name }))}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDoctors} />
        ) : result.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <SlidersHorizontal className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No doctors match your filters</h3>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">
              Try adjusting your search term or clearing the specialization filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Pagination page={page} pages={result.pages} total={result.total} limit={9} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DoctorSearch;
