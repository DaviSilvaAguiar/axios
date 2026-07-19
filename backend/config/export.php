<?php

declare(strict_types=1);

use App\Export\SiengeExportHandler;
use App\Models\ExportBatch;

return [

    'templates' => [
        [
            'code' => 'sienge-expense-report',
            'name' => 'Sienge — Expense Reports',
            'description' => 'Generic CSV layout for importing expense reports into Sienge.',
            'type' => ExportBatch::TYPE_EXPENSE_REPORT,
            'handler' => SiengeExportHandler::class,
        ],
        [
            'code' => 'sienge-reimbursement',
            'name' => 'Sienge — Reimbursements',
            'description' => 'Generic CSV layout for importing reimbursements into Sienge.',
            'type' => ExportBatch::TYPE_REIMBURSEMENT,
            'handler' => SiengeExportHandler::class,
        ],
    ],

];
