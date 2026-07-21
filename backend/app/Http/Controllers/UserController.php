<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserModulesRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
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
        $paginator = $this->service->list($this->perPage());

        return response()->json(
            $this->paginated($paginator, UserResource::collection($paginator->items())->resolve())
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->service->create($request->validated());

        return UserResource::make($user)
            ->additional(['message' => 'User created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        return UserResource::make($this->service->find($id))->response();
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->service->update($id, $request->validated());

        return UserResource::make($user)
            ->additional(['message' => 'User updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(null, 204);
    }

    public function modules(int $id): JsonResponse
    {
        return response()->json(['data' => $this->service->listModules($id)]);
    }

    public function updateModules(UpdateUserModulesRequest $request, int $id): JsonResponse
    {
        $this->service->syncModules($id, $request->validated('modules'));

        return response()->json(['message' => 'Modules updated successfully.']);
    }
}
