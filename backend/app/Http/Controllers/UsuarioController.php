<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioModulosRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Services\UsuarioService;
use Illuminate\Http\JsonResponse;

class UsuarioController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly UsuarioService $service,
    ) {}

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json(
            $this->paginated($this->service->listar($this->perPage()))
        );
    }

    /**
     * @param StoreUsuarioRequest $request
     * @return JsonResponse
     */
    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $usuario = $this->service->criar($dados);

        return response()->json([
            'mensagem' => 'Usuário criado com sucesso.',
            'usuario'  => $usuario,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'usuario' => $this->service->buscar($id),
        ]);
    }

    /**
     * @param UpdateUsuarioRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateUsuarioRequest $request, int $id): JsonResponse
    {
        $dados = $request->validated();

        $usuario = $this->service->atualizar($id, $dados);

        return response()->json([
            'mensagem' => 'Usuário atualizado com sucesso.',
            'usuario'  => $usuario,
        ]);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $this->service->deletar($id);

        return response()->json([
            'mensagem' => 'Usuário removido com sucesso.',
        ]);
    }

    public function modulos(int $id): JsonResponse
    {
        return response()->json($this->service->listarModulos($id));
    }

    public function updateModulos(UpdateUsuarioModulosRequest $request, int $id): JsonResponse
    {
        $this->service->sincronizarModulos($id, $request->validated('modulos'));

        return response()->json(['mensagem' => 'Módulos atualizados com sucesso.']);
    }
}
