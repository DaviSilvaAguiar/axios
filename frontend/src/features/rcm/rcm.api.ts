import { api } from "@/lib/api";
import { buildPageQuery, PAGE_SIZE } from "@/lib/pagination";
import { mapListarRcmsResponse, mapRcmResponse } from "./rcm.mapper";
import { despesaRcmSchema } from "./rcm.types";
import type {
  DespesaRcm,
  ListarRcmsResponse,
  Rcm,
  RcmResponse,
  StoreRcmFormData,
  UpdateRcmStatusFormData,
} from "./rcm.types";

export async function listarRcmsApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  filtros?: { colaborador?: string; status?: string; dataInicio?: string; dataFim?: string }
): Promise<ListarRcmsResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (filtros?.colaborador) params.append("colaborador", filtros.colaborador);
  if (filtros?.status) params.append("status", filtros.status);
  if (filtros?.dataInicio) params.append("dataInicio", filtros.dataInicio);
  if (filtros?.dataFim) params.append("dataFim", filtros.dataFim);

  const raw = await api.get<unknown>(`/v1/rcms?${params.toString()}`);
  return mapListarRcmsResponse(raw);
}

export async function buscarRcmApi(id: number): Promise<Rcm> {
  const raw = await api.get<unknown>(`/v1/rcms/${id}`);
  return mapRcmResponse(raw).rcm;
}

function normalizarHeaderRcm<T extends Partial<StoreRcmFormData>>(dados: T) {
  return {
    ...dados,
    id_centro_custo: dados.id_centro_custo ? Number(dados.id_centro_custo) : null,
    id_usuario_requisitante: dados.id_usuario_requisitante
      ? Number(dados.id_usuario_requisitante)
      : null,
  };
}

export async function criarRcmApi(dados: StoreRcmFormData): Promise<RcmResponse> {
  const raw = await api.post<unknown>("/v1/rcms", normalizarHeaderRcm(dados));
  return mapRcmResponse(raw);
}

export async function atualizarRcmApi(
  id: number,
  dados: Partial<StoreRcmFormData>
): Promise<RcmResponse> {
  const raw = await api.put<unknown>(`/v1/rcms/${id}`, normalizarHeaderRcm(dados));
  return mapRcmResponse(raw);
}

export async function atualizarStatusRcmApi(
  id: number,
  dados: UpdateRcmStatusFormData
): Promise<RcmResponse> {
  const raw = await api.patch<unknown>(`/v1/rcms/${id}/status`, dados);
  return mapRcmResponse(raw);
}

export async function deletarRcmApi(id: number): Promise<void> {
  await api.delete(`/v1/rcms/${id}`);
}

export { listarCentrosDeCustoApi as listarCentrosCustoApi } from "@/features/centro-de-custo/centro-de-custo.api";
export { listarCategoriasDespesaApi } from "@/features/categoria-despesa/categoria-despesa.api";

export async function criarDespesaRcmApi(
  idRcm: number,
  dados: FormData
): Promise<DespesaRcm> {
  const raw = await api.upload<unknown>(`/v1/rcms/${idRcm}/despesas`, dados);
  return despesaRcmSchema.parse((raw as { despesa?: unknown })?.despesa ?? raw);
}

export async function atualizarDespesaRcmApi(
  idRcm: number,
  idDespesa: number,
  dados: {
    data_despesa: string;
    valor: string;
    id_centro_custo: string;
    descricao: string;
    id_categoria_despesa?: string;
    latitude?: number | null;
    longitude?: number | null;
    endereco?: string | null;
    descricao_fornecedor?: string;
    cpf_cnpj_fornecedor?: string;
    id_fornecedor?: string;
  }
): Promise<DespesaRcm> {
  const raw = await api.put<unknown>(`/v1/rcms/${idRcm}/despesas/${idDespesa}`, {
    data_despesa:         dados.data_despesa,
    valor:                dados.valor,
    id_centro_custo:      parseInt(dados.id_centro_custo),
    descricao:            dados.descricao,
    id_categoria_despesa: dados.id_categoria_despesa ? parseInt(dados.id_categoria_despesa) : null,
    latitude:             dados.latitude  ?? null,
    longitude:            dados.longitude ?? null,
    endereco:             dados.endereco  ?? null,
    descricao_fornecedor: dados.descricao_fornecedor || null,
    cpf_cnpj_fornecedor:  dados.cpf_cnpj_fornecedor ? dados.cpf_cnpj_fornecedor.replace(/\D/g, "") : null,
    id_fornecedor:        dados.id_fornecedor ? Number(dados.id_fornecedor) : null,
  });
  return despesaRcmSchema.parse((raw as { despesa?: unknown })?.despesa ?? raw);
}

export async function deletarDespesaRcmApi(
  idRcm: number,
  idDespesa: number
): Promise<void> {
  await api.delete(`/v1/rcms/${idRcm}/despesas/${idDespesa}`);
}

export async function deletarAnexoRcmApi(
  idRcm: number,
  idDespesa: number
): Promise<void> {
  await api.delete(`/v1/rcms/${idRcm}/despesas/${idDespesa}/anexo`);
}

export async function substituirAnexoRcmApi(
  idRcm: number,
  idDespesa: number,
  arquivo: File
): Promise<void> {
  const fd = new FormData();
  fd.append("anexo", arquivo);
  await api.upload(`/v1/rcms/${idRcm}/despesas/${idDespesa}/anexo`, fd);
}

export async function baixarPdfRcmApi(id: number): Promise<Blob> {
  return api.blob(`/v1/rcms/${id}/pdf`);
}

export async function buscarAnexoRcmApi(idRcm: number, idDespesa: number): Promise<Blob> {
  return api.blob(`/v1/rcms/${idRcm}/despesas/${idDespesa}/anexo`);
}

export async function adicionarAnexoRcmApi(
  idRcm: number,
  idDespesa: number,
  arquivo: File
): Promise<void> {
  const fd = new FormData();
  fd.append("anexo", arquivo);
  await api.upload(`/v1/rcms/${idRcm}/despesas/${idDespesa}/anexos`, fd);
}

export async function deletarAnexoEspecificoRcmApi(
  idRcm: number,
  idDespesa: number,
  idAnexo: number
): Promise<void> {
  await api.delete(`/v1/rcms/${idRcm}/despesas/${idDespesa}/anexos/${idAnexo}`);
}

export async function buscarAnexoEspecificoRcmApi(
  idRcm: number,
  idDespesa: number,
  idAnexo: number
): Promise<Blob> {
  return api.blob(`/v1/rcms/${idRcm}/despesas/${idDespesa}/anexos/${idAnexo}`);
}
