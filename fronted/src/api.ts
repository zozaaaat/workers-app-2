// ملف واحد لتعريف متغير عنوان الباك اند
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
console.info("API_URL:", API_URL);
