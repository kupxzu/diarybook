<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Diary;
use Carbon\Carbon;

class SettingsController extends Controller
{
    public function changePassword(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validated = $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:8|confirmed',
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            // Update password
            User::where('id', $user->id)->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error changing password: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deactivateAccount()
    {
        try {
            $user = Auth::user();
            
            // Soft delete or deactivate user
            User::where('id', $user->id)->update([
                'email_verified_at' => null, // Mark as deactivated
                'updated_at' => Carbon::now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account deactivated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deactivating account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteAccount()
    {
        try {
            $user = Auth::user();
            
            // Delete user's diaries first
            Diary::where('user_id', $user->id)->delete();
            
            // Delete user account
            User::where('id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getActivityHistory()
    {
        try {
            $user = Auth::user();
            
            $activities = [];
            
            // Get user's diaries with activity
            $diaries = Diary::where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->limit(20)
                ->get();

            foreach ($diaries as $diary) {
                $activities[] = [
                    'id' => 'post_' . $diary->id,
                    'type' => 'post',
                    'action' => $diary->created_at == $diary->updated_at ? 'Created new post' : 'Updated post',
                    'date' => $diary->updated_at->format('Y-m-d H:i'),
                    'details' => 'Post: "' . substr($diary->message, 0, 50) . '..."'
                ];
            }

            // Add profile updates (from last_profile_update if exists)
            if ($user->last_profile_update) {
                $activities[] = [
                    'id' => 'profile_' . $user->id,
                    'type' => 'profile',
                    'action' => 'Updated profile',
                    'date' => Carbon::parse($user->last_profile_update)->format('Y-m-d H:i'),
                    'details' => 'Changed profile information'
                ];
            }

            // Sort by date
            usort($activities, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });

            return response()->json([
                'success' => true,
                'data' => array_slice($activities, 0, 10) // Limit to 10 recent activities
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching activity history: ' . $e->getMessage()
            ], 500);
        }
    }
}
