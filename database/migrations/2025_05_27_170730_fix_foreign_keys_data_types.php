<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Seed packages DULU sebelum foreign key
        $this->seedPackagesFirst();
        
        // 2. Update reservations data yang invalid
        $this->fixInvalidReservationData();
        
        // 3. Baru tambah foreign key constraints
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedBigInteger('package_id')->change();
            $table->foreign('package_id')
                  ->references('id')
                  ->on('reservation_packages')
                  ->onDelete('restrict');
        });

        Schema::table('reservation_menu_items', function (Blueprint $table) {
            $table->unsignedBigInteger('menu_item_id')->change();
            $table->foreign('menu_item_id')
                  ->references('id')
                  ->on('menu_items')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->integer('package_id')->change();
        });

        Schema::table('reservation_menu_items', function (Blueprint $table) {
            $table->dropForeign(['menu_item_id']);
            $table->integer('menu_item_id')->change();
        });
    }

    /**
     * Seed packages first
     */
    private function seedPackagesFirst(): void
    {
        // Check if packages already exist
        if (DB::table('reservation_packages')->count() > 0) {
            return; // Already seeded
        }

        $packages = [
            [
                'id' => 1,
                'name' => 'Paket Romantis (2 Orang)',
                'price' => 299000,
                'image' => 'poto.jpg',
                'description' => 'Makan malam romantis untuk dua orang dengan lilin dan dekorasi bunga',
                'includes' => json_encode(['2 Main Course', '2 Dessert', '2 Minuman', 'Dekorasi Meja', 'Foto Kenangan']),
                'duration' => '2 jam',
                'max_people' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Paket Keluarga (4 Orang)',
                'price' => 499000,
                'image' => null,
                'description' => 'Paket makan bersama keluarga dengan suasana yang hangat',
                'includes' => json_encode(['4 Main Course', '4 Dessert', '4 Minuman', 'Free Kids Dessert']),
                'duration' => '3 jam',
                'max_people' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'name' => 'Paket Gathering (8 Orang)',
                'price' => 899000,
                'image' => null,
                'description' => 'Paket untuk acara kumpul bersama teman atau kolega',
                'includes' => json_encode(['8 Main Course', '8 Dessert', '8 Minuman', '1 Appetizer Platter', '1 Birthday Cake']),
                'duration' => '4 jam',
                'max_people' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('reservation_packages')->insert($packages);
    }

    /**
     * Fix invalid reservation data
     */
    private function fixInvalidReservationData(): void
    {
        // Get existing reservations with invalid package_id
        $invalidReservations = DB::table('reservations')
            ->whereNotIn('package_id', [1, 2, 3])
            ->get();

        foreach ($invalidReservations as $reservation) {
            // Set default package_id based on number_of_people or fallback to 1
            $packageId = 1; // Default
            
            if ($reservation->number_of_people <= 2) {
                $packageId = 1;
            } elseif ($reservation->number_of_people <= 4) {
                $packageId = 2;
            } elseif ($reservation->number_of_people > 4) {
                $packageId = 3;
            }

            DB::table('reservations')
                ->where('id', $reservation->id)
                ->update(['package_id' => $packageId]);
        }

        // Do the same for menu items if needed
        $this->seedMenuItemsFirst();
        $this->fixInvalidMenuItemData();
    }

    /**
     * Seed menu items first
     */
    private function seedMenuItemsFirst(): void
    {
        // Check if categories exist
        if (DB::table('menu_categories')->count() == 0) {
            $categories = [
                ['id' => 1, 'name' => 'Food', 'slug' => 'food', 'sort_order' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 2, 'name' => 'Beverage', 'slug' => 'beverage', 'sort_order' => 2, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 3, 'name' => 'Dessert', 'slug' => 'dessert', 'sort_order' => 3, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            ];
            DB::table('menu_categories')->insert($categories);
        }

        // Check if menu items exist
        if (DB::table('menu_items')->count() == 0) {
            $menuItems = [
                // Food items (1-6)
                ['id' => 1, 'category_id' => 1, 'name' => 'Nasi Goreng Spesial', 'slug' => 'nasi-goreng-spesial', 'price' => 45000, 'is_available' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 2, 'category_id' => 1, 'name' => 'Sate Ayam', 'slug' => 'sate-ayam', 'price' => 35000, 'is_available' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 3, 'category_id' => 1, 'name' => 'Ayam Bakar', 'slug' => 'ayam-bakar', 'price' => 55000, 'is_available' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 4, 'category_id' => 1, 'name' => 'Mie Goreng', 'slug' => 'mie-goreng', 'price' => 40000, 'is_available' => true, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 5, 'category_id' => 1, 'name' => 'Rendang Sapi', 'slug' => 'rendang-sapi', 'price' => 65000, 'is_available' => true, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 6, 'category_id' => 1, 'name' => 'Ikan Bakar', 'slug' => 'ikan-bakar', 'price' => 60000, 'is_available' => true, 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
                
                // Beverage items (7-12)
                ['id' => 7, 'category_id' => 2, 'name' => 'Es Teh Manis', 'slug' => 'es-teh-manis', 'price' => 15000, 'is_available' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 8, 'category_id' => 2, 'name' => 'Jus Alpukat', 'slug' => 'jus-alpukat', 'price' => 25000, 'is_available' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 9, 'category_id' => 2, 'name' => 'Lemon Tea', 'slug' => 'lemon-tea', 'price' => 20000, 'is_available' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 10, 'category_id' => 2, 'name' => 'Kopi Hitam', 'slug' => 'kopi-hitam', 'price' => 18000, 'is_available' => true, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 11, 'category_id' => 2, 'name' => 'Smoothies', 'slug' => 'smoothies', 'price' => 30000, 'is_available' => true, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 12, 'category_id' => 2, 'name' => 'Air Mineral', 'slug' => 'air-mineral', 'price' => 10000, 'is_available' => true, 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
                
                // Dessert items (13-15)
                ['id' => 13, 'category_id' => 3, 'name' => 'Es Krim', 'slug' => 'es-krim', 'price' => 25000, 'is_available' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 14, 'category_id' => 3, 'name' => 'Pudding Coklat', 'slug' => 'pudding-coklat', 'price' => 20000, 'is_available' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 15, 'category_id' => 3, 'name' => 'Pisang Goreng', 'slug' => 'pisang-goreng', 'price' => 25000, 'is_available' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ];
            DB::table('menu_items')->insert($menuItems);
        }
    }

    /**
     * Fix invalid menu item data
     */
    private function fixInvalidMenuItemData(): void
    {
        // Get existing reservation_menu_items with invalid menu_item_id
        $validMenuItemIds = collect(range(1, 15));
        
        $invalidMenuItems = DB::table('reservation_menu_items')
            ->whereNotIn('menu_item_id', $validMenuItemIds)
            ->get();

        foreach ($invalidMenuItems as $menuItem) {
            // Set default menu_item_id to 1 (Nasi Goreng Spesial)
            DB::table('reservation_menu_items')
                ->where('id', $menuItem->id)
                ->update(['menu_item_id' => 1]);
        }
    }
};