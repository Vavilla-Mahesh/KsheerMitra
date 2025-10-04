import { findUserById, updateUser } from '../models/userModel.js';

export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const updatedUser = await updateUser(userId, updates);
  return updatedUser;
};
