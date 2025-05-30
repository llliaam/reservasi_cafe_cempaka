<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\FavoriteMenu;

class FavoriteMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada users dan menu items
        $users = User::all();
        $menuItems = MenuItem::all();

        if ($users->count() === 0 || $menuItems->count() === 0) {
            $this->command->warn('No users or menu items found. Please seed users and menu items first.');
            return;
        }

        // Sample favorite combinations
        $favoriteData = [
            // User 1 favorites
            [
                'user_email' => 'john@example.com',
                'menu_names' => ['Nasi Goreng Spesial', 'Es Teh Manis', 'Ayam Bakar', 'Soto Ayam']
            ],
            [
                'user_email' => 'jane@example.com', 
                'menu_names' => ['Gado-Gado', 'Jus Alpukat', 'Rendang', 'Es Cendol']
            ],
            [
                'user_email' => 'admin@example.com',
                'menu_names' => ['Mie Ayam', 'Kopi Hitam', 'Bakso', 'Es Campur']
            ]
        ];

        foreach ($favoriteData as $data) {
            $user = $users->where('email', $data['user_email'])->first();
            
            if ($user) {
                foreach ($data['menu_names'] as $menuName) {
                    $menuItem = $menuItems->where('name', 'like', "%{$menuName}%")->first();
                    
                    if ($menuItem) {
                        FavoriteMenu::updateOrCreate([
                            'user_id' => $user->id,
                            'menu_item_id' => $menuItem->id
                        ]);
                        
                        $this->command->info("Added {$menuName} to {$user->name}'s favorites");
                    }
                }
            }
        }

        // Random favorites untuk users lainnya
        $remainingUsers = $users->whereNotIn('email', ['john@example.com', 'jane@example.com', 'admin@example.com']);
        
        foreach ($remainingUsers as $user) {
            // Randomly select 2-5 menu items for each user
            $randomMenus = $menuItems->random(rand(2, 5));
            
            foreach ($randomMenus as $menu) {
                FavoriteMenu::updateOrCreate([
                    'user_id' => $user->id,
                    'menu_item_id' => $menu->id
                ]);
            }
            
            $this->command->info("Added random favorites for {$user->name}");
        }

        $this->command->info('Favorite menus seeded successfully!');
    }
}