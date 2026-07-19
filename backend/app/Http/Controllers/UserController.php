<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserModulesRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly UserService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(
            $this->paginated($this->service->list($this->perPage()))
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $this->service->create($data);

        return response()->json([
            'message' => 'User created successfully.',
            'user'    => $user,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'user' => $this->service->find($id),
        ]);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $user = $this->service->update($id, $data);

        return response()->json([
            'message' => 'User updated successfully.',
            'user'    => $user,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    public function modules(int $id): JsonResponse
    {
        return response()->json($this->service->listModules($id));
    }

    public function updateModules(UpdateUserModulesRequest $request, int $id): JsonResponse
    {
        $this->service->syncModules($id, $request->validated('modules'));

        return response()->json(['message' => 'Modules updated successfully.']);
    }
}
