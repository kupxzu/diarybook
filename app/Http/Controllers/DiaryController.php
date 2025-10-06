<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Diary;
use App\Models\DiaryLike;
use App\Models\DiaryComment;

class DiaryController extends Controller
{
    // List all diaries for the authenticated client
    public function index()
    {
        $user = Auth::user();
        $diaries = Diary::where('user_id', $user->id)
            ->with(['user', 'likes', 'comments.user'])
            ->latest()
            ->get();
        
        // Add is_liked_by_user to each diary
        $diaries->each(function ($diary) use ($user) {
            $diary->is_liked_by_user = $diary->isLikedByUser($user->id);
        });
        
        return response()->json(['success' => true, 'data' => $diaries]);
    }

    // Get all public diaries (Facebook-style feed)
    public function publicDiaries()
    {
        $user = Auth::user();
        $diaries = Diary::where('status', 'public')
            ->with(['user', 'likes', 'comments.user'])
            ->latest()
            ->get();
        
        // Add is_liked_by_user to each diary
        $diaries->each(function ($diary) use ($user) {
            $diary->is_liked_by_user = $diary->isLikedByUser($user->id);
        });
        
        return response()->json(['success' => true, 'data' => $diaries]);
    }

    // Get user's profile diaries
    public function userDiaries($userId)
    {
        $diaries = Diary::where('user_id', $userId)
            ->where('status', 'public')
            ->with(['user', 'likes', 'comments.user'])
            ->latest()
            ->get();
        return response()->json(['success' => true, 'data' => $diaries]);
    }

    // Store a new diary entry
    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'status' => 'required|in:public,private',
        ]);

        $user = Auth::user();
        $diary = Diary::create([
            'user_id' => $user->id,
            'message' => $request->message,
            'status' => $request->status,
        ]);

        $diary->load(['user', 'likes', 'comments.user']);

        return response()->json(['success' => true, 'data' => $diary]);
    }

    // Update an existing diary entry
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $diary = Diary::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'message' => 'sometimes|required|string|max:1000',
            'status' => 'sometimes|required|in:public,private',
        ]);

        if ($request->has('message')) {
            $diary->message = $request->message;
        }
        if ($request->has('status')) {
            $diary->status = $request->status;
        }
        $diary->save();

        $diary->load(['user', 'likes', 'comments.user']);

        return response()->json(['success' => true, 'data' => $diary]);
    }

    // Delete a diary entry
    public function destroy($id)
    {
        $user = Auth::user();
        $diary = Diary::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $diary->delete();
        return response()->json(['success' => true, 'message' => 'Diary deleted']);
    }

    // Toggle like on a diary
    public function toggleLike($id)
    {
        $user = Auth::user();
        $diary = Diary::findOrFail($id);

        // Check if diary is public or belongs to user
        if ($diary->status !== 'public' && $diary->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $like = DiaryLike::where('diary_id', $id)->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $message = 'Like removed';
            $isLiked = false;
        } else {
            DiaryLike::create([
                'diary_id' => $id,
                'user_id' => $user->id,
            ]);
            $message = 'Diary liked';
            $isLiked = true;
        }

        // FORCE reload ALL relationships from database
        $diary->unsetRelation('likes');
        $diary->load(['user', 'likes', 'comments.user']);
        
        // Calculate is_liked_by_user with the authenticated user ID
        $actuallyLiked = $diary->isLikedByUser($user->id);
        $actualLikesCount = $diary->likes->count();
        
        // Add to diary object for response
        $diary->is_liked_by_user = $actuallyLiked;

        return response()->json([
            'success' => true,
            'message' => $message,
            'is_liked' => $actuallyLiked, // Use the ACTUAL value
            'likes_count' => $actualLikesCount,
            'data' => $diary
        ]);
    }

    // Add comment to a diary
    public function addComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string|max:500',
        ]);

        $user = Auth::user();
        $diary = Diary::findOrFail($id);

        // Check if diary is public or belongs to user
        if ($diary->status !== 'public' && $diary->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $comment = DiaryComment::create([
            'diary_id' => $id,
            'user_id' => $user->id,
            'comment' => $request->comment,
        ]);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Comment added',
            'data' => $comment
        ]);
    }

    // Delete comment
    public function deleteComment($id)
    {
        $user = Auth::user();
        $comment = DiaryComment::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $comment->delete();

        return response()->json(['success' => true, 'message' => 'Comment deleted']);
    }
}
