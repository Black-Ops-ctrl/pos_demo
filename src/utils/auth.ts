// src/utils/auth.ts

export const getCurrentUser = () => {
  try {
    const userString = sessionStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error("Error parsing user from sessionStorage", e);
    return null;
  }
};

export const getUserId = () => {
  const user = getCurrentUser();
  return user?.user_id || null;
};
