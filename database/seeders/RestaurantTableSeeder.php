<?php

namespace Database\Seeders;

use App\Models\RestaurantTable;
use Illuminate\Database\Seeder;

class RestaurantTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            // Indoor Tables (Meja 1-20)
            // Meja untuk 2 orang
            ['table_number' => 1, 'capacity' => 2, 'location_type' => 'indoor', 'location_detail' => 'Window'],
            ['table_number' => 2, 'capacity' => 2, 'location_type' => 'indoor', 'location_detail' => 'Window'],
            ['table_number' => 3, 'capacity' => 2, 'location_type' => 'indoor', 'location_detail' => 'Center'],
            ['table_number' => 4, 'capacity' => 2, 'location_type' => 'indoor', 'location_detail' => 'Bar Area'],
            ['table_number' => 5, 'capacity' => 2, 'location_type' => 'indoor', 'location_detail' => 'Corner'],
            
            // Meja untuk 4 orang
            ['table_number' => 6, 'capacity' => 4, 'location_type' => 'indoor', 'location_detail' => 'Window'],
            ['table_number' => 7, 'capacity' => 4, 'location_type' => 'indoor', 'location_detail' => 'Center'],
            ['table_number' => 8, 'capacity' => 4, 'location_type' => 'indoor', 'location_detail' => 'Corner'],
            ['table_number' => 9, 'capacity' => 4, 'location_type' => 'indoor', 'location_detail' => 'VIP Area'],
            ['table_number' => 10, 'capacity' => 4, 'location_type' => 'indoor', 'location_detail' => 'Center'],
            
            // Meja untuk 6 orang
            ['table_number' => 11, 'capacity' => 6, 'location_type' => 'indoor', 'location_detail' => 'VIP Area'],
            ['table_number' => 12, 'capacity' => 6, 'location_type' => 'indoor', 'location_detail' => 'Center'],
            ['table_number' => 13, 'capacity' => 6, 'location_type' => 'indoor', 'location_detail' => 'Window'],
            
            // Meja untuk 8 orang
            ['table_number' => 14, 'capacity' => 8, 'location_type' => 'indoor', 'location_detail' => 'VIP Area'],
            ['table_number' => 15, 'capacity' => 8, 'location_type' => 'indoor', 'location_detail' => 'Private Room'],
            
            // Meja untuk 10+ orang (gathering)
            ['table_number' => 16, 'capacity' => 10, 'location_type' => 'indoor', 'location_detail' => 'Private Room'],
            ['table_number' => 17, 'capacity' => 12, 'location_type' => 'indoor', 'location_detail' => 'Private Room'],
            
            // Outdoor Tables (Meja 18-30)
            // Meja untuk 2 orang
            ['table_number' => 18, 'capacity' => 2, 'location_type' => 'outdoor', 'location_detail' => 'Garden'],
            ['table_number' => 19, 'capacity' => 2, 'location_type' => 'outdoor', 'location_detail' => 'Terrace'],
            ['table_number' => 20, 'capacity' => 2, 'location_type' => 'outdoor', 'location_detail' => 'Garden'],
            
            // Meja untuk 4 orang
            ['table_number' => 21, 'capacity' => 4, 'location_type' => 'outdoor', 'location_detail' => 'Garden'],
            ['table_number' => 22, 'capacity' => 4, 'location_type' => 'outdoor', 'location_detail' => 'Terrace'],
            ['table_number' => 23, 'capacity' => 4, 'location_type' => 'outdoor', 'location_detail' => 'Garden'],
            ['table_number' => 24, 'capacity' => 4, 'location_type' => 'outdoor', 'location_detail' => 'Gazebo'],
            
            // Meja untuk 6 orang
            ['table_number' => 25, 'capacity' => 6, 'location_type' => 'outdoor', 'location_detail' => 'Garden'],
            ['table_number' => 26, 'capacity' => 6, 'location_type' => 'outdoor', 'location_detail' => 'Terrace'],
            ['table_number' => 27, 'capacity' => 6, 'location_type' => 'outdoor', 'location_detail' => 'Gazebo'],
            
            // Meja untuk 8+ orang
            ['table_number' => 28, 'capacity' => 8, 'location_type' => 'outdoor', 'location_detail' => 'Garden'],
            ['table_number' => 29, 'capacity' => 10, 'location_type' => 'outdoor', 'location_detail' => 'Gazebo'],
            ['table_number' => 30, 'capacity' => 12, 'location_type' => 'outdoor', 'location_detail' => 'Garden Event Area'],
        ];

        foreach ($tables as $table) {
            RestaurantTable::create(array_merge($table, [
                'status' => RestaurantTable::STATUS_AVAILABLE,
                'is_active' => true
            ]));
        }

        $this->command->info('Created ' . count($tables) . ' restaurant tables');
    }
}