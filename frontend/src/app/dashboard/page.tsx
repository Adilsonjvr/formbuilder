"use client";

import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api(url.replace('http://localhost:3000', ''));

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('/forms', () => api('/forms')); 

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar forms</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Meus formulários</h1>
      <div className="space-y-2">
        {data.items?.length ? (
          data.items.map((form: any) => (
            <div key={form.id} className="rounded border border-slate-800 p-3 flex justify-between">
              <div>
                <div className="font-medium">{form.name}</div>
                <div className="text-xs text-slate-400">
                  {form.description || 'Sem descrição'}
                </div>
              </div>
              <div className="text-xs text-slate-500 flex items-center">{form.createdAt}</div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-sm">Nenhum formulário ainda.</p>
        )}
      </div>
    </div>
  );
}
