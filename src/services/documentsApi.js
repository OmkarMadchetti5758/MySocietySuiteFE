import api from "./apiClient";

const documentsApi = {
    uploadDocument: async (formData) => {
        return api.post("/documents", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    getDocuments: async (params) => {
        return api.get("/documents", { params });
    },
    replaceDocument: async (id, formData) => {
        return api.put(`/documents/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    deleteDocument: async (id) => {
        return api.delete(`/documents/${id}`);
    }
};

export default documentsApi;
