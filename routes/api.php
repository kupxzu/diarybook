<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DiaryController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ExploreController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [UserController::class, 'profile']);
    
    // Profile management routes
    Route::get('/user/profile', [UserProfileController::class, 'getProfile']);
    Route::put('/user/profile', [UserProfileController::class, 'updateProfile']);
    
    // Settings routes
    Route::put('/user/change-password', [SettingsController::class, 'changePassword']);
    Route::post('/user/deactivate', [SettingsController::class, 'deactivateAccount']);
    Route::delete('/user/delete', [SettingsController::class, 'deleteAccount']);
    Route::get('/user/activity-history', [SettingsController::class, 'getActivityHistory']);
    
    // User management routes
    Route::apiResource('users', UserController::class);

    // Diary routes
    Route::get('/diaries', [DiaryController::class, 'index']);
    Route::get('/diaries/public', [DiaryController::class, 'publicDiaries']);
    Route::get('/diaries/user/{userId}', [DiaryController::class, 'userDiaries']);
    Route::post('/diaries', [DiaryController::class, 'store']);
    Route::put('/diaries/{id}', [DiaryController::class, 'update']);
    Route::delete('/diaries/{id}', [DiaryController::class, 'destroy']);
    
    // Like and Comment routes
    Route::post('/diaries/{id}/like', [DiaryController::class, 'toggleLike']);
    Route::post('/diaries/{id}/comment', [DiaryController::class, 'addComment']);
    Route::delete('/comments/{id}', [DiaryController::class, 'deleteComment']);
    
    // Explore routes
    Route::get('/explore/search', [ExploreController::class, 'searchUsers']);
    Route::get('/explore/user/{userId}/public-diaries', [ExploreController::class, 'getUserPublicDiaries']);
    Route::get('/explore/trending', [ExploreController::class, 'getTrendingDiaries']);
});
