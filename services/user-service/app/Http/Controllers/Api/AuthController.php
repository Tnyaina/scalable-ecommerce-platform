<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Étape 1 : La Validation
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Étape 2 : Création
        // C'est ici que nous allons utiliser Eloquent !
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        // Étape 3 : Génération du token
        $token = $user->createToken('auth_token')->plainTextToken;

        // On retourne une réponse JSON
        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        // 1. Validation des champs
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Recherche de l'utilisateur
        $user = User::where('email', $request->email)->first();

        // 3. Vérification de l'existence et du mot de passe
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects'
            ], 401);
        }

        // 4. Génération du Token (on peut choisir de ne pas supprimer les anciens ici)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Réponse au format standard
        return response()->json([
            'message' => 'Utilisateur connecté avec succès',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    public function logout(Request $request)
    {
        // On récupère l'utilisateur et on supprime le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ], 200);
    }

    public function getUser(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ], 200);
    }
}
