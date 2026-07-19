<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const SLUGS = ['cost-center', 'expense-category', 'users'];

    public function up(): void
    {
        $moduleIds = DB::connection('central')->table('module')
            ->whereIn('slug', self::SLUGS)
            ->pluck('id')
            ->all();

        if (empty($moduleIds)) {
            return;
        }

        $nonAdminUserIds = DB::table('user')->where('role', '!=', 1)->pluck('id');
        $now = now();

        foreach ($nonAdminUserIds as $userId) {
            foreach ($moduleIds as $moduleId) {
                $exists = DB::table('user_module')
                    ->where('user_id', $userId)
                    ->where('module_id', $moduleId)
                    ->exists();

                if (! $exists) {
                    DB::table('user_module')->insert([
                        'user_id' => $userId,
                        'module_id' => $moduleId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        $moduleIds = DB::connection('central')->table('module')
            ->whereIn('slug', self::SLUGS)
            ->pluck('id')
            ->all();

        if (empty($moduleIds)) {
            return;
        }

        DB::table('user_module')->whereIn('module_id', $moduleIds)->delete();
    }
};
