<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use App\Models\User;

class UserProfileController extends Controller
{
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user can edit (3-day cooldown)
            if ($user->last_profile_update) {
                $lastUpdate = Carbon::parse($user->last_profile_update);
                $daysSinceLastUpdate = $lastUpdate->diffInDays(Carbon::now());
                
                if ($daysSinceLastUpdate < 3) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only update your profile once every 3 days',
                        'days_remaining' => 3 - $daysSinceLastUpdate
                    ], 429);
                }
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id)
                ],
                'bio' => 'nullable|string|max:500',
            ]);

            // Update user profile
            User::where('id', $user->id)->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'bio' => $validated['bio'] ?? null,
                'last_profile_update' => Carbon::now(),
            ]);
            
            // Refresh user data
            $user = User::find($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'bio' => $user->bio,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating profile: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProfile()
    {
        try {
            $user = Auth::user();
            
            // Check cooldown status
            $canEdit = true;
            $daysRemaining = 0;
            
            if ($user->last_profile_update) {
                $lastUpdate = Carbon::parse($user->last_profile_update);
                $daysSinceLastUpdate = $lastUpdate->diffInDays(Carbon::now());
                
                if ($daysSinceLastUpdate < 3) {
                    $canEdit = false;
                    $daysRemaining = 3 - $daysSinceLastUpdate;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'bio' => $user->bio,
                    'role' => $user->role,
                    'can_edit' => $canEdit,
                    'days_remaining' => $daysRemaining,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching profile: ' . $e->getMessage()
            ], 500);
        }
    }
}
