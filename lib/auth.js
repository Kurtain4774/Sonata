import SpotifyProvider from "next-auth/providers/spotify";
import { connectDB } from "./mongodb";
import { encrypt, decrypt } from "./crypto";
import { requestSpotifyTokenRefresh } from "./spotifyAuth";
import User from "@/models/User";

const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-top-read",
  "user-library-read",
  "playlist-read-private",
  "user-read-recently-played",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-playback-state",
  "ugc-image-upload",
  "streaming",
].join(" ");

async function refreshSpotifyToken(token) {
  // First try with the JWT's in-memory refresh token. If Spotify has rotated
  // it (e.g. because /lib/spotifyAuth rotated it on a 401 mid-request), fall
  // back to the DB's stored refresh token before declaring the session dead.
  let data;
  try {
    data = await requestSpotifyTokenRefresh(token.refreshToken);
  } catch (err) {
    console.warn("JWT-side Spotify refresh failed, trying DB fallback", err?.message);
    try {
      await connectDB();
      const user = await User.findOne({ spotifyId: token.spotifyId });
      const stored = user?.refreshToken ? decrypt(user.refreshToken) : null;
      if (!stored || stored === token.refreshToken) throw err;
      data = await requestSpotifyTokenRefresh(stored);
    } catch (fallbackErr) {
      console.error("Spotify token refresh failed", fallbackErr);
      return { ...token, error: "RefreshAccessTokenError" };
    }
  }
  const newRefresh = data.refresh_token ?? token.refreshToken;
  try {
    await connectDB();
    await User.updateOne(
      { spotifyId: token.spotifyId },
      {
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(newRefresh),
        tokenExpiry: new Date(Date.now() + data.expires_in * 1000),
      }
    );
  } catch (err) {
    console.warn("Persist refreshed token failed", err?.message);
  }
  return {
    ...token,
    accessToken: data.access_token,
    accessTokenExpires: Date.now() + data.expires_in * 1000,
    refreshToken: newRefresh,
  };
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: { scope: SPOTIFY_SCOPES },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { spotifyId: profile.id },
          {
            spotifyId: profile.id,
            displayName: profile.display_name || user.name,
            email: profile.email || user.email,
            profileImage: profile.images?.[0]?.url || user.image,
            accessToken: encrypt(account.access_token),
            refreshToken: encrypt(account.refresh_token),
            tokenExpiry: new Date(account.expires_at * 1000),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.error("User upsert failed", err);
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          spotifyId: profile.id,
        };
      }
      if (Date.now() < (token.accessTokenExpires ?? 0)) return token;
      return refreshSpotifyToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.spotifyId = token.spotifyId;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
