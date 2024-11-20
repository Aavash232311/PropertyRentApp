class Services {
    async getUser() {
        const data = await fetch("/api/get-current-client", {
            method: "get",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });
        const resonse = data.json();
        return resonse;
    }
    async getUserRoles() {
        const data = await fetch("/api/getRls", {
          method: "get",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
        return data.json();
    }
    getToken() {
        return localStorage.getItem("authToken");
    }
    getRefreshToken() {
        return localStorage.getItem("refreshToken");
    }
    async refreshToken() {
        const refreshUrl = "/refresh";

        try {
            const response = await fetch(refreshUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.getToken()}`,
                },
                body: JSON.stringify({
                    refreshToken: this.getRefreshToken(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }

            return await response.json();
        } catch (error) {
            console.error("Error refreshing token: ", error);
            throw error;
        }
    }
    getDomain() {
        return "https://localhost:5173/" // i'll replace if i ever made it to production
    }
    imageUrl(path: any) {
        return new URL(path, this.getDomain()).href;
    }
    formatDate(dateString: string) {
        const date = new Date(dateString);
        const options: any =
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return date.toLocaleDateString(undefined, options);
    }
    normalizeImageUrl = (imageUrl: string) => {
        let normalizedUrl = imageUrl.replace(/\\/g, '/');
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = normalizedUrl
        }

        return normalizedUrl;
    }
    minimalText = (text: string, len: number) => {
        return text.length >= len ? text.substring(0, len) + "...." : text;
    }
    dotNetCommonErrorNormalise = (errors:any) => {
        const err = [];
        for (let i in errors) {
            const errorList = errors[i];
            // one field can have multiple erros so
            for (let j in errorList) {
                err.push({
                    description: errorList[j]
                });
            }
        }
        return err;
    }
}
export default Services;