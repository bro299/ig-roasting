"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface ProfileData {
  biography: string;
  followers: number;
  following: number;
  profile_pic: string;
  roast?: string;
  advice?: string;
}

interface AIResponse {
  roast: string;
  advice: string;
}

export function InstagramRoastGenerator() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileData | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateUsername = (value: string) => {
    const isValid = /^[a-zA-Z0-9._]{1,30}$/.test(value);
    if (!isValid && value) {
      setUsernameError("Username tidak valid");
    } else {
      setUsernameError(null);
    }
    return isValid;
  };

  const getAIResponse = async (profileData: ProfileData): Promise<AIResponse> => {
    const payload = {
      messages: [
        {
          role: "system",
          content: `Lu adalah Zaileys AI, AI paling frontal dan suka nge-roast orang dengan bahasa yang tajam tapi membangun. Gaya bahasa lu santai dan gaul banget. Lu bakal kasih roast yang bikin orang sadar diri dan introspeksi, tapi tetep ada sisi lucunya. Berikan response dalam format JSON dengan struktur: {"roast": "...", "advice": "..."}`
        },
        {
          role: "user",
          content: `Nih ada profil yang perlu di-roast:

Bio: ${profileData.biography || "Ga ada bio"}
Followers: ${profileData.followers}
Following: ${profileData.following}

Kasih roast yang pedes ya!`
        }
      ],
      config: {
        temperature: 0.9,
        presence_penalty: 0.8,
        frequency_penalty: 0.6,
        max_tokens: 500,
        stream: false
      }
    };

    const response = await fetch("https://api.zpi.my.id/v1/ai/gpt-4o", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Gagal dapet respons dari AI");
    }

    const aiResponse = await response.json();
    
    try {
      const content = aiResponse.data.choices.content;
      const jsonStr = content.replace(/```json\n|\n```/g, "").trim();
      const parsedResponse = JSON.parse(jsonStr);
      
      if (!parsedResponse.roast || !parsedResponse.advice) {
        throw new Error("Response tidak lengkap");
      }
      
      return parsedResponse;
    } catch (error) {
      console.error("Parsing error:", error);
      throw new Error("Format response AI tidak valid");
    }
  };

  const processInstagramProfile = async (username: string): Promise<ProfileData> => {
    const API_KEY = "993ab40c2amsh136f14238356664p17aff0jsn298b79b1931f";

    try {
      const instagramResponse = await axios.get(
        "https://instagram-scraper-api2.p.rapidapi.com/v1/info",
        {
          params: { username_or_id_or_url: username },
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "instagram-scraper-api2.p.rapidapi.com"
          }
        }
      );

      const profileData = instagramResponse.data.data;
      
      const extractedData = {
        biography: profileData.biography,
        followers: profileData.follower_count,
        following: profileData.following_count,
        profile_pic: profileData.hd_profile_pic_url_info?.url || profileData.profile_pic_url
      };
      
      const aiResponse = await getAIResponse(extractedData);
      
      return {
        ...extractedData,
        roast: aiResponse.roast,
        advice: aiResponse.advice
      };
    } catch (error: any) {
      console.error("Error:", error);
      throw new Error(error.response?.data?.message || error.message || "Terjadi kesalahan saat memproses profil");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateUsername(username)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await processInstagramProfile(username);
      setResult(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="relative">
          <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 transition">
            <span className="pl-3 sm:pl-4 text-gray-400">@</span>
            <input 
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                validateUsername(e.target.value);
              }}
              className="w-full px-2 py-2.5 sm:py-3 bg-transparent focus:outline-none text-white placeholder-gray-400 text-sm sm:text-base"
              placeholder="Username Instagram"
              pattern="^[a-zA-Z0-9._]{1,30}$"
              title="Username Instagram hanya boleh mengandung huruf, angka, titik, dan underscore"
              required
            />
          </div>
          {usernameError && (
            <p className="text-red-400 text-xs sm:text-sm mt-1">{usernameError}</p>
          )}
        </div>
        
        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !!usernameError}
        >
          Generate Roast 🔥
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 sm:mt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-400" />
          </div>
          <p className="text-center mt-2 sm:mt-3 text-gray-400 text-sm">Bentar ya, lagi stalking profil...</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          {/* Profile Info Card */}
          <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <h3 className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2 sm:mb-3">
              Info Profil:
            </h3>
            <div className="flex items-start space-x-3 sm:space-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.profile_pic} alt="Profile Picture" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full" />
              <div className="flex-1 text-sm sm:text-base">
                <div className="font-medium">Bio:</div>
                <p className="mb-2">{result.biography || "Tidak ada bio"}</p>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <span className="font-medium">Followers:</span> {result.followers.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Following:</span> {result.following.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Roast Card */}
          <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <h3 className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2 sm:mb-3">
              Roast-nya nih:
            </h3>
            <p className="text-sm sm:text-base text-gray-300">{result.roast}</p>
          </div>

          {/* Advice Card */}
          <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <h3 className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2 sm:mb-3">
              Saran dari Gue:
            </h3>
            <p className="text-sm sm:text-base text-gray-300">{result.advice}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 sm:mt-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-red-700/50 text-red-300 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        </div>
      )}
    </>
  );
}