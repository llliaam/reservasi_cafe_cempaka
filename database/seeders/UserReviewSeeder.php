<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserReview;
use App\Models\User;
use App\Models\Order;
use App\Models\MenuItem;

class UserReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample reviews data
        $reviewsData = [
            [
                'rating' => 5,
                'comment' => 'Sangat enak! Porsi besar dan bumbu meresap sempurna. Pelayanan juga ramah dan cepat.',
                'admin_response' => 'Terima kasih atas ulasan positifnya! Kami senang Anda menyukai makanan kami.',
                'helpful_count' => 12,
                'is_verified' => true,
                'is_featured' => true,
            ],
            [
                'rating' => 4,
                'comment' => 'Rasa mie ayamnya enak, baksonya juga kenyal. Cuma kuahnya agak asin menurut saya.',
                'admin_response' => null,
                'helpful_count' => 8,
                'is_verified' => true,
                'is_featured' => false,
            ],
            [
                'rating' => 5,
                'comment' => 'Gado-gado terenak yang pernah saya coba! Sayurannya segar dan bumbu kacangnya pas banget.',
                'admin_response' => 'Wah, terima kasih banyak! Kami memang selalu menggunakan sayuran segar setiap hari.',
                'helpful_count' => 15,
                'is_verified' => true,
                'is_featured' => true,
            ],
            [
                'rating' => 3,
                'comment' => 'Es campurnya biasa saja, tidak terlalu istimewa. Mungkin bisa ditambah variasi toppingnya.',
                'admin_response' => 'Terima kasih atas sarannya! Kami akan pertimbangkan untuk menambah variasi topping es campur.',
                'helpful_count' => 3,
                'is_verified' => true,
                'is_featured' => false,
            ],
            [
                'rating' => 4,
                'comment' => 'Nasi gudegnya authentic, porsi cukup mengenyangkan. Tempatnya juga nyaman untuk makan bersama keluarga.',
                'admin_response' => null,
                'helpful_count' => 6,
                'is_verified' => true,
                'is_featured' => false,
            ],
            [
                'rating' => 5,
                'comment' => 'Sate ayamnya juara! Bumbunya meresap dan dagingnya empuk. Pasti akan order lagi.',
                'admin_response' => 'Terima kasih! Kami tunggu pesanan berikutnya ya!',
                'helpful_count' => 9,
                'is_verified' => true,
                'is_featured' => true,
            ],
            [
                'rating' => 2,
                'comment' => 'Agak kecewa dengan rasa rendangnya. Kurang bumbu dan dagingnya agak alot.',
                'admin_response' => 'Mohon maaf atas ketidaknyamanannya. Kami akan evaluasi resep rendang kami. Terima kasih feedbacknya.',
                'helpful_count' => 4,
                'is_verified' => true,
                'is_featured' => false,
            ],
            [
                'rating' => 4,
                'comment' => 'Jus alpukatnya segar dan tidak terlalu manis. Cocok untuk cuaca panas.',
                'admin_response' => null,
                'helpful_count' => 5,
                'is_verified' => true,
                'is_featured' => false,
            ],
        ];

        // Get sample users, orders, and menu items
        $users = User::take(3)->get();
        $orders = Order::where('status', 'completed')->take(8)->get();
        $menuItems = MenuItem::take(8)->get();

        // Create reviews
        foreach ($reviewsData as $index => $reviewData) {
            $user = $users->get($index % $users->count());
            $order = $orders->get($index);
            $menuItem = $menuItems->get($index);

            if (!$user || !$order || !$menuItem) {
                continue;
            }

            // Check if review already exists for this order
            if (UserReview::where('order_id', $order->id)->exists()) {
                continue;
            }

            $review = UserReview::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'menu_item_id' => $menuItem->id,
                'rating' => $reviewData['rating'],
                'comment' => $reviewData['comment'],
                'helpful_count' => $reviewData['helpful_count'],
                'is_verified' => $reviewData['is_verified'],
                'is_featured' => $reviewData['is_featured'],
                'reviewed_at' => now()->subDays(rand(1, 30)),
            ]);

            // Add admin response if exists
            if ($reviewData['admin_response']) {
                $review->addAdminResponse(
                    $reviewData['admin_response'],
                    1 // Assuming admin user ID is 1
                );
            }
        }

        // Create some additional random reviews
        $this->createRandomReviews();
    }

    /**
     * Create additional random reviews for testing
     */
    private function createRandomReviews()
    {
        $users = User::all();
        $completedOrders = Order::where('status', 'completed')
            ->whereDoesntHave('review')
            ->with('orderItems')
            ->get();
        
        $comments = [
            'Makanannya enak dan porsinya pas!',
            'Pelayanan ramah, makanan cepat datang.',
            'Rasanya biasa saja, tidak istimewa.',
            'Sangat puas dengan makanan dan pelayanannya.',
            'Tempat nyaman, makanan juga enak.',
            'Harga sebanding dengan rasa dan porsi.',
            'Recommended untuk makan bersama keluarga.',
            'Perlu perbaikan dalam hal kebersihan.',
            'Menu favorit saya di sini!',
            'Akan datang lagi pasti.',
        ];

        foreach ($completedOrders->take(10) as $order) {
            if ($order->user && $order->orderItems->isNotEmpty()) {
                $mainMenuItem = $order->orderItems->first()->menu_item_id;
                
                UserReview::create([
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'menu_item_id' => $mainMenuItem,
                    'rating' => rand(3, 5),
                    'comment' => $comments[array_rand($comments)],
                    'helpful_count' => rand(0, 10),
                    'is_verified' => rand(0, 1) == 1,
                    'is_featured' => rand(0, 4) == 1, // 25% chance to be featured
                    'reviewed_at' => now()->subDays(rand(1, 60)),
                ]);
            }
        }
    }
}