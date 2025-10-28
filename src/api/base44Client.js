export const base44 = {
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
  appId: import.meta.env.VITE_BASE44_APP_ID,

  // --- mock fallback for local testing ---
  async safeRequest(endpoint, method = "GET", body = null) {
    try {
      const url = `http://localhost:3001/base44/${endpoint}`;
      const options = {
        method,
        headers: {
          
          "Content-Type": "application/json",
        },
      };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Base44 fetch failed");
      return res.json();
    } catch {
      console.warn("⚠️ Base44 offline → using mock data");
      return null;
    }
  },

  auth: {
    async me() {
      const data = await base44.safeRequest("auth/me");
      if (data && data.email) return data;
      // fallback mock user
      return {
        email: "demo@biggrade.com",
        full_name: "Demo Student",
        user_type: "student",
        role: "user",
        theme: "cyberpunk",
        is_setup_complete: true,
        avatar_url: "",
      };
    },
    async updateMe() {
      return { success: true };
    },
    async logout() {
      console.log("Mock logout");
      window.location.reload();
    },
  },

  entities: {
    Megathread: {
      async filter() {
        const data = await base44.safeRequest("entities/Megathread");
        return data || [
          { id: 1, title: "Welcome!", content: "This is your first megathread.", author_type: "student", subject: "general" },
        ];
      },
      async create(thread) {
        console.log("Mock create megathread:", thread);
        return { success: true };
      },
    },
  },
};
