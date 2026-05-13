import SpotifyProvider from "next-auth/providers/spotify";
import { connectDB } from "./mongodb";
import { encrypt } from "./crypto";
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
  try {
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error("Spotify token refresh failed", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
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
