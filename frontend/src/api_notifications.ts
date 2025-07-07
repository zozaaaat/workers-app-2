import axios from "axios";
import { API_URL } from "./api";

export interface Notification {
  id: number;
  message: string;
  created_at: string;
  read: boolean;
  type?: string;
  expires_at?: string;
  archived?: boolean;
  allowed_roles?: string;
  action_required?: string;
  action_status?: string;
  icon?: string;
  color?: string;
  emoji?: string;
  attachment?: string;
}

export type NotificationType = Notification;

export async function fetchNotifications() {
  const res = await axios.get(`${API_URL}/notifications`);
  return res.data as Notification[];
}

export async function addNotification(message: string, type = "general", allowed_roles?: string, icon?: string, color?: string, emoji?: string) {
  return axios.post(`${API_URL}/notifications`, { message, type, allowed_roles, icon, color, emoji });
}

export async function deleteNotification(id: number) {
  return axios.delete(`${API_URL}/notifications/${id}`);
}

export async function fetchGroupedNotifications(days = 7) {
  const res = await axios.get(`${API_URL}/notifications/grouped?days=${days}`);
  return res.data;
}

export async function archiveNotification(id: number) {
  return axios.post(`${API_URL}/notifications/${id}/archive`);
}

export async function fetchNotificationsFiltered({ archived, start_date, end_date, user_role }: { archived?: boolean, start_date?: string, end_date?: string, user_role?: string }) {
  const params: any = {};
  if (archived !== undefined) params.archived = archived;
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  if (user_role) params.user_role = user_role;
  const res = await axios.get(`${API_URL}/notifications`, { params });
  return res.data as Notification[];
}

export async function updateNotificationAction(id: number, action_status: string) {
  return axios.post(`${API_URL}/notifications/${id}/action`, null, { params: { action_status } });
}
