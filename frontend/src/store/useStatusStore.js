import { create } from "zustand";
import { getSocket, initializeSocket } from "../services/chat.service";
import axiosInstance from "../services/url.service";

const useStatusStore = create((set, get) => ({
  //status
  statuses: [],
  loading: false,
  error: null,

  //Active
  setStatuses: (statuses) => set({ statuses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  //Initialize the socket listeners
  initializeSocket: () => {
    const socket = getSocket();
    if (!socket) {
      return;
    }

    // Real time status events
    socket.on("new_status", (newStatus) => {
      set((state) => ({
        statuses: state.statuses.some((s) => s._id === newStatus._id)
          ? state.statuses
          : [newStatus, ...state.statuses],
      }));
    }); // Changed comma to semicolon

    socket.on("status_deleted", (statusId) => {
      set((state) => ({
        statuses: state.statuses.filter((s) => s._id !== statusId),
      }));
    }); // Changed comma to semicolon

    socket.on("status_viewed", (statusId, viewers) => {
      set((state) => ({
        statuses: state.statuses.map((status) =>
          status._id === statusId ? { ...status, viewers } : status
        ),
      }));
    }); // Changed comma to semicolon
  },
  cleanupSocket: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("new_status");
      socket.off("status_viewed");
      socket.off("status_deleted");
    }
  },
  //fetch status
  fetchStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/update");
      console.log("Data of status", data);
      set({ statuses: data.data || [], loading: false });
    } catch (error) {
      console.error("Error fetching status", error);
      set({ error: error.message, loading: false });
    }
  },
  //create status
  createStatus: async (statusData) => {
    try {
      const formData = new FormData();
      if (statusData.file) {
        formData.append("media", statusData.file);
      }
      if (statusData.content?.trim()) {
        formData.append("content", statusData.content);
      }
      const { data } = await axiosInstance.post("/update", formData, {
        headers: { Content_Type: "multipart/form-data" },
      });
      if (data.data) {
        set((state) => ({
          statuses: state.statuses.some((s) => s._id === data.data?._id)
            ? state.statuses
            : [data.data, ...state.statuses],
        }));
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching status", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  //view status
  viewStatus: async (updateId) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`update/${updateId}/view`);
      set((state) => ({
        statuses: state.statuses.map((status) =>
          status._id === updateId ? { ...status } : status
        ),
      }));
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteStatus: async (updateId) => {
    try {
      await axiosInstance.delete(`/update/${updateId}`);
      set((state) => ({
        statuses: state.statuses.filter((s) => s._id !== updateId),
      }));
      set({ loading: false });
    } catch (error) {
      console.error("Error deleting status", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getStatusViewers: async (updateId) => {
    try {
      set({ loading: true, error: null });
      const { data } = await axiosInstance.get(`/update/${updateId}/viewers`);
      set({ loading: false });
      return data.data;
    } catch (error) {
      console.error("Error getting status viewers", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getGroupedStatus: () => {
    const { statuses } = get();
    return statuses.reduce((acc, status) => {
      const statusUserId = status.user?._id;
      if (!acc[statusUserId]) {
        acc[statusUserId] = {
          id: statusUserId,
          name: status?.user?.username,
          avatar: status?.user?.profilePicture,
          statuses: [],
        };
      }
      acc[statusUserId].statuses.push({
        id: status._id,
        media: status.content,
        contentType: status.contentType,
        timeStamp: status.createdAt,
        viewers: status.viewers,
      });
      return acc;
    }, {});
  },

  getUserStatuses: (userId) => {
    const groupedStatus = get().getGroupedStatus();
    return userId ? groupedStatus[userId] : null;
  },

  getOtherStatuses: (userId) => {
    const groupedStatus = get().getGroupedStatus();
    return Object.values(groupedStatus).filter(
      (contact) => contact.id !== userId
    );
  },

  clearError: () => set({ error: null }),

  reset: () => set({ statuses: [], loading: false, error: null }),
}));

export default useStatusStore;
