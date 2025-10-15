<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Diary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExploreController extends Controller
{
    /**
     * Search for users by name, email, or bio
     */
    public function searchUsers(Request $request)
    {
        try {
            $query = $request->get('query', '');
            
            // Add debug logging
            Log::info('Search query received: ' . $query);
            Log::info('Current user ID: ' . $request->user()->id);
            
            if (empty($query)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Please provide a search query',
                    'data' => ['users' => []]
                ]);
            }

            // Search users by name, email, or bio
            // Exclude current user from search results
            $users = User::where('id', '!=', $request->user()->id)
                ->where(function($q) use ($query) {
                    $q->where('name', 'like', '%' . $query . '%')
                      ->orWhere('email', 'like', '%' . $query . '%')
                      ->orWhere('bio', 'like', '%' . $query . '%');
                })
                ->select('id', 'name', 'email', 'bio', 'created_at')
                ->limit(20)
                ->get();

            // Manually count public diaries for each user
            foreach ($users as $user) {
                $user->public_diaries_count = Diary::where('user_id', $user->id)
                    ->where('status', 'public')
                    ->count();
            }

            return response()->json([
                'success' => true,
                'message' => 'Users found successfully',
                'data' => ['users' => $users]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public diaries for a specific user
     */
    public function getUserPublicDiaries(Request $request, $userId)
    {
        try {
            // Validate that the user exists
            $user = User::findOrFail($userId);
            
            // Get public diaries for the specified user
            $diaries = Diary::where('user_id', $userId)
                ->where('status', 'public')
                ->withCount('likes')
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get(['id', 'message', 'status', 'created_at', 'user_id']);

            return response()->json([
                'success' => true,
                'message' => 'Public diaries retrieved successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'bio' => $user->bio
                    ],
                    'diaries' => $diaries
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve public diaries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get trending public diaries (optional feature)
     */
    public function getTrendingDiaries(Request $request)
    {
        try {
            $diaries = Diary::where('status', 'public')
                ->with(['user:id,name,email'])
                ->withCount('likes')
                ->orderBy('likes_count', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Trending diaries retrieved successfully',
                'data' => ['diaries' => $diaries]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve trending diaries',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
