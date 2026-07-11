import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapConsultaCnpj,
  mapFornecedorResponse,
  mapListarFornecedores,
} from "./fornecedor.mapper";
import type {
  ConsultaCnpjData,
  Fornecedor,
  FornecedorFormData,
  FornecedorResponse,
} from "./fornecedor.types";

export async function listarFornecedoresApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<Fornecedor>> {
  const raw = await api.get<unknown>(`/v1/fornecedor${buildPageQuery(page, perPage)}`);
  return mapListarFornecedores(raw);
}

export async function listarFornecedoresAtivosApi(): Promise<Fornecedor[]> {
  const resultado = await listarFornecedoresApi(1, 9999);
  return resultado.data.filter((f) => f.ativo);
}

export async function buscarFornecedorApi(id: number): Promise<Fornecedor> {
  const raw = await api.get<unknown>(`/v1/fornecedor/${id}`);
  return mapFornecedorResponse(raw).fornecedor;
}

export async function criarFornecedorApi(dados: FornecedorFormData): Promise<FornecedorResponse> {
  const raw = await api.post<unknown>("/v1/fornecedor", dados);
  return mapFornecedorResponse(raw);
}

export async function atualizarFornecedorApi(
  id: number,
  dados: Partial<FornecedorFormData>
): Promise<FornecedorResponse> {
  const raw = await api.put<unknown>(`/v1/fornecedor/${id}`, dados);
  return mapFornecedorResponse(raw);
}

export async function deletarFornecedorApi(id: number): Promise<void> {
  await api.delete(`/v1/fornecedor/${id}`);
}

export async function consultarCnpjApi(cnpj: string): Promise<ConsultaCnpjData | null> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  try {
    const raw = await api.get<unknown>(`/v1/consulta-cnpj/${digits}`);
    return mapConsultaCnpj(raw).data;
  } catch {
    return null;
  }
}
