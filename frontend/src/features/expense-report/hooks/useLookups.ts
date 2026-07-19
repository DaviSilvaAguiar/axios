import { useEffect, useState } from "react";
import { listarCentrosDeCustoApi, listarCategoriasDespesaApi } from "../rdc.api";
import { listarUsuariosApi } from "@/features/usuario/usuario.api";
import type { CentroDeCusto, CategoriaDespesa } from "../rdc.types";
import type { Usuario } from "@/features/auth/auth.types";

export interface Lookups {
  centrosCusto: CentroDeCusto[];
  categorias: CategoriaDespesa[];
  usuarios: Usuario[];
}

/**
 * Carrega centros de custo, categorias e usuários ativos.
 * Cancela o fetch se o componente desmontar antes de resolver.
 */
export function useLookups(): Lookups {
  const [centrosCusto, setCentrosCusto] = useState<CentroDeCusto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listarCentrosDeCustoApi(1, 1000),
      listarCategoriasDespesaApi(1, 1000),
      listarUsuariosApi(1, 200),
    ]).then(([centros, cats, users]) => {
      if (cancelled) return;
      setCentrosCusto(centros.data);
      setCategorias(cats.data.filter((c) => c.ativo));
      setUsuarios(users.data.filter((u) => u.ativo));
    }).catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return { centrosCusto, categorias, usuarios };
}
